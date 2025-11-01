import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, { email });
      setMessage(res.data.message + " (Token: " + res.data.reset_token + ")");
      setToken(res.data.reset_token);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white/80 p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border p-2 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Send Reset Link
          </button>
        </form>

        {message && (
          <div className="mt-4 p-2 bg-green-50 border border-green-300 rounded text-sm text-green-800">
            {message}
          </div>
        )}

        {token && (
          <button
            onClick={() => navigate(`/reset-password?token=${token}`)}
            className="mt-3 underline text-green-700 text-sm"
          >
            Go to Reset Page
          </button>
        )}
      </div>
    </div>
  );
}
