import React, { Key, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaSearch, FaInfoCircle, FaChevronLeft, FaChevronRight, FaTimes, FaMapMarkerAlt, FaVideo } from "react-icons/fa";
import {
  useGetMovieByMovieIdQuery,
  useGetTheatersByMovieTitleQuery,
} from "../../Store/UserApiSlice";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";
import TheaterLocation from "./TheaterLocation";
import { UserInfo } from "../../Core/UserTypes";
import { Screen } from "../../Core/ScreenTypes";
import { TheaterManagement } from "../../Core/TheaterTypes";

import { motion, AnimatePresence } from "framer-motion";

type TheaterData = {
  theaters: TheaterManagement[];
  screens: Screen[];
  user: UserInfo;
};

interface TheaterWithDistance extends TheaterManagement {
  distance?: number | null;
}

const MovieTheaterScreen: React.FC = () => {
  const { movieTitle } = useParams<{ movieTitle: string }>();
  const [searchParams] = useSearchParams();
  const [startIndex, setStartIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<TheaterWithDistance | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const { moviePoster } = location.state || {};

  const dates = [...Array(365)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    dates[0] || null
  );

  const formattedDate = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : null;

  const userId = userInfo?.id;

  const {
    data,
    isLoading: loadingTheaters,
    isError: errorTheaters,
  } = useGetTheatersByMovieTitleQuery({
    movieTitle,
    date: formattedDate,
    userId,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const { data: movie } = useGetMovieByMovieIdQuery(movieTitle || "");
  const theaters = (data as TheaterData)?.theaters || [];
  const screens = (data as TheaterData)?.screens || [];
  const user = (data as TheaterData)?.user || [];
  const selectedLanguage = searchParams.get("language") || "English";

  const userLocation = {
    latitude: user?.latitude,
    longitude: user?.longitude,
    city: user?.city,
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    document.title = movieTitle ? `Movie - Theaters` : "Movie Details";
  }, [movieTitle, formattedDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const movieName = movie?.title?.trim().toLowerCase();
  const genres = movie?.genres || [];
  const datesToShow = 4;

  const handleForward = () => {
    if (startIndex + datesToShow < dates.length) {
      setStartIndex(startIndex + datesToShow);
    }
  };

  const handleBackward = () => {
    if (startIndex - datesToShow >= 0) {
      setStartIndex(startIndex - datesToShow);
    }
  };

  const handleShowModal = (theater: TheaterWithDistance) => {
    setSelectedTheater(theater);
    setModalVisible(true);
  };

  const sortedTheaters: TheaterWithDistance[] = theaters.map((theater) => {
    const distance: number | null =
      userLocation.latitude &&
        userLocation.longitude &&
        theater.latitude &&
        theater.longitude
        ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          theater.latitude,
          theater.longitude
        )
        : null;
    return { ...theater, distance };
  });

  const theatersInSameCityEnhanced = sortedTheaters.filter(
    (theater) =>
      theater.city &&
      user.city &&
      theater.city.toLowerCase() === user.city.toLowerCase()
  );

  const theatersOutsideCity = sortedTheaters.filter(
    (theater) =>
      !(
        theater.city &&
        userLocation.city &&
        theater.city.toLowerCase() === userLocation.city.toLowerCase()
      )
  );

  const nearbyTheatersOutsideCity = theatersOutsideCity
    .filter((theater) => theater.distance !== null && theater.distance !== undefined && theater.distance <= 10)
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  const otherTheatersOutsideCity = theatersOutsideCity
    .filter((theater) => theater.distance === null || theater.distance === undefined || theater.distance > 10)
    .sort((a, b) => a.name.localeCompare(b.name));

  const allTheaters = [
    ...theatersInSameCityEnhanced,
    ...nearbyTheatersOutsideCity,
    ...otherTheatersOutsideCity,
  ];

  const filteredAndSortedTheaters = allTheaters
    .filter((theater) => {
      // Filter by city
      if (selectedCity) {
        return (
          theater.city &&
          theater.city.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }
      return true;
    })
    .filter((theater) => {
      // Filter by show time
      if (selectedTime) {
        return screens.some(
          (screen) =>
            screen.theater._id === theater._id &&
            screen.schedule.some((schedule) =>
              schedule.showTimes.some((show) => show.time === selectedTime)
            )
        );
      }
      return true;
    })
    .filter((theater) => {
      // Search by theater name
      return theater.name.toLowerCase().includes(searchInput.toLowerCase());
    })
    .sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
    // Remove duplicates
    .filter((theater, index, self) =>
      index === self.findIndex((t) => (
        t._id === theater._id
      ))
    );

  useEffect(() => {
    if (errorTheaters) {
      toast.error("Error fetching theaters");
    }
  }, [errorTheaters]);

  if (loading || loadingTheaters) return <Loader />;

  if (errorTheaters) {
    return <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">Error fetching theaters</div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header Space */}
      <div className="p-8 border-b border-white/5 bg-dark-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 leading-tight">
                {movie?.title} <span className="text-gray-400 text-2xl font-normal">({selectedLanguage})</span>
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-primary-600/30 border border-primary-500/30 text-primary-300 text-xs font-semibold tracking-wider">UA</span>
                {genres.map((genre: string, index: number) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-dark-surface border border-gray-700 text-gray-300 text-xs font-medium">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white placeholder-gray-500"
                placeholder="Search theaters..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Date Selector */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FaCalendarAlt className="mr-2 text-primary-500" /> Select Date
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleBackward}
                disabled={startIndex === 0}
                className="p-2 rounded-lg bg-dark-surface border border-gray-700 text-gray-400 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:border-gray-700 transition-all"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={handleForward}
                disabled={startIndex + datesToShow >= dates.length}
                className="p-2 rounded-lg bg-dark-surface border border-gray-700 text-gray-400 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:border-gray-700 transition-all"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dates.slice(startIndex, startIndex + datesToShow).map((date, index) => {
              const isActive = selectedDate?.toISOString().split("T")[0] === date.toISOString().split("T")[0];
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-300 ${isActive
                    ? 'bg-primary-600 border-primary-500 shadow-lg shadow-primary-600/20 transform scale-105'
                    : 'bg-dark-surface border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white'
                    }`}
                >
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-primary-500'}`}>
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className={`text-2xl font-bold mt-1 ${isActive ? 'text-white' : 'text-white'}`}>
                    {date.getDate()}
                  </span>
                  <span className="text-xs mt-1 opacity-70">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-gray-500" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white appearance-none cursor-pointer"
              value={selectedCity || ""}
              onChange={(e) => setSelectedCity(e.target.value || null)}
            >
              <option value="">All Cities</option>
              {[...new Set(allTheaters.map((theater) => theater.city))]
                .filter((city) => city)
                .map((city, idx) => (
                  <option key={idx} value={city} className="bg-dark-bg">{city}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500 text-xs" />
            </div>
          </div>

          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaVideo className="text-gray-500" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white appearance-none cursor-pointer"
              value={selectedTime || ""}
              onChange={(e) => setSelectedTime(e.target.value || null)}
            >
              <option value="">All Show Times</option>
              {screens
                .flatMap((screen) => screen.schedule.flatMap((schedule) => schedule.showTimes))
                .map((show) => show.time)
                .filter((time, idx, self) => self.indexOf(time) === idx)
                .map((time, idx) => (
                  <option key={idx} value={time} className="bg-dark-bg">{time}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500 text-xs" />
            </div>
          </div>
        </div>

        {/* Theaters List */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-white">Available Theaters</h2>
          </div>

          {filteredAndSortedTheaters.length > 0 ? (
            filteredAndSortedTheaters.map((theater, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-900/10"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Theater Info Column */}
                  <div className="p-6 md:p-8 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-700/50 bg-gray-900/50">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{theater.name}</h3>
                        <button onClick={() => handleShowModal(theater)} className="text-gray-500 hover:text-blue-400 transition-colors p-1">
                          <FaInfoCircle size={18} />
                        </button>
                      </div>

                      <p className="text-gray-400 text-sm flex items-start leading-relaxed">
                        <FaMapMarkerAlt className="mr-2 mt-1 text-gray-500 shrink-0 group-hover:text-blue-500 transition-colors" />
                        {theater.addressLine1}, {theater.city}, {theater.state} - {theater.pincode}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-auto">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
                        <FaVideo className="text-xs text-blue-500" />
                        <span className="text-xs font-medium text-gray-300">M-Ticket</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
                        <span className="text-xs font-medium text-orange-400">F&B</span>
                      </div>
                      {theater.distance !== null && theater.distance !== undefined && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                          <span className="text-xs font-medium text-green-400">{theater.distance.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Showtimes Column */}
                  <div className="p-6 md:p-8 md:w-2/3 bg-gray-800/20">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Showtimes</span>
                      <div className="h-px flex-1 bg-gray-700/50"></div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {screens
                        .filter((screen: Screen) => screen.theater._id === theater._id)
                        .map((screen: Screen, idx: Key | null | undefined) => (
                          <React.Fragment key={idx}>
                            {screen.schedule
                              .flatMap((schedule) => schedule.showTimes)
                              .filter((show) => show.movieTitle.trim().toLowerCase() === movieName)
                              .map((filteredShow, timeIdx) => {
                                return (
                                  <button
                                    key={timeIdx}
                                    className="group/btn relative px-5 py-2.5 rounded-xl border border-gray-600 bg-gray-800/50 hover:bg-white hover:border-white transition-all duration-300 flex flex-col items-center min-w-[100px]"
                                    onClick={() =>
                                      navigate(`/seat-select/${screen._id}`, {
                                        state: {
                                          date: selectedDate,
                                          movieTitle: movie?.title,
                                          movieId: movie?._id,
                                          theaterId: theater?._id,
                                          showTime: filteredShow.time,
                                          moviePoster: moviePoster,
                                          showTimeId: filteredShow._id,
                                        },
                                      })
                                    }
                                  >
                                    <span className="text-sm font-bold text-white group-hover/btn:text-black tracking-wide">{filteredShow.time}</span>
                                    <span className="text-[10px] text-green-400 group-hover/btn:text-green-600 font-medium">4K Dolby</span>
                                  </button>
                                )
                              })}
                          </React.Fragment>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-700">
                <FaVideo className="text-4xl text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Theaters Found</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">We couldn't find any theaters matching your criteria. Try adjusting your filters or selecting a different date.</p>
              <button
                onClick={() => { setSearchInput(''); setSelectedCity(null); setSelectedTime(null); }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalVisible(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-dark-bg p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-white">{selectedTheater?.name}</h2>
                <button onClick={() => setModalVisible(false)} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedTheater?.description || "No description available."}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTheater?.amenities.length ? (
                        selectedTheater.amenities.map((amenity, idx) => (
                          <span key={idx} className="px-3 py-1 rounded bg-white/5 border border-white/10 text-sm text-gray-300">
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No amenities listed.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</h3>
                    <p className="text-gray-300 mb-4 flex items-start">
                      <FaMapMarkerAlt className="mr-2 mt-1 text-primary-500 shrink-0" />
                      {selectedTheater?.addressLine1}, {selectedTheater?.city}, {selectedTheater?.state} - {selectedTheater?.pincode}
                    </p>
                    {selectedTheater && (
                      <div className="h-64 rounded-xl overflow-hidden border border-gray-700">
                        <TheaterLocation
                          location={{
                            latitude: selectedTheater.latitude,
                            longitude: selectedTheater.longitude,
                            theaterName: selectedTheater.name,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-dark-bg border-t border-white/10 flex justify-end shrink-0">
                <button
                  onClick={() => setModalVisible(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
};

// Helper Icon Component
const FaCalendarAlt = ({ className }: { className?: string }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M400 64h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V160h352v298c0 3.3-2.7 6-6 6z"></path></svg>
);
const FaChevronDown = ({ className }: { className?: string }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
);


export default MovieTheaterScreen;
