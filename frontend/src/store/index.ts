// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./slices/authSlice";
import teamReducer from "./slices/teamSlice";
import portfolioReducer from "./slices/portfolioSlice";
import blogReducer from "./slices/blogSlice";
import notificationReducer from "./slices/notificationSlice";
import userReducer from "./slices/userSlice"; 
import contactsReducer from "./slices/contactSlice";
import { setLogoutHandler } from "../services/apiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    team: teamReducer,
    portfolio: portfolioReducer,
    blog: blogReducer,
    notification: notificationReducer,
  users: userReducer,
  contacts: contactsReducer,
  },
});

// agar apiClient ko 401 mile to yeh logout karwa dega automatically
setLogoutHandler(() => {
  store.dispatch(logout());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
