import { useEffect, useMemo, useState } from "react";
import cvPdf from "../assets/Zahraa_Salim_CV.pdf"; // PDF file to show in modal

export default function Hero() {
  // Profile image fallback: if image fails, show initials instead
  const [imgOk, setImgOk] = useState(true);

  const email = "zahraa.salim01@gmail.com";
  const githubUrl = "https://github.com/Zahraa-Salim";
  const linkedinUrl = "https://www.linkedin.com/in/zahraa-salim/";

  // Stable list of roles for the typewriter animation
  const roles = useMemo(
    () => [
      "Full-Stack Developer",
      "Flutter Developer",
      "React Developer",
      "Laravel (APIs) + Firebase",
    ],
    []
  );

  // Typewriter states
  const [roleIndex, setRoleIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  // CV modal open/close state
  const [cvOpen, setCvOpen] = useState(false);

  // Typewriter effect: type -> pause -> delete -> next role
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

  // Close modal on Escape (only while open)
  useEffect(() => {
    if (!cvOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeCv();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cvOpen]);

  // Lock background scroll + add modal-open class (helps Navbar hide)
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

  return (
    <section id="hero" className="bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="relative overflow-visible rounded-[36px] bg-bg border border-primary/30 shadow-sm">
          <div className="pointer-events-none absolute -top-20 -right-24 h-72 w-72 rounded-full bg-primary/18 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />

          <div className="relative overflow-visible px-7 pb-7 pt-14 sm:p-10">
            {/* Mobile avatar */}
            <div className="sm:hidden absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              {imgOk ? (
                <img
                  src="/profile.png"
                  alt="Zahraa Salim"
                  loading="lazy"
                  decoding="async"
                  className="h-[92px] w-[92px] rounded-full object-cover border-4 border-bg shadow-md"
                  onError={() => setImgOk(false)}
                />
              ) : (
                <div className="h-[92px] w-[92px] rounded-full bg-primary/18 border-4 border-bg shadow-md flex items-center justify-center text-2xl font-semibold text-primary">
                  ZS
                </div>
              )}
            </div>

            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Desktop avatar + name + typewriter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="hidden sm:block">
                    {imgOk ? (
                      <img
                        src="/profile.png"
                        alt="Zahraa Salim"
                        loading="lazy"
                        decoding="async"
                        className="h-16 w-16 rounded-full object-cover border-2 border-primary/25 shadow-sm"
                        onError={() => setImgOk(false)}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/18 border-2 border-primary/25 shadow-sm flex items-center justify-center text-lg font-semibold text-primary">
                        ZS
                      </div>
                    )}
                  </div>

                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-textmain text-center sm:text-left">
                      Zahraa Salim
                    </h1>

                    <p className="text-muted mt-1 flex items-center justify-center sm:justify-start gap-2">
                      <span className="inline-block min-w-[18ch]">
                        {typed}
                        <span className="inline-block w-[1px] h-5 bg-primary align-[-3px] ml-1 animate-pulse" />
                      </span>
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex justify-center sm:justify-end">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-textmain">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-textmain"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
                      <path d="M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    </svg>
                    Lebanon
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-7 h-px w-full bg-primary/25" />

            {/* Content */}
            <div className="mt-7 grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-5 sm:space-y-6">
                <p className="text-lg text-textmain leading-relaxed">
                  I build real products across mobile and web:{" "}
                  <span className="font-semibold">Flutter</span> apps with{" "}
                  <span className="font-semibold">Firebase</span>, and web interfaces with{" "}
                  <span className="font-semibold">React</span>.
                </p>

                <p className="text-textmain/90 italic leading-relaxed">
                  “Clean architecture + calm UI = apps that scale and feel good to use.”
                </p>

                <div className="w-full flex items-center gap-3 rounded-2xl border border-primary/25 bg-bg px-5 py-4">
                  <span className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25" />
                  <div>
                    <p className="text-sm text-muted">Specialty</p>
                    <p className="font-semibold text-textmain">
                      Flutter • React • Laravel APIs • Firebase
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full">
                    <button
                      type="button"
                      onClick={openCv}
                      className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-medium shadow-sm hover:opacity-90 transition active:scale-[0.98]
                                 px-4 py-2.5 sm:px-6 sm:py-3"
                    >
                      View CV
                    </button>

                    <a
                      href={`mailto:${email}`}
                      className="w-11 h-11 sm:w-12 sm:h-12 inline-flex items-center justify-center rounded-xl border border-primary/35 bg-bg hover:bg-primary/10 transition active:scale-[0.98]"
                      aria-label="Email"
                      title="Email"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-5 h-5 text-textmain"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 6h16v12H4z" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                    </a>

                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 sm:w-12 sm:h-12 inline-flex items-center justify-center rounded-xl border border-primary/35 bg-bg hover:bg-primary/10 transition active:scale-[0.98]"
                      aria-label="GitHub"
                      title="GitHub"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-textmain" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M12 .5C5.73.5.75 5.6.75 12c0 5.13 3.29 9.48 7.86 11.02.58.11.79-.26.79-.57v-2.1c-3.2.71-3.88-1.4-3.88-1.4-.52-1.37-1.27-1.73-1.27-1.73-1.04-.74.08-.73.08-.73 1.15.08 1.76 1.22 1.76 1.22 1.02 1.78 2.68 1.26 3.33.96.1-.76.4-1.26.72-1.55-2.55-.3-5.23-1.3-5.23-5.78 0-1.28.45-2.33 1.18-3.15-.12-.3-.51-1.52.11-3.18 0 0 .97-.32 3.18 1.2a10.6 10.6 0 0 1 2.9-.4c.98 0 1.97.14 2.9.4 2.2-1.52 3.17-1.2 3.17-1.2.63 1.66.24 2.88.12 3.18.73.82 1.18 1.87 1.18 3.15 0 4.49-2.69 5.48-5.25 5.77.41.37.77 1.1.77 2.22v3.28c0 .32.2.69.8.57A11.29 11.29 0 0 0 23.25 12C23.25 5.6 18.27.5 12 .5Z"
                        />
                      </svg>
                    </a>

                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 sm:w-12 sm:h-12 inline-flex items-center justify-center rounded-xl border border-primary/35 bg-bg hover:bg-primary/10 transition active:scale-[0.98]"
                      aria-label="LinkedIn"
                      title="LinkedIn"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-5 h-5 text-textmain"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 9v12" />
                        <path d="M6 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                        <path d="M10 21v-7a4 4 0 0 1 8 0v7" />
                        <path d="M10 14a4 4 0 0 1 8 0" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right side cards unchanged... */}
              {/* ... (rest of your JSX stays exactly as you wrote it) */}
            </div>
          </div>
        </div>
      </div>

      {/* CV Modal */}
      {cvOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/40"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCv();
          }}
        >
          <div className="h-full w-full p-3 sm:p-6 flex items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cv-title"
              className="
                w-full max-w-4xl rounded-3xl border border-primary/20
                bg-white shadow-xl transition-all duration-200
                flex flex-col h-[88vh] sm:h-[82vh]
              "
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-primary/15">
                <div className="min-w-0">
                  <p className="text-xs text-muted">Document</p>
                  <h3
                    id="cv-title"
                    className="text-lg sm:text-xl font-semibold text-textmain truncate"
                  >
                    Zahraa Salim — CV
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={cvPdf}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-textmain hover:bg-primary/10 transition"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={closeCv}
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-textmain hover:bg-primary/10 transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <iframe
                  title="CV"
                  src={cvPdf}
                  className="w-full h-full"
                  style={{ border: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
