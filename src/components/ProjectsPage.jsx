import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  USERNAME,
  TOKEN,
  useGitHubRepos,
  fetchReadmeMd,
  techRowFrom,
  matchesTech,
  langColor,
  formatDate,
  IconBadge,
  SkeletonCard,
  ProjectCard,
  ModalScreenshot,
  cardVariants,
} from "./projectsData.jsx";

const PER_PAGE = 9;

// Candidate filters — only those matching at least one repo are shown.
const CURATED_TECHS = [
  "React", "Vue", "Next.js", "Flutter", "Laravel", "Node.js",
  "Express", "FastAPI", "TypeScript", "Firebase", "PostgreSQL",
];

export default function ProjectsPage() {
  const { repos, status, error } = useGitHubRepos();
  const location = useLocation();

  const [page, setPage] = useState(1);
  const [activeTech, setActiveTech] = useState("All");
  const [query, setQuery] = useState("");

  const [activeRepo, setActiveRepo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [readmeMd, setReadmeMd] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState("");

  // Force scroll to top on mount — bypass CSS smooth scrolling
  const mounted = useRef(false);
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // Safari fallback
      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = "";
      });
    }
  }, []);

  /* ── Dynamic filters: only techs that actually match a repo, with counts ── */
  const filterCounts = useMemo(() => {
    const counts = {};
    for (const tech of CURATED_TECHS) {
      counts[tech] = repos.filter((r) => matchesTech(r, tech)).length;
    }
    return counts;
  }, [repos]);

  const FILTERS = useMemo(
    () => ["All", ...CURATED_TECHS.filter((t) => filterCounts[t] > 0)],
    [filterCounts]
  );

  const filtered = useMemo(() => {
    const byTech = activeTech === "All" ? repos : repos.filter((r) => matchesTech(r, activeTech));
    const q = query.trim().toLowerCase();
    if (!q) return byTech;
    return byTech.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.topics || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [repos, activeTech, query]);

  // If the active filter disappears (repos changed), fall back to All
  useEffect(() => {
    if (!FILTERS.includes(activeTech)) setActiveTech("All");
  }, [FILTERS, activeTech]);

  // Reset page on filter or search change
  useEffect(() => {
    setPage(1);
  }, [activeTech, query]);

  // Scroll to top whenever page changes (after React renders the new cards)
  const isFirstRender = useRef(true);
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "";
    });
  }, [page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / PER_PAGE)),
    [filtered.length]
  );

  const visible = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    // Scroll to top AFTER React re-renders the new page
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = "";
      });
    }, 0);
  };

  /* ── Modal ── */
  const openProject = useCallback(async (repo) => {
    setActiveRepo(repo);
    setModalOpen(true);
    setReadmeLoading(true);
    setReadmeMd("");
    setReadmeError("");
    try {
      const md = await fetchReadmeMd(USERNAME, repo.name);
      setReadmeMd(md);
    } catch (e) {
      setReadmeError(e?.message || "README not available.");
      setReadmeMd("");
    } finally {
      setReadmeLoading(false);
    }
  }, []);

  const closeProject = useCallback(() => {
    setModalOpen(false);
    window.setTimeout(() => {
      setActiveRepo(null);
      setReadmeMd("");
      setReadmeError("");
      setReadmeLoading(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (!activeRepo) return;
    const onKey = (e) => { if (e.key === "Escape") closeProject(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeRepo, closeProject]);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("modal-open");
    };
  }, [modalOpen]);

  // Auto-open a project when arriving from a home card (navigate state)
  const autoOpened = useRef(false);
  useEffect(() => {
    if (autoOpened.current || status !== "success") return;
    const name = location.state?.openRepo;
    if (!name) return;
    const repo = repos.find((r) => r.name === name);
    if (repo) {
      autoOpened.current = true;
      openProject(repo);
    }
  }, [location.state, status, repos, openProject]);

  /* ═══════════════════════════ RENDER ═══════════════════════════ */

  return (
    <div className="relative min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16"
      >
        {/* Header */}
        <div className="flex items-end gap-4">
          <span className="brut-label text-sm font-bold text-primary">★</span>
          <div className="flex-1 h-px bg-ink/15" />
          <span className="brut-label text-sm font-bold text-muted">All Projects</span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-textmain uppercase tracking-tight leading-[0.95]">
              All <span className="text-primary">Projects</span>
            </h1>
            <p className="text-muted mt-4 max-w-2xl leading-relaxed">
              Browse all my projects with code links and demos when available.
            </p>
          </div>

          <a
            href={`https://github.com/${USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-sm font-bold brut-label text-textmain border-b-2 border-ink/30 hover:border-primary hover:text-primary transition pb-1"
          >
            View GitHub Profile →
          </a>
        </div>

        {/* Filter bar — underline tabs + search */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8"
          >
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/15 pb-1 flex-1">
              {FILTERS.map((tech) => {
                const count = tech === "All" ? repos.length : filterCounts[tech];
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setActiveTech(tech)}
                    className={`pb-2 text-xs font-bold brut-label border-b-2 -mb-[5px] transition-colors
                      ${activeTech === tech
                        ? "text-primary border-primary"
                        : "text-muted border-transparent hover:text-textmain"
                      }`}
                  >
                    {tech} <span className="opacity-50">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative sm:w-60 shrink-0">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                aria-label="Search projects"
                className="w-full bg-transparent border-0 border-b-2 border-ink/25 focus:border-primary focus:outline-none px-0 py-1 pr-6 text-sm font-semibold brut-label text-textmain placeholder:text-muted/60 placeholder:normal-case transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-0 bottom-1 text-muted hover:text-primary transition-colors text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="mt-10 border-l-[3px] border-primary pl-5">
            <p className="font-bold text-textmain">Projects couldn't load</p>
            <p className="text-sm text-muted mt-1">{error}</p>
            {!TOKEN && (
              <p className="text-sm text-muted mt-3">
                Tip: add <span className="text-textmain font-mono">VITE_GITHUB_TOKEN</span> in a{" "}
                <span className="text-textmain font-mono">.env</span> file to avoid rate limits.
              </p>
            )}
            <button type="button" onClick={() => window.location.reload()} className="mt-4 text-xs font-bold brut-label text-textmain border-b-2 border-ink/30 hover:border-primary hover:text-primary transition pb-0.5">
              Try Again →
            </button>
          </div>
        )}

        {/* Grid */}
        {status === "success" && (
          <>
            {visible.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 border-l-[3px] border-primary pl-5 py-2">
                <p className="text-muted text-lg">
                  No projects match your {query ? "search" : "filter"}
                  {query && (
                    <> "<span className="text-textmain font-bold">{query}</span>"</>
                  )}
                  {!query && activeTech !== "All" && (
                    <> "<span className="text-textmain font-bold">{activeTech}</span>"</>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => { setActiveTech("All"); setQuery(""); }}
                  className="mt-3 text-xs font-bold brut-label text-textmain border-b-2 border-ink/30 hover:border-primary hover:text-primary transition pb-0.5"
                >
                  Show All Projects →
                </button>
              </motion.div>
            ) : (
              <LayoutGroup>
                <motion.div layout className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {visible.map((repo, index) => (
                      <motion.article
                        key={repo.id}
                        layout
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="button"
                        tabIndex={0}
                        aria-label={`Open details for ${repo.name}`}
                        onClick={() => openProject(repo)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openProject(repo);
                          }
                        }}
                        className="cursor-pointer bg-surface overflow-hidden border border-ink/10
                          flex flex-col group transition hover:-translate-y-1
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                      >
                        <ProjectCard repo={repo} index={index} />
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </LayoutGroup>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-12 flex items-center justify-center gap-6"
              >
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="text-xs font-bold brut-label text-textmain border-b-2 border-ink/30 hover:border-primary hover:text-primary transition pb-0.5 disabled:opacity-30 disabled:hover:border-ink/30 disabled:hover:text-textmain"
                  aria-label="Previous page"
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToPage(i + 1)}
                      className={`h-[3px] transition-all ${
                        page === i + 1 ? "w-8 bg-primary" : "w-4 bg-ink/25 hover:bg-ink/50"
                      }`}
                      aria-label={`Page ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="text-xs font-bold brut-label text-textmain border-b-2 border-ink/30 hover:border-primary hover:text-primary transition pb-0.5 disabled:opacity-30 disabled:hover:border-ink/30 disabled:hover:text-textmain"
                  aria-label="Next page"
                >
                  Next →
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* ═══════════════════ MODAL ═══════════════════ */}
      {activeRepo && (
        <div
          className={`fixed inset-0 z-[10000] transition ${modalOpen ? "bg-ink/50" : "bg-ink/0"}`}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeProject(); }}
        >
          <div className="h-full w-full p-3 sm:p-4 flex items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-title"
              className={`w-full max-w-5xl border border-ink/15
                bg-bg shadow-2xl transition-all duration-200
                ${modalOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.98] translate-y-2"}
                flex flex-col h-[92vh] sm:h-[88vh]`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b-[3px] border-primary">
                <div className="min-w-0">
                  <p className="brut-label text-xs text-muted">Project</p>
                  <h3 id="project-title" className="text-lg sm:text-xl font-extrabold text-textmain truncate uppercase">
                    {activeRepo.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 brut-label text-[10px] font-bold text-muted">
                    {activeRepo.language && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: langColor(activeRepo.language) }} />
                        {activeRepo.language}
                      </span>
                    )}
                    {(activeRepo.stargazers_count || 0) > 0 && (
                      <span className="text-accent">★ {activeRepo.stargazers_count}</span>
                    )}
                    {activeRepo.updated_at && <span>Updated {formatDate(activeRepo.updated_at)}</span>}
                  </div>
                </div>
                <button type="button" onClick={closeProject} className="shrink-0 text-xs font-bold brut-label text-textmain border-b-2 border-ink/30 hover:border-primary hover:text-primary transition pb-0.5">
                  Close
                </button>
              </div>

              {/* Modal content — styled scrollbar */}
              <div className="flex-1 min-h-0 overflow-y-auto styled-scrollbar">
                <div className="px-5 sm:px-8 py-6">
                  <div className="max-w-[960px] mx-auto">
                    {/* Tech + Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {techRowFrom(
                          [],
                          activeRepo.language || "Code",
                          (activeRepo.topics || []).slice(0, 10)
                        ).map((t) => (
                          <IconBadge key={t} label={t} />
                        ))}
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <a href={activeRepo.html_url} target="_blank" rel="noreferrer" className="text-xs font-bold brut-label text-textmain border-b-2 border-transparent hover:border-primary hover:text-primary transition pb-0.5">
                          Code
                        </a>
                        {activeRepo.homepage?.trim() && (
                          <a href={activeRepo.homepage.trim()} target="_blank" rel="noreferrer" className="text-xs font-bold brut-label text-primary border-b-2 border-primary hover:border-transparent transition pb-0.5">
                            Live →
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Screenshot preview (reliable — no cross-origin iframe issues) */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="brut-label text-xs font-bold text-muted border-l-2 border-accent pl-2">Preview</p>
                        {activeRepo.homepage?.trim() && (
                          <a href={activeRepo.homepage.trim()} target="_blank" rel="noreferrer" className="brut-label text-xs font-bold text-textmain hover:text-primary transition">
                            Open live site →
                          </a>
                        )}
                      </div>
                      <div className="border border-ink/15 overflow-hidden bg-white h-[42vh] sm:h-[52vh]">
                        <ModalScreenshot
                          homepage={activeRepo.homepage}
                          repoName={activeRepo.name}
                          language={activeRepo.language || "Code"}
                          topics={activeRepo.topics || []}
                        />
                      </div>
                    </div>

                    {/* README */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="brut-label text-xs font-bold text-muted border-l-2 border-primary pl-2">README</p>
                        <a href={activeRepo.html_url} target="_blank" rel="noreferrer" className="brut-label text-xs font-bold text-textmain hover:text-primary transition">
                          Open on GitHub →
                        </a>
                      </div>

                      {readmeLoading ? (
                        <div className="border-l-[3px] border-primary pl-5 text-muted text-sm animate-pulse">
                          Loading README…
                        </div>
                      ) : readmeError ? (
                        <div className="border-l-[3px] border-primary pl-5 text-muted text-sm">
                          {readmeError}
                        </div>
                      ) : (
                        <div className="border-l-[3px] border-ink/15 pl-5 sm:pl-6">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            skipHtml
                            components={{
                              a: ({ node, ...props }) => (
                                <a className="text-primary font-semibold underline underline-offset-4 hover:opacity-80" target="_blank" rel="noreferrer" {...props} />
                              ),
                              h1: (p) => <h1 className="text-xl sm:text-2xl font-extrabold text-textmain mt-2 mb-3 uppercase" {...p} />,
                              h2: (p) => <h2 className="text-lg sm:text-xl font-bold text-textmain mt-6 mb-3" {...p} />,
                              h3: (p) => <h3 className="text-base sm:text-lg font-bold text-textmain mt-5 mb-2" {...p} />,
                              p: (p) => <p className="text-sm sm:text-[15px] text-muted leading-relaxed my-3" {...p} />,
                              ul: (p) => <ul className="list-disc pl-6 text-sm sm:text-[15px] text-muted my-3 space-y-1" {...p} />,
                              ol: (p) => <ol className="list-decimal pl-6 text-sm sm:text-[15px] text-muted my-3 space-y-1" {...p} />,
                              li: (p) => <li className="text-sm sm:text-[15px] text-muted leading-relaxed" {...p} />,
                              code: ({ inline, className, children, ...props }) =>
                                inline ? (
                                  <code className="px-1.5 py-0.5 bg-accent/10 text-textmain text-[12px] font-mono" {...props}>{children}</code>
                                ) : (
                                  <pre className="mt-3 mb-4 overflow-auto border-l-2 border-accent bg-surface p-3 text-[12px] text-textmain font-mono">
                                    <code className={className} {...props}>{children}</code>
                                  </pre>
                                ),
                              blockquote: (p) => <blockquote className="border-l-4 border-primary pl-4 my-4 text-muted italic" {...p} />,
                              img: ({ node, ...props }) => <img className="max-w-full h-auto my-3" {...props} />,
                              table: (p) => (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full text-sm text-muted border-collapse" {...p} />
                                </div>
                              ),
                              th: (p) => <th className="border-b-2 border-ink/20 px-3 py-2 text-left font-bold text-textmain" {...p} />,
                              td: (p) => <td className="border-b border-ink/10 px-3 py-2" {...p} />,
                              hr: () => <hr className="border-ink/15 my-6" />,
                            }}
                          >
                            {readmeMd}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
