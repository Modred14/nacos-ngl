/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      screens: {
        xs: "350px",
      },

      colors: {
        brand: {
          50: "#f0f9f4",
          100: "#dcf1e6",
          200: "#bbe3cf",
          300: "#8acdb1",
          400: "#55b08e",
          500: "#329470",
          600: "#22785b",
          700: "#1b5f49",
          800: "#174c3b",
          900: "#143f31",
          950: "#0a231c",
        },

        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },

        surface: {
          50: "#fafaf9",
          100: "#f5f4f1",
          200: "#e8e6e0",
          300: "#d4d1c9",
          400: "#b5b0a5",
          500: "#8a8479",
          600: "#6b665d",
          700: "#514d47",
          800: "#3c3935",
          900: "#2a2825",
          950: "#1a1917",
        },
      },

      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },

        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(12px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },

  plugins: [],
};

export default config;
