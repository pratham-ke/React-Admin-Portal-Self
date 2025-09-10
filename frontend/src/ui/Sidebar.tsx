import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  RectangleGroupIcon,
  NewspaperIcon,
  EnvelopeOpenIcon,
  PowerIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
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

  const handleLogout = () => setShowConfirm(true);

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
      {/* Header with Toggle */}
      <div className="h-16 flex items-center justify-between px-2">
        <span className="font-semibold text-[#488010] transition-opacity">
          {open ? "Admin" : ""}
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="p-1 rounded text-[#488010]"
          aria-label="Toggle sidebar"
        >
          {open ? "⟨" : "⟩"}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <SidebarLink to="/dashboard" label="Dashboard" open={open} icon={<HomeIcon className="w-6 h-6" />} />
        <SidebarLink to="/dashboard/team" label="Team" open={open} icon={<UsersIcon className="w-6 h-6" />} />
        <SidebarLink to="/dashboard/blog" label="Blog" open={open} icon={<NewspaperIcon className="w-6 h-6" />} />
        <SidebarLink
          to="/dashboard/portfolio"
          label="Portfolio"
          open={open}
          icon={<RectangleGroupIcon className="w-6 h-6" />}
        />
        <SidebarLink
          to="/dashboard/contact"
          label="Contact"
          open={open}
          icon={<EnvelopeOpenIcon className="w-6 h-6" />}
        />
        <SidebarLink to="/dashboard/users" label="Users" open={open} icon={<UserIcon className="w-6 h-6" />} />
      </nav>

      {/* Logout */}
      <div className="p-2 border-t">
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded px-3 py-2 text-sm transition hover:bg-green-50 ${
            open ? "justify-start" : "justify-center"
          }`}
          style={{ color: "#488010" }}
        >
          <span className={`${open ? "" : "w-9  items-center justify-right"}`}>
            <PowerIcon className="w-6 h-6" />
          </span>
          <span className={`${open ? "opacity-100" : "opacity-0"} transition-opacity`}>
            Logout
          </span>
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold" style={{ color: "#488010" }}>
                Confirm Logout
              </h3>
            </div>
            <div className="p-4" style={{ color: "#488010" }}>
              Are you sure you want to log out?
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setShowConfirm(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: "#488010" }}
                onClick={confirmLogout}
                type="button"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

const SidebarLink: React.FC<{
  to: string;
  label: string;
  open: boolean;
  icon?: React.ReactNode;
}> = ({ to, label, open, icon }) => (
  <NavLink
    to={to}
    title={label}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded px-3 py-2 text-sm transition text-[#488010] ${
        isActive ? "bg-green-100" : "hover:bg-green-50"
      }`
    }
    end
  >
    <div className={`${open ? "w-6 h-6" : "w-12 h-10 flex items-center justify-center"}`}>
      {icon}
    </div>
    <span
      className={`whitespace-nowrap transition-all ${
        open ? "opacity-100 ml-2" : "opacity-0 w-0"
      }`}
    >
      {label}
    </span>
  </NavLink>
);

export default Sidebar;
