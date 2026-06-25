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
      from: '"TaskFlow TMS" <no-reply@taskflow.com>',
      to: toEmail,
      subject: 'Welcome to TaskFlow – Your Account is Ready',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'DM Sans', Arial, sans-serif; color: #1f2937; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
                      color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .card { background: white; padding: 20px; margin: 16px 0; border-radius: 6px;
                    border-left: 4px solid #7c3aed; }
            .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-size: 16px; font-weight: 600; color: #111827; margin-top: 4px; }
            .button { display: inline-block; background: #7c3aed; color: white;
                      padding: 12px 24px; border-radius: 6px; text-decoration: none;
                      font-weight: 600; margin-top: 16px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 24px;
                      padding-top: 16px; border-top: 1px solid #e5e7eb; }
            .highlight { background: #fef3c7; padding: 12px; border-radius: 4px; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TaskFlow</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.95;">Task Management Made Simple</p>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              
              <p>Your TaskFlow account has been successfully created! 
                 You're now ready to start managing projects and tasks with your team.</p>
 
              <div class="card">
                <div class="label">Your Login Email</div>
                <div class="value">${toEmail}</div>
              </div>
 
              <div class="card">
                <div class="label">Temporary Password</div>
                <div class="value">${tempPassword}</div>
              </div>
 
              <div class="highlight">
                <strong>⚠️ Important:</strong> For security, you will be asked to create a new password 
                on your first login. Please change your temporary password immediately.
              </div>
 
              <p>Once you've set your new password, you can:</p>
              <ul style="color: #374151;">
                <li>Create and manage projects</li>
                <li>Assign tasks to team members</li>
                <li>Track progress with Kanban boards</li>
                <li>Collaborate with real-time updates</li>
              </ul>
 
              <p style="margin-top: 24px;">
                If you have any questions, please contact your administrator.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">TaskFlow TMS | INTE 21323</p>
              <p style="margin: 4px 0 0 0;">© 2026 All rights reserved</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  };
    const sendPasswordResetEmail = async (toEmail, name, token) => {
    const resetUrl = 'https://taskflowtms.sytes.net/pages/reset-password.html?token=' + token;
 
    await transporter.sendMail({
      from: '"TaskFlow TMS" <no-reply@taskflow.com>',
      to: toEmail,
      subject: 'Reset Your TaskFlow Password – Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'DM Sans', Arial, sans-serif; color: #1f2937; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                      color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning { background: #fef2f2; border-left: 4px solid #dc2626;
                       padding: 16px; margin: 16px 0; border-radius: 4px; }
            .button { display: inline-block; background: #7c3aed; color: white;
                      padding: 14px 28px; border-radius: 6px; text-decoration: none;
                      font-weight: 600; margin: 20px 0; text-align: center; }
            .button-container { text-align: center; }
            .code { background: #f3f4f6; padding: 12px; border-radius: 4px;
                    font-family: monospace; color: #374151; margin: 12px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 24px;
                      padding-top: 16px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              
              <p>We received a request to reset the password for your TaskFlow account. 
                 If you didn't make this request, you can safely ignore this email.</p>
 
              <div class="warning">
                <strong>🔒 Security Alert:</strong> This password reset link expires in <strong>1 hour</strong>. 
                Act quickly to secure your account.
              </div>
 
              <p style="margin-top: 24px; margin-bottom: 12px; text-align: center;">
                Click the button below to reset your password:
              </p>
 
              <div class="button-container">
                <a href="${resetUrl}" class="button">
                  Reset Password
                </a>
              </div>
 
              <p style="text-align: center; color: #6b7280; font-size: 13px; margin-top: 16px;">
                Or copy this link if the button doesn't work:
              </p>
              <div class="code">${resetUrl}</div>
 
              <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
                <strong>For your security:</strong>
              </p>
              <ul style="color: #6b7280; font-size: 13px;">
                <li>Never share your password with anyone</li>
                <li>Never click password reset links from untrusted sources</li>
                <li>Change your password regularly</li>
              </ul>
 
              <p style="margin-top: 24px;">
                If you didn't request this reset or have questions, 
                please contact your administrator immediately.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">TaskFlow TMS | INTE 21323</p>
              <p style="margin: 4px 0 0 0;">© 2026 All rights reserved</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  };
 
 
    module.exports = { sendWelcomeEmail, sendPasswordResetEmail };