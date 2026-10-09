import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaWallet, FaSignOutAlt } from "react-icons/fa";
import { AppDispatch } from "../../Store";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../../Store/UserApiSlice";
import { logout } from "../../Store/AuthSlice";
import { motion } from "framer-motion";

const UserProfileNavbar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: "My Profile", icon: FaUser, path: "/profile" },
    { name: "Booking Details", icon: FaCalendarAlt, path: "/tickets" },
    { name: "Wallet", icon: FaWallet, path: "/wallet" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-dark-surface rounded-2xl p-6 border border-white/10 shadow-xl"
    >
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-primary-600/20 text-primary-400 font-semibold border border-primary-500/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon className={`mr-3 text-lg ${isActive ? "text-primary-400" : "text-gray-500 group-hover:text-white"}`} />
              {item.name}
              {isActive && (
                <motion.div layoutId="activeIndicator" className="ml-auto w-2 h-2 rounded-full bg-primary-400" />
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/10">
          <button
            onClick={logoutHandler}
            className="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <FaSignOutAlt className="mr-3 text-lg" />
            Log Out
          </button>
        </div>
      </nav>
    </motion.div>
  );
};

export default UserProfileNavbar;
