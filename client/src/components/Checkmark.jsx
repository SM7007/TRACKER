import { useState } from "react";

export default function Checkmark({ checked, onToggle, label }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onToggle?.();
    } catch (error) {
      console.error("Toggle failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-pressed={checked}
      aria-label={checked ? `Mark "${label}" incomplete` : `Mark "${label}" complete`}
      className={`shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
        isLoading ? "opacity-60 cursor-wait" : ""
      } ${
        checked
          ? "bg-teal/15 border-teal"
          : "bg-transparent border-rule hover:border-ink2-muted"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2.5 7.2L5.6 10.3L11.5 3.8"
          stroke="rgb(var(--color-teal))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`checkmark-path ${checked ? "is-checked" : ""}`}
        />
      </svg>
    </button>
  );
}
