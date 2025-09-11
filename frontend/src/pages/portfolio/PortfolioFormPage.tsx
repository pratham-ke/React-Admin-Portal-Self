import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createPortfolioItem, updatePortfolioItem, fetchPortfolio } from "../../store/slices/portfolioSlice";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const PortfolioFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.portfolio);

  const [form, setForm] = useState<{ 
    name: string; 
    description: string; 
    status: string; 
    isVisible: boolean; 
    file?: File | null 
  }>({ 
    name: "", 
    description: "", 
    status: "Active", 
    isVisible: true, 
    file: null 
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (!items.length) dispatch(fetchPortfolio(undefined));
  }, [dispatch, items.length]);

  useEffect(() => {
    if (isEdit) {
      const item = items.find((x) => String(x.id) === String(id));
      if (item) {
        setForm({ 
          name: item.name, 
          description: item.description ?? "", 
          status: item.status ?? "Active", 
          isVisible: item.isVisible ?? true, 
          file: null 
        });
      }
    }
  }, [isEdit, id, items]);

  const validate = () => {
    const e: { name?: string } = {};
    if (!form.name.trim()) e.name = "Name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit) {
        await dispatch(
          updatePortfolioItem({
            id: Number(id),
            data: { ...form, file: form.file ?? undefined }
          })
        ).unwrap();
        dispatch(showSuccess("Updated successfully"));
      } else {
        await dispatch(createPortfolioItem(form as any)).unwrap();
        dispatch(showSuccess("Saved successfully"));
      }
      navigate("/dashboard/portfolio", { replace: true });
    } catch (error) {
      dispatch(showError("Action failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? "Edit Portfolio Item" : "Add New Portfolio Item"}</h1>
        <div className="flex items-center gap-2">
          <button type="button" className="px-4 py-2 rounded border" onClick={() => navigate(-1)}>Back</button>
          <button type="submit" form="portfolioForm" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800" disabled={loading}>{loading ? "Saving..." : isEdit ? "Save" : "Add Item"}</button>
        </div>
      </div>

      <form id="portfolioForm" onSubmit={onSubmit} className="bg-white border border-gray-200 rounded p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="w-40 h-40 rounded bg-gray-100 overflow-hidden">
              {/* image preview */}
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-700 mb-1">Upload Image</label>
              <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name *</label>
            <input 
              className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-700"}`} 
              value={form.name} 
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700 min-h-[120px]" 
              value={form.description} 
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Status</span>
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={form.status === "Active"} 
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "Active" : "Exit" }))} 
              />
              <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ form.status === "Active" ? "bg-green-600" : "bg-gray-300" }`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ form.status === "Active" ? "translate-x-5" : "translate-x-0" }`}></span>
              </span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Visible</span>
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={form.isVisible} 
                onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))} 
              />
              <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ form.isVisible ? "bg-green-600" : "bg-gray-300" }`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ form.isVisible ? "translate-x-5" : "translate-x-0" }`}></span>
              </span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PortfolioFormPage;
