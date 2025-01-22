import { Request, Response } from "express";
import { extractTextFromFile } from "../utils/fileTextExtraction";
import dotenv from "dotenv";
import { sendEmail } from "../utils/sendEmail";
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

        console.log("HERERERERER");
        console.log(req.body.email)

        // Uncomment to send email
        if (req.body.email) {
            const email = req.body.email;
            const subject = "test ai manuscript";
            const text = "Hello this is a test email";
            await sendEmail(email, subject, text);
        }

        res.status(200).json({
            message: "File uploaded and text extracted successfully",
            file: {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
            text: extractedText, // Extracted text
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