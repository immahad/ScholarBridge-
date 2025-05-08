import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Create an axios instance with default settings
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3333/ifl_system/auth',
  withCredentials: true, // Ensure credentials are sent with requests
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  console.log('token', token);
  if (token) {
    config.headers.authToken = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Fetch user data
export const fetchUserData = createAsyncThunk(
  'student/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/student/get-profile');
      console.log('calling data...', data);
      return data;
    } catch (error) {
      console.log("called failed", error.response?.data || 'Failed to fetch user data');
      return rejectWithValue(error.response?.data || 'Failed to fetch user data');
    }
  }
);

// Login Student
export const loginAsync = createAsyncThunk(
  'student/login',
  async (values) => {
    const { role, ...loginValues } = values;
    const url = `/auth/login-${role}`;
    const { data } = await axiosInstance.post(url, loginValues);
    return data;
  }
);

const initialState = {
  items: [],
  userData: null, // Set to null initially
  status: 'idle',
  error: null,
};

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userData = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.userData = action.payload;
      });
  },
});

export const { setItems, setUserData } = studentSlice.actions;

export default studentSlice.reducer;
