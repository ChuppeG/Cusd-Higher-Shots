/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        celo: {
          green:  "#35D07F",
          yellow: "#FBCC5C",
          purple: "#6CC8FF",
          dark:   "#1E1E2E",
          card:   "#2A2A3E",
          border: "#3A3A4E",
        },
      },
      animation: {
        "number-pop": "numberPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-up":   "slideUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shake":      "shake 0.4s ease-in-out",
      },
      keyframes: {
        numberPop: {
          "0%":   { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(53, 208, 127, 0.3)" },
          "50%":      { boxShadow: "0 0 40px rgba(53, 208, 127, 0.7)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%":      { transform: "translateX(-8px)" },
          "75%":      { transform: "translateX(8px)" },
        },
      },
    },
  },
  plugins: [],
};
