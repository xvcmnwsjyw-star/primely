import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios.js";

const storedUser = localStorage.getItem("primely_user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  status: "idle", // idle | loading | failed
  error: null,
};

export const login = createAsyncThunk("auth/login", async ({ email, password }, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const refreshUser = createAsyncThunk("auth/refresh", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Could not refresh user");
  }
});

export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, role }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password, role });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

const persist = (data) => {
  const { token, ...profile } = data;
  localStorage.setItem("primely_token", token);
  localStorage.setItem("primely_user", JSON.stringify(profile));
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("primely_token");
      localStorage.removeItem("primely_user");
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        persist(action.payload);
        const { token, ...profile } = action.payload;
        state.user = profile;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "idle";
        persist(action.payload);
        const { token, ...profile } = action.payload;
        state.user = profile;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("primely_user", JSON.stringify(state.user));
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
