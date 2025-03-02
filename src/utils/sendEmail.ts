import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import validator from 'validator';

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export async function sendEmailWithPDF(
    toEmail: string,
    subject: string,
    text: string,
    pdfBuffer: Buffer,
    filename: string = 'manuscript-evaluation.pdf'
): Promise<void> {
    // Validate email
    if (!validator.isEmail(toEmail)) {
        throw new Error('Invalid email address');
    }

    const mailOptions = {
        from: 'manuscriptairesponse@gmail.com',
        to: toEmail,
        subject,
        text: "Your manuscript evaluation is attached.",
        attachments: [{
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${toEmail}`);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}