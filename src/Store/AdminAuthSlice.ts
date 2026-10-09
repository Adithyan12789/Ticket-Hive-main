import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    adminInfo: localStorage.getItem("adminInfo")
        ? JSON.parse(localStorage.getItem("adminInfo") as string)
        : null,
};

const adminAuthSlice = createSlice({
    name: "adminAuth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            console.log("AdminAuthSlice - Setting credentials:", action.payload);
            state.adminInfo = action.payload;
            localStorage.setItem("adminInfo", JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.adminInfo = null;
            localStorage.removeItem("adminInfo");
        },
    },
});

export const { setCredentials, logout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
