import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTeam, deleteTeamMember, toggleTeamStatus, type TeamMember } from "../../store/slices/teamSlice";
import ActionMenu from "../../components/common/ActionMenu";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable, { type ColumnConfig } from "../../components/common/DataTable";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const TeamPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { items, loading, total, error } = useAppSelector((s) => s.team);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);


  
  // form state moved to dedicated Add/Edit pages

  useEffect(() => {
    dispatch(fetchTeam({ page, limit: pageSize, sortBy: sortBy ?? undefined, sortOrder: sortDir ?? undefined } as any));
  }, [dispatch, page, pageSize, sortBy, sortDir]);

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
  dispatch(fetchTeam({ page, limit: pageSize }));
      dispatch(showSuccess("Deleted successfully"));
    } catch (error) {
      dispatch(showError("Failed to delete team member"));
    }
  };

  

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

  <DataTable
        columns={[
          { key: "image", title: "Image", render: (m) => m.image ? <img src={`http://localhost:5000/uploads/team/${m.image}`} alt={m.name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-200" /> },
          { key: "name", title: "Name", sortable: true },
          { key: "position", title: "Position", sortable: true },
          { key: "email", title: "Email", sortable: true },
          { key: "linkedin", title: "LinkedIn", render: (m) => m.linkedin ? <a href={m.linkedin} target="_blank" rel="noreferrer" className="text-green-700 hover:underline">Profile</a> : <span className="text-gray-400">—</span> },
          { key: "status", title: "Status", render: (m) => (
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={(m.status ?? "active") === "active"} onChange={() => dispatch(toggleTeamStatus(m.id))} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ (m.status ?? "active") === "active" ? "bg-green-600" : "bg-gray-300" }`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ (m.status ?? "active") === "active" ? "translate-x-5" : "translate-x-0" }`}></span>
              </span>
            </label>
          ) },
          { key: "actions", title: "Actions", render: (m) => <div className="text-right"><ActionMenu onView={() => navigate(`/dashboard/team/view/${m.id}`)} onEdit={() => onEdit(m)} onDelete={() => onDelete(m.id)} /></div> }
        ] as ColumnConfig[]}
  rows={items}
  pagination={{ page, pageSize, total, onPageChange: (p) => setPage(p), onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
  sortable
  loading={loading}
  sortBy={sortBy}
  sortDir={sortDir}
  onSortChange={(k, d) => { setSortBy(k); setSortDir(d); }}
      />

      <ConfirmModal open={confirmOpen} title="Confirm Delete" description="Are you sure you want to delete this team member?" confirmText="Yes, Delete" onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
};

export default TeamPage;

// RowActions replaced by generic ActionMenu + EyeIcon button


