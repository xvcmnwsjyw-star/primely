import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  unenrollFromCourse,
} from "../controllers/courseController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", protect, authorize("instructor", "admin"), createCourse);
router.post("/:id/enroll", protect, authorize("student"), enrollInCourse);
router.delete("/:id/enroll", protect, authorize("student"), unenrollFromCourse);

export default router;
