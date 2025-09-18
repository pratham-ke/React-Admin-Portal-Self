import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createUser, updateUser, fetchUserById } from "../../store/slices/userSlice";
import { showSuccess, showError } from "../../store/slices/notificationSlice";
import ImageUploader from "../../components/common/ImageUploader";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const UserFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, currentUser, loading } = useAppSelector((s) => s.users as any);

  const [form, setForm] = useState<{ name: string; email: string; role: string; active: boolean; file?: File | null; imageUrl?: string | null; password?: string; confirmPassword?: string }>(
    { name: "", email: "", role: "user", active: true, file: null, imageUrl: null, password: "", confirmPassword: "" }
  );
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const nid = Number(id);
      const existing = items.find((u: any) => u.id === nid);
      if (existing) {
        setForm({ name: existing.name ?? "", email: existing.email ?? "", role: existing.role ?? "user", active: !!existing.active, file: null, imageUrl: existing.imageUrl ?? null, password: "", confirmPassword: "" });
      } else {
        // fetch single user
        dispatch(fetchUserById(nid));
      }
    }
  }, [isEdit, id, items, dispatch]);

  useEffect(() => {
    if (isEdit && currentUser && Number(id) === Number(currentUser.id)) {
      setForm({ name: currentUser.name ?? "", email: currentUser.email ?? "", role: currentUser.role ?? "user", active: !!currentUser.active, file: null, imageUrl: currentUser.imageUrl ?? null, password: "", confirmPassword: "" });
    }
  }, [currentUser, isEdit, id]);

  const validate = () => {
    const e: { name?: string; email?: string; password?: string; confirmPassword?: string; file?: string } = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    // RFC 5322-ish email regex (practical)
    const emailRe = /^(?:[a-zA-Z0-9_'^&+\-\/=?`{|}~]+(?:\.[a-zA-Z0-9_'^&+\-\/=?`{|}~]+)*)@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/;
    if (form.email && !emailRe.test(form.email)) e.email = "Please enter a valid email address";

    // Password rules (enterprise-grade)
    const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&!^*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!isEdit) {
      if (!form.password || !form.password.trim()) e.password = "Password is required";
      else if (!pwdRe.test(form.password || "")) e.password = "Password must be 8+ chars with upper, lower, digit and special char";
      if ((form.password || "") !== (form.confirmPassword || "")) e.confirmPassword = "Passwords do not match";
    } else {
      // edit: password optional, but if provided must be valid and match
      if (form.password && !pwdRe.test(form.password)) e.password = "Password must be 8+ chars with upper, lower, digit and special char";
      if (form.password && (form.password !== form.confirmPassword)) e.confirmPassword = "Passwords do not match";
    }

    // file size is validated by ImageUploader; backend will enforce type/size as well

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit) {
        await dispatch(updateUser({ id: Number(id), data: { name: form.name, email: form.email, role: form.role, active: form.active, file: form.file, password: form.password || undefined, confirmPassword: form.confirmPassword || undefined } })).unwrap();
        dispatch(showSuccess("Updated successfully"));
      } else {
        await dispatch(createUser({ name: form.name, email: form.email, role: form.role, active: form.active, password: form.password || undefined, confirmPassword: form.confirmPassword || undefined, file: form.file })).unwrap();
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
            <ImageUploader
              initialFile={form.file ?? null}
              initialUrl={form.imageUrl ? `http://localhost:5000/uploads/user/${form.imageUrl}` : undefined}
              onFileChange={(f) => setForm((s) => ({ ...s, file: f ?? null }))}
              onRemove={() => setForm((s) => ({ ...s, file: null, imageUrl: null }))}
              accept=".jpg,.jpeg,.png"
              label="Profile Image"
              rounded
            />
          </div>
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
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} className={`w-full rounded border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-700'}`} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} className={`w-full rounded border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-700'}`} value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>
            </>
          )}
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

