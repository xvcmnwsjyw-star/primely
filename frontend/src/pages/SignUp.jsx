import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../store/authSlice.js";

const ROLES = ["student", "instructor"];

export default function SignUp() {
  const [params] = useSearchParams();
  const initialRole = ROLES.includes(params.get("role")) ? params.get("role") : "student";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) navigate("/");
  };

  return (
    <section className="px-6 py-16 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">I am a</label>
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 px-2 py-2 rounded-md text-sm border capitalize ${
                  form.role === r
                    ? "bg-black text-white border-black"
                    : "border-black/20 text-black/70"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-black/20 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-black/20 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-black/20 rounded-md text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={status === "loading"}
          className="w-full py-2 rounded-md bg-black text-white text-sm font-medium disabled:opacity-60 hover:bg-neutral-800 transition-colors"
        >
          {status === "loading" ? "Creating account…" : `Sign up as ${form.role}`}
        </button>

        <p className="text-sm text-black/60 text-center">
          Already have an account? <Link to="/login" className="underline">Log in</Link>
        </p>
      </form>
    </section>
  );
}
