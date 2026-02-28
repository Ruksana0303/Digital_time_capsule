const mongoose = require('mongoose');
const crypto = require('crypto');

const capsuleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  message: {
    type: String,
    maxlength: [10000, 'Message cannot exceed 10000 characters'],
  },
  media: [
    {
      url: String,
      publicId: String,
      type: { type: String, enum: ['image', 'video'] },
      originalName: String,
    },
  ],
  unlockDate: {
    type: Date,
    required: [true, 'Unlock date is required'],
  },
  isLocked: {
    type: Boolean,
    default: true,
  },
  recipients: [
    {
      email: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      },
      notified: { type: Boolean, default: false },
    },
  ],
  shareToken: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex'),
  },
  shareExpiry: {
    type: Date,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  unlockNotificationSent: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Virtual: check if currently unlocked
capsuleSchema.virtual('isUnlocked').get(function () {
  return new Date() >= new Date(this.unlockDate);
});

capsuleSchema.set('toJSON', { virtuals: true });
capsuleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Capsule', capsuleSchema);
