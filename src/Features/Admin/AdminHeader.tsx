import React, { useState } from "react";
import { FaSignOutAlt, FaTachometerAlt, FaUserCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAdminLogoutMutation } from "../../Store/AdminApiSlice";
import { logout } from "../../Store/AdminAuthSlice";
import { RootState, AppDispatch } from "../../Store";
import { motion, AnimatePresence } from "framer-motion";

const AdminHeader: React.FC = () => {
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [logoutApiCall] = useAdminLogoutMutation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await logoutApiCall(undefined).unwrap();
      dispatch(logout());
      navigate("/admin-login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="bg-dark-surface border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Dashboard Link */}
          <div className="flex items-center">
            {adminInfo && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-3 text-white hover:text-primary-400 transition-colors"
                onClick={() => navigate("/admin/dashboard")}
              >
                <FaTachometerAlt className="text-2xl text-primary-500" />
                <span className="text-xl font-bold tracking-wide">
                  Admin Dashboard
                </span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {adminInfo ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-white hover:text-gray-300 focus:outline-none px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium">{adminInfo.name}</span>
                  <FaUserCircle className="text-2xl" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-bg border border-white/10 rounded-xl shadow-xl py-2 z-50 overflow-hidden"
                    >
                      <button
                        onClick={logoutHandler}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-3 transition-colors"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/admin-login"
                className="text-gray-300 hover:text-white flex items-center gap-2 font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <FaSignOutAlt /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
