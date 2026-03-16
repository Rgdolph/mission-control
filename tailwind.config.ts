import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#12121a",
          tertiary: "#1a1a26",
          hover: "#22222e",
          active: "#2a2a38",
        },
        border: {
          subtle: "#1e1e2e",
          default: "#2a2a3a",
          strong: "#3a3a4a",
        },
        text: {
          primary: "#e8e8ed",
          secondary: "#8b8b9e",
          tertiary: "#5c5c72",
        },
        accent: {
          blue: "#4c8dff",
          purple: "#8b5cf6",
          green: "#34d399",
          amber: "#f59e0b",
          red: "#ef4444",
          cyan: "#22d3ee",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
