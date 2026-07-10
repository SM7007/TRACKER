import { useState } from "react";
import SubtopicRow from "./SubtopicRow.jsx";
import TallyProgress from "./TallyProgress.jsx";
import EditableTitle from "./EditableTitle.jsx";
import CompletePill from "./CompletePill.jsx";
import InlineAddForm from "./InlineAddForm.jsx";

export default function TopicBlock({
  topic,
  index,
  onRenameTopic,
  onDeleteTopic,
  onAddSubtopic,
  onToggleSubtopic,
  onRenameSubtopic,
  onDeleteSubtopic,
}) {
  const [expanded, setExpanded] = useState(false);
  const done = topic.subtopics.filter((s) => s.completed).length;
  const total = topic.subtopics.length;

  return (
    <div className="border-t border-rule/70 first:border-t-0 pt-3 pb-1">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-start gap-2.5 text-left min-w-0 flex-1"
        >
          <span className="font-mono text-xs text-ink2-faint mt-1 shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 flex-wrap">
              <EditableTitle
                value={topic.title}
                onSave={onRenameTopic}
                onDelete={onDeleteTopic}
                className={`font-display text-lg ${
                  topic.completed ? "text-ink2-muted" : "text-ink2-text"
                }`}
                deleteConfirm="Delete this topic and all its subtopics?"
              />
              {topic.completed && <CompletePill />}
            </span>
            <span className="block mt-1">
              <TallyProgress done={done} total={total} tone="teal" />
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-ink2-faint hover:text-ink2-text p-1 mt-1"
          aria-label={expanded ? "Collapse topic" : "Expand topic"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="pl-8 mt-1">
          {topic.subtopics.map((sub) => (
            <SubtopicRow
              key={sub.id}
              subtopic={sub}
              onToggle={() => onToggleSubtopic(sub.id)}
              onRename={(title) => onRenameSubtopic(sub.id, title)}
              onDelete={() => onDeleteSubtopic(sub.id)}
            />
          ))}
          <div className="mt-1">
            <InlineAddForm
              placeholder="New subtopic title"
              buttonLabel="Add subtopic"
              onSubmit={(title) => onAddSubtopic(title)}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}
