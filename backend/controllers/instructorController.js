import Course from "../models/Course.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// GET /api/instructor/courses  (only mine)
export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).populate(
      "subject",
      "name colorKey"
    );
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/instructor/courses/:id
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructor: req.user._id });
    if (!course) return res.status(404).json({ message: "Course not found" });
    Object.assign(course, req.body);
    await course.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/instructor/courses/:id
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user._id,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /api/instructor/courses/:id/students
export const getCourseStudents = async (req, res, next) => {
  try {
    const students = await User.find({ enrolledCourses: req.params.id }).select(
      "name email avatarUrl"
    );
    res.json(students);
  } catch (err) {
    next(err);
  }
};

// GET /api/instructor/earnings
export const getEarnings = async (req, res, next) => {
  try {
    const myCourses = await Course.find({ instructor: req.user._id }).select("_id");
    const courseIds = myCourses.map((c) => c._id);

    const orders = await Order.find({ course: { $in: courseIds }, status: "paid" });
    const totalCents = orders.reduce((sum, o) => sum + o.amount, 0);

    res.json({
      totalEarnings: totalCents / 100,
      totalSales: orders.length,
      courses: myCourses.length,
    });
  } catch (err) {
    next(err);
  }
};
