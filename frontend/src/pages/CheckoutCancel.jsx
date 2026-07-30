import { Link } from "react-router-dom";

export default function CheckoutCancel() {
  return (
    <section className="px-6 py-20 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-semibold mb-2">Checkout cancelled</h1>
      <p className="text-black/60 mb-6">No charge was made. You can try again anytime.</p>
      <Link to="/courses" className="px-4 py-2 rounded-md bg-black text-white text-sm">
        Back to courses
      </Link>
    </section>
  );
}
