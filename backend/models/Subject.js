import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "ti-book" },
    colorKey: {
      type: String,
      enum: ["blue", "green", "coral", "pink", "purple", "teal", "amber", "gray"],
      default: "blue",
    },
    isFree: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
