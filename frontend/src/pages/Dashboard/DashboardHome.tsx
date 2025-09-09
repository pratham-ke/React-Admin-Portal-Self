import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

const Card: React.FC<{ icon: React.ReactNode; title: string; value: number }> = ({ icon, title, value }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 min-w-[220px]">
    <div className="flex items-center gap-3 text-gray-700">
      {icon}
      <span className="font-medium">{title}</span>
    </div>
    <div className="mt-4 text-3xl font-semibold text-gray-900">{value}</div>
  </div>
);

const DashboardHome: React.FC = () => {
  const [counts, setCounts] = useState({ team: 0, blog: 0, portfolio: 0, contacts: 0, users: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [team, blog, portfolio, contacts, users] = await Promise.all([
          apiClient.get("/team", { params: { admin: true } }),
          apiClient.get("/blog", { params: { admin: true } }),
          apiClient.get("/portfolio", { params: { admin: true } }),
          apiClient.get("/contact/submissions"),
          apiClient.get("/users"),
        ]);
        setCounts({ team: team.data.length, blog: blog.data.length, portfolio: portfolio.data.length, contacts: contacts.data?.length ?? 0, users: users.data.length });
      } catch (e) {
        // ignore count errors to keep dashboard resilient
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={<span className="w-5 h-5 bg-green-700 rounded text-transparent">.</span>} title="Team Members" value={counts.team} />
        <Card icon={<span className="w-5 h-5 bg-green-700 rounded text-transparent">.</span>} title="Blog Posts" value={counts.blog} />
        <Card icon={<span className="w-5 h-5 bg-green-700 rounded text-transparent">.</span>} title="Portfolio Items" value={counts.portfolio} />
        <Card icon={<span className="w-5 h-5 bg-green-700 rounded text-transparent">.</span>} title="Contact Submissions" value={counts.contacts} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card icon={<span className="w-5 h-5 bg-green-700 rounded text-transparent">.</span>} title="Users" value={counts.users} />
      </div>
    </div>
  );
};

export default DashboardHome;


