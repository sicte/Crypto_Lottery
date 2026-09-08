import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          green: "#39FF14",
          pink: "#FF10F0",
          blue: "#00F0FF",
          yellow: "#FFE500",
          orange: "#FF6B00",
        },
        surface: {
          900: "#0A0A0F",
          800: "#12121A",
          700: "#1A1A25",
          600: "#222230",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(57, 255, 20, 0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(57, 255, 20, 0.6)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
