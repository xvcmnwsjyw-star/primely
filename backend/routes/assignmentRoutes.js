import express from "express";
import {
  submitAssignment,
  getMyAssignments,
  getCourseAssignments,
  gradeAssignment,
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("student"), submitAssignment);
router.get("/mine", protect, authorize("student"), getMyAssignments);
router.get(
  "/course/:courseId",
  protect,
  authorize("instructor", "admin"),
  getCourseAssignments
);
router.patch("/:id/grade", protect, authorize("instructor", "admin"), gradeAssignment);

export default router;
