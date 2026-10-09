import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[] | null;
  onNotificationClick: (notificationId: string) => void;
  onClearAll: () => void;
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? 'Just now'
    : date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
}

export function NotificationDropdown({ notifications, onNotificationClick, onClearAll }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notificationCount = notifications?.length ?? 0;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-300 hover:text-white transition-colors outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={faBell} className="text-xl" />
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold border-2 border-dark-surface min-w-[18px] flex items-center justify-center translate-x-1 -translate-y-1">
            {notificationCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-dark-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white text-base">Notifications</h3>
              {notificationCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 text-xs font-semibold border border-primary-500/30">
                  {notificationCount} New
                </span>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {!notifications || notificationCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <FontAwesomeIcon icon={faBell} className="text-4xl mb-3 opacity-20" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      onClick={() => {
                        onNotificationClick(notification._id);
                        setIsOpen(false);
                      }}
                      className="p-4 hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <p className="text-sm text-gray-300 mb-1 group-hover:text-white transition-colors">
                        {notification.message || "New Notification"}
                      </p>
                      <span className="text-xs text-gray-500 block text-right group-hover:text-primary-400 transition-colors">
                        {formatDate(notification.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {notifications && notificationCount > 0 && (
              <div className="p-3 border-t border-white/10 bg-dark-bg/50">
                <button
                  onClick={() => {
                    Swal.fire({
                      title: 'Clear all notifications?',
                      text: "You won't be able to undo this!",
                      icon: 'warning',
                      background: '#1a1a1a',
                      color: '#ffffff',
                      showCancelButton: true,
                      confirmButtonColor: '#e63946',
                      cancelButtonColor: '#6b7280',
                      confirmButtonText: 'Yes, clear all!',
                      cancelButtonText: 'Cancel',
                    }).then((result) => {
                      if (result.isConfirmed) {
                        onClearAll();
                        Swal.fire({
                          title: 'Cleared!',
                          text: 'Your notifications have been cleared.',
                          icon: 'success',
                          background: '#1a1a1a',
                          color: '#ffffff',
                          confirmButtonColor: '#3A5E49'
                        });
                        setIsOpen(false);
                      }
                    });
                  }}
                  className="w-full flex items-center justify-center py-2 text-sm text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all font-semibold"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
