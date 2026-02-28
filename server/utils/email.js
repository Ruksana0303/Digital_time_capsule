const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

const sendCapsuleReminder = async ({ email, capsuleTitle, unlockDate }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px; margin: 0;">⏳ Time Capsule Reminder</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #374151; font-size: 16px;">Your time capsule <strong style="color: #6366f1">"${capsuleTitle}"</strong> is almost ready to unlock!</p>
        <p style="color: #6b7280;">It will unlock on <strong>${new Date(unlockDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> — just 3 days away.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Dashboard</a>
        </div>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">Digital Time Capsule — Preserve your moments</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `⏳ Your capsule "${capsuleTitle}" unlocks in 3 days!`, html });
};

const sendCapsuleUnlocked = async ({ email, capsuleTitle, shareLink, recipientName }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; font-size: 28px; margin: 0;">🎉 Your Time Capsule Has Unlocked!</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${recipientName ? `<p style="color: #374151;">Hi <strong>${recipientName}</strong>,</p>` : ''}
        <p style="color: #374151; font-size: 16px;">The time capsule <strong style="color: #10b981">"${capsuleTitle}"</strong> has been unlocked and is ready to view!</p>
        ${shareLink ? `
        <div style="text-align: center; margin-top: 30px;">
          <a href="${shareLink}" style="background: #10b981; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Capsule</a>
        </div>` : ''}
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">Digital Time Capsule — Preserve your moments</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `🎉 Time Capsule "${capsuleTitle}" has unlocked!`, html });
};

const sendPasswordReset = async ({ email, resetUrl }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px; margin: 0;">🔒 Password Reset Request</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #374151;">You requested a password reset. Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 20px;">If you didn't request this, ignore this email. Your password will remain unchanged.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Password Reset Request', html });
};

const sendScheduledMessage = async ({ to, subject, message, senderName }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px; margin: 0;">📬 A Message From The Past</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${senderName ? `<p style="color: #374151;">A message from <strong>${senderName}</strong>:</p>` : ''}
        <div style="border-left: 4px solid #6366f1; padding-left: 20px; margin: 20px 0;">
          <p style="color: #374151; font-size: 16px; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">Delivered via Digital Time Capsule</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

module.exports = { sendEmail, sendCapsuleReminder, sendCapsuleUnlocked, sendPasswordReset, sendScheduledMessage };
