import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import cvPdf from "../assets/Zahraa_Salim_CV.pdf";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export default function Hero() {
  const [imgOk, setImgOk] = useState(true);

  const email = "zahraa.salim01@gmail.com";
  const githubUrl = "https://github.com/Zahraa-Salim";
  const linkedinUrl = "https://www.linkedin.com/in/zahraa-salim/";

  const roles = useMemo(
    () => [
      "Full-Stack Web Developer",
      "React & Next.js Developer",
      "Flutter Developer",
      "Laravel & Node.js APIs",
    ],
    []
  );

  const [roleIndex, setRoleIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  useEffect(() => {
    const current = roles[roleIndex];
    const speed = deleting ? 35 : 55;
    const t = window.setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, typed.length + 1);
        setTyped(next);
        if (next === current) window.setTimeout(() => setDeleting(true), 900);
      } else {
        const next = current.slice(0, typed.length - 1);
        setTyped(next);
        if (next === "") {
          setDeleting(false);
          setRoleIndex((i) => (i + 1) % roles.length);
        }
      }
    }, speed);
    return () => window.clearTimeout(t);
  }, [typed, deleting, roleIndex, roles]);

  const openCv = () => setCvOpen(true);
  const closeCv = () => setCvOpen(false);

  useEffect(() => {
    if (!cvOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeCv();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cvOpen]);

  useEffect(() => {
    if (!cvOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove("modal-open");
    };
  }, [cvOpen]);

  const cards = [
    { label: "Focus", value: "Turning ideas into real, production-ready products", bar: "border-primary" },
    { label: "Stack", value: "React • Next.js • Laravel • Node.js • Flutter", bar: "border-accent" },
    { label: "Approach", value: "User-first design • Clean architecture • Ship fast", bar: "border-primary" },
  ];

  return (
    <section id="hero" className="pt-[104px] sm:pt-[88px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Name + role + location */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <motion.div {...fadeUp(0.1)} className="flex items-center gap-4">
            {imgOk ? (
              <img
                src="/profile.png"
                alt="Zahraa Salim"
                loading="lazy"
                decoding="async"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-ink"
                onError={() => setImgOk(false)}
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-ink bg-primary flex items-center justify-center text-xl font-extrabold text-white">
                ZS
              </div>
            )}
            <div>
              <h1 className="text-4xl sm:text-6xl font-extrabold leading-[0.95] tracking-tight text-textmain uppercase">
                Zahraa Salim
              </h1>
              <p className="mt-2 min-w-[18ch] brut-label text-sm text-primary font-bold">
                {typed}
                <span className="inline-block w-[2px] h-4 bg-accent align-[-2px] ml-1 animate-pulse" />
              </p>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.25)} className="brut-label text-xs font-bold text-accent border-l-2 border-accent pl-3">
            Based in
            <br />
            Lebanon
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div {...fadeUp(0.3)} className="mt-8 h-px w-full bg-ink/15" />

        {/* Content */}
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Left */}
          <div className="space-y-6">
            <motion.p {...fadeUp(0.35)} className="text-lg sm:text-xl text-textmain leading-relaxed">
              I build digital products from the ground up — crafting{" "}
              <span className="font-bold text-primary">mobile experiences</span>,{" "}
              <span className="font-bold text-accent">web applications</span>, and the{" "}
              <span className="font-bold text-primary">backend systems</span> that power them.
              Every project starts with purpose and ends with polish.
            </motion.p>

            <motion.p {...fadeUp(0.4)} className="text-textmain font-medium italic leading-relaxed border-l-[3px] border-primary pl-4">
              "I don't just write code — I build solutions that users love to use."
            </motion.p>

            {/* Specialty */}
            <motion.div {...fadeUp(0.45)} className="border-l-[3px] border-accent pl-5">
              <p className="text-xs brut-label text-muted">Specialty</p>
              <p className="font-bold text-textmain mt-1">
                React • Next.js • Laravel • Node.js • Flutter
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div {...fadeUp(0.5)} className="pt-1">
              <div className="flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={openCv}
                  className="bg-primary text-white font-bold brut-label text-sm px-7 py-3 transition hover:-translate-y-0.5 active:translate-y-0"
                >
                  View CV
                </button>

                <div className="flex flex-wrap items-center gap-5 brut-label text-sm font-bold">
                  <a href={`mailto:${email}`} className="text-textmain border-b-2 border-transparent hover:border-primary hover:text-primary transition pb-0.5">
                    Email
                  </a>
                  <a href={githubUrl} target="_blank" rel="noreferrer" className="text-textmain border-b-2 border-transparent hover:border-primary hover:text-primary transition pb-0.5">
                    GitHub
                  </a>
                  <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-textmain border-b-2 border-transparent hover:border-primary hover:text-primary transition pb-0.5">
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — left-accent info rows */}
          <div className="space-y-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                {...fadeUp(0.35 + i * 0.1)}
                className={`border-l-[3px] ${card.bar} pl-5`}
              >
                <p className="text-xs brut-label text-muted">{card.label}</p>
                <p className="font-bold text-textmain mt-1">{card.value}</p>
              </motion.div>
            ))}

            <motion.div {...fadeUp(0.65)}>
              <Link
                to="/projects"
                onClick={() => window.scrollTo(0, 0)}
                className="group block border-l-[3px] border-accent pl-5 transition hover:pl-6"
              >
                <p className="text-xs brut-label text-accent">Featured →</p>
                <p className="font-bold text-textmain mt-1">
                  Aurum Realty — Real Estate Platform
                </p>
                <p className="text-sm text-muted mt-1">
                  Next.js · Prisma · PostgreSQL — bilingual site with a role-based admin dashboard
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CV MODAL */}
      {cvOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-ink/50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCv();
          }}
        >
          <div className="h-full w-full p-3 sm:p-6 flex items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cv-title"
              className="w-full max-w-4xl border border-ink/15 bg-surface shadow-2xl flex flex-col h-[88vh] sm:h-[82vh]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b-[3px] border-primary">
                <div className="min-w-0">
                  <p className="text-xs brut-label text-muted">Document</p>
                  <h3 id="cv-title" className="text-lg sm:text-xl font-extrabold text-textmain truncate uppercase">
                    Zahraa Salim — CV
                  </h3>
                </div>
                <div className="flex items-center gap-4 brut-label text-sm font-bold">
                  <a href={cvPdf} target="_blank" rel="noreferrer" className="text-textmain border-b-2 border-transparent hover:border-primary hover:text-primary transition pb-0.5">
                    Open
                  </a>
                  <button type="button" onClick={closeCv} className="text-textmain border-b-2 border-transparent hover:border-primary hover:text-primary transition pb-0.5">
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <iframe title="CV" src={cvPdf} className="w-full h-full" style={{ border: "none" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
