import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import {
  useGetScreenByIdQuery,
  useUpdateSeatAvailabilityMutation,
} from "../../Store/UserApiSlice";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { Seat, ScreenDetails } from "../../Core/ScreenTypes";

import Swal from 'sweetalert2';
import { motion } from "framer-motion";

const SelectSeatPage: React.FC = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [, setLayout] = useState<Seat[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateSeatAvailability] = useUpdateSeatAvailabilityMutation();

  const { data, refetch, isLoading, isError } = useGetScreenByIdQuery(screenId);

  let screenDetails: ScreenDetails | null = null;

  if (data) {
    screenDetails = data as ScreenDetails;
  }

  const location = useLocation();

  const { date, movieTitle, movieId, theaterId, showTime } =
    location.state || {};

  const formattedDate = date ? `${date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}` : "";

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = screenDetails && screenDetails.screen
      ? `Screen - ${screenDetails.screen.screenNumber} - Select Seats`
      : "Select Seats";
    refetch();
  }, [screenDetails, refetch]);

  useEffect(() => {
    if (screenDetails && screenDetails.schedule) {
      // date from state is a Date object if passed correctly via navigate state, 
      // but might be a string if persisted or lost type. 
      // Safely handle date comparison.
      const safeDate = new Date(date);

      let selectedSchedule = screenDetails.schedule.find(
        (schedule) =>
          new Date(schedule.date).toDateString() === safeDate.toDateString() &&
          schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
      );

      if (!selectedSchedule) {
        selectedSchedule = screenDetails.schedule.find(
          (schedule) =>
            schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
        );
      }

      if (selectedSchedule) {
        const selectedShowTime = selectedSchedule.showTimes.find(
          (st) => st.time === showTime && st.movieTitle === movieTitle
        );
        if (selectedShowTime) {
          setLayout(selectedShowTime.layout);
        } else {
          toast.error("Show time not found.");
        }
      } else {
        toast.error("Schedule not found.");
      }
    } else {
      setLayout(generateSeatNames(5, 8));
    }
  }, [screenDetails, date, movieTitle, showTime]);

  const generateSeatNames = (rows: number, cols: number): Seat[][] => {
    const layout: Seat[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: Seat[] = [];
      const rowPrefix = String.fromCharCode(65 + (i % 26));
      for (let j = 1; j <= cols; j++) {
        row.push({
          label: `${rowPrefix}${j.toString().padStart(2, "0")}`,
          holdSeat: false,
          isAvailable: false,
        });
      }
      layout.push(row);
    }
    return layout;
  };

  const handleSeatSelection = (
    seatLabel: string,
    isAvailable: boolean,
    holdSeat: boolean
  ) => {
    if (!isAvailable || holdSeat) return;
    const newSelectedSeats = new Set(selectedSeats);
    if (newSelectedSeats.has(seatLabel)) {
      newSelectedSeats.delete(seatLabel);
    } else {
      newSelectedSeats.add(seatLabel);
      setTimeout(() => {
        newSelectedSeats.delete(seatLabel);
        setSelectedSeats(new Set(newSelectedSeats)); // Force update if component still mounted
      }, 10 * 60 * 1000);
    }
    setSelectedSeats(newSelectedSeats);
  };

  const renderScreenLayout = () => {
    if (!screenDetails) return <p className="text-gray-400">No seat layout available for this screen.</p>;

    const safeDate = new Date(date);
    const selectedSchedule = screenDetails?.schedule?.find(
      (schedule) =>
        new Date(schedule.date).toDateString() === safeDate.toDateString() &&
        schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
    ) || screenDetails?.schedule?.find(
      (schedule) =>
        schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
    );

    const selectedShowTime = selectedSchedule?.showTimes.find(
      (st) => st.time === showTime && st.movieTitle === movieTitle
    );

    return (
      <div className="flex flex-col items-center gap-4 w-full overflow-x-auto pb-20">
        <div className="flex flex-col items-center">
          {/* Screen Visual */}
          <div className="w-full max-w-lg h-2 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50 mb-8 rounded-full shadow-[0_4px_20px_rgba(59,130,246,0.5)]"></div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-12">All eyes this way please!</p>

          {/* Seats Layout */}
          <div className="flex flex-col gap-3">
            {selectedShowTime?.layout.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className={`flex justify-center items-center gap-2 md:gap-3 ${rowIndex === 1 ? "mb-6" : ""
                  } ${rowIndex === Math.floor(selectedShowTime.layout.length / 2) ? "mb-8" : ""}`}
              >
                {row.map((seat, seatIndex) => (
                  <React.Fragment key={`seat-${seatIndex}`}>
                    {/* 3 Section Split Logic */}
                    {(seatIndex === Math.floor(row.length / 3) || seatIndex === Math.floor((2 * row.length) / 3)) && (
                      <div className="w-6 md:w-10 shrink-0"></div>
                    )}
                    <motion.button
                      whileHover={seat.isAvailable && !seat.holdSeat ? { scale: 1.1 } : {}}
                      whileTap={seat.isAvailable && !seat.holdSeat ? { scale: 0.9 } : {}}
                      className={`
                            relative w-8 h-8 md:w-10 md:h-10 rounded-t-lg md:rounded-t-xl text-[10px] md:text-xs font-medium flex items-center justify-center transition-all duration-200 border-b-4 
                            ${selectedSeats.has(seat.label)
                          ? "bg-primary-500 border-primary-700 text-white shadow-lg shadow-primary-500/30"
                          : seat.isAvailable && !seat.holdSeat
                            ? "bg-dark-surface border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-500 hover:text-white"
                            : "bg-red-900/30 border-red-800/50 text-red-600/50 cursor-not-allowed"
                        }
                        `}
                      onClick={() =>
                        handleSeatSelection(
                          seat.label,
                          seat.isAvailable,
                          seat.holdSeat
                        )
                      }
                      disabled={!seat.isAvailable || seat.holdSeat}
                    >
                      {/* Seat Icon Look */}
                      <span className="z-10">{seat.label.replace(/[A-Z]/, '')}</span>
                      <span className="absolute -top-4 text-[8px] text-gray-600 opacity-0 group-hover:opacity-100">{seat.label}</span>
                    </motion.button>
                  </React.Fragment>
                ))}
                <div className="ml-4 w-4 text-gray-600 text-xs font-bold">{String.fromCharCode(65 + rowIndex)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-8 flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-dark-surface border-b-4 border-gray-700 rounded-t-md"></div>
            <span className="text-sm text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary-500 border-b-4 border-primary-700 rounded-t-md"></div>
            <span className="text-sm text-gray-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-900/30 border-b-4 border-red-800/50 rounded-t-md"></div>
            <span className="text-sm text-gray-400">Sold</span>
          </div>
        </div>
      </div>
    );
  };

  const totalSeats = selectedSeats.size;
  const ticketPrice = screenDetails?.theater?.ticketPrice || 0;
  const totalPrice = totalSeats * ticketPrice;

  if (loading || isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching seat data.");
    return <div className="min-h-screen flex items-center justify-center text-white bg-dark-bg">Error fetching seat data.</div>;
  }

  const safeDate = new Date(date);
  const selectedSchedule = screenDetails?.schedule.find(
    (schedule) =>
      new Date(schedule.date).toDateString() === safeDate.toDateString() &&
      schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
  ) || screenDetails?.schedule?.find(
    (schedule) =>
      schedule.showTimes.some((st) => st.time === showTime && st.movieTitle === movieTitle)
  );

  const scheduleId = selectedSchedule?._id;

  const handleSeatUpdate = async () => {
    if (!screenDetails || !showTime) {
      toast.error("Error: Unable to find schedule.");
      return;
    }

    const result = await Swal.fire({
      title: '<span class="text-2xl font-bold text-white mb-2">Confirm Your Selection</span>',
      html: `
        <div class="space-y-4 text-left p-2">
           <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
             <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
               <span class="text-gray-400">Movie</span>
               <span class="text-white font-medium text-right">${movieTitle}</span>
             </div>
             <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
               <span class="text-gray-400">Theater</span>
               <span class="text-white font-medium text-right">${screenDetails?.theater.name}</span>
             </div>
             <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
               <span class="text-gray-400">Showtime</span>
               <span class="text-white font-medium text-right">${showTime} | ${formattedDate}</span>
             </div>
             <div class="flex justify-between items-start mb-2 pb-2 border-b border-gray-700">
               <span class="text-gray-400">Seats</span>
               <span class="text-primary-400 font-bold text-right break-words w-1/2">${[...selectedSeats].join(", ")}</span>
             </div>
              <div class="flex justify-between items-center">
               <span class="text-gray-400">Tickets</span>
               <span class="text-white font-medium text-right">${totalSeats} x Rs. ${ticketPrice}</span>
             </div>
           </div>
           
           <div class="flex justify-between items-center bg-primary-600/10 p-4 rounded-xl border border-primary-500/20">
             <span class="text-gray-300 font-medium">Total Payable</span>
             <span class="text-2xl font-bold text-primary-400">Rs. ${totalPrice}</span>
           </div>
           <p class="text-xs text-gray-500 text-center mt-2">Please confirm to proceed to payment.</p>
        </div>
      `,
      icon: undefined, // Removing default icon to use our own custom styling if needed, or keeping it but styled
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Proceed to Pay',
      cancelButtonText: 'Cancel',
      background: '#111827', // darker background aligned with main theme
      color: '#fff',
      customClass: {
        popup: 'border border-gray-800 rounded-2xl shadow-2xl shadow-black/50',
        confirmButton: 'px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide',
        cancelButton: 'px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide'
      },
      width: '450px'
    });

    if (result.isConfirmed) {
      try {
        await updateSeatAvailability({
          scheduleId: scheduleId,
          selectedSeats: [...selectedSeats],
          holdSeat: true,
          showTime,
        }).unwrap();

        navigate("/booking", {
          state: {
            selectedSeats: [...selectedSeats],
            theaterName: screenDetails?.theater.name,
            date: formattedDate,
            movieTitle: movieTitle,
            totalPrice: totalPrice,
            movieId: movieId,
            theaterId: theaterId,
            screenId: screenId,
            showTime: showTime,
            scheduleId: scheduleId,
          },
        });

        setTimeout(async () => {
          try {
            await updateSeatAvailability({
              scheduleId,
              selectedSeats: [...selectedSeats],
              holdSeat: false,
              showTime,
            }).unwrap();
            console.log("Seat availability reset to true.");
          } catch (error) {
            console.error("Error resetting seat availability:", error);
          }
        }, 60000);
      } catch (error) {
        console.log("error: ", error);
        toast.error("Unable to update seat availability. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">
      {/* Header */}
      <div className="bg-dark-surface border-b border-white/10 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                {movieTitle || "Movie Title"}
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 font-medium">UA</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {screenDetails?.theater.name} | {formattedDate} | {showTime}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg">
              <span className="text-primary-400 font-semibold text-sm">Screen {screenDetails?.screen.screenNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {renderScreenLayout()}
      </div>

      {/* Footer / Payment Bar */}
      {selectedSeats.size > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-white/10 p-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{totalSeats} {totalSeats === 1 ? "ticket" : "tickets"} selected</p>
              <p className="text-2xl font-bold text-white">Rs. {totalPrice}</p>
            </div>
            <button
              onClick={handleSeatUpdate}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 transition-all transform hover:scale-105 active:scale-95"
            >
              Proceed to Pay
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default SelectSeatPage;

