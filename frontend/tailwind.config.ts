import type { Config } from "tailwindcss";

const config: Config = {
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
      },
    },
  },
  plugins: [],
};
export default config;
