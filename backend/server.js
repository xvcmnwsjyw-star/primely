import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { stripeWebhook } from "./controllers/paymentController.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Stripe requires the raw body for signature verification, so this route
// must be registered BEFORE express.json() and cannot use the JSON parser.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Primely API running on port ${PORT}`));
