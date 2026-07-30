import express from "express";
import {
  getMyCourses,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  getEarnings,
} from "../controllers/instructorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("instructor", "admin"));

router.get("/courses", getMyCourses);
router.patch("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.get("/courses/:id/students", getCourseStudents);
router.get("/earnings", getEarnings);

export default router;
