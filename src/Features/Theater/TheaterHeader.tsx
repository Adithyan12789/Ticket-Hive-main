import React, { useState } from "react";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetTheaterOwnerProfileQuery,
  useLogoutTheaterMutation,
} from "../../Store/TheaterApiSlice";
import { clearTheater } from "../../Store/TheaterAuthSlice";
import { RootState, AppDispatch } from "../../Store";
import { motion, AnimatePresence } from "framer-motion";

const Header: React.FC = () => {
  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data: profileData } = useGetTheaterOwnerProfileQuery(theaterInfo?.id);
  const [logoutApiCall] = useLogoutTheaterMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const profileHandler = () => {
    if (theaterInfo && profileData) {
      navigate("/theater-profile");
    } else {
      console.error("Profile data not available");
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall({}).unwrap();
      dispatch(clearTheater());
      navigate("/theater");
    } catch (err) {
      console.error(err);
    }
  };

  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-dark-bg/95 backdrop-blur-xl border-b border-white/10 h-20 shadow-lg"
        : "bg-transparent h-24"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        {/* Logo */}
        <Link to="/theater" className="flex items-center gap-3 group relative">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src="/logo.png"
            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300 relative z-10"
            alt="Ticket Hive Logo"
          />
          <span className="text-2xl font-display font-bold text-white tracking-tight relative z-10">
            Ticket<span className="text-red-500">Hive</span>
            <span className="text-xs font-normal text-gray-400 ml-2 border-l border-gray-600 pl-2">Partner</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {theaterInfo ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 text-white hover:text-red-400 transition-all focus:outline-none bg-white/5 hover:bg-white/10 py-2.5 px-5 rounded-full border border-white/10 hover:border-red-500/30 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
                  <FaUser className="text-white" />
                </div>
                <span className="font-semibold text-sm tracking-wide group-hover:text-white transition-colors">
                  {theaterInfo.name || theaterInfo.data?.name || "Theater Owner"}
                </span>
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-dark-bg border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden backdrop-blur-3xl ring-1 ring-white/5"
                  >
                    <div className="px-5 py-4 border-b border-white/5 mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-white font-medium truncate">{theaterInfo.name || "Owner"}</p>
                    </div>
                    <button
                      onClick={profileHandler}
                      className="w-full text-left px-5 py-3 text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                        <FaUser className="text-gray-400 group-hover:text-red-500 transition-colors" size={14} />
                      </div>
                      <span className="font-medium">Profile</span>
                    </button>
                    <div className="h-px bg-white/5 my-2 mx-5" />
                    <button
                      onClick={logoutHandler}
                      className="w-full text-left px-5 py-3 text-gray-300 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                        <FaSignOutAlt className="text-gray-400 group-hover:text-red-500 transition-colors" size={14} />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/theater-login"
                className="text-gray-300 hover:text-white font-medium transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/theater-signup"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-full font-bold transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
