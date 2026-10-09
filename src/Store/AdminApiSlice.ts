import { apiSlice } from "./ApiSlice";

const ADMIN_URL = "/api/admin";

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        adminLogin: builder.mutation({
            query: (data) => ({
                url: `${ADMIN_URL}/admin-login`,
                method: "POST",
                body: data,
            }),
        }),
        adminLogout: builder.mutation({
            query: () => ({
                url: `${ADMIN_URL}/admin-logout`,
                method: "POST",
            }),
        }),
        getUserData: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/get-user`,
                method: "GET",
            }),
        }),
        getAllBookingDetails: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/getAlltickets`,
                method: "GET",
            }),
        }),
        getTheaterOwnerData: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/get-theaterOwners`,
                method: "GET",
            }),
        }),
        getMovies: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/get-movies`,
                method: "GET",
            }),
        }),
        addMovie: builder.mutation({
            query: (data) => ({
                url: `${ADMIN_URL}/add-movie`,
                method: "POST",
                body: data,
            }),
        }),
        updateMovie: builder.mutation({
            query: ({ id, formData }) => ({
                url: `${ADMIN_URL}/movie-edit/${id}`,
                method: "PUT",
                body: formData,
            }),
        }),
        deleteMovie: builder.mutation({
            query: ({ id }) => ({
                url: `${ADMIN_URL}/movie-delete/${id}`,
                method: "DELETE",
            }),
        }),
        adminBlockTheaterOwner: builder.mutation({
            query: ({ theaterOwnerId }) => ({
                url: `${ADMIN_URL}/block-theaterOwner`,
                method: "PATCH",
                body: { theaterOwnerId },
            }),
        }),
        adminUnblockTheaterOwner: builder.mutation({
            query: ({ theaterOwnerId }) => ({
                url: `${ADMIN_URL}/unblock-theaterOwner`,
                method: "PATCH",
                body: { theaterOwnerId },
            }),
        }),
        adminBlockUser: builder.mutation({
            query: ({ userId }) => ({
                url: `${ADMIN_URL}/block-user`,
                method: "PATCH",
                body: { userId },
            }),
        }),
        adminUnblockUser: builder.mutation({
            query: ({ userId }) => ({
                url: `${ADMIN_URL}/unblock-user`,
                method: "PATCH",
                body: { userId },
            }),
        }),
        getVerificationData: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/verification`,
                method: "GET",
            }),
        }),
        adminAcceptVerification: builder.mutation({
            query: (theaterId) => ({
                url: `${ADMIN_URL}/verification/${theaterId}/accept`,
                method: "PUT",
            }),
        }),
        adminRejectVerification: builder.mutation({
            query: ({ adminId, reason }) => ({
                url: `${ADMIN_URL}/verification/${adminId}/reject`,
                method: "PUT",
                body: { reason },
            }),
        }),
        getMovieByMovieId: builder.query({
            query: (id) => ({
                url: `${ADMIN_URL}/movie-details/${id}`,
                method: "GET"
            })
        }),
        updateBookingStatus: builder.mutation({
            query: ({ bookingId, status }) => ({
                url: `${ADMIN_URL}/statusChange/${bookingId}`,
                method: "PATCH",
                body: { status },
            }),
        }),
        getAdminChatRooms: builder.query({
            query: (adminId) => ({
                url: `${ADMIN_URL}/chatrooms/${adminId}`,
                method: "GET",
            }),
        }),
        getAdminMessages: builder.query({
            query: (chatRoomId) => ({
                url: `${ADMIN_URL}/chatrooms/${chatRoomId}/messages`,
                method: "GET",
            }),
        }),
        sendAdminMessage: builder.mutation({
            query: (data) => {
                const formData = new FormData();
                if (data.file) {
                    formData.append("file", data.file);
                }
                formData.append("content", data.content);
                formData.append("senderType", data.senderType);
                return {
                    url: `${ADMIN_URL}/chatrooms/${data.chatRoomId}/messages`,
                    method: "POST",
                    body: formData,
                };
            },
        }),
        markAdminMessagesAsRead: builder.mutation({
            query: (chatRoomId) => ({
                url: `${ADMIN_URL}/mark-messages-read`,
                method: "POST",
                body: { chatRoomId },
            }),
        }),
        addCast: builder.mutation({
            query: (data) => ({
                url: `${ADMIN_URL}/add-cast`,
                method: "POST",
                body: data,
            }),
        }),
        getCast: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/get-cast`,
                method: "GET",
            }),
        }),
        updateCast: builder.mutation({
            query: ({ id, data }) => ({
                url: `${ADMIN_URL}/update-cast/${id}`,
                method: "PUT",
                body: data,
            }),
        }),
        deleteCast: builder.mutation({
            query: (id) => ({
                url: `${ADMIN_URL}/delete-cast/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAdminLoginMutation,
    useAdminLogoutMutation,
    useGetUserDataQuery,
    useGetAllBookingDetailsQuery,
    useGetTheaterOwnerDataQuery,
    useGetMoviesQuery,
    useAddMovieMutation,
    useUpdateMovieMutation,
    useDeleteMovieMutation,
    useAdminBlockTheaterOwnerMutation,
    useAdminUnblockTheaterOwnerMutation,
    useAdminBlockUserMutation,
    useAdminUnblockUserMutation,
    useGetVerificationDataQuery,
    useAdminAcceptVerificationMutation,
    useAdminRejectVerificationMutation,
    useGetMovieByMovieIdQuery,
    useUpdateBookingStatusMutation,
    useGetAdminChatRoomsQuery,
    useGetAdminMessagesQuery,
    useSendAdminMessageMutation,
    useMarkAdminMessagesAsReadMutation,
    useAddCastMutation,
    useGetCastQuery,
    useDeleteCastMutation,
    useUpdateCastMutation,
} = adminApiSlice;
