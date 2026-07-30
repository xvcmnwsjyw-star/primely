import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios.js";

export const fetchProgress = createAsyncThunk("progress/fetchOne", async (courseId) => {
  const { data } = await api.get(`/progress/${courseId}`);
  return data;
});

export const completeLesson = createAsyncThunk(
  "progress/completeLesson",
  async ({ courseId, lessonId }) => {
    const { data } = await api.post(`/progress/${courseId}/complete-lesson`, { lessonId });
    return data;
  }
);

const progressSlice = createSlice({
  name: "progress",
  initialState: { current: null, status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(completeLesson.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export default progressSlice.reducer;
