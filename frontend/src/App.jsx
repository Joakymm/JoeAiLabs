import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useToast }     from './hooks/index.js';
import { ToastContainer, ProtectedRoute } from './components/ui/index.jsx';
import Navbar           from './components/layout/Navbar.jsx';
import ChatWidget       from './components/chat/ChatWidget.jsx';

import LandingPage      from './pages/LandingPage.jsx';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages.jsx';
import DashboardPage    from './pages/dashboard/DashboardPage.jsx';
import { ModulesPage, ModuleDetailPage } from './pages/modules/ModulesPage.jsx';
import LessonPage       from './pages/modules/LessonPage.jsx';
import PromptsPage      from './pages/prompts/PromptsPage.jsx';
import UpgradePage      from './pages/UpgradePage.jsx';
import CommunityPage    from './pages/community/CommunityPage.jsx';
import AdminLayout      from './pages/admin/AdminLayout.jsx';
import AdminDashboard   from './pages/admin/AdminDashboard.jsx';
import CourseManagement from './pages/admin/CourseManagement.jsx';
import PromptManagement from './pages/admin/PromptManagement.jsx';
import UserManagement   from './pages/admin/UserManagement.jsx';
import AnalyticsPage    from './pages/admin/AnalyticsPage.jsx';
import PaymentRecords   from './pages/admin/PaymentRecords.jsx';
import SystemSettingsPage from './pages/admin/SystemSettingsPage.jsx';
import QuizManagement   from './pages/admin/QuizManagement.jsx';

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
          <main style={{ flex:1 }}>
            <Routes>
              {/* Public */}
              <Route path="/"         element={<LandingPage />} />
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/upgrade"  element={<UpgradePage />} />

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/modules"   element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
              <Route path="/modules/:id" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />
              <Route path="/lessons/:id" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
              <Route path="/prompts"   element={<ProtectedRoute><PromptsPage /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />

              {/* Admin */}
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

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        <ToastContainer toasts={toasts} remove={remove} />
        <ChatWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}
