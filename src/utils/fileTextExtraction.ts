import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import WordExtractor from 'word-extractor';
const extractor = new WordExtractor();


/**
 * Extracts text from a file buffer (.doc, .docx, .pdf).
 * @param fileBuffer - The buffer of the file to extract text from.
 * @param fileExtension - The file extension of the uploaded file.
 * @returns Extracted text as a string.
 * @throws Error if file type is unsupported or extraction fails.
 */
export const extractTextFromFile = async (fileBuffer: Buffer, fileExtension: string): Promise<string> => {
    const extension = fileExtension.toLowerCase();

    if (extension === ".pdf") {
        return extractTextFromPdf(fileBuffer);
    } else if (extension === ".docx") {
        return extractTextFromDocx(fileBuffer);
    } else if (extension === ".doc") {
        return extractTextFromDoc(fileBuffer);
    } else {
        throw new Error("Unsupported file type. Supported formats are .pdf, .doc, .docx");
    }
};

/**
 * Extracts text from a PDF file buffer.
 * @param fileBuffer - Buffer of the PDF file.
 * @returns Extracted text as a string.
 */
const extractTextFromPdf = async (fileBuffer: Buffer): Promise<string> => {
    const data = await pdfParse(fileBuffer);
    return data.text; // Returns extracted text
};

/**
 * Extracts text from a DOCX file buffer.
 * @param fileBuffer - Buffer of the DOCX file.
 * @returns Extracted text as a string.
 */
const extractTextFromDocx = async (fileBuffer: Buffer): Promise<string> => {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value; // Returns extracted text
};

/**
 * Extracts text from a `.doc` file buffer.
 * @param fileBuffer - Buffer of the DOC file.
 * @returns Extracted text as a string.
 * @throws Error if text extraction fails.
 */
const extractTextFromDoc = async (fileBuffer: Buffer): Promise<string> => {
    try {
        const document = await extractor.extract(fileBuffer);
        return document.getBody();
    } catch (err) {
        throw new Error(`Failed to extract text from DOC file: ${err instanceof Error ? err.message : String(err)}`);
    }
};
