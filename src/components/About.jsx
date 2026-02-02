import { useEffect, useRef, useState } from "react";

export default function About() {
  // Reference to the section DOM element
  const sectionRef = useRef(null);

  // Controls whether the fade-in animation should run
  const [inView, setInView] = useState(false);

  // Detect when section enters viewport and trigger animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);        // Start animation
          observer.disconnect();  // Only animate once
        }
      },
      { threshold: 0.18 } // Trigger when 18% visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="bg-bg relative overflow-hidden">
      {/* Soft gradient background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Animated content container */}
      <div
        ref={sectionRef}
        className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-16 transition-all duration-700 ease-out
          ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-muted">About</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-textmain mt-2">
            A bit about me
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mt-4 mx-auto" />
        </div>

        {/* Text Content */}
        <div className="mt-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-7">
          <p className="text-lg sm:text-2xl text-textmain leading-relaxed">
            I’m Zahraa Salim, a Computer Science graduate and full-stack developer.
            I build complete digital products across mobile and web using Flutter,
            React, Laravel, and Firebase.
          </p>

          <p className="text-base sm:text-xl text-muted leading-relaxed">
            My work spans from designing user-friendly interfaces to building
            structured backends and APIs. I enjoy turning ideas into real, usable
            applications with clean architecture and smooth user experiences.
          </p>

          <p className="text-base sm:text-xl text-muted leading-relaxed">
            I’m always learning, improving, and refining how I build software —
            focusing on maintainable code, thoughtful UI decisions, and systems
            that scale well over time.
          </p>

          {/* Focus Highlights */}
          <div className="pt-2">
            <p className="text-sm text-muted mb-4">What I focus on</p>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Clean architecture",
                "Frontend + backend balance",
                "Maintainable & scalable systems",
                "UI/UX quality",
              ].map((title) => (
                <div
                  key={title}
                  className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-textmain
                            hover:bg-primary/15 transition duration-200 hover:-translate-y-0.5"
                >
                  {title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
