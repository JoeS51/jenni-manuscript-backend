import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import WordExtractor from 'word-extractor';

// import countPages from "page-count";
// import { DocxCounter, OdtCounter, PdfCounter, PptxCounter } from "page-count";
// const countPages = require('page-counter')

const extractor = new WordExtractor();


/**
 * Extracts text from a file buffer (.doc, .docx, .pdf).
 * @param fileBuffer - The buffer of the file to extract text from.
 * @param fileExtension - The file extension of the uploaded file.
 * @param max_pages - the maximum number of pages for this file, default 20.
 * @returns Extracted text as a string.
 * @throws Error if file type is unsupported or extraction fails or the number of pages in file is >m ax_pages
 */
export const extractTextFromFile = async (fileBuffer: Buffer, fileExtension: string, max_pages: number = 20): Promise<string> => {
    const extension = fileExtension.toLowerCase();
    if (extension === ".pdf") {
        return extractTextFromPdf(fileBuffer, max_pages);
    } else if (extension === ".docx") {
        return extractTextFromDocx(fileBuffer, max_pages);
    } else if (extension === ".doc") {
        return extractTextFromDoc(fileBuffer, max_pages);
    } else {
        throw new Error("Unsupported file type. Supported formats are .pdf, .doc, .docx");
    }
};

/**
 * Extracts text from a PDF file buffer.
 * @param fileBuffer - Buffer of the PDF file
 * @returns Extracted text as a string.
 */
const extractTextFromPdf = async (fileBuffer: Buffer, max_pages: number = 20): Promise<string> => {
    const data = await pdfParse(fileBuffer);
    console.log(data.numpages)
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
const extractTextFromDocx = async (fileBuffer: Buffer, max_pages: number = 20): Promise<string> => {
    console.log("in extract text from docx")
    //TODO: make this work before allowing .docx files
    // const pages = await DocxCounter.count(fileBuffer)
    // console.log(pages)
    // if (pages > max_pages) {
    //     throw new Error(`Error: DOCX exceeds the ${max_pages}-page limit (Detected: ${pages} pages).`);
    // }
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value; // Returns extracted text
};

/**
 * Extracts text from a `.doc` file buffer.
 * @param fileBuffer - Buffer of the DOC file.
 * @returns Extracted text as a string.
 * @throws Error if text extraction fails.
 */
const extractTextFromDoc = async (fileBuffer: Buffer, max_pages: number = 20): Promise<string> => {
    //TODO: make this work before allowing .doc files
    // const pages = await countPages(fileBuffer, 'docx')
    // console.log(pages)
    // if (pages > max_pages) {
    //     throw new Error(`Error: DOCX exceeds the ${max_pages}-page limit (Detected: ${pages} pages).`);
    // }
    const document = await extractor.extract(fileBuffer);
    return document.getBody();
};
