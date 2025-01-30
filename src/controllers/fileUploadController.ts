import { Request, Response } from "express";
import { extractTextFromFile } from "../utils/fileTextExtraction";
import dotenv from "dotenv";
import { sendEmailWithPDF } from "../utils/sendEmail";
import { evaluateManuscript } from "../utils/openAIFunctions";
import { createPDFFromText } from "../utils/pdfOutput";

dotenv.config();

export const uploadFile = async (req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
    }

    try {
        // Extract text from the file buffer directly
        const fileBuffer = req.file.buffer; // File is in memory
        const fileExtension = req.file.originalname.split(".").pop(); // Get file extension
        const extractedText = await extractTextFromFile(fileBuffer, `.${fileExtension}`);

        // retrieve API output
        const journalType = req.body.journalType
        const manuscriptEvaluationText = await evaluateManuscript(extractedText, journalType)
        // Uncomment to send email
        if (req.body.email) {
            try {
                const email = req.body.email;
                const subject = "test ai manuscript";
                const text = "Hello this is a test email";
                const outputPdf = await createPDFFromText(manuscriptEvaluationText.generalFeedback);
                await sendEmailWithPDF(email, subject, "feedback", outputPdf);
            } catch (err) {
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
    } catch (err) {
        // Narrowing 'err' to Error
        if (err instanceof Error) {
            console.error("Error extracting text:", err.message);
            res.status(500).json({
                message: "Error extracting text from file",
                error: err.message,
            });
        } else {
            console.error("Unknown error:", err);
            res.status(500).json({
                message: "An unknown error occurred",
                error: String(err),
            });
        }
    }
};