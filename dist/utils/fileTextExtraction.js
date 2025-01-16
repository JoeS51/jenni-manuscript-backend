"use strict";
// import textract from "textract";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromFile = void 0;
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const WordExtractor = require('word-extractor');
const extractor = new WordExtractor();
/**
 * Extracts text from a file (.doc, .docx, .pdf).
 * @param filePath - Path to the file to extract text from.
 * @returns Extracted text as a string.
 * @throws Error if file type is unsupported or extraction fails.
 */
const extractTextFromFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileExtension = path_1.default.extname(filePath).toLowerCase();
    if (fileExtension === ".pdf") {
        return extractTextFromPdf(filePath);
    }
    else if (fileExtension === ".docx") {
        return extractTextFromDocx(filePath);
    }
    else if (fileExtension === ".doc") {
        return extractTextFromDoc(filePath);
    }
    else {
        throw new Error("Unsupported file type. Supported formats are .pdf, .doc, .docx");
    }
});
exports.extractTextFromFile = extractTextFromFile;
/**
 * Extracts text from a PDF file.
 * @param filePath - Path to the PDF file.
 * @returns Extracted text as a string.
 */
const extractTextFromPdf = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileBuffer = fs_1.default.readFileSync(filePath);
    const data = yield (0, pdf_parse_1.default)(fileBuffer);
    return data.text; // Returns extracted text
});
/**
 * Extracts text from a DOCX file.
 * @param filePath - Path to the DOCX file.
 * @returns Extracted text as a string.
 */
const extractTextFromDocx = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileBuffer = fs_1.default.readFileSync(filePath);
    const result = yield mammoth_1.default.extractRawText({ buffer: fileBuffer });
    return result.value; // Returns extracted text
});
const extractTextFromDoc = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield extractor.extract(filePath);
    return document.getBody();
});
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
