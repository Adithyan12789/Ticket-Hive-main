import React, { useState, useEffect } from "react";
import { AiFillLock, AiFillUnlock, AiOutlineSearch, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import {
  useAdminBlockTheaterOwnerMutation,
  useAdminUnblockTheaterOwnerMutation,
} from "../../Store/AdminApiSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Store";
import { Theater, TheaterOwnersTableProps } from "../../Core/TheaterTypes";
import { FaBuilding, FaEnvelope, FaPhone } from "react-icons/fa";

const TheaterOwnerTable: React.FC<TheaterOwnersTableProps> = ({ theaterOwners, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [TheaterOwnersPerPage] = useState<number>(8); // Consistent with other tables
  const [selectedTheaterOwner, setSelectedTheaterOwner] = useState<Theater | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/get-theaterOwner");
    } else {
      navigate("/admin/dashboard");
    }
  }, [adminInfo, navigate]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredTheaterOwners = theaterOwners.filter(
    (theaterOwners) =>
      theaterOwners.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theaterOwners.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastTheaterOwners = currentPage * TheaterOwnersPerPage;
  const indexOfFirstTheaterOwners = indexOfLastTheaterOwners - TheaterOwnersPerPage;
  const currentTheaterOwners = filteredTheaterOwners.slice(indexOfFirstTheaterOwners, indexOfLastTheaterOwners);
  const totalPages = Math.ceil(filteredTheaterOwners.length / TheaterOwnersPerPage);

  const [blockTheaterOwner] = useAdminBlockTheaterOwnerMutation();
  const [unblockTheaterOwner] = useAdminUnblockTheaterOwnerMutation();

  const handleBlock = async () => {
    if (!selectedTheaterOwner) return;
    try {
      await blockTheaterOwner({ theaterOwnerId: selectedTheaterOwner._id }).unwrap();
      toast.success("Theater Owner blocked successfully");
      refetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error);
    } finally {
      setShowModal(false);
    }
  };

  const handleUnblock = async (TheaterOwners: Theater) => {
    try {
      await unblockTheaterOwner({ theaterOwnerId: TheaterOwners._id }).unwrap();
      toast.success("Theater Owner unblocked successfully");
      refetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
              <FaBuilding size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Theater Owners</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage registered theater owners</p>
            </div>
          </div>

          <div className="relative group">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search Owners..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-full md:w-72 placeholder-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                <th className="px-6 py-4 whitespace-nowrap">Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Email</th>
                <th className="px-6 py-4 whitespace-nowrap">Phone</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {currentTheaterOwners.length > 0 ? (
                currentTheaterOwners.map((theaterOwner, index) => (
                  <tr
                    key={theaterOwner._id || index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {theaterOwner.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{theaterOwner.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <FaEnvelope className="text-gray-400" size={12} />
                        {theaterOwner.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-mono">
                        <FaPhone className="text-gray-400" size={12} />
                        {theaterOwner.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize
                        ${theaterOwner.isBlocked
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${theaterOwner.isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
                        {theaterOwner.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          if (theaterOwner.isBlocked) {
                            handleUnblock(theaterOwner);
                          } else {
                            setSelectedTheaterOwner(theaterOwner);
                            setShowModal(true);
                          }
                        }}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm border
                          ${theaterOwner.isBlocked
                            ? "bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40"
                          }
                        `}
                      >
                        {theaterOwner.isBlocked ? (
                          <><AiFillUnlock size={14} /> Unblock</>
                        ) : (
                          <><AiFillLock size={14} /> Block</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-full mb-3">
                        <AiOutlineSearch size={24} className="text-gray-400" />
                      </div>
                      <p>No theater owners found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {indexOfFirstTheaterOwners + 1} to {Math.min(indexOfLastTheaterOwners, filteredTheaterOwners.length)} of {filteredTheaterOwners.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <AiOutlineLeft size={12} />
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`
                    w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center
                    ${currentPage === index + 1
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <AiOutlineRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <AiFillLock size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Block Theater Owner?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                Are you sure you want to block <span className="font-bold text-gray-900 dark:text-white">{selectedTheaterOwner?.name}</span>?
                They will lose access to their dashboard immediately.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlock}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:translate-y-0.5 text-sm"
                >
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterOwnerTable;
