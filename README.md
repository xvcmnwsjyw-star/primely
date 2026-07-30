# Primely

A full-stack LMS: role-based sign up (student / instructor — admin is a
fixed account), courses grouped by subject, video/text/quiz/assignment
lessons, progress tracking, certificates, reviews, payments, and
instructor/admin dashboards.

## Stack
- **Backend:** Node, Express, MongoDB (Mongoose), JWT auth, bcrypt, Multer (uploads), Stripe, PDFKit (certificates)
- **Frontend:** React (Vite), Redux Toolkit, React Router, Tailwind CSS, Axios

## Project structure
```
primely/
  backend/
    config/db.js
    models/         User, Subject, Course, Progress, QuizAttempt, Assignment,
                     Review, Comment, Order, Coupon, Certificate
    controllers/     One per resource (auth, course, subject, upload,
                     progress, quiz, assignment, review, comment,
                     certificate, payment, instructor, admin)
    routes/          Matching /api/* routes
    middleware/      JWT auth + role authorize(), multer upload, error handling
    uploads/          Uploaded files served at /uploads/<filename>
    seed.js           Seeds subjects, demo users, 2 sample courses, a coupon
    Dockerfile
  frontend/
    src/components/  Navbar, Footer, CourseGrid, ProtectedRoute
    src/pages/        Home, About, Courses catalog/detail, Course player,
                       Sign up, Login, My learning, Certificates, Checkout
    src/pages/instructor/  Dashboard, course editor, students/grading
    src/pages/admin/        Dashboard, manage users, manage courses
    src/store/        Redux Toolkit slices: auth, subjects, courses, progress
    vercel.json
  docker-compose.yml  Local Mongo + backend for quick dev
```

## Getting started (local dev)

### Option A — Docker Compose (backend + MongoDB)
```bash
docker compose up --build
# backend now running on http://localhost:5000 with a local MongoDB
```
Then seed it once:
```bash
docker compose exec backend node seed.js
```

### Option B — manual
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI (local or MongoDB Atlas) and JWT_SECRET
npm run dev             # http://localhost:5000
npm run seed             # one-time: subjects + demo users + sample courses
```

### Frontend (either option)
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api to :5000
```

### Demo logins (after running the seed script)
| Role       | Email                  | Password    |
|------------|-------------------------|-------------|
| Admin      | admin@primely.com       | password123 |
| Instructor | instructor@primely.com  | password123 |
| Student    | student@primely.com     | password123 |

The seed script also creates 8 core school subjects (Math, Literature,
English, Physics, Chemistry, Biology, History, Geography) and 2 sample
courses — a paid "Algebra Fundamentals" course with a graded quiz, and a
free "Intro to World Geography" — so there's real data to click through
immediately.

## Feature checklist

**Auth & roles**
- [x] Register/login, JWT, bcrypt hashing
- [x] Role picker at sign-up (student / instructor only — **admin is a fixed
      account, not self-registerable**; see demo logins below, or promote a
      user to admin from the admin dashboard)
- [x] Role-based route protection (backend middleware + frontend `ProtectedRoute`)
- [x] Admin can promote/demote roles and ban/unban users

**Courses & content**
- [x] Course model with sections → lessons (video / text / quiz / assignment)
- [x] Instructor course editor (create, edit, publish/draft, curriculum builder)
- [x] File upload (thumbnails, videos, assignment submissions) via Multer
- [x] Course catalog with subject filter + search
- [x] Course detail page with curriculum, price, reviews
- [x] Homepage subject banners — black/white by default, hover into that
      subject's color, click straight through to its filtered course list

**Learning experience**
- [x] Progress tracking per lesson, percent-complete per course
- [x] Lesson completion is a toggle — mark complete, then undo it again
- [x] Remove a course from "My learning" (unenrolls + clears progress)
- [x] Quiz auto-grading with pass/fail threshold
- [x] Assignment submission + instructor grading/feedback
- [x] Per-lesson discussion comments
- [x] Course reviews & ratings (auto-averaged on the course)
- [x] Certificates auto-issued at 100% completion, downloadable as a real PDF

**Payments**
- [x] Stripe Checkout session creation
- [x] Webhook that marks orders paid and auto-enrolls the student
- [x] Coupon codes (percent-off)
- [x] Free courses skip payment and enroll directly

**Dashboards**
- [x] Instructor: my courses, earnings, enrolled students, assignment grading
- [x] Admin: platform analytics, user management, course moderation

**State & infra**
- [x] Redux Toolkit (auth, subjects, courses, progress slices) — replaces earlier Context-based auth
- [x] Dockerfile (backend) + docker-compose for local dev
- [x] vercel.json for frontend static deploy
- [x] Black-and-white visual theme with per-subject hover colors
- [x] Request timeout + retry on the subject/course fetch, so a stalled DB
      connection shows a "Retry" button instead of spinning forever

## What still needs *your* credentials to go fully live
This is all real, working code — but a few pieces need accounts only you can create:
- **MongoDB Atlas** (or any hosted Mongo) connection string for production
- **Stripe** live API keys + a webhook endpoint registered in the Stripe dashboard
- **File storage**: uploads currently save to the backend's local disk, which
  is fine for a single server but won't persist on most serverless hosts —
  swap the multer disk storage for an S3/Cloudinary adapter before going to
  production with real file uploads at scale
- **Hosting**: deploy `backend/` to Render/Railway/Fly.io (Docker-ready) and
  `frontend/` to Vercel/Netlify; point `CLIENT_URL` and the frontend's API
  base URL at each other's live domains

## Known simplifications (worth knowing about)
- The quiz *builder* UI in the course editor is basic — question/option
  authoring currently happens via the API payload; the on-screen form for
  building quiz questions lesson-by-lesson isn't wired up yet.
- No email delivery (password reset, notifications) is implemented.
- No pagination on course catalog/admin lists — fine for a course project,
  would need it before real scale.
