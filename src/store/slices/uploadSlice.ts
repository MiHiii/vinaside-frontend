import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import type { AxiosError } from 'axios';

export const uploadIcon = createAsyncThunk(
  'upload/icon',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data.urls[0];
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        return rejectWithValue(axiosError.response?.data?.message || 'Upload failed');
      }
      return rejectWithValue('Upload failed');
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState: {
    loading: false,
    error: null as string | null,
    url: null as string | null,
  },
  reducers: {
    resetUpload(state) {
      state.loading = false;
      state.error = null;
      state.url = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadIcon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.url = null;
      })
      .addCase(uploadIcon.fulfilled, (state, action) => {
        state.loading = false;
        state.url = action.payload;
      })
      .addCase(uploadIcon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer; 