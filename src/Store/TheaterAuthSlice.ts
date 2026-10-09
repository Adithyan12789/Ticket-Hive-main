import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theaterInfo: localStorage.getItem("theaterInfo")
        ? JSON.parse(localStorage.getItem("theaterInfo") as string)
        : null,
};

const theaterAuthSlice = createSlice({
    name: "theaterAuth",
    initialState,
    reducers: {
        setTheaterDetails: (state, action) => {
            state.theaterInfo = action.payload;
            localStorage.setItem("theaterInfo", JSON.stringify(action.payload));
        },
        clearTheater: (state) => {
            state.theaterInfo = null;
            localStorage.removeItem("theaterInfo");
        },
    },
});

export const { setTheaterDetails, clearTheater } = theaterAuthSlice.actions;
export default theaterAuthSlice.reducer;
