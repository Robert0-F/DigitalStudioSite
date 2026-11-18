/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fffbf7",
          100: "#f3f0ea",
          200: "#e8e2d8",
        },
        ink: {
          DEFAULT: "#171411",
          muted: "#5c564e",
        },
        teal: {
          DEFAULT: "#0f5c4c",
          deep: "#0c4a3d",
          soft: "#147a66",
          muted: "#d7ebe4",
        },
        clay: {
          DEFAULT: "#b45309",
          soft: "#f3e0c8",
        },
        paper: {
          bg: "var(--bg-primary)",
          surface: "var(--bg-secondary)",
          card: "var(--bg-card)",
          inverse: "var(--bg-inverse)",
          accent: "var(--accent)",
          signal: "var(--signal)",
          muted: "var(--text-muted)",
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
        soft: "0 18px 40px -24px rgba(23, 20, 17, 0.32)",
        card: "0 20px 48px -28px rgba(23, 20, 17, 0.28)",
        lift: "0 22px 44px -22px rgba(15, 92, 76, 0.28)",
      },
      borderRadius: {
        card: "1.125rem",
        device: "0.875rem",
      },
    },
  },
  plugins: [],
};
