import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import DOMPurify from "dompurify";
import { fetchPortfolio } from "../../store/slices/portfolioSlice";

const PortfolioViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const items = useAppSelector((s) => s.portfolio.items);
  const item = items.find((item) => String(item.id) === String(id));

  useEffect(() => {
    if (!item && id) {
      dispatch(fetchPortfolio({ page: 1, limit: 50 } as any));
    }
  }, [id, item, dispatch]);

  if (!item) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio Item</h1>
          <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
        </div>
        <div className="text-gray-600">Item not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Portfolio Item</h1>
        <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
      </div>
      <div className="bg-white border border-gray-200 rounded p-6 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
        <div>
          {(item.imageUrl || item.image) ? (
            <img src={item.imageUrl ?? `http://localhost:5000/uploads/portfolio/${item.image}`} className="w-40 h-40 rounded object-cover" />
          ) : (
            <div className="w-40 h-40 rounded bg-gray-200" />
          )}
        </div>
        <div className="space-y-2 text-gray-800">
          <div className="text-lg font-semibold">{item.name}</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium">{item.status ?? "Active"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Visible:</span>
            <span className="font-medium">{item.isVisible ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>
      {item.description && (
        <div className="bg-white border border-gray-200 rounded p-6">
          <div className="text-gray-900 font-semibold mb-2">Description</div>
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }} 
          />
        </div>
      )}
    </div>
  );
};

export default PortfolioViewPage;
