import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPortfolio, deletePortfolioItem, togglePortfolioStatus, togglePortfolioVisibility, type PortfolioItem } from "../../store/slices/portfolioSlice";
import ActionMenu from "../../components/common/ActionMenu";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable, { type ColumnConfig } from "../../components/common/DataTable";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const PortfolioPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { items, loading, total, error } = useAppSelector((s) => s.portfolio);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => { dispatch(fetchPortfolio({ page, limit: pageSize })); }, [dispatch, page, pageSize]);

  const onEdit = (item: PortfolioItem) => {
    navigate(`/dashboard/portfolio/edit/${item.id}`);
  };

  const onDelete = async (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
  try {
  await dispatch(deletePortfolioItem(deleteId)).unwrap();
  setConfirmOpen(false);
  setDeleteId(null);
  dispatch(fetchPortfolio({ page, limit: pageSize }));
      dispatch(showSuccess("Deleted successfully"));
    } catch (error) {
      dispatch(showError("Failed to delete portfolio item"));
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Portfolio</h1>
        <a
          className="rounded bg-green-700 text-white px-4 py-2 hover:bg-green-800"
          href="/dashboard/portfolio/add"
        >
          Add Item
        </a>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <DataTable
        columns={[
          { key: "image", title: "Image", render: (item) => item.image ? <img src={`http://localhost:5000/uploads/portfolio/${item.image}`} alt={item.name} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-gray-200" /> },
          { key: "name", title: "Name", sortable: true },
          { key: "description", title: "Description", render: (item) => <div className="max-w-xs truncate">{item.description ?? ""}</div> },
          { key: "status", title: "Status", render: (item) => (
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={(item.status ?? "Active") === "Active"} onChange={() => dispatch(togglePortfolioStatus(item.id))} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ (item.status ?? "Active") === "Active" ? "bg-green-600" : "bg-gray-300" }`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ (item.status ?? "Active") === "Active" ? "translate-x-5" : "translate-x-0" }`}></span>
              </span>
            </label>
          ) },
          { key: "isVisible", title: "Visible", render: (item) => (
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={item.isVisible ?? true} onChange={() => dispatch(togglePortfolioVisibility(item.id))} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ (item.isVisible ?? true) ? "bg-green-600" : "bg-gray-300" }`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ (item.isVisible ?? true) ? "translate-x-5" : "translate-x-0" }`}></span>
              </span>
            </label>
          ) },
          { key: "actions", title: "Actions", render: (item) => <div className="text-right"><ActionMenu onView={() => navigate(`/dashboard/portfolio/view/${item.id}`)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} /></div> }
        ] as ColumnConfig[]}
        rows={items}
        pagination={{ page, pageSize, total, onPageChange: (p) => setPage(p), onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        sortable
        loading={loading}
        onSortChange={() => {}}
      />

  {/* Pagination provided by DataTable footer */}

      <ConfirmModal 
        open={confirmOpen} 
        title="Confirm Delete" 
        description="Are you sure you want to delete this portfolio item?" 
        confirmText="Yes, Delete" 
        onConfirm={confirmDelete} 
        onCancel={() => setConfirmOpen(false)} 
      />
    </div>
  );
};

export default PortfolioPage;