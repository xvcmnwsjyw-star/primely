import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios.js";

export const fetchCourses = createAsyncThunk("courses/fetchAll", async (subjectSlug) => {
  const { data } = await api.get("/courses", { params: subjectSlug ? { subject: subjectSlug } : {} });
  return data;
});

export const fetchCourseById = createAsyncThunk("courses/fetchOne", async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
});

const coursesSlice = createSlice({
  name: "courses",
  initialState: { items: [], current: null, status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export default coursesSlice.reducer;
