const ScheduledMessage = require('../models/ScheduledMessage');

// POST /api/scheduled-messages
const createScheduledMessage = async (req, res) => {
  try {
    const { recipientEmail, subject, message, deliveryDate } = req.body;
    if (!recipientEmail || !subject || !message || !deliveryDate) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (new Date(deliveryDate) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Delivery date must be in the future.' });
    }
    const scheduled = await ScheduledMessage.create({
      userId: req.user._id,
      recipientEmail,
      subject,
      message,
      deliveryDate: new Date(deliveryDate),
    });
    res.status(201).json({ success: true, message: 'Message scheduled successfully.', scheduled });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/scheduled-messages
const getScheduledMessages = async (req, res) => {
  try {
    const messages = await ScheduledMessage.find({ userId: req.user._id }).sort({ deliveryDate: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/scheduled-messages/:id
const deleteScheduledMessage = async (req, res) => {
  try {
    const msg = await ScheduledMessage.findOne({ _id: req.params.id, userId: req.user._id });
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    if (msg.delivered) {
      return res.status(400).json({ success: false, message: 'Cannot delete a delivered message.' });
    }
    await msg.deleteOne();
    res.json({ success: true, message: 'Scheduled message deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createScheduledMessage, getScheduledMessages, deleteScheduledMessage };
