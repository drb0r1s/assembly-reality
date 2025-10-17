import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        view: { memory: true, ioDevices: true, cpuRegisters: true, ioRegisters: true },
        assemble: false
    },

    reducers: {
        updateView: (state, action) => {
            state.view = action.payload
        },

        updateAssemble: (state, action) => {
            state.assemble = action.payload;
        }
    }
});

export const mainActions = mainSlice.actions;
export default mainSlice.reducer;