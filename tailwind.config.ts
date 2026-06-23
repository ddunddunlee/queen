import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070914",
        panel: "#101521",
        panelSoft: "#151b2a",
        line: "#253044",
        mint: "#39d98a",
        sky: "#4fb9ff",
        violet: "#9b7cff",
        amber: "#ffc857"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(79,185,255,.18), 0 18px 60px rgba(0,0,0,.28)"
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
