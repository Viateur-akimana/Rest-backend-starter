import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.APP_PASSWORD
    },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
    };

    return transporter.sendMail(mailOptions);
};