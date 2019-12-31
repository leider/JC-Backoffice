import express from 'express';
import puppeteer, { PDFOptions } from 'puppeteer';

export default {
  generatePdf: function generatePdf(
    options: PDFOptions,
    res: express.Response,
    next: express.NextFunction
  ) {
    return (err: Error | null, html?: string): void => {
      if (err) {
        next(err);
      } else {
        (async (): Promise<void> => {
          const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
          const page = await browser.newPage();
          await page.emulateMediaType('screen');
          await page.goto(`data:text/html,${html}`, {
            waitUntil: 'networkidle0'
          });
          const pdf1 = await page.pdf(options);
          await browser.close();
          res.set('Content-Type', 'application/pdf');
          res.send(pdf1);
        })();
      }
    };
  }
};
