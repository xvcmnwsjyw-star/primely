import User from "../models/User.js";
import Course from "../models/Course.js";
import Order from "../models/Order.js";
import Subject from "../models/Subject.js";

// GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id  { role, banned }
export const updateUser = async (req, res, next) => {
  try {
    const { role, banned } = req.body;
    const update = {};
    if (role) update.role = role;
    if (typeof banned === "boolean") update.banned = banned;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select(
      "-password"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/courses  (every course, any status)
export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("subject", "name")
      .populate("instructor", "name email");
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/courses/:id/status  { status: "published" | "draft" }
export const setCourseStatus = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/courses/:id
export const deleteCourseAsAdmin = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course removed" });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const [userCount, courseCount, subjectCount, paidOrders] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Subject.countDocuments(),
      Order.find({ status: "paid" }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0) / 100;

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.json({
      userCount,
      courseCount,
      subjectCount,
      totalRevenue,
      totalOrders: paidOrders.length,
      usersByRole,
    });
  } catch (err) {
    next(err);
  }
};
