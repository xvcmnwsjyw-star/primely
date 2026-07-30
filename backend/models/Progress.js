import mongoose from "mongoose";

// One document per (user, course) pair.
const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessonIds: [{ type: String }], // lesson subdocument _id as string
    lastLessonId: { type: String, default: null },
    percentComplete: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
