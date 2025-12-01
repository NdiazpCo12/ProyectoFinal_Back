import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import ChallengeList from './pages/challenges/ChallengeList'
import ChallengeDetail from './pages/challenges/ChallengeDetail'
import ChallengeEdit from './pages/challenges/ChallengeEdit'
import ChallengeForm from './pages/challenges/ChallengeForm'
import SubmitCode from './pages/submissions/SubmitCode'
import SubmissionList from './pages/submissions/SubmissionList'
import SubmissionDetail from './pages/submissions/SubmissionDetail'
import CourseList from './pages/courses/CourseList'
import CourseForm from './pages/courses/CourseForm'
import CourseDetail from './pages/courses/CourseDetail'
import AiChallengeGenerator from './pages/ai/AiChallengeGenerator'
import './App.css'

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <ChallengeList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges/:id"
        element={
          <ProtectedRoute>
            <ChallengeDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges/:id/edit"
        element={
          <ProtectedRoute>
            <ChallengeEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges/new"
        element={
          <ProtectedRoute>
            <ChallengeForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges/:challengeId/submit"
        element={
          <ProtectedRoute>
            <SubmitCode />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <SubmissionList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions/:id"
        element={
          <ProtectedRoute>
            <SubmissionDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CourseList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/new"
        element={
          <ProtectedRoute>
            <CourseForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai/generate"
        element={
          <ProtectedRoute>
            <AiChallengeGenerator />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App