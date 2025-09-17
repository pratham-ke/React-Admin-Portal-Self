import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createBlogPost, updateBlogPost, fetchBlog } from "../../store/slices/blogSlice";
import { showSuccess, showError } from "../../store/slices/notificationSlice";
import ImageUploader from "../../components/common/ImageUploader";
import RichTextEditor from "../../components/common/RichTextEditor";

const BlogFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.blog);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    content: string;
    category: string;
    author: string;
    status: string;
    date: string;
    file?: File;
    imageUrl?: string; // existing server image filename for preview
  }>({
    title: "",
    description: "",
    content: "",
    category: "",
    author: "",
    status: "draft",
    date: new Date().toISOString().split('T')[0],
    file: undefined,
    imageUrl: undefined,
  });
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    if (!items.length) dispatch(fetchBlog(undefined));
  }, [dispatch, items.length]);

  useEffect(() => {
    if (isEdit) {
      const post = items.find((x) => String(x.id) === String(id));
      if (post) {
        setForm({
          title: post.title,
          description: post.description ?? "",
          content: post.content,
          category: post.category ?? "",
          author: post.author ?? "",
          status: post.status ?? "draft",
          date: post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          file: undefined,
          imageUrl: post.image ?? undefined,
        });
      }
    }
  }, [isEdit, id, items]);

  const validate = () => {
    const e: { title?: string; content?: string } = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.content.trim()) e.content = "Content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      // remove tag handling (tags removed from UI and payload)
      const payload = { ...form } as any;
      if (isEdit) {
        await dispatch(updateBlogPost({ id: Number(id), data: payload })).unwrap();
        dispatch(showSuccess("Updated successfully"));
      } else {
        await dispatch(createBlogPost(payload)).unwrap();
        dispatch(showSuccess("Saved successfully"));
      }
      navigate("/dashboard/blog", { replace: true });
    } catch (error) {
      dispatch(showError("Action failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? "Edit Blog Post" : "Add New Blog Post"}</h1>
        <div className="flex items-center gap-2">
          <button type="button" className="px-4 py-2 rounded border" onClick={() => navigate(-1)}>Back</button>
          <button type="submit" form="blogForm" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800" disabled={loading}>{loading ? "Saving..." : isEdit ? "Save" : "Add Post"}</button>
        </div>
      </div>

          <form id="blogForm" onSubmit={onSubmit} className="bg-white border border-gray-200 rounded p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <ImageUploader initialFile={form.file} initialUrl={form.imageUrl ? `http://localhost:5000/uploads/blog/${form.imageUrl}` : undefined} onFileChange={(f) => setForm((s) => ({ ...s, file: f ?? undefined }))} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title *</label>
              <input 
                className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-700"}`} 
                value={form.title} 
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} 
              />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Author</label>
              <input 
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700" 
                value={form.author} 
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <select
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">Select category</option>
                <option value="Business">Business</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Music">Music</option>
                <option value="Band">Band</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Date</label>
              <input 
                type="date"
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700" 
                value={form.date} 
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} 
              />
            </div>
            {/* Tags removed per requirements */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Status</span>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={form.status === "published"} 
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "published" : "draft" }))} 
                />
                <span className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 ${ form.status === "published" ? "bg-green-600" : "bg-gray-300" }`}>
                  <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${ form.status === "published" ? "translate-x-5" : "translate-x-0" }`}></span>
                </span>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-700 min-h-[120px]" 
                value={form.description} 
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Content *</label>
          <RichTextEditor value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} />
          {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content}</p>}
        </div>
      </form>
    </div>
  );
};

export default BlogFormPage;
