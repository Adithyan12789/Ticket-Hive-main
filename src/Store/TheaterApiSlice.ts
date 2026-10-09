import { apiSlice } from "./ApiSlice";

const THEATER_URL = "/api/theater";

export const theaterApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        loginTheater: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/theater-login`,
                method: "POST",
                body: data,
            }),
        }),
        googleLoginTheater: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/theater-GoogleLogin`,
                method: "POST",
                body: data,
            }),
        }),
        getTheaterStats: builder.mutation({
            query: (id) => ({
                url: `${THEATER_URL}/stats/${id}`,
                method: "GET",
            }),
        }),
        getAllBookingDetails: builder.query({
            query: (id) => ({
                url: `${THEATER_URL}/bookings/${id}`,
                method: "GET",
            }),
        }),
        getOffers: builder.query({
            query: () => ({
                url: `${THEATER_URL}/get-offers`,
                method: "GET",
            }),
        }),
        addOffer: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/add-offer`,
                method: "POST",
                body: data,
            }),
        }),
        updateOffer: builder.mutation({
            query: ({ offerId, data }) => ({
                url: `${THEATER_URL}/update-offer/${offerId}`,
                method: "PUT",
                body: data,
            }),
        }),
        deleteOffer: builder.mutation({
            query: ({ offerId }) => ({
                url: `${THEATER_URL}/delete-offer/${offerId}`,
                method: "DELETE",
            }),
        }),
        getTheaters: builder.mutation({
            query: () => ({
                url: `${THEATER_URL}/get-theaters`,
                method: "GET",
            }),
        }),
        addTheater: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/add-theaters`,
                method: "POST",
                body: data,
            }),
        }),
        updateTheater: builder.mutation({
            query: ({ id, data }) => ({
                url: `${THEATER_URL}/theaters/${id}`,
                method: "PUT",
                body: data,
            }),
        }),
        registerTheater: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/theater-signup`,
                method: "POST",
                body: data
            })
        }),
        verifyOtpTheater: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/theater-verifyotp`,
                method: 'POST',
                body: data
            })
        }),
        resendOtpTheater: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/theater-resend-otp`,
                method: 'POST',
                body: data
            })
        }),
        sendPasswordResetEmailTheater: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/theater-forgot-password`,
                method: "POST",
                body: data
            })
        }),
        resetPasswordTheater: builder.mutation({
            query: ({ token, data }) => ({
                url: `${THEATER_URL}/theater-reset-password/${token}`,
                method: "PUT",
                body: data
            })
        }),
        getTheaterOwnerProfile: builder.query({
            query: () => ({
                url: `${THEATER_URL}/theater-profile`,
                method: "GET"
            })
        }),
        updateTheaterOwner: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/theater-profile`,
                method: "PUT",
                body: data
            })
        }),
        logoutTheater: builder.mutation({
            query: () => ({
                url: `${THEATER_URL}/theater-logout`,
                method: "POST"
            })
        }),
        createChatRoom: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/chatrooms`,
                method: "POST",
                body: data
            })
        }),
        getChatRooms: builder.query({
            query: () => ({
                url: `${THEATER_URL}/chatrooms`,
                method: "GET"
            })
        }),
        getMessages: builder.query({
            query: (chatRoomId) => ({
                url: `${THEATER_URL}/chatrooms/${chatRoomId}/messages`,
                method: "GET"
            })
        }),
        sendMessage: builder.mutation({
            query: (data) => {
                const { chatRoomId, file, ...rest } = data;
                if (file) {
                    const formData = new FormData();
                    formData.append("file", file);
                    Object.entries(rest).forEach(([key, value]) => {
                        formData.append(key, value as string);
                    });
                    return {
                        url: `${THEATER_URL}/chatrooms/${chatRoomId}/messages`,
                        method: "POST",
                        body: formData,
                    };
                }
                return {
                    url: `${THEATER_URL}/chatrooms/${chatRoomId}/messages`,
                    method: "POST",
                    body: rest,
                };
            }
        }),
        getUnreadMessagesCount: builder.query({
            query: () => ({
                url: `${THEATER_URL}/unread-messages`,
                method: "GET"
            })
        }),
        markMessagesAsReadTheaterOwner: builder.mutation({
            query: (data) => ({
                url: `${THEATER_URL}/mark-messages-read`,
                method: 'POST',
                body: data
            })
        }),
        getAdmins: builder.query({
            query: () => ({
                url: `${THEATER_URL}/get-admins`,
                method: "GET"
            })
        }),
        getTheaterByTheaterId: builder.query({
            query: (id) => ({
                url: `${THEATER_URL}/theaters/${id}`,
                method: "GET"
            })
        }),
        getMoviesForTheater: builder.mutation({
            query: () => ({
                url: `${THEATER_URL}/get-movies`,
                method: "GET"
            })
        }),
        deleteScreen: builder.mutation({
            query: (id) => ({
                url: `${THEATER_URL}/delete-screen/${id}`,
                method: "DELETE"
            })
        }),
        addScreen: builder.mutation({
            query: ({ theaterId, formData }) => ({
                url: `${THEATER_URL}/add-screen/${theaterId}`,
                method: "POST",
                body: formData
            })
        }),
        updateScreen: builder.mutation({
            query: ({ screenId, formData }) => ({
                url: `${THEATER_URL}/update-screen/${screenId}`,
                method: "PUT",
                body: formData
            })
        }),
        getScreensByTheaterId: builder.query({
            query: (id) => ({
                url: `${THEATER_URL}/theaters/${id}/screens`,
                method: "GET"
            })
        }),
        getScreensById: builder.query({
            query: (id) => ({
                url: `${THEATER_URL}/screen/${id}`,
                method: "GET"
            })
        }),
        deleteTheater: builder.mutation({
            query: ({ id }) => ({
                url: `${THEATER_URL}/theaters/${id}`,
                method: "DELETE"
            })
        }),
        uploadTheaterCertificate: builder.mutation({
            query: ({ theaterId, formData }) => ({
                url: `${THEATER_URL}/upload-certificate/${theaterId}`,
                method: "POST",
                body: formData
            })
        })

    }),
});

export const {
    useLoginTheaterMutation,
    useGoogleLoginTheaterMutation,
    useGetTheaterStatsMutation,
    useGetAllBookingDetailsQuery,
    useGetOffersQuery,
    useAddOfferMutation,
    useUpdateOfferMutation,
    useDeleteOfferMutation,
    useGetTheatersMutation,
    useRegisterTheaterMutation,
    useVerifyOtpTheaterMutation,
    useSendPasswordResetEmailTheaterMutation,
    useResetPasswordTheaterMutation,
    useResendOtpTheaterMutation,
    useGetTheaterOwnerProfileQuery,
    useUpdateTheaterOwnerMutation,
    useLogoutTheaterMutation,
    useCreateChatRoomMutation,
    useGetChatRoomsQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useGetUnreadMessagesCountQuery,
    useMarkMessagesAsReadTheaterOwnerMutation,
    useGetAdminsQuery,
    useGetTheaterByTheaterIdQuery,
    useGetMoviesForTheaterMutation,
    useDeleteScreenMutation,
    useGetScreensByIdQuery,
    useDeleteTheaterMutation,
    useUploadTheaterCertificateMutation,
    useAddTheaterMutation,
    useUpdateTheaterMutation,
    useAddScreenMutation,
    useUpdateScreenMutation,
    useGetScreensByTheaterIdQuery,
} = theaterApiSlice;
