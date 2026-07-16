module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        textmain: "rgb(var(--textmain) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
