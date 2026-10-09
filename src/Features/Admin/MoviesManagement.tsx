import React, {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import {
  useAddMovieMutation,
  useGetMoviesQuery,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useGetCastQuery,
} from "../../Store/AdminApiSlice";
import { toast } from "react-toastify";
import { FaEdit, FaSearch, FaTrash, FaPlus, FaTimes, FaFilm, FaCalendarAlt, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Loader from "../../Features/User/Loader";
import {
  GenreOption,
  LanguageOption,
  MovieManagement,
  ICast,
} from "../../Core/MoviesTypes";
import Swal from "sweetalert2";
import axios from "axios";
import Select from "react-select";
import { backendUrl } from "../../url";

const MOVIE_IMAGES_DIR_PATH = `${backendUrl}/MoviePosters/`;

const MovieManagementScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setEditShowModal] = useState<boolean>(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>("");
  const [genres, setGenres] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [, setDuration] = useState("");
  const [selectedPoster, setSelectedPoster] = useState<File | null>(null);
  const [selectedBanners, setSelectedBanners] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [description, setDescription] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [casts, setCasts] = useState<string[]>([]);
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [director, setDirector] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [movies, setMovies] = useState<MovieManagement[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // RTK Query
  const [addMovie] = useAddMovieMutation();
  const [editMovie] = useUpdateMovieMutation();
  const [deleteMovie] = useDeleteMovieMutation();


  const { data: moviesResponse, isLoading, refetch: refetchMovies } = useGetMoviesQuery(undefined);
  const { data: allCast } = useGetCastQuery(undefined);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);
  const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([]);

  const directors = allCast?.filter((c: ICast) => c.role === "Director") || [];
  const actors = allCast?.filter((c: ICast) => c.role === "Actor") || [];


  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => {
    setShowModal(false);
    resetFormFields();
  };

  const handleEditModalShow = (movie: MovieManagement) => {
    if (!movie) return;

    setEditingMovieId(movie._id);
    setTitle(movie.title);
    setGenres(movie.genre ? movie.genre.split(",") : []);

    const durationMatch = movie.duration.match(/(\d+)h\s(\d+)m/);
    setHours(durationMatch?.[1] || "");
    setMinutes(durationMatch?.[2] || "");

    setDescription(movie.description);
    setCasts(movie.casts);
    setReleaseDate(movie.releaseDate.toString());
    setLanguages(movie.language ? movie.language.split(",") : []);
    setSelectedPoster(null);
    setDirector(movie.director);

    setEditShowModal(true);
  };

  const handleEditModalClose = () => {
    setEditShowModal(false);
    resetFormFields();
    setEditingMovieId(null);
  };

  const resetFormFields = () => {
    setTitle("");
    setGenres([]);
    setDuration("");
    setDescription("");
    setLanguages([]);
    setCasts([]);
    setDirector("");
    setReleaseDate("");
    setSelectedPoster(null);
    setSelectedImages([]);
    setHours("");
    setMinutes("");
    setSelectedBanners([]);
  };

  const fetchData = useCallback(() => {
    refetchMovies();
  }, [refetchMovies]);

  useEffect(() => {
    if (moviesResponse && moviesResponse.movies) {
      setMovies(moviesResponse.movies);
    }
  }, [moviesResponse]);

  const handlePosterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith("image/")) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedPoster(file);
  };

  const handleBannersChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedBanners(validImages);
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Only images are allowed");
      return;
    }
    setSelectedImages(validImages);
  };

  const handleDelete = async (movieId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await deleteMovie({ id: movieId }).unwrap();
        toast.success("Movie deleted successfully");
        fetchData();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  useEffect(() => {
    const fetchGenresAndLanguages = async () => {
      setLoading(true);
      try {
        const genreResponse = await axios.get(
          "https://api.themoviedb.org/3/genre/movie/list",
          { params: { api_key: "0ffb386a852dbf070ac6b977313d8039", language: "en-US" } }
        );
        const languageResponse = await axios.get(
          "https://api.themoviedb.org/3/configuration/languages",
          { params: { api_key: "0ffb386a852dbf070ac6b977313d8039" } }
        );
        setGenreOptions(genreResponse.data.genres || []);
        setLanguageOptions(languageResponse.data || []);
      } catch (error) {
        console.error("Error fetching genres and languages:", error);
        toast.error("Failed to fetch genres and languages.");
      } finally {
        setLoading(false);
      }
    };
    fetchGenresAndLanguages();
  }, []);

  const getGenreNames = (selectedGenres: string[]) => {
    return selectedGenres.map((id) => {
      const genre = genreOptions.find((g) => g.id.toString() === id || g.name === id);
      // Check if id is already a name or an id.
      // The select component values are names if pre-filled from edit, or ids if selected from dropdown?
      // Let's assume select values store IDs or Names.
      // Actually, in Edit mode, we are setting genre names directly.
      // In Add mode, React-select might return IDs.
      // Let's standardise: always store/send Names if possible or handle both.
      return genre ? genre.name : id;
    });
  };

  const validateTitle = (value: string) => /^[A-Za-z0-9\s:,'"-]+$/.test(value);
  const validateDuration = (value: string) => /^\d+h\s\d+m$/.test(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedDuration = `${hours}h ${minutes}m`;
    const trimmedTitle = title.trim();
    // In edit mode we might have names content, in add mode IDs.
    // The getGenreNames handles IDs. If they are already names, it keeps them.
    const trimmedGenres = getGenreNames(genres.map((genre) => genre.trim()));
    const trimmedDuration = formattedDuration.trim();
    const trimmedDescription = description.trim();
    const trimmedDirector = director.trim();
    const trimmedLanguages = languages.map((language) => language.trim());
    const trimmedCasts = casts.map((cast) => cast.trim());
    const trimmedReleaseDate = releaseDate.trim();

    if (
      !trimmedTitle ||
      trimmedGenres.length === 0 ||
      !trimmedDuration ||
      !selectedImages.length ||
      !selectedPoster ||
      !selectedBanners.length ||
      !trimmedDescription ||
      !trimmedDirector ||
      trimmedLanguages.length === 0 ||
      !trimmedCasts.length ||
      !trimmedReleaseDate
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!validateTitle(trimmedTitle)) {
      toast.error("Invalid characters in title");
      return;
    }

    if (!validateDuration(trimmedDuration)) {
      toast.error("Invalid duration format");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      trimmedGenres.forEach((genre) => formData.append("genre", genre));
      formData.append("duration", trimmedDuration);
      formData.append("description", trimmedDescription);
      formData.append("director", trimmedDirector);
      trimmedLanguages.forEach((language) => formData.append("language", language));
      trimmedCasts.forEach((cast) => formData.append("casts", cast));
      formData.append("releaseDate", trimmedReleaseDate);
      if (selectedPoster) formData.append("poster", selectedPoster);
      selectedImages.forEach((image) => formData.append("movieImages", image));
      selectedBanners.forEach((banner) => formData.append("banners", banner));

      await addMovie(formData).unwrap();
      toast.success("Movie added successfully");
      handleModalClose();
      fetchData();
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedDuration = `${hours}h ${minutes}m`;
    const trimmedTitle = title.trim();
    const trimmedGenres = getGenreNames(genres.map((genre) => genre.trim()));
    const trimmedDuration = formattedDuration.trim();
    const trimmedDescription = description.trim();
    const trimmedDirector = director.trim();
    const trimmedLanguages = languages.map((language) => language.trim());
    const trimmedCasts = casts.map((cast) => cast.trim());
    const trimmedReleaseDate = releaseDate.trim();

    // Relaxed validation for edit (images might not be re-selected)
    if (
      !trimmedTitle ||
      trimmedGenres.length === 0 ||
      !trimmedDuration ||
      !trimmedDescription ||
      !trimmedDirector ||
      trimmedLanguages.length === 0 ||
      !trimmedCasts.length ||
      !trimmedReleaseDate
    ) {
      toast.error("All fields are required (except images if unchanged)");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      trimmedGenres.forEach((genre) => formData.append("genre", genre));
      formData.append("duration", trimmedDuration);
      formData.append("description", trimmedDescription);
      formData.append("director", trimmedDirector);
      trimmedLanguages.forEach((language) => formData.append("language", language));
      trimmedCasts.forEach((cast) => formData.append("casts", cast));
      formData.append("releaseDate", trimmedReleaseDate);

      if (selectedPoster) formData.append("poster", selectedPoster);
      if (selectedBanners.length > 0) {
        selectedBanners.forEach((banner) => formData.append("banners", banner));
      }
      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => formData.append("movieImages", image));
      }

      await editMovie({ id: editingMovieId, formData }).unwrap();
      toast.success("Movie updated successfully");
      handleEditModalClose();
      fetchData();
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);

  if (isLoading || loading) return <Loader />;

  return (
    <AdminLayout adminName="">
      <div className="w-full space-y-8 p-4 md:p-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Movies Library</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your movie collection and details.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleModalShow}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
            >
              <FaPlus /> <span>Add Movie</span>
            </button>
          </div>
        </div>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredMovies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((movie) => (
              <div key={movie._id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">

                {/* Image Area */}
                <div className="aspect-[2/3] w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <Link to={`/admin/movie-details/${movie._id}`} className="block w-full h-full cursor-pointer">
                    <img
                      src={`${MOVIE_IMAGES_DIR_PATH}${movie.posters}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-medium text-sm bg-blue-600 px-4 py-2 rounded-lg shadow-lg">View Details</span>
                    </div>
                  </Link>
                </div>

                <div className="p-3 flex flex-col flex-1 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={movie.title}>{movie.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {movie.genres.slice(0, 2).map((g, i) => (
                        <span key={i} className="text-[8px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-1 py-0.5 rounded-md">{g}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <button
                      onClick={() => handleEditModalShow(movie)}
                      className="py-1 px-1.5 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md text-[9px] font-semibold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-600"
                    >
                      <FaEdit size={10} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(movie._id)}
                      className="py-1 px-1.5 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md text-[9px] font-semibold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-600"
                    >
                      <FaTrash size={10} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-6">
              <FaFilm className="text-4xl text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Movies Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
              {searchQuery ? "No movies match your search." : "Start by adding new movies to your collection."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center ${index + 1 === currentPage
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Unified for Add/Edit */}
      {(showModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl shadow-2xl relative border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-3xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {showModal ? <FaPlus className="text-blue-500" /> : <FaEdit className="text-blue-500" />}
                {showModal ? "Add New Movie" : "Edit Movie"}
              </h2>
              <button
                onClick={showModal ? handleModalClose : handleEditModalClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <form onSubmit={showModal ? handleSubmit : handleEditSubmit} className="space-y-8">

                {/* Section 1: Basic Info */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Movie Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all text-sm"
                        placeholder="e.g. Inception"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Release Date</label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={releaseDate}
                          onChange={(e) => setReleaseDate(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-white transition-all text-sm appearance-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Duration</label>
                      <div className="flex gap-4">
                        <div className="relative w-full">
                          <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-white transition-all text-sm appearance-none"
                          >
                            <option value="">Hours</option>
                            {[...Array(10).keys()].map(h => <option key={h} value={h}>{h} h</option>)}
                          </select>
                        </div>
                        <div className="relative w-full">
                          <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-white transition-all text-sm appearance-none"
                          >
                            <option value="">Minutes</option>
                            {[0, 15, 30, 45].map(m => <option key={m} value={m}>{m} m</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Director</label>
                      <Select
                        options={directors.map((d: ICast) => ({ value: d.name, label: d.name }))}
                        value={director ? { value: director, label: director } : null}
                        onChange={(val) => setDirector(val?.value || "")}
                        placeholder="Select Director..."
                        className="text-sm"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f9fafb',
                            borderColor: state.isFocused ? '#3b82f6' : (document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'),
                            borderRadius: '0.75rem',
                            padding: '0.3rem',
                            boxShadow: 'none',
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                            border: document.documentElement.classList.contains('dark') ? '1px solid #374151' : '1px solid #e5e7eb',
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#3b82f6' : 'transparent',
                            color: state.isFocused ? 'white' : (document.documentElement.classList.contains('dark') ? 'white' : 'black'),
                            cursor: 'pointer',
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                          }),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Details */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">Classification & Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Genres</label>
                      <Select
                        isMulti
                        options={genreOptions.map(o => ({ value: o.id.toString(), label: o.name }))}
                        value={genres.map(g => {
                          const opt = genreOptions.find(o => o.id.toString() === g || o.name === g);
                          return opt ? { value: opt.id.toString(), label: opt.name } : { value: g, label: g };
                        })}
                        onChange={(val) => setGenres(val.map(v => v.label))} // Store names to persist correctly? Or IDs? Storing labels as per previous logic
                        className="text-sm"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f9fafb',
                            borderColor: state.isFocused ? '#3b82f6' : (document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'),
                            borderRadius: '0.75rem',
                            padding: '0.3rem',
                            boxShadow: 'none',
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                            border: document.documentElement.classList.contains('dark') ? '1px solid #374151' : '1px solid #e5e7eb',
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#3b82f6' : 'transparent',
                            color: state.isFocused ? 'white' : (document.documentElement.classList.contains('dark') ? 'white' : 'black'),
                            cursor: 'pointer',
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                          }),
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Languages</label>
                      <Select
                        isMulti
                        options={languageOptions.map(o => ({ value: o.iso_639_1, label: o.english_name }))}
                        value={languages.map(l => {
                          const opt = languageOptions.find(o => o.iso_639_1 === l || o.english_name === l);
                          return opt ? { value: opt.iso_639_1, label: opt.english_name } : { value: l, label: l };
                        })}
                        onChange={(val) => setLanguages(val.map(v => v.value))}
                        className="text-sm"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f9fafb',
                            borderColor: state.isFocused ? '#3b82f6' : (document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'),
                            borderRadius: '0.75rem',
                            padding: '0.3rem',
                            boxShadow: 'none',
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                            border: document.documentElement.classList.contains('dark') ? '1px solid #374151' : '1px solid #e5e7eb',
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#3b82f6' : 'transparent',
                            color: state.isFocused ? 'white' : (document.documentElement.classList.contains('dark') ? 'white' : 'black'),
                            cursor: 'pointer',
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                          }),
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all resize-none text-sm"
                      placeholder="Movie plot summary..."
                    />
                  </div>
                </div>

                {/* Section 3: Cast & Media */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">Cast & Media</h3>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cast Members</label>
                    <Select
                      isMulti
                      options={actors.map((a: ICast) => ({ value: a.name, label: a.name }))}
                      value={casts.map(c => ({ value: c, label: c }))}
                      onChange={(val) => setCasts(val.map(v => v.value))}
                      placeholder="Select Cast Members..."
                      className="text-sm"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f9fafb',
                          borderColor: state.isFocused ? '#3b82f6' : (document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'),
                          borderRadius: '0.75rem',
                          padding: '0.3rem',
                          boxShadow: 'none',
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                          border: document.documentElement.classList.contains('dark') ? '1px solid #374151' : '1px solid #e5e7eb',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? '#3b82f6' : 'transparent',
                          color: state.isFocused ? 'white' : (document.documentElement.classList.contains('dark') ? 'white' : 'black'),
                          cursor: 'pointer',
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                        }),
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Poster Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Main Poster</label>
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-blue-500 transition-all cursor-pointer bg-gray-50 dark:bg-gray-800/20">
                        {selectedPoster ? (
                          <div className="relative group">
                            <img src={URL.createObjectURL(selectedPoster)} alt="Preview" className="h-32 rounded-lg shadow-md" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <span className="text-white text-xs">Change</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <FaFilm className="text-3xl text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Click to upload poster</span>
                          </>
                        )}
                        <input type="file" onChange={handlePosterChange} accept="image/*" className="hidden" />
                      </label>
                    </div>

                    {/* Banner Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Banner Images (Required)</label>
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-blue-500 transition-all cursor-pointer bg-gray-50 dark:bg-gray-800/20">
                        <span className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">{selectedBanners.length} banners selected</span>
                        <span className="text-xs text-blue-500 font-medium">Browse Files</span>
                        <input type="file" multiple onChange={handleBannersChange} accept="image/*" className="hidden" />
                      </label>
                      {selectedBanners.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {selectedBanners.map((img, i) => (
                            <img key={i} src={URL.createObjectURL(img)} className="h-20 w-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-sm" alt="banner" />
                          ))}
                        </div>
                      )}
                    </div>


                  </div>

                  {/* Movie Scenes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Movie Scenes / Backdrops</label>
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-blue-500 transition-all cursor-pointer bg-gray-50 dark:bg-gray-800/20">
                      <span className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">{selectedImages.length} images selected</span>
                      <span className="text-xs text-blue-500 font-medium">Browse Files</span>
                      <input type="file" multiple onChange={handleImagesChange} accept="image/*" className="hidden" />
                    </label>
                    {selectedImages.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {selectedImages.map((img, i) => (
                          <img key={i} src={URL.createObjectURL(img)} className="h-12 w-20 rounded-md object-cover border border-gray-200 dark:border-gray-700" alt="scene" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800 gap-3">
                  <button
                    type="button"
                    onClick={showModal ? handleModalClose : handleEditModalClose}
                    className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 active:scale-95 transform text-sm"
                  >
                    {showModal ? "Submit Movie" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MovieManagementScreen;
