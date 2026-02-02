import { useEffect, useRef, useState } from "react";

export default function Contact() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

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
      { threshold: 0.18 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="bg-bg relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div
        ref={sectionRef}
        className={`relative max-w-4xl mx-auto px-4 sm:px-6 py-16 transition-all duration-700 ease-out
          ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-muted">Contact</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-textmain mt-2">
            Let’s work together
          </h2>
          <p className="text-sm sm:text-base text-muted mt-3 max-w-xl mx-auto leading-relaxed">
            I’m open to internships, junior developer roles, and freelance projects.
            Feel free to reach out — I’d love to connect.
          </p>
          <div className="w-16 h-1 bg-primary rounded-full mt-4 mx-auto" />
        </div>

        {/* Contact methods */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Email */}
          <a
            href="mailto:zahraa.salim01@gmail.com"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-medium px-6 py-3 shadow-sm hover:opacity-90 transition"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            Send Email
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/zahraa-salim/"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-primary/30 px-6 py-3 text-textmain hover:bg-primary/10 transition"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9v12" />
              <path d="M6 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
              <path d="M10 21v-7a4 4 0 0 1 8 0v7" />
            </svg>
            LinkedIn Profile
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/Zahraa-Salim"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-primary/30 px-6 py-3 text-textmain hover:bg-primary/10 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .5C5.73.5.75 5.6.75 12c0 5.13 3.29 9.48 7.86 11.02.58.11.79-.26.79-.57v-2.1c-3.2.71-3.88-1.4-3.88-1.4-.52-1.37-1.27-1.73-1.27-1.73-1.04-.74.08-.73.08-.73 1.15.08 1.76 1.22 1.76 1.22 1.02 1.78 2.68 1.26 3.33.96.1-.76.4-1.26.72-1.55-2.55-.3-5.23-1.3-5.23-5.78 0-1.28.45-2.33 1.18-3.15-.12-.3-.51-1.52.11-3.18 0 0 .97-.32 3.18 1.2a10.6 10.6 0 0 1 2.9-.4c.98 0 1.97.14 2.9.4 2.2-1.52 3.17-1.2 3.17-1.2.63 1.66.24 2.88.12 3.18.73.82 1.18 1.87 1.18 3.15 0 4.49-2.69 5.48-5.25 5.77.41.37.77 1.1.77 2.22v3.28c0 .32.2.69.8.57A11.29 11.29 0 0 0 23.25 12C23.25 5.6 18.27.5 12 .5Z"
              />
            </svg>
            GitHub Projects
          </a>
        </div>
      </div>
    </section>
  );
}
