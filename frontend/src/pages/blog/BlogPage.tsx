import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBlog, deleteBlogPost, toggleBlogStatus, type BlogPost } from "../../store/slices/blogSlice";
import ActionMenu from "../../components/common/ActionMenu";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../store/slices/notificationSlice";

const BlogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { items, loading, total, error } = useAppSelector((s) => s.blog);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  useEffect(() => {
    dispatch(fetchBlog({ page, limit }));
  }, [dispatch, page, limit]);

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
      dispatch(fetchBlog({ page, limit }));
      dispatch(showSuccess("Deleted successfully"));
    } catch (error) {
      dispatch(showError("Failed to delete blog post"));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

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

      <div className="overflow-x-auto bg-white border border-gray-200 rounded">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((post) => (
              <tr key={post.id} className="border-t">
                <td className="px-4 py-2">
                  {post.image ? (
                    <img src={`http://localhost:5000/uploads/blog/${post.image}`} alt={post.title} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-200" />
                  )}
                </td>
                <td className="px-4 py-2 max-w-xs truncate">{post.title}</td>
                <td className="px-4 py-2">{post.author ?? ""}</td>
                <td className="px-4 py-2">{post.category ?? ""}</td>
                <td className="px-4 py-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={(post.status ?? "draft") === "published"} 
                      onChange={() => dispatch(toggleBlogStatus(post.id))} 
                    />
                    <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ (post.status ?? "draft") === "published" ? "bg-green-600" : "bg-gray-300" }`}>
                      <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ (post.status ?? "draft") === "published" ? "translate-x-5" : "translate-x-0" }`}></span>
                    </span>
                  </label>
                </td>
                <td className="px-4 py-2">{post.date ? new Date(post.date).toLocaleDateString() : ""}</td>
                <td className="px-4 py-2 text-right">
                  <ActionMenu onView={() => navigate(`/dashboard/blog/view/${post.id}`)} onEdit={() => onEdit(post)} onDelete={() => onDelete(post.id)} />
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                  No blog posts found.
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
        description="Are you sure you want to delete this blog post?" 
        confirmText="Yes, Delete" 
        onConfirm={confirmDelete} 
        onCancel={() => setConfirmOpen(false)} 
      />
    </div>
  );
};

export default BlogPage;