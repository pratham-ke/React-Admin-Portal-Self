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
  async (params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string } | undefined, thunkAPI) => {
    try {
      const query = params || {};
      const res = await apiClient.get(`/contact/submissions`, { params: query });
      // backend may return { data, submissions, total } or plain array
      const payload = res.data as { data?: any[]; submissions?: any[]; total?: number };
      const items = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.submissions)
        ? payload.submissions
        : Array.isArray(res.data)
        ? res.data
        : [];
      const total = payload.total ?? items.length;
      return { data: items, total };
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
