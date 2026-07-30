import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../store/coursesSlice.js";
import { fetchSubjects } from "../store/subjectsSlice.js";
import { StarFilled } from "@ant-design/icons";
import { resolveFileUrl } from "../api/axios.js";

// Literal Tailwind class strings per subject color — matches the homepage
// banner palette so the filter pills feel like the same design system.
const PILL_STYLE = {
  blue: { active: "bg-blue-600 text-white border-blue-600", idle: "border-blue-600 text-blue-600 hover:bg-blue-50" },
  green: { active: "bg-green-600 text-white border-green-600", idle: "border-green-600 text-green-600 hover:bg-green-50" },
  coral: { active: "bg-orange-500 text-white border-orange-500", idle: "border-orange-500 text-orange-500 hover:bg-orange-50" },
  pink: { active: "bg-pink-600 text-white border-pink-600", idle: "border-pink-600 text-pink-600 hover:bg-pink-50" },
  purple: { active: "bg-purple-700 text-white border-purple-700", idle: "border-purple-700 text-purple-700 hover:bg-purple-50" },
  teal: { active: "bg-teal-600 text-white border-teal-600", idle: "border-teal-600 text-teal-600 hover:bg-teal-50" },
  amber: { active: "bg-amber-600 text-white border-amber-600", idle: "border-amber-600 text-amber-600 hover:bg-amber-50" },
  gray: { active: "bg-slate-600 text-white border-slate-600", idle: "border-slate-600 text-slate-600 hover:bg-slate-50" },
};

// Subject-colored thumbnail tint + tag pill, so cards are visually grouped
// by subject even without a real thumbnail image.
const THUMB_TINT = {
  blue: "bg-blue-50 text-blue-300",
  green: "bg-green-50 text-green-300",
  coral: "bg-orange-50 text-orange-300",
  pink: "bg-pink-50 text-pink-300",
  purple: "bg-purple-50 text-purple-300",
  teal: "bg-teal-50 text-teal-300",
  amber: "bg-amber-50 text-amber-300",
  gray: "bg-slate-50 text-slate-300",
};

const TAG_STYLE = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  coral: "bg-orange-100 text-orange-700",
  pink: "bg-pink-100 text-pink-700",
  purple: "bg-purple-100 text-purple-700",
  teal: "bg-teal-100 text-teal-700",
  amber: "bg-amber-100 text-amber-700",
  gray: "bg-slate-100 text-slate-700",
};

export default function CourseCatalog() {
  const [params, setParams] = useSearchParams();
  const subjectFilter = params.get("subject") || "";
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();
  const { items: courses, status } = useSelector((state) => state.courses);
  const { items: subjects } = useSelector((state) => state.subjects);

  useEffect(() => {
    dispatch(fetchCourses(subjectFilter || undefined));
  }, [subjectFilter, dispatch]);

  useEffect(() => {
    if (subjects.length === 0) dispatch(fetchSubjects());
  }, [subjects.length, dispatch]);

  const visible = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Browse courses</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          className="px-3 py-2 border border-black/20 rounded-md text-sm w-full sm:w-64"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setParams({})}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
            !subjectFilter
              ? "bg-black text-white border-black"
              : "border-black/20 text-black/70 hover:border-black"
          }`}
        >
          All
        </button>
        {subjects.map((s) => {
          const isActive = subjectFilter === s.slug;
          const style = PILL_STYLE[s.colorKey] || PILL_STYLE.gray;
          return (
            <button
              key={s._id}
              onClick={() => setParams({ subject: s.slug })}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                isActive ? style.active : style.idle
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {status === "loading" && <p className="text-sm text-black/50">Loading courses…</p>}
      {status === "idle" && visible.length === 0 && (
        <p className="text-sm text-black/50">No courses found yet for this filter.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((c) => {
          const tint = THUMB_TINT[c.subject?.colorKey] || "bg-black/5 text-black/30";
          const tag = TAG_STYLE[c.subject?.colorKey] || "bg-black/5 text-black/60";
          return (
            <Link
              key={c._id}
              to={`/courses/${c._id}`}
              className="border border-black/10 rounded-card overflow-hidden hover:border-black transition-colors"
            >
              <div className={`h-32 flex items-center justify-center text-sm ${tint}`}>
                {c.thumbnailUrl ? (
                  <img src={resolveFileUrl(c.thumbnailUrl)} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  "No thumbnail"
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {c.subject?.name && (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${tag}`}>
                      {c.subject.name}
                    </span>
                  )}
                  <span className="text-xs text-black/50 capitalize">{c.level}</span>
                </div>
                <p className="font-medium mb-1">{c.title}</p>
                <p className="text-xs text-black/50 mb-2">by {c.instructor?.name}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {c.price > 0 ? `$${c.price}` : "Free"}
                  </span>
                  <span className="text-black/50">
                    <StarFilled style={{ fontSize: 11 }} /> {c.rating || "—"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
