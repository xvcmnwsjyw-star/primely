import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubjects } from "../store/subjectsSlice.js";
import {
  CalculatorOutlined,
  BookOutlined,
  TranslationOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined,
  HeartOutlined,
  BankOutlined,
  GlobalOutlined,
  ReadOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

// Literal Tailwind class strings — Tailwind's JIT scanner needs the full
// class name present in source, so these can't be built dynamically.
const CARD_STYLE = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  coral: "bg-orange-500",
  pink: "bg-pink-600",
  purple: "bg-purple-700",
  teal: "bg-teal-600",
  amber: "bg-amber-600",
  gray: "bg-slate-600",
};

const ICON_MAP = {
  math: CalculatorOutlined,
  literature: BookOutlined,
  english: TranslationOutlined,
  physics: DeploymentUnitOutlined,
  chemistry: ExperimentOutlined,
  biology: HeartOutlined,
  history: BankOutlined,
  geography: GlobalOutlined,
};

export default function CourseGrid() {
  const dispatch = useDispatch();
  const { items: subjects, status } = useSelector((state) => state.subjects);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  return (
    <section className="px-6 py-10">
      <h2 className="text-lg font-semibold mb-4">Courses by subject</h2>

      {status === "loading" && (
        <p className="text-sm text-black/50">Loading subjects…</p>
      )}

      {status === "failed" && (
        <div className="text-sm text-red-600 flex items-center gap-3">
          <span>Could not load subjects. Is the API running?</span>
          <button
            onClick={() => dispatch(fetchSubjects())}
            className="px-3 py-1 rounded-md border border-red-600 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {status === "idle" && subjects.length === 0 && (
        <p className="text-sm text-black/50">
          No subjects yet — run the seed script on the backend to populate them.
        </p>
      )}

      {subjects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {subjects.map((s) => {
            const SubjectIcon = ICON_MAP[s.slug] || ReadOutlined;
            return (
              <Link
                to={`/courses?subject=${s.slug}`}
                key={s._id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-[3px] border-black text-white p-5 min-h-[300px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform duration-150 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                  CARD_STYLE[s.colorKey] || "bg-slate-600"
                }`}
              >
                {/* icon badge */}
                <div className="w-11 h-11 rounded-xl bg-white/90 flex items-center justify-center text-xl mb-4 relative z-10 text-black">
                  <SubjectIcon />
                </div>

                {/* title + description */}
                <div className="relative z-10 mb-16">
                  <p className="font-bold text-lg mb-2">{s.name}</p>
                  <p className="text-sm text-white/85 leading-snug">{s.description}</p>
                </div>

                {/* decorative mascot blob */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-36 h-20 bg-white/15 rounded-t-full pointer-events-none">
                  <div className="absolute top-6 left-8 w-3 h-4 bg-black rounded-full" />
                  <div className="absolute top-6 right-8 w-3 h-4 bg-black rounded-full" />
                </div>

                {/* badge pill — live count, not a static placeholder */}
                <span className="relative z-10 self-start flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 text-xs font-semibold">
                  {s.lessonCount > 0
                    ? `${s.lessonCount} lesson${s.lessonCount === 1 ? "" : "s"}`
                    : "Coming soon"}
                  <ArrowRightOutlined className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
