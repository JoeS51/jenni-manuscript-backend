import nodemailer from 'nodemailer';
import validator from 'validator';
import cron from 'node-cron';
import Bull from 'bull';

const emailQueue = new Bull('emailQueue', {
    redis: { host: '127.0.0.1', port: 6379 }  // This has redis running locally, would need to do setup to have it run with render server...
});

emailQueue.process(async (job) => {
    const { to, subject, text, pdfBuffer, filename } = job.data;

    try {
        const mailOptions: any = {
            from: 'manuscriptairesponse@gmail.com',
            to,
            subject,
            text,
        };

        if (pdfBuffer) {
            mailOptions.attachments = [{
                filename: filename || 'document.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf'
            }];
        }
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${to}`);
        return info;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
});

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
        text
    });
    return info;
}

export const sendEmailWithPDF = async (to: string, subject: string, text: string, pdfBuffer: Buffer, filename: string = 'document.pdf', delayInMinutes: number = 0) => {
    if (!validator.isEmail(to)) {
        throw new Error('Invalid email address');
    }

    const info = await transporter.sendMail({
        from: 'manuscriptairesponse@gmail.com',
        to,
        subject,
        text,
        attachments: [{
            filename: filename,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    });
    return info;
}

export default transporter;