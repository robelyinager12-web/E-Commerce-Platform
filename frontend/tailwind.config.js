/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF7",
        ink: "#1C1B1A",
        muted: "#6B6560",
        hairline: "#E4E1D9",
        teal: {
          DEFAULT: "#0F5257",
          dark: "#0B3D41",
          light: "#E4EEEE",
        },
        gold: {
          DEFAULT: "#C99A3B",
          dark: "#A87F2C",
          light: "#F7EDD8",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};