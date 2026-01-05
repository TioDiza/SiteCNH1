import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, User } from 'lucide-react';

const ThankYouHeader: React.FC = () => (
    <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
            <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img 
                        src="/Gov.br_logo.svg.png" 
                        alt="gov.br" 
                        className="h-8 md:h-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-[#004381] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors">
                        <User size={18} />
                        <span>Entrar</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const ThankYouPage: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            <ThankYouHeader />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
                    <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Obrigado por suas respostas!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Seu cadastro foi recebido e está sendo processado. Em breve, você receberá mais informações sobre os próximos passos.
                    </p>
                    <Link 
                        to="/"
                        className="bg-[#0d6efd] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
                    >
                        Voltar para o Início
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default ThankYouPage;