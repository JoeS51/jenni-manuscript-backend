"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithPDF = sendEmailWithPDF;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const validator_1 = __importDefault(require("validator"));
// Create transporter for Gmail
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
async function sendEmailWithPDF(toEmail, subject, text, pdfBuffer, filename = 'manuscript-evaluation.pdf') {
    // Validate email
    if (!validator_1.default.isEmail(toEmail)) {
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
    }
    catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}
