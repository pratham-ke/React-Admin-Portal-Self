import React, { useEffect, useState, useRef } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

interface Props {
  initialFile?: File | null;
  initialUrl?: string | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  label?: string;
  rounded?: boolean;
}

const ImageUploader: React.FC<Props> = ({
  initialFile = null,
  initialUrl = null,
  onFileChange,
  accept = "image/*",
  label = "Upload Image",
  rounded = false,
}) => {
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(initialUrl ?? null);
  }, [file, initialUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB");
      return;
    }
    setError(null);
    setFile(f);
    onFileChange(f);
  };

  const handleRemoveImage = () => {
    setFile(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div
        className={`w-40 h-40 ${
          rounded ? "rounded-full" : "rounded"
        } bg-gray-100 overflow-hidden flex items-center justify-center relative group`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleEditClick}
                className="text-white text-lg"
              >
                <FaPencilAlt />
              </button>
              <button 
                type="button"
                onClick={handleRemoveImage}
                className="text-white text-lg"
              > 
                <FaTrash />
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-400">No image</div>
        )}
      </div>
      <div className="mt-3">
        <label className="block text-sm text-gray-700 mb-1">{label}</label>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        {!preview && (
          <button
            type="button"
            onClick={handleEditClick}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Upload
          </button>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUploader;
