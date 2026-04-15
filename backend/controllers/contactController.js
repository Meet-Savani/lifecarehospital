import { sendEmail } from '../utils/email.js';
import { getContactFormEmail } from '../utils/emailTemplates.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const emailSubject = `New Contact Form Inquiry: ${subject}`;
    
    // Send the email to the destination address
    await sendEmail({
      to: 'liohnshospital748@gmail.com',
      subject: emailSubject,
      html: getContactFormEmail(name, email, subject, message),
    });

    res.status(200).json({ message: 'Contact form submitted successfully.' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to submit contact form.' });
  }
};
