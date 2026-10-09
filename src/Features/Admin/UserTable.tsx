import React, { useState, useEffect } from "react";
import { AiFillLock, AiFillUnlock, AiOutlineSearch } from "react-icons/ai";
import {
  useAdminBlockUserMutation,
  useAdminUnblockUserMutation,
} from "../../Store/AdminApiSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Store";
import { User, UsersTableProps } from "../../Core/UserTypes";

const UserTable: React.FC<UsersTableProps> = ({ users, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(5);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/get-user");
    } else {
      navigate("/admin/dashboard");
    }
  }, [adminInfo, navigate]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const [blockUser] = useAdminBlockUserMutation();
  const [unblockUser] = useAdminUnblockUserMutation();

  const handleBlock = async () => {
    if (!selectedUser) return;
    try {
      await blockUser({ userId: selectedUser._id }).unwrap();
      toast.success("User blocked successfully");
      refetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error);
    } finally {
      setShowModal(false);
    }
  };

  const handleUnblock = async (user: User) => {
    try {
      await unblockUser({ userId: user._id }).unwrap();
      toast.success("User unblocked successfully");
      refetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage all registered users and their status.</p>
          </div>
          <div className="relative w-full md:w-96 group">
            <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search users by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 shadow-sm">
                <th className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Phone</th>
                <th className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors bg-white dark:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{user.name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">{user.phone || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.isBlocked
                        ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                        : "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20"
                        }`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          if (user.isBlocked) {
                            handleUnblock(user);
                          } else {
                            setSelectedUser(user);
                            setShowModal(true);
                          }
                        }}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all transform hover:-translate-y-0.5
                          ${user.isBlocked
                            ? "bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-transparent"
                          }
                        `}
                      >
                        {user.isBlocked ? (
                          <><AiFillUnlock className="text-sm" /> Unblock</>
                        ) : (
                          <><AiFillLock className="text-sm" /> Block</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-400">
                        <AiOutlineSearch size={20} />
                      </div>
                      <p className="text-base font-medium">No users found</p>
                      <p className="text-sm mt-1">Try adjusting your search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > usersPerPage && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-center bg-gray-50 dark:bg-gray-900/30">
            <div className="flex gap-2">
              {Array.from({
                length: Math.ceil(filteredUsers.length / usersPerPage),
              }).map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`
                        w-8 h-8 rounded-lg font-semibold transition-all text-sm flex items-center justify-center
                        ${currentPage === index + 1
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                    `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 scale-100 opacity-100 transition-all">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Action</h3>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                <AiFillLock size={24} />
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-lg font-medium">
                Block User
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                Are you sure you want to block <span className="font-bold text-gray-900 dark:text-white">{selectedUser?.name}</span>? This will prevent them from logging in and accessing the platform.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/30">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-600/30 transition-all"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
