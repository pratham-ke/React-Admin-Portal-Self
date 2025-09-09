import React, { useState, useRef, useEffect } from "react";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button 
        type="button" 
        aria-haspopup="menu" 
        aria-expanded={open} 
        onClick={() => setOpen((v) => !v)} 
        className="p-2" 
        aria-label="Open actions"
      >
        <EllipsisVerticalIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow z-10">
          {onView && (
            <button 
              role="menuitem" 
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2" 
              onClick={() => { setOpen(false); onView(); }}
            >
              <EyeIcon className="w-5 h-5 text-gray-600" />
              <span>View</span>
            </button>
          )}
          {onEdit && (
            <button 
              role="menuitem" 
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2" 
              onClick={() => { setOpen(false); onEdit(); }}
            >
              <PencilIcon className="w-5 h-5 text-gray-600" />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button 
              role="menuitem" 
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600" 
              onClick={() => { setOpen(false); onDelete(); }}
            >
              <TrashIcon className="w-5 h-5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;


