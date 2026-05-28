/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Findash brand colors
        fin: {
          bg: "#080c14",
          surface: "#0d1421",
          card: "#111827",
          border: "#1f2937",
          muted: "#1a2336",
          "text-primary": "#f1f5f9",
          "text-secondary": "#94a3b8",
          green: "#10b981",
          "green-dim": "#064e3b",
          red: "#ef4444",
          "red-dim": "#450a0a",
          blue: "#3b82f6",
          "blue-dim": "#1e3a5f",
          yellow: "#f59e0b",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(16,185,129,0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "fin-gradient": "linear-gradient(135deg, #0d1421 0%, #080c14 100%)",
        "card-gradient": "linear-gradient(135deg, #111827 0%, #0d1421 100%)",
        "green-gradient": "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
        "red-gradient": "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
      },
    },
  },
  plugins: [],
};