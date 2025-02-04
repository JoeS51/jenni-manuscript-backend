import { chromium } from 'playwright';
import PDFDocument from 'pdfkit';


/**
 * Creates a properly formatted PDF document from HTML content using Playwright.
 * @param htmlContent - The HTML content to be converted into a PDF.
 * @returns A Promise that resolves to a Buffer containing the generated PDF.
 */
export async function createPDFFromText(htmlContent: string): Promise<Buffer> {
  // Launch the Chromium browser in headless mode.
  const browser = await chromium.launch({ headless: true });
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
  } catch (error) {
    throw error;
  } finally {
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
export async function createPDFFromTextWithGeneralFeedbackAndSectionValidation(generalFeedback: string, sectionValidation: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      // Capture PDF data in chunks
      doc.on('data', (chunk: any) => chunks.push(chunk));
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
