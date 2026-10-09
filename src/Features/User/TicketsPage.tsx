import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { useSelector } from "react-redux";
import { useGetBookingDetailsQuery } from "../../Store/UserApiSlice";
import { RootState } from "../../Store";
import UserNavBar from "./UserNavBar";
import { MovieManagement } from "../../Core/MoviesTypes";
import { Ticket2 } from "../../Core/BookingTypes";
import { FaFilter, FaSort, FaTicketAlt, FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";

interface TicketEntry {
  movieDetails: MovieManagement;
  ticket: Ticket2;
}

const TicketsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const userId = userInfo?.id

  const { data, isLoading, refetch } = useGetBookingDetailsQuery(userId);
  const tickets: TicketEntry[] = data?.tickets || [];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("movieTitle");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    document.title = "Ticket Hive - Booking Details";
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch, data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const filteredTickets =
    filterStatus === "all"
      ? tickets
      : tickets.filter(
        (ticket) => ticket.ticket.paymentStatus.toLowerCase() === filterStatus.toLowerCase()
      );

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === "movieTitle") {
      return a.movieDetails.title.localeCompare(b.movieDetails.title);
    } else {
      // Sort by booking time (newest first)
      return (
        new Date(b.ticket.bookingTime).getTime() -
        new Date(a.ticket.bookingTime).getTime()
      );
    }
  });

  const totalTickets = sortedTickets.length;
  const totalPages = Math.ceil(totalTickets / itemsPerPage);

  const indexOfLastTicket = currentPage * itemsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - itemsPerPage;
  const currentTickets = sortedTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading || isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300 font-sans">
      <UserNavBar />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-display">Your Tickets</h1>
              <p className="text-gray-400">Manage and view your booking history</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Filter */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-4 py-2 bg-dark-surface border border-gray-700 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white appearance-none cursor-pointer hover:border-gray-600 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSort className="text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-4 py-2 bg-dark-surface border border-gray-700 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white appearance-none cursor-pointer hover:border-gray-600 transition-all"
                >
                  <option value="movieTitle">Movie Title</option>
                  <option value="bookingTime">Booking Time</option>
                </select>
              </div>
            </div>
          </div>

          {tickets.length === 0 ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-dark-surface rounded-2xl border border-dashed border-gray-700"
            >
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <FaTicketAlt className="text-3xl text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
              <p className="text-gray-400 text-center max-w-md mb-8">
                It looks like you haven't booked any tickets yet. Start exploring movies and book your first experience!
              </p>
              <Link to="/allMovies" className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-600/30">
                Explore Movies
              </Link>
            </motion.div>
          ) : (
            <div className="bg-dark-surface rounded-xl border border-white/5 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Movie Title</th>
                      <th className="px-6 py-4 font-semibold">Theater</th>
                      <th className="px-6 py-4 font-semibold text-center">Status</th>
                      <th className="px-6 py-4 font-semibold">Booking ID</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentTickets.map((ticketEntry, index) => (
                      <motion.tr
                        key={ticketEntry.ticket.bookingId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-lg">{ticketEntry.movieDetails.title}</div>
                          <div className="text-xs text-gray-500">{new Date(ticketEntry.ticket.bookingTime).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {ticketEntry.ticket.theaterName}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${ticketEntry.ticket.paymentStatus.toLowerCase() === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''}
                                                ${ticketEntry.ticket.paymentStatus.toLowerCase() === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : ''}
                                                ${ticketEntry.ticket.paymentStatus.toLowerCase() === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                                            `}>
                            {ticketEntry.ticket.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                          {ticketEntry.ticket.bookingId}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/ticket/${ticketEntry.ticket.bookingId}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600/10 hover:bg-primary-600 text-primary-400 hover:text-white transition-all duration-300 font-medium text-sm border border-primary-600/20 hover:border-primary-600"
                          >
                            <FaEye /> View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-white/5 bg-white/5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  <div className="flex gap-2">
                    {[...Array(totalPages).keys()].map((pageNumber) => (
                      <button
                        key={pageNumber + 1}
                        onClick={() => handlePageChange(pageNumber + 1)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${pageNumber + 1 === currentPage
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {pageNumber + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TicketsScreen;
