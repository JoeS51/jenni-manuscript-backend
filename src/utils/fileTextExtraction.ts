// import textract from "textract";

// /**
//  * Extracts text from a file using `textract`.
//  * @param filePath - Path to the file to extract text from.
//  * @returns Extracted text as a string.
//  * @throws Error if text extraction fails.
//  */
// export const extractTextFromFile = async (filePath: string): Promise<string> => {
//     return new Promise((resolve, reject) => {
//         textract.fromFileWithPath(filePath, (err, text) => {
//             if (err) {
//                 reject(new Error(`Failed to extract text: ${err.message} filepath was ${filePath}`));
//             } else {
//                 resolve(text || "");
//             }
//         });
//     });
// };

import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
const WordExtractor = require('word-extractor');
const extractor = new WordExtractor();


/**
 * Extracts text from a file (.doc, .docx, .pdf).
 * @param filePath - Path to the file to extract text from.
 * @returns Extracted text as a string.
 * @throws Error if file type is unsupported or extraction fails.
 */
export const extractTextFromFile = async (filePath: string): Promise<string> => {
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === ".pdf") {
        return extractTextFromPdf(filePath);
    } else if (fileExtension === ".docx") {
        return extractTextFromDocx(filePath);
    } else if (fileExtension === ".doc") {
        return extractTextFromDoc(filePath);
    } else {
        throw new Error("Unsupported file type. Supported formats are .pdf, .doc, .docx");
    }
};

/**
 * Extracts text from a PDF file.
 * @param filePath - Path to the PDF file.
 * @returns Extracted text as a string.
 */
const extractTextFromPdf = async (filePath: string): Promise<string> => {
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);
    return data.text; // Returns extracted text
};

/**
 * Extracts text from a DOCX file.
 * @param filePath - Path to the DOCX file.
 * @returns Extracted text as a string.
 */
const extractTextFromDocx = async (filePath: string): Promise<string> => {
    const fileBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value; // Returns extracted text
};

const extractTextFromDoc = async (filePath: string): Promise<string> => {
    const document = await extractor.extract(filePath);
    return document.getBody();
};

// /**
//  * Extracts text from a DOC file.
//  * @param filePath - Path to the DOC file.
//  * @returns Extracted text as a string.
//  */
// const extractTextFromDoc = async (filePath: string): Promise<string> => {
//     const extractor = await getTextExtractor();
//     const fileBuffer = await fsp.readFile(filePath);
//     const text = await extractor.extractText({ input: fileBuffer, type: 'buffer' });
//     return text;
//   };
