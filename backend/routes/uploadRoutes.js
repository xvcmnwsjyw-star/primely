import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadFile } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Any logged-in user can upload (e.g. avatar, assignment file, course asset).
// Field name on the multipart form must be "file".
router.post("/", protect, upload.single("file"), uploadFile);

export default router;
