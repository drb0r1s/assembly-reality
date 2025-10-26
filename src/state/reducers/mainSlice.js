import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        view: { memory: true, ioDevices: true, cpuRegisters: true, ioRegisters: true },
        assemble: false,
        run: false,
        reset: false
    },

    reducers: {
        updateView: (state, action) => {
            state.view = action.payload
        },

        updateAssemble: (state, action) => {
            state.assemble = action.payload;
        },

        updateRun: (state, action) => {
            state.run = action.payload;
        },

        updateReset: (state, action) => {
            state.reset = action.payload;
        }
    }
});

export const mainActions = mainSlice.actions;
export default mainSlice.reducer;