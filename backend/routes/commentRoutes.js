import express from "express";
import { getLessonComments, addComment } from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:courseId/:lessonId", getLessonComments);
router.post("/:courseId/:lessonId", protect, addComment);

export default router;
