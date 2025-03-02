"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromFile = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const jszip_1 = __importDefault(require("jszip"));
const mammoth_1 = __importDefault(require("mammoth"));
const path_1 = require("path");
/**
 * Extracts text from a file buffer (.pdf, .tex/.tec, .zip).
 * @param fileBuffer - The buffer of the file to extract text from.
 * @param fileExtension - The file extension of the uploaded file.
 * @param max_pages - The maximum number of pages for PDFs, default is 20.
 * @returns Extracted text as a string.
 * @throws Error if the file type is unsupported or exceeds the max page limit.
 */
const extractTextFromFile = async (fileBuffer, fileExtension, max_pages = 20) => {
    // Remove a leading dot if present, then convert to lowercase
    const extension = fileExtension.replace(/^\./, "").toLowerCase();
    switch (extension) {
        case "pdf":
            return extractTextFromPdf(fileBuffer, max_pages);
        case "tex":
        case "tec":
        case "latex":
            return extractTextFromLatex(fileBuffer);
        case "docx":
            return extractTextFromDocx(fileBuffer);
        case "zip":
            return extractTextFromZip(fileBuffer);
        default:
            throw new Error("Unsupported file type. Supported formats are .pdf, .docx, .tex/.tec/.latex, and .zip");
    }
};
exports.extractTextFromFile = extractTextFromFile;
/**
 * Extracts text from a PDF file buffer.
 * @param fileBuffer - Buffer of the PDF file.
 * @param max_pages - Maximum allowed pages.
 * @returns Extracted text as a string.
 * @throws Error if the PDF exceeds the page limit or parsing fails.
 */
const extractTextFromPdf = async (fileBuffer, max_pages = 20) => {
    try {
        const data = await (0, pdf_parse_1.default)(fileBuffer);
        if (data.numpages > max_pages) {
            throw new Error(`Error: PDF exceeds the ${max_pages}-page limit (Detected: ${data.numpages} pages).`);
        }
        return data.text.trim();
    }
    catch (error) {
        throw new Error("Failed to extract text from PDF: " + error);
    }
};
/**
 * Extracts text from a LaTeX (.tex or .tec) file buffer.
 * This version preserves most LaTeX commands and environments to retain context,
 * removing only comments and extraneous whitespace.
 * @param fileBuffer - Buffer of the LaTeX file.
 * @returns Extracted text with most LaTeX content preserved.
 */
const extractTextFromLatex = async (fileBuffer) => {
    const latexContent = fileBuffer.toString("utf8");
    return latexContent
        .replace(/%.*$/gm, "") // Remove comments
        .replace(/\s+/g, " ") // Normalize whitespace (optional)
        .trim();
};
async function extractTextFromDocx(fileBuffer) {
    try {
        const result = await mammoth_1.default.extractRawText({ buffer: fileBuffer });
        return result.value.trim();
    }
    catch (error) {
        throw new Error("Failed to extract text from DOCX: " + error);
    }
}
const extractTextFromZip = async (fileBuffer) => {
    const zip = await jszip_1.default.loadAsync(fileBuffer);
    let aggregatedText = "";
    // Array to hold files that match the extension criteria.
    const texFiles = [];
    // Iterate over all entries in the zip.
    zip.forEach((relativePath, file) => {
        // Log each file name for debugging purposes.
        console.log("Found file:", relativePath);
        // Use path.extname to get the file extension.
        const extension = (0, path_1.extname)(relativePath).toLowerCase();
        if (!file.dir && (extension === ".tex" || extension === ".tec")) {
            texFiles.push(file);
        }
    });
    // If no valid LaTeX files are found, log all file names and throw an error.
    if (texFiles.length === 0) {
        console.error("Files present in ZIP:", Object.keys(zip.files));
        throw new Error("No LaTeX (.tex or .tec) files found in the ZIP archive.");
    }
    // Process files concurrently for performance.
    const fileTexts = await Promise.all(texFiles.map(async (file) => {
        const fileContent = await file.async("nodebuffer");
        return extractTextFromLatex(fileContent);
    }));
    return fileTexts.join("\n").trim();
};
