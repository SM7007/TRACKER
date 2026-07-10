import { useState } from "react";

export default function EditableTitle({
  value,
  onSave,
  onDelete,
  as: Tag = "span",
  className = "",
  deleteConfirm = "Delete this?",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isDeleting, setIsDeleting] = useState(false);

  async function commit() {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed && trimmed !== value) {
      await onSave(trimmed);
    } else {
      setDraft(value);
    }
  }

  async function handleDelete() {
    if (window.confirm(deleteConfirm)) {
      setIsDeleting(true);
      try {
        await onDelete?.();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`bg-raised border border-amber rounded px-1.5 py-0.5 outline-none ${className}`}
      />
    );
  }

  return (
    <span className="group/title inline-flex items-center gap-2 min-w-0">
      <Tag className={`${className} truncate`}>{value}</Tag>
      <span className="opacity-70 group-hover/title:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-ink2-faint hover:text-amber p-1.5 -m-0.5"
          aria-label="Edit"
          title="Edit"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" strokeLinecap="round" />
            <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`text-ink2-faint hover:text-red-400 p-1.5 -m-0.5 ${
              isDeleting ? "opacity-60 cursor-wait" : ""
            }`}
            aria-label="Delete"
            title="Delete"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" strokeLinecap="round" />
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </span>
    </span>
  );
}
