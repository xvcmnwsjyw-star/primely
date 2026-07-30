import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/analytics").then((res) => setStats(res.data));
  }, []);

  return (
    <section className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Admin dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Users" value={stats?.userCount} />
        <Stat label="Courses" value={stats?.courseCount} />
        <Stat label="Subjects" value={stats?.subjectCount} />
        <Stat label="Revenue" value={stats ? `$${stats.totalRevenue}` : undefined} />
      </div>

      <div className="flex gap-4 text-sm">
        <Link to="/admin/users" className="underline">
          Manage users
        </Link>
        <Link to="/admin/courses" className="underline">
          Manage courses
        </Link>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-black/10 rounded-card p-4">
      <p className="text-xs text-black/50 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value ?? "—"}</p>
    </div>
  );
}
