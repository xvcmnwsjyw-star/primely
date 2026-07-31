// Shared seed logic — used by both seed.js (CLI: `npm run seed`) and the
// /api/dev/seed route (for populating a production database when you can't
// get a shell on your hosting provider's free tier).
import Subject from "./models/Subject.js";
import User from "./models/User.js";
import Course from "./models/Course.js";
import Coupon from "./models/Coupon.js";

const subjects = [
  { name: "Math", slug: "math", icon: "ti-calculator", colorKey: "blue", description: "Sharpen problem-solving with clear, step-by-step lessons from basics to advanced topics." },
  { name: "Literature", slug: "literature", icon: "ti-book", colorKey: "pink", description: "Explore great works and build strong reading and analysis skills." },
  { name: "English", slug: "english", icon: "ti-abc", colorKey: "coral", description: "Build vocabulary, grammar, and confident everyday communication." },
  { name: "Physics", slug: "physics", icon: "ti-atom", colorKey: "purple", description: "Understand the laws that shape our universe, from motion to energy." },
  { name: "Chemistry", slug: "chemistry", icon: "ti-flask", colorKey: "gray", description: "Explore reactions, elements, and the building blocks of matter." },
  { name: "Biology", slug: "biology", icon: "ti-leaf", colorKey: "green", description: "Discover how living things grow, adapt, and connect to each other." },
  { name: "History", slug: "history", icon: "ti-history", colorKey: "amber", description: "Understand the events and people that shaped the world we live in." },
  { name: "Geography", slug: "geography", icon: "ti-world", colorKey: "teal", description: "Learn about the world's places, people, and environments.", isFree: true },
];

export const runSeed = async () => {
  await Promise.all([
    Subject.deleteMany({}),
    User.deleteMany({ email: { $in: ["admin@primely.com", "instructor@primely.com", "student@primely.com"] } }),
    Course.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  const createdSubjects = await Subject.insertMany(subjects);
  const math = createdSubjects.find((s) => s.slug === "math");
  const geography = createdSubjects.find((s) => s.slug === "geography");
  const bySlug = (slug) => createdSubjects.find((s) => s.slug === slug);

  // Passwords are hashed automatically by the User model's pre-save hook.
  await User.create({
    name: "Primely Admin",
    email: "admin@primely.com",
    password: "password123",
    role: "admin",
  });

  const instructor = await User.create({
    name: "Jane Instructor",
    email: "instructor@primely.com",
    password: "password123",
    role: "instructor",
  });

  await User.create({
    name: "Sam Student",
    email: "student@primely.com",
    password: "password123",
    role: "student",
  });

  await Course.create({
    title: "Algebra Fundamentals",
    description: "Build core algebra skills with a quick graded quiz.",
    subject: math._id,
    instructor: instructor._id,
    level: "beginner",
    price: 29,
    status: "published",
    sections: [
      {
        title: "Getting started",
        lessons: [
          {
            title: "Quick knowledge check",
            type: "quiz",
            passingScore: 70,
            questions: [
              {
                question: "What is x in the equation x + 5 = 12?",
                options: ["5", "7", "12", "17"],
                correctOptionIndex: 1,
              },
              {
                question: "What is the correct order of operations?",
                options: ["Addition first, always", "Left to right only", "Parentheses, exponents, multiplication/division, addition/subtraction", "Random order"],
                correctOptionIndex: 2,
              },
            ],
          },
        ],
      },
    ],
  });

  await Course.create({
    title: "Intro to World Geography",
    description: "A free, self-paced introduction to continents and oceans.",
    subject: geography._id,
    instructor: instructor._id,
    level: "beginner",
    price: 0,
    status: "published",
    sections: [
      {
        title: "Explore the world",
        lessons: [
          { title: "Continents and oceans", type: "text", textContent: "An overview of the seven continents and five oceans, and how they connect." },
        ],
      },
    ],
  });

  // One quick starter course per remaining subject, so every homepage
  // banner shows a real, non-zero lesson count instead of "Coming soon."
  const starterCourses = [
    {
      slug: "literature",
      title: "Introduction to Literature",
      description: "A first look at how to read and think about great works of fiction.",
      lessonTitle: "What is literature?",
      lessonText: "Literature is writing valued for its artistic and intellectual merit — stories, poems, and plays that explore the human experience.",
    },
    {
      slug: "english",
      title: "English Basics",
      description: "The building blocks of clear, confident English.",
      lessonTitle: "Parts of speech overview",
      lessonText: "Every English sentence is built from a small set of word types: nouns, verbs, adjectives, adverbs, pronouns, and more.",
    },
    {
      slug: "physics",
      title: "Physics Basics",
      description: "An entry point into how physicists describe the world.",
      lessonTitle: "What is physics?",
      lessonText: "Physics is the study of matter, energy, and the forces that connect them — from falling apples to orbiting planets.",
    },
    {
      slug: "chemistry",
      title: "Chemistry Basics",
      description: "Get comfortable with the periodic table and basic reactions.",
      lessonTitle: "Intro to the periodic table",
      lessonText: "The periodic table organizes every known element by atomic number, revealing patterns in how they behave and react.",
    },
    {
      slug: "biology",
      title: "Biology Basics",
      description: "The fundamentals of what makes something alive.",
      lessonTitle: "What is a cell?",
      lessonText: "The cell is the basic unit of life — every living organism is made of one or more cells that carry out life's processes.",
    },
    {
      slug: "history",
      title: "History Basics",
      description: "Why studying the past helps us understand the present.",
      lessonTitle: "Why we study history",
      lessonText: "History helps us understand how societies, ideas, and events connect across time to shape the world we live in today.",
    },
  ];

  for (const c of starterCourses) {
    await Course.create({
      title: c.title,
      description: c.description,
      subject: bySlug(c.slug)._id,
      instructor: instructor._id,
      level: "beginner",
      price: 19,
      status: "published",
      sections: [
        {
          title: "Getting started",
          lessons: [{ title: c.lessonTitle, type: "text", textContent: c.lessonText }],
        },
      ],
    });
  }

  await Coupon.create({ code: "PRIMELY10", percentOff: 10, active: true });

  return { subjects: 8, users: 3, courses: 8, coupons: 1 };
};
