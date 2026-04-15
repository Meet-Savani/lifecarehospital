import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  try {
    // Attempt real SMTP if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or configured service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `Care Companion <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.warn('EMAIL_USER and EMAIL_PASS not defined. Mocking email delivery.');
    }
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};
