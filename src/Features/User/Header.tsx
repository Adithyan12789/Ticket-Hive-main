import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  useGetUserProfileQuery,
  useFetchUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useClearAllNotificationsMutation,
} from "../../Store/UserApiSlice";
import { logout } from "../../Store/AuthSlice";
import { RootState, AppDispatch } from "../../Store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faSignOutAlt,
  faUser,
  faBars,
  faTimes,

  faTicket
} from "@fortawesome/free-solid-svg-icons";
import CitiesModal from "./CitiesModal";
import { NotificationDropdown } from "./NotificationDropdown";
import io from "socket.io-client";
import { backendUrl } from "../../url";
import { motion, AnimatePresence } from "framer-motion";

const PROFILE_IMAGE_DIR_PATH = `${backendUrl}/UserProfileImages/`;
const DEFAULT_PROFILE_IMAGE = "/profileImage_1729749713837.jpg";

// Initialize socket outside component to prevent multiple connections
const socket = io(backendUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

// Add connection error handling
socket.on('connect_error', (error) => {
  console.warn('Socket connection error:', error.message);
});

socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
}

interface UpdateNotificationsPayload {
  type: "markAsRead" | "clearAll";
  notificationId?: string;
}

const Header: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch profile data (skip if no user)
  const { data: profileData } = useGetUserProfileQuery(userInfo?.id, { skip: !userInfo?.id });

  // Fetch notifications
  const { data: fetchedNotifications } = useFetchUnreadNotificationsQuery(undefined, { skip: !userInfo?.id });
  const isSyncingRef = useRef(false);

  const [clearAllNotifications] = useClearAllNotificationsMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Only sync the initial batch of notifications once when they arrive
    if (fetchedNotifications && !isSyncingRef.current) {
      setNotifications(fetchedNotifications as Notification[]);
      isSyncingRef.current = true;
    }
  }, [fetchedNotifications]);

  useEffect(() => {
    if (userInfo?.id) {
      socket.emit("joinNotifications", { userId: userInfo.id });

      const handleNewNotification = (data: { notification: Notification }) => {
        if (data && data.notification) {
          setNotifications((prevNotifications) => [
            data.notification,
            ...prevNotifications,
          ]);
        }
      };

      const handleUpdateNotifications = ({
        type,
        notificationId,
      }: UpdateNotificationsPayload) => {
        if (type === "markAsRead" && notificationId !== undefined) {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n._id !== notificationId)
          );
        } else if (type === "clearAll") {
          setNotifications([]);
        }
      };

      socket.on("newNotification", handleNewNotification);
      socket.on("updateNotifications", handleUpdateNotifications);

      return () => {
        socket.off("newNotification", handleNewNotification);
        socket.off("updateNotifications", handleUpdateNotifications);
      };
    }
  }, [userInfo?.id]);

  // Click outside to close user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileHandler = () => {
    navigate("/profile");
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const logoutHandler = async () => {
    try {
      await dispatch(logout());
      navigate("/");
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCityClick = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);
  const handleCitySelect = (city: string) => {
    setCity(city);
    setShowModal(false);
  };

  const handleNotificationClick = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n._id !== id)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await clearAllNotifications({}).unwrap();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${scrolled ? 'pt-4' : 'pt-6'}`}>
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className={`relative w-[95%] max-w-7xl backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${scrolled ? 'bg-black/80 py-2' : 'bg-black/40 py-4'
            }`}
        >
          <div className="px-6 flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-2 rounded-xl group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300">
                <FontAwesomeIcon icon={faTicket} className="text-white text-lg" />
              </div>
              <span className="text-xl font-display font-bold text-white tracking-wide group-hover:text-primary-400 transition-colors">
                TicketHive
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center bg-white/5 rounded-full px-2 py-1.5 border border-white/5">
              {[
                { name: 'Home', path: '/' },
                { name: 'Movies', path: '/allMovies' },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-600 rounded-full shadow-lg shadow-primary-600/30 -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-4">
              {userInfo ? (
                <>
                  <NotificationDropdown
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onClearAll={handleClearNotifications}
                  />

                  <div className="h-6 w-px bg-white/10 mx-2"></div>

                  <button
                    onClick={handleCityClick}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-400" />
                    <span className="max-w-[100px] truncate">{city || profileData?.city || "Location"}</span>
                  </button>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center gap-3 focus:outline-none pl-2"
                    >
                      <img
                        src={
                          profileData?.profileImageName
                            ? `${PROFILE_IMAGE_DIR_PATH}${profileData.profileImageName}`
                            : DEFAULT_PROFILE_IMAGE
                        }
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover border-2 border-primary-500/50 hover:border-primary-400 transition-all shadow-lg"
                      />
                    </button>

                    <AnimatePresence>
                      {isUserDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-4 w-56 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5"
                        >
                          <div className="p-4 border-b border-white/5 bg-white/5">
                            <p className="text-sm font-medium text-white">{userInfo.name || userInfo.data?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{userInfo.email || userInfo.data?.email}</p>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={profileHandler}
                              className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-primary-600/20 hover:text-primary-300 rounded-xl flex items-center gap-3 transition-colors"
                            >
                              <FontAwesomeIcon icon={faUser} className="w-4" /> Profile
                            </button>
                            <button
                              onClick={logoutHandler}
                              className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl flex items-center gap-3 transition-colors"
                            >
                              <FontAwesomeIcon icon={faSignOutAlt} className="w-4" /> Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-white hover:text-primary-300 font-medium text-sm transition-colors px-4 py-2"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/sign-up"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-4">
              {userInfo && (
                <NotificationDropdown
                  notifications={notifications}
                  onNotificationClick={handleNotificationClick}
                  onClearAll={handleClearNotifications}
                />
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white active:bg-white/10 transition-colors"
              >
                <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-lg" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-white/5 overflow-hidden"
              >
                <div className="p-4 space-y-2">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl bg-white/5 text-white font-medium">Home</Link>
                  <Link to="/allMovies" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white font-medium">Movies</Link>

                  {userInfo ? (
                    <div className="pt-2 mt-2 border-t border-white/5 space-y-2">
                      <button
                        onClick={() => { handleCityClick(); setIsMobileMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white font-medium flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-400" />
                        {city || profileData?.city || "Select Location"}
                      </button>
                      <button onClick={profileHandler} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white font-medium">Profile</button>
                      <button onClick={logoutHandler} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 font-medium">Logout</button>
                    </div>
                  ) : (
                    <div className="pt-2 mt-2 border-t border-white/5 grid grid-cols-2 gap-3">
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 bg-white/5 rounded-xl text-white font-medium">Sign In</Link>
                      <Link to="/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 bg-primary-600 rounded-xl text-white font-medium">Sign Up</Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed header */}
      {/* active path is home or movie-detail or movie-theaters (if it has hero) */}
      {!isActive('/') && !location.pathname.startsWith('/movie-detail') && (
        <div className="h-32"></div>
      )}

      {showModal && (
        <CitiesModal
          show={showModal}
          handleClose={handleModalClose}
          handleCitySelect={handleCitySelect}
        />
      )}
    </>
  );
};

export default Header;

