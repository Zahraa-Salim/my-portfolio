
import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // true only when CV/Projects modal is open (because those add body.modal-open)
  const [modalActive, setModalActive] = useState(false);

  // Watch <body> for modal-open (use MutationObserver instead of setInterval)
  useEffect(() => {
    const update = () => setModalActive(document.body.classList.contains("modal-open"));
    update();

    const obs = new MutationObserver(update);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => obs.disconnect();
  }, []);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open (DON'T touch modal-open)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ✅ Navbar visible unless a modal is open
  const shouldShow = !modalActive;

  const linkBase = "relative px-3 py-2 rounded-full transition duration-200";
  const linkHover = "hover:bg-primary/20 hover:text-textmain";
  const linkUnderline =
    "after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary after:scale-x-0 after:origin-center after:transition after:duration-200 hover:after:scale-x-100";

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-[9999] w-full [isolation:isolate]",
        "transition-all duration-300",
        shouldShow ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none",
      ].join(" ")}
    >
      <div className="border-b border-primary/25 bg-bg/95">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <a
            href="#hero"
            className="mr-auto -ml-2 sm:ml-0 px-2 py-1 rounded-lg hover:bg-primary/10 transition"
            onClick={() => setOpen(false)}
          >
            <span className="text-xl font-semibold tracking-wide text-textmain">
              Zahraa{" "}
              <span className="bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
                Salim
              </span>
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-2 text-sm font-medium text-muted">
            <li>
              <a href="#about" className={`${linkBase} ${linkHover} ${linkUnderline}`}>
                About
              </a>
            </li>
            <li>
              <a href="#skills" className={`${linkBase} ${linkHover} ${linkUnderline}`}>
                Skills
              </a>
            </li>
            <li>
              <a href="#projects" className={`${linkBase} ${linkHover} ${linkUnderline}`}>
                Projects
              </a>
            </li>
            <li>
              <a href="#contact" className={`${linkBase} ${linkHover} ${linkUnderline}`}>
                Contact
              </a>
            </li>

            <li className="ml-2">
              <a
                href="https://wa.me/96176461380?text=Hi%20Zahraa%2C%20I%20found%20your%20portfolio%20and%20I%27d%20like%20to%20talk."
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-primary text-white hover:opacity-90 transition shadow-sm"
              >
                Let’s talk
              </a>
            </li>
          </ul>

          <button
            type="button"
            className="md:hidden ml-3 inline-flex items-center justify-center w-10 h-10 rounded-xl border border-primary/30 bg-surface/60 hover:bg-surface/80 transition text-textmain"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="text-2xl leading-none select-none">{open ? "✕" : "☰"}</span>
          </button>
        </nav>

        <div className={`md:hidden ${open ? "block" : "hidden"}`}>
          <div className="px-4 sm:px-6 pb-4">
            <div className="bg-surface/70 border border-primary/25 rounded-2xl p-3 shadow-sm">
              {[
                { href: "#about", label: "About" },
                { href: "#projects", label: "Projects" },
                { href: "#skills", label: "Skills" },
                { href: "#contact", label: "Contact" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl text-textmain hover:bg-primary/15 transition"
                >
                  {item.label}
                </a>
              ))}

              <a
                href="https://wa.me/96176461380?text=Hi%20Zahraa%2C%20I%20found%20your%20portfolio%20and%20I%27d%20like%20to%20talk."
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="mt-2 block text-center px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition"
              >
                Let’s talk
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}