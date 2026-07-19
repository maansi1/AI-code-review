/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F14",
          900: "#121821",
          800: "#171F2A",
          700: "#232F3D",
          600: "#33465A",
        },
        paper: "#E8ECF1",
        muted: "#8895A7",
        signal: {
          critical: "#FF6B5B",
          high: "#FF9466",
          medium: "#F5A623",
          low: "#5FB4E8",
          info: "#8895A7",
          mint: "#4FD1A5",
          lavender: "#A78BFA",
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};
