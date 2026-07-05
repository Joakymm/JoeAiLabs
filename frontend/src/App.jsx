import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';
import Navbar from './components/layout/Navbar';
import AIToolsMarquee from './components/ui/AIToolsMarquee';
import AnnouncementBanner from './components/ui/AnnouncementBanner';
import ChatWidget from './components/chat/ChatWidget';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';
import DashboardPage from './pages/dashboard/DashboardPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import { ModulesPage, ModuleDetailPage } from './pages/modules/ModulesPage';
import LessonPage from './pages/modules/LessonPage';
import QuizPage from './pages/modules/QuizPage';
import PromptsPage from './pages/prompts/PromptsPage';
import BookmarksPage from './pages/prompts/BookmarksPage';
import UpgradePage from './pages/UpgradePage';
import CertificatesPage from './pages/CertificatesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CourseManagement from './pages/admin/CourseManagement';
import PromptManagement from './pages/admin/PromptManagement';
import UserManagement from './pages/admin/UserManagement';
import QuizManagement from './pages/admin/QuizManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import PaymentRecords from './pages/admin/PaymentRecords';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import FeedPage from './pages/social/FeedPage';
import PostPage from './pages/social/PostPage';
import ProfilePage from './pages/social/ProfilePage';
import NotificationsPage from './pages/social/NotificationsPage';
import MessagesPage from './pages/social/MessagesPage';

function AppLayout({ children }) {
  return (
    <>
      <AnnouncementBanner />
      <main style={{ paddingTop: 0 }}>{children}</main>
    </>
  );
}

function Spinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{
        width: size, height: size,
        border: '3px solid rgba(0,255,163,0.15)',
        borderTopColor: 'var(--neon-green)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/modules" element={
        <ProtectedRoute><AppLayout><ModulesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/modules/:id" element={
        <ProtectedRoute><AppLayout><ModuleDetailPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/lessons/:id" element={
        <ProtectedRoute><AppLayout><LessonPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/modules/:moduleId/quiz" element={
        <ProtectedRoute><AppLayout><QuizPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/prompts" element={
        <ProtectedRoute><AppLayout><PromptsPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/prompts/bookmarks" element={
        <ProtectedRoute><AppLayout><BookmarksPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/upgrade" element={
        <ProtectedRoute><AppLayout><UpgradePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/certificates" element={
        <ProtectedRoute><AppLayout><CertificatesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><AppLayout><LeaderboardPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/feed" element={
        <ProtectedRoute><FeedPage /></ProtectedRoute>
      } />
      <Route path="/posts/:postId" element={
        <ProtectedRoute><PostPage /></ProtectedRoute>
      } />
      <Route path="/profile/:userId" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><NotificationsPage /></ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute><MessagesPage /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute><AppLayout><AdminLayout /></AppLayout></AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="prompts" element={<PromptManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="quizzes" element={<QuizManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="payments" element={<PaymentRecords />} />
        <Route path="settings" element={<SystemSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocialProvider>
            <Navbar />
            <AIToolsMarquee />
            <AppRoutes />
            <ChatWidget />
          </SocialProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
