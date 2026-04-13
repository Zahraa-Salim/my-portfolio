/**
 * Pre-generate screenshots of all live project sites.
 *
 * Usage:
 *   node scripts/take-screenshots.mjs
 *
 * Requires: npm install puppeteer (full version, not puppeteer-core)
 * This runs LOCALLY — not on Vercel.
 *
 * Output: public/screenshots/{repo-name}.webp
 *
 * Re-run whenever you add a new project or update a live site.
 */

import puppeteer from "puppeteer";
import { mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/screenshots");

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

  console.log("Launching browser...\n");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const site of SITES) {
    const outPath = resolve(OUT_DIR, `${site.name}.webp`);
    console.log(`📸 ${site.name} → ${site.url}`);

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      await page.goto(site.url, {
        waitUntil: "networkidle2",
        timeout: 20000,
      });

      // Wait extra for JS hydration & animations
      await new Promise((r) => setTimeout(r, 3000));

      await page.screenshot({
        path: outPath,
        type: "webp",
        quality: 85,
        clip: { x: 0, y: 0, width: 1280, height: 800 },
      });

      await page.close();
      console.log(`   ✅ Saved → ${outPath}\n`);
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message}\n`);
    }
  }

  await browser.close();
  console.log("Done! Screenshots saved to public/screenshots/");
}

main();
