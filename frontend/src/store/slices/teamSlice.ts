import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  email?: string;
  image?: string; // server-stored filename
  linkedin?: string;
  biography?: string;
  status?: string; // active/inactive
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamState {
  items: TeamMember[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchTeam = createAsyncThunk(
  "team/fetch",
  async (params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string } | undefined, thunkAPI) => {
    try {
      const query = { ...(params || {}), admin: true } as any;
      const res = await apiClient.get(`/team`, { params: query });
      const payload = res.data as { data?: TeamMember[]; total?: number };
      const items = Array.isArray(payload.data) ? payload.data : (Array.isArray(res.data) ? res.data : []);
      const total = payload.total ?? items.length;
      return { data: items, total };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load team");
    }
  }
);

export const createTeamMember = createAsyncThunk(
  "team/create",
  async (payload: Partial<TeamMember> & { file?: File }, thunkAPI) => {
    try {
      const form = new FormData();
      if (payload.file) form.append("image", payload.file);
      if (payload.name) form.append("name", payload.name);
      if (payload.position) form.append("position", payload.position);
      if (payload.email) form.append("email", payload.email);
      if (payload.linkedin) form.append("linkedin", payload.linkedin);
      if (payload.biography) form.append("biography", payload.biography);
      if (payload.status) form.append("status", payload.status);
      const res = await apiClient.post(`/team`, form, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data as TeamMember;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create");
    }
  }
);

export const updateTeamMember = createAsyncThunk(
  "team/update",
  async (payload: { id: number; data: Partial<TeamMember> & { file?: File } }, thunkAPI) => {
    try {
      const form = new FormData();
      if (payload.data.file) form.append("image", payload.data.file);
      if (payload.data.name) form.append("name", payload.data.name);
      if (payload.data.position) form.append("position", payload.data.position);
      if (payload.data.email) form.append("email", payload.data.email);
      if (payload.data.linkedin) form.append("linkedin", payload.data.linkedin);
      if (payload.data.biography) form.append("biography", payload.data.biography);
      if (payload.data.status) form.append("status", payload.data.status);
      const res = await apiClient.put(`/team/${payload.id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data as TeamMember;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

export const deleteTeamMember = createAsyncThunk(
  "team/delete",
  async (id: number, thunkAPI) => {
    try {
      await apiClient.delete(`/team/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  }
);

export const toggleTeamStatus = createAsyncThunk(
  "team/toggleStatus",
  async (id: number, thunkAPI) => {
    try {
      const res = await apiClient.patch(`/team/${id}/toggle-status`);
      return res.data as { id: number; status: string };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to toggle");
    }
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeam.fulfilled, (state, action: PayloadAction<{ data: TeamMember[]; total: number }>) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total ?? action.payload.data.length;
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamMember.fulfilled, (state, action: PayloadAction<TeamMember>) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTeamMember.fulfilled, (state, action: PayloadAction<TeamMember>) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTeamMember.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(toggleTeamStatus.fulfilled, (state, action: PayloadAction<{ id: number; status: string }>) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx].status = action.payload.status as any;
      });
  },
});

export default teamSlice.reducer;


