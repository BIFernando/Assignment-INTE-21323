const nodemailer = require('nodemailer');
 
    // Set up the email transporter using Mailtrap credentials
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
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
 
    module.exports = { sendWelcomeEmail };