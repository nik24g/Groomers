const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

// Function to send a confirmation email
const sendConfirmationEmail = async (toEmail, subject, htmlContent) => {
    try {
        // Define email options
        const mailOptions = {
            from: process.env.NODEMAILER_USER, // Sender email address
            to: toEmail, // Recipient email address
            subject: subject, // Email subject
            html: htmlContent, // HTML content of the email
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        // console.log(`Email sent: ${info.messageId}`);
        return info.messageId;
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw error;
    }
};

module.exports = { sendConfirmationEmail };
