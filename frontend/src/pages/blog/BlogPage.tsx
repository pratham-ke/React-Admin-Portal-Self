import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBlog, deleteBlogPost, toggleBlogStatus, type BlogPost } from "../../store/slices/blogSlice";
import ActionMenu from "../../components/common/ActionMenu";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable, { type ColumnConfig } from "../../components/common/DataTable";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const BlogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { items, loading, total, error } = useAppSelector((s) => s.blog);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => { dispatch(fetchBlog({ page, limit: pageSize })); }, [dispatch, page, pageSize]);

  const onEdit = (post: BlogPost) => {
    navigate(`/dashboard/blog/edit/${post.id}`);
  };

  const onDelete = async (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
  try {
  await dispatch(deleteBlogPost(deleteId)).unwrap();
  setConfirmOpen(false);
  setDeleteId(null);
  dispatch(fetchBlog({ page, limit: pageSize }));
  dispatch(showSuccess("Deleted successfully"));
    } catch (error) {
      dispatch(showError("Failed to delete blog post"));
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Blog</h1>
        <a
          className="rounded bg-green-700 text-white px-4 py-2 hover:bg-green-800"
          href="/dashboard/blog/add"
        >
          Add Post
        </a>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <DataTable
        columns={[
          { key: "image", title: "Image", render: (post) => post.image ? <img src={`http://localhost:5000/uploads/blog/${post.image}`} alt={post.title} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-gray-200" /> },
          { key: "title", title: "Title", sortable: true },
          { key: "author", title: "Author", sortable: true },
          { key: "category", title: "Category", sortable: true },
          { key: "status", title: "Status", render: (post) => (
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={(post.status ?? "draft") === "published"} onChange={() => dispatch(toggleBlogStatus(post.id))} />
              <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ (post.status ?? "draft") === "published" ? "bg-green-600" : "bg-gray-300" }`}>
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ (post.status ?? "draft") === "published" ? "translate-x-5" : "translate-x-0" }`}></span>
              </span>
            </label>
          ) },
          { key: "date", title: "Date", sortable: true, render: (post) => post.date ? new Date(post.date).toLocaleDateString() : "" },
          { key: "actions", title: "Actions", render: (post) => <div className="text-right"><ActionMenu onView={() => navigate(`/dashboard/blog/view/${post.id}`)} onEdit={() => onEdit(post)} onDelete={() => onDelete(post.id)} /></div> }
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
        description="Are you sure you want to delete this blog post?" 
        confirmText="Yes, Delete" 
        onConfirm={confirmDelete} 
        onCancel={() => setConfirmOpen(false)} 
      />
    </div>
  );
};

export default BlogPage;
