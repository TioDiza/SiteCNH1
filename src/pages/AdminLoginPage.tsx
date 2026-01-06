import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { LogIn, Loader2, AlertTriangle, User as UserIcon, Mail, Lock } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Novo estado para o nome no cadastro
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false); // Estado para alternar entre login e cadastro
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Admin Login Error:", signInError);
      setError(signInError.message);
    } else {
      navigate('/admin/dashboard');
    }
    setIsLoading(false); // Resetar isLoading mesmo em caso de erro
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (signUpError) {
      console.error("Admin Register Error:", signUpError);
      setError(signUpError.message);
    } else if (data.user) {
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', data.user.id);

      if (updateProfileError) {
        console.error("Error updating admin profile role:", updateProfileError);
        setError("Erro ao definir a role de administrador. O usuário foi criado, mas a role pode não ter sido atualizada. Por favor, verifique manualmente no banco de dados.");
      } else {
        alert("Administrador cadastrado com sucesso! Você pode fazer login agora.");
        setIsRegistering(false); // Volta para a tela de login
        setEmail('');
        setPassword('');
        setName('');
      }
    }
    setIsLoading(false); // Resetar isLoading mesmo em caso de erro
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img src="/Gov.br_logo.svg.png" alt="gov.br" className="w-32 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">
            {isRegistering ? 'Cadastro de Administrador' : 'Acesso Administrativo'}
          </h1>
          <p className="text-gray-500">
            {isRegistering ? 'Crie uma nova conta de administrador.' : 'Use suas credenciais para entrar.'}
          </p>
        </div>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 pl-10 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
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
                autoComplete={isRegistering ? "new-password" : "current-password"}
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
              {isLoading ? <Loader2 className="animate-spin" /> : isRegistering ? 'Cadastrar' : <><LogIn className="mr-2" size={18}/> Entrar</>}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;