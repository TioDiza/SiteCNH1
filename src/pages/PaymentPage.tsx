import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Loader2, ClipboardCopy, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const PaymentHeader: React.FC<{ userName?: string }> = ({ userName }) => (
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

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state?.userData as { name: string; cpf: string } | undefined;
    
    const [paymentData, setPaymentData] = useState<{ qrCode: string; pixCode: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const FEE_AMOUNT = 49.90;

    useEffect(() => {
        if (!userData) {
            navigate('/login');
            return;
        }

        const generatePayment = async () => {
            try {
                const unformattedCpf = userData.cpf.replace(/\D/g, '');

                const { data: leadData, error: leadError } = await supabase
                    .from('leads')
                    .select('email, phone')
                    .eq('cpf', unformattedCpf)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (leadError || !leadData) {
                    throw new Error('Não foi possível encontrar seus dados de contato. Por favor, tente novamente.');
                }

                const clientPayload = {
                    name: userData.name,
                    document: unformattedCpf,
                    telefone: leadData.phone.replace(/\D/g, ''),
                    email: leadData.email,
                };

                const { data: paymentResult, error: functionError } = await supabase.functions.invoke('create-payment', {
                    body: { client: clientPayload, amount: FEE_AMOUNT },
                });

                if (functionError) {
                    throw new Error(functionError.message);
                }
                
                if (paymentResult.status !== 'success') {
                    throw new Error(paymentResult.message || 'Falha ao gerar o pagamento PIX.');
                }

                setPaymentData({
                    qrCode: paymentResult.paymentCodeBase64,
                    pixCode: paymentResult.paymentCode,
                });

            } catch (err: any) {
                console.error("Payment generation error:", err);
                setError(err.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        generatePayment();
    }, [userData, navigate]);

    const handleCopyToClipboard = () => {
        if (paymentData) {
            navigator.clipboard.writeText(paymentData.pixCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const firstName = userData?.name.split(' ')[0];

    return (
        <div className="bg-gray-50 min-h-screen">
            <PaymentHeader userName={firstName} />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagamento da Taxa de Adesão</h1>
                    <p className="text-gray-600 mb-8">Para concluir sua inscrição no Programa CNH do Brasil, realize o pagamento da taxa administrativa via PIX.</p>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center py-12">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-lg font-semibold text-gray-700">Gerando seu PIX...</p>
                            <p className="text-gray-500">Aguarde um momento.</p>
                        </div>
                    )}

                    {error && (
                         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                            <div>
                                <p className="font-bold">Erro ao gerar pagamento</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {paymentData && (
                        <div className="flex flex-col items-center text-center animate-fade-in">
                            <p className="text-lg font-semibold text-gray-800">Valor a pagar:</p>
                            <p className="text-4xl font-bold text-blue-700 my-2">
                                R$ {FEE_AMOUNT.toFixed(2).replace('.', ',')}
                            </p>
                            
                            <img 
                                src={`data:image/png;base64,${paymentData.qrCode}`} 
                                alt="QR Code para pagamento PIX"
                                className="w-64 h-64 rounded-lg border-4 border-gray-200 my-6"
                            />
                            <p className="font-semibold text-gray-700 mb-4">Abra o app do seu banco e escaneie o QR Code</p>
                            
                            <div className="w-full my-4 flex items-center gap-2">
                                <hr className="flex-grow" />
                                <span className="text-gray-500 font-semibold">OU</span>
                                <hr className="flex-grow" />
                            </div>

                            <p className="font-semibold text-gray-700 mb-2">Copie o código PIX e pague no seu banco:</p>
                            <div className="relative w-full">
                                <input 
                                    type="text"
                                    readOnly
                                    value={paymentData.pixCode}
                                    className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 pr-12 text-sm text-gray-600 truncate"
                                />
                                <button 
                                    onClick={handleCopyToClipboard}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:bg-gray-200 rounded-md"
                                >
                                    {isCopied ? <CheckCircle className="text-green-600" /> : <ClipboardCopy />}
                                </button>
                            </div>
                             <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md text-left">
                                <p><strong>Atenção:</strong> Após o pagamento, a confirmação pode levar alguns minutos. Você receberá o acesso ao aplicativo de aulas por e-mail e SMS.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PaymentPage;