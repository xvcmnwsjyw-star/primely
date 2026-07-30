import { Link } from "react-router-dom";
import CourseGrid from "../components/CourseGrid.jsx";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function Home() {
  return (
    <>
      <section className="px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold mb-2">Get a head start</h1>
        <p className="text-black/60 mb-6">
          Primely helps you start learning earlier, and finish stronger.
        </p>
        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-black/90"
        >
          About us <ArrowRightOutlined style={{ fontSize: 12 }} />
        </Link>
      </section>
      <CourseGrid />
    </>
  );
}
