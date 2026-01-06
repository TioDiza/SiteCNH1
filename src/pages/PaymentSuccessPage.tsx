import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, ArrowRight, Edit, Phone, Loader2, AlertTriangle, ThumbsUp } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

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
    const [userData, setUserData] = useState<{ name: string; phone: string; leadId: string; } | null>(null);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [confirmPhone, setConfirmPhone] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [isPhoneConfirmed, setIsPhoneConfirmed] = useState(false);

    useEffect(() => {
        const savedData = sessionStorage.getItem('cnh_userData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setUserData(parsedData);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const formatPhoneNumber = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 15);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        setter(formatPhoneNumber(e.target.value));
    };

    const handleUpdatePhone = async () => {
        setUpdateError(null);
        setUpdateSuccess(false);

        if (newPhone !== confirmPhone) {
            setUpdateError('Os números de telefone não coincidem.');
            return;
        }
        if (newPhone.replace(/\D/g, '').length < 11) {
            setUpdateError('Por favor, insira um número de telefone válido com DDD.');
            return;
        }
        if (!userData?.leadId) {
            setUpdateError('Não foi possível encontrar a identificação do seu cadastro.');
            return;
        }

        setIsUpdating(true);
        const { error } = await supabase.functions.invoke('update-lead-phone', {
            body: { leadId: userData.leadId, phone: newPhone },
        });
        setIsUpdating(false);

        if (error) {
            setUpdateError('Ocorreu um erro ao atualizar seu número. Tente novamente.');
            console.error('Error updating phone:', error);
        } else {
            const updatedUserData = { ...userData, phone: newPhone };
            setUserData(updatedUserData);
            setIsEditingPhone(false);
            setNewPhone('');
            setConfirmPhone('');
            setUpdateSuccess(true);
            
            const savedData = sessionStorage.getItem('cnh_userData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                parsedData.phone = newPhone;
                sessionStorage.setItem('cnh_userData', JSON.stringify(parsedData));
            }
        }
    };

    const firstName = userData?.name.split(' ')[0];

    return (
        <div className="bg-gray-50 min-h-screen">
            <SuccessHeader userName={firstName} />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-20 h-20 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Pagamento Confirmado!</h1>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Parabéns, {firstName}! Seu cadastro no Programa CNH do Brasil foi finalizado com sucesso. O processo está em andamento e nossa equipe entrará em contato via WhatsApp para os próximos passos.
                    </p>

                    {isPhoneConfirmed ? (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-6 rounded-lg mb-6 text-left animate-fade-in">
                            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <CheckCircle />
                                Número Confirmado!
                            </h2>
                            <p>
                                Perfeito! Agora é só aguardar. Nossa equipe entrará em contato com você no número <strong>{userData?.phone}</strong> via WhatsApp em até 48 horas para dar continuidade ao seu processo.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-100 p-6 rounded-lg mb-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Confirme seu WhatsApp</h2>
                                <p className="text-gray-600 mb-2">Nossa equipe entrará em contato no número abaixo:</p>
                                <p className="text-2xl font-bold text-blue-600 bg-white py-2 px-4 rounded-lg inline-block border">{userData?.phone}</p>
                                
                                {!isEditingPhone && (
                                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <button 
                                            onClick={() => setIsPhoneConfirmed(true)} 
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
                                        >
                                            <ThumbsUp size={16} /> Confirmar Número
                                        </button>
                                        <button 
                                            onClick={() => { setIsEditingPhone(true); setUpdateSuccess(false); setUpdateError(null); }} 
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit size={16} /> Corrigir número
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditingPhone && (
                                <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200 animate-fade-in">
                                    <h3 className="font-bold text-gray-800 mb-4">Atualize seu número de WhatsApp</h3>
                                    <div className="space-y-4">
                                        <input 
                                            type="tel"
                                            placeholder="(00) 00000-0000"
                                            value={newPhone}
                                            onChange={(e) => handlePhoneChange(e, setNewPhone)}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg"
                                            maxLength={15}
                                        />
                                        <input 
                                            type="tel"
                                            placeholder="Confirme o novo número"
                                            value={confirmPhone}
                                            onChange={(e) => handlePhoneChange(e, setConfirmPhone)}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg"
                                            maxLength={15}
                                        />
                                    </div>
                                    {updateError && (
                                        <div className="bg-red-100 text-red-700 p-3 rounded-md mt-4 text-sm flex items-center gap-2">
                                            <AlertTriangle size={18} /> {updateError}
                                        </div>
                                    )}
                                    <button onClick={handleUpdatePhone} disabled={isUpdating} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors mt-4 disabled:bg-gray-400 flex items-center justify-center gap-2">
                                        {isUpdating ? <><Loader2 className="animate-spin" /> Atualizando...</> : 'Confirmar Novo Número'}
                                    </button>
                                </div>
                            )}

                            {updateSuccess && (
                                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center font-semibold animate-fade-in flex items-center justify-center gap-2">
                                   <CheckCircle size={20} /> Número atualizado com sucesso!
                                </div>
                            )}
                        </>
                    )}

                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 mt-4"
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