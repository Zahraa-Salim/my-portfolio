/**
 * Pre-generate screenshots of all live project sites.
 *
 * Usage:
 *   node scripts/take-screenshots.mjs            # only repos missing a screenshot
 *   node scripts/take-screenshots.mjs --all      # regenerate every live repo
 *   node scripts/take-screenshots.mjs name1 name2  # specific repos only
 *
 * The site list is pulled from the GitHub API: every non-fork repo of
 * USERNAME that has a non-empty homepage URL. No hardcoded list to maintain —
 * set a homepage on the repo in GitHub, re-run this script, commit the image.
 *
 * Uses your locally installed Chrome — no extra download needed.
 * Output: public/screenshots/{repo-name}.webp
 */

import puppeteer from "puppeteer-core";
import { mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/screenshots");

const USERNAME = "Zahraa-Salim";
const HIDDEN_REPOS = ["my-portfolio"]; // keep in sync with src/components/projectsData.jsx

// Path to your local Chrome
const CHROME_PATH =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const args = process.argv.slice(2);
const REGEN_ALL = args.includes("--all");
const ONLY = args.filter((a) => !a.startsWith("--"));

async function fetchLiveSites() {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
  const res = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
  const repos = await res.json();
  return repos
    .filter((r) => !r.fork && !HIDDEN_REPOS.includes(r.name))
    .map((r) => ({ name: r.name, url: (r.homepage || "").trim() }))
    .filter((r) => r.url);
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const step = 400;
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const max = () => document.documentElement.scrollHeight - window.innerHeight;
    let y = 0;
    while (y < max()) {
      y = Math.min(y + step, max());
      window.scrollTo(0, y);
      await delay(120);
    }
    await delay(500);
    window.scrollTo(0, 0);
  });
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Fetching live repos for ${USERNAME}...`);
  let sites = await fetchLiveSites();

  if (ONLY.length) {
    sites = sites.filter((s) => ONLY.includes(s.name));
  } else if (!REGEN_ALL) {
    sites = sites.filter((s) => !existsSync(resolve(OUT_DIR, `${s.name}.webp`)));
  }

  if (!sites.length) {
    console.log("Nothing to do — every live repo already has a screenshot. Use --all to regenerate.");
    return;
  }
  console.log(`${sites.length} site(s) to capture: ${sites.map((s) => s.name).join(", ")}\n`);

  console.log("Launching Chrome...\n");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let failed = 0;
  for (const site of sites) {
    const outPath = resolve(OUT_DIR, `${site.name}.webp`);
    console.log(`📸 ${site.name} → ${site.url}`);

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      await page.goto(site.url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait extra for JS hydration & animations
      await new Promise((r) => setTimeout(r, 3000));

      // Scroll through the whole page so scroll-reveal animations fire and
      // lazy images load, then return to the top. Without this, fullPage
      // captures of animated sites come out with large blank stretches.
      await autoScroll(page);
      await new Promise((r) => setTimeout(r, 1500));

      await page.screenshot({
        path: outPath,
        type: "webp",
        quality: 82,
        fullPage: true, // capture the whole page so cards can "scroll" on hover
      });

      await page.close();
      console.log(`   ✅ Saved → ${outPath}\n`);
    } catch (err) {
      failed++;
      console.log(`   ❌ Failed: ${err.message}\n`);
    }
  }

  await browser.close();
  console.log(`Done! ${sites.length - failed}/${sites.length} saved to public/screenshots/`);
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
