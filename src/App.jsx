import { useEffect, useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import ProjectsPreview from "./components/ProjectsPreview";
import ProjectsPage from "./components/ProjectsPage";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function HomePage() {
  const location = useLocation();

  // Handle scroll-to-section when navigating from another page (e.g., /projects → /#about)
  useEffect(() => {
    const hash = location.state?.scrollTo;
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <main className="pt-6 sm:pt-8">
      <Hero />
      <About />
      <Skills />
      <ProjectsPreview />
      <Contact />
    </main>
  );
}

// Scroll to top on every route change.
// Temporarily disables CSS scroll-behavior:smooth so it jumps instantly.
function ScrollToTop() {
  const { pathname, state } = useLocation();
  useLayoutEffect(() => {
    if (state?.scrollTo) return;
    // Override CSS smooth scrolling to jump instantly
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    // Restore after a tick so in-page smooth scrolling still works
    requestAnimationFrame(() => {
      html.style.scrollBehavior = prev;
    });
  }, [pathname, state]);
  return null;
}

export default function App() {
  return (
    <div className="bg-bg text-textmain min-h-screen overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/projects"
          element={
            <main className="pt-[72px]">
              <ProjectsPage />
            </main>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}
