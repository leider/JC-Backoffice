import puppeteer, { PDFOptions } from "puppeteer";

export const printoptionsRider: PDFOptions = {
  format: "a4",
  landscape: true,
  scale: 1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
};

export const printoptions: PDFOptions = {
  format: "a4",
  landscape: false,
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
};

export const printoptions131 = {
  ...printoptions,
  scale: 1.31,
  margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" },
};

export async function generatePdf(html: string, pdfOptions = printoptions) {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-web-security"] });
  const page = await browser.newPage();
  await page.emulateMediaType("screen");
  await page.setContent(html, {
    waitUntil: "networkidle0",
  });
  const pdf = await page.pdf(pdfOptions);
  await browser.close();
  return pdf;
}
