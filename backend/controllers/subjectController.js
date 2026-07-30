import Subject from "../models/Subject.js";
import Course from "../models/Course.js";

// GET /api/subjects
// Includes a live courseCount/lessonCount per subject, computed from the
// current published courses — so the homepage banners always reflect real
// data instead of a hardcoded "100+" placeholder.
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: 1 }).lean();
    const courses = await Course.find({ status: "published" }).select("subject sections");

    const counts = {}; // subjectId -> { courseCount, lessonCount }
    for (const course of courses) {
      const key = course.subject.toString();
      const lessonCount = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
      if (!counts[key]) counts[key] = { courseCount: 0, lessonCount: 0 };
      counts[key].courseCount += 1;
      counts[key].lessonCount += lessonCount;
    }

    const withCounts = subjects.map((s) => ({
      ...s,
      courseCount: counts[s._id.toString()]?.courseCount || 0,
      lessonCount: counts[s._id.toString()]?.lessonCount || 0,
    }));

    res.json(withCounts);
  } catch (err) {
    next(err);
  }
};

// POST /api/subjects (admin only)
export const createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
};
