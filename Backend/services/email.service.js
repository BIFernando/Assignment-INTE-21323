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

const emailLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow TMS</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F3F4F6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);padding:28px 32px;text-align:center;">
              <div style="font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.3px;">TaskFlow TMS</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:6px;">Task Management System</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #E5E7EB;background-color:#F9FAFB;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;text-align:center;">
                This is an automated message from TaskFlow TMS. Please do not reply to this email.<br>
                &copy; ${new Date().getFullYear()} TaskFlow TMS. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const sendWelcomeEmail = async (toEmail, name, tempPassword) => {
  const loginUrl = `${APP_URL}/pages/login.html`;
  const safeName = escape(name);
  const safeEmail = escape(toEmail);
  const safePassword = escape(tempPassword);

  const htmlContent = emailLayout(`
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#111827;">Hello <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">
      Your TaskFlow account has been created. You can sign in using the credentials below.
      For security, please change your password after your first login.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#EEF2FF;border:1px solid #C7D2FE;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#4F46E5;text-transform:uppercase;letter-spacing:0.5px;">Your login details</p>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#374151;"><strong style="color:#111827;">Email:</strong> ${safeEmail}</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;"><strong style="color:#111827;">Temporary password:</strong> <code style="background:#FFFFFF;padding:2px 8px;border-radius:4px;border:1px solid #C7D2FE;font-family:Consolas,Monaco,monospace;font-size:13px;color:#4338CA;">${safePassword}</code></p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px;">
      <tr>
        <td align="center" style="border-radius:8px;background-color:#4F46E5;">
          <a href="${loginUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">Sign in to TaskFlow</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;">
      If you did not expect this email, please contact your system administrator.
    </p>
  `);

  try {
    return await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: 'Welcome to TaskFlow – Your Account is Ready',
      text: [
        `Hello ${name},`,
        '',
        'Your TaskFlow account has been created. Please sign in using the details below:',
        '',
        `Email: ${toEmail}`,
        `Temporary password: ${tempPassword}`,
        '',
        `Sign in: ${loginUrl}`,
        '',
        'For security, please change your password after your first login.',
        '',
        'If you did not expect this email, please contact your system administrator.',
      ].join('\n'),
      html: htmlContent,
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