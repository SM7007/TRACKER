import { useState } from "react";
import TopicBlock from "./TopicBlock.jsx";
import TallyProgress from "./TallyProgress.jsx";
import EditableTitle from "./EditableTitle.jsx";
import CompletePill from "./CompletePill.jsx";
import InlineAddForm from "./InlineAddForm.jsx";
import BulkImportOutline from "./BulkImportOutline.jsx";

export default function CourseCard({
  course,
  index,
  onRenameCourse,
  onDeleteCourse,
  onAddTopic,
  onRenameTopic,
  onDeleteTopic,
  onAddSubtopic,
  onToggleSubtopic,
  onRenameSubtopic,
  onDeleteSubtopic,
}) {
  const [expanded, setExpanded] = useState(false);
  const done = course.topics.filter((t) => t.completed).length;
  const total = course.topics.length;

  return (
    <div className="bg-surface border border-rule rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] tracking-[0.25em] text-amber uppercase mb-1">
            Course {String(index + 1).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <EditableTitle
              value={course.title}
              onSave={onRenameCourse}
              onDelete={onDeleteCourse}
              as="h2"
              className="font-display italic text-2xl text-ink2-text"
              deleteConfirm="Delete this whole course, its topics and subtopics?"
            />
            {course.completed && <CompletePill />}
          </div>
          {course.description && (
            <p className="text-sm text-ink2-muted mt-1.5 max-w-xl">
              {course.description}
            </p>
          )}
          <div className="mt-3">
            <TallyProgress done={done} total={total} tone="amber" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-ink2-muted hover:text-ink2-text border border-rule rounded-lg p-2 mt-1"
          aria-label={expanded ? "Collapse course" : "Expand course"}
        >
          <svg
            width="16"
            height="16"
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
        <div className="px-4 sm:px-6 pb-5">
          {course.topics.map((topic, i) => (
            <TopicBlock
              key={topic.id}
              topic={topic}
              index={i}
              onRenameTopic={(title) => onRenameTopic(topic.id, title)}
              onDeleteTopic={() => onDeleteTopic(topic.id)}
              onAddSubtopic={(title) => onAddSubtopic(topic.id, title)}
              onToggleSubtopic={(subId) => onToggleSubtopic(topic.id, subId)}
              onRenameSubtopic={(subId, title) =>
                onRenameSubtopic(topic.id, subId, title)
              }
              onDeleteSubtopic={(subId) => onDeleteSubtopic(topic.id, subId)}
              courseId={course.id}
            />
          ))}
          <div className="mt-3 pt-3 border-t border-rule/70 flex flex-wrap items-center gap-3">
            <InlineAddForm
              placeholder="New topic title"
              buttonLabel="Add topic"
              onSubmit={(title) => onAddTopic(title)}
            />
            <BulkImportOutline
              onAddTopic={(title) => onAddTopic(title)}
              onAddSubtopic={(topicId, title) => onAddSubtopic(topicId, title)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
