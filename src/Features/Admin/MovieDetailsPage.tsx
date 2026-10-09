import { useEffect, useState } from "react";
import { FaFileAlt, FaTheaterMasks, FaRegClock, FaRegCalendarAlt, FaGlobeAmericas, FaUserAlt, FaTag, FaFilm } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useGetMovieByMovieIdQuery } from "../../Store/AdminApiSlice";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import Loader from "../../Features/User/Loader";
import { backendUrl } from "../../url";

const THEATER_IMAGES_DIR_PATH = `${backendUrl}/movieImages/`;

const MovieDetailScreen: React.FC = () => {
  const { id } = useParams();
  const {
    data: movie,
    isLoading: loadingTheater,
    isError: errorTheater,
    refetch,
  } = useGetMovieByMovieIdQuery(id);

  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    document.title = movie ? `${movie.title} - Movie Details` : "Movie Details";
    refetch();
    if (movie?.images?.length > 0) {
      setActiveImage(movie.images[0]);
    }
  }, [id, refetch, movie]);

  if (loadingTheater) return <Loader />;

  if (errorTheater) {
    toast.error("Error fetching movie details");
    console.error("Fetch error:", errorTheater);
    return <div>Error fetching data</div>;
  }

  return (
    <AdminLayout adminName={"Admin Name Here"}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Image */}
            <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
              <img
                src={`${THEATER_IMAGES_DIR_PATH}${activeImage || (movie.images && movie.images[0])}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Grid */}
            {movie.images && movie.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {movie.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(image)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === image ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                  >
                    <img
                      src={`${THEATER_IMAGES_DIR_PATH}${image}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-full">

              <div className="border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  <FaTheaterMasks className="text-blue-600 dark:text-blue-500" />
                  {movie.title}
                </h1>

                <div className="flex flex-wrap gap-2 mt-4">
                  {movie.genres.map((genre: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                      <FaTag className="mr-2 text-xs" /> {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 mt-1">
                      <FaRegClock />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Duration</p>
                      <p className="text-gray-900 dark:text-white font-medium">{movie.duration} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 mt-1">
                      <FaRegCalendarAlt />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Release Date</p>
                      <p className="text-gray-900 dark:text-white font-medium">{new Date(movie.releaseDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 mt-1">
                      <FaFilm />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Director</p>
                      <p className="text-gray-900 dark:text-white font-medium">{movie.director}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 mt-1">
                      <FaGlobeAmericas />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Languages</p>
                      <p className="text-gray-900 dark:text-white font-medium">{movie.languages.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 mt-1">
                      <FaUserAlt />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Cast</p>
                      <p className="text-gray-900 dark:text-white font-medium">{movie.casts.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 mt-1">
                    <FaFileAlt />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mb-1">Description</p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{movie.description}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default MovieDetailScreen;
