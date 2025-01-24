"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromFile = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const word_extractor_1 = __importDefault(require("word-extractor"));
const extractor = new word_extractor_1.default();
/**
 * Extracts text from a file buffer (.doc, .docx, .pdf).
 * @param fileBuffer - The buffer of the file to extract text from.
 * @param fileExtension - The file extension of the uploaded file.
 * @returns Extracted text as a string.
 * @throws Error if file type is unsupported or extraction fails.
 */
const extractTextFromFile = async (fileBuffer, fileExtension) => {
    const extension = fileExtension.toLowerCase();
    if (extension === ".pdf") {
        return extractTextFromPdf(fileBuffer);
    }
    else if (extension === ".docx") {
        return extractTextFromDocx(fileBuffer);
    }
    else if (extension === ".doc") {
        return extractTextFromDoc(fileBuffer);
    }
    else {
        throw new Error("Unsupported file type. Supported formats are .pdf, .doc, .docx");
    }
};
exports.extractTextFromFile = extractTextFromFile;
/**
 * Extracts text from a PDF file buffer.
 * @param fileBuffer - Buffer of the PDF file.
 * @returns Extracted text as a string.
 */
const extractTextFromPdf = async (fileBuffer) => {
    const data = await (0, pdf_parse_1.default)(fileBuffer);
    return data.text; // Returns extracted text
};
/**
 * Extracts text from a DOCX file buffer.
 * @param fileBuffer - Buffer of the DOCX file.
 * @returns Extracted text as a string.
 */
const extractTextFromDocx = async (fileBuffer) => {
    const result = await mammoth_1.default.extractRawText({ buffer: fileBuffer });
    return result.value; // Returns extracted text
};
/**
 * Extracts text from a `.doc` file buffer.
 * @param fileBuffer - Buffer of the DOC file.
 * @returns Extracted text as a string.
 * @throws Error if text extraction fails.
 */
const extractTextFromDoc = async (fileBuffer) => {
    try {
        const document = await extractor.extract(fileBuffer);
        return document.getBody();
    }
    catch (err) {
        throw new Error(`Failed to extract text from DOC file: ${err instanceof Error ? err.message : String(err)}`);
    }
};
