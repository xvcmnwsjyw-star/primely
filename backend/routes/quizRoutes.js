import express from "express";
import { submitQuiz, getMyAttempts } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:courseId/:lessonId/submit", protect, submitQuiz);
router.get("/:courseId/:lessonId/attempts", protect, getMyAttempts);

export default router;
