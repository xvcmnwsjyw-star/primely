import Progress from "../models/Progress.js";
import Course from "../models/Course.js";
import Certificate from "../models/Certificate.js";
import { v4 as uuidv4 } from "uuid";

const countLessons = (course) =>
  course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

// GET /api/progress/:courseId
export const getProgress = async (req, res, next) => {
  try {
    // Do NOT auto-create here — a progress record should only exist once the
    // user actually enrolls or completes a lesson. Just report what's there.
    const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
    res.json(progress); // null is a valid "not started" response
  } catch (err) {
    next(err);
  }
};

// POST /api/progress/:courseId/complete-lesson  { lessonId, complete? }
// Toggles a lesson's completion state. If `complete` is explicitly passed
// (true/false) it's forced to that state; otherwise it flips the current
// state, so the same endpoint powers both "mark complete" and "undo".
export const completeLesson = async (req, res, next) => {
  try {
    const { lessonId, complete } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    let progress = await Progress.findOne({ user: req.user._id, course: course._id });
    if (!progress) {
      progress = new Progress({ user: req.user._id, course: course._id });
    }

    const alreadyDone = progress.completedLessonIds.includes(lessonId);
    const shouldBeDone = typeof complete === "boolean" ? complete : !alreadyDone;

    if (shouldBeDone && !alreadyDone) {
      progress.completedLessonIds.push(lessonId);
    } else if (!shouldBeDone && alreadyDone) {
      progress.completedLessonIds = progress.completedLessonIds.filter((id) => id !== lessonId);
    }
    progress.lastLessonId = lessonId;

    const total = countLessons(course);
    progress.percentComplete = total
      ? Math.round((progress.completedLessonIds.length / total) * 100)
      : 0;

    if (progress.percentComplete >= 100 && !progress.completedAt) {
      progress.completedAt = new Date();
      // Auto-issue a certificate the first time a course is completed.
      const exists = await Certificate.findOne({ user: req.user._id, course: course._id });
      if (!exists) {
        await Certificate.create({
          certificateId: uuidv4(),
          user: req.user._id,
          course: course._id,
        });
      }
    } else if (progress.percentComplete < 100) {
      // Dropping back below 100% un-marks the "finished" timestamp, but we
      // intentionally leave any already-issued certificate in place — most
      // LMS platforms don't revoke a certificate just because you revisit
      // a lesson afterward.
      progress.completedAt = null;
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    next(err);
  }
};

// GET /api/progress (all of the current user's in-progress/completed courses)
export const getMyProgress = async (req, res, next) => {
  try {
    const list = await Progress.find({ user: req.user._id }).populate(
      "course",
      "title thumbnailUrl"
    );
    // Drop any record whose course was deleted (e.g. re-seeded) — populate
    // leaves `course` as null in that case, which would crash the frontend.
    res.json(list.filter((p) => p.course));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/progress/:courseId — used when a student removes a course
// from their "My learning" list (paired with unenrolling on the course side).
export const deleteProgress = async (req, res, next) => {
  try {
    await Progress.findOneAndDelete({ user: req.user._id, course: req.params.courseId });
    res.json({ message: "Removed from your learning list" });
  } catch (err) {
    next(err);
  }
};
