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
          DEFAULT: "#00A63E",
          dark: "#008A32",
          light: "#E6F7EC",
        },
        gold: {
          DEFAULT: "#FF9D3A",
          dark: "#EE8A22",
          light: "#FFF1DE",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Noto Serif Ethiopic", "serif"],
        sans: ["Inter", "Noto Sans Ethiopic", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};