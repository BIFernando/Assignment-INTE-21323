const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for 587/25
  requireTLS: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify on startup (optional but recommended)
transporter.verify().then(() => console.log('Mail ready')).catch(console.error);

const FROM = process.env.MAIL_FROM || '"TaskFlow TMS" <no-reply@taskflow.com>';
const APP_URL = process.env.APP_URL || 'https://taskflowtms.sytes.net';

// Simple HTML escape to prevent breaking the template
const escape = (s = '') => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const sendWelcomeEmail = async (toEmail, name, tempPassword) => {
  try {
    return await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: 'Welcome to TaskFlow – Your Account is Ready',
      text: `Hello ${name},\nYour account: ${toEmail}\nTemp Password: ${tempPassword}\nPlease change it on first login.`,
      html: `... your HTML ... use ${escape(name)}, ${escape(toEmail)}, ${escape(tempPassword)} ...`,
    });
  } catch (err) {
    console.error('Welcome email failed:', err);
    throw err;
  }
};

const sendPasswordResetEmail = async (toEmail, name, token) => {
  const resetUrl = `${APP_URL}/pages/reset-password.html?token=${encodeURIComponent(token)}`;
  try {
    return await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: 'Reset Your TaskFlow Password – Action Required',
      text: `Hello ${name},\nReset your password here (expires in 1 hour): ${resetUrl}`,
      html: `... your HTML ... use ${escape(name)} and ${resetUrl} ...`,
    });
  } catch (err) {
    console.error('Reset email failed:', err);
    throw err;
  }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };