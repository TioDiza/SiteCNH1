import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, ArrowRight } from 'lucide-react';

const SuccessHeader: React.FC<{ userName?: string }> = ({ userName }) => (
    <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
            <div className="py-3 flex items-center justify-between">
                <img src="/Gov.br_logo.svg.png" alt="gov.br" className="h-8 md:h-10" />
                <button className="flex items-center gap-2 bg-[#004381] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors">
                    <User size={18} />
                    <span>{userName || 'Entrar'}</span>
                </button>
            </div>
        </div>
    </header>
);

const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const savedData = sessionStorage.getItem('cnh_userData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setUserName(parsedData.name.split(' ')[0]);
        }
    }, []);

    const handleProceed = () => {
        // Redireciona para a página inicial ou um dashboard futuro
        navigate('/');
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <SuccessHeader userName={userName} />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-20 h-20 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Pagamento Confirmado!</h1>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        Parabéns, {userName}! Seu cadastro no Programa CNH do Brasil foi finalizado com sucesso. Você receberá as instruções de acesso ao aplicativo de aulas teóricas em seu e-mail e WhatsApp.
                    </p>
                    <button 
                        onClick={handleProceed}
                        className="w-full bg-[#0d6efd] text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        Acessar Portal
                        <ArrowRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PaymentSuccessPage;