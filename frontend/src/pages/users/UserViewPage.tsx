import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchUserById } from "../../store/slices/userSlice";

const UserViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Call selectors/hooks unconditionally to preserve hook order
  const currentUser = useAppSelector((s) => s.users.currentUser as any);
  const items = useAppSelector((s) => s.users.items);
  const user = currentUser ?? items.find((u: any) => String(u.id) === String(id));

  useEffect(() => {
    if (!user && id) {
      dispatch(fetchUserById(Number(id)));
    }
  }, [id, user, dispatch]);

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">User</h1>
          <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
        </div>
        <div className="text-gray-600">User not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">User</h1>
        <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
      </div>
      <div className="bg-white border border-gray-200 rounded p-6 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
        <div>
          {(user.imageUrl || user.image) ? (
            <img src={user.imageUrl ?? `http://localhost:5000/uploads/user/${user.image}`} className="w-40 h-40 rounded-full object-cover" />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200" />
          )}
        </div>
        <div className="space-y-2 text-gray-800">
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-gray-600">{user.email}</div>
          <div className="flex items-center gap-2"><span className="text-gray-600">Role:</span><span className="font-medium">{user.role}</span></div>
          <div className="flex items-center gap-2"><span className="text-gray-600">Active:</span><span className="font-medium">{user.active ? 'Yes' : 'No'}</span></div>
          {user.createdAt && <div className="text-gray-500">Created: {new Date(user.createdAt).toLocaleString()}</div>}
        </div>
      </div>
    </div>
  );
};

export default UserViewPage;

