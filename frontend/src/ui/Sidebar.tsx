import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HomeIcon, UsersIcon, RectangleGroupIcon, NewspaperIcon, EnvelopeOpenIcon, PowerIcon, UserIcon } from "@heroicons/react/24/outline";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    setShowConfirm(false);
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${
        open ? "w-64" : "w-16"
      } hidden md:flex flex-col`}
    >
      <div className="h-16 flex items-center justify-between px-4">
        <span className={`font-semibold text-gray-800 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}>
          Admin
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="text-gray-600 hover:text-gray-900"
          aria-label="Toggle sidebar"
        >
          {open ? "⟨" : "⟩"}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <SidebarLink to="/dashboard" label="Dashboard" open={open} icon={<HomeIcon className="w-5 h-5" />} />
        <SidebarLink to="/dashboard/team" label="Team" open={open} icon={<UsersIcon className="w-5 h-5" />} />
        <SidebarLink to="/dashboard/blog" label="Blog" open={open} icon={<NewspaperIcon className="w-5 h-5" />} />
        <SidebarLink to="/dashboard/portfolio" label="Portfolio" open={open} icon={<RectangleGroupIcon className="w-5 h-5" />} />
        <SidebarLink to="/dashboard/contact" label="Contact" open={open} icon={<EnvelopeOpenIcon className="w-5 h-5" />} />
        <SidebarLink to="/dashboard/users" label="Users" open={open} icon={<UserIcon className="w-5 h-5" />} />
      </nav>
      <div className="p-2 border-t">
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded px-3 py-2 text-sm transition text-gray-700 hover:bg-gray-100 ${open ? "justify-start" : "justify-center"}`}
        >
          <PowerIcon className="w-5 h-5" />
          <span className={`${open ? "opacity-100" : "opacity-0"} transition-opacity`}>Logout</span>
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="px-4 py-3 border-b">
              <h3 className="text-gray-900 font-semibold">Confirm Logout</h3>
            </div>
            <div className="p-4 text-gray-700">Are you sure you want to log out?</div>
            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded border" onClick={() => setShowConfirm(false)} type="button">Cancel</button>
              <button className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800" onClick={confirmLogout} type="button">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

const SidebarLink: React.FC<{ to: string; label: string; open: boolean; icon?: React.ReactNode }> = ({ to, label, open, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded px-3 py-2 text-sm transition ${
        isActive ? "bg-green-100 text-green-800" : "text-gray-700 hover:bg-gray-100"
      }`
    }
    end
  >
    {icon ?? <span className="w-5 h-5 rounded bg-gray-200" />}
    <span className={`${open ? "opacity-100" : "opacity-0"} transition-opacity`}>{label}</span>
  </NavLink>
);

export default Sidebar;


