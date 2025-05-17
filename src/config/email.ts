import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Create a transporter using your email service
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.APP_PASSWORD,
    },
});

export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html: string
) => {
    try {
        const info = await transporter.sendMail({
            from: `"Parking Management System" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Error sending email: ${error}`);
        throw error;
    }
};