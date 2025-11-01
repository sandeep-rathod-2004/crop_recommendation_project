import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register`, form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-lime-100 flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 max-w-md w-full">
        <div className="text-center mb-6">
          <UserPlus className="text-green-600 w-10 h-10 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-green-700">Create Account 🌾</h1>
          <p className="text-sm text-gray-600">Join the smart farming community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
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
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 hover:shadow-lg transition disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-700 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-green-700 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
