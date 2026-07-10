export default function Header({ username, stats, onLogout }) {
  return (
    <header className="border-b border-rule">
      <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-amber uppercase">
            Tracker
          </p>
          <h1 className="font-display text-2xl text-ink2-text -mt-0.5">
            Learning Progress
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <p className="font-mono text-xs text-ink2-muted">
              {stats.completedCourses}/{stats.totalCourses} courses complete
            </p>
            <p className="font-mono text-xs text-ink2-faint">
              {stats.completedSubtopics}/{stats.totalSubtopics} items ticked
            </p>
          </div>
          <div className="h-8 w-px bg-rule hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-ink2-text">{username}</span>
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
