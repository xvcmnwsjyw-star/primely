import Assignment from "../models/Assignment.js";

// POST /api/assignments  { courseId, lessonId, fileUrl, note }
export const submitAssignment = async (req, res, next) => {
  try {
    const { courseId, lessonId, fileUrl, note } = req.body;
    const assignment = await Assignment.create({
      course: courseId,
      lessonId,
      student: req.user._id,
      fileUrl,
      note,
    });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};

// GET /api/assignments/mine
export const getMyAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ student: req.user._id }).populate(
      "course",
      "title"
    );
    res.json(assignments);
  } catch (err) {
    next(err);
  }
};

// GET /api/assignments/course/:courseId (instructor: review submissions)
export const getCourseAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId }).populate(
      "student",
      "name email"
    );
    res.json(assignments);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/assignments/:id/grade  { grade, feedback }  (instructor)
export const gradeAssignment = async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, status: "graded" },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (err) {
    next(err);
  }
};
