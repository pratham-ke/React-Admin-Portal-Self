import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

export interface BlogPost {
  id: number;
  title: string;
  description?: string;
  content: string;
  image?: string; // server-stored filename
  imageUrl?: string;
  category?: string;
  author?: string;
  date?: string;
  tags?: string[];
  status?: string; // draft/published
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogState {
  items: BlogPost[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: BlogState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchBlog = createAsyncThunk(
  "blog/fetch",
  async (params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string } | undefined, thunkAPI) => {
    try {
      const query = { ...(params || {}), admin: true } as any;
      const res = await apiClient.get(`/blog`, { params: query });
      const payload = res.data as { data?: BlogPost[]; total?: number };
      const items = Array.isArray(payload.data) ? payload.data : (Array.isArray(res.data) ? res.data : []);
      const total = payload.total ?? items.length;
      return { data: items, total };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load blog posts");
    }
  }
);

export const createBlogPost = createAsyncThunk(
  "blog/create",
  async (payload: Partial<BlogPost> & { file?: File }, thunkAPI) => {
    try {
      const form = new FormData();
      if (payload.file) form.append("image", payload.file);
      if (payload.title) form.append("title", payload.title);
      if (payload.content) form.append("content", payload.content);
      if (payload.category) form.append("category", payload.category);
      if (payload.author) form.append("author", payload.author);
      if (payload.tags) form.append("tags", JSON.stringify(payload.tags));
      if (payload.status) form.append("status", payload.status);
      if (payload.date) form.append("date", payload.date);
      const res = await apiClient.post(`/blog`, form, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data as BlogPost;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create");
    }
  }
);

export const updateBlogPost = createAsyncThunk(
  "blog/update",
  async (payload: { id: number; data: Partial<BlogPost> & { file?: File } }, thunkAPI) => {
    try {
      const form = new FormData();
      if (payload.data.file) form.append("image", payload.data.file);
      if (payload.data.title) form.append("title", payload.data.title);
      if (payload.data.content) form.append("content", payload.data.content);
      if (payload.data.category) form.append("category", payload.data.category);
      if (payload.data.author) form.append("author", payload.data.author);
      if (payload.data.tags) form.append("tags", JSON.stringify(payload.data.tags));
      if (payload.data.status) form.append("status", payload.data.status);
      if (payload.data.date) form.append("date", payload.data.date);
      const res = await apiClient.put(`/blog/${payload.id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data as BlogPost;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

export const deleteBlogPost = createAsyncThunk(
  "blog/delete",
  async (id: number, thunkAPI) => {
    try {
      await apiClient.delete(`/blog/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  }
);

export const toggleBlogStatus = createAsyncThunk(
  "blog/toggleStatus",
  async (id: number, thunkAPI) => {
    try {
      const res = await apiClient.patch(`/blog/${id}/toggle-status`);
      return res.data as { id: number; status: string };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to toggle");
    }
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlog.fulfilled, (state, action: PayloadAction<{ data: BlogPost[]; total: number }>) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total ?? action.payload.data.length;
      })
      .addCase(fetchBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBlogPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlogPost.fulfilled, (state, action: PayloadAction<BlogPost>) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createBlogPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBlogPost.fulfilled, (state, action: PayloadAction<BlogPost>) => {
        const idx = state.items.findIndex((post) => post.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBlogPost.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((post) => post.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(toggleBlogStatus.fulfilled, (state, action: PayloadAction<{ id: number; status: string }>) => {
        const idx = state.items.findIndex((post) => post.id === action.payload.id);
        if (idx !== -1) state.items[idx].status = action.payload.status as any;
      });
  },
});

export default blogSlice.reducer;
