import { useTheme } from "../context/ThemeContext.jsx";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="shrink-0 text-ink2-muted hover:text-amber border border-rule hover:border-amber/40 rounded-md p-2 transition"
    >
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4.5" />
          <path
            strokeLinecap="round"
            d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
          />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
          />
        </svg>
      )}
    </button>
  );
}

export default function Header({ username, stats, onLogout }) {
  return (
    <header className="border-b border-rule">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-amber uppercase">
            Tracker
          </p>
          <h1 className="font-display text-xl sm:text-2xl text-ink2-text -mt-0.5">
            Learning Progress
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-5">
          <div className="text-right hidden md:block">
            <p className="font-mono text-xs text-ink2-muted">
              {stats.completedCourses}/{stats.totalCourses} courses complete
            </p>
            <p className="font-mono text-xs text-ink2-faint">
              {stats.completedSubtopics}/{stats.totalSubtopics} items ticked
            </p>
          </div>
          <div className="h-8 w-px bg-rule hidden md:block" />
          <ThemeToggle />
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono text-sm text-ink2-text truncate max-w-[90px] sm:max-w-none">
              {username}
            </span>
            <button
              onClick={onLogout}
              className="text-xs font-mono text-ink2-muted hover:text-red-400 border border-rule hover:border-red-400/40 rounded-md px-2.5 py-1.5 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
