import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AlertTriangle } from 'lucide-react';

interface UserData {
    name: string;
}

const ThankYouHeader: React.FC<{ userName?: string }> = ({ userName }) => (
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
                        <span>{userName || 'Entrar'}</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const ThankYouPage: React.FC = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const savedData = sessionStorage.getItem('cnh_userData');
        if (savedData) {
            setUserData(JSON.parse(savedData));
        } else {
            console.error("ThankYouPage: Missing user data in session. Redirecting to login.");
            navigate('/login');
        }
    }, [navigate]);

    const handleFinalize = () => {
        navigate('/payment');
    };

    if (!userData) {
        return null; // Or a loading spinner
    }

    const firstName = userData.name.split(' ')[0];

    return (
        <div className="bg-gray-50 min-h-screen">
            <ThankYouHeader userName={firstName} />
            <main className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <img 
                        src="/primeirabra.png" 
                        alt="Primeira brasileira a obter CNH com novas regras" 
                        className="w-full rounded-lg mb-6"
                    />

                    <p className="text-gray-700 leading-relaxed mb-6">
                        A paraibana <strong>Andreza Lima dos Santos</strong>, de 27 anos, tornou-se a primeira brasileira a obter a Carteira Nacional de Habilitação (CNH) pelo novo modelo do Programa CNH do Brasil.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Todo o processo foi concluído em apenas <strong>11 dias</strong>, desde o cadastro até o recebimento da CNH em sua residência.
                    </p>

                    <div className="bg-red-100 border-l-8 border-red-500 text-red-900 p-6 rounded-lg mb-8 flex items-start gap-4 shadow-lg animate-pulse">
                        <AlertTriangle className="w-10 h-10 flex-shrink-0 text-red-600" />
                        <div>
                            <p><strong>ATENÇÃO:</strong> O não pagamento da taxa administrativa dentro do prazo estabelecido resultará no <strong>cancelamento automático do cadastro e bloqueio do CPF no sistema por um período de 18 (dezoito) meses</strong>, impossibilitando nova inscrição no programa.</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Após a confirmação do pagamento:</h2>
                        <div className="space-y-3 text-gray-700">
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white font-bold text-sm rounded-full flex items-center justify-center">1</span>
                                <span>Liberação imediata do acesso ao aplicativo de aulas teóricas</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white font-bold text-sm rounded-full flex items-center justify-center">2</span>
                                <span>Agendamento do exame prático em unidade do DETRAN próxima à sua residência</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white font-bold text-sm rounded-full flex items-center justify-center">3</span>
                                <span>Recebimento da CNH definitiva em sua residência via Correios</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-8">
                        Assim como Andreza e milhares de brasileiros que já foram beneficiados pelo programa, finalize seu cadastro agora e garanta sua vaga.
                    </p>

                    <button 
                        onClick={handleFinalize}
                        className="w-full bg-[#0d6efd] text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors animate-pulse"
                    >
                        Finalizar Cadastro
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ThankYouPage;