/** @type {import('tailwindcss').Config} */
function withOpacity(variable) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

module.exports = {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: withOpacity("--color-ink"),
        surface: withOpacity("--color-surface"),
        raised: withOpacity("--color-raised"),
        rule: withOpacity("--color-rule"),
        amber: {
          DEFAULT: withOpacity("--color-amber"),
          soft: withOpacity("--color-amber-soft"),
        },
        teal: {
          DEFAULT: withOpacity("--color-teal"),
          soft: withOpacity("--color-teal-soft"),
        },
        ink2: {
          text: withOpacity("--color-ink2-text"),
          muted: withOpacity("--color-ink2-muted"),
          faint: withOpacity("--color-ink2-faint"),
        },
        // Fixed (non-theme-switching) dark color for text sitting on top of
        // amber/teal accent buttons — those buttons stay a mid-warm tone in
        // both themes, so their label always needs dark text, never light.
        "on-accent": "#14161F",
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
