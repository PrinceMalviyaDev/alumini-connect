import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { getSocket, connectSocket } from './lib/socket';
import { Notification } from './types';

import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentOnboarding from './pages/StudentOnboarding';
import AlumniOnboarding from './pages/AlumniOnboarding';
import Directory from './pages/Directory';
import AlumniProfilePage from './pages/AlumniProfilePage';
import AlumniDashboard from './pages/AlumniDashboard';
import StudentRequests from './pages/StudentRequests';
import Sessions from './pages/Sessions';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import RegretEngine from './pages/RegretEngine';
import NotFound from './pages/NotFound';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force onboarding if not completed (skip for admin and the onboarding routes themselves)
  if (user && !user.isOnboarded && user.role !== 'admin') {
    const onboardingPath = `/onboarding/${user.role}`;
    if (location.pathname !== onboardingPath) {
      return <Navigate to={onboardingPath} replace />;
    }
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'alumni') return <Navigate to="/dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/directory" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (!user.isOnboarded && user.role !== 'admin') return <Navigate to={`/onboarding/${user.role}`} replace />;
    if (user.role === 'alumni') return <Navigate to="/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/directory" replace />;
  }

  return <>{children}</>;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}

export default function App() {
  const { initializeFromStorage, user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Apply dark mode from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    initializeFromStorage();
  }, [initializeFromStorage]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket(user._id);
      const socket = getSocket();

      socket.on('notification:new', (notif: Notification) => {
        addNotification(notif);
        toast(notif.title, {
          icon: '🔔',
          style: {
            background: '#1e3a8a',
            color: '#fff',
          },
        });
      });

      return () => {
        socket.off('notification:new');
      };
    }
  }, [isAuthenticated, user, addNotification]);

  const location = useLocation();
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/onboarding/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/alumni"
        element={
          <ProtectedRoute allowedRoles={['alumni']}>
            <AlumniOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/directory"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Directory />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/:id"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AlumniProfilePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['alumni']}>
            <AuthenticatedLayout>
              <AlumniDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AuthenticatedLayout>
              <StudentRequests />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Sessions />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Leaderboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Profile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <NotificationsPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/regret-engine"
        element={
          <ProtectedRoute allowedRoles={['student', 'alumni']}>
            <AuthenticatedLayout>
              <RegretEngine />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuthenticatedLayout>
              <AdminDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
