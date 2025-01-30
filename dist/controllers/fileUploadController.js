"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const fileTextExtraction_1 = require("../utils/fileTextExtraction");
const dotenv_1 = __importDefault(require("dotenv"));
const sendEmail_1 = require("../utils/sendEmail");
const openAIFunctions_1 = require("../utils/openAIFunctions");
const pdfOutput_1 = require("../utils/pdfOutput");
dotenv_1.default.config();
const uploadFile = async (req, res) => {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
    }
    try {
        // Extract text from the file buffer directly
        const fileBuffer = req.file.buffer; // File is in memory
        const fileExtension = req.file.originalname.split(".").pop(); // Get file extension
        const extractedText = await (0, fileTextExtraction_1.extractTextFromFile)(fileBuffer, `.${fileExtension}`);
        // retrieve API output
        const journalType = req.body.journalType;
        const manuscriptEvaluationText = await (0, openAIFunctions_1.evaluateManuscript)(extractedText, journalType);
        // Uncomment to send email
        if (req.body.email) {
            try {
                const email = req.body.email;
                const subject = "test ai manuscript";
                const text = "Hello this is a test email";
                const outputPdf = await (0, pdfOutput_1.createPDFFromText)(manuscriptEvaluationText.generalFeedback);
                await (0, sendEmail_1.sendEmailWithPDF)(email, subject, "feedback", outputPdf);
            }
            catch (err) {
                console.error("Error sending email:", err);
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
            text: extractedText, // Extracted text
            evaluatedText: manuscriptEvaluationText, //evaluated text
        });
    }
    catch (err) {
        // Narrowing 'err' to Error
        if (err instanceof Error) {
            console.error("Error extracting text:", err.message);
            res.status(500).json({
                message: "Error extracting text from file",
                error: err.message,
            });
        }
        else {
            console.error("Unknown error:", err);
            res.status(500).json({
                message: "An unknown error occurred",
                error: String(err),
            });
        }
    }
};
exports.uploadFile = uploadFile;
