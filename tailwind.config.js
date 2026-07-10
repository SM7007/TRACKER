/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14161F",
        surface: "#1C2030",
        raised: "#242A44",
        rule: "#2E3350",
        amber: {
          DEFAULT: "#E8A94C",
          soft: "#F2C784",
        },
        teal: {
          DEFAULT: "#4FD1AE",
          soft: "#8FE6CB",
        },
        ink2: {
          text: "#ECEAE3",
          muted: "#8B90A8",
          faint: "#565C78",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
