import { useState } from "react";

/**
 * Strips markdown/emoji noise from a pasted line so only the clean
 * title text remains — e.g. "**useState()** ✅" -> "useState()".
 */
function cleanTitle(raw) {
  return raw
    .replace(/\*\*/g, "")               // markdown bold
    .replace(/`/g, "")                  // inline code backticks
    .replace(/[\u2705\u2B50\uFE0F]+/g, "") // ✅ ⭐ and variation-selector noise
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses a pasted outline into a topic/subtopic tree.
 *   "1. Topic title"      -> starts a new topic
 *   "* Subtopic" / "- x"  -> subtopic under the current topic
 *   anything else         -> ignored (plain descriptions, blank lines, etc.)
 */
function parseOutline(raw) {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const topics = [];
  let current = null;

  for (const line of lines) {
    const topicMatch = line.match(/^\d+[.)]\s*(.+)$/);
    const bulletMatch = line.match(/^[*\-]\s*(.+)$/);

    if (topicMatch) {
      const title = cleanTitle(topicMatch[1]);
      if (!title) continue;
      current = { title, subtopics: [] };
      topics.push(current);
    } else if (bulletMatch && current) {
      const title = cleanTitle(bulletMatch[1]);
      if (title) current.subtopics.push(title);
    }
    // any other line (plain descriptive text) is skipped on purpose
  }

  return topics;
}

export default function BulkImportOutline({ onAddTopic, onAddSubtopic }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState("");

  const preview = open ? parseOutline(text) : [];

  async function handleImport(e) {
    e.preventDefault();
    const topics = parseOutline(text);
    if (topics.length === 0) return;

    setImporting(true);
    try {
      for (const t of topics) {
        setProgress(`Adding "${t.title}"…`);
        const topic = await onAddTopic(t.title);
        const topicId = topic?.id;
        if (!topicId) continue; // safety: skip subtopics if topic creation didn't return an id

        for (const subTitle of t.subtopics) {
          setProgress(`Adding "${subTitle}"…`);
          await onAddSubtopic(topicId, subTitle);
        }
      }
      setText("");
      setOpen(false);
    } catch (error) {
      console.error("Bulk import failed:", error);
      alert(
        `Import stopped partway due to an error: ${
          error.response?.data?.error || error.message
        }. What was added so far is saved — you can paste the rest again.`
      );
    } finally {
      setImporting(false);
      setProgress("");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-xs text-ink2-muted hover:text-amber transition py-2"
      >
        + Paste full outline
      </button>
    );
  }

  return (
    <form onSubmit={handleImport} className="space-y-2">
      <div className="bg-raised/60 border border-rule/70 rounded-md px-3 py-2 space-y-1">
        <p className="font-mono text-[11px] text-ink2-muted uppercase tracking-wide mb-1">
          How it reads your paste
        </p>
        <ul className="font-mono text-[11px] text-ink2-faint space-y-0.5">
          <li>
            <span className="text-teal">1. Title</span> or{" "}
            <span className="text-teal">1) Title</span> → new topic
          </li>
          <li>
            <span className="text-teal">* item</span> or{" "}
            <span className="text-teal">- item</span> → subtopic under the topic above it
          </li>
          <li>
            <span className="text-ink2-muted">Plain sentences</span> (no number/bullet) →
            skipped
          </li>
          <li>
            <span className="text-ink2-muted">✅ ⭐ **bold** `code`</span> → stripped out
            automatically
          </li>
        </ul>
      </div>

      <textarea
        autoFocus
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={importing}
        placeholder={`Paste a numbered outline, e.g.\n1. Topic title\n* Subtopic one\n* Subtopic two\n2. Next topic\n* Another subtopic`}
        className="w-full bg-raised border border-rule rounded-md px-2.5 py-1.5 text-sm text-ink2-text placeholder:text-ink2-faint focus:border-amber outline-none transition resize-y font-mono disabled:opacity-60"
      />

      {preview.length > 0 && (
        <p className="font-mono text-[11px] text-ink2-muted">
          Found {preview.length} topic{preview.length === 1 ? "" : "s"} with{" "}
          {preview.reduce((n, t) => n + t.subtopics.length, 0)} subtopic
          {preview.reduce((n, t) => n + t.subtopics.length, 0) === 1 ? "" : "s"} total.
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={importing || preview.length === 0}
          className="text-xs font-mono bg-amber text-ink rounded-md px-2.5 py-1.5 hover:bg-amber-soft transition disabled:opacity-60"
        >
          {importing ? progress || "Importing…" : "Import outline"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setText("");
          }}
          disabled={importing}
          className="text-xs font-mono text-ink2-muted hover:text-ink2-text px-1 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
