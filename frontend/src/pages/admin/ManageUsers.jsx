import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton.jsx";
import api from "../../api/axios.js";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/users").then((res) => setUsers(res.data));
  }, []);

  const updateUser = async (id, patch) => {
    const { data } = await api.patch(`/admin/users/${id}`, patch);
    setUsers(users.map((u) => (u._id === id ? data : u)));
  };

  return (
    <section className="px-6 py-10 max-w-3xl mx-auto">
      <BackButton fallback="/admin" />
      <h1 className="text-2xl font-semibold mb-6">Manage users</h1>
      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u._id}
            className="border border-black/10 rounded-card p-3 flex items-center justify-between text-sm"
          >
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-black/50">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={u.role}
                onChange={(e) => updateUser(u._id, { role: e.target.value })}
                className="border border-black/20 rounded-md text-xs px-2 py-1"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => updateUser(u._id, { banned: !u.banned })}
                className={`px-2 py-1 rounded-md text-xs ${
                  u.banned ? "bg-red-100 text-red-700" : "bg-black/5 text-black/70"
                }`}
              >
                {u.banned ? "Unban" : "Ban"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
