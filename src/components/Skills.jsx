import { useEffect, useMemo, useRef, useState } from "react";

function Chip({ children }) {
  // Plain text tag with an underline reveal on hover — no box
  return (
    <span className="text-sm font-semibold brut-label text-textmain border-b-2 border-transparent hover:border-primary transition-colors duration-150 cursor-default pb-0.5">
      {children}
    </span>
  );
}

function SkillLane({ title, subtitle, items, accent, show, delayMs = 0 }) {
  // One skill category — left accent bar instead of a full box
  const bar = accent ? "border-accent" : "border-primary";
  return (
    <div
      className={[
        `border-l-[3px] ${bar} pl-6`,
        "transition-all duration-500 ease-out",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <h3 className="text-xl font-extrabold uppercase tracking-tight text-textmain">{title}</h3>
      <p className="brut-label text-[11px] text-muted mt-1">{subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
        {items.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef(null);

  // Entire section fade-in state
  const [inView, setInView] = useState(false);

  // How many lanes have been revealed so far
  const [revealedCount, setRevealedCount] = useState(0);

  // Skills data
  const lanes = useMemo(
    () => [
      {
        title: "Frontend",
        subtitle: "UI, components, styling, and interactions",
        items: ["React", "Next.js (App Router)", "Vue", "TypeScript", "JavaScript", "Tailwind CSS", "Responsive UI", "TanStack", "Zustand"],
      },
      {
        title: "Mobile",
        subtitle: "Cross-platform apps with clean architecture",
        items: ["Flutter", "Dart", "Firebase", "State Management", "Reusable Widgets", "REST APIs"],
      },
      {
        title: "Backend & Databases",
        subtitle: "APIs, data, and server-side structure",
        items: ["Node.js", "Express.js", "NestJS", "Laravel", "Inertia.js", "Django", "FastAPI", "Prisma ORM", "NextAuth.js", "PostgreSQL", "MySQL", "MongoDB", "Supabase", "Redis"],
      },
      {
        title: "Tools & Integrations",
        subtitle: "Workflow, delivery, and AI",
        items: ["Git & GitHub", "Jira", "Trello", "Agile / Scrum", "Vercel", "Render", "Railway", "Postman", "Claude API", "GitHub API"],
      },
    ],
    []
  );

  // Detect when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reveal lanes one by one after section is visible
  useEffect(() => {
    if (!inView) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setRevealedCount(lanes.length);
      return;
    }

    let i = 0;
    setRevealedCount(0);

    const id = window.setInterval(() => {
      i += 1;
      setRevealedCount(i);
      if (i >= lanes.length) window.clearInterval(id);
    }, 160);

    return () => window.clearInterval(id);
  }, [inView, lanes.length]);

  return (
    <section id="skills" className="relative overflow-hidden">
      <div
        ref={sectionRef}
        className={[
          "relative max-w-6xl mx-auto px-4 sm:px-6 py-16",
          "transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-end gap-4">
          <span className="brut-label text-sm font-bold text-primary">02</span>
          <div className="flex-1 h-[3px] bg-ink" />
          <span className="brut-label text-sm font-bold text-muted">Skills</span>
        </div>

        <h2 className="mt-6 text-4xl sm:text-6xl font-extrabold text-textmain uppercase tracking-tight leading-[0.95]">
          Tools I <span className="text-accent">build with</span>
        </h2>
        <p className="text-muted mt-4 max-w-2xl leading-relaxed">
          I focus on shipping real products with clean structure, strong UI, and practical tooling across mobile, web, and backend.
        </p>

        {/* Skill lanes */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {lanes.map((lane, idx) => (
            <SkillLane
              key={lane.title}
              title={lane.title}
              subtitle={lane.subtitle}
              items={lane.items}
              accent={idx % 2 === 1}
              show={revealedCount >= idx + 1}
              delayMs={idx * 40}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
