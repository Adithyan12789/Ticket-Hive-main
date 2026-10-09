import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFilm,
  FaTicketAlt,
  FaTag,
  FaCogs,
  FaComments,
} from "react-icons/fa";

const TheaterOwnerSidebar: React.FC = () => {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/theater", icon: FaHome },
    { name: "Management", path: "/theater/management", icon: FaFilm },
    { name: "Bookings", path: "/theater/bookings", icon: FaTicketAlt },
    { name: "Offers", path: "/theater/offer-management", icon: FaTag },
    { name: "Chat", path: "/theater/chat", icon: FaComments },
    { name: "Settings", path: "/admin/settings", icon: FaCogs },
  ];

  return (
    <div className="fixed top-0 left-0 bottom-0 w-64 bg-dark-surface border-r border-white/10 z-30 pt-28 shadow-2xl flex flex-col">
      <div className="px-6 pb-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white tracking-wide text-center">
          Theater Panel
        </h2>
      </div>

      <ul className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive =
            location.pathname === link.path ||
            (link.path === "/theater/management" &&
              (location.pathname === "/theater/details" ||
                location.pathname === "/theater/edit"));

          return (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20 translate-x-1"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <link.icon className={`text-lg ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-4 border-t border-white/10">
        <p className="text-center text-xs text-gray-500">
          &copy; 2024 Ticket Hive
        </p>
      </div>
    </div>
  );
};

export default TheaterOwnerSidebar;
