import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import DOMPurify from "dompurify";
import { fetchTeam } from "../../store/slices/teamSlice";

const TeamViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Unconditional selectors
  const items = useAppSelector((s) => s.team.items);
  const member = items.find((m) => String(m.id) === String(id));

  useEffect(() => {
    // If items are empty or member missing, load team list (server supports admin flag)
    if (!member && id) {
      dispatch(fetchTeam({ page: 1, limit: 50 } as any));
    }
  }, [id, member, dispatch]);

  if (!member) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Team Member</h1>
          <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
        </div>
        <div className="text-gray-600">Member not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Team Member</h1>
        <button className="px-4 py-2 rounded border" onClick={() => navigate(-1)} type="button">Back</button>
      </div>
      <div className="bg-white border border-gray-200 rounded p-6 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
        <div>
          {(member.imageUrl || member.image) ? (
            <img src={member.imageUrl ?? `http://localhost:5000/uploads/team/${member.image}`} className="w-40 h-40 rounded-full object-cover" />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200" />
          )}
        </div>
        <div className="space-y-2 text-gray-800">
          <div className="text-lg font-semibold">{member.name}</div>
          <div className="text-gray-600">{member.position}</div>
          {member.email && <div>{member.email}</div>}
          {member.linkedin && (
            <div>
              <a className="text-green-700 hover:underline" href={member.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          )}
          <div className="flex items-center gap-2"><span className="text-gray-600">Status:</span><span className="font-medium">{member.status ?? "active"}</span></div>
        </div>
      </div>
      {member.biography && (
        <div className="bg-white border border-gray-200 rounded p-6">
          <div className="text-gray-900 font-semibold mb-2">Biography</div>
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(member.biography) }} 
          />
        </div>
      )}
    </div>
  );
};

export default TeamViewPage;


