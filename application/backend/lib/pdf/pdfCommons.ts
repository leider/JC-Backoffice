import puppeteer, { PDFOptions } from "puppeteer";
import os from "os";
import path from "path";
import fs from "fs/promises";

export const printoptionsRider: PDFOptions = {
  format: "a4",
  landscape: true,
  scale: 1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
} as const;

export const printoptions: PDFOptions = {
  format: "a4",
  landscape: false,
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
} as const;

export const printoptions131 = {
  ...printoptions,
  scale: 1.31,
  margin: { top: "20mm", bottom: "10mm", left: "17mm", right: "17mm" },
} as const;

async function getLaunchOptions(): Promise<puppeteer.LaunchOptions> {
  const isLinux = process.platform === "linux";

  if (!isLinux) {
    return {
      headless: true,
      args: ["--no-sandbox", "--disable-web-security"],
    };
  }

  const chromiumBase = path.join(os.tmpdir(), ".chromium");
  await fs.mkdir(chromiumBase, { recursive: true });

  // XDG-Umgebungsvariablen setzen – der eigentliche Fix für Chromium 128+
  process.env.XDG_CONFIG_HOME = chromiumBase;
  process.env.XDG_CACHE_HOME = chromiumBase;

  return {
    headless: true,
    executablePath: "/usr/bin/chromium",
    userDataDir: path.join(chromiumBase, "userdata"),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process",
      "--disable-extensions",
      "--disable-web-security",
    ],
  };
}

export async function generatePdf(html: string, pdfOptions = printoptions) {
  const launchOptions = await getLaunchOptions();
  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.emulateMediaType("screen");
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });
    const pdf = await page.pdf(pdfOptions);
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
