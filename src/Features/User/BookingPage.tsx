import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaFilm, FaTicketAlt, FaWallet, FaCheckCircle, FaTimes, FaPercent, FaCreditCard, FaPaypal } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useCreateBookingMutation,
  useGetTransactionHistoryQuery,
  useGetOffersByTheaterIdQuery,
} from "../../Store/UserApiSlice";
import { loadScript } from "../../Core/LoadScript";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Loader from "./Loader";
import { RazorpayOptions, RazorpayPaymentObject } from "../../Global";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";
import { LocationState, Transaction } from "../../Core/WalletTypes";

import { Offer } from "../../Core/TheaterTypes";
import { motion, AnimatePresence } from "framer-motion";

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state: RootState) => state.auth);

  const { scheduleId, movieId, theaterId, screenId, showTime, movieTitle } =
    location.state || {};
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const { data } = useGetTransactionHistoryQuery(userInfo?.id);

  const transactions: Transaction[] = Array.isArray(
    data?.transactions?.transactions
  )
    ? data.transactions.transactions
    : [];

  const walletBalance: number =
    data?.transactions?.balance ||
    transactions.reduce(
      (total, transaction) =>
        transaction.type === "credit"
          ? total + transaction.amount
          : total - transaction.amount,
      0
    );

  const {
    selectedSeats = [],
    theaterName = "Unknown Theater",
    date = new Date().toISOString(),
    totalPrice = 0,
  } = location.state as LocationState;

  const [createBooking, { isLoading: isBookingLoading }] =
    useCreateBookingMutation();
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "paypal" | "wallet" | null
  >(null);

  const formattedDate = new Date(date || "").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Ticket Booking`;
  }, []);

  const convenienceFee = totalPrice * 0.1;

  const { data: offers, isLoading: offersLoading } =
    useGetOffersByTheaterIdQuery(theaterId);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(
    totalPrice + convenienceFee
  );
  const [selectedPaymentMethods, setSelectedPaymentMethods] =
    useState<string>("");

  const handleRazorpayPayment = async () => {
    setPaymentMethod("razorpay");

    const scriptLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!scriptLoaded) {
      Swal.fire(
        "Error",
        "Razorpay SDK failed to load. Check your internet connection.",
        "error"
      );
      return;
    }

    const razorpayApiKey = "rzp_test_RIuFkzXFQwkp22";

    if (!razorpayApiKey) {
      Swal.fire(
        "Error",
        "Razorpay API Key is missing. Please configure it in your environment variables.",
        "error"
      );
      return;
    }

    const options: RazorpayOptions = {
      key: razorpayApiKey,
      amount: finalPrice * 100,
      currency: "INR",
      name: "TicketHive",
      description: "Movie Ticket Booking",
      handler: async (response: { razorpay_payment_id: string }) => {
        Swal.fire(
          "Payment Successful",
          "Your payment has been completed.",
          "success"
        );
        await handleCreateBooking("razorpay");
        navigate("/thankyou", {
          state: { paymentId: response.razorpay_payment_id },
        });
      },
      prefill: {
        name: "John Doe",
        email: "johndoe@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#457b9d",
      },
    };

    const RazorpayConstructor = window.Razorpay as new (
      options: RazorpayOptions
    ) => RazorpayPaymentObject;
    const paymentObject = new RazorpayConstructor(options);
    paymentObject.open();
  };

  const offerId = selectedOffer?._id;

  const handleCreateBooking = async (method: string) => {
    try {
      const bookingData = {
        userId: userInfo?.id,
        scheduleId: scheduleId,
        movieId: movieId,
        theaterId: theaterId,
        seatIds: selectedSeats,
        screenId: screenId,
        offerId: offerId,
        bookingDate: date, // Send the actual date, not the formatted string
        showTime,
        totalPrice,
        paymentStatus: "pending",
        paymentMethod: method,
        convenienceFee,
      };

      console.log("📤 Sending booking data:", bookingData);

      await createBooking(bookingData).unwrap();
      Swal.fire(
        "Booking Successful",
        "Your booking has been successfully processed.",
        "success"
      );
    } catch (err: any) {
      console.error("Booking Error:", err);
      Swal.fire(
        "Booking Failed",
        `There was an error processing your booking: ${err?.message || "Unknown error occurred"
        }`,
        "error"
      );
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance < finalPrice) {
      setInsufficientFunds(true);
      Swal.fire(
        "Insufficient Funds",
        "You don't have enough wallet balance to complete the payment.",
        "error"
      );
      return;
    }

    setPaymentMethod("wallet");

    try {
      await handleCreateBooking("wallet");
      Swal.fire(
        "Payment Successful",
        "Your wallet payment has been completed.",
        "success"
      );

      navigate("/thankyou", {
        state: { paymentId: `WALLET-${new Date().getTime()}` },
      });
    } catch (error) {
      console.log(
        "An error occurred during wallet payment. Please try again",
        error
      );

      Swal.fire(
        "Payment Error",
        "An error occurred during wallet payment. Please try again.",
        "error"
      );
    }
  };

  const handleProceed = (method: "razorpay" | "paypal" | "wallet") => {
    setPaymentMethod(method);
    setShowModal(false);
  };

  const handleOfferSelect = (offer: Offer | null) => {
    setSelectedOffer(offer);

    if (offer) {
      setShowOfferModal(true);
      const discount = offer.discountValue ? offer.discountValue : 0;
      const offerPrice = totalPrice - (totalPrice * discount) / 100;
      const newFinalPrice = offerPrice + convenienceFee;
      setFinalPrice(newFinalPrice);
      setSelectedPaymentMethods(offer.paymentMethod || "");
    } else {
      setShowOfferModal(false);
      setFinalPrice(totalPrice + convenienceFee);
      setSelectedPaymentMethods("");
    }
  };

  if (loading || isBookingLoading || offersLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Ornament */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex-grow container mx-auto px-4 pb-8 md:pb-12 pt-2 z-10 relative">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Offers Section - Left Side on Desktop */}
          {offers && offers.length > 0 && (
            <div className="lg:w-1/3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl sticky top-8"
              >
                <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 flex items-center border-b border-white/10 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white mr-3 text-sm shadow-lg">
                    <FaPercent />
                  </span>
                  Exclusive Offers
                </h4>

                <div className="space-y-4">
                  {offers.map((offer: Offer, index: number) => {
                    const isSelected = selectedOffer === offer;
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOfferSelect(isSelected ? null : offer)}
                        className={`
                            relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group
                            ${isSelected
                            ? "bg-primary-900/10 border-primary-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                            : "bg-white/5 border-white/5 hover:border-white/10"
                          }
                          `}
                      >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <h5 className={`text-base font-bold ${isSelected ? "text-primary-400" : "text-white"}`}>
                            {offer.offerName}
                          </h5>
                          <div className={`
                              w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                              ${isSelected ? "border-primary-500 bg-primary-500 text-white" : "border-gray-500 bg-transparent"}
                            `}>
                            {isSelected && <FaCheckCircle className="text-xs" />}
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mb-3 line-clamp-2 relative z-10">
                          {offer.description || "Limited time offer based on payment method."}
                        </p>

                        <div className="flex items-center justify-between relative z-10">
                          <div className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg text-xs text-green-400 font-bold">
                            {offer.discountValue ? `${offer.discountValue}% OFF` : "Special Offer"}
                          </div>
                          <span className="text-xs text-gray-500 font-medium bg-black/30 px-2 py-1 rounded border border-white/5">
                            {offer.paymentMethod}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* Checkout Section */}
          <div className={`${offers && offers.length > 0 ? 'lg:w-2/3' : 'w-full max-w-4xl mx-auto'}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-primary-500/10 to-transparent blur-3xl rounded-full pointer-events-none"></div>

              {/* Movie Header */}
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 border-b border-white/5 pb-8">
                <div className="w-24 h-32 md:w-32 md:h-48 rounded-xl bg-gray-800 shadow-2xl flex-shrink-0 overflow-hidden border border-white/10 group">
                  {/* Placeholder for Movie Poster if available, or icon */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black group-hover:scale-110 transition-transform duration-500">
                    <FaFilm className="text-4xl text-gray-600" />
                  </div>
                </div>

                <div className="text-center md:text-left flex-grow">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 tracking-tight">
                    {movieTitle}
                  </h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 backdrop-blur-sm flex items-center">
                      <FaTicketAlt className="mr-2 text-primary-400" /> {theaterName}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 backdrop-blur-sm flex items-center">
                      <FaRegCalendarAlt className="mr-2 text-primary-400" /> {formattedDate} | {showTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seats & Price Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Left Col: Seats Summary */}
                <div className="space-y-6">
                  <div>
                    <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Selected Seats</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.length > 0 ? selectedSeats.map((seat, idx) => (
                        <motion.span
                          key={idx}
                          whileHover={{ scale: 1.1, translateY: -2 }}
                          className="px-3 py-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 text-white text-sm font-bold rounded-lg shadow-lg"
                        >
                          {seat}
                        </motion.span>
                      )) : (
                        <span className="text-gray-500 italic">No seats selected</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Col: Price Breakdown */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <h5 className="text-lg font-bold text-white mb-4 flex items-center">Payment Summary</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Base Ticket Price</span>
                      <span className="text-white">Rs. {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Convenience Fee (10%)</span>
                      <span className="text-white">Rs. {convenienceFee.toFixed(2)}</span>
                    </div>

                    {selectedOffer && (
                      <div className="flex justify-between items-center text-green-400 bg-green-900/20 px-3 py-2 rounded-lg border border-green-500/20 my-2">
                        <span>Discount ({selectedOffer.discountValue}%)</span>
                        <span className="font-bold">- Rs. {((totalPrice * (selectedOffer.discountValue || 0)) / 100).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

                    <div className="flex justify-between items-end">
                      <span className="text-gray-300 font-medium">Total Payable</span>
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
                        Rs. {finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Promo */}
              <div className="mt-8 mb-8 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-yellow-500/10 to-transparent transform skew-x-12 opacity-50"></div>
                <p className="text-yellow-400 text-sm font-semibold flex items-center justify-center relative z-10">
                  <FaWallet className="mr-2 text-lg" /> Pay using wallet and get <span className="font-bold border-b border-yellow-400 mx-1">10% cashback</span> instantly!
                </p>
              </div>

              {/* Proceed Action */}
              {!paymentMethod && (
                <motion.div
                  className="flex justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full md:w-3/4 py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-2xl text-lg font-bold shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center group"
                  >
                    Proceed to Payment <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </motion.div>
              )}

              {/* PayPal Render Area */}
              {paymentMethod === "paypal" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 p-6 bg-white rounded-2xl shadow-xl"
                >
                  <PayPalScriptProvider
                    options={{
                      clientId: "AXyOd3ZlDDoSe8nOeC_frUV-ZpEkIgzQtECddqkh91w04xHxYdsZr8LXxIzKHq0_Tnk87DQlR0UaEitm",
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      className="w-full"
                      style={{ layout: "vertical", shape: "rect", borderRadius: 12 }}
                      createOrder={(_data, actions) => {
                        setPaymentMethod("paypal");
                        return actions.order
                          .create({
                            purchase_units: [
                              {
                                amount: {
                                  value: finalPrice.toString(),
                                  currency_code: "USD",
                                },
                              },
                            ],
                            intent: "CAPTURE",
                          })
                          .catch((error) => {
                            console.error("Error creating order:", error);
                            return Promise.reject(error);
                          });
                      }}
                      onApprove={async (_data, actions) => {
                        if (actions.order) {
                          try {
                            const details = await actions.order.capture();
                            Swal.fire(
                              "Payment Successful",
                              "Your PayPal payment has been completed.",
                              "success"
                            );
                            await handleCreateBooking("paypal");
                            navigate("/thankyou", {
                              state: {
                                paymentId: details.id,
                                paymentDetails: details,
                              },
                            });
                          } catch (error) {
                            console.error("Error capturing PayPal order:", error);
                            Swal.fire("Payment Error", "Issue processing. Try again.", "error");
                          }
                        } else {
                          Swal.fire("Payment Error", "PayPal payment failed.", "error");
                        }
                      }}
                      onError={(error) => {
                        console.error("PayPal error:", error);
                        Swal.fire("Payment Error", "Error occurred. Try again.", "error");
                      }}
                    />
                  </PayPalScriptProvider>
                </motion.div>
              )}

            </motion.div>
          </div>
        </div>
      </div>



      {/* Payment Method Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-bold text-white">Select Payment Method</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-colors">
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {(selectedPaymentMethods === "" || selectedPaymentMethods === "Razorpay") && (
                  <button
                    onClick={handleRazorpayPayment}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-800 hover:from-blue-900/40 hover:to-blue-800/20 border border-gray-700 hover:border-blue-500 transition-all text-white group shadow-md"
                  >
                    <span className="flex items-center font-bold text-lg"><FaCreditCard className="mr-4 text-2xl text-blue-400" /> Razorpay</span>
                    <FaCheckCircle className="opacity-0 group-hover:opacity-100 text-blue-500 text-xl transition-all transform scale-0 group-hover:scale-100" />
                  </button>
                )}

                {(selectedPaymentMethods === "" || selectedPaymentMethods === "Paypal") && (
                  <button
                    onClick={() => handleProceed("paypal")}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-800 hover:from-blue-900/40 hover:to-indigo-800/20 border border-gray-700 hover:border-indigo-500 transition-all text-white group shadow-md"
                  >
                    <span className="flex items-center font-bold text-lg"><FaPaypal className="mr-4 text-2xl text-blue-500" /> PayPal</span>
                    <FaCheckCircle className="opacity-0 group-hover:opacity-100 text-indigo-500 text-xl transition-all transform scale-0 group-hover:scale-100" />
                  </button>
                )}

                {(selectedPaymentMethods === "" || selectedPaymentMethods === "Wallet") && (
                  <button
                    onClick={handleWalletPayment}
                    disabled={insufficientFunds}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-white group shadow-md ${insufficientFunds
                      ? "bg-red-900/20 border-red-500/30 cursor-not-allowed opacity-60 grayscale"
                      : "bg-gradient-to-r from-gray-800 to-gray-800 hover:from-yellow-900/40 hover:to-orange-800/20 border-gray-700 hover:border-yellow-500"
                      }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="flex items-center font-bold text-lg"><FaWallet className="mr-4 text-2xl text-yellow-500" /> TicketHive Wallet</span>
                      <span className="text-xs text-gray-400 ml-10 mt-1 font-mono">Available Balance: Rs. {walletBalance?.toFixed(2)}</span>
                    </div>
                    {insufficientFunds ? (
                      <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/30 uppercase font-bold tracking-wider">Insufficient</span>
                    ) : (
                      <FaCheckCircle className="opacity-0 group-hover:opacity-100 text-yellow-500 text-xl transition-all transform scale-0 group-hover:scale-100" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Offer Details Modal */}
      <AnimatePresence>
        {showOfferModal && selectedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
            >
              {/* Decorative blob */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/30 rounded-full blur-3xl pointer-events-none"></div>

              <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                <h3 className="text-2xl font-bold text-white">Offer Details</h3>
                <button onClick={() => setShowOfferModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-colors">
                  <FaTimes />
                </button>
              </div>
              <div className="p-8 relative z-10">
                <div className="flex flex-col items-center mb-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                    %
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{selectedOffer.offerName}</h4>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/10">{selectedOffer.paymentMethod}</span>
                </div>

                <p className="text-gray-400 mb-8 text-center leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  {selectedOffer.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-xs text-gray-500 uppercase">Valid From</p>
                    <p className="text-white font-medium">{new Date(selectedOffer.validityStart).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-xs text-gray-500 uppercase">Valid Until</p>
                    <p className="text-white font-medium">{new Date(selectedOffer.validityEnd).toLocaleDateString()}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowOfferModal(false)}
                  className="w-full mt-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BookingPage;
