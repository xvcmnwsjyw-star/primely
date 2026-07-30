import Comment from "../models/Comment.js";

// GET /api/comments/:courseId/:lessonId
export const getLessonComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      course: req.params.courseId,
      lessonId: req.params.lessonId,
    })
      .populate("user", "name avatarUrl role")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// POST /api/comments/:courseId/:lessonId  { text, parentComment }
export const addComment = async (req, res, next) => {
  try {
    const { text, parentComment } = req.body;
    const comment = await Comment.create({
      course: req.params.courseId,
      lessonId: req.params.lessonId,
      user: req.user._id,
      text,
      parentComment: parentComment || null,
    });
    const populated = await comment.populate("user", "name avatarUrl role");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};
