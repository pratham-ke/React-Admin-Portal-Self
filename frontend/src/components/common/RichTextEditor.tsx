import React from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

// Lightweight editor wrapper - currently uses a textarea to avoid adding deps.
const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  return (
    <textarea
      className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700 min-h-[220px]"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default RichTextEditor;
