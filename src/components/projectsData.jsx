/* ═══════════════════════════════════════════════════════════════════
   Shared GitHub helpers, constants, and UI pieces for Projects
   Used by both ProjectsPreview (home) and ProjectsPage (/projects)
   ═══════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";

/* ───────────────────────── Constants ───────────────────────── */

export const USERNAME = "Zahraa-Salim";
export const HIDDEN_REPOS = ["my-portfolio"];

// Pinned repos in display order — these appear first
export const PINNED_REPOS = ["DigitalHub", "AurumRealty", "TalentLoop", "flower-shop", "checkout-flow"];

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const ghHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

export { TOKEN };

/* ───────────────────────── Fetch helpers ───────────────────────── */

export async function fetchAllRepos(username) {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers: ghHeaders }
  );
  if (!res.ok) {
    let details = "";
    try {
      const json = await res.json();
      details = json?.message ? ` — ${json.message}` : "";
    } catch {}
    throw new Error(`GitHub API error: ${res.status}${details}`);
  }
  return res.json();
}

// Fetch README as raw markdown via download_url (most reliable)
export async function fetchReadmeMd(username, repoName) {
  // Step 1: get the readme metadata to find download_url
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repoName}/readme`,
    { headers: ghHeaders }
  );
  if (!res.ok) throw new Error("README not available for this project.");
  const data = await res.json();

  // Step 2: fetch the raw markdown directly via download_url
  if (data.download_url) {
    const raw = await fetch(data.download_url);
    if (raw.ok) {
      const text = await raw.text();
      if (text) return text;
    }
  }

  // Step 3: fallback to base64 decode if download_url failed
  if (data.content) {
    try {
      const base64 = data.content.replace(/\s/g, "");
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const decoded = new TextDecoder("utf-8").decode(bytes);
      if (decoded) return decoded;
    } catch {
      // base64 decode failed, continue to error
    }
  }

  return "README is empty.";
}

/* ───────────────────────── Utilities ───────────────────────── */

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

export function techRowFrom(metaTags = [], language, topics = []) {
  const arr = [...metaTags, ...topics, language].filter(Boolean);
  const seen = new Set();
  return arr.filter((x) => {
    const k = String(x).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Normalize a tech label for matching ("Next.js" → "next", "FastAPI" → "fastapi")
export const normTech = (s) =>
  String(s || "").toLowerCase().replace(/\.js$/, "").replace(/[.\-\s]/g, "");

// Does a repo match a filter tech? Checks language, topics, and name.
export function matchesTech(repo, tech) {
  if (!tech || tech === "All") return true;
  const key = normTech(tech);
  if (repo.language && normTech(repo.language) === key) return true;
  if ((repo.topics || []).some((t) => normTech(t).includes(key))) return true;
  if ((repo.name || "").toLowerCase().includes(key)) return true;
  return false;
}

// GitHub-style language colors for the little dot next to a repo's language.
export const LANG_COLORS = {
  javascript: "#f1e05a",
  typescript: "#3178c6",
  dart: "#00b4ab",
  php: "#4f5d95",
  vue: "#41b883",
  html: "#e34c26",
  css: "#563d7c",
  scss: "#c6538c",
  python: "#3572a5",
  java: "#b07219",
  "c++": "#f34b7d",
  "c#": "#178600",
  ruby: "#701516",
  go: "#00add8",
  rust: "#dea584",
  shell: "#89e051",
  kotlin: "#a97bff",
  swift: "#f05138",
};
export const langColor = (language) =>
  LANG_COLORS[String(language || "").toLowerCase()] || "rgb(var(--accent))";

/* ── Shared repo cache ──
   The repo list is fetched once and shared across every consumer
   (home teaser + /projects). Avoids duplicate requests and helps stay
   under GitHub's 60-req/hour unauthenticated limit.
   - reposMemoryCache: instant, lives for the tab's lifetime
   - reposPromise: dedupes concurrent in-flight fetches
   - sessionStorage: survives reloads within a short TTL              */
const REPOS_CACHE_KEY = "gh-repos-cache";
const REPOS_TTL = 10 * 60 * 1000; // 10 minutes
let reposMemoryCache = null;
let reposPromise = null;

function readSessionCache() {
  try {
    const raw = sessionStorage.getItem(REPOS_CACHE_KEY);
    if (!raw) return null;
    const { ts, repos } = JSON.parse(raw);
    if (!ts || Date.now() - ts > REPOS_TTL) return null;
    return Array.isArray(repos) ? repos : null;
  } catch {
    return null;
  }
}

function writeSessionCache(repos) {
  try {
    sessionStorage.setItem(REPOS_CACHE_KEY, JSON.stringify({ ts: Date.now(), repos }));
  } catch {
    /* storage unavailable / quota — ignore */
  }
}

function cleanRepos(data) {
  const all = data
    .filter((r) => !r.fork)
    .filter((r) => !HIDDEN_REPOS.includes(r.name));

  // Pinned repos first (in defined order), then the rest by stars/date
  const byName = new Map(all.map((r) => [r.name, r]));
  const pinned = PINNED_REPOS.map((n) => byName.get(n)).filter(Boolean);
  const pinnedSet = new Set(PINNED_REPOS);
  const rest = all
    .filter((r) => !pinnedSet.has(r.name))
    .sort((a, b) => {
      const starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (starDiff !== 0) return starDiff;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
  return [...pinned, ...rest];
}

function loadRepos() {
  if (reposMemoryCache) return Promise.resolve(reposMemoryCache);
  const cached = readSessionCache();
  if (cached) {
    reposMemoryCache = cached;
    return Promise.resolve(cached);
  }
  if (!reposPromise) {
    reposPromise = (async () => {
      const data = await fetchAllRepos(USERNAME);
      const cleaned = cleanRepos(data);
      reposMemoryCache = cleaned;
      writeSessionCache(cleaned);
      return cleaned;
    })().catch((e) => {
      reposPromise = null; // allow a retry after failure
      throw e;
    });
  }
  return reposPromise;
}

/* ── Custom hook: fetch & clean repos (cached/shared) ── */
export function useGitHubRepos() {
  const [repos, setRepos] = useState(() => reposMemoryCache || []);
  const [status, setStatus] = useState(() => (reposMemoryCache ? "success" : "idle"));
  const [error, setError] = useState("");

  useEffect(() => {
    if (reposMemoryCache) {
      setRepos(reposMemoryCache);
      setStatus("success");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setError("");
    loadRepos()
      .then((r) => {
        if (!cancelled) {
          setRepos(r);
          setStatus("success");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setStatus("error");
          setError(e?.message || "Failed to load projects.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { repos, status, error };
}

/* ───────────────────────── Small UI pieces ───────────────────────── */

export function IconBadge({ label }) {
  return (
    <span className="inline-flex items-center text-[11px] font-semibold brut-label text-textmain border-l-2 border-primary pl-2">
      {label}
    </span>
  );
}

/* ───────────── Tech-styled placeholder (no live URL) ───────────── */

export function TechPlaceholder({ language, topics = [] }) {
  const techs = [language, ...topics].filter(Boolean).slice(0, 3);
  return (
    <div className="relative h-full w-full bg-accent flex flex-col items-center justify-center gap-3 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgb(var(--ink)) 0, rgb(var(--ink)) 2px, transparent 2px, transparent 12px)",
        }}
      />
      <span className="relative brut-label text-white/90 text-xs font-bold tracking-widest">&lt;/&gt;</span>
      <div className="relative flex flex-wrap justify-center gap-x-4 gap-y-1 px-4">
        {techs.map((t) => (
          <span
            key={t}
            className="text-xs font-semibold brut-label text-white"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────────── Card preview via pre-generated static screenshots ────────────── */

// Screenshots are stored in /public/screenshots/{repo-name}.webp
// Generated locally via: node scripts/take-screenshots.mjs
export function CardPreview({ homepage, repoName, language, topics }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "failed"
  const url = homepage?.trim();

  if (!url) {
    return <TechPlaceholder language={language} topics={topics} />;
  }

  const screenshotSrc = `/screenshots/${repoName}.webp`;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* TechPlaceholder shown while loading / on error */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-500 ${
          status === "ready" ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <TechPlaceholder language={language} topics={topics} />
      </div>

      {/* Screenshot image — pans top→bottom on hover, like scrolling the live site.
          On hover-out it snaps back to the top (transition only applies on hover). */}
      {status !== "failed" && (
        <img
          src={screenshotSrc}
          alt={`${repoName} preview`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-[50%_0%] z-0
            transition-opacity duration-500
            group-hover:object-[50%_100%] group-hover:transition-[object-position] group-hover:duration-[8000ms] group-hover:ease-linear ${
            status === "ready" ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("failed")}
        />
      )}

      {/* "Live" hover hint */}
      {status === "ready" && (
        <span className="pointer-events-none absolute top-2 right-2 z-20 brut-label text-[9px] font-bold text-white bg-primary px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ● live
        </span>
      )}
    </div>
  );
}

/* ────────── Larger screenshot preview for the detail modal ────────── */

export function ModalScreenshot({ homepage, repoName, language, topics }) {
  const [failed, setFailed] = useState(false);
  const url = homepage?.trim();
  const src = `/screenshots/${repoName}.webp`;

  const inner = failed ? (
    <TechPlaceholder language={language} topics={topics} />
  ) : (
    <img
      src={src}
      alt={`${repoName} preview`}
      loading="lazy"
      className="w-full h-full object-cover object-[50%_0%]
        group-hover/shot:object-[50%_100%] group-hover/shot:transition-[object-position] group-hover/shot:duration-[8000ms] group-hover/shot:ease-linear"
      onError={() => setFailed(true)}
    />
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title="Open live site"
        className="group/shot relative block h-full w-full"
      >
        {inner}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 group-hover/shot:bg-ink/30 transition-colors">
          <span className="opacity-0 group-hover/shot:opacity-100 transition-opacity bg-primary text-white brut-label text-xs font-bold px-4 py-2">
            Open live site →
          </span>
        </span>
      </a>
    );
  }
  return inner;
}

/* ───────────────────── Loading skeleton card ───────────────────── */

export function SkeletonCard() {
  return (
    <div className="border border-ink/10 bg-surface overflow-hidden animate-pulse">
      <div className="h-[180px] bg-ink/10 border-b border-ink/10" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-2/3 bg-ink/10" />
          <div className="h-4 w-16 bg-ink/10" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-ink/10" />
          <div className="h-3 w-5/6 bg-ink/10" />
        </div>
        <div className="flex justify-between pt-2">
          <div className="h-7 w-20 bg-ink/10" />
          <div className="h-8 w-16 bg-ink/10" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── framer-motion card variants ─────────────────── */

export const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.25 },
  },
};

/* ───────────── Modal iframe with auto-scroll ───────────── */

export function ModalIframePreview({ url }) {
  const iframeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const id = setInterval(() => {
      try {
        iframe.contentWindow?.scrollBy({ top: 1, behavior: "auto" });
      } catch {
        clearInterval(id);
      }
    }, 40);

    return () => clearInterval(id);
  }, [loaded]);

  return (
    <div className="relative w-full h-full overflow-hidden styled-scrollbar">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-[3px] border-ink border-t-primary rounded-full animate-spin" />
            <span className="brut-label text-xs text-muted">Loading preview…</span>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        title="Live preview"
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-none styled-scrollbar"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

/* ───────────── Shared Project Card ───────────── */

export function ProjectCard({ repo, index, onOpen }) {
  const title = repo.name;
  const desc =
    repo.description ||
    "Add a short description in GitHub to strengthen this card.";
  const updated = formatDate(repo.updated_at);
  const homepage = repo.homepage?.trim();
  const language = repo.language || "Code";
  const stars = repo.stargazers_count || 0;
  const techTags = techRowFrom([], null, (repo.topics || []).slice(0, 4));

  return (
    <>
      {/* Preview area */}
      <div className="h-[180px] overflow-hidden border-b border-ink/10">
        <CardPreview homepage={homepage} repoName={repo.name} language={language} topics={repo.topics} />
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-textmain leading-snug line-clamp-1 uppercase group-hover:text-primary transition-colors">
            {title}
          </h3>
          <span className="brut-label text-[10px] text-muted whitespace-nowrap flex items-center gap-2">
            {stars > 0 && <span className="text-accent">★ {stars}</span>}
            {updated}
          </span>
        </div>

        <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-2 mb-3">{desc}</p>

        {techTags.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
            {techTags.map((t) => (
              <span
                key={t}
                className="text-[11px] font-semibold brut-label text-textmain border-b border-ink/15"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Click affordance — the whole card opens the detail modal */}
        <span className="mb-3 block text-[10px] brut-label font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          View details →
        </span>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-ink/10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold brut-label text-textmain">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: langColor(language) }} />
            {language}
          </span>
          <div className="flex items-center gap-5">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold brut-label text-textmain border-b-2 border-transparent hover:border-primary hover:text-primary transition pb-0.5"
            >
              Code
            </a>
            {homepage && (
              <a
                href={homepage}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold brut-label text-primary border-b-2 border-primary hover:border-transparent transition pb-0.5"
              >
                Live →
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
