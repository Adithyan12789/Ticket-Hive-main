import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import Loader from "./Loader";
import {
  useGetBookingDetailsQuery,
  useCancelBookingMutation,
} from "../../Store/UserApiSlice";
import { RootState } from "../../Store";
import {
  FaFilm,
  FaTheaterMasks,
  FaChair,
  FaClock,
  FaIdBadge,
  FaQrcode,
  FaExclamationTriangle
} from "react-icons/fa";
import Footer from "./Footer";
import { backendUrl } from "../../url";
import { motion, AnimatePresence } from "framer-motion";

const USER_MOVIE_POSTER = `${backendUrl}/MoviePosters/`;

const TicketDetailsScreen: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetBookingDetailsQuery(userInfo?.id);
  const [cancelBooking] = useCancelBookingMutation();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const ticket = data?.tickets?.find(
    (t: { ticket: { bookingId: string | undefined } }) =>
      t.ticket.bookingId === bookingId
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Ticket Details - ${ticket?.movieDetails.title || "Not Found"
      }`;
  }, [ticket]);

  const handleCancel = async () => {
    try {
      await cancelBooking(ticket?.ticket.bookingId).unwrap();
      toast.success("Ticket cancelled successfully!");
      setShowModal(false);
      navigate("/profile");
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel the ticket. Please try again later.");
    }
  };

  if (loading || isLoading) return <Loader />;
  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg text-white">
        <h3 className="text-2xl font-bold text-red-500 mb-6">Ticket not found!</h3>
        <button
          onClick={() => navigate("/profile")}
          className="px-6 py-2 border border-primary-500 text-primary-400 rounded-lg hover:bg-primary-500 hover:text-white transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-surface rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative"
        >
          {/* Background Blur Effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="flex flex-col md:flex-row">
            {/* Poster Section */}
            <div className="md:w-1/3 p-6 bg-black/20">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/10 group">
                <img
                  src={
                    ticket.movieDetails.poster
                      ? `${USER_MOVIE_POSTER}${ticket.movieDetails.poster}`
                      : "/placeholder-image.png"
                  }
                  alt={ticket.movieDetails.title || "Movie Poster"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="md:w-2/3 p-8 border-l border-white/5">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 flex items-center">
                <FaFilm className="mr-4 text-primary-500" />
                {ticket.movieDetails.title || "Untitled Movie"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Genre</h4>
                    <p className="text-white text-lg">{ticket.movieDetails.genre.join(", ") || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Duration</h4>
                    <p className="text-white text-lg">{ticket.movieDetails.duration || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1 flex items-center">
                      <FaTheaterMasks className="mr-2" /> Theater
                    </h4>
                    <p className="text-white text-lg">{ticket.ticket.theaterName || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Screen</h4>
                    <p className="text-white text-lg">{ticket.ticket.screenName || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1 flex items-center">
                      <FaChair className="mr-2" /> Seats
                    </h4>
                    <p className="text-white text-lg break-words">{ticket.ticket.seats.join(", ") || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1 flex items-center">
                      <FaClock className="mr-2" /> Date & Time
                    </h4>
                    <p className="text-white text-lg">{new Date(ticket.ticket.bookingDate).toLocaleString() || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1 flex items-center">
                    <FaIdBadge className="mr-2" /> Booking ID
                  </h4>
                  <p className="text-xl font-mono text-white tracking-wider">{ticket.ticket.bookingId || "N/A"}</p>

                  <div className="mt-4">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider
                                    ${ticket.ticket.paymentStatus === "pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : ""}
                                    ${ticket.ticket.paymentStatus === "cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" : ""}
                                    ${ticket.ticket.paymentStatus === "Confirmed" || ticket.ticket.paymentStatus === "Completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" : ""}
                                `}>
                      Status: {ticket.ticket.paymentStatus || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <h5 className="text-gray-400 text-xs uppercase tracking-widest mb-3 flex items-center">
                    <FaQrcode className="mr-2" /> Scan to Verify
                  </h5>
                  <div className="p-2 bg-white rounded-lg">
                    <QRCode
                      value={ticket.ticket.bookingId || "N/A"}
                      size={100}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 overflow-x-hidden">
                <button
                  onClick={() => navigate("/profile")}
                  className="px-6 py-3 rounded-xl border border-gray-600 text-white hover:bg-gray-700 transition-colors font-medium "
                >
                  Back to Profile
                </button>
                {ticket.ticket.paymentStatus !== "Confirmed" && ticket.ticket.paymentStatus !== "cancelled" && (
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={ticket.ticket.paymentStatus === "cancelled"}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Ticket
                  </button>
                )}
                {ticket.ticket.paymentStatus === "Confirmed" && (
                  <div className="hidden" />
                  // Optionally allow cancellation for confirmed tickets if business logic allows, 
                  // but condition above hides it for confirmed? 
                  // The original code was: ticket.ticket.paymentStatus !== "Confirmed" && (...)
                  // That means Confirmed tickets CANNOT be cancelled?
                  // Adjusting logic to match original: if NOT Confirmed, show Cancel.
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-dark-surface p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaExclamationTriangle className="text-3xl text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Cancel Ticket?</h3>
              <p className="text-gray-400 mb-8">
                Are you sure you want to cancel this ticket? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default TicketDetailsScreen;
