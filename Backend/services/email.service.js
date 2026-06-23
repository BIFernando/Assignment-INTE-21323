const nodemailer = require('nodemailer');
 
    // Set up the email transporter using Mailtrap credentials
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure:false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
 
    // Function to send welcome email to a new user
    const sendWelcomeEmail = async (toEmail, name, tempPassword) => {
      await transporter.sendMail({
        from: '"TMS System" <no-reply@tms.com>',
        to: toEmail,
        subject: 'Your TMS Account Has Been Created',
        html: `
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been created on the Task Management System.</p>
          <p><strong>Email:</strong> ${toEmail}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p>You will be asked to set a new password on your first login.</p>
        `,
      });
    };

    const sendPasswordResetEmail = async (toEmail, name, token) => {
    // Update this URL to your actual frontend URL when deployed
    const resetUrl = 'http://127.0.0.1:5500/pages/reset-password.html?token=' + token;
 
    await transporter.sendMail({
      from: '"TMS System" <no-reply@tms.com>',
      to: toEmail,
      subject: 'Reset Your TMS Password',
      html: `
        <h2>Hello, ${name}!</h2>
        <p>You requested a password reset for your TMS account.</p>
        <p>Click the button below to reset your password.
           This link expires in 1 hour.</p>
        <a href="${resetUrl}"
           style="display:inline-block; padding:12px 24px;
                  background:#4F46E5; color:white;
                  border-radius:6px; text-decoration:none;
                  font-weight:600;">
          Reset Password
        </a>
        <p style="margin-top:16px; color:#888; font-size:13px;">
          If you did not request this, ignore this email.
        </p>
      `,
    });
  };
 
 
    module.exports = { sendWelcomeEmail, sendPasswordResetEmail };