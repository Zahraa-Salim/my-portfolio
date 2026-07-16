
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  // true only when CV/Projects modal is open (because those add body.modal-open)
  const [modalActive, setModalActive] = useState(false);

  useEffect(() => {
    const update = () => setModalActive(document.body.classList.contains("modal-open"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const shouldShow = !modalActive;

  const linkBase =
    "px-1 py-1.5 font-semibold text-textmain transition-colors duration-150 border-b-2 border-transparent hover:border-primary hover:text-primary";

  // Navigate to hash section — if already on home, just scroll; if on another page, navigate then scroll
  const goToSection = (hash) => (e) => {
    e.preventDefault();
    setOpen(false);
    if (isHome) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: hash } });
    }
  };

  const navItems = [
    { hash: "#about", label: "About" },
    { hash: "#skills", label: "Skills" },
    { hash: "#experience", label: "Experience" },
    { to: "/projects", label: "Projects" },
    { hash: "#contact", label: "Contact" },
  ];

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-[9999] w-full [isolation:isolate]",
        "transition-all duration-300",
        shouldShow ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none",
      ].join(" ")}
    >
      <div className="border-b-[3px] border-ink bg-bg">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <Link
            to="/"
            className="mr-auto py-1"
            onClick={() => setOpen(false)}
          >
            <span className="text-lg font-extrabold tracking-tight brut-label text-textmain">
              ZAHRAA<span className="text-primary">·</span>SALIM
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-5 text-sm">
            {navItems.map((item) =>
              item.to ? (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={() => window.scrollTo(0, 0)}
                    className={linkBase}
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <a href={item.hash} onClick={goToSection(item.hash)} className={linkBase}>
                    {item.label}
                  </a>
                </li>
              )
            )}

            <li className="ml-1">
              <a
                href="https://wa.me/96176461380?text=Hi%20Zahraa%2C%20I%20found%20your%20portfolio%20and%20I%27d%20like%20to%20talk."
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-primary text-white font-bold brut-label text-xs transition hover:-translate-y-0.5"
              >
                Let's Talk
              </a>
            </li>
          </ul>

          <button
            type="button"
            className="md:hidden ml-3 px-3 h-10 bg-primary text-white font-bold brut-label text-xs transition hover:-translate-y-0.5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? "Close" : "Menu"}
          </button>
        </nav>

        <div className={`md:hidden ${open ? "block" : "hidden"}`}>
          <div className="px-4 sm:px-6 pb-4 pt-1">
            <div className="bg-surface border-t-2 border-primary">
              {navItems.map((item) =>
                item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => { setOpen(false); window.scrollTo(0, 0); }}
                    className="block px-2 py-3 font-semibold text-textmain border-b border-ink/10 last:border-b-0 hover:text-primary hover:pl-3 transition-all"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.hash}
                    onClick={goToSection(item.hash)}
                    className="block px-2 py-3 font-semibold text-textmain border-b border-ink/10 hover:text-primary hover:pl-3 transition-all"
                  >
                    {item.label}
                  </a>
                )
              )}

              <a
                href="https://wa.me/96176461380?text=Hi%20Zahraa%2C%20I%20found%20your%20portfolio%20and%20I%27d%20like%20to%20talk."
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="mt-3 block text-center px-4 py-3 bg-primary text-white font-bold brut-label text-xs"
              >
                Let's Talk
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
