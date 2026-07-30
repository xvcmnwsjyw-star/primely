import axios from "axios";

// In local dev, "/api" works because Vite's dev server proxies it to
// localhost:5000 (see vite.config.js). That proxy doesn't exist once this
// is built and deployed as static files, so production needs the real
// backend URL, supplied via a Vercel environment variable at build time.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 12000, // fail fast instead of spinning forever if the API/DB hangs
});

// Uploaded files (thumbnails, videos, assignment submissions) are stored in
// the database as relative paths like "/uploads/photo.png" — those only
// resolve correctly against the BACKEND's origin, not wherever the
// frontend happens to be hosted. This derives that origin from the same
// VITE_API_URL used above, and leaves already-absolute URLs untouched.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
export const resolveFileUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("primely_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 here means the stored token is missing/expired/signed with an
    // old JWT_SECRET. Clear the stale session and send the user to log in
    // again, rather than leaving a raw "not authorized" message on
    // whatever page they happened to be on.
    if (error.response?.status === 401) {
      localStorage.removeItem("primely_token");
      localStorage.removeItem("primely_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
