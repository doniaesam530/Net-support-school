import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Tutor from './pages/Tutor';
import Student from './pages/Student';
import Admin from './pages/Admin';

function ProtectedRoute({ role, children }: { role: string; children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useApp();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />
      <Route path="/tutor" element={<ProtectedRoute role="tutor"><Tutor /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute role="student"><Student /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
