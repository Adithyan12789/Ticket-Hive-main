import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaEdit, FaTrash, FaCheck, FaPlus, FaTimes, FaMapMarkerAlt, FaImage, FaInfoCircle, FaClock, FaMap, FaList } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useAddTheaterMutation,
  useGetTheatersMutation,
  useUpdateTheaterMutation,
  useDeleteTheaterMutation,
  useUploadTheaterCertificateMutation,
} from "../../Store/TheaterApiSlice";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import TheaterOwnerLayout from "./TheaterLayout";
import Loader from "../../Features/User/Loader";
import { TheaterManagement } from "../../Core/TheaterTypes";
import { backendUrl } from "../../url";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet icon fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const THEATER_IMAGES_DIR_PATH = `${backendUrl}/TheatersImages/`;
const DEFAULT_THEATER_IMAGE = "/profileImage_1729749713837.jpg";

const AddTheaterScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedTheater, setSelectedTheater] =
    useState<TheaterManagement | null>(null);
  const [name, setName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [addressLine1, setAddressLine1] = useState<string>("");
  const [addressLine2, setAddressLine2] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showTimes, setShowTimes] = useState([
    { hour: "01", minute: "00", ampm: "AM" },
  ]);
  const [description, setDescription] = useState<string>("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState<string>("");

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleAmenityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAmenity();
    }
  };
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [theaters, setTheaters] = useState<TheaterManagement[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addTheater] = useAddTheaterMutation();
  const [updateTheater] = useUpdateTheaterMutation();
  const [deleteTheater] = useDeleteTheaterMutation();
  const [uploadTheaterCertificate] = useUploadTheaterCertificateMutation();
  const [getTheaters, { isLoading }] = useGetTheatersMutation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(3);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [certificateModal, setCertificateModal] = useState(false);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [ticketPrice, setTicketPrice] = useState<string>("");

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => {
    setShowModal(false);
    resetFormFields();
  };

  const resetFormFields = () => {
    setName("");
    setCity("");
    setAddressLine1("");
    setAddressLine2("");
    setPincode("");
    setState("");
    setCountry("");
    setDescription("");
    setAmenities([""]);
    setLatitude(0);
    setLongitude(0);
    setSelectedImages([]);
    setShowTimes([{ hour: "01", minute: "00", ampm: "AM" }]);
  };

  const handleEditModalShow = (theater: TheaterManagement) => {
    setSelectedTheater(theater);
    setName(theater.name);
    setCity(theater.city);
    setAddressLine1(theater.addressLine1 || "");
    setAddressLine2(theater.addressLine2 || "");
    setPincode(theater.pincode || "");
    setState(theater.state || "");
    setCountry(theater.country || "");
    setDescription(theater.description);
    setAmenities(theater.amenities);
    setLatitude(theater.latitude);
    setLongitude(theater.longitude);
    setTicketPrice(String(theater.ticketPrice));
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    resetFormFields();
  };

  const handleVerifyModalShow = (theater: TheaterManagement) => {
    setSelectedTheater(theater);
    setCertificateModal(true);
  };

  const handleCertificateModalClose = () => setCertificateModal(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCounter]);

  const fetchData = async () => {
    try {
      const response = await getTheaters({}).unwrap();
      setTheaters(response);
    } catch (err) {
      console.error("Error fetching theaters", err);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertificate(e.target.files[0]);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedImages(validImages);
  };



  const handleDelete = async (theaterId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteTheater({ id: theaterId }).unwrap();
        toast.success("Theater deleted successfully");
        setRefreshCounter((prev) => prev + 1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleShowTimeChange = (
    index: number,
    field: "hour" | "minute" | "ampm",
    value: string
  ) => {
    setShowTimes((prevShowTimes) =>
      prevShowTimes.map((showTime, i) =>
        i === index ? { ...showTime, [field]: value } : showTime
      )
    );
  };

  const addShowTime = () => {
    setShowTimes([...showTimes, { hour: "01", minute: "00", ampm: "AM" }]);
  };

  const validateName = (value: string) => /^[A-Za-z0-9\s'-]+$/.test(value);

  const validateCity = (value: string) => /^[A-Za-z\s'-]+$/.test(value);

  const validateCoordinates = (lat: number, lng: number) => {
    const latRegex = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/;
    const lngRegex = /^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/;

    return latRegex.test(lat.toFixed(6)) && lngRegex.test(lng.toFixed(6));
  };


  const validateTicketPrice = (value: string) =>
    /^[0-9]+(\.[0-9]{1,2})?$/.test(value);

  const fetchCoordinates = async () => {
    if (!addressLine1 || !city || !state || !country) {
      toast.error("Please fill in Address Line 1, City, State, and Country first.");
      return;
    }

    const combinations = [
      `${addressLine1}, ${city}, ${state}, ${pincode}, ${country}`,
      `${addressLine1}, ${city}, ${state}, ${country}`,
      `${city}, ${state}, ${pincode}, ${country}`,
      `${city}, ${state}, ${country}`
    ];

    try {
      setLoading(true);
      let found = false;

      for (const query of combinations) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          {
            headers: {
              'Accept-Language': 'en'
            }
          }
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setLatitude(parseFloat(data[0].lat));
          setLongitude(parseFloat(data[0].lon));
          toast.success(`Location found using: ${query}`);
          found = true;
          break;
        }
      }

      if (!found) {
        toast.error("Could not find location. Please check the address details or try a nearby landmark.");
      }
    } catch (error) {
      toast.error("Error fetching coordinates");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedShowTimes = showTimes.map(
      ({ hour, minute, ampm }) => `${hour}:${minute} ${ampm}`
    );

    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedAddressLine1 = addressLine1.trim();
    const trimmedAddressLine2 = addressLine2.trim();
    const trimmedPincode = pincode.trim();
    const trimmedState = state.trim();
    const trimmedCountry = country.trim();
    const trimmedDescription = description.trim();
    const trimmedAmenities = amenities.map((item) => item.trim()).filter(a => a).join(", ");
    const trimmedLatitude = latitude;
    const trimmedLongitude = longitude;
    const trimmedPrice = String(ticketPrice).trim();

    if (
      !trimmedName ||
      !trimmedCity ||
      !trimmedAddressLine1 ||
      !trimmedPincode ||
      !trimmedState ||
      !trimmedCountry ||
      !selectedImages.length ||
      !trimmedDescription ||
      !trimmedAmenities ||
      isNaN(trimmedLatitude) ||
      isNaN(trimmedLongitude) ||
      showTimes.some(
        (time) => !time.hour.trim() || !time.minute.trim() || !time.ampm.trim()
      )
    ) {
      toast.error("All fields (except Address Line 2) are required. Please check if you found the location on map.");
      return;
    }

    if (!validateName(trimmedName)) {
      toast.error("Invalid characters in name");
      return;
    }

    if (!validateCity(trimmedCity)) {
      toast.error("Invalid characters in city");
      return;
    }

    if (!validateCoordinates(trimmedLatitude, trimmedLongitude)) {
      toast.error("Invalid latitude or longitude. Please click 'Find on Map'");
      return;
    }

    if (!validateTicketPrice(trimmedPrice)) {
      toast.error("Please enter a valid ticket price");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("city", trimmedCity);
      formData.append("addressLine1", trimmedAddressLine1);
      formData.append("addressLine2", trimmedAddressLine2);
      formData.append("pincode", trimmedPincode);
      formData.append("state", trimmedState);
      formData.append("country", trimmedCountry);
      formData.append("ticketPrice", trimmedPrice);
      formData.append("description", trimmedDescription);
      formData.append("amenities", trimmedAmenities);
      formData.append("latitude", trimmedLatitude.toString());
      formData.append("longitude", trimmedLongitude.toString());

      selectedImages.forEach((image) => formData.append("images", image));

      formattedShowTimes.forEach((time) => {
        formData.append("showTimes[]", time);
      });

      await addTheater(formData).unwrap();
      toast.success("Theater added successfully");
      handleModalClose();
      fetchData();
    } catch (err: any) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const long = typeof longitude === "string" ? parseFloat(longitude) : longitude;
    const trimmedPrice = String(ticketPrice).trim();

    if (!validateTicketPrice(trimmedPrice)) {
      toast.error("Please enter a valid ticket price");
      return;
    }

    if (!validateCoordinates(lat, long)) {
      toast.error("Invalid latitude or longitude. Please click 'Find on Map'");
      return;
    }

    try {
      setLoading(true);
      const data = {
        name: name.trim(),
        city: city.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        pincode: pincode.trim(),
        state: state.trim(),
        country: country.trim(),
        description: description.trim(),
        ticketPrice: trimmedPrice,
        amenities: amenities,
        latitude: lat,
        longitude: long,
        showTimes: showTimes.map(
          (time) => `${time.hour}:${time.minute} ${time.ampm}`
        ),
      };

      if (selectedImages.length) {
        // For updates with images, you might need FormData depending on how your API is set up.
        // Assuming updateTheater takes the object directly if no files, but let's check.
        // If files are present, the current updateTheater call might need adjustment.
        // Looking at the controller, it handles files.

        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (key === 'amenities' || key === 'showTimes') {
            (data as any)[key].forEach((item: string) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, (data as any)[key]);
          }
        });
        selectedImages.forEach((image) => formData.append("images", image));

        await updateTheater({ id: selectedTheater?._id, data: formData }).unwrap();
      } else {
        await updateTheater({ id: selectedTheater?._id, data }).unwrap();
      }

      toast.success("Theater updated successfully");
      handleEditModalClose();
      fetchData();
    } catch (err: any) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateUpload = async () => {
    if (!certificate || !selectedTheater?._id) {
      toast.error("Please select a certificate file and a theater");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("certificate", certificate);

      await uploadTheaterCertificate({
        theaterId: selectedTheater._id,
        formData,
      }).unwrap();

      toast.success("Certificate uploaded successfully");
      handleCertificateModalClose();
      setRefreshCounter((prev) => prev + 1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Failed to upload certificate", err);
    }
  };

  const indexOfLastTheater = currentPage * itemsPerPage;
  const indexOfFirstTheater = indexOfLastTheater - itemsPerPage;
  const currentTheaters = theaters.slice(
    indexOfFirstTheater,
    indexOfLastTheater
  );
  const totalPages = Math.ceil(theaters.length / itemsPerPage);

  if (isLoading || loading) return <Loader />;

  const removeShowTime = (index: number) => {
    setShowTimes(showTimes.filter((_, i) => i !== index));
  };

  return (
    <TheaterOwnerLayout theaterOwnerName="John Doe">
      <div className="min-h-screen bg-dark-bg text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
              My Theaters
            </h1>
            <div className="flex w-full md:w-auto gap-4">
              <div className="relative flex-grow md:flex-grow-0 md:w-80">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search theaters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white placeholder-gray-500 transition-all"
                />
              </div>
              <button
                onClick={handleModalShow}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-1 active:translate-y-0"
              >
                <FaPlus size={14} />
                <span>Add Theater</span>
              </button>
            </div>
          </div>

          {/* Theaters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {currentTheaters.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-dark-surface rounded-2xl border border-white/5 border-dashed">
                <p className="text-gray-400 text-lg">No theaters found. Add your first theater!</p>
              </div>
            ) : (
              currentTheaters.map((theater) => (
                <div
                  key={theater._id}
                  className="bg-dark-surface rounded-2xl overflow-hidden border border-white/5 shadow-xl hover:shadow-2xl hover:border-red-500/30 transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        theater.images.length > 0
                          ? `${THEATER_IMAGES_DIR_PATH}${theater.images[0]}`
                          : DEFAULT_THEATER_IMAGE
                      }
                      alt={theater.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent opacity-80" />

                    {/* Floating Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => handleEditModalShow(theater)}
                        className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-blue-500 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(theater._id)}
                        className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>

                    {/* Verification Badge */}
                    <div className="absolute top-4 left-4">
                      {theater.isVerified ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1">
                          <FaCheck size={10} /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyModalShow(theater)}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-bold backdrop-blur-md hover:bg-yellow-500/30 transition-colors"
                        >
                          Verify Now
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">{theater.name}</h3>
                      <span className="text-red-500 font-bold text-sm">₹{theater.ticketPrice}</span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 flex items-start gap-2">
                      <FaMapMarkerAlt className="mt-1 text-gray-500 flex-shrink-0" />
                      <span className="line-clamp-1">{theater.city}</span>
                    </p>

                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-6 flex-grow">
                      {theater.description}
                    </p>

                    <div className="border-t border-white/5 pt-4 mt-auto">
                      <Link
                        to={`/theater/details/${theater?._id}`}
                        className="w-full block text-center py-2.5 bg-white/5 hover:bg-red-600 rounded-xl text-gray-300 hover:text-white font-medium transition-all text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 pb-10">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${i + 1 === currentPage
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "bg-dark-surface text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showModal || showEditModal) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-dark-surface w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-bg/50 rounded-t-3xl">
                  <h2 className="text-2xl font-bold text-white">
                    {showEditModal ? "Edit Theater" : "Add New Theater"}
                  </h2>
                  <button
                    onClick={showEditModal ? handleEditModalClose : handleModalClose}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-600 hover:text-white flex items-center justify-center text-gray-400 transition-all"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
                  <form onSubmit={showEditModal ? handleEditSubmit : handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-8">
                        {/* General Info Section */}
                        <div className="space-y-5">
                          <h3 className="text-white font-bold flex items-center gap-2 text-lg border-b border-white/10 pb-2">
                            <FaInfoCircle className="text-red-500" /> General Information
                          </h3>
                          <div>
                            <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Theater Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. Cineplex Downtown"
                              className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">City</label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. New York"
                                className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Base Ticket Price (₹)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                <input
                                  type="number"
                                  value={ticketPrice}
                                  onChange={(e) => setTicketPrice(e.target.value)}
                                  placeholder="150"
                                  className="w-full pl-8 pr-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Description</label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Brief description about the theater, history, or special features..."
                              rows={3}
                              className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all resize-none placeholder-gray-600"
                            />
                          </div>
                        </div>

                        {/* Media & Amenities Section */}
                        <div className="space-y-5">
                          <h3 className="text-white font-bold flex items-center gap-2 text-lg border-b border-white/10 pb-2">
                            <FaList className="text-red-500" /> Features & Media
                          </h3>

                          <div>
                            <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Amenities</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={amenityInput}
                                onChange={(e) => setAmenityInput(e.target.value)}
                                onKeyDown={handleAmenityKeyDown}
                                placeholder="e.g. Dolby Atmos"
                                className="flex-grow px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                              />
                              <button
                                type="button"
                                onClick={handleAddAmenity}
                                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/25"
                              >
                                <FaPlus />
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {amenities.map((amenity, index) => (
                                <span key={index} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm flex items-center gap-2 border border-white/5">
                                  {amenity}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAmenity(index)}
                                    className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500/20 text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                                  >
                                    <FaTimes size={10} />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                              <FaInfoCircle size={10} /> Type and press Enter or click + to add amenities
                            </p>
                          </div>

                          <div>
                            <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Theater Images</label>
                            <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-red-500 transition-colors bg-dark-bg/50 group">
                              <FaImage className="mx-auto text-3xl text-gray-600 mb-3 group-hover:text-red-400 transition-colors" />
                              <p className="text-gray-300 text-sm mb-1 font-medium group-hover:text-white">Click to upload images</p>
                              <p className="text-gray-600 text-xs mb-4">Supported formats: JPG, PNG, WEBP</p>
                              <input
                                type="file"
                                multiple
                                onChange={handleImageChange}
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                              />
                            </div>
                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                              {selectedImages.map((image, index) => (
                                <div key={index} className="flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border border-gray-700 relative group/img">
                                  <img src={URL.createObjectURL(image)} alt="preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <FaCheck className="text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-8">
                        {/* Location Section */}
                        <div className="space-y-5">
                          <h3 className="text-white font-bold flex items-center gap-2 text-lg border-b border-white/10 pb-2">
                            <FaMap className="text-red-500" /> Location Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Address Line 1</label>
                              <input
                                type="text"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                placeholder="Street address, P.O. box"
                                className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Address Line 2 (Optional)</label>
                              <input
                                type="text"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                placeholder="Apartment, suite, unit, etc."
                                className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">City</label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. Los Angeles"
                                className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">State</label>
                                <input
                                  type="text"
                                  value={state}
                                  onChange={(e) => setState(e.target.value)}
                                  placeholder="e.g. California"
                                  className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Country</label>
                                <input
                                  type="text"
                                  value={country}
                                  onChange={(e) => setCountry(e.target.value)}
                                  placeholder="e.g. USA"
                                  className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-semibold mb-2 ml-1">Pincode</label>
                              <input
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                placeholder="e.g. 10001"
                                className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white transition-all placeholder-gray-600"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={fetchCoordinates}
                              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 mt-2"
                            >
                              <FaMapMarkerAlt /> {loading ? "Finding..." : "Find location on Map"}
                            </button>

                            {(latitude !== 0 || longitude !== 0) && (
                              <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-700 mt-4 relative z-0">
                                <MapContainer
                                  center={[latitude, longitude]}
                                  zoom={13}
                                  scrollWheelZoom={false}
                                  style={{ height: "100%", width: "100%" }}
                                >
                                  <ChangeView center={[latitude, longitude]} />
                                  <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  />
                                  <Marker position={[latitude, longitude]} />
                                </MapContainer>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Schedule Section */}
                        <div className="space-y-5">
                          <h3 className="text-white font-bold flex items-center gap-2 text-lg border-b border-white/10 pb-2">
                            <FaClock className="text-red-500" /> Show Schedule
                          </h3>
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <label className="block text-gray-400 text-sm font-semibold ml-1">Daily Show Times</label>
                              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{showTimes.length} Shows Added</span>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-dark-bg/30 p-2 rounded-xl border border-white/5">
                              {showTimes.map((showTime, index) => (
                                <div key={index} className="flex items-center gap-2 bg-dark-surface p-3 rounded-xl border border-white/10 group hover:border-red-500/30 transition-colors">
                                  <div className="flex-grow flex items-center justify-center gap-2 bg-black/20 rounded-lg py-1 px-3">
                                    <select
                                      value={showTime.hour}
                                      onChange={(e) => handleShowTimeChange(index, "hour", e.target.value)}
                                      className="bg-transparent text-white outline-none border-none text-lg font-mono font-bold w-10 text-center cursor-pointer appearance-none hover:text-red-400 transition-colors"
                                    >
                                      {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={String(i + 1).padStart(2, "0")} className="bg-dark-bg text-sm">{String(i + 1).padStart(2, "0")}</option>
                                      ))}
                                    </select>
                                    <span className="text-gray-500 font-bold">:</span>
                                    <select
                                      value={showTime.minute}
                                      onChange={(e) => handleShowTimeChange(index, "minute", e.target.value)}
                                      className="bg-transparent text-white outline-none border-none text-lg font-mono font-bold w-10 text-center cursor-pointer appearance-none hover:text-red-400 transition-colors"
                                    >
                                      {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={String(i).padStart(2, "0")} className="bg-dark-bg text-sm">{String(i).padStart(2, "0")}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={showTime.ampm}
                                      onChange={(e) => handleShowTimeChange(index, "ampm", e.target.value)}
                                      className="bg-transparent text-red-500 outline-none border-none text-sm font-bold w-12 text-center cursor-pointer appearance-none uppercase tracking-wide"
                                    >
                                      <option value="AM" className="bg-dark-bg text-white">AM</option>
                                      <option value="PM" className="bg-dark-bg text-white">PM</option>
                                    </select>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeShowTime(index)}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                    title="Remove Show Time"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={addShowTime}
                              className="w-full mt-3 py-3 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                            >
                              <FaPlus size={12} /> Add New Time Slot
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={showEditModal ? handleEditModalClose : handleModalClose}
                        className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {showEditModal ? <FaEdit /> : <FaCheck />}
                            {showEditModal ? "Update Details" : "Create Theater"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Certificate Verification Modal */}
        <AnimatePresence>
          {certificateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-dark-surface w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheck className="text-yellow-500 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Verify Theater</h3>
                  <p className="text-gray-400 text-sm">Upload your business certificate to get verified status.</p>
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-yellow-500 transition-colors bg-dark-bg">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertificateChange}
                      className="hidden"
                      id="cert-upload"
                    />
                    <label htmlFor="cert-upload" className="cursor-pointer block">
                      {certificate ? (
                        <div className="text-green-400 font-medium flex flex-col items-center">
                          <FaCheck className="mb-2" />
                          {certificate.name}
                        </div>
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <span className="font-semibold text-white mb-1">Click to Upload</span>
                          <span className="text-xs">PDF, JPG, PNG supported</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {certificate && (
                    <div className="flex justify-center">
                      <img
                        src={URL.createObjectURL(certificate)}
                        alt="preview"
                        className="h-32 object-contain rounded-lg border border-white/10"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleCertificateModalClose}
                    className="flex-1 py-3 bg-dark-bg hover:bg-white/5 rounded-xl font-bold text-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCertificateUpload}
                    disabled={!certificate}
                    className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold shadow-lg shadow-yellow-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </TheaterOwnerLayout>
  );
};

export default AddTheaterScreen;
