import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaFilm,
  FaUsers,
  FaTicketAlt,
  FaCogs,
  FaCheck,
  FaComments,
  FaUserTie,
} from "react-icons/fa";
import { MdMovie } from "react-icons/md";
import { AdminSidebarProps } from "../../Core/AdminTypes";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../Store/AdminAuthSlice";
import { useAdminLogoutMutation } from "../../Store/AdminApiSlice";
import { FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminName }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [adminLogout] = useAdminLogoutMutation();

  const handleLogout = async () => {
    try {
      await adminLogout({}).unwrap();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/admin-login");
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if API fails, clear local state
      dispatch(logout());
      navigate("/admin-login");
    }
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: FaHome },
    { path: "/admin/get-user", label: "Users", icon: FaUsers },
    { path: "/admin/get-theaterOwner", label: "Theaters", icon: FaFilm },
    { path: "/admin/get-movies", label: "Movies", icon: MdMovie },
    { path: "/admin/cast", label: "Cast", icon: FaUserTie },
    { path: "/admin/verification", label: "Verification", icon: FaCheck },
    { path: "/admin/bookings", label: "Bookings", icon: FaTicketAlt },
    { path: "/admin/chat", label: "Chat", icon: FaComments },
    { path: "/admin/settings", label: "Settings", icon: FaCogs },
  ];

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700/50 flex flex-col z-50 text-gray-800 dark:text-white shadow-2xl transition-colors duration-300">
      {/* Header Section */}
      <div className="p-8 flex flex-col items-center border-b border-gray-100 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm transition-colors duration-300">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4 ring-2 ring-gray-100 dark:ring-white/10">
          <span className="text-2xl font-bold font-mono text-white">TH</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Portal</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome, <span className="text-blue-500 dark:text-blue-400 font-medium">{adminName}</span>
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ul className="space-y-1">
          {navItems.map((item) => {
            return (
              <li key={item.path}>
                <NavLink to={item.path}>
                  {({ isActive: linkActive }) => (
                    <div className="relative overflow-hidden group rounded-xl">
                      {/* Active State Background & Indicator */}
                      {linkActive && (
                        <motion.div
                          layoutId="activeNavBackground"
                          className="absolute inset-0 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 rounded-xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      {/* Hover Effect */}
                      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${linkActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 bg-gray-100 dark:bg-white/5'}`} />

                      <div className={`relative flex items-center gap-4 px-4 py-3 transition-colors duration-200 ${linkActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-white'}`}>
                        <item.icon className={`text-xl transition-transform duration-300 ${linkActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:scale-110'}`} />
                        <span className="font-medium tracking-wide">{item.label}</span>

                        {/* Active Dot Indicator */}
                        {linkActive && (
                          <motion.div
                            layoutId="activeDot"
                            className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Logout Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-2 transition-colors duration-300">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
        >
          <FaSignOutAlt className="text-lg transition-transform group-hover:scale-110" />
          <span>Logout</span>
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium text-center">Ticket Hive v1.0.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
