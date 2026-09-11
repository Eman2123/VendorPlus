import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tier0: "#16a34a", // Confirmed - green
        tier1: "#84cc16", // Likely - lime
        tier2: "#eab308", // At Risk - yellow
        tier3: "#f97316", // High Risk - orange
        tier4: "#dc2626", // Critical - red
        ink: {
          DEFAULT: "#101314",
          light: "#1a1f21",
        },
        paper: "#f7f6f2",
        accent: {
          DEFAULT: "#0d9488",
          dark: "#0f766e",
        },
        // App-shell (dashboard) palette — deep navy + teal.
        // "violet" key name kept as-is so Sidebar/dashboard/etc don't need
        // per-file edits; it now resolves to teal shades instead of purple.
        navy: "#1a2138",
        violet: {
          DEFAULT: "#0d9488",
          dark: "#0f766e",
          light: "#2dd4bf",
        },
      },
    },
  },
  plugins: [],
};
export default config;