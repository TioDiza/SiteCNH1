import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ThankYouPage: React.FC = () => {
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/phone-confirmation');
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
            <main className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Pagamento Confirmado!</h1>
                <p className="text-gray-600 leading-relaxed mt-4">
                    Sua inscrição no Programa CNH do Brasil foi concluída com sucesso.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                    O próximo passo é confirmar seu número de telefone para que possamos entrar em contato sobre o agendamento das suas aulas.
                </p>
                <div className="mt-8">
                    <button 
                        onClick={handleNext}
                        className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
                    >
                        Avançar
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ThankYouPage;