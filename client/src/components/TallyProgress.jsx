// A row of tally ticks — leaning on the "ledger" metaphor instead of a
// generic rounded progress pill. Caps the rendered ticks so a topic with
// 40 subtopics doesn't render 40 bars; falls back to a proportional fill.
export default function TallyProgress({ done, total, tone = "amber" }) {
  const color = tone === "teal" ? "rgb(var(--color-teal))" : "rgb(var(--color-amber))";
  const trackColor = "rgb(var(--color-rule))";
  const maxTicks = 12;

  if (total === 0) {
    return (
      <span className="font-mono text-xs text-ink2-faint">no items yet</span>
    );
  }

  const tickCount = Math.min(total, maxTicks);
  const filledTicks = Math.round((done / total) * tickCount);

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-end gap-[3px] h-4">
        {Array.from({ length: tickCount }).map((_, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full transition-all duration-300"
            style={{
              height: i % 3 === 0 ? "16px" : "11px",
              backgroundColor: i < filledTicks ? color : trackColor,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-ink2-muted tabular-nums">
        {done}/{total}
      </span>
    </div>
  );
}
