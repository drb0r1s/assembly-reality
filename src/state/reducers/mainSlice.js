import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        view: { memory: true, ioDevices: true, cpuRegisters: true, ioRegisters: true }
    },

    reducers: {
        updateView: (state, action) => {
            state.view = action.payload
        }
    }
});

export const mainActions = mainSlice.actions;
export default mainSlice.reducer;