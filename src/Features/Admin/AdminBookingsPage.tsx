import React, { useState, useEffect } from "react";
import { useGetAllBookingDetailsQuery } from "../../Store/AdminApiSlice";
import AdminLayout from "./AdminLayout";
import Loader from "../../Features/User/Loader";
import {
  FaCalendarAlt,
  FaCreditCard,
  FaTicketAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEye
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export interface Ticket {
  ticket: {
    bookingId: string;
    movieId: string;
    theaterName: string;
    screenName: string;
    seats: string[];
    bookingTime: string;
    paymentStatus: string;
    userName: string;
    userEmail: string;
    images: string[];
    showTime: string;
    paymentMethod: string;
    address: string;
    totalPrice: number;
  };
  movieDetails: {
    poster: string;
    title: string;
  };
}

const AdminBookingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allBookings, isLoading, refetch } = useGetAllBookingDetailsQuery({});

  useEffect(() => {
    document.title = "Admin Booking Management";
    refetch();
  }, [refetch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedBookings = allBookings?.tickets?.map((ticket: Ticket) => ({
    bookingId: ticket.ticket.bookingId,
    user: {
      name: ticket.ticket.userName,
      email: ticket.ticket.userEmail,
    },
    theater: { name: ticket.ticket.theaterName },
    movieTitle: ticket.movieDetails.title,
    showTime: ticket.ticket.showTime,
    paymentMethod: ticket.ticket.paymentMethod,
    status: ticket.ticket.paymentStatus || "Unknown",
    totalPrice: ticket.ticket.totalPrice,
    bookingTime: ticket.ticket.bookingTime,
  })) || [];

  const filteredBookings = transformedBookings.filter((booking: any) =>
    booking.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.movieTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout adminName="Admin">
      <div className="w-full space-y-6 p-4 md:p-8">

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Management</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Track and manage all user ticket bookings.</p>
            </div>
            <div className="relative w-full md:w-80 group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search bookings..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <FaTicketAlt size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Bookings Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
              {searchQuery ? "No bookings match your search criteria." : "There are no bookings to display at the moment."}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Booking ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">User Info</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Movie Details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {paginatedBookings.map((booking: any) => (
                    <tr
                      key={booking.bookingId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                          #{booking.bookingId.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{booking.user.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{booking.user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={booking.movieTitle}>
                            {booking.movieTitle}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {format(new Date(booking.bookingTime), 'MMM dd, yyyy')}</span>
                            <span>•</span>
                            <span>{booking.showTime}</span>
                          </div>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{booking.theater.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            Rs. {booking.totalPrice?.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 capitalize">
                            <FaCreditCard size={10} /> {booking.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`
                              inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border
                              ${booking.status === "confirmed"
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                              : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                            }
                            `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${booking.status === "confirmed" ? "bg-green-500" : "bg-yellow-500"}`}></span>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => navigate(`${booking.bookingId}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow-md"
                        >
                          <FaEye className="text-blue-500" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookingScreen;
