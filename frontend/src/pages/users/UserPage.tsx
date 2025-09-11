import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchUsers, deleteUser, toggleUserActive } from "../../store/slices/userSlice";
import ActionMenu from "../../components/common/ActionMenu";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable, { type ColumnConfig } from "../../components/common/DataTable";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const UserPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useAppSelector((s) => s.users as any);
  const authUser = useAppSelector((s) => s.auth.user);
  const visibleItems = items.filter((u: any) => u.id !== authUser?.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: pageSize } as any));
  }, [dispatch, page, pageSize]);

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

      <DataTable
        columns={[
          { key: "name", title: "Name", sortable: true },
          { key: "email", title: "Email", sortable: true },
          { key: "role", title: "Role", sortable: true },
          { key: "active", title: "Active", render: (u) => (
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={!!u.active} onChange={() => onToggle(u.id)} />
              <span className={`w-10 h-5 flex items-center rounded-full p-1 ${u.active ? "bg-green-600" : "bg-gray-300"}`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${u.active ? "translate-x-5" : "translate-x-0"}`}></span>
              </span>
            </label>
          ) },
          { key: "createdAt", title: "Created At", sortable: true, render: (u) => u.createdAt ? new Date(u.createdAt).toLocaleString() : "-" },
          { key: "actions", title: "Actions", render: (u) => <div className="text-right"><ActionMenu onView={() => onView(u.id)} onEdit={() => onEdit(u.id)} onDelete={() => onDelete(u.id)} /></div> }
        ] as ColumnConfig[]}
        rows={visibleItems}
        pagination={{ page, pageSize, total: (items as any).length ?? 0, onPageChange: (p) => setPage(p), onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        sortable
        loading={loading}
  onSortChange={(_key, _dir) => { /* could dispatch fetchUsers with sort params if API supports */ }}
      />

      <ConfirmModal open={confirmOpen} title="Confirm Delete" description="Are you sure you want to delete this user?" confirmText="Yes, Delete" onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
};

export default UserPage;
// src/pages/users/UsersPage.tsx
