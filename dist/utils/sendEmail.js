"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDF = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const validator_1 = __importDefault(require("validator"));
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
        text
    });
    return info;
};
exports.sendEmail = sendEmail;
const sendEmailWithPDF = async (to, subject, text, pdfBuffer, filename = 'document.pdf') => {
    if (!validator_1.default.isEmail(to)) {
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
};
exports.sendEmailWithPDF = sendEmailWithPDF;
exports.default = transporter;
