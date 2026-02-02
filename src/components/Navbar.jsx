import { useEffect, useState } from "react";

export default function Navbar() {
  // Controls whether the MOBILE dropdown menu is open
  const [open, setOpen] = useState(false);

  // Controls whether the navbar should be visible after scrolling past the hero section
  const [showNav, setShowNav] = useState(false);

  // Tracks if the page is currently in "modal mode"
  // (meaning <body> has the class "modal-open")
  const [modalActive, setModalActive] = useState(false);

  // --------------------------------------------------
  // EFFECT 1: Watch <body> class to detect modal state
  // --------------------------------------------------
  // Some components (like this menu or other modals)
  // add/remove the "modal-open" class on <body>.
  // This effect checks every 150ms and updates modalActive.
  useEffect(() => {
    const check = () =>
      setModalActive(document.body.classList.contains("modal-open"));

    check(); // Run once immediately on mount
    const id = window.setInterval(check, 150); // Keep checking

    return () => window.clearInterval(id); // Cleanup on unmount
  }, []);

  // --------------------------------------------------
  // EFFECT 2: Close mobile menu when screen becomes desktop size
  // --------------------------------------------------
  // Prevents the mobile menu from staying open if the user
  // resizes the browser to desktop width.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --------------------------------------------------
  // EFFECT 3: Close mobile menu when ESC key is pressed
  // --------------------------------------------------
  // Accessibility/UX improvement: Escape should close overlays.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // --------------------------------------------------
  // EFFECT 4: Lock body scroll when mobile menu is open
  // --------------------------------------------------
  // Adds "modal-open" class to <body> when menu opens,
  // usually used in CSS to disable background scrolling.
  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup in case component unmounts while open
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  // --------------------------------------------------
  // EFFECT 5: Show navbar only after user scrolls past hero section
  // --------------------------------------------------
  // Navbar stays hidden while hero is visible,
  // then fades/slides in after scrolling down.
  useEffect(() => {
    const hero = document.getElementById("hero");

    // If no hero section exists, always show navbar
    if (!hero) {
      setShowNav(true);
      return;
    }

    const onScroll = () => {
      const heroBottom = hero.offsetHeight;
      setShowNav(window.scrollY > heroBottom - 10);
    };

    onScroll(); // Set initial state on load
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Base styles for navigation links
  const linkBase = "relative px-3 py-2 rounded-full transition duration-200";

  // Hover background + text color
  const linkHover = "hover:bg-primary/20 hover:text-textmain";

  // Animated underline effect on hover
  const linkUnderline =
    "after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary after:scale-x-0 after:origin-center after:transition after:duration-200 hover:after:scale-x-100";

  // Navbar should only be visible if:
  // 1) We scrolled past hero
  // 2) No modal (or mobile menu) is active
  const shouldShow = showNav && !modalActive;

  return (
    <header
      className={[
        // Fixed navbar positioning
        "fixed top-0 left-0 right-0 z-[9999] w-full [isolation:isolate]",
        "transition-all duration-300",

        // Show or hide navbar with animation
        shouldShow
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-3 pointer-events-none",
      ].join(" ")}
    >
      <div className="border-b border-primary/25 bg-bg/95">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          {/* Brand / Logo — clicking closes mobile menu */}
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

          {/* Desktop Navigation Links */}
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

            {/* Call-to-action button */}
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

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="md:hidden ml-3 inline-flex items-center justify-center w-10 h-10 rounded-xl border border-primary/30 bg-surface/60 hover:bg-surface/80 transition text-textmain"
            onClick={() => setOpen((v) => !v)} // Toggle menu
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="text-2xl leading-none select-none">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </nav>

        {/* Mobile Dropdown Menu */}
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
                  onClick={() => setOpen(false)} // Close menu when link clicked
                  className="block px-4 py-3 rounded-xl text-textmain hover:bg-primary/15 transition"
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile CTA Button */}
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
