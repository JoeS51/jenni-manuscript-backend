import nodemailer from 'nodemailer';
import validator from 'validator';

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
    if (!validator.isEmail(to)) {
        throw new Error('Invalid email address');
    }

    const info = await transporter.sendMail({
        from: 'manuscriptairesponse@gmail.com',
        to,
        subject,
        text: "Your manuscript evaluation is attached."
    });
    return info;
}

export const sendEmailWithPDF = async (to: string, subject: string, text: string, pdfBuffer: Buffer, filename: string = 'document.pdf') => {
    if (!validator.isEmail(to)) {
        throw new Error('Invalid email address');
    }

    const info = await transporter.sendMail({
        from: 'manuscriptairesponse@gmail.com',
        to,
        subject,
        text: "Your manuscript evaluation is attached.",
        attachments: [{
            filename: filename,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    });
    return info;
}

export default transporter;