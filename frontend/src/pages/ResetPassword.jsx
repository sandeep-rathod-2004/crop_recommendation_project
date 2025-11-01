import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Extract token from query param ?token=...
  const token = new URLSearchParams(location.search).get("token");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/reset-password`, {
        token,
        new_password: password,
      });

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-lime-100">
      <div className="bg-white/80 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-green-200">
        <h2 className="text-3xl font-extrabold text-green-800 mb-6 text-center">
          🔒 Reset Password
        </h2>

        {!token ? (
          <p className="text-red-600 text-center">Invalid or missing token.</p>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
              required
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-700 text-sm">{message}</div>}

            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
