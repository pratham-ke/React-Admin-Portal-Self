import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const authUser = useAppSelector((s) => s.auth.user);
  const usersCurrent = useAppSelector((s) => s.users.currentUser);
  const user = authUser || usersCurrent;

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sticky top-0 z-20"
      style={{ backgroundColor: "#488010" }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden rounded p-2 text-white hover:bg-green-900/30"
          aria-label="Open menu"
        >
          ☰
        </button>
        <span className="text-white font-semibold">Dashboard</span>
      </div>

      {/* Right Section */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white overflow-hidden"
        >
          {user?.imageUrl || user?.image ? (
            <img src={user.imageUrl ?? `http://localhost:5000/uploads/user/${user.image}`} alt="profile" className="w-8 h-8 object-cover rounded-full" />
          ) : (
            <span className="text-xl">&#128100;</span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow">
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/profile");
              }}
            >
              Profile
            </button>
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/settings");
              }}
            >
              Change Password
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
