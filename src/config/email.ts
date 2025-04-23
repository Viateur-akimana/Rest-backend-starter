import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com', // Replace with your SMTP host
    port: parseInt(process.env.SMTP_PORT || '587'), // Replace with your SMTP port
    secure: process.env.SMTP_SECURE === 'true', // Use true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'your-email@example.com', // Replace with your SMTP username
        pass: process.env.SMTP_PASS || 'your-email-password', // Replace with your SMTP password
    },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@example.com', // Replace with your "from" email
        to,
        subject,
        text,
        html,
    };

    return transporter.sendMail(mailOptions);
};