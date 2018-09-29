const puppeteer = require('puppeteer');

module.exports = {
  generatePdf: function generatePdf(options, res, next) {
    return (err, html) => {
      if (err) { return next(err); }
      (async () => {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.emulateMedia('screen');
        await page.goto(`data:text/html,${html}`, {waitUntil: 'networkidle0'});
        const pdf1 = await page.pdf(options);
        await browser.close();
        res.set('Content-Type', 'application/pdf');
        res.send(pdf1);
      })();
    };
  }
};
