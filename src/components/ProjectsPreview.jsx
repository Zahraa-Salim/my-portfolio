import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  USERNAME,
  useGitHubRepos,
  SkeletonCard,
  ProjectCard,
  cardVariants,
  TOKEN,
} from "./projectsData.jsx";

export default function ProjectsPreview() {
  const { repos, status, error } = useGitHubRepos();
  const visible = repos.slice(0, 3);
  const navigate = useNavigate();

  // Open a project's detail modal on the /projects page
  const openOnProjectsPage = (repo) => {
    window.scrollTo(0, 0);
    navigate("/projects", { state: { openRepo: repo.name } });
  };

  return (
    <section id="projects-preview" className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16"
      >
        {/* Header */}
        <div className="flex items-end gap-4">
          <span className="brut-label text-sm font-bold text-primary">05</span>
          <div className="flex-1 h-[3px] bg-ink" />
          <span className="brut-label text-sm font-bold text-muted">Projects</span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h2 className="text-4xl sm:text-6xl font-extrabold text-textmain uppercase tracking-tight leading-[0.95]">
              Work from <span className="text-primary">GitHub</span>
            </h2>
            <p className="text-muted mt-4 max-w-2xl leading-relaxed">
              A selection of my projects with code links and demos when available.
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

        {/* Loading skeleton */}
        {status === "loading" && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
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
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 text-xs font-bold brut-label text-textmain border-b-2 border-ink/30 hover:border-primary hover:text-primary transition pb-0.5"
            >
              Try Again →
            </button>
          </div>
        )}

        {/* Project cards */}
        {status === "success" && visible.length > 0 && (
          <LayoutGroup>
            <motion.div
              layout
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
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
                    onClick={() => openOnProjectsPage(repo)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openOnProjectsPage(repo);
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

        {/* Show more → navigates to /projects */}
        {status === "success" && repos.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <Link
              to="/projects"
              onClick={() => window.scrollTo(0, 0)}
              className="bg-primary text-white px-8 py-3 text-sm font-bold brut-label transition hover:-translate-y-0.5"
            >
              Show More Projects →
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
