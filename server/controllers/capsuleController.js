const crypto = require('crypto');
const Capsule = require('../models/Capsule');
const { cloudinary } = require('../config/cloudinary');

// POST /api/capsules
const createCapsule = async (req, res) => {
  try {
    const { title, description, message, unlockDate, recipients } = req.body;
    if (!title || !unlockDate) {
      return res.status(400).json({ success: false, message: 'Title and unlock date are required.' });
    }
    if (new Date(unlockDate) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Unlock date must be in the future.' });
    }

    // Parse recipients
    let parsedRecipients = [];
    if (recipients) {
      const emails = typeof recipients === 'string' ? JSON.parse(recipients) : recipients;
      parsedRecipients = emails.map((email) => ({ email, notified: false }));
    }

    // Handle media uploads
    const media = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        media.push({
          url: file.path,
          publicId: file.filename,
          type: file.mimetype.startsWith('video/') ? 'video' : 'image',
          originalName: file.originalname,
        });
      }
    }

    // Set shareExpiry 30 days after unlockDate
    const shareExpiry = new Date(unlockDate);
    shareExpiry.setDate(shareExpiry.getDate() + 30);

    const capsule = await Capsule.create({
      userId: req.user._id,
      title,
      description,
      message,
      unlockDate: new Date(unlockDate),
      media,
      recipients: parsedRecipients,
      isLocked: true,
      shareExpiry,
    });

    res.status(201).json({ success: true, message: 'Capsule created successfully.', capsule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/capsules
const getCapsules = async (req, res) => {
  try {
    const capsules = await Capsule.find({ userId: req.user._id }).sort({ createdAt: -1 });
    // Auto-unlock if date has passed
    const now = new Date();
    const updated = [];
    for (const capsule of capsules) {
      if (capsule.isLocked && new Date(capsule.unlockDate) <= now) {
        capsule.isLocked = false;
        await capsule.save();
      }
      updated.push(capsule);
    }
    res.json({ success: true, capsules: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/capsules/:id
const getCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findOne({ _id: req.params.id, userId: req.user._id });
    if (!capsule) {
      return res.status(404).json({ success: false, message: 'Capsule not found.' });
    }
    const now = new Date();
    if (capsule.isLocked && new Date(capsule.unlockDate) <= now) {
      capsule.isLocked = false;
      await capsule.save();
    }
    const isUnlocked = new Date(capsule.unlockDate) <= now;
    if (!isUnlocked) {
      return res.json({
        success: true,
        capsule: {
          _id: capsule._id,
          title: capsule.title,
          description: capsule.description,
          unlockDate: capsule.unlockDate,
          isLocked: true,
          createdAt: capsule.createdAt,
        },
        locked: true,
      });
    }
    res.json({ success: true, capsule, locked: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/capsules/:id
const deleteCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findOne({ _id: req.params.id, userId: req.user._id });
    if (!capsule) {
      return res.status(404).json({ success: false, message: 'Capsule not found.' });
    }
    // Delete media from Cloudinary
    for (const media of capsule.media) {
      try {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.type === 'video' ? 'video' : 'image',
        });
      } catch (err) {
        console.error('Failed to delete from Cloudinary:', err.message);
      }
    }
    await capsule.deleteOne();
    res.json({ success: true, message: 'Capsule deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/capsules/share/:token (public)
const getSharedCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findOne({ shareToken: req.params.token });
    if (!capsule) {
      return res.status(404).json({ success: false, message: 'Capsule not found or link is invalid.' });
    }
    const now = new Date();
    // Check if still locked
    if (new Date(capsule.unlockDate) > now) {
      return res.status(403).json({
        success: false,
        message: `This capsule is locked until ${new Date(capsule.unlockDate).toLocaleDateString()}.`,
        locked: true,
        unlockDate: capsule.unlockDate,
      });
    }
    // Check share expiry
    if (capsule.shareExpiry && new Date(capsule.shareExpiry) < now) {
      return res.status(410).json({ success: false, message: 'This share link has expired.' });
    }
    res.json({ success: true, capsule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/capsules/:id/regenerate-token
const regenerateShareToken = async (req, res) => {
  try {
    const capsule = await Capsule.findOne({ _id: req.params.id, userId: req.user._id });
    if (!capsule) {
      return res.status(404).json({ success: false, message: 'Capsule not found.' });
    }
    capsule.shareToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    capsule.shareExpiry = expiry;
    await capsule.save();
    res.json({ success: true, shareToken: capsule.shareToken, shareExpiry: capsule.shareExpiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCapsule, getCapsules, getCapsule, deleteCapsule, getSharedCapsule, regenerateShareToken };
