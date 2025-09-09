import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPortfolio, deletePortfolioItem, togglePortfolioStatus, togglePortfolioVisibility, type PortfolioItem } from "../../store/slices/portfolioSlice";
import ActionMenu from "../../components/common/ActionMenu";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const PortfolioPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { items, loading, total, error } = useAppSelector((s) => s.portfolio);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  useEffect(() => {
    dispatch(fetchPortfolio({ page, limit }));
  }, [dispatch, page, limit]);

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
      dispatch(fetchPortfolio({ page, limit }));
      dispatch(showSuccess("Deleted successfully"));
    } catch (error) {
      dispatch(showError("Failed to delete portfolio item"));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

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

      <div className="overflow-x-auto bg-white border border-gray-200 rounded">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Visible</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">
                  {item.image ? (
                    <img src={`http://localhost:5000/uploads/portfolio/${item.image}`} alt={item.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-200" />
                  )}
                </td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2 max-w-xs truncate">{item.description ?? ""}</td>
                <td className="px-4 py-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={(item.status ?? "Active") === "Active"} 
                      onChange={() => dispatch(togglePortfolioStatus(item.id))} 
                    />
                    <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ (item.status ?? "Active") === "Active" ? "bg-green-600" : "bg-gray-300" }`}>
                      <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ (item.status ?? "Active") === "Active" ? "translate-x-5" : "translate-x-0" }`}></span>
                    </span>
                  </label>
                </td>
                <td className="px-4 py-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={item.isVisible ?? true} 
                      onChange={() => dispatch(togglePortfolioVisibility(item.id))} 
                    />
                    <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ (item.isVisible ?? true) ? "bg-green-600" : "bg-gray-300" }`}>
                      <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ (item.isVisible ?? true) ? "translate-x-5" : "translate-x-0" }`}></span>
                    </span>
                  </label>
                </td>
                <td className="px-4 py-2 text-right">
                  <ActionMenu onView={() => navigate(`/dashboard/portfolio/view/${item.id}`)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                  No portfolio items found.
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