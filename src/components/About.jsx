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
    <section id="about" className="bg-bg relative overflow-hidden">
      {/* Soft gradient background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <motion.div
          {...fadeUp}
          transition={tr(0)}
          className="text-center"
        >
          <p className="text-sm text-muted">About</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-textmain mt-2">
            Who I am
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mt-4 mx-auto" />
        </motion.div>

        {/* Text Content */}
        <div className="mt-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-7">
          <motion.p
            {...fadeUp}
            transition={tr(0.12)}
            className="text-lg sm:text-2xl text-textmain leading-relaxed"
          >
            Hi, I'm Zahraa — a Computer Science graduate passionate about
            building products that solve real problems. I work across
            mobile, web, and backend to deliver complete, polished applications.
          </motion.p>

          <motion.p
            {...fadeUp}
            transition={tr(0.24)}
            className="text-base sm:text-xl text-muted leading-relaxed"
          >
            From a Flutter app handling real-time data to a full-stack web
            platform with authentication and dashboards — I take ownership of
            the entire product lifecycle. I enjoy connecting the dots between
            design, frontend, and the API layer.
          </motion.p>

          <motion.p
            {...fadeUp}
            transition={tr(0.36)}
            className="text-base sm:text-xl text-muted leading-relaxed"
          >
            What drives me is building things that work well and feel right.
            I pick the right tools for the job, write code that's easy to
            maintain, and obsess over the small details that make a big
            difference in user experience.
          </motion.p>

          {/* Focus Highlights */}
          <motion.div
            {...fadeUp}
            transition={tr(0.48)}
            className="pt-2"
          >
            <p className="text-sm text-muted mb-4">What I focus on</p>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Clean Architecture",
                "End-to-End Development",
                "Scalable Systems",
                "Pixel-Perfect UI",
              ].map((title) => (
                <div
                  key={title}
                  className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-textmain
                            hover:bg-primary/15 hover:scale-[1.05] transition-all duration-200"
                >
                  {title}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
