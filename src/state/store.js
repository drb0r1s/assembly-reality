import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./reducers/mainSlice";

export const store = configureStore({ reducer: {
    main: mainReducer
}});