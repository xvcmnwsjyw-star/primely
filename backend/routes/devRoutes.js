import express from "express";
import { runSeed } from "../seedData.js";

const router = express.Router();

// GET /api/dev/seed?key=...
// One-time convenience for populating a production database on hosts
// (like Render's free tier) that don't offer a shell. Protected by a
// secret set via the SEED_SECRET env var — never auth-gated by a user
// account, since the very first run has no users yet to log in as.
router.get("/seed", async (req, res, next) => {
  try {
    if (!process.env.SEED_SECRET) {
      return res.status(403).json({ message: "SEED_SECRET is not configured on the server" });
    }
    if (req.query.key !== process.env.SEED_SECRET) {
      return res.status(403).json({ message: "Invalid key" });
    }

    const summary = await runSeed();
    res.json({ message: "Seed complete", ...summary });
  } catch (err) {
    next(err);
  }
});

export default router;
