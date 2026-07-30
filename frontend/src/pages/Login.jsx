import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { status, error } = useSelector((state) => state.auth);
  const expired = params.get("expired") === "1";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate("/");
  };

  return (
    <section className="px-6 py-16 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Log in</h1>
      {expired && (
        <p className="text-sm bg-black/5 border border-black/10 rounded-md px-3 py-2 mb-4">
          Your session ended — log in again to continue.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-3 py-2 border border-black/20 rounded-md text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={status === "loading"}
          className="w-full py-2 rounded-md bg-black text-white text-sm font-medium disabled:opacity-60"
        >
          {status === "loading" ? "Logging in…" : "Log in"}
        </button>
        <p className="text-sm text-black/60 text-center">
          No account? <Link to="/signup" className="underline">Sign up</Link>
        </p>
      </form>
    </section>
  );
}
