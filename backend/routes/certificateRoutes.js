import express from "express";
import { getMyCertificates, downloadCertificate } from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, getMyCertificates);
router.get("/:certificateId/download", downloadCertificate);

export default router;
