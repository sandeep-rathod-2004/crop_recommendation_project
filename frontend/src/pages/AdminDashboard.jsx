import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_predictions: 0 });
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [resUsers, resStats] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUsers(resUsers.data.users);
        setStats(resStats.data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("⚠️ Access denied or server error.");
      }
    };
    fetchData();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-lime-200 to-sky-200 p-8">
      <div className="max-w-6xl mx-auto bg-white/60 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/40 p-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-green-700" size={26} />
            <h1 className="text-2xl font-bold text-green-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {error ? (
          <p className="text-center text-red-600 text-lg font-semibold">{error}</p>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div className="bg-green-100 p-6 rounded-xl shadow text-center">
                <h3 className="text-lg font-semibold text-green-800">Total Users</h3>
                <p className="text-3xl font-bold text-green-700">{stats.total_users}</p>
              </div>
              <div className="bg-sky-100 p-6 rounded-xl shadow text-center">
                <h3 className="text-lg font-semibold text-sky-800">Total Predictions</h3>
                <p className="text-3xl font-bold text-sky-700">{stats.total_predictions}</p>
              </div>
            </div>

            {/* Users Table */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-green-700" /> Registered Users
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white/80 backdrop-blur-md rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-green-100 text-green-800 text-sm uppercase">
                    <th className="p-3 text-left border-b">Email</th>
                    <th className="p-3 text-left border-b">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center p-4 text-gray-600">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-green-50" : "bg-white"}>
                        <td className="p-3 border-b">{user.email}</td>
                        <td className="p-3 border-b">
                          {user.is_admin ? "✅ Yes" : "❌ No"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
