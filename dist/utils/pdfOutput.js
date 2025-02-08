"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPDFFromText = createPDFFromText;
exports.createPDFFromTextWithGeneralFeedbackAndSectionValidation = createPDFFromTextWithGeneralFeedbackAndSectionValidation;
const playwright_1 = require("playwright");
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Creates a properly formatted PDF document from HTML content using Playwright.
 * @param htmlContent - The HTML content to be converted into a PDF.
 * @returns A Promise that resolves to a Buffer containing the generated PDF.
 */
async function createPDFFromText(htmlContent) {
    // Launch the Chromium browser in headless mode.
    const browser = await playwright_1.chromium.launch({ headless: true });
    try {
        // Create a new browser context and page.
        const context = await browser.newContext();
        const page = await context.newPage();
        // Set the HTML content for the page and wait for network to be idle.
        await page.setContent(htmlContent, { waitUntil: 'networkidle' });
        // Generate the PDF with desired options.
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Ensures that background colors and images are included.
        });
        // Close the browser context.
        await context.close();
        return pdfBuffer;
    }
    catch (error) {
        throw error;
    }
    finally {
        // Ensure the browser is closed.
        await browser.close();
    }
}
/**
 * Creates a PDF document from the provided feedback text with clear section headers.
 * @param generalFeedback - The general feedback text.
 * @param specificFeedback - The specific feedback text.
 * @returns Buffer containing the generated PDF.
 */
async function createPDFFromTextWithGeneralFeedbackAndSectionValidation(generalFeedback, sectionValidation) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default();
            const chunks = [];
            // Capture PDF data in chunks
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            // Title
            doc.fontSize(18).text('Manuscript Feedback', { align: 'center' });
            doc.moveDown(1.5);
            // General Feedback Section
            doc.fontSize(14).fillColor('blue').text('General Feedback', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('black').text(generalFeedback, {
                align: 'left',
                lineGap: 5
            });
            doc.moveDown(1);
            // Specific Feedback Section
            doc.fontSize(14).fillColor('blue').text('Validation of Required Sections', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('black').text(sectionValidation, {
                align: 'left',
                lineGap: 5
            });
            // Finalize PDF
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
