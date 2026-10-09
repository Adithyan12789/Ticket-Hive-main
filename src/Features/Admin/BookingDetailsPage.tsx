import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetAllBookingDetailsQuery,
  useUpdateBookingStatusMutation,
} from "../../Store/AdminApiSlice";
import AdminLayout from "./AdminLayout";
import Loader from "../../Features/User/Loader";
import { Ticket } from "./AdminBookingsPage";
import Swal from "sweetalert2";
import { backendUrl } from "../../url";
import { FaUser, FaBuilding, FaTicketAlt, FaTag, FaImage } from "react-icons/fa";

const AdminBookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking, isLoading } = useGetAllBookingDetailsQuery({}) as any;
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [status, setStatus] = useState<string>("");

  console.log("Booking: ", booking);

  const selectedBooking = booking?.tickets?.find(
    (ticket: Ticket) => ticket.ticket.bookingId === bookingId
  );

  console.log("selectedBooking: ", selectedBooking);

  useEffect(() => {
    document.title = "Booking Details - Admin";
  }, []);

  if (isLoading) return <Loader />;

  if (!selectedBooking) {
    return (
      <AdminLayout adminName="Admin">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Booking Not Found</h1>
          <Link to="/admin/bookings" className="px-6 py-2 bg-white border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
            Go Back to Bookings
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const ticket = selectedBooking.ticket;
  const movieDetails = selectedBooking.movieDetails;
  const offerDetails = selectedBooking.offerDetails;

  const handleStatusChange = async (newStatus: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to update the booking status to ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setStatus(newStatus);
      await updateBookingStatus({
        bookingId: ticket.bookingId,
        status: newStatus,
      });
      Swal.fire(
        "Updated!",
        `Booking status has been updated to ${newStatus}.`,
        "success"
      );
    }
  };

  const BACKDROP_BASE_URL = `${backendUrl}/TheatersImages/`;
  const MOVIE_IMAGES_DIR_PATH = `${backendUrl}/MoviePosters/`;

  return (
    <AdminLayout adminName="Admin">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FaTicketAlt className="text-blue-600 dark:text-blue-500" />
          Booking Details
        </h1>

        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* User Info */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <FaUser className="text-blue-500" /> User Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Name</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{ticket.userName}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Email</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{ticket.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Theater Info */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <FaBuilding className="text-blue-500" /> Theater Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Theater</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{ticket.theaterName}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Screen</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{ticket.screenName}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="block text-gray-500 dark:text-gray-400 font-medium mb-1">Address</span>
                    <span className="block text-gray-900 dark:text-white">{ticket.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Theater Images */}
            <div className="mt-8">
              <h4 className="flex items-center gap-2 text-md font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <FaImage className="text-gray-400 dark:text-gray-500" /> Theater Images
              </h4>
              <div className="flex flex-wrap gap-4">
                {ticket.images && ticket.images.length > 0 ? (
                  ticket.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={`${BACKDROP_BASE_URL}${image}`}
                      alt={`Theater Image ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                    />
                  ))
                ) : (
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs text-center p-2">
                    No Image
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Offer Details */}
          {offerDetails && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">
                <FaTag className="text-green-500" /> Offer Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                  <span className="block text-green-600 dark:text-green-400 text-xs uppercase font-bold tracking-wider mb-1">Offer Name</span>
                  <span className="text-green-900 dark:text-green-300 font-bold text-lg">{offerDetails.offerName}</span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl">
                  <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Discount</span>
                  <span className="text-gray-900 dark:text-white font-bold text-lg">{offerDetails.discountValue}%</span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl sm:col-span-2">
                  <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Description</span>
                  <span className="text-gray-700 dark:text-gray-300">{offerDetails.description}</span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl">
                  <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Min Purchase</span>
                  <span className="text-gray-900 dark:text-white font-semibold">₹{offerDetails.minPurchaseAmount}</span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl">
                  <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Validity</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {new Date(offerDetails.validityStart).toLocaleDateString()} - {new Date(offerDetails.validityEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ticket & Movie Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2 mb-6">
              <FaTicketAlt className="text-purple-500" /> Movie & Ticket Information
            </h4>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Booking ID</span>
                    <div className="text-gray-900 dark:text-white font-mono text-sm mt-1">{ticket.bookingId}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Show Time</span>
                    <div className="text-gray-900 dark:text-white font-medium mt-1">{ticket.showTime}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Movie</span>
                    <div className="text-gray-900 dark:text-white font-bold mt-1 text-lg">{movieDetails.title}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{movieDetails.genre.join(", ")} • {movieDetails.duration}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Seats</span>
                    <div className="text-gray-900 dark:text-white font-medium mt-1">{ticket.seats?.join(", ") || "N/A"}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Total Price</span>
                    <div className="text-gray-900 dark:text-white font-bold text-xl mt-1">₹{ticket.totalPrice}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Payment</span>
                    <div className="text-gray-900 dark:text-white font-medium mt-1">{ticket.paymentMethod}</div>
                    <div className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold mt-1 ${ticket.paymentStatus === 'succeeded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {ticket.paymentStatus}
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Change Booking Status
                  </label>
                  <div className="relative">
                    <select
                      id="statusSelect"
                      value={status || ticket.paymentStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-colors"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64 flex-shrink-0">
                <img
                  src={`${MOVIE_IMAGES_DIR_PATH}${movieDetails.poster}`}
                  alt="Movie Poster"
                  className="w-full h-auto rounded-xl shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookingDetailPage;
