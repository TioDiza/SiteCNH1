import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminProtectedRoute: React.FC = () => {
  const { loading, session, profile } = useAuth();

  // Adicionando logs para depuração
  console.log("[AdminProtectedRoute] Checking auth state...", { loading, session, profile });

  if (loading) {
    console.log("[AdminProtectedRoute] State is loading. Displaying spinner.");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || profile?.role !== 'admin') {
    console.error("[AdminProtectedRoute] REDIRECTING TO LOGIN. Reason:", {
        isSessionMissing: !session,
        isProfileMissing: !profile,
        profileRole: profile?.role,
        isRoleAdmin: profile?.role === 'admin',
    });
    return <Navigate to="/admin/login" replace />;
  }

  console.log("[AdminProtectedRoute] Access granted. Rendering dashboard.");
  return <Outlet />;
};

export default AdminProtectedRoute;