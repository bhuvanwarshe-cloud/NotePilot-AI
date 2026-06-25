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
              <Route path="lectures" element={<div>My Lectures Placeholder</div>} />
              <Route path="tutor" element={<div>AI Tutor Placeholder</div>} />
              <Route path="flashcards" element={<div>Flashcards Placeholder</div>} />
              <Route path="mindmaps" element={<div>Mind Maps Placeholder</div>} />
              <Route path="quizzes" element={<div>Quizzes Placeholder</div>} />
              <Route path="settings" element={<div>Settings Placeholder</div>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
