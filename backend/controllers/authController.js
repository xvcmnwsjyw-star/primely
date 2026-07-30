import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Admin is a fixed, pre-created account (see seed.js / promote via the
    // admin dashboard) — it's never a self-registration option.
    const allowedRoles = ["student", "instructor"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password, role: role || "student" });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrolledCourses: user.enrolledCourses,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.banned) {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrolledCourses: user.enrolledCourses,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user);
};
