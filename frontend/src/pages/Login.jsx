import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { email, password });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("is_admin", res.data.is_admin);
      localStorage.setItem("email", email);

      if (res.data.is_admin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-100 to-lime-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 max-w-md w-full"
      >
        <h2 className="text-3xl font-extrabold text-green-800 mb-6 text-center">🌿 Welcome Back</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
            required
          />

          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 hover:shadow-lg transition-all disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-gray-700 space-y-2">
          <p>
            Forgot password?{" "}
            <Link to="/forgot-password" className="text-green-700 font-semibold hover:underline">
              Reset here
            </Link>
          </p>
          <p>
            Don’t have an account?{" "}
            <Link to="/register" className="text-green-700 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
