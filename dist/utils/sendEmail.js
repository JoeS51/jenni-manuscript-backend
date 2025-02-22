"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDF = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const validator_1 = __importDefault(require("validator"));
const bull_1 = __importDefault(require("bull"));
const emailQueue = new bull_1.default('emailQueue', {
    redis: { host: '127.0.0.1', port: 6379 } // This has redis running locally, would need to do setup to have it run with render server...
});
emailQueue.process(async (job) => {
    const { to, subject, text, pdfBuffer, filename } = job.data;
    try {
        const mailOptions = {
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
    }
    catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
});
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
const sendEmail = async (to, subject, text) => {
    if (!validator_1.default.isEmail(to)) {
        throw new Error('Invalid email address');
    }
    const info = await transporter.sendMail({
        from: 'manuscriptairesponse@gmail.com',
        to,
        subject,
        text: "Your manuscript evaluation is attached."
    });
    return info;
};
exports.sendEmail = sendEmail;
const sendEmailWithPDF = async (to, subject, text, pdfBuffer, filename = 'document.pdf', delayInMinutes = 0) => {
    if (!validator_1.default.isEmail(to)) {
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
};
exports.sendEmailWithPDF = sendEmailWithPDF;
exports.default = transporter;
