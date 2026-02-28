const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientEmail: {
    type: String,
    required: [true, 'Recipient email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: [200, 'Subject cannot exceed 200 characters'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [10000, 'Message cannot exceed 10000 characters'],
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required'],
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema);
