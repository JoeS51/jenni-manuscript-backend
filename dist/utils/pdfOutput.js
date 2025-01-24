"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPDFFromText = createPDFFromText;
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Creates a PDF document from the provided text input
 * @param text - The text content to be added to the PDF
 * @returns Buffer containing the generated PDF
 */
async function createPDFFromText(text) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default();
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.fontSize(12)
                .text(text, {
                align: 'left',
                lineGap: 5
            });
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
