// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// Auth pages
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard layout
import DashboardLayout from "./pages/DashboardLayout";

// Route guards
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

// Dashboard main pages
import DashboardHome from "./pages/Dashboard/DashboardHome";

// Team module
import TeamPage from "./pages/team/TeamPage";
import TeamFormPage from "./pages/team/TeamFormPage";
import TeamViewPage from "./pages/team/TeamViewPage";

// Portfolio module
import PortfolioPage from "./pages/portfolio/PortfolioPage";
import PortfolioFormPage from "./pages/portfolio/PortfolioFormPage";
import PortfolioViewPage from "./pages/portfolio/PortfolioViewPage";

// Blog module
import BlogPage from "./pages/blog/BlogPage";
import BlogFormPage from "./pages/blog/BlogFormPage";
import BlogViewPage from "./pages/blog/BlogViewPage";

// Users module
import UsersPage from "./pages/users/UserPage";
import UserFormPage from "./pages/users/UserFormPage";
import UserViewPage from "./pages/users/UserViewPage";

// Other pages
import ProfilePage from "./pages/profile/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import ContactPage from "./pages/contact/ContactPage";

function App() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Private routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Team routes */}
        <Route path="team" element={<TeamPage />} />
        <Route path="team/add" element={<TeamFormPage />} />
        <Route path="team/edit/:id" element={<TeamFormPage />} />
        <Route path="team/view/:id" element={<TeamViewPage />} />

        {/* Portfolio routes */}
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="portfolio/add" element={<PortfolioFormPage />} />
        <Route path="portfolio/edit/:id" element={<PortfolioFormPage />} />
        <Route path="portfolio/view/:id" element={<PortfolioViewPage />} />

        {/* Blog routes */}
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/add" element={<BlogFormPage />} />
        <Route path="blog/edit/:id" element={<BlogFormPage />} />
        <Route path="blog/view/:id" element={<BlogViewPage />} />

        {/* Users routes (same as Team module structure) */}
        <Route path="users" element={<UsersPage />} />
        <Route path="users/add" element={<UserFormPage />} />
        <Route path="users/edit/:id" element={<UserFormPage />} />
        <Route path="users/view/:id" element={<UserViewPage />} />

        {/* Other routes */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
