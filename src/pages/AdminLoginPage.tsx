import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { LogIn, Loader2, AlertTriangle, Mail, Lock } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log("[AdminLoginPage] Tentando fazer login...");

    supabase.auth.signInWithPassword({ email, password })
      .then(({ data, error: signInError }) => {
        if (signInError) {
          console.error("[AdminLoginPage] Falha no login:", signInError);
          setError(signInError.message);
          setIsLoading(false);
        } else {
          console.log("[AdminLoginPage] Login bem-sucedido, redirecionando...", data.user?.email);
          navigate('/admin/dashboard');
        }
      })
      .catch(err => {
        console.error("[AdminLoginPage] Erro inesperado na promise de login:", err);
        setError("Ocorreu um erro inesperado. Tente novamente.");
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img src="/Gov.br_logo.svg.png" alt="gov.br" className="w-32 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">
            Acesso Administrativo
          </h1>
          <p className="text-gray-500">
            Use suas credenciais para entrar.
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 pl-10 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pl-10 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3">
                <AlertTriangle size={20} />
                <p className="text-sm">{error}</p>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <><LogIn className="mr-2" size={18}/> Entrar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;