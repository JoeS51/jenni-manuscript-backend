import PDFDocument from 'pdfkit';

/**
 * Creates a PDF document from the provided text input
 * @param text - The text content to be added to the PDF
 * @returns Buffer containing the generated PDF
 */
export async function createPDFFromText(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));

            doc.on('end', () => resolve(Buffer.concat(chunks)));

            doc.fontSize(12)
                .text(text, {
                    align: 'left',
                    lineGap: 5
                });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}


/**
 * Creates a PDF document from the provided feedback text with clear section headers.
 * @param generalFeedback - The general feedback text.
 * @param specificFeedback - The specific feedback text.
 * @returns Buffer containing the generated PDF.
 */
export async function createPDFFromTextWithGeneralFeedbackAndSectionValidation(generalFeedback: string, sectionValidation: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

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
        } catch (error) {
            reject(error);
        }
    });
}
