import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with RootLayout */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Dashboard Routes with DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="lectures" element={<div>My Lectures Placeholder</div>} />
          <Route path="tutor" element={<div>AI Tutor Placeholder</div>} />
          <Route path="flashcards" element={<div>Flashcards Placeholder</div>} />
          <Route path="mindmaps" element={<div>Mind Maps Placeholder</div>} />
          <Route path="quizzes" element={<div>Quizzes Placeholder</div>} />
          <Route path="settings" element={<div>Settings Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
