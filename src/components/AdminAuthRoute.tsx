import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminAuthRoute: React.FC = () => {
  const { loading, session, profile } = useAuth();

  // Enquanto verificamos uma sessão e perfil existentes, mostramos um loader.
  // Isso evita um flash da página de login se o usuário já estiver logado.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Se o usuário estiver logado e for um admin, redireciona para o dashboard.
  if (session && profile?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Caso contrário, mostra a rota filha (a página de login).
  return <Outlet />;
};

export default AdminAuthRoute;