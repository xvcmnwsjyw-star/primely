import Review from "../models/Review.js";
import Course from "../models/Course.js";

const recalcCourseRating = async (courseId) => {
  const reviews = await Review.find({ course: courseId });
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  await Course.findByIdAndUpdate(courseId, { rating: Math.round(avg * 10) / 10 });
};

// GET /api/reviews/:courseId
export const getCourseReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId }).populate(
      "user",
      "name avatarUrl"
    );
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews/:courseId  { rating, comment }
export const upsertReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOneAndUpdate(
      { course: req.params.courseId, user: req.user._id },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await recalcCourseRating(req.params.courseId);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};
