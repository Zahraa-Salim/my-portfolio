/**
 * Pre-generate FULL-PAGE screenshots of all live project sites.
 *
 * Usage:
 *   node scripts/take-screenshots.mjs
 *
 * Uses your locally installed Chrome — no extra download needed.
 * Output: public/screenshots/{repo-name}.webp
 *
 * Re-run whenever you add a new project or update a live site.
 */

import puppeteer from "puppeteer-core";
import { mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/screenshots");

// Path to your local Chrome
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";

// Repos with live URLs (update this list when you add new projects)
const SITES = [
  { name: "AurumRealty", url: "https://aurum-realty-tau.vercel.app" },
  { name: "blog-api", url: "https://blog-api-pied-xi.vercel.app" },
  { name: "checkout-flow", url: "https://checkout-flow-gamma.vercel.app" },
  { name: "DigitalHub", url: "https://digital-hub-puce.vercel.app/" },
  { name: "fastApi-blog", url: "https://fast-api-blog-eight.vercel.app" },
  { name: "flower-shop", url: "https://flower-shop-pied-beta.vercel.app" },
  { name: "html-css-web", url: "https://zahraa-salim.github.io/html-css-web/" },
  { name: "LocalFirst", url: "https://local-first.vercel.app/" },
];

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  console.log("Launching Chrome...\n");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const site of SITES) {
    const outPath = resolve(OUT_DIR, `${site.name}.webp`);
    console.log(`\u{1F4F8} ${site.name} \u2192 ${site.url}`);

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      await page.goto(site.url, {
        waitUntil: "networkidle2",
        timeout: 20000,
      });

      // Wait extra for JS hydration & animations
      await new Promise((r) => setTimeout(r, 3000));

      // Get the full scrollable height of the page (capped at 4000px)
      const fullHeight = await page.evaluate(() =>
        Math.min(document.body.scrollHeight, 4000)
      );

      // Resize viewport to capture full page
      await page.setViewport({ width: 1280, height: fullHeight });
      // Small wait for any layout shifts after resize
      await new Promise((r) => setTimeout(r, 500));

      await page.screenshot({
        path: outPath,
        type: "webp",
        quality: 82,
        clip: { x: 0, y: 0, width: 1280, height: fullHeight },
      });

      await page.close();
      console.log(`   \u2705 Saved (${fullHeight}px tall) \u2192 ${outPath}\n`);
    } catch (err) {
      console.log(`   \u274C Failed: ${err.message}\n`);
    }
  }

  await browser.close();
  console.log("Done! Screenshots saved to public/screenshots/");
}

main();
