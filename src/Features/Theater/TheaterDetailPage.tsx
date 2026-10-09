import { useEffect, useState } from "react";
import React from 'react';
import { Link, useParams } from "react-router-dom";
import {
  FaChair,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaFileAlt,
  FaCogs,
  FaPlus,
  FaArrowLeft,
  FaVideo
} from "react-icons/fa";
import Select from "react-select";
import { toast } from "react-toastify";
import Loader from "../../Features/User/Loader";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetTheaterByTheaterIdQuery,
  useGetScreensByTheaterIdQuery,
  useGetMoviesForTheaterMutation,
  useDeleteScreenMutation,
} from "../../Store/TheaterApiSlice";
import TheaterLayout from "./TheaterLayout";
import { Screen } from "../../Core/ScreenTypes";
import { MovieManagement } from "../../Core/MoviesTypes";
import { backendUrl } from "../../url";

const THEATER_IMAGES_DIR_PATH = `${backendUrl}/TheatersImages/`;
const DEFAULT_THEATER_IMAGE = "/profileImage_1729749713837.jpg";

const TheaterDetailScreen: React.FC = () => {
  const { id } = useParams();
  const {
    data: theater,
    isLoading: loadingTheater,
    isError: errorTheater,
    refetch,
  } = useGetTheaterByTheaterIdQuery(id);
  const { data: screens, isLoading: loadingScreens, refetch: refetchScreens } =
    useGetScreensByTheaterIdQuery(id);
  const [, setMovies] = useState<MovieManagement[]>([]);
  const [getMovies] = useGetMoviesForTheaterMutation();
  const [deleteScreen] = useDeleteScreenMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Theater Details";
    refetch();
  }, [id, refetch]);

  useEffect(() => {
    if (errorTheater) {
      toast.error("Error fetching theater details");
    }
  }, [errorTheater]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await getMovies({}).unwrap();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMovies((response as any).movies || []);
      } catch (error) {
        console.log("error: ", error);
        toast.error("Error fetching movies");
      }
    };
    fetchMovies();
  }, [getMovies]);

  useEffect(() => {
    if (selectedScreen && selectedScreen.schedule.length > 0) {
      const firstShowtime = selectedScreen.schedule[0].showTimes[0].time;
      setSelectedShowtime(firstShowtime);
    }
  }, [selectedScreen]);

  const handleOpenModal = (screen: Screen) => {
    setSelectedScreen(screen);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedScreen(null);
    setShowModal(false);
  };

  const handleDelete = async (screenId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: '#1f2937',
      color: '#fff'
    });
    if (result.isConfirmed) {
      try {
        await deleteScreen(screenId).unwrap();
        refetch();
        refetchScreens();
        toast.success("Screen deleted successfully");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleOpenGoogleMaps = () => {
    if (theater && theater.latitude && theater.longitude) {
      const googleMapsUrl = `https://www.google.com/maps?q=${theater.latitude},${theater.longitude}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      toast.error("Location details are not available.");
    }
  };

  if (loadingTheater || loadingScreens) return <Loader />;
  if (errorTheater) {
    return <div className="text-white text-center mt-20">Error fetching data</div>;
  }

  // Helper for Carousel (Simple implementation)
  const TheaterHero = ({ images }: { images: string[] }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
      if (!images || images.length === 0) return;
      const timer = setInterval(() => {
        setCurrent(prev => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }, [images]);

    const bgImage = (images && images.length > 0)
      ? `${THEATER_IMAGES_DIR_PATH}${images[current]}`
      : DEFAULT_THEATER_IMAGE;

    return (
      <div className="relative w-full h-[500px] overflow-hidden rounded-3xl shadow-2xl mb-12 group">
        {/* Background Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-md scale-110 opacity-50"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/40 to-transparent" />

        {/* Main Image Slider */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <motion.img
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            src={bgImage}
            alt="Theater"
            className="w-full h-full object-cover rounded-2xl shadow-2xl max-w-5xl mx-auto border border-white/10"
          />
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
                  {theater.name}
                </h1>
                {theater.isVerified ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1">
                    <FaCheckCircle size={12} /> Verified
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1">
                    <FaTimesCircle size={12} /> Unverified
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-lg flex items-center gap-2 drop-shadow-md">
                <FaMapMarkerAlt className="text-red-500" /> {theater.city}
                <span className="text-gray-500 mx-2">|</span>
                <span className="text-sm opacity-80">{theater.addressLine1}, {theater.city}, {theater.state} - {theater.pincode}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleOpenGoogleMaps}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white font-medium transition-all border border-white/10 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <FaMapMarkerAlt /> Location
              </button>
              <Link to={`/theater/add-screen/${theater._id}`}>
                <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
                  <FaPlus /> Add Screen
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <TheaterLayout theaterOwnerName={""}>
      <div className="min-h-screen bg-[#0b0c10] text-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* Breadcrumb / Back */}
          <div className="mb-6">
            <Link to="/theater/management" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <FaArrowLeft /> Back to Dashboard
            </Link>
          </div>

          <TheaterHero images={theater.images || []} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">

            {/* Left Column: Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* About Card */}
              <div className="bg-[#15161A] p-6 rounded-2xl border border-white/5 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaFileAlt className="text-blue-500" /> About
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {theater.description}
                </p>
              </div>

              {/* Amenities Card */}
              <div className="bg-[#15161A] p-6 rounded-2xl border border-white/5 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCogs className="text-yellow-500" /> Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {theater.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-sm text-gray-300">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Screens */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaVideo className="text-red-500" /> Screens
                <span className="text-base font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  {screens?.length || 0} Total
                </span>
              </h2>

              {screens && screens.length > 0 ? (
                <div className="grid grid-cols-1 gap-5">
                  {screens.map((screen: Screen, index: number) => (
                    <motion.div
                      key={screen._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-[#15161A] rounded-2xl p-6 border border-white/5 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-red-500/5"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                        <Link to={`/theater/edit-screen/${screen._id}`}>
                          <button className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors border border-blue-500/20" title="Edit Screen">
                            <FaEdit />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(screen._id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20" title="Delete Screen">
                          <FaTrash />
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 relative z-0">
                        {/* Large Screen Number */}
                        <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:border-red-500/30 transition-colors">
                          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Screen</span>
                          <span className="text-4xl font-bold text-white">{screen.screenNumber}</span>
                        </div>

                        <div className="flex-grow pt-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">Main Auditorium</h4>
                              <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                <FaChair size={12} /> {screen.capacity} Seats
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Today's Schedule</span>
                            <div className="flex flex-wrap gap-2">
                              {screen.schedule?.length > 0 ? (
                                screen.schedule.flatMap(schedule =>
                                  schedule.showTimes.slice(0, 4).map(show => ( // Limit to 4 for preview
                                    <span
                                      key={`${schedule.date}-${show.time}`}
                                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm text-gray-300 transition-colors cursor-default"
                                    >
                                      {show.time} <span className="text-gray-600 text-xs ml-1">({show.movieTitle.substring(0, 10)}...)</span>
                                    </span>
                                  ))
                                )
                              ) : (
                                <span className="text-gray-600 text-sm italic">No shows scheduled</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center">
                          <button
                            onClick={() => handleOpenModal(screen)}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                          >
                            <FaChair /> View Layout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#15161A] border border-dashed border-white/10 rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                    <FaVideo size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No screens added yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">This theater doesn't have any screens. Add your first screen to start scheduling movies.</p>
                  <Link to={`/theater/add-screen/${theater._id}`}>
                    <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all">
                      Create First Screen
                    </button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Layout Modal */}
        <AnimatePresence>
          {showModal && selectedScreen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1b20] w-full max-w-7xl max-h-[95vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#15161A]">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Screen {selectedScreen.screenNumber} Layout</h3>
                    <p className="text-gray-400 text-sm">Capacity: {selectedScreen.capacity} Seats</p>
                  </div>
                  <button onClick={handleCloseModal} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <FaTimes />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-[#0b0c10]">
                  <div className="flex flex-col items-center">
                    {selectedScreen.schedule && selectedScreen.schedule.length > 0 ? (
                      <>
                        <div className="mb-10 w-full max-w-md sticky top-0 z-10">
                          <Select
                            value={selectedShowtime ? { label: selectedShowtime, value: selectedShowtime } : null}
                            options={selectedScreen.schedule.flatMap(item =>
                              item.showTimes.map(st => ({ label: `${st.time} - ${st.movieTitle}`, value: st.time }))
                            )}
                            onChange={(opt) => setSelectedShowtime(opt?.value || null)}
                            placeholder="Select a Showtime to View Layout"
                            className="text-sm font-medium"
                            styles={{
                              control: (base) => ({
                                ...base,
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: 'white',
                                padding: '4px',
                                borderRadius: '12px',
                                boxShadow: 'none'
                              }),
                              singleValue: (base) => ({ ...base, color: 'white' }),
                              input: (base) => ({ ...base, color: 'white' }),
                              menu: (base) => ({ ...base, backgroundColor: '#1f2937', borderRadius: '12px', overflow: 'hidden', border: '1px solid #374151' }),
                              option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                                color: 'white',
                                cursor: 'pointer'
                              })
                            }}
                          />
                        </div>

                        {selectedShowtime && selectedScreen.schedule.map((scheduleItem, sIdx) =>
                          scheduleItem.showTimes.map((showTime) => {
                            if (showTime.time === selectedShowtime) {
                              return (
                                <div key={`s-${sIdx}`} className="w-full">

                                  {/* Screen Visual */}
                                  <div className="mb-16 w-full flex flex-col items-center">
                                    <div className="w-3/4 h-16 bg-gradient-to-b from-white/10 to-transparent perspective rounded-t-[100%] border-t border-white/20 shadow-[0_-10px_40px_rgba(255,255,255,0.05)] transform -rotate-x-12 relative overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent opacity-50" />
                                    </div>
                                    <p className="mt-4 text-gray-500 text-xs tracking-[0.3em] uppercase font-bold">Screen</p>
                                  </div>

                                  {/* Seats Grid */}
                                  <div className="flex flex-col items-center gap-4 overflow-x-auto pb-8">
                                    {showTime.layout.map((row, rIdx) => (
                                      <div key={`r-${rIdx}`} className="flex items-center gap-3">
                                        {/* Row Label */}
                                        <div className="w-6 h-6 flex items-center justify-center text-xs text-gray-500 font-bold">
                                          {String.fromCharCode(65 + rIdx)}
                                        </div>
                                        {row.map((seat, seatIdx) => (
                                          <React.Fragment key={`seat-${seatIdx}`}>
                                            {(seatIdx === Math.floor(row.length / 3) || seatIdx === Math.floor((2 * row.length) / 3)) && (
                                              <div className="w-10 shrink-0"></div>
                                            )}
                                            <div
                                              className={`
                                                  w-8 h-8 rounded-t-lg rounded-b-md text-[9px] flex items-center justify-center font-bold transition-all duration-300 border
                                                  ${seat.isAvailable
                                                  ? 'bg-[#2a2d36] text-gray-400 border-white/10 hover:bg-white/10'
                                                  : 'bg-red-900/20 text-red-700 cursor-not-allowed border-red-900/30'}
                                                `}
                                              title={`Seat ${seat.label} - ${seat.isAvailable ? 'Available' : 'Booked'}`}
                                            >
                                              {seat.label.replace(/[A-Z]/, '')}
                                            </div>
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Legend */}
                                  <div className="flex justify-center gap-8 mt-8 pt-8 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded bg-[#2a2d36] border border-white/10"></div>
                                      <span className="text-sm text-gray-400">Available</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded bg-red-900/20 border border-red-900/30"></div>
                                      <span className="text-sm text-gray-400">Booked</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded bg-green-600"></div>
                                      <span className="text-sm text-gray-400">Selected</span>
                                    </div>
                                  </div>

                                </div>
                              )
                            }
                            return null;
                          })
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <FaVideo size={48} className="mb-4 opacity-20" />
                        <p>No schedule or layout available for this screen.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-[#15161A] flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </TheaterLayout>
  );
};

export default TheaterDetailScreen;
