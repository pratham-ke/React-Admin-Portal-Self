// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

export interface User {
  id: number;
  name: string; // maps to backend.username
  email: string;
  role: string;
  active: boolean; // maps to backend.isActive
  createdAt?: string;
  imageUrl?: string; // profile image URL
}

interface UserState {
  items: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: UserState = {
  items: [],
  currentUser: null,
  loading: false,
  error: null,
  total: 0,
};

// Helper: map backend user -> frontend User
const mapFromApi = (u: any): User => ({
  id: u.id,
  name: u.username ?? u.name ?? "",
  email: u.email ?? "",
  role: u.role ?? "user",
  active: typeof u.isActive === "boolean" ? u.isActive : !!u.active,
  createdAt: u.createdAt ?? u.created_at ?? undefined,
  imageUrl: u.imageUrl ?? u.image_url ?? u.image ?? undefined,
});

// Fetch all users
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string } | undefined, thunkAPI) => {
    try {
      const res = await apiClient.get("/users", { params });
      const payload = res.data as { data?: any[]; total?: number };
      const raw = Array.isArray(payload.data) ? payload.data : (Array.isArray(res.data) ? res.data : []);
      const data = raw.map(mapFromApi);
      const total = payload.total ?? raw.length;
      return { data, total };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

// Fetch single user by id
export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (id: number, thunkAPI) => {
    try {
      const res = await apiClient.get(`/users/${id}`);
      return mapFromApi(res.data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch user");
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
  "users/create",
  async (payload: { name: string; email: string; role: string; active?: boolean; password?: string; confirmPassword?: string; file?: File | null }, thunkAPI) => {
    try {
      const form = new FormData();
      form.append("username", payload.name);
      form.append("email", payload.email);
      form.append("role", payload.role ?? "user");
      if (payload.password) form.append("password", payload.password);
      if (typeof payload.active === "boolean") form.append("isActive", String(payload.active));
      if (payload.file) form.append("image", payload.file);
      const res = await apiClient.post(`/users`, form, { headers: { "Content-Type": "multipart/form-data" } });
      return mapFromApi(res.data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create user");
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "users/update",
  async (payload: { id: number; data: { name: string; email: string; role: string; active?: boolean; password?: string; confirmPassword?: string; file?: File | null } }, thunkAPI) => {
    try {
      const form = new FormData();
      form.append("username", payload.data.name);
      form.append("email", payload.data.email);
      form.append("role", payload.data.role ?? "user");
      if (typeof payload.data.active === "boolean") form.append("isActive", String(payload.data.active));
      if (payload.data.file) form.append("image", payload.data.file);
      const res = await apiClient.put(`/users/${payload.id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      return mapFromApi(res.data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update user");
    }
  }
);

// Delete user (soft delete in backend)
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: number, thunkAPI) => {
    try {
      await apiClient.delete(`/users/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

export const toggleUserActive = createAsyncThunk(
  "users/toggleActive",
  async (id: number, thunkAPI) => {
    try {
      const res = await apiClient.patch(`/users/${id}/toggle-active`);
      const payload = res.data as { id: number; isActive: boolean };
      return { id: payload.id, active: payload.isActive };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to toggle user status");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ data: User[]; total: number }>) => {
        state.items = action.payload.data;
        state.total = action.payload.total ?? action.payload.data.length;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || "Failed to fetch users";
      })
      .addCase(fetchUserById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => { state.currentUser = action.payload; state.loading = false; })
      .addCase(fetchUserById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string || action.error.message || "Failed to fetch user"; })
      .addCase(createUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => { state.items.unshift(action.payload); state.loading = false; })
      .addCase(createUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string || action.error.message || "Failed to create user"; })
      .addCase(updateUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.items.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentUser && state.currentUser.id === action.payload.id) state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string || action.error.message || "Failed to update user"; })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => { state.items = state.items.filter((u) => u.id !== action.payload); if (state.currentUser && state.currentUser.id === action.payload) state.currentUser = null; })
      .addCase(deleteUser.rejected, (state, action) => { state.error = action.payload as string || action.error.message || "Failed to delete user"; })
      .addCase(toggleUserActive.fulfilled, (state, action: PayloadAction<{ id: number; active: boolean }>) => {
        const idx = state.items.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.items[idx].active = action.payload.active;
        if (state.currentUser && state.currentUser.id === action.payload.id) state.currentUser.active = action.payload.active;
      });
  },
});

export default userSlice.reducer;
