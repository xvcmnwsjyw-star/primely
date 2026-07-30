import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import subjectsReducer from "./subjectsSlice.js";
import coursesReducer from "./coursesSlice.js";
import progressReducer from "./progressSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
    courses: coursesReducer,
    progress: progressReducer,
  },
});
