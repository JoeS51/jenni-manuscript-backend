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
