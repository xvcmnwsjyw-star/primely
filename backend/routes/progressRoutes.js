import express from "express";
import { getProgress, completeLesson, getMyProgress, deleteProgress } from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyProgress);
router.get("/:courseId", protect, getProgress);
router.post("/:courseId/complete-lesson", protect, completeLesson);
router.delete("/:courseId", protect, deleteProgress);

export default router;
