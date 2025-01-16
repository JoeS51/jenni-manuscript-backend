import { Request, Response } from 'express';
import  { extractTextFromFile } from "../utils/fileTextExtraction"
import dotenv from 'dotenv'
import fs from "fs/promises";
dotenv.config()

export const uploadFile = async (req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return;
    }
    const filePath = req.file.path;
    try {
        // Extract text using the unified utility function
        const extractedText = await extractTextFromFile(filePath);
        res.status(200).json({
            message: "File uploaded and text extracted successfully",
            file: req.file, // File metadata
            text: extractedText, // Extracted text
        });

        //remove file from storage when done
        await fs.unlink(filePath);
        console.log(`File at ${filePath} has been deleted.`);
    } catch (err) {
        //remove file from temp storage
        await fs.unlink(filePath);
        console.log(`File at ${filePath} has been deleted.`);

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