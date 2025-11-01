import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { History, LogOut, Home } from "lucide-react";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Access correct data array
        setHistory(res.data.data.reverse());
      } catch {
        setError("Failed to fetch history. Try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-lime-200 to-sky-200">
      {/* Header */}
      <header className="bg-white/30 backdrop-blur-lg border-b shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="text-xl font-bold text-green-800">
              Smart Crop Recommender
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition"
            >
              <Home size={16} /> Home
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white/50 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/40 p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <History className="text-green-600 w-6 h-6" />
            <h2 className="text-2xl font-extrabold text-green-800">
              Prediction History
            </h2>
          </div>

          {loading ? (
            <p className="text-center text-gray-700">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-700">
              No prediction history yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full border-collapse bg-white/80 backdrop-blur-md rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-green-100 text-green-800 text-sm uppercase">
                    <th className="p-3 text-left border-b">Date</th>
                    <th className="p-3 text-left border-b">N</th>
                    <th className="p-3 text-left border-b">P</th>
                    <th className="p-3 text-left border-b">K</th>
                    <th className="p-3 text-left border-b">Temp (°C)</th>
                    <th className="p-3 text-left border-b">Humidity</th>
                    <th className="p-3 text-left border-b">pH</th>
                    <th className="p-3 text-left border-b">Rainfall</th>
                    <th className="p-3 text-left border-b">
                      Recommended Crop
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, i) => (
                    <tr
                      key={i}
                      className={`text-sm ${
                        i % 2 === 0 ? "bg-green-50" : "bg-white"
                      } hover:bg-green-100`}
                    >
                      {/* ✅ Fix date field name */}
                      <td className="p-3 border-b">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>

                      <td className="p-3 border-b">{entry.N}</td>
                      <td className="p-3 border-b">{entry.P}</td>
                      <td className="p-3 border-b">{entry.K}</td>
                      <td className="p-3 border-b">{entry.temperature}</td>
                      <td className="p-3 border-b">{entry.humidity}</td>
                      <td className="p-3 border-b">{entry.ph}</td>
                      <td className="p-3 border-b">{entry.rainfall}</td>

                      {/* ✅ Fix crop field name */}
                      <td className="p-3 border-b font-semibold text-green-700">
                        {entry.recommended_crop}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
