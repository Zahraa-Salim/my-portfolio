import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const ghHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

// GitHub API: list repos
async function fetchAllRepos(username) {
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

// GitHub API: README content (decoded from base64 to UTF-8)
async function fetchReadmeMd(username, repoName) {
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repoName}/readme`,
    { headers: ghHeaders }
  );

  if (!res.ok) throw new Error("README not available for this project.");

  const data = await res.json();
  const base64 = (data.content || "").replace(/\s/g, "");
  if (!base64) return "README is empty.";

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return new TextDecoder("utf-8").decode(bytes) || "README is empty.";
}

function IconBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-bg/70 px-3 py-1.5 text-xs text-textmain">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold text-textmain">
        {label?.[0]?.toUpperCase() || "•"}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

function techRowFrom(metaTags = [], language, topics = []) {
  const arr = [...metaTags, ...topics, language].filter(Boolean);
  const seen = new Set();
  return arr.filter((x) => {
    const k = String(x).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export default function Projects() {
  const username = "Zahraa-Salim";

  const projectMeta = useMemo(() => ({}), []);
  const featured = useMemo(() => [], []);

  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const [expanded, setExpanded] = useState(false);
  const perPage = 12;
  const [page, setPage] = useState(1);

  const [activeRepo, setActiveRepo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [readmeMd, setReadmeMd] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState("");

  // Fade-in once on scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Fetch GitHub repos once
  useEffect(() => {
    if (!username) return;
    let cancelled = false;

    (async () => {
      try {
        setStatus("loading");
        setError("");

        const data = await fetchAllRepos(username);

        const cleaned = data
          .filter((r) => !r.fork)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

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

    return () => {
      cancelled = true;
    };
  }, [username]);

  const ordered = useMemo(() => {
    if (!repos.length) return [];
    const byName = new Map(repos.map((r) => [r.name, r]));
    const featuredRepos = featured.map((n) => byName.get(n)).filter(Boolean);
    const remaining = repos.filter((r) => !featured.includes(r.name));
    return [...featuredRepos, ...remaining];
  }, [repos, featured]);

  const totalPages = useMemo(() => {
    if (!expanded) return 1;
    return Math.max(1, Math.ceil(ordered.length / perPage));
  }, [expanded, ordered.length]);

  const visible = useMemo(() => {
    if (!ordered.length) return [];
    if (!expanded) return ordered.slice(0, 6);
    const start = (page - 1) * perPage;
    return ordered.slice(start, start + perPage);
  }, [ordered, expanded, page]);

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
  };

  // Open modal + load README
  const openProject = async (repo) => {
    setActiveRepo(repo);
    setModalOpen(true);

    setReadmeLoading(true);
    setReadmeMd("");
    setReadmeError("");

    try {
      const md = await fetchReadmeMd(username, repo.name);
      setReadmeMd(md);
    } catch (e) {
      setReadmeError(e?.message || "README not available.");
      setReadmeMd("");
    } finally {
      setReadmeLoading(false);
    }
  };

  // Close modal (delay to let animation finish)
  const closeProject = () => {
    setModalOpen(false);
    window.setTimeout(() => {
      setActiveRepo(null);
      setReadmeMd("");
      setReadmeError("");
      setReadmeLoading(false);
    }, 200);
  };

  // ESC closes modal
  useEffect(() => {
    if (!activeRepo) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRepo]);

  // Lock background scroll + hide navbar while modal open
  useEffect(() => {
    if (!modalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove("modal-open");
    };
  }, [modalOpen]);

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-gradient-to-b from-bg via-bg to-primary/10"
    >
      {/* soft blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-28 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div
        ref={sectionRef}
        className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-16 transition-all duration-700 ease-out
          ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-sm text-muted">Projects</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-textmain mt-2">
              Work from GitHub
            </h2>
            <p className="text-muted mt-3 max-w-2xl leading-relaxed">
              A selection of my projects with code links and demos when available.
              I’m continuously improving UI polish, structure, and usability.
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mt-4" />
          </div>

          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-primary/20 bg-bg/70 backdrop-blur-sm px-5 py-3 text-sm font-medium text-textmain hover:bg-primary/10 transition active:scale-[0.98]"
          >
            View GitHub profile
          </a>
        </div>

        {status === "loading" && <p className="mt-10 text-muted">Loading projects…</p>}

        {status === "error" && (
          <div className="mt-10 rounded-2xl border border-primary/20 bg-bg/75 backdrop-blur-sm p-5 text-textmain">
            <p className="font-semibold">Projects couldn’t load.</p>
            <p className="text-sm text-muted mt-1">{error}</p>

            {!TOKEN && (
              <p className="text-sm text-muted mt-3">
                Tip: add <span className="text-textmain">VITE_GITHUB_TOKEN</span>{" "}
                in a <span className="text-textmain">.env</span> file to avoid rate limits.
              </p>
            )}
          </div>
        )}

        {status === "success" && (
          <>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((repo) => {
                const meta = projectMeta[repo.name] || {};
                const title = meta.title || repo.name;

                const desc =
                  meta.description ||
                  repo.description ||
                  "Add a short description in GitHub or in projectMeta to strengthen this card.";

                const updated = formatDate(repo.updated_at);
                const homepage = repo.homepage?.trim();
                const language = repo.language || "Code";

                return (
                  <article
                    key={repo.id}
                    onClick={() => openProject(repo)}
                    className="
                      cursor-pointer rounded-2xl border border-primary/20 bg-bg/75 backdrop-blur-sm overflow-hidden
                      transition duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-primary/10
                      flex flex-col
                    "
                  >
                    <div className="h-1 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />

                    <div className="p-5 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-textmain leading-snug line-clamp-1">
                          {title}
                        </h3>
                        <span className="text-xs text-muted whitespace-nowrap">Updated {updated}</span>
                      </div>

                      {/* ✅ 3 lines + a bit more space after */}
                      <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-3 mb-4">
                        {desc}
                      </p>

                      {/* tags (optional) */}
                      {!!(meta.tags || []).length && (
                        <div className="mt-0 flex flex-wrap gap-2">
                          {(meta.tags || []).slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-primary/20 bg-bg/80 px-3 py-1.5 text-xs text-textmain"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ✅ Bottom row: Language on the same line as actions */}
                      <div className="mt-3 flex items-center justify-between gap-3">
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
                              className="rounded-xl bg-primary px-3 py-2 text-sm text-white hover:opacity-90 transition"
                            >
                              Live
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              {!expanded ? (
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(true);
                    setPage(1);
                  }}
                  className="rounded-xl border border-primary/20 bg-bg/70 backdrop-blur-sm px-6 py-3 text-sm font-medium text-textmain hover:bg-primary/10 transition active:scale-[0.98]"
                >
                  Show more
                </button>
              ) : (
                <>
                  {ordered.length > perPage && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="rounded-xl border border-primary/20 bg-bg/70 backdrop-blur-sm px-4 py-2 text-sm text-textmain disabled:opacity-50 hover:bg-primary/10 transition"
                      >
                        Prev
                      </button>

                      <span className="text-sm text-muted px-2">
                        Page <span className="text-textmain">{page}</span> of{" "}
                        <span className="text-textmain">{totalPages}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        className="rounded-xl border border-primary/20 bg-bg/70 backdrop-blur-sm px-4 py-2 text-sm text-textmain disabled:opacity-50 hover:bg-primary/10 transition"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setExpanded(false);
                      setPage(1);
                    }}
                    className="rounded-xl border border-primary/20 bg-bg/70 backdrop-blur-sm px-6 py-3 text-sm font-medium text-textmain hover:bg-primary/10 transition active:scale-[0.98]"
                  >
                    Show less
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ---------- MODAL ---------- */}
      {activeRepo && (
        <div
          className={`fixed inset-0 z-[10000] transition ${
            modalOpen ? "bg-black/40" : "bg-black/0"
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeProject();
          }}
        >
          <div className="h-full w-full p-3 sm:p-6 flex items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-title"
              className={`w-full max-w-3xl rounded-3xl border border-primary/20
                bg-bg/90 backdrop-blur-md shadow-xl transition-all duration-200
                ${
                  modalOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-[0.98] translate-y-2"
                }
                flex flex-col
                h-[88vh] sm:h-[80vh]
              `}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

              {/* Header */}
              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-primary/15">
                <div className="min-w-0">
                  <p className="text-xs text-muted">Project</p>
                  <h3
                    id="project-title"
                    className="text-lg sm:text-xl font-semibold text-textmain truncate"
                  >
                    {activeRepo.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeProject}
                  className="rounded-xl border border-primary/20 bg-bg/80 px-4 py-2 text-sm font-medium text-textmain hover:bg-primary/10 transition"
                >
                  Close
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-[300] overflow-y-auto">
                <div className="px-5 sm:px-8 py-6">
                  <div className="max-w-[820px] mx-auto">
                    {/* ✅ Tech + Actions row (language aligned with Code button) */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {techRowFrom(
                          (projectMeta[activeRepo.name]?.tags || []).slice(0, 8),
                          activeRepo.language || "Code",
                          (activeRepo.topics || []).slice(0, 10)
                        ).map((t) => (
                          <IconBadge key={t} label={t} />
                        ))}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={activeRepo.html_url}
                          target="_blank"
                          rel="noreferrer"
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

                        {activeRepo.homepage?.trim() && (
                          <a
                            href={activeRepo.homepage.trim()}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-primary px-3 py-2 text-sm text-white hover:opacity-90 transition"
                          >
                            Live
                          </a>
                        )}
                      </div>
                    </div>

                    {/* ✅ README (better formatting like before) */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-sm text-muted">README</p>

                        <a
                          href={activeRepo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-textmain hover:opacity-80"
                        >
                          Open on GitHub
                        </a>
                      </div>

                      {readmeLoading ? (
                        <div className="rounded-2xl border border-primary/20 bg-bg/70 p-4 text-muted text-sm">
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
                                <a
                                  className="text-textmain underline underline-offset-4 hover:opacity-80"
                                  target="_blank"
                                  rel="noreferrer"
                                  {...props}
                                />
                              ),
                              h1: (p) => (
                                <h1 className="text-xl sm:text-2xl font-bold text-textmain mt-2 mb-3" {...p} />
                              ),
                              h2: (p) => (
                                <h2 className="text-lg sm:text-xl font-semibold text-textmain mt-6 mb-3" {...p} />
                              ),
                              h3: (p) => (
                                <h3 className="text-base sm:text-lg font-semibold text-textmain mt-5 mb-2" {...p} />
                              ),
                              p: (p) => (
                                <p className="text-sm sm:text-[15px] text-muted leading-relaxed my-3 whitespace-pre-wrap" {...p} />
                              ),
                              ul: (p) => (
                                <ul className="list-disc pl-6 text-sm sm:text-[15px] text-muted my-3 space-y-1" {...p} />
                              ),
                              ol: (p) => (
                                <ol className="list-decimal pl-6 text-sm sm:text-[15px] text-muted my-3 space-y-1" {...p} />
                              ),
                              code: ({ inline, className, children, ...props }) =>
                                inline ? (
                                  <code
                                    className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/15 text-textmain text-[12px]"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="mt-3 mb-4 overflow-auto rounded-xl border border-primary/15 bg-primary/5 p-3 text-[12px] text-textmain">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                ),
                              blockquote: (p) => (
                                <blockquote className="border-l-4 border-primary/30 pl-4 my-4 text-muted italic" {...p} />
                              ),
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
              {/* end modal content */}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
