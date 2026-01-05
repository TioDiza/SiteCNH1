import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ShieldCheck } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const { user, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/Gov.br_logo.svg.png" alt="gov.br" className="h-8" />
                        <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 text-green-600">
                            <ShieldCheck size={20} />
                            <span className="font-semibold">Acesso Seguro</span>
                        </div>
                        <button 
                            onClick={signOut}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors"
                        >
                            <LogOut size={18} />
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Login bem-sucedido!</h2>
                    <p className="text-gray-700">
                        Bem-vindo ao painel administrativo, <strong className="text-blue-600">{user?.email}</strong>.
                    </p>
                    <p className="mt-2 text-gray-500">
                        Este é um painel de confirmação. Funcionalidades adicionais podem ser adicionadas aqui.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;