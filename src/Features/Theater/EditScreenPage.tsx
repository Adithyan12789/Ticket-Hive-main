import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  useUpdateScreenMutation,
  useGetScreensByIdQuery,
  useGetMoviesForTheaterMutation,
  useGetTheaterByTheaterIdQuery,
} from "../../Store/TheaterApiSlice";
import TheaterSidebar from "./TheaterSideBar";
import { ShowTimeOption } from "../../Core/TheaterTypes";
import { MovieManagement } from "../../Core/MoviesTypes";
import { FaTrashAlt, FaChair, FaPlus, FaSave, FaArrowLeft, FaVideo, FaTimes } from "react-icons/fa";

const EditScreen: React.FC = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const [screenNumber, setScreenNumber] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);
  const [, setSelectedShowTimes] = useState<string[]>([]);
  const [numRows, setNumRows] = useState<number>(0);
  const [seatsPerRow, setSeatsPerRow] = useState<number>(0);
  const [layout, setLayout] = useState<{ label: string | null; isAvailable?: boolean }[][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedShowTime, setSelectedShowTime] = useState<string>("");
  const [movies, setMovies] = useState<MovieManagement[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(false);
  const [showTimesWithMovies, setShowTimesWithMovies] = useState<
    { showTime: string; movieTitle: string; movieId: string; _id?: string }[]
  >([]);
  const [selectedSeat, setSelectedSeat] = useState<{
    row: number;
    seat: number;
  } | null>(null);

  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: screenData } = useGetScreensByIdQuery(screenId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentScreen: any = screenData;

  const theaterId = currentScreen?.theater?._id || currentScreen?.screen?.theater;

  const { data: theaterData } = useGetTheaterByTheaterIdQuery(theaterId, {
    skip: !theaterId
  });

  const [getMovies] = useGetMoviesForTheaterMutation();
  const [updateScreen, { isLoading }] = useUpdateScreenMutation();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentScreen: any = screenData;

    if (currentScreen && Object.keys(currentScreen).length > 0) {
      setScreenNumber(currentScreen.screen?.screenNumber || 0);
      setCapacity(currentScreen.screen?.capacity || 0);

      const existingLayout = currentScreen.screen?.layout || [];
      setLayout(existingLayout);
      setNumRows(existingLayout.length || 0);
      setSeatsPerRow(existingLayout[0]?.length || 0);

      if (currentScreen.schedule && currentScreen.schedule.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedShowtimes = currentScreen.schedule.flatMap((s: any) => s.showTimes.map((st: any) => ({
          showTime: st.time,
          movieTitle: st.movieTitle,
          movieId: st.movie,
          _id: st._id,
        })));
        setShowTimesWithMovies(mappedShowtimes);
      }
    }
  }, [screenData]);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoadingMovies(true);
      try {
        const response = await getMovies({}).unwrap();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMovies((response as any).movies || []);
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
        movieTitle,
        layout,
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentScreen: any = screenData;

    try {
      await updateScreen({
        screenId,
        formData: {
          screenNumber: Number(screenNumber),
          capacity: Number(capacity),
          layout: layout,
          showTimes: formattedShowTimes,
        },
      }).unwrap();
      toast.success("Screen updated successfully!");
      if (currentScreen?.theater?._id || currentScreen?.screen?.theater) {
        navigate(`/theater/details/${currentScreen.theater?._id || currentScreen.screen?.theater}`);
      } else {
        navigate(`/theater/management`);
      }
    } catch (error) {
      console.error("Failed to update screen: ", error);
      toast.error("Failed to update screen");
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

        setShowTimesWithMovies((prev) => [
          ...prev,
          { ...newShowTime, _id: new Date().toISOString() },
        ]);

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

  const movieOptions = movies.map((movie) => ({
    value: movie._id,
    label: movie.title,
  }));

  // Fetch show times dynamically from the theater data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const theaterShowTimes: string[] = (theaterData as any)?.showTimes || [];

  const allShowTimes = theaterShowTimes.map(time => ({
    value: time,
    label: time
  }));

  // Filter out show times that have already been added
  const showTimeOptions: ShowTimeOption[] = allShowTimes.filter(
    (timeOption) => !showTimesWithMovies.some((st) => st.showTime === timeOption.value)
  );

  const handleRemoveShowTime = (indexToRemove: number) => {
    setShowTimesWithMovies((prev) => {
      const updated = [...prev];
      const removedItem = updated.splice(indexToRemove, 1)[0];

      // Also remove from selectedShowTimes state to make it available again in dropdown
      setSelectedShowTimes((prevSelected) =>
        prevSelected.filter(time => time !== removedItem.showTime)
      );

      return updated;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customSelectStyles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      color: 'white',
      padding: '4px',
      borderRadius: '0.75rem',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    singleValue: (base: any) => ({ ...base, color: 'white' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: (base: any) => ({ ...base, color: 'white' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu: (base: any) => ({ ...base, backgroundColor: '#1f2937', borderRadius: '0.75rem' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              <span className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
                <FaVideo size={24} />
              </span>
              Edit Screen
            </h2>
            <Link
              to={`/theater/details/${currentScreen?.theater?._id || currentScreen?.screen?.theater}`}
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
                <FaChair className="text-blue-500" /> Basic Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Total Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
                  <FaVideo className="text-green-500" /> Showtimes & Movies
                </h3>
                <button
                  type="button"
                  onClick={handleShowModal}
                  className="px-4 py-2 bg-green-600/10 hover:bg-green-600/20 text-green-400 hover:text-green-300 rounded-xl transition-colors border border-green-600/20 font-medium flex items-center gap-2"
                >
                  <FaPlus size={12} /> Add Showtime
                </button>
              </div>

              {showTimesWithMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {showTimesWithMovies.map((item, index) => (
                    <div key={item._id || index} className="bg-[#0b0c10] p-4 rounded-xl border border-white/10 flex flex-col gap-2 relative group hover:border-green-500/30 transition-colors">
                      <button
                        type="button"
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
                <FaChair className="text-yellow-500" /> Seating Layout
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
                      className="flex-1 accent-blue-600 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
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
                      className="flex-1 accent-blue-600 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
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
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                >
                  Regenerate Layout
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
                            {/* 3 Section Split Logic */}
                            {(seatIndex === Math.floor(row.length / 3) || seatIndex === Math.floor((2 * row.length) / 3)) && (
                              <div className="w-10 shrink-0"></div>
                            )}

                            <motion.div
                              // Remove framer-motion props if causes issues in deeply nested loops or optimize
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

                  {selectedSeat &&
                    layout[selectedSeat.row] &&
                    layout[selectedSeat.row][selectedSeat.seat]?.label && (
                      <div
                        className="mt-8 flex flex-wrap gap-4 justify-center"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            deleteSeat(selectedSeat.row, selectedSeat.seat)
                          }
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-105 flex items-center gap-2"
                        >
                          <FaTrashAlt />
                          Delete Seat
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteRow(selectedSeat.row)}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-105 flex items-center gap-2"
                        >
                          <FaTrashAlt />
                          Delete Row
                        </button>
                      </div>
                    )}
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 pb-20">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105 flex items-center gap-3 text-lg"
              >
                {isLoading ? 'Updating...' : (
                  <> <FaSave /> Update Screen </>
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Show Time</label>
                  <Select
                    options={showTimeOptions}
                    value={showTimeOptions.find(time => time.value === selectedShowTime) || null}
                    onChange={(opt) => setSelectedShowTime(opt?.value || "")}
                    placeholder="Select a show time..."
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

export default EditScreen;
