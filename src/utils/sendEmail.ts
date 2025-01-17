import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
    const info = await transporter.sendMail({
        from: 'manuscriptairesponse@gmail.com',
        to,
        subject,
        text
    });
    return info;
}

export default transporter;