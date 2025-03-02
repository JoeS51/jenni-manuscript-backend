import { Request, Response } from "express";
import { extractTextFromFile } from "../utils/fileTextExtraction";
import { sendEmailWithPDF } from "../utils/sendEmail";
import { convertMarkdownToHTML, evaluateManuscript } from "../utils/evaluateManuscript";
import { createPDFFromText } from "../utils/pdfOutput";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const MAX_PAGE_LIMIT = 25;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be defined in the environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to log processed paper
async function logProcessedPaper(inputFile: string, outputFile: string, journalName: string, userEmail: string) {
    const { data, error } = await supabase
        .from('processed_papers')
        .insert([
            { input_file: inputFile, output_file: outputFile, journal_name: journalName, user_email: userEmail }
        ]);

    if (error) {
        console.error('Error logging processed paper:', error);
    } else {
        console.log('Processed paper logged successfully:', data);
    }
}

export const uploadFile = async (req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
    }

    try {
        // Extract text from uploaded file
        const fileBuffer = req.file.buffer;
        const fileExtension = req.file.originalname.split(".").pop();
        const extractedText = await extractTextFromFile(fileBuffer, `.${fileExtension}`, MAX_PAGE_LIMIT);

        // Retrieve AI output
        const journalType = req.body.journalType;
        const manuscriptEvaluationText = await evaluateManuscript(extractedText, journalType);

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
                return;
            }
        }

        // After processing the manuscript
        const inputFile = extractedText; // Store the extracted text instead of the file name
        const outputFile = JSON.stringify(manuscriptEvaluationText); // or however you want to format it
        const journalName = req.body.journalType;
        const userEmail = req.body.email; // Assuming the email is sent in the request body

        // Log the processed paper
        await logProcessedPaper(inputFile, outputFile, journalName, userEmail);

        res.status(200).json({
            message: "File processed successfully",
            emailSent: req.body.email ? true : false,
            file: {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
            text: extractedText,
            evaluatedText: manuscriptEvaluationText,
        });
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({
                message: "An error occurred",
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
};
