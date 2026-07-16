import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const tr = (delay) => ({
  duration: 0.55,
  delay,
  ease: [0.25, 0.46, 0.45, 0.94],
});

/* ── Timeline data ──────────────────────────────────────────────
   type: "work" → coral marker · "edu" → teal marker
   ──────────────────────────────────────────────────────────────── */
const TIMELINE = [
  {
    type: "work",
    period: "Jul 2026 — Present",
    role: "Web Developer",
    org: "Monty Pay",
    desc: "Building and maintaining production web applications as part of the Monty Pay development team.",
    tags: ["React", "Next.js", "TypeScript", "Node.js"],
  },
  {
    type: "work",
    period: "2024 — Present",
    role: "Freelance Web Developer",
    org: "Self-employed",
    desc: "Designing and building full-stack web applications for clients — from UI and frontend to APIs, databases, and deployment.",
    tags: ["React", "Next.js", "Laravel", "Node.js"],
  },
  {
    type: "work",
    period: "Jan 2026 — May 2026",
    role: "Software Developer Intern",
    org: "Digital Hub, UNRWA",
    desc: "Completed an intensive full-stack web development and AI program. Built apps with React, Vue, and Next.js, and backend APIs with Node.js, Express, NestJS, and Python (FastAPI/Django). Worked in Agile/Scrum with Git and Jira.",
    tags: ["React", "Vue", "Express.js", "FastAPI", "PostgreSQL"],
  },
  {
    type: "edu",
    period: "2022 — 2025",
    role: "B.Sc. in Computer Science",
    org: "Lebanese International University",
    desc: "Studied software engineering, data structures, databases, and web & mobile application development.",
    tags: ["Algorithms", "OOP", "Databases"],
  },
];

function Entry({ item, index }) {
  const isEdu = item.type === "edu";
  const markerTint = isEdu ? "bg-accent" : "bg-primary";
  const barColor = isEdu ? "border-accent" : "border-primary";
  const textTint = isEdu ? "text-accent" : "text-primary";
  const badgeLabel = isEdu ? "Education" : "Experience";
  const left = index % 2 === 0;

  return (
    <motion.div
      {...fadeUp}
      transition={tr(index * 0.08)}
      className="relative md:grid md:grid-cols-2 md:gap-10"
    >
      {/* Marker on the center line (desktop) / left line (mobile) */}
      <div
        className={`absolute top-2 z-10 h-4 w-4 rounded-full border-2 border-ink ${markerTint}
          left-[-1.5rem] md:left-1/2 md:-translate-x-1/2`}
      />

      {/* Content — alternates sides on desktop, left accent bar (no box) */}
      <div className={left ? "md:col-start-1" : "md:col-start-2"}>
        <div className={`border-l-[3px] ${barColor} pl-5`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className={`brut-label text-[10px] font-bold ${textTint}`}>
              {badgeLabel}
            </span>
            <span className="brut-label text-xs font-bold text-muted">{item.period}</span>
          </div>

          <h3 className="mt-2 text-xl font-extrabold text-textmain leading-snug">
            {item.role}
          </h3>
          <p className={`text-sm font-bold brut-label mt-1 ${textTint}`}>{item.org}</p>
          <p className="text-sm text-muted mt-3 leading-relaxed">{item.desc}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {item.tags.map((t) => (
              <span key={t} className="text-[11px] font-semibold brut-label text-textmain border-b-2 border-transparent hover:border-primary transition-colors pb-0.5">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="flex items-end gap-4">
          <span className="brut-label text-sm font-bold text-primary">03</span>
          <div className="flex-1 h-[3px] bg-ink" />
          <span className="brut-label text-sm font-bold text-muted">Experience</span>
        </div>

        <h2 className="mt-6 text-4xl sm:text-6xl font-extrabold text-textmain uppercase tracking-tight leading-[0.95]">
          Where I've <span className="text-primary">worked</span>
        </h2>
        <p className="text-muted mt-4 max-w-2xl leading-relaxed">
          A short path through the roles and education that shaped how I build.
        </p>

        {/* Timeline */}
        <div className="mt-12 relative pl-8 md:pl-0">
          {/* Vertical line: left on mobile, centered on desktop */}
          <div className="absolute top-0 bottom-0 w-[3px] bg-ink left-0 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <Entry key={item.role} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
