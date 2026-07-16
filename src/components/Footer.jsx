export default function Footer() {
  return (
    <footer className="bg-primary border-t-[3px] border-ink relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center gap-6">

        {/* Short professional description */}
        <p className="text-white text-lg sm:text-2xl font-extrabold uppercase tracking-tight max-w-2xl leading-tight">
          Full-stack developer building clean, user-focused web and mobile applications.
        </p>

        {/* Social / Contact text links */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <a
            href="mailto:zahraa.salim01@gmail.com"
            className="text-white text-xs font-bold brut-label border-b-2 border-white/40 hover:border-white transition pb-0.5"
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/zahraa-salim/"
            target="_blank"
            rel="noreferrer"
            className="text-white text-xs font-bold brut-label border-b-2 border-white/40 hover:border-white transition pb-0.5"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/Zahraa-Salim"
            target="_blank"
            rel="noreferrer"
            className="text-white text-xs font-bold brut-label border-b-2 border-white/40 hover:border-white transition pb-0.5"
          >
            GitHub
          </a>
        </div>

        {/* Auto-updating copyright */}
        <p className="text-white brut-label text-[11px] font-bold">
          © {new Date().getFullYear()} Zahraa Salim — All rights reserved.
        </p>
      </div>

      {/* Back to Top button */}
      <a
        href="#hero"
        aria-label="Back to top"
        title="Back to top"
        className="absolute bottom-5 right-5 text-white text-xs font-bold brut-label border-b-2 border-white/40 hover:border-white transition pb-0.5"
      >
        Top ↑
      </a>
    </footer>
  );
}
