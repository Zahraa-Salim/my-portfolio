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

/* ── Custom hook: fetch & clean repos ── */
export function useGitHubRepos() {
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("loading");
        setError("");
        const data = await fetchAllRepos(USERNAME);
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
        const cleaned = [...pinned, ...rest];
        if (!cancelled) {
          setRepos(cleaned);
          setStatus("success");
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setError(e?.message || "Failed to load projects.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { repos, status, error };
}

/* ───────────────────────── Small UI pieces ───────────────────────── */

export function IconBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-bg/70 px-3 py-1.5 text-xs text-textmain">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold text-textmain">
        {label?.[0]?.toUpperCase() || "•"}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

/* ───────────── Tech-styled placeholder (no live URL) ───────────── */

export function TechPlaceholder({ language, topics = [] }) {
  const techs = [language, ...topics].filter(Boolean).slice(0, 3);
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-primary/20 via-surface/60 to-primary/10 flex flex-col items-center justify-center gap-3 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(var(--textmain)) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <svg
        className="relative w-8 h-8 text-primary/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
      <div className="relative flex flex-wrap justify-center gap-2 px-4">
        {techs.map((t) => (
          <span
            key={t}
            className="rounded-full border border-primary/25 bg-bg/60 px-3 py-1 text-xs font-medium text-textmain/80"
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

      {/* Static screenshot image */}
      {status !== "failed" && (
        <img
          src={screenshotSrc}
          alt={`${repoName} preview`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-top z-0 transition-opacity duration-500 ${
            status === "ready" ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("failed")}
        />
      )}

      {/* Subtle gradient at bottom */}
      {status === "ready" && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-bg/60 to-transparent pointer-events-none z-20" />
      )}
    </div>
  );
}

/* ───────────────────── Loading skeleton card ───────────────────── */

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-primary/15 bg-bg/60 overflow-hidden animate-pulse">
      <div className="h-[180px] bg-primary/8" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-2/3 rounded bg-primary/10" />
          <div className="h-4 w-16 rounded bg-primary/10" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-primary/10" />
          <div className="h-3 w-5/6 rounded bg-primary/10" />
        </div>
        <div className="flex justify-between pt-2">
          <div className="h-7 w-20 rounded-full bg-primary/10" />
          <div className="h-8 w-16 rounded-xl bg-primary/10" />
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
        <div className="absolute inset-0 flex items-center justify-center bg-surface/30">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-xs text-muted">Loading preview…</span>
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
  const techTags = techRowFrom([], null, (repo.topics || []).slice(0, 4));

  return (
    <>
      {/* Preview area */}
      <div className="h-[180px] overflow-hidden rounded-t-2xl border-b border-primary/10">
        <CardPreview homepage={homepage} repoName={repo.name} language={language} topics={repo.topics} />
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-textmain leading-snug line-clamp-1">
            {title}
          </h3>
          <span className="text-xs text-muted whitespace-nowrap">{updated}</span>
        </div>

        <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-2 mb-3">{desc}</p>

        {techTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {techTags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-primary/20 bg-bg/80 px-2.5 py-1 text-[11px] text-textmain"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-textmain">
            {language}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-bg/80 px-3 py-2 text-sm text-textmain hover:bg-primary/10 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-textmain" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 .5C5.73.5.75 5.6.75 12c0 5.13 3.29 9.48 7.86 11.02.58.11.79-.26.79-.57v-2.1c-3.2.71-3.88-1.4-3.88-1.4-.52-1.37-1.27-1.73-1.27-1.73-1.04-.74.08-.73.08-.73 1.15.08 1.76 1.22 1.76 1.22 1.02 1.78 2.68 1.26 3.33.96.1-.76.4-1.26.72-1.55-2.55-.3-5.23-1.3-5.23-5.78 0-1.28.45-2.33 1.18-3.15-.12-.3-.51-1.52.11-3.18 0 0 .97-.32 3.18 1.2a10.6 10.6 0 0 1 2.9-.4c.98 0 1.97.14 2.9.4 2.2-1.52 3.17-1.2 3.17-1.2.63 1.66.24 2.88.12 3.18.73.82 1.18 1.87 1.18 3.15 0 4.49-2.69 5.48-5.25 5.77.41.37.77 1.1.77 2.22v3.28c0 .32.2.69.8.57A11.29 11.29 0 0 0 23.25 12C23.25 5.6 18.27.5 12 .5Z"
                />
              </svg>
              Code
            </a>
            {homepage && (
              <a
                href={homepage}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md hover:opacity-90 transition"
              >
                Live
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
