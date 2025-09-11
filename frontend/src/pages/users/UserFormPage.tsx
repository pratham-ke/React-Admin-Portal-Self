import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createUser, updateUser, fetchUserById } from "../../store/slices/userSlice";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const UserFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, currentUser, loading } = useAppSelector((s) => s.users as any);

  const [form, setForm] = useState<{ name: string; email: string; role: string; active: boolean; file?: File | null; password?: string }>(
    { name: "", email: "", role: "user", active: true, file: null, password: "" }
  );
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (isEdit) {
      const nid = Number(id);
      const existing = items.find((u: any) => u.id === nid);
      if (existing) {
        setForm({ name: existing.name, email: existing.email, role: existing.role, active: !!existing.active, file: null, password: "" });
      } else {
        // fetch single user
        dispatch(fetchUserById(nid));
      }
    }
  }, [isEdit, id, items, dispatch]);

  useEffect(() => {
    if (isEdit && currentUser) {
      setForm({ name: currentUser.name, email: currentUser.email, role: currentUser.role, active: !!currentUser.active, file: null, password: "" });
    }
  }, [currentUser, isEdit]);

  const validate = () => {
    const e: { name?: string; email?: string } = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit) {
        await dispatch(updateUser({ id: Number(id), data: { name: form.name, email: form.email, role: form.role, active: form.active, file: form.file } })).unwrap();
        dispatch(showSuccess("Updated successfully"));
      } else {
        await dispatch(createUser({ name: form.name, email: form.email, role: form.role, active: form.active, password: form.password || undefined, file: form.file })).unwrap();
        dispatch(showSuccess("Saved successfully"));
      }
      navigate('/dashboard/users', { replace: true });
    } catch (err) {
      dispatch(showError("Action failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? "Edit User" : "Add New User"}</h1>
        <div className="flex items-center gap-2">
          <button type="button" className="px-4 py-2 rounded border" onClick={() => navigate(-1)}>Back</button>
          <button type="submit" form="userForm" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800" disabled={loading}>{loading ? "Saving..." : isEdit ? "Save" : "Add User"}</button>
        </div>
      </div>

      <form id="userForm" onSubmit={onSubmit} className="bg-white border border-gray-200 rounded p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name *</label>
            <input className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-700"}`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email *</label>
            <input className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-700"}`} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input type="password" className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700">
              <option value="admin">admin</option>
              <option value="user">user</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Profile Image</label>
            <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Active</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ form.active ? "bg-green-600" : "bg-gray-300" }`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ form.active ? "translate-x-5" : "translate-x-0" }`}></span>
              </span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserFormPage;

