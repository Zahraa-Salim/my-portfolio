import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  USERNAME,
  TOKEN,
  useGitHubRepos,
  fetchReadmeMd,
  techRowFrom,
  IconBadge,
  SkeletonCard,
  ProjectCard,
  ModalIframePreview,
  cardVariants,
} from "./projectsData.jsx";

const PER_PAGE = 9;

export default function ProjectsPage() {
  const { repos, status, error } = useGitHubRepos();

  const [page, setPage] = useState(1);
  const [activeTech, setActiveTech] = useState("All");

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

  /* ── Static filter labels — matching searches all topics + language ── */
  const FILTERS = ["All", "React", "Vue", "Flutter", "Laravel", "Next.js", "FastAPI", "Express"];

  const filtered = useMemo(() => {
    if (activeTech === "All") return repos;
    const key = activeTech.toLowerCase().replace(".js", "").replace(".", "");
    return repos.filter((r) => {
      // Match against language
      if (r.language?.toLowerCase().replace(".js", "").replace(".", "") === key) return true;
      // Match against ALL topics (not just first)
      if ((r.topics || []).some((t) => t.toLowerCase().replace("-", "").replace(".", "") === key)) return true;
      // Also match common variants (e.g. "nextjs" for "Next.js", "fastapi" for "FastAPI")
      const nameCheck = r.name?.toLowerCase() || "";
      if (nameCheck.includes(key)) return true;
      return false;
    });
  }, [repos, activeTech]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [activeTech]);

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
    // Bypass CSS scroll-behavior:smooth — jump instantly to top
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      html.style.scrollBehavior = prev;
    });
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

  /* ═══════════════════════════ RENDER ═══════════════════════════ */

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-bg via-bg to-primary/10">
      {/* blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-28 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-sm text-muted">Projects</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-textmain mt-2">
              All Projects
            </h1>
            <p className="text-muted mt-3 max-w-2xl leading-relaxed">
              Browse all my projects with code links and demos when available.
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mt-4" />
          </div>

          <a
            href={`https://github.com/${USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-primary/20 bg-bg/70 backdrop-blur-sm px-5 py-3 text-sm font-medium text-textmain hover:bg-primary/10 transition active:scale-[0.98]"
          >
            View GitHub profile
          </a>
        </div>

        {/* Filter bar */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {FILTERS.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => setActiveTech(tech)}
                className={`rounded-full px-4 py-2 text-sm font-medium border transition-all duration-200
                  ${activeTech === tech
                    ? "bg-primary text-white border-primary shadow-sm scale-[1.03]"
                    : "border-primary/20 bg-bg/70 text-textmain hover:bg-primary/10 hover:border-primary/30"
                  }`}
              >
                {tech}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="mt-10 rounded-2xl border border-primary/20 bg-bg/75 backdrop-blur-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="font-semibold text-textmain">Projects couldn't load</p>
            <p className="text-sm text-muted mt-1">{error}</p>
            {!TOKEN && (
              <p className="text-sm text-muted mt-3">
                Tip: add <span className="text-textmain font-mono">VITE_GITHUB_TOKEN</span> in a{" "}
                <span className="text-textmain font-mono">.env</span> file to avoid rate limits.
              </p>
            )}
            <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl border border-primary/20 bg-bg/70 px-5 py-2.5 text-sm text-textmain hover:bg-primary/10 transition">
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        {status === "success" && (
          <>
            {visible.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 text-center py-12">
                <p className="text-muted text-lg">
                  No projects match "<span className="text-textmain font-medium">{activeTech}</span>"
                </p>
                <button type="button" onClick={() => setActiveTech("All")} className="mt-4 rounded-xl border border-primary/20 bg-bg/70 px-5 py-2.5 text-sm text-textmain hover:bg-primary/10 transition">
                  Show all projects
                </button>
              </motion.div>
            ) : (
              <LayoutGroup>
                <motion.div layout className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        onClick={() => openProject(repo)}
                        className="cursor-pointer rounded-2xl border border-primary/20 bg-bg/75 backdrop-blur-sm overflow-hidden
                          flex flex-col group
                          hover:border-primary/40 hover:shadow-[0_4px_24px_-4px_rgba(161,188,152,0.25)]
                          transition-[border-color,box-shadow] duration-300"
                      >
                        <ProjectCard repo={repo} index={index} />
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </LayoutGroup>
            )}

            {/* Arrow Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-10 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full border border-primary/20 bg-bg/70 backdrop-blur-sm flex items-center justify-center text-textmain disabled:opacity-30 hover:bg-primary/10 transition active:scale-95"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToPage(i + 1)}
                      className={`rounded-full transition-all duration-200 ${
                        page === i + 1
                          ? "w-8 h-3 bg-primary"
                          : "w-3 h-3 bg-primary/25 hover:bg-primary/40"
                      }`}
                      aria-label={`Page ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full border border-primary/20 bg-bg/70 backdrop-blur-sm flex items-center justify-center text-textmain disabled:opacity-30 hover:bg-primary/10 transition active:scale-95"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* ═══════════════════ MODAL ═══════════════════ */}
      {activeRepo && (
        <div
          className={`fixed inset-0 z-[10000] transition ${modalOpen ? "bg-black/40" : "bg-black/0"}`}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeProject(); }}
        >
          <div className="h-full w-full p-3 sm:p-4 flex items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-title"
              className={`w-full max-w-5xl rounded-3xl border border-primary/20
                bg-bg/90 backdrop-blur-md shadow-xl transition-all duration-200
                ${modalOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.98] translate-y-2"}
                flex flex-col h-[92vh] sm:h-[88vh]`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

              {/* Header */}
              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-primary/15">
                <div className="min-w-0">
                  <p className="text-xs text-muted">Project</p>
                  <h3 id="project-title" className="text-lg sm:text-xl font-semibold text-textmain truncate">
                    {activeRepo.name}
                  </h3>
                </div>
                <button type="button" onClick={closeProject} className="rounded-xl border border-primary/20 bg-bg/80 px-4 py-2 text-sm font-medium text-textmain hover:bg-primary/10 transition">
                  Close
                </button>
              </div>

              {/* Modal content — styled scrollbar */}
              <div className="flex-1 min-h-0 overflow-y-auto styled-scrollbar">
                <div className="px-5 sm:px-8 py-6">
                  <div className="max-w-[960px] mx-auto">
                    {/* Tech + Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {techRowFrom(
                          [],
                          activeRepo.language || "Code",
                          (activeRepo.topics || []).slice(0, 10)
                        ).map((t) => (
                          <IconBadge key={t} label={t} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={activeRepo.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-bg/80 px-3 py-2 text-sm text-textmain hover:bg-primary/10 transition">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 text-textmain" aria-hidden="true">
                            <path fill="currentColor" d="M12 .5C5.73.5.75 5.6.75 12c0 5.13 3.29 9.48 7.86 11.02.58.11.79-.26.79-.57v-2.1c-3.2.71-3.88-1.4-3.88-1.4-.52-1.37-1.27-1.73-1.27-1.73-1.04-.74.08-.73.08-.73 1.15.08 1.76 1.22 1.76 1.22 1.02 1.78 2.68 1.26 3.33.96.1-.76.4-1.26.72-1.55-2.55-.3-5.23-1.3-5.23-5.78 0-1.28.45-2.33 1.18-3.15-.12-.3-.51-1.52.11-3.18 0 0 .97-.32 3.18 1.2a10.6 10.6 0 0 1 2.9-.4c.98 0 1.97.14 2.9.4 2.2-1.52 3.17-1.2 3.17-1.2.63 1.66.24 2.88.12 3.18.73.82 1.18 1.87 1.18 3.15 0 4.49-2.69 5.48-5.25 5.77.41.37.77 1.1.77 2.22v3.28c0 .32.2.69.8.57A11.29 11.29 0 0 0 23.25 12C23.25 5.6 18.27.5 12 .5Z" />
                          </svg>
                          Code
                        </a>
                        {activeRepo.homepage?.trim() && (
                          <a href={activeRepo.homepage.trim()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md hover:opacity-90 transition">
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

                    {/* Live iframe preview */}
                    {activeRepo.homepage?.trim() && (
                      <div className="mt-5">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="text-sm text-muted">Live Preview</p>
                          <a href={activeRepo.homepage.trim()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-textmain hover:opacity-80">
                            Open in new tab
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </div>
                        <div className="rounded-2xl border border-primary/20 overflow-hidden bg-white h-[50vh] sm:h-[55vh]">
                          <ModalIframePreview url={activeRepo.homepage.trim()} />
                        </div>
                      </div>
                    )}

                    {/* README */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-sm text-muted">README</p>
                        <a href={activeRepo.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-textmain hover:opacity-80">
                          Open on GitHub
                        </a>
                      </div>

                      {readmeLoading ? (
                        <div className="rounded-2xl border border-primary/20 bg-bg/70 p-4 text-muted text-sm animate-pulse">
                          Loading README…
                        </div>
                      ) : readmeError ? (
                        <div className="rounded-2xl border border-primary/20 bg-bg/70 p-4 text-muted text-sm">
                          {readmeError}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-primary/20 bg-bg/70 p-5">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            skipHtml
                            components={{
                              a: ({ node, ...props }) => (
                                <a className="text-textmain underline underline-offset-4 hover:opacity-80" target="_blank" rel="noreferrer" {...props} />
                              ),
                              h1: (p) => <h1 className="text-xl sm:text-2xl font-bold text-textmain mt-2 mb-3" {...p} />,
                              h2: (p) => <h2 className="text-lg sm:text-xl font-semibold text-textmain mt-6 mb-3" {...p} />,
                              h3: (p) => <h3 className="text-base sm:text-lg font-semibold text-textmain mt-5 mb-2" {...p} />,
                              p: (p) => <p className="text-sm sm:text-[15px] text-muted leading-relaxed my-3" {...p} />,
                              ul: (p) => <ul className="list-disc pl-6 text-sm sm:text-[15px] text-muted my-3 space-y-1" {...p} />,
                              ol: (p) => <ol className="list-decimal pl-6 text-sm sm:text-[15px] text-muted my-3 space-y-1" {...p} />,
                              li: (p) => <li className="text-sm sm:text-[15px] text-muted leading-relaxed" {...p} />,
                              code: ({ inline, className, children, ...props }) =>
                                inline ? (
                                  <code className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/15 text-textmain text-[12px]" {...props}>{children}</code>
                                ) : (
                                  <pre className="mt-3 mb-4 overflow-auto rounded-xl border border-primary/15 bg-primary/5 p-3 text-[12px] text-textmain">
                                    <code className={className} {...props}>{children}</code>
                                  </pre>
                                ),
                              blockquote: (p) => <blockquote className="border-l-4 border-primary/30 pl-4 my-4 text-muted italic" {...p} />,
                              img: ({ node, ...props }) => <img className="max-w-full h-auto rounded-lg my-3" {...props} />,
                              table: (p) => (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full text-sm text-muted border-collapse" {...p} />
                                </div>
                              ),
                              th: (p) => <th className="border border-primary/15 px-3 py-2 bg-primary/5 text-left font-semibold text-textmain" {...p} />,
                              td: (p) => <td className="border border-primary/15 px-3 py-2" {...p} />,
                              hr: () => <hr className="border-primary/20 my-6" />,
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
