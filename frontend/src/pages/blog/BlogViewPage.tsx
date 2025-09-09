import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import DOMPurify from "dompurify";

const BlogViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = useAppSelector((s) => s.blog.items.find((post) => String(post.id) === String(id)));

  if (!post) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Blog Post</h1>
          <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
        </div>
        <div className="text-gray-600">Post not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Post</h1>
        <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded p-6">
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 mb-6">
          <div>
            {post.image ? (
              <img src={`http://localhost:5000/uploads/blog/${post.image}`} className="w-40 h-40 rounded object-cover" />
            ) : (
              <div className="w-40 h-40 rounded bg-gray-200" />
            )}
          </div>
          <div className="space-y-2 text-gray-800">
            <div className="text-lg font-semibold">{post.title}</div>
            {post.author && <div className="text-gray-600">By {post.author}</div>}
            {post.category && <div className="text-gray-600">Category: {post.category}</div>}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{post.status ?? "draft"}</span>
            </div>
            {post.date && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(post.date).toLocaleDateString()}</span>
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Tags:</span>
                <div className="flex gap-1">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {post.description && (
          <div className="mb-6">
            <div className="text-gray-900 font-semibold mb-2">Description</div>
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }} 
            />
          </div>
        )}
        
        <div>
          <div className="text-gray-900 font-semibold mb-2">Content</div>
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} 
          />
        </div>
      </div>
    </div>
  );
};

export default BlogViewPage;
