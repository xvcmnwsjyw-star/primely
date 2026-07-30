import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { refreshUser } from "../store/authSlice.js";
import BackButton from "../components/BackButton.jsx";
import api from "../api/axios.js";

export default function MyLearning() {
  const [progressList, setProgressList] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    api.get("/progress").then((res) => {
      // Belt-and-suspenders: even though the backend filters these out now,
      // never trust the frontend to skip a null check on external data.
      setProgressList(res.data.filter((p) => p.course));
    });
  };

  const handleRemove = async (courseId) => {
    if (!window.confirm("Remove this course from your learning list? Your progress on it will be lost.")) {
      return;
    }
    await api.delete(`/courses/${courseId}/enroll`);
    setProgressList((prev) => prev.filter((p) => p.course._id !== courseId));
    dispatch(refreshUser());
  };

  // Safety net: reconciles any purchase that paid on Stripe's side but
  // never made it back to the success page (closed tab too early, a
  // misconfigured redirect, etc.) by re-checking every unpaid order.
  const syncPurchases = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const { data: orders } = await api.get("/payments/orders/mine");
      const unpaid = orders.filter((o) => o.status !== "paid");

      if (unpaid.length === 0) {
        setSyncMessage("No pending purchases found — everything's already synced.");
        return;
      }

      let completed = 0;
      for (const order of unpaid) {
        const { data } = await api.get(`/payments/orders/${order._id}/verify`);
        if (data.status === "paid") completed += 1;
      }

      setSyncMessage(
        completed > 0
          ? `Synced ${completed} course${completed === 1 ? "" : "s"}.`
          : "Checked your pending purchases — none have completed on Stripe's side yet."
      );

      if (completed > 0) {
        dispatch(refreshUser());
        loadProgress();
      }
    } catch (err) {
      setSyncMessage(err.response?.data?.message || "Couldn't sync purchases right now.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="px-6 py-10 max-w-3xl mx-auto">
      <BackButton fallback="/" />
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">My learning</h1>
        <Link to="/certificates" className="text-sm underline text-black/60">
          View certificates
        </Link>
      </div>

      <div className="mb-6">
        <button
          onClick={syncPurchases}
          disabled={syncing}
          className="text-xs underline text-black/50 disabled:opacity-60"
        >
          {syncing ? "Syncing…" : "Course missing after a purchase? Sync purchases"}
        </button>
        {syncMessage && <p className="text-xs text-black/50 mt-1">{syncMessage}</p>}
      </div>

      {progressList.length === 0 && (
        <p className="text-sm text-black/50">
          You haven't enrolled in any courses yet. <Link to="/courses" className="underline">Browse courses</Link>.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {progressList.map((p) => (
          <div
            key={p._id}
            className="border border-black/10 rounded-card p-4 hover:border-black transition-colors"
          >
            <Link to={`/learn/${p.course._id}`} className="block mb-3">
              <p className="font-medium mb-2">{p.course.title}</p>
              <div className="h-1.5 bg-black/10 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-black"
                  style={{ width: `${p.percentComplete}%` }}
                />
              </div>
              <p className="text-xs text-black/50">{p.percentComplete}% complete</p>
            </Link>
            <button
              onClick={() => handleRemove(p.course._id)}
              className="text-xs text-red-600 hover:underline"
            >
              Remove from my learning
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
