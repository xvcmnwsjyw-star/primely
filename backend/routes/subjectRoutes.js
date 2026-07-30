import express from "express";
import { getSubjects, createSubject } from "../controllers/subjectController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSubjects);
router.post("/", protect, authorize("admin"), createSubject);

export default router;
