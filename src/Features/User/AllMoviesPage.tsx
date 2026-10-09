import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetMoviesQuery } from "../../Store/UserApiSlice";
import { MovieManagement } from "../../Core/MoviesTypes";
import { backendUrl } from "../../url";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { MdLocalMovies } from "react-icons/md";

const MOVIE_IMAGES_DIR_PATH = `${backendUrl}/MoviePosters/`;

const AllMoviesPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data } = useGetMoviesQuery(undefined);
  const movies = data?.movies || [];

  const languages = [
    ...new Set(movies.flatMap((movie: MovieManagement) => movie.languages || [])),
  ];

  const genres = [
    ...new Set(movies.flatMap((movie: MovieManagement) => movie.genres || [])),
  ];

  const filteredMovies = movies.filter((movie) => {
    const matchesLanguage = !selectedLanguage || movie.languages.includes(selectedLanguage);
    const matchesGenre = !selectedGenre || movie.genres.includes(selectedGenre);
    const matchesSearch = !searchTerm || movie.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLanguage && matchesGenre && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedLanguage("");
    setSelectedGenre("");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedLanguage || selectedGenre || searchTerm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-slate-900 to-dark-bg">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 animate-pulse-slow"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MdLocalMovies className="text-5xl text-primary-400" />
              <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent">
                All Movies
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover your next favorite movie from our extensive collection
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="backdrop-blur-xl bg-dark-surface/50 rounded-2xl p-6 border border-dark-border shadow-2xl animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-primary-400 text-xl" />
            <h2 className="text-xl font-semibold text-gray-200">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 border border-red-500/30"
              >
                <FiX className="text-lg" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-400 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300"
              />
            </div>

            {/* Language Filter */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Genre Filter */}
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm border border-primary-500/30">
                  Search: {searchTerm}
                </span>
              )}
              {selectedLanguage && (
                <span className="px-3 py-1 bg-secondary-500/20 text-secondary-300 rounded-full text-sm border border-secondary-500/30">
                  Language: {selectedLanguage}
                </span>
              )}
              {selectedGenre && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm border border-primary-500/30">
                  Genre: {selectedGenre}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredMovies.length > 0 ? (
          <>
            <div className="mb-6 text-gray-400">
              Showing <span className="text-primary-400 font-semibold">{filteredMovies.length}</span> {filteredMovies.length === 1 ? 'movie' : 'movies'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMovies.map((movie, index) => (
                <Link
                  key={movie._id}
                  to={`/movie-detail/${movie._id}`}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative h-full backdrop-blur-sm bg-dark-surface/30 rounded-2xl overflow-hidden border border-dark-border hover:border-primary-500/50 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary-500/20 transform hover:-translate-y-2">
                    {/* Movie Poster */}
                    <div className="relative h-[400px] overflow-hidden">
                      <img
                        src={
                          movie.posters
                            ? `${MOVIE_IMAGES_DIR_PATH}${movie.posters}`
                            : "/default-poster.jpg"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                      {/* Hover Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="w-16 h-16 rounded-full bg-primary-500/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-lg shadow-primary-500/50">
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Movie Info */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-xl font-bold text-gray-100 line-clamp-1 group-hover:text-primary-400 transition-colors duration-300">
                        {movie.title}
                      </h3>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-2">
                        {movie.genres && movie.genres.length > 0 ? (
                          movie.genres.slice(0, 3).map((genre, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-300 rounded-full border border-primary-500/30"
                            >
                              {genre}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No genres available</span>
                        )}
                      </div>

                      {/* Languages */}
                      {movie.languages && movie.languages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          <span>{movie.languages.join(", ")}</span>
                        </div>
                      )}

                      {/* View Details Button */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2 text-primary-400 font-medium group-hover:gap-3 transition-all duration-300">
                          <span>View Details</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="backdrop-blur-xl bg-dark-surface/30 rounded-2xl p-12 border border-dark-border max-w-md mx-auto">
              <MdLocalMovies className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-300 mb-2">No Movies Found</h3>
              <p className="text-gray-500 mb-6">
                No movies match your current filters. Try adjusting your search criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-500/30"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMoviesPage;
