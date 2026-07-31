// Run with: npm run seed
// Thin CLI wrapper — the actual seed data/logic lives in seedData.js so it
// can also be triggered over HTTP via /api/dev/seed (see routes/devRoutes.js),
// useful when your host's free tier doesn't include shell access.
import mongoose from "mongoose";
import dotenv from "dotenv";
import { runSeed } from "./seedData.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const summary = await runSeed();
  console.log(
    `Seeded ${summary.subjects} subjects, ${summary.users} demo users, ${summary.courses} courses, ${summary.coupons} coupon.`
  );
  console.log("Login with: admin@primely.com / instructor@primely.com / student@primely.com, all password123");
  process.exit();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
