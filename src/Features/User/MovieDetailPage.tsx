import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetMovieByMovieIdQuery,
  useGetReviewsQuery,
  useAddReviewMutation,
  useGetMoviesQuery,
  useVoteReviewMutation,
} from "../../Store/UserApiSlice";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";
import {
  FaRegStar,
  FaStar,
  FaThumbsDown,
  FaThumbsUp,
  FaUser,
  FaPlay,
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

import { backendUrl } from "../../url";
import { motion, AnimatePresence } from "framer-motion";
import { MovieManagement } from "../../Core/MoviesTypes";

const USER_MOVIE_POSTER = `${backendUrl}/MoviePosters/`;
const USER_MOVIE_BANNERS = `${backendUrl}/MovieBanners/`;
const USER_MOVIE_CAST_IMAGES = `${backendUrl}/CastsImages/`;

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  comment: string;
  rating: number;
  date: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

const MovieDetailScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewsState, setReviewsState] = useState<Review[]>([]);

  const { userInfo } = useSelector((state: RootState) => state.auth);

  const {
    data: movie,
    isLoading: loadingMovie,
    isError: errorMovie,
    refetch,
  } = useGetMovieByMovieIdQuery(id);

  const {
    data: reviews,
    refetch: refetchReviews,
  } = useGetReviewsQuery(id);

  const [addReview, { isLoading: addingReview }] = useAddReviewMutation();
  const [voteReview] = useVoteReviewMutation();

  const { data: moviesData } = useGetMoviesQuery(undefined);

  const allOtherMovies = moviesData?.movies?.filter((m: MovieManagement) => m._id !== id) || [];
  let recommendedMovies = allOtherMovies.filter((m: MovieManagement) =>
    m.genres?.some((g: string) => movie?.genres?.includes(g))
  );

  if (recommendedMovies.length < 4) {
    const remainingMovies = allOtherMovies.filter((m: MovieManagement) => !recommendedMovies.includes(m));
    recommendedMovies = [...recommendedMovies, ...remainingMovies];
  }

  recommendedMovies = recommendedMovies.slice(0, 4);

  useEffect(() => {
    if (reviews) {
      setReviewsState(reviews);
    }
  }, [reviews]);

  useEffect(() => {
    document.title = movie ? `${movie.title} - TicketHive` : "Movie Details";
    refetch();
  }, [id, refetch, movie]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleBookNow = () => {
    if (!movie || !movie.languages.length) {
      toast.error("No languages available for this movie.");
      return;
    }
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    navigate(`/movie-theaters/${id}?language=${language}`, {
      state: {
        moviePoster: movie?.posters,
      },
    });
  };

  const userId = userInfo?.id;
  const hasReviewed = reviews?.some(
    (review: Review) => review.user && review.user._id === userId
  );

  const handleAddReview = async () => {
    if (!reviewText || rating === 0) {
      toast.error("Please provide both a review and a rating.");
      return;
    }

    try {
      await addReview({
        movieId: id,
        review: reviewText,
        rating,
        userId,
      }).unwrap();

      toast.success("Review added successfully!");
      setReviewText("");
      setRating(0);
      refetchReviews();
      setShowReviewModal(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Error adding review.");
    }
  };

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / reviews.length
    : 0;


  const handleVote = async (reviewId: string, type: 'like' | 'dislike') => {
    if (!userInfo) {
      toast.error("Please login to vote.");
      return;
    }

    try {
      const response = await voteReview({ reviewId, userId: userInfo.id, action: type }).unwrap();

      setReviewsState((prev) =>
        prev.map((r) => {
          if (r._id === reviewId) {
            // Merge the updated fields
            return {
              ...r,
              likes: response.review.likes,
              dislikes: response.review.dislikes,
              likedBy: response.review.likedBy,
              dislikedBy: response.review.dislikedBy
            };
          }
          return r;
        })
      );
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error?.data?.message || "Failed to register vote.");
    }
  };

  if (loading || loadingMovie) return <Loader />;
  if (errorMovie || !movie) return <div className="text-white text-center py-20">Movie not found.</div>;

  const bannerImage = movie.banners && movie.banners.length > 0
    ? USER_MOVIE_BANNERS + movie.banners[0]
    : movie.images && movie.images.length > 0
      ? USER_MOVIE_BANNERS + movie.images[0]
      : "https://placehold.co/1920x800/1a1a1a/ffffff?text=No+Banner+Available";

  return (
    <div className="bg-dark-bg min-h-screen text-white font-sans antialiased overflow-x-hidden selection:bg-primary-500 selection:text-white">

      {/* Hero Section */}
      <div className="relative w-full h-[70vh] md:h-[85vh]">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <img
            src={bannerImage}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/1920x800/1a1a1a/ffffff?text=No+Banner+Available" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/60 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pt-20 px-4 md:px-8">
          <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">

            {/* Poster (Mobile: Hidden or Small, Desktop: Visible) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden md:block md:col-span-3 lg:col-span-3"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary-900/40 border-[3px] border-white/10 group bg-dark-surface">
                <img
                  src={`${USER_MOVIE_POSTER}${movie.posters}`}
                  alt={movie.title}
                  className="w-full h-auto transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a1a/ffffff?text=No+Poster" }}
                />
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="col-span-1 md:col-span-9 lg:col-span-8 md:pl-8 text-center md:text-left"
            >
              {/* Mobile Poster (Visible only on small screens) */}
              <div className="md:hidden w-48 mx-auto mb-8 rounded-xl overflow-hidden shadow-2xl border border-white/20">
                <img
                  src={`${USER_MOVIE_POSTER}${movie.posters}`}
                  alt={movie.title}
                  className="w-full h-auto"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a1a/ffffff?text=No+Poster" }}
                />
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {movie.genres.map((g: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-primary-300 border border-white/5">
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-2xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-gray-300 mb-8 text-sm md:text-base font-medium">
                <div className="flex items-center gap-2">
                  <FaClock className="text-primary-500" />
                  <span>{movie.duration}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-primary-500" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {averageRating > 0 && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    <div className="flex items-center gap-1.5 text-yellow-400">
                      <FaStar />
                      <span className="text-white font-bold">{averageRating.toFixed(1)}/5</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={handleBookNow}
                  className="group relative px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 overflow-hidden transition-all hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shine" />
                  <div className="flex items-center justify-center gap-3">
                    <FaTicketAlt />
                    <span>Book Tickets</span>
                  </div>
                </button>

                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                  <FaPlay />
                  <span>Watch Trailer</span>
                </button>
              </div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-20">

        {/* Storyline */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-secondary-500 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Storyline</h2>
          </div>
          <p className="text-gray-300 leading-relaxed text-lg max-w-4xl">
            {movie.description}
          </p>
        </section>

        {/* Cast */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-primary-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Cast & Crew</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {movie.casts.map((actor: string, index: number) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary-500 transition-colors shadow-lg mb-4 bg-dark-surface relative flex items-center justify-center bg-gray-800">
                  {movie.castsImages && movie.castsImages[index] ? (
                    <img
                      src={`${USER_MOVIE_CAST_IMAGES}${movie.castsImages[index]}`}
                      alt={actor}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(actor)}&background=random&color=fff` }}
                    />
                  ) : (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(actor)}&background=random&color=fff`}
                      alt={actor}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>
                <h3 className="text-white font-medium text-center text-sm md:text-base group-hover:text-primary-300 transition-colors">{actor}</h3>
                <p className="text-gray-500 text-xs mt-1">Actor</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-dark-surface/30 rounded-3xl p-6 md:p-10 border border-white/5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Audience Reviews</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>{reviewsState.length} reviews</span>
                <span>•</span>
                <FaStar className="text-yellow-400" />
                <span>{averageRating.toFixed(1)}/5 Average</span>
              </div>
            </div>

            {!hasReviewed && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-2.5 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-secondary-600/20"
              >
                Write a Review
              </button>
            )}
          </div>

          {reviewsState.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviewsState.slice(0, 6).map((review) => (
                <div key={review._id} className="bg-dark-bg p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white border border-white/10">
                        <FaUser className="text-sm" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{review.user?.name || "Anonymous"}</h4>
                        <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-md">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-yellow-400 font-bold text-xs">{review.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-4">"{review.comment}"</p>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleVote(review._id, 'like')}
                      className={`flex items-center gap-2 text-xs font-medium transition-colors ${review.likedBy?.includes(userId) ? 'text-primary-400' : 'text-gray-500 hover:text-white'}`}
                    >
                      <FaThumbsUp />
                      <span>{review.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => handleVote(review._id, 'dislike')}
                      className={`flex items-center gap-2 text-xs font-medium transition-colors ${review.dislikedBy?.includes(userId) ? 'text-red-400' : 'text-gray-500 hover:text-white'}`}
                    >
                      <FaThumbsDown />
                      <span>{review.dislikes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </section>

        {/* Recommended Section */}
        {recommendedMovies.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-secondary-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Recommended Movies</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {recommendedMovies.map((recMovie: MovieManagement) => (
                <MovieCard key={recMovie._id} movie={recMovie} posterPath={USER_MOVIE_POSTER} />
              ))}
            </div>
          </section>
        )}

      </div>



      {/* Modals */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900/90 w-full max-w-sm rounded-3xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Select Language</h3>
                    <p className="text-gray-400 text-sm">Choose your preferred language</p>
                  </div>
                  <button
                    onClick={() => setShowLanguageModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {movie.languages.map((lang: string) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang)}
                      className="group relative flex items-center justify-between p-4 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all duration-300"
                    >
                      <span className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors text-lg">{lang}</span>
                      <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500 transition-all">
                        <FaPlay className="text-[10px] text-transparent group-hover:text-white ml-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-dark-surface w-full max-w-lg rounded-2xl p-8 border border-white/10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Write a Review</h3>
              <p className="text-gray-400 mb-6 text-sm">Share your experience with others</p>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition-all hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400/50'}`}
                    >
                      {star <= rating ? <FaStar size={24} /> : <FaRegStar size={24} />}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-right text-sm text-primary-400 font-bold">{rating}/5</div>
              </div>

              <div className="mb-8">
                <label className="block text-gray-300 text-sm font-medium mb-3">Your Review</label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike?"
                  className="w-full bg-dark-bg border border-gray-700 rounded-xl p-4 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 text-gray-400 font-bold hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReview}
                  disabled={addingReview}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/30 transition-all hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Movie Card (Local Component)
const MovieCard = ({ movie, posterPath }: { movie: MovieManagement; posterPath: string }) => {
  return (
    <Link to={`/movie-detail/${movie._id}`} className="group block h-full">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 bg-dark-surface border border-white/5">
        <img
          src={movie.posters ? posterPath + movie.posters : "/default-poster.jpg"}
          alt={movie.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="px-6 py-2 bg-primary-600 text-white rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Details
          </span>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
          <FaStar className="text-yellow-400 text-xs" />
          <span className="text-white text-xs font-bold">{movie.averageRating?.toFixed(1) || "N/A"}</span>
        </div>
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg truncate group-hover:text-primary-400 transition-colors">{movie.title}</h3>
        <p className="text-gray-500 text-sm truncate">{movie.genres?.join(", ") || "Genre"}</p>
      </div>
    </Link>
  )
}

export default MovieDetailScreen;
