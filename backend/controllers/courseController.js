import mongoose from "mongoose";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import Progress from "../models/Progress.js";

// GET /api/courses?subject=slug
export const getCourses = async (req, res, next) => {
  try {
    const filter = { status: "published" };

    if (req.query.subject) {
      // Accept either a subject slug (used by the catalog UI) or a raw
      // ObjectId (used by internal calls), so both keep working.
      if (mongoose.Types.ObjectId.isValid(req.query.subject)) {
        filter.subject = req.query.subject;
      } else {
        const subjectDoc = await Subject.findOne({ slug: req.query.subject });
        filter.subject = subjectDoc ? subjectDoc._id : null; // null -> no results, not an error
      }
    }

    const courses = await Course.find(filter)
      .populate("subject", "name slug colorKey icon")
      .populate("instructor", "name");
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:id
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("subject", "name slug colorKey icon")
      .populate("instructor", "name");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

// POST /api/courses (instructor/admin only)
export const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user._id });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

// POST /api/courses/:id/enroll (student)
export const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.enrolledCount += 1;
    await course.save();

    req.user.enrolledCourses.addToSet(course._id);
    await req.user.save();

    // Enrollment is the moment "my learning" should start tracking this
    // course — not just visiting the page. Upsert avoids duplicate records
    // if the student enrolls twice.
    await Progress.findOneAndUpdate(
      { user: req.user._id, course: course._id },
      {},
      { upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/courses/:id/enroll — remove a course from "my learning"
export const unenrollFromCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    req.user.enrolledCourses.pull(course._id);
    await req.user.save();

    if (course.enrolledCount > 0) {
      course.enrolledCount -= 1;
      await course.save();
    }

    await Progress.findOneAndDelete({ user: req.user._id, course: course._id });

    res.json({ message: "Removed from your learning list" });
  } catch (err) {
    next(err);
  }
};
