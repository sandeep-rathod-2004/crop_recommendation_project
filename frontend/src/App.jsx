import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import CropForm from "./pages/CropForm";
import HistoryPage from "./pages/HistoryPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("is_admin") === "true");

  // Keep UI synced with localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setIsAdmin(localStorage.getItem("is_admin") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setIsAdmin(false);
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-lime-200 to-sky-300 text-gray-900 relative overflow-hidden">
        {/* soft glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.3)_0%,_transparent_50%)] pointer-events-none"></div>

        {/* 🌾 Navbar */}
        <nav className="bg-white/30 backdrop-blur-md shadow-lg border-b border-white/30 p-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-extrabold text-green-800 drop-shadow-sm">
            🌾 Smart Crop Recommender
          </h1>

          <div className="space-x-4 flex items-center">
            {token ? (
              <>
                <Link to="/" className="text-green-900 font-semibold hover:text-green-700 transition">
                  Home
                </Link>
                <Link to="/history" className="text-green-900 font-semibold hover:text-green-700 transition">
                  History
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-green-900 font-semibold hover:text-green-700 transition">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-1 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-green-900 font-semibold hover:text-green-700 transition">
                  Login
                </Link>
                <Link to="/register" className="text-green-900 font-semibold hover:text-green-700 transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* 🧭 Routes */}
        <main className="p-6 relative z-10">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CropForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
