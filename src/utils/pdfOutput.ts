import { chromium } from 'playwright';

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
