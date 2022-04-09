import puppeteer, { PDFOptions } from "puppeteer";
import { NextFunction, Response } from "express";

export function generatePdf(options: PDFOptions, res: Response, next: NextFunction) {
  return (err: Error | null, html?: string): void => {
    if (err) {
      next(err);
    } else {
      (async (): Promise<void> => {
        const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.emulateMediaType("screen");
        await page.goto(`data:text/html,${html}`, {
          waitUntil: "networkidle0",
        });
        const pdf1 = await page.pdf(options);
        await browser.close();
        res.set("Content-Type", "application/pdf");
        res.send(pdf1);
      })();
    }
  };
}

export const printoptions: PDFOptions = {
  format: "a4",
  landscape: false,
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
};

export function generatePdfLocally(html: string, callback: (pdf: Buffer) => void): void {
  (async (): Promise<void> => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.emulateMediaType("screen");
    await page.goto(`data:text/html,${html}`, {
      waitUntil: "networkidle0",
    });
    const pdf1 = await page.pdf(printoptions);
    await browser.close();
    callback(pdf1);
  })();
}
