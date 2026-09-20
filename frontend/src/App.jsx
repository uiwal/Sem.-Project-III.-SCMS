import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages placeholders
import Login from './pages/Login';
import Register from './pages/Register';
import StudentMenu from './pages/StudentMenu';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CartCheckout from './pages/CartCheckout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'student') return <Navigate to="/menu" />;
  if (user.role === 'staff') return <Navigate to="/staff" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<RoleBasedRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/menu" element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'staff']}>
                  <StudentMenu />
                </ProtectedRoute>
              } />

              <Route path="/cart" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CartCheckout />
                </ProtectedRoute>
              } />

              <Route path="/staff/*" element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <StaffDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
