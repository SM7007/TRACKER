export default function AuthShell({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-amber uppercase mb-3">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl text-ink2-text">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-ink2-muted">{subtitle}</p>
          )}
        </div>

        <div className="bg-surface border border-rule rounded-2xl p-8 shadow-xl shadow-black/20">
          {children}
        </div>

        <p className="text-center text-xs text-ink2-faint mt-6 font-mono">
          Tracker — a quiet place to track what you're learning
        </p>
      </div>
    </div>
  );
}
