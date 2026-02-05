export default function Footer() {
  return (
    <footer className="bg-primary border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col items-center text-center gap-6">
        
        {/* Short professional description */}
        <p className="text-white text-base sm:text-lg font-semibold max-w-xl leading-relaxed">
          Full-stack developer building clean, user-focused web and mobile applications with
          modern technologies and scalable architecture.
        </p>

        {/* Social / Contact Icons */}
        <div className="flex items-center gap-5">
          {/* Email */}
          <a
            href="mailto:zahraa.salim01@gmail.com"
            className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition"
            aria-label="Email"
            title="Email"
          >
            {/* Mail icon */}
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/zahraa-salim/"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9v12" />
              <path d="M6 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
              <path d="M10 21v-7a4 4 0 0 1 8 0v7" />
            </svg>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/Zahraa-Salim"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
              <path
                fill="currentColor"
                d="M12 .5C5.73.5.75 5.6.75 12c0 5.13 3.29 9.48 7.86 11.02.58.11.79-.26.79-.57v-2.1c-3.2.71-3.88-1.4-3.88-1.4-.52-1.37-1.27-1.73-1.27-1.73-1.04-.74.08-.73.08-.73 1.15.08 1.76 1.22 1.76 1.22 1.02 1.78 2.68 1.26 3.33.96.1-.76.4-1.26.72-1.55-2.55-.3-5.23-1.3-5.23-5.78 0-1.28.45-2.33 1.18-3.15-.12-.3-.51-1.52.11-3.18 0 0 .97-.32 3.18 1.2a10.6 10.6 0 0 1 2.9-.4c.98 0 1.97.14 2.9.4 2.2-1.52 3.17-1.2 3.17-1.2.63 1.66.24 2.88.12 3.18.73.82 1.18 1.87 1.18 3.15 0 4.49-2.69 5.48-5.25 5.77.41.37.77 1.1.77 2.22v3.28c0 .32.2.69.8.57A11.29 11.29 0 0 0 23.25 12C23.25 5.6 18.27.5 12 .5Z"
              />
            </svg>
          </a>
        </div>

        {/* Auto-updating copyright */}
        <p className="text-white/80 text-xs font-medium">
          © {new Date().getFullYear()} Zahraa Salim. All rights reserved.
        </p>
      </div>

      {/* Back to Top button */}
      <a
        href="#hero"
        aria-label="Back to top"
        title="Back to top"
        className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-black/25 hover:bg-black/35 transition inline-flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </a>
    </footer>
  );
}
