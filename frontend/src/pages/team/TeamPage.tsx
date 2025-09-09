import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTeam, deleteTeamMember, toggleTeamStatus, type TeamMember } from "../../store/slices/teamSlice";
import ActionMenu from "../../components/common/ActionMenu";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const TeamPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { items, loading, total, error } = useAppSelector((s) => s.team);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);


  
  // form state moved to dedicated Add/Edit pages

  useEffect(() => {
    dispatch(fetchTeam({ page, limit }));
  }, [dispatch, page, limit]);

  // no-op: list page no longer contains a form

  const onEdit = (member: TeamMember) => {
    navigate(`/dashboard/team/edit/${member.id}`);
  };

  const onDelete = async (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await dispatch(deleteTeamMember(deleteId)).unwrap();
      setConfirmOpen(false);
      setDeleteId(null);
      dispatch(fetchTeam({ page, limit }));
      dispatch(showSuccess("Deleted successfully"));
    } catch (error) {
      dispatch(showError("Failed to delete team member"));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Team</h1>
        <a
          className="rounded bg-green-700 text-white px-4 py-2 hover:bg-green-800"
          href="/dashboard/team/add"
        >
          Add Member
        </a>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="overflow-x-auto bg-white border border-gray-200 rounded">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Position</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">LinkedIn</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-2">
                  {m.image ? (
                    <img src={`http://localhost:5000/uploads/team/${m.image}`} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200" />)
                  }
                </td>
                <td className="px-4 py-2">{m.name}</td>
                <td className="px-4 py-2">{m.position}</td>
                <td className="px-4 py-2">{m.email ?? ""}</td>
                <td className="px-4 py-2">
                  {m.linkedin ? (
                    <a href={m.linkedin} target="_blank" rel="noreferrer" className="text-green-700 hover:underline">
                      Profile
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={(m.status ?? "active") === "active"} onChange={() => dispatch(toggleTeamStatus(m.id))} />
                    <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ (m.status ?? "active") === "active" ? "bg-green-600" : "bg-gray-300" }`}>
                      <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ (m.status ?? "active") === "active" ? "translate-x-5" : "translate-x-0" }`}></span>
                    </span>
                  </label>
                </td>
                <td className="px-4 py-2 text-right">
                  <ActionMenu onView={() => navigate(`/dashboard/team/view/${m.id}`)} onEdit={() => onEdit(m)} onDelete={() => onDelete(m.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <div className="p-4 text-sm text-gray-600">Loading...</div>}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          type="button"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          type="button"
        >
          Next
        </button>
      </div>

      <ConfirmModal open={confirmOpen} title="Confirm Delete" description="Are you sure you want to delete this team member?" confirmText="Yes, Delete" onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
};

export default TeamPage;

// RowActions replaced by generic ActionMenu + EyeIcon button


