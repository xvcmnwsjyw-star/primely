import express from "express";
import {
  createCheckoutSession,
  getMyOrders,
  verifyOrder,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// NOTE: the webhook route itself is mounted separately in server.js
// because it needs the raw request body, not JSON-parsed.
router.post("/checkout", protect, createCheckoutSession);
router.get("/orders/mine", protect, getMyOrders);
router.get("/orders/:orderId/verify", protect, verifyOrder);

export default router;
