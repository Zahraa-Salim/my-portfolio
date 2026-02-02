import { useEffect, useMemo, useRef, useState } from "react";

function Chip({ children }) {
  // Small pill UI for each skill
  return (
    <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-textmain hover:bg-primary/15 transition">
      {children}
    </span>
  );
}

function SkillLane({ title, subtitle, items, show, delayMs = 0 }) {
  // One skill category block (Frontend, Mobile, etc.)
  return (
    <div
      className={[
        "relative transition-all duration-700 ease-out",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary/35" />

      <div className="pl-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-textmain">{title}</h3>
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          </div>
          <div className="hidden sm:block h-[2px] w-16 bg-primary/40 rounded-full" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
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
        items: ["React", "JavaScript", "Tailwind CSS", "HTML5", "CSS3", "Responsive UI", "REST API Integration"],
      },
      {
        title: "Mobile",
        subtitle: "Cross-platform apps with clean architecture",
        items: ["Flutter", "Dart", "Firebase Auth", "Cloud Firestore", "State Management", "Clean Architecture", "App Deployment"],
      },
      {
        title: "Backend",
        subtitle: "APIs, data, and server-side structure",
        items: ["Laravel", "PHP", "REST APIs", "MySQL / SQL", "Authentication", "CRUD Systems", "MVC Pattern"],
      },
      {
        title: "Tools",
        subtitle: "Workflow, collaboration, and delivery",
        items: ["Git", "GitHub", "Postman", "Figma", "Vercel", "VS Code", "Debugging"],
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
    <section id="skills" className="bg-bg relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -right-28 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div
        ref={sectionRef}
        className={[
          "relative max-w-6xl mx-auto px-4 sm:px-6 py-16",
          "transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        ].join(" ")}
      >
        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-muted">Skills</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-textmain mt-2">
            Tools I build with
          </h2>
          <p className="text-muted mt-3 max-w-2xl mx-auto leading-relaxed">
            I focus on shipping real products with clean structure, strong UI, and practical tooling across mobile, web, and backend.
          </p>
          <div className="w-16 h-1 bg-primary rounded-full mt-4 mx-auto" />
        </div>

        <div className="mt-10 h-px w-full bg-primary/25" />

        {/* Skill lanes */}
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {lanes.map((lane, idx) => (
            <SkillLane
              key={lane.title}
              title={lane.title}
              subtitle={lane.subtitle}
              items={lane.items}
              show={revealedCount >= idx + 1}
              delayMs={idx * 40}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="h-[2px] w-40 bg-primary/30 rounded-full" />
        </div>
      </div>
    </section>
  );
}
