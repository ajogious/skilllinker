"use client";

import { useState } from "react";

const SUGGESTED_SKILLS = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Welding",
  "Tiling",
  "Roofing",
  "Masonry",
  "HVAC",
  "Landscaping",
  "Flooring",
  "Plastering",
  "Glazing",
  "Solar Installation",
  "Generator Repair",
];

export default function SkillTagInput({ value = [], onChange }) {
  const [input, setInput] = useState("");

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeSkill = (skill) => {
    onChange(value.filter((s) => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  };

  const suggestions = SUGGESTED_SKILLS.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase()),
  ).slice(0, 6);

  return (
    <div>
      {/* Current tags */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 text-sm bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2.5 py-1 rounded-full"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:text-indigo-100 transition-colors"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a skill and press Enter..."
        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
      />

      {/* Suggestions */}
      {input && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSkill(s)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 px-2.5 py-1 rounded-full transition-all"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {/* Quick add suggestions when empty */}
      {!input && value.length === 0 && (
        <div className="mt-2">
          <p className="text-xs text-slate-500 mb-1.5">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SKILLS.slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-white border border-slate-700 px-2.5 py-1 rounded-full transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
