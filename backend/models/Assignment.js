import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: String, required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    note: { type: String, default: "" },
    status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
    grade: { type: Number, default: null }, // 0-100
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
