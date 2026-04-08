/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050508",
        cyber: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
        studio: {
          bg: "var(--bg-primary)",
          surface: "var(--bg-secondary)",
          card: "var(--bg-card)",
          accent: "var(--accent)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 80px -20px rgba(99, 102, 241, 0.25)",
        "glow-sm": "0 0 50px -25px rgba(129, 140, 248, 0.2)",
        depth: "0 32px 64px -16px rgba(0, 0, 0, 0.6)",
        card: "0 20px 50px -12px rgba(0, 0, 0, 0.55)",
      },
    },
  },
  plugins: [],
};
