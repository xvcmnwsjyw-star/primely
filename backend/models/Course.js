import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctOptionIndex: { type: Number, required: true },
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["video", "text", "quiz", "assignment"], default: "video" },
  contentUrl: { type: String, default: "" }, // video URL or resource file URL
  textContent: { type: String, default: "" }, // for type "text"
  durationMinutes: { type: Number, default: 0 },
  questions: { type: [quizQuestionSchema], default: undefined }, // for type "quiz"
  passingScore: { type: Number, default: 70 }, // percent, for type "quiz"
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    thumbnailUrl: { type: String, default: "" },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    price: { type: Number, default: 0 },
    sections: [sectionSchema],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
