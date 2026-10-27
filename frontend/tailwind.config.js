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
        // Post ad form palette (blue-grey, like jiji.com.et)
        form: {
          bg: "#E9F0F7",
          border: "#8FB0BF",
          label: "#6A8796",
          hint: "#A5B7C1",
          heading: "#7D8B93",
          off: "#DCE6EC",
          offtext: "#C3D1D9",
          btnoff: "#D2DEE4",
          btnofftext: "#9DB2BD",
          tile: "#F2FAF5",
          tileicon: "#A9E5BE",
          ok: "#4ED08B",
          clear: "#FF8F94",
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