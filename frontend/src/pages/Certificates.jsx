import { useEffect, useState } from "react";
import BackButton from "../components/BackButton.jsx";
import api from "../api/axios.js";

export default function Certificates() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    api.get("/certificates/mine").then((res) => setCerts(res.data));
  }, []);

  return (
    <section className="px-6 py-10 max-w-2xl mx-auto">
      <BackButton fallback="/my-learning" />
      <h1 className="text-2xl font-semibold mb-6">My certificates</h1>
      {certs.length === 0 && (
        <p className="text-sm text-black/50">
          Complete a course 100% to earn a certificate — it'll show up here.
        </p>
      )}
      <div className="space-y-3">
        {certs.map((c) => (
          <div
            key={c._id}
            className="border border-black/10 rounded-card p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{c.course?.title}</p>
              <p className="text-xs text-black/50">
                Issued {new Date(c.issuedAt).toDateString()}
              </p>
            </div>
            <a
              href={`${import.meta.env.VITE_API_URL || "/api"}/certificates/${c.certificateId}/download`}
              className="px-3 py-1.5 rounded-md bg-black text-white text-sm"
            >
              Download PDF
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
