import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById } from "../store/coursesSlice.js";
import { refreshUser } from "../store/authSlice.js";
import BackButton from "../components/BackButton.jsx";
import { StarFilled } from "@ant-design/icons";
import api from "../api/axios.js";

export default function CourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const course = useSelector((state) => state.courses.current);
  const user = useSelector((state) => state.auth.user);

  const [reviews, setReviews] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchCourseById(id));
    api.get(`/reviews/${id}`).then((res) => setReviews(res.data)).catch(() => {});
  }, [id, dispatch]);

  const isEnrolled = user?.enrolledCourses?.includes(id);

  const handleEnroll = async () => {
    if (!user) return navigate(`/login`);
    setEnrolling(true);
    setMessage("");
    try {
      if (course.price > 0) {
        const { data } = await api.post("/payments/checkout", { courseId: id });
        window.location.href = data.url;
      } else {
        await api.post(`/courses/${id}/enroll`);
        await dispatch(refreshUser());
        setMessage("Enrolled! Head to your dashboard to start learning.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not enroll right now");
    } finally {
      setEnrolling(false);
    }
  };

  if (!course) return <p className="px-6 py-10 text-sm text-black/50">Loading course…</p>;

  const totalLessons = course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) || 0;

  return (
    <section className="px-6 py-10 max-w-3xl mx-auto">
      <BackButton fallback="/courses" />
      <p className="text-xs text-black/50 mb-1 capitalize">{course.level} · {course.subject?.name}</p>
      <h1 className="text-2xl font-semibold mb-2">{course.title}</h1>
      <p className="text-black/60 mb-4">{course.description}</p>
      <p className="text-sm text-black/50 mb-6">
        Taught by {course.instructor?.name} · {totalLessons} lessons ·{" "}
        <StarFilled style={{ color: "#000", fontSize: 12 }} /> {course.rating || "No ratings yet"}
      </p>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-xl font-semibold">
          {course.price > 0 ? `$${course.price}` : "Free"}
        </span>
        {isEnrolled ? (
          <Link
            to={`/learn/${course._id}`}
            className="px-4 py-2 rounded-md bg-black text-white text-sm"
          >
            Continue learning
          </Link>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-4 py-2 rounded-md bg-black text-white text-sm disabled:opacity-60 hover:bg-neutral-800 transition-colors"
          >
            {enrolling ? "Please wait…" : course.price > 0 ? "Buy course" : "Enroll for free"}
          </button>
        )}
      </div>
      {message && <p className="text-sm text-black/70 mb-6">{message}</p>}

      <h2 className="text-lg font-semibold mb-3">Curriculum</h2>
      <div className="space-y-3 mb-10">
        {course.sections?.map((section, i) => (
          <div key={i} className="border border-black/10 rounded-card p-4">
            <p className="font-medium mb-2">{section.title}</p>
            <ul className="text-sm text-black/60 space-y-1">
              {section.lessons.map((lesson) => (
                <li key={lesson._id} className="flex items-center gap-2">
                  <span className="text-xs uppercase text-black/30">{lesson.type}</span>
                  {lesson.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Reviews</h2>
      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-sm text-black/50">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="border-b border-black/10 pb-3">
            <p className="text-sm font-medium">
              {r.user?.name} · <StarFilled style={{ fontSize: 11 }} /> {r.rating}
            </p>
            <p className="text-sm text-black/60">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
