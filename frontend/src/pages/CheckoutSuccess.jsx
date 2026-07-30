import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { refreshUser } from "../store/authSlice.js";
import api from "../api/axios.js";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const orderId = params.get("order");
  const [status, setStatus] = useState("checking"); // checking | paid | pending | error
  const [errorMsg, setErrorMsg] = useState("");

  const verify = useCallback(() => {
    if (!orderId) {
      setStatus("error");
      setErrorMsg("No order ID was found in the URL.");
      return;
    }
    setStatus("checking");
    setErrorMsg("");

    // Ask the backend to check the payment directly with Stripe. This
    // doesn't depend on the webhook having fired — it works whether or not
    // local webhook forwarding is set up.
    api
      .get(`/payments/orders/${orderId}/verify`)
      .then((res) => {
        setStatus(res.data.status === "paid" ? "paid" : "pending");
        if (res.data.status === "paid") dispatch(refreshUser());
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.response?.data?.message || err.message || "Verification request failed.");
      });
  }, [orderId, dispatch]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <section className="px-6 py-20 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-semibold mb-2">Payment successful 🎉</h1>

      {status === "checking" && (
        <p className="text-black/60 mb-6">Confirming your payment…</p>
      )}
      {status === "paid" && (
        <p className="text-black/60 mb-6">
          Order {orderId} is confirmed and you're enrolled — your course is
          ready in My Learning.
        </p>
      )}
      {status === "pending" && (
        <div className="mb-6">
          <p className="text-black/60 mb-3">
            Order {orderId} is still finalizing on Stripe's side.
          </p>
          <button onClick={verify} className="text-sm underline text-black/70">
            Check again
          </button>
        </div>
      )}
      {status === "error" && (
        <div className="mb-6">
          <p className="text-red-600 text-sm mb-1">Couldn't confirm this payment.</p>
          <p className="text-black/50 text-xs mb-3">{errorMsg}</p>
          <button onClick={verify} className="text-sm underline text-black/70">
            Try again
          </button>
        </div>
      )}

      <Link to="/my-learning" className="px-4 py-2 rounded-md bg-black text-white text-sm">
        Go to my learning
      </Link>
    </section>
  );
}
