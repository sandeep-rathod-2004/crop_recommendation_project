import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Loader2 } from "lucide-react";

export default function CropForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    N: "", P: "", K: "", temperature: "", humidity: "", ph: "", rainfall: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");
    setLoading(true);

    const payload = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, Number(v)]));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/predict`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.recommended_crop) setResult(res.data.recommended_crop);
      else if (res.data?.error) setError(res.data.error);
      else setError("Unexpected response from server.");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.detail || "Network or server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-lime-200 to-sky-200 flex flex-col">
      {/* Header */}
      <header className="bg-white/30 backdrop-blur-lg shadow-lg border-b border-white/40 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <Sprout className="text-green-700 w-7 h-7 drop-shadow" />
            <h1 className="text-xl md:text-2xl font-extrabold text-green-800 drop-shadow-sm">
              Smart Crop Recommender
            </h1>
          </div>
          <nav className="flex gap-3">
            <Link
              to="/history"
              className="text-green-900 font-semibold hover:text-green-700 hover:underline transition"
            >
              History
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg font-medium shadow-md hover:shadow-red-300 transition-all"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-green-300/60">
          <h2 className="text-3xl font-extrabold text-center text-green-800 mb-8 drop-shadow">
            🌱 Enter Soil & Weather Details
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {["N", "P", "K", "temperature", "humidity", "ph", "rainfall"].map((field) => (
              <input
                key={field}
                name={field}
                type="number"
                step="any"
                value={formData[field]}
                onChange={handleChange}
                placeholder={
                  field === "N"
                    ? "Nitrogen (N)"
                    : field === "P"
                    ? "Phosphorus (P)"
                    : field === "K"
                    ? "Potassium (K)"
                    : field === "temperature"
                    ? "Temperature (°C)"
                    : field === "humidity"
                    ? "Humidity (%)"
                    : field === "ph"
                    ? "Soil pH"
                    : "Rainfall (mm)"
                }
                className="p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none shadow-sm bg-white/70 backdrop-blur-md"
                required
              />
            ))}

            <div className="md:col-span-2 flex gap-4 items-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center items-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all hover:scale-105 hover:shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" /> : "🌾 Recommend Crop"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ N: "", P: "", K: "", temperature: "", humidity: "", ph: "", rainfall: "" });
                  setResult("");
                  setError("");
                }}
                className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 hover:shadow-md transition"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Result / Error */}
          <div className="mt-6 text-center">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-medium shadow-inner">
                ⚠️ {error}
              </div>
            )}
            {result && (
              <div className="bg-green-50 border border-green-200 px-4 py-5 rounded-xl mt-4 shadow-inner animate-fadeIn">
                <p className="text-gray-700 text-sm">Recommended crop for your inputs:</p>
                <p className="text-3xl font-bold text-green-700 mt-2">{result}</p>
                <Link to="/history" className="inline-block mt-3 text-green-600 hover:underline font-medium">
                  View History
                </Link>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-8 italic">
            💡 Tip: Use realistic values. The model predicts using N, P, K, temperature, humidity, pH, and rainfall.
          </p>
        </div>
      </main>
    </div>
  );
}
