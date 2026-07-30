import express from "express";
import {
  getAllUsers,
  updateUser,
  getAllCourses,
  setCourseStatus,
  deleteCourseAsAdmin,
  getAnalytics,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:id", updateUser);
router.get("/courses", getAllCourses);
router.patch("/courses/:id/status", setCourseStatus);
router.delete("/courses/:id", deleteCourseAsAdmin);
router.get("/analytics", getAnalytics);

export default router;
