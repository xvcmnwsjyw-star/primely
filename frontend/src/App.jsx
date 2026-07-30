import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import SignUp from "./pages/SignUp.jsx";
import Login from "./pages/Login.jsx";
import CourseCatalog from "./pages/CourseCatalog.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import CoursePlayer from "./pages/CoursePlayer.jsx";
import MyLearning from "./pages/MyLearning.jsx";
import Certificates from "./pages/Certificates.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import CheckoutCancel from "./pages/CheckoutCancel.jsx";

import InstructorDashboard from "./pages/instructor/InstructorDashboard.jsx";
import CourseEditor from "./pages/instructor/CourseEditor.jsx";
import CourseStudents from "./pages/instructor/CourseStudents.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageCourses from "./pages/admin/ManageCourses.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />

          {/* Student */}
          <Route
            path="/learn/:id"
            element={
              <ProtectedRoute roles={["student", "instructor", "admin"]}>
                <CoursePlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-learning"
            element={
              <ProtectedRoute>
                <MyLearning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            }
          />

          {/* Instructor */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute roles={["instructor", "admin"]}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/new"
            element={
              <ProtectedRoute roles={["instructor", "admin"]}>
                <CourseEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:id/edit"
            element={
              <ProtectedRoute roles={["instructor", "admin"]}>
                <CourseEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:id/students"
            element={
              <ProtectedRoute roles={["instructor", "admin"]}>
                <CourseStudents />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ManageCourses />
              </ProtectedRoute>
            }
          />
        </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
