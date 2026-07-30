import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById } from "../store/coursesSlice.js";
import { fetchProgress, completeLesson } from "../store/progressSlice.js";
import BackButton from "../components/BackButton.jsx";
import { CheckCircleFilled, BorderOutlined } from "@ant-design/icons";
import api, { resolveFileUrl } from "../api/axios.js";

export default function CoursePlayer() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const course = useSelector((state) => state.courses.current);
  const progress = useSelector((state) => state.progress.current);

  const [activeLesson, setActiveLesson] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentNote, setAssignmentNote] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState("");

  useEffect(() => {
    dispatch(fetchCourseById(id));
    dispatch(fetchProgress(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (course && !activeLesson) {
      const first = course.sections?.[0]?.lessons?.[0];
      if (first) setActiveLesson(first);
    }
  }, [course, activeLesson]);

  useEffect(() => {
    if (activeLesson) {
      setQuizResult(null);
      setAnswers({});
      api
        .get(`/comments/${id}/${activeLesson._id}`)
        .then((res) => setComments(res.data))
        .catch(() => setComments([]));
    }
  }, [activeLesson, id]);

  const isComplete = (lessonId) => progress?.completedLessonIds?.includes(lessonId);

  // Same endpoint toggles: complete -> incomplete -> complete again.
  const toggleComplete = () => {
    dispatch(completeLesson({ courseId: id, lessonId: activeLesson._id }));
  };

  const submitQuiz = async () => {
    const ordered = activeLesson.questions.map((_, i) => answers[i]);
    const { data } = await api.post(`/quizzes/${id}/${activeLesson._id}/submit`, {
      answers: ordered,
    });
    setQuizResult(data);
    if (data.passed && !isComplete(activeLesson._id)) toggleComplete();
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentFile) return;
    const form = new FormData();
    form.append("file", assignmentFile);
    const { data: uploaded } = await api.post("/uploads", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await api.post("/assignments", {
      courseId: id,
      lessonId: activeLesson._id,
      fileUrl: uploaded.url,
      note: assignmentNote,
    });
    setAssignmentMessage("Submitted! Your instructor will review and grade it.");
    if (!isComplete(activeLesson._id)) toggleComplete();
  };

  const postComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await api.post(`/comments/${id}/${activeLesson._id}`, {
      text: commentText,
    });
    setComments([...comments, data]);
    setCommentText("");
  };

  if (!course) return <p className="px-6 py-10 text-sm text-black/50">Loading course…</p>;

  return (
    <section className="flex flex-col lg:flex-row">
      <aside className="lg:w-72 border-r border-black/10 p-4">
        <BackButton fallback={`/courses/${id}`} />
        <p className="font-semibold mb-3">{course.title}</p>
        <p className="text-xs text-black/50 mb-4">{progress?.percentComplete || 0}% complete</p>
        {course.sections.map((section, i) => (
          <div key={i} className="mb-4">
            <p className="text-xs uppercase text-black/40 mb-1">{section.title}</p>
            {section.lessons.map((lesson) => (
              <button
                key={lesson._id}
                onClick={() => setActiveLesson(lesson)}
                className={`w-full text-left px-2 py-2 rounded text-sm flex items-center gap-2 ${
                  activeLesson?._id === lesson._id ? "bg-black/10" : "hover:bg-black/5"
                }`}
              >
                <span className={isComplete(lesson._id) ? "text-green-600" : "text-black/30"}>
                  {isComplete(lesson._id) ? <CheckCircleFilled /> : <BorderOutlined />}
                </span>
                {lesson.title}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <div className="flex-1 p-6 max-w-2xl">
        {activeLesson && (
          <>
            <h2 className="text-xl font-semibold mb-4">{activeLesson.title}</h2>

            {activeLesson.type === "video" && (
              <div className="aspect-video bg-black/10 rounded-card flex items-center justify-center text-black/40 mb-4">
                {activeLesson.contentUrl ? (
                  <video src={resolveFileUrl(activeLesson.contentUrl)} controls className="w-full h-full rounded-card" />
                ) : (
                  "Video placeholder"
                )}
              </div>
            )}

            {activeLesson.type === "text" && (
              <div className="prose text-sm text-black/80 mb-4 whitespace-pre-wrap">
                {activeLesson.textContent || "No content yet."}
              </div>
            )}

            {activeLesson.type === "quiz" && (
              <div className="space-y-4 mb-4">
                {activeLesson.questions?.map((q, qi) => (
                  <div key={qi} className="border border-black/10 rounded-card p-3">
                    <p className="text-sm font-medium mb-2">{q.question}</p>
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2 text-sm mb-1">
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={answers[qi] === oi}
                          onChange={() => setAnswers({ ...answers, [qi]: oi })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ))}
                <button
                  onClick={submitQuiz}
                  className="px-4 py-2 rounded-md bg-black text-white text-sm"
                >
                  Submit quiz
                </button>
                {quizResult && (
                  <div className="flex items-center gap-3">
                    <p className={`text-sm ${quizResult.passed ? "text-green-600" : "text-red-600"}`}>
                      Score: {quizResult.score}% — {quizResult.passed ? "Passed 🎉" : "Try again"}
                    </p>
                    {isComplete(activeLesson._id) && (
                      <button onClick={toggleComplete} className="text-xs underline text-black/50">
                        Mark as incomplete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeLesson.type === "assignment" && (
              <form onSubmit={submitAssignment} className="space-y-3 mb-4">
                <input
                  type="file"
                  onChange={(e) => setAssignmentFile(e.target.files[0])}
                  className="text-sm"
                />
                <textarea
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="Notes for your instructor (optional)"
                  className="w-full border border-black/20 rounded-md text-sm p-2"
                  rows={3}
                />
                <button className="px-4 py-2 rounded-md bg-black text-white text-sm">
                  Submit assignment
                </button>
                {assignmentMessage && (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-green-600">{assignmentMessage}</p>
                    {isComplete(activeLesson._id) && (
                      <button onClick={toggleComplete} className="text-xs underline text-black/50">
                        Mark as incomplete
                      </button>
                    )}
                  </div>
                )}
              </form>
            )}

            {activeLesson.type !== "quiz" && activeLesson.type !== "assignment" && (
              <button
                onClick={toggleComplete}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm mb-8 border transition-colors ${
                  isComplete(activeLesson._id)
                    ? "bg-white text-black border-black hover:bg-black hover:text-white"
                    : "bg-black text-white border-black hover:bg-neutral-800"
                }`}
              >
                {isComplete(activeLesson._id) ? (
                  <>
                    <CheckCircleFilled /> Completed — click to undo
                  </>
                ) : (
                  "Mark as complete"
                )}
              </button>
            )}

            <h3 className="text-sm font-semibold mt-8 mb-3">Discussion</h3>
            <div className="space-y-2 mb-3">
              {comments.map((c) => (
                <div key={c._id} className="text-sm border-b border-black/10 pb-2">
                  <span className="font-medium">{c.user?.name}</span>{" "}
                  <span className="text-black/60">{c.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 border border-black/20 rounded-md text-sm px-3 py-2"
              />
              <button onClick={postComment} className="px-3 py-2 rounded-md bg-black/10 text-sm">
                Post
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
