import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-white/90 px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
      <div>
        <h3 className="font-semibold text-lg mb-2">Primely</h3>
        <p className="text-sm text-white/60 mb-3 leading-relaxed">
          Get a head start. Structured courses, real instructors, and a
          roadmap built for early starters.
        </p>
        <p className="text-sm text-white/60">contact@primely.com</p>
      </div>

      <div>
        <h4 className="font-medium mb-3 text-sm">Courses</h4>
        <ul className="space-y-2 text-sm text-white/60">
          <li>
            <Link to="/courses?subject=math" className="hover:text-blue-400 transition-colors">
              Math
            </Link>
          </li>
          <li>
            <Link to="/courses?subject=literature" className="hover:text-pink-400 transition-colors">
              Literature
            </Link>
          </li>
          <li>
            <Link to="/courses?subject=english" className="hover:text-orange-400 transition-colors">
              English
            </Link>
          </li>
          <li>
            <Link to="/courses?subject=physics" className="hover:text-purple-400 transition-colors">
              Physics
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-medium mb-3 text-sm">Free resources</h4>
        <ul className="space-y-2 text-sm text-white/60">
          <li>Study roadmap</li>
          <li>Resource library</li>
          <li>Community forum</li>
        </ul>
      </div>

      <div>
        <h4 className="font-medium mb-3 text-sm">Newsletter</h4>
        <form className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-3 py-2 rounded-md text-sm text-black"
          />
          <button className="px-3 py-2 rounded-md bg-white text-black text-sm hover:bg-neutral-200 transition-colors">
            Send
          </button>
        </form>
      </div>
    </footer>
  );
}
