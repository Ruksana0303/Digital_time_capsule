const cron = require('node-cron');
const Capsule = require('../models/Capsule');
const ScheduledMessage = require('../models/ScheduledMessage');
const User = require('../models/User');
const { sendCapsuleReminder, sendCapsuleUnlocked, sendScheduledMessage } = require('./email');

// Run every day at 9:00 AM
const startCronJobs = () => {
  // Daily reminder check: capsules unlocking in 3 days
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running daily capsule reminder check...');
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const startOfDay = new Date(threeDaysFromNow);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(threeDaysFromNow);
      endOfDay.setHours(23, 59, 59, 999);

      const capsules = await Capsule.find({
        unlockDate: { $gte: startOfDay, $lte: endOfDay },
        isLocked: true,
        reminderSent: false,
      }).populate('userId', 'name email');

      for (const capsule of capsules) {
        try {
          await sendCapsuleReminder({
            email: capsule.userId.email,
            capsuleTitle: capsule.title,
            unlockDate: capsule.unlockDate,
          });
          capsule.reminderSent = true;
          await capsule.save();
          console.log(`[CRON] Reminder sent for capsule: ${capsule.title}`);
        } catch (err) {
          console.error(`[CRON] Failed to send reminder for ${capsule._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[CRON] Reminder job error:', err.message);
    }
  });

  // Check for newly unlocked capsules every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Checking for newly unlocked capsules...');
    try {
      const now = new Date();
      const capsules = await Capsule.find({
        unlockDate: { $lte: now },
        isLocked: true,
        unlockNotificationSent: false,
      }).populate('userId', 'name email');

      for (const capsule of capsules) {
        try {
          // Mark as unlocked
          capsule.isLocked = false;
          // Set share expiry (30 days from unlock)
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          capsule.shareExpiry = expiry;
          await capsule.save();

          // Notify owner
          const shareLink = `${process.env.CLIENT_URL}/capsule/share/${capsule.shareToken}`;
          await sendCapsuleUnlocked({
            email: capsule.userId.email,
            capsuleTitle: capsule.title,
            shareLink,
          });

          // Notify recipients
          for (const recipient of capsule.recipients) {
            if (!recipient.notified) {
              try {
                await sendCapsuleUnlocked({
                  email: recipient.email,
                  capsuleTitle: capsule.title,
                  shareLink,
                });
                recipient.notified = true;
              } catch (err) {
                console.error(`[CRON] Failed to notify recipient ${recipient.email}:`, err.message);
              }
            }
          }

          capsule.unlockNotificationSent = true;
          await capsule.save();
          console.log(`[CRON] Unlock notifications sent for capsule: ${capsule.title}`);
        } catch (err) {
          console.error(`[CRON] Failed to process unlock for ${capsule._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[CRON] Unlock notification job error:', err.message);
    }
  });

  // Scheduled messages check every hour
  cron.schedule('30 * * * *', async () => {
    console.log('[CRON] Checking scheduled messages...');
    try {
      const now = new Date();
      const messages = await ScheduledMessage.find({
        deliveryDate: { $lte: now },
        delivered: false,
      }).populate('userId', 'name email');

      for (const msg of messages) {
        try {
          await sendScheduledMessage({
            to: msg.recipientEmail,
            subject: msg.subject,
            message: msg.message,
            senderName: msg.userId?.name,
          });
          msg.delivered = true;
          msg.deliveredAt = now;
          await msg.save();
          console.log(`[CRON] Scheduled message delivered to ${msg.recipientEmail}`);
        } catch (err) {
          console.error(`[CRON] Failed to deliver message ${msg._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[CRON] Scheduled message job error:', err.message);
    }
  });

  console.log('[CRON] All cron jobs started.');
};

module.exports = { startCronJobs };
