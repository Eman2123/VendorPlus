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
        // App-shell (dashboard) palette, inspired by the Spica admin template —
        // kept separate from the landing page's ink/paper/accent (teal).
        navy: "#27293d",
        violet: {
          DEFAULT: "#6640b2",
          dark: "#5636a0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
