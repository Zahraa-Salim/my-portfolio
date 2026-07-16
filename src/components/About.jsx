import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const tr = (delay) => ({
  duration: 0.6,
  delay,
  ease: [0.25, 0.46, 0.45, 0.94],
});

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <motion.div {...fadeUp} transition={tr(0)} className="flex items-end gap-4">
          <span className="brut-label text-sm font-bold text-primary">01</span>
          <div className="flex-1 h-[3px] bg-ink" />
          <span className="brut-label text-sm font-bold text-muted">About</span>
        </motion.div>

        <motion.h2
          {...fadeUp}
          transition={tr(0.08)}
          className="mt-6 text-4xl sm:text-6xl font-extrabold text-textmain uppercase tracking-tight leading-[0.95]"
        >
          Who I <span className="text-primary">am</span>
        </motion.h2>

        {/* Text Content */}
        <div className="mt-10 grid lg:grid-cols-3 gap-8 lg:gap-10">
          <motion.p
            {...fadeUp}
            transition={tr(0.12)}
            className="lg:col-span-2 text-lg sm:text-2xl text-textmain leading-relaxed font-medium"
          >
            Hi, I'm Zahraa — a Computer Science graduate passionate about
            building products that solve real problems. I work across
            mobile, web, and backend to deliver complete, polished applications.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={tr(0.2)}
            className="border-l-[3px] border-primary pl-5 self-start"
          >
            <p className="brut-label text-xs text-primary">Currently</p>
            <p className="font-bold text-xl mt-2 leading-snug text-textmain">
              Web Developer at Monty Pay — freelancing on the side and open to new projects.
            </p>
          </motion.div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          <motion.p
            {...fadeUp}
            transition={tr(0.24)}
            className="text-base sm:text-lg text-muted leading-relaxed"
          >
            From a Flutter app handling real-time data to a full-stack web
            platform with authentication and dashboards — I take ownership of
            the entire product lifecycle. I enjoy connecting the dots between
            design, frontend, and the API layer.
          </motion.p>

          <motion.p
            {...fadeUp}
            transition={tr(0.32)}
            className="text-base sm:text-lg text-muted leading-relaxed"
          >
            What drives me is building things that work well and feel right.
            I pick the right tools for the job, write code that's easy to
            maintain, and obsess over the small details that make a big
            difference in user experience.
          </motion.p>
        </div>

        {/* Focus Highlights */}
        <motion.div {...fadeUp} transition={tr(0.4)} className="mt-12">
          <p className="brut-label text-xs text-muted mb-4">What I focus on</p>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { label: "Clean Architecture", bar: "border-primary" },
              { label: "End-to-End Development", bar: "border-accent" },
              { label: "Scalable Systems", bar: "border-primary" },
              { label: "Pixel-Perfect UI", bar: "border-accent" },
            ].map((tag) => (
              <span
                key={tag.label}
                className={`border-l-2 ${tag.bar} pl-3 text-sm font-bold brut-label text-textmain`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
