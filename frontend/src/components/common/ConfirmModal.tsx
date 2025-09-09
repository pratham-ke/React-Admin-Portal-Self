import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, title = "Confirm", description = "Are you sure?", confirmText = "Yes", cancelText = "Cancel", onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="px-4 py-3 border-b">
          <h3 className="text-gray-900 font-semibold">{title}</h3>
        </div>
        <div className="p-4 text-gray-700">{description}</div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded border" onClick={onCancel} type="button">{cancelText}</button>
          <button className="px-4 py-2 rounded bg-[#488010] hover:bg-[#36610c] text-white" onClick={onConfirm} type="button">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;


