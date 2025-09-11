import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

export interface ContactSubmission {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  submittedAt: string;
  ipAddress?: string;
}

interface ContactState {
  items: ContactSubmission[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ContactState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchContacts = createAsyncThunk(
  "contacts/fetch",
  async (params: { page?: number; limit?: number } | undefined, thunkAPI) => {
    try {
      const res = await apiClient.get(`/contact/submissions`, { params: params });
      // backend returns { total, submissions }
      const total = res.data.total ?? (Array.isArray(res.data) ? res.data.length : 0);
      const submissions = res.data.submissions ?? res.data;
      return { data: submissions, total };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch contacts");
    }
  }
);

const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<{ data: any[]; total: number }>) => {
        state.items = action.payload.data;
        state.total = action.payload.total ?? action.payload.data.length;
        state.loading = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string || action.error.message || "Failed to fetch contacts"; });
  }
});

export default contactSlice.reducer;
