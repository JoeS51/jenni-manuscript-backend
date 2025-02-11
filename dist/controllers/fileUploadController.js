"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const fileTextExtraction_1 = require("../utils/fileTextExtraction");
const sendEmail_1 = require("../utils/sendEmail");
const evaluateManuscript_1 = require("../utils/evaluateManuscript");
const pdfOutput_1 = require("../utils/pdfOutput");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MAX_PAGE_LIMIT = 25;
const uploadFile = async (req, res) => {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
    }
    try {
        // Extract text from uploaded file
        const fileBuffer = req.file.buffer;
        const fileExtension = req.file.originalname.split(".").pop();
        const extractedText = await (0, fileTextExtraction_1.extractTextFromFile)(fileBuffer, `.${fileExtension}`, MAX_PAGE_LIMIT);
        // Retrieve AI output
        const journalType = req.body.journalType;
        const manuscriptEvaluationText = await (0, evaluateManuscript_1.evaluateManuscript)(extractedText, journalType);
        // Ensure we have the expected output format
        if (!manuscriptEvaluationText || typeof manuscriptEvaluationText !== "object") {
            console.error("Error: Invalid response format from evaluateManuscript.");
            throw new Error("Expected an object but received something else.");
        }
        if (!manuscriptEvaluationText.generalFeedback) {
            console.error("Error: 'generalFeedback' is missing from AI response.");
            throw new Error("Expected 'generalFeedback' key but it's missing.");
        }
        // ✅ Convert AI Markdown to Proper HTML
        const formattedSectionValidation = (0, evaluateManuscript_1.convertMarkdownToHTML)(manuscriptEvaluationText.sectionValidation);
        const formattedGeneralFeedback = (0, evaluateManuscript_1.convertMarkdownToHTML)(manuscriptEvaluationText.generalFeedback);
        // ✅ Construct Properly Formatted HTML for the PDF
        const pdfHtmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    h2 { color: #0056b3; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    p { font-size: 14px; }
                </style>
            </head>
            <body>
                <h2>📄 Manuscript Evaluation Results</h2>
                <h3>📑 Section Validation</h3>
                ${formattedSectionValidation}
                <h3>📝 General Feedback</h3>
                ${formattedGeneralFeedback}
                <p>Thank you for using our AI-powered manuscript evaluation tool.</p>
            </body>
            </html>
        `;
        // ✅ Generate PDF with Formatted Content
        const pdfBuffer = await (0, pdfOutput_1.createPDFFromText)(pdfHtmlContent);
        // ✅ Send Email with Properly Formatted PDF
        if (req.body.email) {
            try {
                const email = req.body.email;
                const subject = "AI Manuscript Evaluation";
                await (0, sendEmail_1.sendEmailWithPDF)(email, subject, pdfHtmlContent, pdfBuffer);
            }
            catch (err) {
                console.error("🚨 Error sending email:", err);
                res.status(500).json({
                    message: "Error sending email",
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
        res.status(200).json({
            message: "File uploaded, text extracted, and email sent successfully",
            file: {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
            text: extractedText,
            evaluatedText: manuscriptEvaluationText,
        });
    }
    catch (err) {
        console.error("🚨 Error processing request:", err);
        res.status(500).json({
            message: "An error occurred",
            error: err instanceof Error ? err.message : String(err),
        });
    }
};
exports.uploadFile = uploadFile;
