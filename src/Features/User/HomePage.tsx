import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaStar, FaTicketAlt, FaPlayCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useGetMoviesQuery } from "../../Store/UserApiSlice";
import { MovieManagement } from "../../Core/MoviesTypes";
import { backendUrl } from "../../url";

const HomePage: React.FC = () => {
  const { data } = useGetMoviesQuery(undefined);
  const trendingMovies = data?.movies || [];
  const [searchQuery] = useState<string>("");

  const BANNERS_BASE_URL = `${backendUrl}/MovieBanners/`;
  const MOVIE_IMAGES_DIR_PATH = `${backendUrl}/MoviePosters/`;

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const heroMovies = trendingMovies.slice(0, 5);

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % heroMovies.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  const filteredMovies = trendingMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTrending = [...filteredMovies].sort((a, b) => {
    const dateA = new Date(a.createdAt || "").getTime();
    const dateB = new Date(b.createdAt || "").getTime();
    return dateB - dateA;
  });

  const sortedRecommended = [...filteredMovies].sort((a, b) => {
    return (b.averageRating || 0) - (a.averageRating || 0);
  });

  // if (loading || loadingTrending) {
  //   return <Loader />;
  // }



  return (
    <div className="bg-dark-bg min-h-screen text-white pb-20">

      {/* Hero Section */}
      {/* Hero Carousel Section */}
      {trendingMovies.length > 0 && (
        <div className="relative h-[80vh] w-full overflow-hidden group">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
          >
            {trendingMovies.slice(0, 5).map((movie) => (
              <div key={movie._id} className="min-w-full h-full relative">
                <div className="absolute inset-0">
                  <img
                    src={movie.banners && movie.banners.length > 0 ? BANNERS_BASE_URL + movie.banners[0] : "/default-banner.jpg"}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/40 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
                  <div className="max-w-2xl space-y-6 pt-20">
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold border border-primary-500/30"
                    >
                      Now Trending
                    </motion.span>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-5xl md:text-7xl font-display font-bold leading-tight"
                    >
                      {movie.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-300 text-lg md:text-xl line-clamp-3"
                    >
                      {movie.description || "Experience the magic of cinema. Book your tickets now for an unforgettable journey."}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center space-x-4 pt-4"
                    >
                      <Link
                        to={`/movie-detail/${movie._id}`}
                        className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold flex items-center space-x-2 transition-transform transform hover:-translate-y-1 shadow-lg shadow-primary-600/25"
                      >
                        <FaTicketAlt />
                        <span>Get Tickets</span>
                      </Link>
                      <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold flex items-center space-x-2 transition-all">
                        <FaPlayCircle />
                        <span>Watch Trailer</span>
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <FaChevronLeft size={24} />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <FaChevronRight size={24} />
          </button>

          {/* Dots Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {trendingMovies.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBannerIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === currentBannerIndex ? "bg-primary-500 w-8" : "bg-white/50 hover:bg-white/80"
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-20">

        {/* Trending Section */}
        <section className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-2">Trending Now</h2>
              <div className="h-1 w-20 bg-primary-500 rounded-full"></div>
            </div>
            <Link to="/allMovies" className="text-primary-400 hover:text-primary-300 font-medium flex items-center group">
              View All <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {sortedTrending.slice(0, 4).map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} posterPath={MOVIE_IMAGES_DIR_PATH} delay={index * 0.1} />
            ))}
          </div>
          {sortedTrending.length === 0 && <p className="text-gray-500 text-center py-10">No movies found.</p>}
        </section>

        {/* Banner / Promotion */}
        <section className="mb-20 rounded-3xl overflow-hidden relative h-64 md:h-80">
          <img src="/imgb.webp" alt="Promotion" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg to-transparent flex items-center px-10 md:px-20">
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Summer Blockbuster Festival</h3>
              <p className="text-gray-300 mb-6">Get 20% off on all weekend tickets. Limited time offer!</p>
              <button className="px-6 py-3 bg-white text-dark-bg font-bold rounded-lg hover:bg-gray-100 transition-colors">Learn More</button>
            </div>
          </div>
        </section>

        {/* Recommended Section */}
        <section className="mb-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-2">Recommended For You</h2>
              <div className="h-1 w-20 bg-secondary-500 rounded-full"></div>
            </div>
            <Link to="/allMovies" className="text-secondary-400 hover:text-secondary-300 font-medium flex items-center group">
              View All <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {sortedRecommended.slice(0, 4).map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} posterPath={MOVIE_IMAGES_DIR_PATH} delay={index * 0.1} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Reusable Movie Card Component
const MovieCard = ({ movie, posterPath, delay }: { movie: MovieManagement; posterPath: string; delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Link to={`/movie-detail/${movie._id}`} className="group block h-full">
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 bg-dark-surface">
          <img
            src={movie.posters ? posterPath + movie.posters : "/default-poster.jpg"}
            alt={movie.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="px-6 py-2 bg-primary-600 text-white rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Book Now</span>
          </div>
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-white text-xs font-bold">{movie.averageRating?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg truncate group-hover:text-primary-400 transition-colors">{movie.title}</h3>
          <p className="text-gray-500 text-sm truncate">{movie.genres?.join(", ") || "Drama"}</p>
        </div>
      </Link>
    </motion.div>
  )
}

export default HomePage;
