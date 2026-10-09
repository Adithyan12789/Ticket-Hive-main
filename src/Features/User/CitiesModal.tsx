import React, { useState, useEffect } from "react";
import { useSaveUserLocationMutation } from "../../Store/UserApiSlice";
import Loader from "./Loader";
import { CitiesModalProps } from "../../Core/CitiesTypes";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaSearch, FaTimes, FaLocationArrow, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CitiesModal: React.FC<CitiesModalProps> = ({
  show,
  handleClose,
  handleCitySelect,
}) => {
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userLocation, setUserLocation] = useState<{
    city: string;
    latitude: number | null;
    longitude: number | null;
  }>({
    city: "Select your city",
    latitude: null,
    longitude: null,
  });

  const [saveUserLocation] = useSaveUserLocationMutation();

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchUserLocation = async () => {
      setLoading(true);
      if (!navigator.geolocation) {
        setUserLocation((prev) => ({
          ...prev,
          city: "Geolocation not supported",
        }));
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const cityName = data.city || "Unknown Location";

            setUserLocation({
              city: cityName,
              latitude,
              longitude,
            });

            await saveUserLocation({
              city: cityName,
              latitude,
              longitude,
            }).unwrap();
          } catch (err) {
            console.log("err: ", err);
            setUserLocation((prev) => ({
              ...prev,
              city: "Failed to fetch location",
            }));
          } finally {
            setLoading(false);
          }
        },
        () => {
          setUserLocation((prev) => ({
            ...prev,
            city: "Location permission denied",
          }));
          setLoading(false);
        }
      );
    };

    fetchUserLocation();
  }, [saveUserLocation]);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://countriesnow.space/api/v0.1/countries/cities`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ country: "India" }),
          }
        );
        const data = await response.json();

        if (data.error) throw new Error(data.msg || "Failed to fetch cities");
        setCities(data.data);
        setFilteredCities(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    if (show) fetchCities();
  }, [show]);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = cities.filter((city) =>
      city.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredCities(filtered);
    setCurrentPage(1);
  }, [searchQuery, cities]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCities = filteredCities.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const fetchCityCoordinates = async (city: string) => {
    try {
      if (!city || city.trim() === "") {
        throw new Error("City name is empty or invalid.");
      }

      console.log("Fetching coordinates for:", city);

      // Using OpenStreetMap Nominatim API (Free, no key required)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
      console.log("API URL:", url);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "TicketHiveApp/1.0" // Nominatim requires a User-Agent
        }
      });
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`API returned error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API response data:", JSON.stringify(data, null, 2));

      if (!data || data.length === 0) {
        throw new Error(`No results found for city: ${city}`);
      }

      const { lat, lon } = data[0];
      if (!lat || !lon) {
        throw new Error("Invalid coordinates received from API.");
      }

      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } catch (error) {
      console.error("Error fetching city coordinates:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  };

  const handleCitySelectInternal = async (city: string) => {
    setLoading(true);

    try {
      const cityCoordinates = await fetchCityCoordinates(city);

      if (cityCoordinates) {
        const { latitude, longitude } = cityCoordinates;

        await saveUserLocation({ city, latitude, longitude }).unwrap();
        handleCitySelect(city);
        handleClose();
      } else {
        toast.error("Failed to fetch coordinates for the selected city. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching coordinates for city:", err);
      toast.error("An error occurred while fetching coordinates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-dark-surface w-full max-w-4xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-dark-surface to-primary-900/10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Select a City</h2>
                <p className="text-gray-400 text-sm flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-primary-500" />
                  Current Location: <span className="text-white ml-1 font-medium">{userLocation.city}</span>
                </p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Search & Detect */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search for a city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => handleCitySelectInternal(userLocation.city)}
                  className="flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors whitespace-nowrap"
                >
                  <FaLocationArrow className="mr-2" /> Detect My Location
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center">
                  {error}
                </div>
              )}

              {/* Cities Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentCities.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleCitySelectInternal(city)}
                    className="py-3 px-4 bg-dark-bg hover:bg-primary-600/20 border border-gray-700 hover:border-primary-500 rounded-lg text-gray-300 hover:text-white transition-all text-center truncate"
                  >
                    {city}
                  </button>
                ))}
              </div>

              {filteredCities.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <p>No cities found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Footer / Pagination */}
            {filteredCities.length > itemsPerPage && (
              <div className="p-4 border-t border-white/10 bg-dark-bg/30 flex justify-center items-center gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-50 disabled:hover:text-gray-400"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-gray-400 text-sm">
                  Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-50 disabled:hover:text-gray-400"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CitiesModal;
