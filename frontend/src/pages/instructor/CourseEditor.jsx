import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton.jsx";
import api, { resolveFileUrl } from "../../api/axios.js";

const emptyLesson = () => ({
  title: "",
  type: "video",
  contentUrl: "",
  textContent: "",
  durationMinutes: 0,
  questions: [],
  passingScore: 70,
});

const emptyCourse = () => ({
  title: "",
  description: "",
  subject: "",
  level: "beginner",
  price: 0,
  thumbnailUrl: "",
  status: "draft",
  sections: [{ title: "Section 1", lessons: [emptyLesson()] }],
});

export default function CourseEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [course, setCourse] = useState(emptyCourse());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/subjects").then((res) => setSubjects(res.data));
    if (isEdit) {
      api.get(`/courses/${id}`).then((res) =>
        setCourse({ ...res.data, subject: res.data.subject?._id || "" })
      );
    }
  }, [id, isEdit]);

  const updateField = (field, value) => setCourse({ ...course, [field]: value });

  const updateSection = (i, field, value) => {
    const sections = [...course.sections];
    sections[i][field] = value;
    setCourse({ ...course, sections });
  };

  const updateLesson = (si, li, field, value) => {
    const sections = [...course.sections];
    sections[si].lessons[li][field] = value;
    setCourse({ ...course, sections });
  };

  const addSection = () =>
    setCourse({
      ...course,
      sections: [...course.sections, { title: `Section ${course.sections.length + 1}`, lessons: [emptyLesson()] }],
    });

  const addLesson = (si) => {
    const sections = [...course.sections];
    sections[si].lessons.push(emptyLesson());
    setCourse({ ...course, sections });
  };

  const removeLesson = (si, li) => {
    const sections = [...course.sections];
    sections[si].lessons.splice(li, 1);
    setCourse({ ...course, sections });
  };

  const uploadThumbnail = async (file) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/uploads", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    updateField("thumbnailUrl", data.url);
  };

  const handleSave = async (status) => {
    setSaving(true);
    setMessage("");
    const payload = { ...course, status };
    try {
      if (isEdit) {
        await api.patch(`/instructor/courses/${id}`, payload);
      } else {
        await api.post("/courses", payload);
      }
      navigate("/instructor");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="px-6 py-10 max-w-3xl mx-auto">
      <BackButton fallback="/instructor" />
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Edit course" : "Create a new course"}
      </h1>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            value={course.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full border border-black/20 rounded-md text-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={course.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full border border-black/20 rounded-md text-sm px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Subject</label>
            <select
              value={course.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              className="w-full border border-black/20 rounded-md text-sm px-3 py-2"
            >
              <option value="">Select…</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Level</label>
            <select
              value={course.level}
              onChange={(e) => updateField("level", e.target.value)}
              className="w-full border border-black/20 rounded-md text-sm px-3 py-2"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Price (USD)</label>
            <input
              type="number"
              min="0"
              value={course.price}
              onChange={(e) => updateField("price", Number(e.target.value))}
              className="w-full border border-black/20 rounded-md text-sm px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Thumbnail</label>
          <input type="file" accept="image/*" onChange={(e) => uploadThumbnail(e.target.files[0])} />
          {course.thumbnailUrl && (
            <img src={resolveFileUrl(course.thumbnailUrl)} alt="" className="mt-2 h-24 rounded-md object-cover" />
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Curriculum</h2>
      <div className="space-y-4 mb-6">
        {course.sections.map((section, si) => (
          <div key={si} className="border border-black/10 rounded-card p-4">
            <input
              value={section.title}
              onChange={(e) => updateSection(si, "title", e.target.value)}
              className="w-full font-medium text-sm border-b border-black/10 pb-2 mb-3 focus:outline-none"
            />
            <div className="space-y-3">
              {section.lessons.map((lesson, li) => (
                <div key={li} className="bg-black/5 rounded-md p-3">
                  <div className="flex gap-2 mb-2">
                    <input
                      value={lesson.title}
                      onChange={(e) => updateLesson(si, li, "title", e.target.value)}
                      placeholder="Lesson title"
                      className="flex-1 border border-black/20 rounded-md text-sm px-2 py-1.5"
                    />
                    <select
                      value={lesson.type}
                      onChange={(e) => updateLesson(si, li, "type", e.target.value)}
                      className="border border-black/20 rounded-md text-sm px-2 py-1.5"
                    >
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                    </select>
                    <button
                      onClick={() => removeLesson(si, li)}
                      className="text-xs text-red-500 px-2"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>

                  {lesson.type === "video" && (
                    <input
                      value={lesson.contentUrl}
                      onChange={(e) => updateLesson(si, li, "contentUrl", e.target.value)}
                      placeholder="Video URL (or upload below)"
                      className="w-full border border-black/20 rounded-md text-sm px-2 py-1.5"
                    />
                  )}

                  {lesson.type === "text" && (
                    <textarea
                      value={lesson.textContent}
                      onChange={(e) => updateLesson(si, li, "textContent", e.target.value)}
                      placeholder="Lesson content"
                      rows={3}
                      className="w-full border border-black/20 rounded-md text-sm px-2 py-1.5"
                    />
                  )}

                  {lesson.type === "quiz" && (
                    <p className="text-xs text-black/50">
                      Quiz questions can be added via the API for now — full builder UI coming soon.
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => addLesson(si)}
              type="button"
              className="mt-3 text-sm underline text-black/60"
            >
              + Add lesson
            </button>
          </div>
        ))}
      </div>
      <button onClick={addSection} type="button" className="text-sm underline text-black/60 mb-8">
        + Add section
      </button>

      {message && <p className="text-sm text-red-600 mb-4">{message}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="px-4 py-2 rounded-md border border-black/20 text-sm"
        >
          Save as draft
        </button>
        <button
          onClick={() => handleSave("published")}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
        >
          {saving ? "Saving…" : "Publish"}
        </button>
      </div>
    </section>
  );
}
