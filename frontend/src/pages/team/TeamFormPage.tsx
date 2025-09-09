import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createTeamMember, updateTeamMember, fetchTeam, type TeamMember } from "../../store/slices/teamSlice";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const TeamFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.team);

  const [form, setForm] = useState<{ name: string; position: string; email?: string; linkedin?: string; biography?: string; status: string; file?: File | null }>({ name: "", position: "", email: "", linkedin: "", biography: "", status: "active", file: null });
  const [errors, setErrors] = useState<{ name?: string; position?: string }>({});

  useEffect(() => {
    if (!items.length) dispatch(fetchTeam(undefined));
  }, [dispatch, items.length]);

  useEffect(() => {
    if (isEdit) {
      const m = items.find((x) => String(x.id) === String(id));
      if (m) {
        setForm({ name: m.name, position: m.position, email: m.email, linkedin: m.linkedin, biography: m.biography, status: m.status ?? "active", file: null });
      }
    }
  }, [isEdit, id, items]);

  const validate = () => {
    const e: { name?: string; position?: string } = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.position.trim()) e.position = "Position is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit) {
        await dispatch(updateTeamMember({ id: Number(id), data: form })).unwrap();
        dispatch(showSuccess("Updated successfully"));
      } else {
        await dispatch(createTeamMember(form as any)).unwrap();
        dispatch(showSuccess("Saved successfully"));
      }
      navigate("/dashboard/team", { replace: true });
    } catch (error) {
      dispatch(showError("Action failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? "Edit Team Member" : "Add New Team Member"}</h1>
        <div className="flex items-center gap-2">
          <button type="button" className="px-4 py-2 rounded border" onClick={() => navigate(-1)}>Back</button>
          <button type="submit" form="teamForm" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800" disabled={loading}>{loading ? "Saving..." : isEdit ? "Save" : "Add Member"}</button>
        </div>
      </div>

      <form id="teamForm" onSubmit={onSubmit} className="bg-white border border-gray-200 rounded p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden">
              {/* image preview */}
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-700 mb-1">Upload Picture</label>
              <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name *</label>
            <input className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-700"}`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Position *</label>
            <input className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${errors.position ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-700"}`} value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
            {errors.position && <p className="text-xs text-red-600 mt-1">{errors.position}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">LinkedIn URL</label>
            <input className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700" value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Biography</label>
            <textarea className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700 min-h-[220px]" value={form.biography} onChange={(e) => setForm((f) => ({ ...f, biography: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Status</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={form.status === "active"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "active" : "inactive" }))} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ form.status === "active" ? "bg-green-600" : "bg-gray-300" }`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ form.status === "active" ? "translate-x-5" : "translate-x-0" }`}></span>
              </span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeamFormPage;


