import { Request, Response } from "express";
import { extractTextFromFile } from "../utils/fileTextExtraction";
import { sendEmailWithPDF } from "../utils/sendEmail";
import { convertMarkdownToHTML, evaluateManuscript } from "../utils/evaluateManuscript";
import { createPDFFromText } from "../utils/pdfOutput";
import dotenv from "dotenv";

dotenv.config();

const MAX_PAGE_LIMIT = 25;

export const uploadFile = async (req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
    }

    try {
        // Extract text from uploaded file
        const fileBuffer = req.file.buffer;
        const fileExtension = req.file.originalname.split(".").pop();
        const extractedText = await extractTextFromFile(fileBuffer, `.${fileExtension}`);

        // Retrieve AI output
        const journalType = req.body.journalType;
        const manuscriptEvaluationText = await evaluateManuscript(extractedText, journalType);

        // Debugging Log: Print Full Response
        console.log("DEBUG: Manuscript Evaluation Response =", manuscriptEvaluationText);

        // Ensure we have the expected output format
        if (!manuscriptEvaluationText || typeof manuscriptEvaluationText !== "object") {
            console.error("🚨 Error: Invalid response format from evaluateManuscript.");
            throw new Error("Expected an object but received something else.");
        }

        if (!manuscriptEvaluationText.generalFeedback) {
            console.error("🚨 Error: 'generalFeedback' is missing from AI response.");
            throw new Error("Expected 'generalFeedback' key but it's missing.");
        }

        // ✅ Convert AI Markdown to Proper HTML
        const formattedSectionValidation = convertMarkdownToHTML(manuscriptEvaluationText.sectionValidation);
        const formattedGeneralFeedback = convertMarkdownToHTML(manuscriptEvaluationText.generalFeedback);

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
        const pdfBuffer = await createPDFFromText(pdfHtmlContent);

        // ✅ Send Email with Properly Formatted PDF
        if (req.body.email) {
            try {
                const email = req.body.email;
                const subject = "AI Manuscript Evaluation";
                await sendEmailWithPDF(email, subject, pdfHtmlContent, pdfBuffer);
            } catch (err) {
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
    } catch (err) {
        console.error("🚨 Error processing request:", err);
        res.status(500).json({
            message: "An error occurred",
            error: err instanceof Error ? err.message : String(err),
        });
    }
};
