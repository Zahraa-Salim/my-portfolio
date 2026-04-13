import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link } from "react-router-dom";
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

  return (
    <section
      id="projects-preview"
      className="relative overflow-hidden bg-gradient-to-b from-bg via-bg to-primary/10"
    >
      {/* soft blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-28 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-sm text-muted">Projects</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-textmain mt-2">
              Work from GitHub
            </h2>
            <p className="text-muted mt-3 max-w-2xl leading-relaxed">
              A selection of my projects with code links and demos when available.
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mt-4" />
          </motion.div>

          <motion.a
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            href={`https://github.com/${USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-primary/20 bg-bg/70 backdrop-blur-sm px-5 py-3 text-sm font-medium text-textmain hover:bg-primary/10 transition active:scale-[0.98]"
          >
            View GitHub profile
          </motion.a>
        </div>

        {/* Loading skeleton */}
        {status === "loading" && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
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
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl border border-primary/20 bg-bg/70 px-5 py-2.5 text-sm text-textmain hover:bg-primary/10 transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Project cards */}
        {status === "success" && visible.length > 0 && (
          <LayoutGroup>
            <motion.div
              layout
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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

        {/* Show more → navigates to /projects */}
        {status === "success" && repos.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <Link
              to="/projects"
              onClick={() => window.scrollTo(0, 0)}
              className="rounded-xl border border-primary/20 bg-bg/70 backdrop-blur-sm px-6 py-3 text-sm font-medium text-textmain hover:bg-primary/10 transition active:scale-[0.98] inline-flex items-center gap-2"
            >
              Show more projects
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
