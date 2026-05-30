import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useToast }     from './hooks/index.js';
import { ToastContainer, ProtectedRoute, Spinner } from './components/ui/index.jsx';
import Navbar           from './components/layout/Navbar.jsx';
import ChatWidget       from './components/chat/ChatWidget.jsx';
import AIToolsMarquee   from './components/ui/AIToolsMarquee';
import AnnouncementBanner from './components/ui/AnnouncementBanner';

const LandingPage      = lazy(() => import('./pages/LandingPage.jsx'));
const LoginPage        = lazy(() => import('./pages/auth/AuthPages.jsx').then(m => ({ default: m.LoginPage })));
const RegisterPage     = lazy(() => import('./pages/auth/AuthPages.jsx').then(m => ({ default: m.RegisterPage })));
const DashboardPage    = lazy(() => import('./pages/dashboard/DashboardPage.jsx'));
const ModulesPage      = lazy(() => import('./pages/modules/ModulesPage.jsx').then(m => ({ default: m.ModulesPage })));
const ModuleDetailPage = lazy(() => import('./pages/modules/ModulesPage.jsx').then(m => ({ default: m.ModuleDetailPage })));
const LessonPage       = lazy(() => import('./pages/modules/LessonPage.jsx'));
const QuizPage         = lazy(() => import('./pages/modules/QuizPage.jsx'));
const SettingsPage     = lazy(() => import('./pages/dashboard/SettingsPage.jsx'));
const PromptsPage      = lazy(() => import('./pages/prompts/PromptsPage.jsx'));
const UpgradePage      = lazy(() => import('./pages/UpgradePage.jsx'));
const CommunityPage    = lazy(() => import('./pages/community/CommunityPage.jsx'));
const ChatRoomPage     = lazy(() => import('./pages/community/ChatRoomPage.jsx'));
const BookmarksPage    = lazy(() => import('./pages/prompts/BookmarksPage.jsx'));
const LeaderboardPage  = lazy(() => import('./pages/LeaderboardPage.jsx'));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage.jsx'));

const AdminLayout      = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const CourseManagement = lazy(() => import('./pages/admin/CourseManagement.jsx'));
const PromptManagement = lazy(() => import('./pages/admin/PromptManagement.jsx'));
const UserManagement   = lazy(() => import('./pages/admin/UserManagement.jsx'));
const AnalyticsPage    = lazy(() => import('./pages/admin/AnalyticsPage.jsx'));
const PaymentRecords   = lazy(() => import('./pages/admin/PaymentRecords.jsx'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage.jsx'));
const QuizManagement   = lazy(() => import('./pages/admin/QuizManagement.jsx'));

function PageLoader() {
  return <Spinner text="LOADING..." />;
}

function NotFound() {
  return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, textAlign:'center' }}>
      <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'6rem', fontWeight:900, color:'var(--neon-green)', lineHeight:1, textShadow:'0 0 40px rgba(0,255,163,0.3)' }}>404</div>
      <p style={{ color:'var(--text-muted)', fontSize:'1.1rem' }}>This page doesn't exist in the matrix.</p>
      <a href="/" className="btn btn-secondary" style={{ marginTop:8 }}>← GO HOME</a>
    </div>
  );
}

export default function App() {
  const { toasts, show, remove } = useToast();

  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
          <Navbar />
          <AnnouncementBanner />
          <AIToolsMarquee />
          <main style={{ flex:1 }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"         element={<LandingPage />} />
                <Route path="/login"    element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/upgrade"  element={<UpgradePage />} />

                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/modules"   element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
                <Route path="/modules/:id" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />
                <Route path="/modules/:moduleId/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                <Route path="/lessons/:id" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
                <Route path="/prompts"   element={<ProtectedRoute><PromptsPage /></ProtectedRoute>} />
                <Route path="/prompts/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                <Route path="/community/chat" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="courses" element={<CourseManagement />} />
                  <Route path="prompts" element={<PromptManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="payments" element={<PaymentRecords />} />
                  <Route path="settings" element={<SystemSettingsPage />} />
                  <Route path="quizzes" element={<QuizManagement />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <ToastContainer toasts={toasts} remove={remove} />
        <ChatWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}
