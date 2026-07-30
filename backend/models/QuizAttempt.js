import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedOption: { type: Number, required: true },
  correct: { type: Boolean, required: true },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: String, required: true },
    answers: [answerSchema],
    score: { type: Number, required: true }, // 0-100
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);
