import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice.js";
import { UserOutlined, SolutionOutlined, DownOutlined } from "@ant-design/icons";

const ROLES = [
  { value: "student", label: "Student", icon: UserOutlined },
  { value: "instructor", label: "Instructor", icon: SolutionOutlined },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const chooseRole = (role) => {
    setMenuOpen(false);
    navigate(`/signup?role=${role}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const dashboardLink =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "instructor"
      ? "/instructor"
      : "/my-learning";

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-black/10">
      <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
        <span className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-sm">
          P
        </span>
        Primely
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <Link to="/courses" className="hover:underline">
          Courses
        </Link>
        <Link to="/about" className="hover:underline">
          About us
        </Link>

        {user ? (
          <>
            <Link to={dashboardLink} className="hover:underline text-black/70">
              Hi, {user.name}
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full border border-black/20 hover:bg-black/5"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-3 py-1.5 hover:underline">
              Log in
            </Link>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white font-medium hover:bg-neutral-800 transition-colors"
              >
                Sign up <DownOutlined style={{ fontSize: 11 }} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-black/10 rounded-card shadow-lg p-1.5 z-10">
                  <p className="text-xs text-black/50 px-2 pt-1 pb-2">Choose a role</p>
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => chooseRole(r.value)}
                      className="w-full flex items-center gap-2 text-left text-sm px-2 py-2 rounded hover:bg-black/5"
                    >
                      <r.icon />
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
