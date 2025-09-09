import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error";
export type BannerType = "success" | "error";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface Banner {
  message: string;
  type: BannerType;
  visible: boolean;
}

export interface NotificationState {
  toasts: Toast[];
  banner: Banner;
}

const initialState: NotificationState = {
  toasts: [],
  banner: {
    message: "",
    type: "success",
    visible: false,
  },
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const id = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    showSuccess: (state, action: PayloadAction<string>) => {
      state.banner = {
        message: action.payload,
        type: "success",
        visible: true,
      };
    },
    showError: (state, action: PayloadAction<string>) => {
      state.banner = {
        message: action.payload,
        type: "error",
        visible: true,
      };
    },
    clearNotification: (state) => {
      state.banner.visible = false;
    },
  },
});

export const { addToast, removeToast, clearToasts, showSuccess, showError, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;


