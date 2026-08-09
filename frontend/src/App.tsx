import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { GuestRoute } from './guards/GuestRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { UploadPage } from './pages/Upload/UploadPage';
import { StudyWorkspacePage } from './pages/Study/StudyWorkspacePage';
import { FlashcardsPage } from './pages/Flashcards/FlashcardsPage';
import { QuizzesPage } from './pages/Quizzes/QuizzesPage';
import { MindMapsPage } from './pages/MindMaps/MindMapsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public — Landing */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Guest-only — redirect authenticated users to /dashboard */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          {/* Protected — redirect unauthenticated users to /login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="notes" element={<StudyWorkspacePage />} />
              <Route path="lectures" element={<div>My Lectures Placeholder</div>} />
              <Route path="tutor" element={<div>AI Tutor Placeholder</div>} />
              <Route path="flashcards" element={<FlashcardsPage />} />
              <Route path="mindmaps" element={<MindMapsPage />} />
              <Route path="quizzes" element={<QuizzesPage />} />
              <Route path="settings" element={<div>Settings Placeholder</div>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
