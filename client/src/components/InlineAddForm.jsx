import { useState } from "react";

export default function InlineAddForm({ placeholder, buttonLabel, onSubmit, compact }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setSubmitting(true);
    try {
      // Add one at a time, in order, so positions/order stay correct.
      for (const line of lines) {
        await onSubmit(line);
      }
      setValue("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`font-mono text-xs text-ink2-muted hover:text-amber transition ${
          compact ? "py-1.5" : "py-2"
        }`}
      >
        + {buttonLabel}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <textarea
        autoFocus
        rows={1}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
          if (e.key === "Escape") {
            setOpen(false);
            setValue("");
          }
        }}
        placeholder={`${placeholder} (paste multiple lines to add them all)`}
        className="flex-1 bg-raised border border-rule rounded-md px-2.5 py-1.5 text-sm text-ink2-text placeholder:text-ink2-faint focus:border-amber outline-none transition resize-none leading-normal"
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-xs font-mono bg-amber text-on-accent rounded-md px-2.5 py-1.5 hover:bg-amber-soft transition disabled:opacity-60"
      >
        {submitting ? "Adding…" : "Add"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setValue("");
        }}
        className="text-xs font-mono text-ink2-muted hover:text-ink2-text px-1"
      >
        Cancel
      </button>
    </form>
  );
}
