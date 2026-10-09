import React, { useState, useEffect } from "react";
import { useGetAllBookingDetailsQuery } from "../../Store/TheaterApiSlice";
import TheaterOwnerLayout from "./TheaterLayout";
import Loader from "../../Features/User/Loader";
import { FaInfoCircle, FaSearch } from "react-icons/fa";
import { BookingDetails } from "../../Core/BookingTypes";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  };
  movieDetails: {
    poster: string;
  };
}

const TheaterBookingScreen: React.FC = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: allBookings,
    isLoading,
    refetch,
  } = useGetAllBookingDetailsQuery({});

  useEffect(() => {
    document.title = "Theater Owner Booking Details";
    refetch();
  }, [refetch]);

  const transformedBookings =
    allBookings?.tickets?.map((ticket: Ticket) => ({
      bookingId: ticket.ticket.bookingId,
      user: {
        name: ticket.ticket.userName,
        email: ticket.ticket.userEmail,
      },
      theater: { name: ticket.ticket.theaterName },
      poster: ticket.movieDetails.poster,
      images: ticket.ticket.images,
      showTime: ticket.ticket.showTime,
      paymentMethod: ticket.ticket.paymentMethod,
      seats: ticket.ticket.seats || [],
      status: ticket.ticket.paymentStatus || "Unknown",
    })) || [];

  const filteredBookings = transformedBookings.filter((booking: BookingDetails) =>
    booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.user.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const theaterOwnerName =
    transformedBookings?.user?.name || "Theater Owner";

  return (
    <TheaterOwnerLayout theaterOwnerName={theaterOwnerName}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Booking Details</h1>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2 bg-dark-surface border border-white/10 rounded-xl text-white focus:ring-1 focus:ring-red-500 outline-none w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-dark-surface rounded-2xl border border-white/10">
            <p className="text-gray-400 text-lg">
              No bookings found.
            </p>
          </div>
        ) : (
          <div className="bg-dark-surface rounded-2xl border border-white/10 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold text-gray-300">Booking ID</th>
                    <th className="p-4 font-semibold text-gray-300">User</th>
                    <th className="p-4 font-semibold text-gray-300">Theater</th>
                    <th className="p-4 font-semibold text-gray-300">Payment</th>
                    <th className="p-4 font-semibold text-gray-300">Status</th>
                    <th className="p-4 font-semibold text-gray-300 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedBookings.map((booking: BookingDetails) => (
                    <motion.tr
                      key={booking.bookingId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-gray-400">
                        {`${booking.bookingId.slice(0, 6)}...${booking.bookingId.slice(-4)}`}
                      </td>
                      <td className="p-4 font-medium text-white">{booking.user.name}</td>
                      <td className="p-4 text-gray-400">{booking.theater.name}</td>
                      <td className="p-4 text-gray-400">{booking.paymentMethod}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === "confirmed"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => navigate(booking.bookingId)}
                          className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                        >
                          <FaInfoCircle />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-6 border-t border-white/10">
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {[...Array(totalPages).keys()].map(page => (
                    <button
                      key={page + 1}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${currentPage === page + 1
                          ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TheaterOwnerLayout>
  );
};

export default TheaterBookingScreen;
