// src/routes/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { JSX } from "react";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useSelector((state: RootState) => state.auth);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
