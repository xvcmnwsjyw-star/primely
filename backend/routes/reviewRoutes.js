import express from "express";
import { getCourseReviews, upsertReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:courseId", getCourseReviews);
router.post("/:courseId", protect, upsertReview);

export default router;
