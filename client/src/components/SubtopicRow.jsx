import Checkmark from "./Checkmark.jsx";
import EditableTitle from "./EditableTitle.jsx";

export default function SubtopicRow({ subtopic, onToggle, onRename, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-1.5 pl-1 group">
      <Checkmark
        checked={subtopic.completed}
        onToggle={onToggle}
        label={subtopic.title}
      />
      <EditableTitle
        value={subtopic.title}
        onSave={onRename}
        onDelete={onDelete}
        className={`text-sm ${
          subtopic.completed ? "text-ink2-faint line-through" : "text-ink2-text"
        }`}
        deleteConfirm="Delete this subtopic?"
      />
    </div>
  );
}
