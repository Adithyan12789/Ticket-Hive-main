import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { backendUrl } from "../url";
import type { RootState } from "./index";

const baseQuery = fetchBaseQuery({
  baseUrl: backendUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;

    const adminInfo = state.adminAuth?.adminInfo;
    const adminToken = adminInfo?.token;

    const theaterInfo = state.theaterAuth?.theaterInfo;
    const theaterToken = theaterInfo?.token;

    if (adminToken) {
      headers.set("Authorization", `Bearer ${adminToken}`);
    } else if (theaterToken) {
      headers.set("Authorization", `Bearer ${theaterToken}`);
    }

    return headers;
  },
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "Admin", "Theater"],
  endpoints: () => ({}),
});
