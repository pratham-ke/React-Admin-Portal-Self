import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import DashboardLayout from "./pages/DashboardLayout";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import TeamPage from "./pages/team/TeamPage";
import PortfolioPage from "./pages/portfolio/PortfolioPage";
import BlogPage from "./pages/blog/BlogPage";
import TeamFormPage from "./pages/team/TeamFormPage";
import TeamViewPage from "./pages/team/TeamViewPage.tsx";
import PortfolioFormPage from "./pages/portfolio/PortfolioFormPage";
import PortfolioViewPage from "./pages/portfolio/PortfolioViewPage";
import BlogFormPage from "./pages/blog/BlogFormPage";
import BlogViewPage from "./pages/blog/BlogViewPage";
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import SettingsPage from "./pages/settings/SettingsPage.tsx";
import UsersPage from "./pages/users/UsersPage";
import ContactPage from "./pages/contact/ContactPage";

function App() {
  return (
    
      <Routes>
        {/* Default redirect from "/" to "/login" */}
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
          <Route path="team" element={<TeamPage />} />
          <Route path="team/add" element={<TeamFormPage />} />
          <Route path="team/edit/:id" element={<TeamFormPage />} />
          <Route path="team/view/:id" element={<TeamViewPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="portfolio/add" element={<PortfolioFormPage />} />
          <Route path="portfolio/edit/:id" element={<PortfolioFormPage />} />
          <Route path="portfolio/view/:id" element={<PortfolioViewPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/add" element={<BlogFormPage />} />
          <Route path="blog/edit/:id" element={<BlogFormPage />} />
          <Route path="blog/view/:id" element={<BlogViewPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* Catch-all to avoid blank screen */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    
  );
}

export default App;
