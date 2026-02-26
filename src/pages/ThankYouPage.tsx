import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ThankYouPage: React.FC = () => {
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
                    Você receberá um e-mail com os detalhes e os próximos passos, incluindo o acesso ao aplicativo de aulas teóricas.
                </p>
                <div className="mt-8">
                    <Link 
                        to="/"
                        className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
                    >
                        Voltar para a Página Inicial
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default ThankYouPage;