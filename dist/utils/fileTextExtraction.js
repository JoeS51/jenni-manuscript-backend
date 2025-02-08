"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromFile = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const word_extractor_1 = __importDefault(require("word-extractor"));
// import countPages from "page-count";
// import { DocxCounter, OdtCounter, PdfCounter, PptxCounter } from "page-count";
// const countPages = require('page-counter')
const extractor = new word_extractor_1.default();
/**
 * Extracts text from a file buffer (.doc, .docx, .pdf).
 * @param fileBuffer - The buffer of the file to extract text from.
 * @param fileExtension - The file extension of the uploaded file.
 * @param max_pages - the maximum number of pages for this file, default 20.
 * @returns Extracted text as a string.
 * @throws Error if file type is unsupported or extraction fails or the number of pages in file is >m ax_pages
 */
const extractTextFromFile = async (fileBuffer, fileExtension, max_pages = 20) => {
    const extension = fileExtension.toLowerCase();
    if (extension === ".pdf") {
        return extractTextFromPdf(fileBuffer, max_pages);
    }
    else if (extension === ".docx") {
        return extractTextFromDocx(fileBuffer, max_pages);
    }
    else if (extension === ".doc") {
        return extractTextFromDoc(fileBuffer, max_pages);
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
const extractTextFromPdf = async (fileBuffer, max_pages = 20) => {
    const data = await (0, pdf_parse_1.default)(fileBuffer);
    console.log(data.numpages);
    if (data.numpages > max_pages) {
        throw new Error(`Error: PDF exceeds the ${max_pages}-page limit (Detected: ${data.numpages} pages).`);
    }
    return data.text; // Returns extracted text
};
/**
 * Extracts text from a DOCX file buffer.
 * @param fileBuffer - Buffer of the DOCX file.
 * @returns Extracted text as a string.
 */
const extractTextFromDocx = async (fileBuffer, max_pages = 20) => {
    console.log("in extract text from docx");
    //TODO: make this work before allowing .docx files
    // const pages = await DocxCounter.count(fileBuffer)
    // console.log(pages)
    // if (pages > max_pages) {
    //     throw new Error(`Error: DOCX exceeds the ${max_pages}-page limit (Detected: ${pages} pages).`);
    // }
    const result = await mammoth_1.default.extractRawText({ buffer: fileBuffer });
    return result.value; // Returns extracted text
};
/**
 * Extracts text from a `.doc` file buffer.
 * @param fileBuffer - Buffer of the DOC file.
 * @returns Extracted text as a string.
 * @throws Error if text extraction fails.
 */
const extractTextFromDoc = async (fileBuffer, max_pages = 20) => {
    //TODO: make this work before allowing .doc files
    // const pages = await countPages(fileBuffer, 'docx')
    // console.log(pages)
    // if (pages > max_pages) {
    //     throw new Error(`Error: DOCX exceeds the ${max_pages}-page limit (Detected: ${pages} pages).`);
    // }
    const document = await extractor.extract(fileBuffer);
    return document.getBody();
};
