import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

export interface PortfolioItem {
  id: number;
  name: string;
  description?: string;
  image?: string; // server-stored filename
  status?: string; // Active/Exit
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioState {
  items: PortfolioItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchPortfolio = createAsyncThunk(
  "portfolio/fetch",
  async (params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string } | undefined, thunkAPI) => {
    try {
      const query = { ...(params || {}), admin: true } as any;
      const res = await apiClient.get(`/portfolio`, { params: query });
      const payload = res.data as { data?: PortfolioItem[]; total?: number };
      const items = Array.isArray(payload.data) ? payload.data : (Array.isArray(res.data) ? res.data : []);
      const total = payload.total ?? items.length;
      return { data: items, total };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load portfolio");
    }
  }
);

export const createPortfolioItem = createAsyncThunk(
  "portfolio/create",
  async (payload: Partial<PortfolioItem> & { file?: File }, thunkAPI) => {
    try {
      const form = new FormData();
      if (payload.file) form.append("image", payload.file);
      if (payload.name) form.append("name", payload.name);
      if (payload.description) form.append("description", payload.description);
      if (payload.status) form.append("status", payload.status);
      if (payload.isVisible !== undefined) form.append("isVisible", String(payload.isVisible));
      const res = await apiClient.post(`/portfolio`, form, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data as PortfolioItem;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create");
    }
  }
);

export const updatePortfolioItem = createAsyncThunk(
  "portfolio/update",
  async (payload: { id: number; data: Partial<PortfolioItem> & { file?: File } }, thunkAPI) => {
    try {
      const form = new FormData();
      if (payload.data.file) form.append("image", payload.data.file);
      if (payload.data.name) form.append("name", payload.data.name);
      if (payload.data.description) form.append("description", payload.data.description);
      if (payload.data.status) form.append("status", payload.data.status);
      if (payload.data.isVisible !== undefined) form.append("isVisible", String(payload.data.isVisible));
      const res = await apiClient.put(`/portfolio/${payload.id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data as PortfolioItem;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

export const deletePortfolioItem = createAsyncThunk(
  "portfolio/delete",
  async (id: number, thunkAPI) => {
    try {
      await apiClient.delete(`/portfolio/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  }
);

export const togglePortfolioStatus = createAsyncThunk(
  "portfolio/toggleStatus",
  async (id: number, thunkAPI) => {
    try {
      const res = await apiClient.patch(`/portfolio/${id}/toggle-status`);
      return res.data as { id: number; status: string };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to toggle");
    }
  }
);

export const togglePortfolioVisibility = createAsyncThunk(
  "portfolio/toggleVisibility",
  async (id: number, thunkAPI) => {
    try {
      const res = await apiClient.patch(`/portfolio/${id}/toggle-visibility`);
      return res.data as { id: number; isVisible: boolean };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to toggle visibility");
    }
  }
);

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action: PayloadAction<{ data: PortfolioItem[]; total: number }>) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total ?? action.payload.data.length;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPortfolioItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPortfolioItem.fulfilled, (state, action: PayloadAction<PortfolioItem>) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createPortfolioItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePortfolioItem.fulfilled, (state, action: PayloadAction<PortfolioItem>) => {
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deletePortfolioItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(togglePortfolioStatus.fulfilled, (state, action: PayloadAction<{ id: number; status: string }>) => {
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) state.items[idx].status = action.payload.status as any;
      })
      .addCase(togglePortfolioVisibility.fulfilled, (state, action: PayloadAction<{ id: number; isVisible: boolean }>) => {
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) state.items[idx].isVisible = action.payload.isVisible;
      });
  },
});

export default portfolioSlice.reducer;
