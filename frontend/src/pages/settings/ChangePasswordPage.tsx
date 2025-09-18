import React, { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import apiClient from "../../services/apiClient";
import { showSuccess, showError } from "../../store/slices/notificationSlice";
import JSEncrypt from "jsencrypt";

const ChangePasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: any = {};
    if (!currentPassword.trim()) e.currentPassword = "Current password is required";
    const pwdRe = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%\^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!newPassword || !pwdRe.test(newPassword)) e.newPassword = "New password must be 8+ chars, include uppercase, number and special char";
    if (newPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      // Try to fetch server public key and encrypt passwords with RSA (base64 output expected by backend)
      let payload: any = { currentPassword, newPassword };
      try {
        const res = await apiClient.get(`/auth/public-key`);
        const pubKey = res.data as string;
        if (pubKey && pubKey.includes('BEGIN PUBLIC KEY')) {
          const crypt = new JSEncrypt();
          crypt.setPublicKey(pubKey);
          const encCurrent = crypt.encrypt(currentPassword);
          const encNew = crypt.encrypt(newPassword);
          if (encCurrent && encNew) {
            // JSEncrypt returns base64-encoded ciphertext; backend will base64-decode and privateDecrypt
            payload = { currentPassword: encCurrent, newPassword: encNew };
          }
        }
      } catch (e) {
        // If fetching/encrypting fails, fallback to sending plain text (backend accepts plain too)
      }

      await apiClient.post(`/users/change-password`, payload);
      dispatch(showSuccess("Password changed successfully"));
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      dispatch(showError(err.response?.data?.message || "Failed to change password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Change Password</h1>
      </div>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded p-6 max-w-md">
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Current Password</label>
          <input type="password" className={`w-full rounded border px-3 py-2 ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          {errors.currentPassword && <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">New Password</label>
          <input type="password" className={`w-full rounded border px-3 py-2 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
          <input type="password" className={`w-full rounded border px-3 py-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
