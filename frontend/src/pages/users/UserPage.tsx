import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchUsers, deleteUser, toggleUserActive } from "../../store/slices/userSlice";
import ActionMenu from "../../components/common/ActionMenu";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const UserPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useAppSelector((s) => s.users as any);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const onEdit = (id: number) => navigate(`/dashboard/users/edit/${id}`);
  const onView = (id: number) => navigate(`/dashboard/users/view/${id}`);

  const onDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await dispatch(deleteUser(deleteId)).unwrap();
      setConfirmOpen(false);
      setDeleteId(null);
      dispatch(fetchUsers());
      dispatch(showSuccess("Deleted successfully"));
    } catch (err) {
      dispatch(showError("Failed to delete user"));
    }
  };

  const onToggle = async (id: number) => {
    try {
      await dispatch(toggleUserActive(id)).unwrap();
      dispatch(showSuccess("Status updated"));
    } catch (err) {
      dispatch(showError("Failed to update status"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Users</h1>
        <button className="rounded bg-green-700 text-white px-4 py-2 hover:bg-green-800" onClick={() => navigate('/dashboard/users/add')}>Add New User</button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="overflow-x-auto bg-white border border-gray-200 rounded">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={!!u.active} onChange={() => onToggle(u.id)} />
                    <span className={`w-10 h-5 flex items-center rounded-full p-1 ${u.active ? "bg-green-600" : "bg-gray-300"}`}>
                      <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${u.active ? "translate-x-5" : "translate-x-0"}`}></span>
                    </span>
                  </label>
                </td>
                <td className="px-4 py-2">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                <td className="px-4 py-2 text-right">
                  <ActionMenu onView={() => onView(u.id)} onEdit={() => onEdit(u.id)} onDelete={() => onDelete(u.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <div className="p-4 text-sm text-gray-600">Loading...</div>}
      </div>

      <ConfirmModal open={confirmOpen} title="Confirm Delete" description="Are you sure you want to delete this user?" confirmText="Yes, Delete" onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
};

export default UserPage;
// src/pages/users/UsersPage.tsx
