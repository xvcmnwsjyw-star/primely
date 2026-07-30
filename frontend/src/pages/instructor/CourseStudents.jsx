import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../components/BackButton.jsx";
import api, { resolveFileUrl } from "../../api/axios.js";

export default function CourseStudents() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api.get(`/instructor/courses/${id}/students`).then((res) => setStudents(res.data));
    api.get(`/assignments/course/${id}`).then((res) => setAssignments(res.data));
  }, [id]);

  const grade = async (assignmentId, grade, feedback) => {
    const { data } = await api.patch(`/assignments/${assignmentId}/grade`, { grade, feedback });
    setAssignments(assignments.map((a) => (a._id === data._id ? data : a)));
  };

  return (
    <section className="px-6 py-10 max-w-3xl mx-auto">
      <BackButton fallback="/instructor" />
      <h1 className="text-2xl font-semibold mb-6">Enrolled students</h1>
      <div className="space-y-2 mb-10">
        {students.length === 0 && <p className="text-sm text-black/50">No students enrolled yet.</p>}
        {students.map((s) => (
          <div key={s._id} className="border border-black/10 rounded-card p-3 text-sm">
            {s.name} · {s.email}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Assignment submissions</h2>
      <div className="space-y-3">
        {assignments.length === 0 && <p className="text-sm text-black/50">No submissions yet.</p>}
        {assignments.map((a) => (
          <div key={a._id} className="border border-black/10 rounded-card p-4">
            <p className="text-sm font-medium mb-1">{a.student?.name}</p>
            <p className="text-xs text-black/50 mb-2">{a.note}</p>
            <a href={resolveFileUrl(a.fileUrl)} className="text-sm underline text-black/70">
              View submission
            </a>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number"
                min="0"
                max="100"
                defaultValue={a.grade ?? ""}
                placeholder="Grade"
                className="w-20 border border-black/20 rounded-md text-sm px-2 py-1"
                onBlur={(e) => grade(a._id, Number(e.target.value), a.feedback)}
              />
              <span className="text-xs text-black/50 capitalize">{a.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
