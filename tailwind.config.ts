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
        ink: "#f6f9ff",
        panel: "#ffffff",
        panelSoft: "#edf5ff",
        line: "#c9d8e8",
        mint: "#10b981",
        sky: "#2678ff",
        violet: "#7c5cff",
        amber: "#d97706"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(38,120,255,.10), 0 18px 50px rgba(30,64,175,.10)"
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
