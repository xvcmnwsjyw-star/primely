import Course from "../models/Course.js";
import QuizAttempt from "../models/QuizAttempt.js";

const findLesson = (course, lessonId) => {
  for (const section of course.sections) {
    const lesson = section.lessons.id(lessonId);
    if (lesson) return lesson;
  }
  return null;
};

// POST /api/quizzes/:courseId/:lessonId/submit  { answers: [selectedOptionIndex, ...] }
export const submitQuiz = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { answers } = req.body; // array aligned with question order

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const lesson = findLesson(course, lessonId);
    if (!lesson || lesson.type !== "quiz") {
      return res.status(400).json({ message: "This lesson is not a quiz" });
    }

    const gradedAnswers = lesson.questions.map((q, i) => ({
      questionIndex: i,
      selectedOption: answers[i],
      correct: answers[i] === q.correctOptionIndex,
    }));

    const correctCount = gradedAnswers.filter((a) => a.correct).length;
    const score = Math.round((correctCount / lesson.questions.length) * 100);
    const passed = score >= (lesson.passingScore || 70);

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      course: courseId,
      lessonId,
      answers: gradedAnswers,
      score,
      passed,
    });

    res.status(201).json(attempt);
  } catch (err) {
    next(err);
  }
};

// GET /api/quizzes/:courseId/:lessonId/attempts (current user's attempts)
export const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      course: req.params.courseId,
      lessonId: req.params.lessonId,
    }).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (err) {
    next(err);
  }
};
