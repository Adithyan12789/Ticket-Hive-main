import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAddScreenMutation,
  useGetTheaterByTheaterIdQuery,
  useGetMoviesForTheaterMutation,
  useGetScreensByTheaterIdQuery,
} from "../../Store/TheaterApiSlice";
import TheaterSidebar from "./TheaterSideBar";
import { ShowTimeOption } from "../../Core/TheaterTypes";
import { MovieManagement } from "../../Core/MoviesTypes";
import { FaTrashAlt, FaChair, FaPlus, FaSave, FaArrowLeft, FaVideo, FaTimes } from "react-icons/fa";

const AddScreenPage: React.FC = () => {
  const { theaterId } = useParams<{ theaterId: string }>();
  const [screenNumber, setScreenNumber] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);
  const [, setSelectedShowTimes] = useState<string[]>([]);
  const [numRows, setNumRows] = useState<number>(0);
  const [seatsPerRow, setSeatsPerRow] = useState<number>(0);
  const [layout, setLayout] = useState<{ label: string | null }[][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedShowTime, setSelectedShowTime] = useState<string>("");
  const [movies, setMovies] = useState<MovieManagement[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(false);
  const [showTimesWithMovies, setShowTimesWithMovies] = useState<
    { showTime: string; movieTitle: string; movieId: string }[]
  >([]);
  const [selectedSeat, setSelectedSeat] = useState<{
    row: number;
    seat: number;
  } | null>(null);

  const navigate = useNavigate();
  const { data: theater } = useGetTheaterByTheaterIdQuery(theaterId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: screens } = useGetScreensByTheaterIdQuery(theaterId);
  const [getMovies] = useGetMoviesForTheaterMutation();
  const [addScreen, { isLoading }] = useAddScreenMutation();

  useEffect(() => {
    if (theater && theater.showTimes) {
      setSelectedShowTimes(theater.showTimes);
    }
  }, [theater]);

  useEffect(() => {
    if (screens) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxScreenNumber = screens.reduce((max: number, screen: any) => Math.max(max, screen.screenNumber || 0), 0);
      setScreenNumber(maxScreenNumber + 1);
    } else {
      setScreenNumber(1);
    }
  }, [screens]);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoadingMovies(true);
      try {
        const response = await getMovies({}).unwrap();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMovies((response as any).movies || []);
        if (((response as any).movies || []).length === 0) {
          handleShowModal();
        }
      } catch (err) {
        console.error("Error fetching movies", err);
      } finally {
        setIsLoadingMovies(false);
      }
    };

    fetchMovies();
  }, [getMovies]);

  const handleLayoutChange = () => {
    if (numRows > 0 && seatsPerRow > 0) {
      const newLayout = Array.from({ length: numRows }, (_, rowIndex) =>
        Array.from({ length: seatsPerRow }, (_, seatIndex) => {
          const rowLabel = String.fromCharCode(65 + rowIndex);
          const seatLabel = `${rowLabel}${String(seatIndex + 1).padStart(2, "0")}`;
          return { label: seatLabel, isAvailable: true };
        })
      );
      setLayout(newLayout);
    } else {
      toast.warn("Please set both rows and seats per row to generate a layout.");
    }
  };

  const deleteRow = (rowIndex: number) => {
    setLayout((prevLayout) => {
      const newLayout = [...prevLayout];
      newLayout.splice(rowIndex, 1);
      return newLayout;
    });
    setSelectedSeat(null);
  };

  const deleteSeat = (rowIndex: number, seatIndex: number) => {
    setLayout((prevLayout) => {
      const newLayout = [...prevLayout];
      newLayout[rowIndex].splice(seatIndex, 1);
      newLayout[rowIndex] = newLayout[rowIndex].map((seat, index) => {
        const rowLabel = String.fromCharCode(65 + rowIndex);
        // Ensure we preserve other properties like isAvailable
        return { ...seat, label: `${rowLabel}${String(index + 1).padStart(2, "0")}` };
      });
      return newLayout;
    });
    setSelectedSeat(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const totalSeats = numRows * seatsPerRow;

    if (totalSeats > capacity) {
      toast.error("Total seat count exceeds the specified capacity!");
      return;
    }

    if (layout.some(row => row.some(seat => !seat.label))) {
      toast.error("Some seats are missing labels. Please regenerate the layout.");
      return;
    }

    const formattedShowTimes = showTimesWithMovies.map(
      ({ showTime, movieId, movieTitle }) => ({
        time: showTime,
        movie: movieId,
        movieTitle: movieTitle,
        layout: layout,
      })
    );

    try {
      await addScreen({
        theaterId,
        formData: {
          screenNumber: Number(screenNumber),
          capacity: Number(capacity),
          layout: layout,
          showTimes: formattedShowTimes,
        },
      }).unwrap();
      toast.success("Screen added successfully!");
      navigate(`/theater/details/${theater?._id}`);
      setScreenNumber(0);
      setCapacity(0);
      setSelectedShowTimes([]);
      setLayout([]);
      setShowTimesWithMovies([]);
    } catch (error) {
      toast.error("Failed to add screen");
      console.error("Failed to add screen:", error);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSaveShowTime = () => {
    if (selectedShowTime && selectedMovie) {
      const selectedMovieObject = movies.find(
        (movie) => movie._id === selectedMovie
      );
      if (selectedMovieObject) {
        const newShowTime = {
          showTime: selectedShowTime,
          movieTitle: selectedMovieObject.title,
          movieId: selectedMovieObject._id,
        };

        setShowTimesWithMovies((prev) => [...prev, newShowTime]);
        setSelectedShowTimes((prev) => [...prev, newShowTime.showTime]);
        setSelectedShowTime("");
        setSelectedMovie("");
        setShowModal(false);
        toast.success("Show time added successfully!");
      }
    } else {
      toast.warn("Please select both a show time and a movie.");
    }
  };

  const movieOptions = movies.map((movie: MovieManagement) => ({
    value: movie._id,
    label: movie.title,
  }));

  const filteredShowTimes =
    theater?.showTimes?.filter(
      (time: string) =>
        !showTimesWithMovies.some(
          (showTimeWithMovie) => showTimeWithMovie.showTime === time
        )
    ) || [];

  const showTimeOptions: ShowTimeOption[] = filteredShowTimes.map(
    (time: string) => ({
      value: time,
      label: time,
    })
  );

  const handleRemoveShowTime = (indexToRemove: number) => {
    setShowTimesWithMovies((prev) => {
      const updated = [...prev];
      const removedItem = updated.splice(indexToRemove, 1)[0];

      // Also remove from selectedShowTimes state to make it available again indropdown
      setSelectedShowTimes((prevSelected) =>
        prevSelected.filter(time => time !== removedItem.showTime)
      );

      return updated;
    });
  };

  // Custom Styles for React Select
  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      color: 'white',
      padding: '4px',
      borderRadius: '0.75rem',
    }),
    singleValue: (base: any) => ({ ...base, color: 'white' }),
    input: (base: any) => ({ ...base, color: 'white' }),
    menu: (base: any) => ({ ...base, backgroundColor: '#1f2937', borderRadius: '0.75rem' }),
    option: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isFocused ? '#374151' : '#1f2937',
      color: 'white',
      cursor: 'pointer'
    })
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-200">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 hidden md:block">
          <TheaterSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg">
                <FaVideo size={24} />
              </span>
              Add New Screen
            </h2>
            <Link
              to={`/theater/details/${theater?._id}`}
              className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Screen Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#15161A] p-8 rounded-3xl border border-white/5 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaChair className="text-red-500" /> Basic Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Total Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setCapacity(value >= 0 ? value : 0);
                    }}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    placeholder="e.g. 150"
                    required
                    min={0}
                  />
                </div>
              </div>
            </motion.div>

            {/* Showtimes Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#15161A] p-8 rounded-3xl border border-white/5 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaVideo className="text-blue-500" /> Showtimes & Movies
                </h3>
                <button
                  type="button"
                  onClick={handleShowModal}
                  className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 rounded-xl transition-colors border border-blue-600/20 font-medium flex items-center gap-2"
                >
                  <FaPlus size={12} /> Add Showtime
                </button>
              </div>

              {showTimesWithMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {showTimesWithMovies.map((item, index) => (
                    <div key={index} className="bg-[#0b0c10] p-4 rounded-xl border border-white/10 flex flex-col gap-2 relative group hover:border-blue-500/30 transition-colors">
                      <button
                        onClick={() => handleRemoveShowTime(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Showtime"
                      >
                        <FaTrashAlt size={12} />
                      </button>
                      <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Showtime</div>
                      <div className="text-xl font-bold text-white">{item.showTime}</div>
                      <div className="text-gray-400 text-sm truncate">{item.movieTitle}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-[#0b0c10] rounded-xl border border-dashed border-white/10">
                  No showtimes added yet. Click the button above to add one.
                </div>
              )}
            </motion.div>

            {/* Layout Generator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#15161A] p-8 rounded-3xl border border-white/5 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaChair className="text-green-500" /> Seating Layout
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Number of Rows ({numRows})</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setNumRows((prev) => (prev > 0 ? prev - 1 : 0))}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                    > - </button>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={numRows}
                      onChange={(e) => setNumRows(Number(e.target.value))}
                      className="flex-1 accent-red-600 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setNumRows((prev) => prev + 1)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                    > + </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Seats Per Row ({seatsPerRow})</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSeatsPerRow((prev) => (prev > 0 ? prev - 1 : 0))}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                    > - </button>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={seatsPerRow}
                      onChange={(e) => setSeatsPerRow(Number(e.target.value))}
                      className="flex-1 accent-red-600 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setSeatsPerRow((prev) => prev + 1)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                    > + </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <button
                  type="button"
                  onClick={handleLayoutChange}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-105"
                >
                  Generate Layout
                </button>
              </div>

              {/* Render Layout */}
              {layout.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-8">
                  <div className="text-center mb-8">
                    <div className="w-2/3 h-2 bg-blue-500/50 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Screen</p>
                  </div>

                  <div className="flex flex-col items-center gap-3 overflow-x-auto pb-4">
                    {layout.map((row, rowIndex) => (
                      <div key={`row-${rowIndex}`} className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center text-xs text-gray-500 font-bold">
                          {String.fromCharCode(65 + rowIndex)}
                        </div>
                        {row.map((seat, seatIndex) => (
                          <React.Fragment key={`seat-${seatIndex}`}>
                            {(seatIndex === Math.floor(row.length / 3) || seatIndex === Math.floor((2 * row.length) / 3)) && (
                              <div className="w-10 shrink-0"></div>
                            )}
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedSeat({ row: rowIndex, seat: seatIndex })}
                              className={`
                                     w-8 h-8 rounded-t-lg rounded-b-md text-[9px] flex items-center justify-center font-bold cursor-pointer transition-all border
                                     ${selectedSeat?.row === rowIndex && selectedSeat?.seat === seatIndex
                                  ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                  : seat.label
                                    ? 'bg-[#2a2d36] text-gray-400 border-white/10 hover:bg-white/10'
                                    : 'bg-transparent border-dashed border-white/5 text-transparent'}
                                   `}
                            >
                              {seat.label ? seat.label.replace(/[A-Z]/, '') : ''}
                            </motion.div>
                          </React.Fragment>
                        ))}
                      </div>
                    ))}
                  </div>

                  {selectedSeat && layout[selectedSeat.row] && layout[selectedSeat.row][selectedSeat.seat]?.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center gap-4 mt-8 bg-[#0b0c10] p-4 rounded-xl border border-white/10 max-w-md mx-auto"
                    >
                      <button
                        type="button"
                        onClick={() => deleteSeat(selectedSeat.row, selectedSeat.seat)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors border border-red-600/20"
                      >
                        <FaTrashAlt /> Delete Seat
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRow(selectedSeat.row)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors border border-red-600/20"
                      >
                        <FaTrashAlt /> Delete Row
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 pb-20">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all hover:scale-105 flex items-center gap-3 text-lg"
              >
                {isLoading ? 'Processing...' : (
                  <> <FaSave /> Save Screen </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Custom Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1a1b20] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Add Showtime</h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Movie</label>
                  <Select
                    options={movieOptions}
                    value={movieOptions.find(m => m.value === selectedMovie) || null}
                    onChange={(opt) => setSelectedMovie(opt?.value || "")}
                    placeholder="Select a movie..."
                    isLoading={isLoadingMovies}
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Time</label>
                  <Select
                    options={showTimeOptions}
                    value={showTimeOptions.find(t => t.value === selectedShowTime) || null}
                    onChange={(opt) => setSelectedShowTime(opt?.value || "")}
                    placeholder="Select time..."
                    styles={customSelectStyles}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveShowTime}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-bold shadow-lg shadow-blue-600/20"
                  >
                    Add Showtime
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddScreenPage;
