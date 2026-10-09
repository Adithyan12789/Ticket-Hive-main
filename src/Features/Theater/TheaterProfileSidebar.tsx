import { NavLink, useLocation } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt, FaWallet } from "react-icons/fa";

const TheaterOwnerProfileSidebar: React.FC = () => {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/theater", icon: FaUser },
    { name: "My Profile", path: "/theater-profile", icon: FaUser },
    { name: "Booking Details", path: "/settings", icon: FaCog },
    { name: "Wallet", path: "/wallet", icon: FaWallet },
    { name: "Log Out", path: "/theater-logout", icon: FaSignOutAlt },
  ];

  return (
    <div className="fixed top-24 left-0 w-64 h-[calc(100vh-6rem)] bg-dark-surface border-r border-white/10 p-5 overflow-y-auto">
      <ul className="space-y-3 mt-10">
        {links.map((link) => {
          const isActive =
            link.path === "/theater-profile"
              ? location.pathname === "/theater-profile" || location.pathname === "/"
              : location.pathname === link.path;

          return (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                    ? "bg-white text-black font-bold shadow-lg"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <link.icon className="text-lg" />
                {link.name}
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="absolute bottom-5 left-0 w-full text-center text-xs text-gray-500">
        &copy; 2024 User Panel
      </div>
    </div>
  );
};

export default TheaterOwnerProfileSidebar;
