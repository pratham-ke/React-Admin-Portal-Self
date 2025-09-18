import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchUserById, updateUser } from "../../store/slices/userSlice";
import ImageUploader from "../../components/common/ImageUploader";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authUser = useAppSelector((s) => s.auth.user);
  const userState = useAppSelector((s) => s.users);
  const [form, setForm] = useState<any>({ name: "", email: "", role: "user", active: true, file: null });

  useEffect(() => {
    if (authUser && authUser.id) dispatch(fetchUserById(authUser.id));
  }, [authUser, dispatch]);

  useEffect(() => {
    if (userState.currentUser) {
      setForm({ name: userState.currentUser.name ?? "", email: userState.currentUser.email ?? "", role: userState.currentUser.role ?? "user", active: userState.currentUser.active ?? true, file: null });
    }
  }, [userState.currentUser]);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!authUser) return;
    try {
      const updated = await dispatch(updateUser({ id: authUser.id, data: { name: form.name, email: form.email, role: form.role, active: form.active, file: form.file } })).unwrap();
      // Update localStorage and auth user for navbar/profile icon
      if (updated && updated.imageUrl) {
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const userObj = JSON.parse(stored);
            userObj.imageUrl = updated.imageUrl;
            localStorage.setItem("user", JSON.stringify(userObj));
          }
        } catch {}
      }
      dispatch(showSuccess("Profile updated"));
    } catch (err) {
      dispatch(showError("Failed to update profile"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
          <button type="submit" form="profileForm" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Save</button>
        </div>
      </div>
      <form id="profileForm" onSubmit={onSubmit} className="bg-white border border-gray-200 rounded p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ImageUploader initialFile={null} initialUrl={userState.currentUser?.imageUrl} onFileChange={(f) => setForm((s: any) => ({ ...s, file: f }))} onRemove={() => setForm((s: any) => ({ ...s, file: null, imageUrl: undefined }))} rounded label="Profile Image" />
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700" value={form.name} onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700" value={form.email} readOnly />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Role</label>
            <select className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700" value={form.role} onChange={(e) => setForm((s: any) => ({ ...s, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>
        {/* Biography removed from Profile page per requirements */}
      </form>
    </div>
  );
};

export default ProfilePage;