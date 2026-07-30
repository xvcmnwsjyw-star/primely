import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true }, // in smallest currency unit (e.g. cents)
    currency: { type: String, default: "usd" },
    couponCode: { type: String, default: null },
    stripeSessionId: { type: String, default: null },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
