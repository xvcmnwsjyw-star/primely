import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton.jsx";
import api from "../../api/axios.js";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/admin/courses").then((res) => setCourses(res.data));
  }, []);

  const setStatus = async (id, status) => {
    const { data } = await api.patch(`/admin/courses/${id}/status`, { status });
    setCourses(courses.map((c) => (c._id === id ? data : c)));
  };

  const remove = async (id) => {
    await api.delete(`/admin/courses/${id}`);
    setCourses(courses.filter((c) => c._id !== id));
  };

  return (
    <section className="px-6 py-10 max-w-3xl mx-auto">
      <BackButton fallback="/admin" />
      <h1 className="text-2xl font-semibold mb-6">Manage courses</h1>
      <div className="space-y-2">
        {courses.map((c) => (
          <div
            key={c._id}
            className="border border-black/10 rounded-card p-3 flex items-center justify-between text-sm"
          >
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-xs text-black/50">
                {c.instructor?.name} · {c.subject?.name} · {c.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatus(c._id, c.status === "published" ? "draft" : "published")}
                className="px-2 py-1 rounded-md bg-black/5 text-xs"
              >
                {c.status === "published" ? "Unpublish" : "Approve & publish"}
              </button>
              <button
                onClick={() => remove(c._id)}
                className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-xs"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
