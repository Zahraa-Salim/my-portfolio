import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const config = {
  maxDuration: 30, // allow up to 30s on Vercel (Pro) or 10s (Hobby)
};

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing ?url= parameter" });
  }

  // Basic validation
  let parsed;
  try {
    parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: null,
      executablePath: await chromium.executablePath(),
      headless: "new",
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Block heavy resources to speed up loading
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      // Block video, font, and media to speed up screenshot
      if (["media", "font"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 12000,
    });

    // Extra wait for JS animations/hydration
    await new Promise((r) => setTimeout(r, 2000));

    const screenshot = await page.screenshot({
      type: "webp",
      quality: 82,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });

    await browser.close();
    browser = null;

    // Cache for 7 days, stale-while-revalidate for 30 days
    res.setHeader("Content-Type", "image/webp");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=604800, stale-while-revalidate=2592000"
    );
    return res.send(screenshot);
  } catch (err) {
    console.error("Screenshot error:", err.message);
    return res.status(500).json({ error: "Failed to capture screenshot" });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}
