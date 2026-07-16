import { useState } from "react";
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

const EMAIL = "zahraa.salim01@gmail.com";

// Formspree form ID — submissions POST to https://formspree.io/f/<id> and
// are emailed to zahraa.salim01@gmail.com. If cleared, falls back to mailto:.
const FORMSPREE_ID = "xqeregna";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errors, setErrors] = useState({});

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Invalid email";
    if (!form.message.trim()) next.message = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const mailtoFallback = () => {
    const subject = encodeURIComponent(`Portfolio message from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // No Formspree ID configured → open a pre-filled email draft instead.
    if (!FORMSPREE_ID) {
      mailtoFallback();
      setStatus("success");
      return;
    }

    try {
      setStatus("sending");
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const fieldBase =
    "w-full bg-transparent border-0 border-b-2 border-ink/25 px-0 py-2.5 text-textmain font-medium placeholder:text-muted/70 focus:outline-none focus:border-primary transition-colors";

  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="flex items-end gap-4">
          <span className="brut-label text-sm font-bold text-primary">04</span>
          <div className="flex-1 h-[3px] bg-ink" />
          <span className="brut-label text-sm font-bold text-muted">Contact</span>
        </div>

        <motion.h2
          {...fadeUp}
          transition={tr(0.05)}
          className="mt-6 text-4xl sm:text-6xl font-extrabold text-textmain uppercase tracking-tight leading-[0.95]"
        >
          Let's work <span className="text-accent">together</span>
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={tr(0.12)}
          className="text-muted mt-4 max-w-2xl leading-relaxed"
        >
          I'm always happy to connect — for freelance projects, collaborations,
          or just to talk tech. Send a message or reach out directly.
        </motion.p>

        <div className="mt-10 grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.form
            {...fadeUp}
            transition={tr(0.18)}
            onSubmit={onSubmit}
            noValidate
            className="lg:col-span-3 border-l-[3px] border-primary pl-6 sm:pl-8"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="brut-label text-xs font-bold text-textmain block mb-2">
                  Name {errors.name && <span className="text-primary">— {errors.name}</span>}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Your name"
                  className={fieldBase}
                />
              </div>
              <div>
                <label className="brut-label text-xs font-bold text-textmain block mb-2">
                  Email {errors.email && <span className="text-primary">— {errors.email}</span>}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  className={fieldBase}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="brut-label text-xs font-bold text-textmain block mb-2">
                Message {errors.message && <span className="text-primary">— {errors.message}</span>}
              </label>
              <textarea
                rows={5}
                value={form.message}
                onChange={update("message")}
                placeholder="Tell me about your project or opportunity…"
                className={`${fieldBase} resize-none`}
              />
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-5">
              <button
                type="submit"
                disabled={status === "sending"}
                className="bg-primary text-white font-bold brut-label text-sm px-8 py-3 transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>

              {status === "success" && (
                <span className="brut-label text-xs font-bold text-accent border-l-2 border-accent pl-3">
                  {FORMSPREE_ID ? "Message sent — thank you!" : "Opening your email app…"}
                </span>
              )}
              {status === "error" && (
                <span className="brut-label text-xs font-bold text-primary border-l-2 border-primary pl-3">
                  Something went wrong — email me directly.
                </span>
              )}
            </div>
          </motion.form>

          {/* Direct links */}
          <motion.div
            {...fadeUp}
            transition={tr(0.26)}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <a
              href={`mailto:${EMAIL}`}
              className="block border-l-[3px] border-accent pl-5 transition hover:pl-6"
            >
              <p className="brut-label text-[10px] text-accent">Email</p>
              <p className="font-bold text-lg mt-1 break-all text-textmain">{EMAIL}</p>
            </a>
            <a
              href="https://www.linkedin.com/in/zahraa-salim/"
              target="_blank"
              rel="noreferrer"
              className="block border-l-[3px] border-primary pl-5 transition hover:pl-6"
            >
              <p className="brut-label text-[10px] text-primary">LinkedIn</p>
              <p className="font-bold text-lg mt-1 text-textmain">in/zahraa-salim</p>
            </a>
            <a
              href="https://github.com/Zahraa-Salim"
              target="_blank"
              rel="noreferrer"
              className="block border-l-[3px] border-accent pl-5 transition hover:pl-6"
            >
              <p className="brut-label text-[10px] text-accent">GitHub</p>
              <p className="font-bold text-lg mt-1 text-textmain">@Zahraa-Salim</p>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
