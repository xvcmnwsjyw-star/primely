import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    api.get("/instructor/courses").then((res) => setCourses(res.data));
    api.get("/instructor/earnings").then((res) => setEarnings(res.data));
  }, []);

  return (
    <section className="px-6 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Instructor dashboard</h1>
        <Link to="/instructor/courses/new" className="px-4 py-2 rounded-md bg-black text-white text-sm hover:bg-neutral-800 transition-colors">
          + New course
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="border border-black/10 rounded-card p-4">
          <p className="text-xs text-black/50 mb-1">Courses</p>
          <p className="text-2xl font-semibold">{earnings?.courses ?? "—"}</p>
        </div>
        <div className="border border-black/10 rounded-card p-4">
          <p className="text-xs text-black/50 mb-1">Total sales</p>
          <p className="text-2xl font-semibold">{earnings?.totalSales ?? "—"}</p>
        </div>
        <div className="border border-black/10 rounded-card p-4">
          <p className="text-xs text-black/50 mb-1">Earnings</p>
          <p className="text-2xl font-semibold">
            {earnings ? `$${earnings.totalEarnings}` : "—"}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">My courses</h2>
      <div className="space-y-2">
        {courses.length === 0 && (
          <p className="text-sm text-black/50">You haven't created any courses yet.</p>
        )}
        {courses.map((c) => (
          <div
            key={c._id}
            className="border border-black/10 rounded-card p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-xs text-black/50 capitalize">
                {c.status} · {c.subject?.name} · {c.enrolledCount} enrolled
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <Link to={`/instructor/courses/${c._id}/edit`} className="underline">
                Edit
              </Link>
              <Link to={`/instructor/courses/${c._id}/students`} className="underline">
                Students
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
