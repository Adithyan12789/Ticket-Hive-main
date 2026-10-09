import { apiSlice } from "./ApiSlice";
import {
  UserResponse,
  UserCredentials,
  RegisterCredentials,
  OtpCredentials,
} from "../Core/UserTypes";
import { MovieManagement } from "../Core/MoviesTypes";

const USERS_URL = "/api/users";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<UserResponse, UserCredentials>({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),

    googleLogin: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/googleLogin`,
        method: "POST",
        body: data,
      }),
    }),

    register: builder.mutation<UserResponse, RegisterCredentials>({
      query: (data) => ({
        url: `${USERS_URL}/sign-up`,
        method: "POST",
        body: data,
      }),
    }),

    verifyOtp: builder.mutation<UserResponse, OtpCredentials>({
      query: (data) => ({
        url: `${USERS_URL}/verifyotp`,
        method: "POST",
        body: data,
      }),
    }),

    resendOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-otp`,
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),

    sendPasswordResetEmail: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password/${data.token}`,
        method: "PUT",
        body: { password: data.password },
      }),
    }),

    refreshToken: builder.mutation<void, void>({
      query: () => {
        console.log(
          "Sending refresh token request to:",
          `${USERS_URL}/refresh-token`
        );
        return {
          url: `${USERS_URL}/refresh-token`,
          method: "POST",
        };
      },
    }),

    saveUserLocation: builder.mutation<
      void,
      { city: string; latitude: number; longitude: number }
    >({
      query: (location) => ({
        url: `${USERS_URL}/save-location`,
        method: "POST",
        body: location,
      }),
    }),

    getUserProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
        method: "GET",
      }),
    }),

    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
    }),

    getMovies: builder.query<{ movies: MovieManagement[] }, any>({
      query: () => ({
        url: `${USERS_URL}/get-movies`,
        method: "GET",
      }),
    }),

    getMovieByMovieId: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/movie-detail/${id}`,
        method: "GET",
      }),
    }),

    getTheatersByMovieTitle: builder.query({
      query: ({ movieTitle, date, userId }) => ({
        url: `${USERS_URL}/movie-theaters/${movieTitle}`,
        params: { date, userId },
        method: "GET",
      }),
    }),

    getAllReviews: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/allReviews`,
        method: "GET",
      }),
    }),

    getReviews: builder.query({
      query: (movieId) => ({
        url: `${USERS_URL}/reviews/${movieId}`,
        method: "GET",
      }),
    }),

    addReview: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reviews`,
        method: "POST",
        body: data,
      }),
    }),

    getScreenById: builder.query({
      query: (screenId) => ({
        url: `${USERS_URL}/screen/${screenId}`,
        method: "GET",
      }),
    }),

    updateSeatAvailability: builder.mutation({
      query: ({ scheduleId, selectedSeats, holdSeat, showTime }) => ({
        url: `${USERS_URL}/update-availability`,
        method: "POST",
        body: { scheduleId, selectedSeats, holdSeat, showTime },
      }),
    }),

    getOffersByTheaterId: builder.query({
      query: (theaterId) => ({
        url: `${USERS_URL}/offers/${theaterId}`,
        method: "GET",
      }),
    }),

    createBooking: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/book-ticket`,
        method: "POST",
        body: data,
      }),
    }),

    getBookingDetails: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/get-tickets/${userId}`,
        method: "GET",
      }),
    }),

    createWalletTransaction: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/create-wallet-transaction`,
        method: "POST",
        body: data,
      }),
    }),

    getTransactionHistory: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/transaction-history/${userId}`,
        method: "GET",
      }),
    }),

    cancelBooking: builder.mutation({
      query: (bookingId) => ({
        url: `${USERS_URL}/cancel-ticket/${bookingId}`,
        method: "POST",
      }),
    }),

    fetchUnreadNotifications: builder.query({
      query: () => `${USERS_URL}/notifications/unread`,
    }),

    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/notifications/${id}/read`,
        method: "PUT",
      }),
    }),

    clearAllNotifications: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/clearNotifications`,
        method: "DELETE",
      }),
    }),
    voteReview: builder.mutation({
      query: ({ reviewId, userId, action }) => ({
        url: `${USERS_URL}/reviews/${reviewId}/vote`,
        method: "PUT",
        body: { userId, action },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useSendPasswordResetEmailMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useSaveUserLocationMutation,
  useGetUserProfileQuery,
  useUpdateUserMutation,
  useGetMoviesQuery,
  useGetMovieByMovieIdQuery,
  useGetTheatersByMovieTitleQuery,
  useGetAllReviewsMutation,
  useGetReviewsQuery,
  useAddReviewMutation,
  useVoteReviewMutation,
  useGetScreenByIdQuery,
  useUpdateSeatAvailabilityMutation,
  useGetOffersByTheaterIdQuery,
  useCreateBookingMutation,
  useGetBookingDetailsQuery,
  useGetTransactionHistoryQuery,
  useCreateWalletTransactionMutation,
  useCancelBookingMutation,
  useFetchUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useClearAllNotificationsMutation,
} = usersApiSlice;
