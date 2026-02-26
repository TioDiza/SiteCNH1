import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { User, Loader2, AlertTriangle, Copy, CheckCircle, Clock, Info, Smartphone } from 'lucide-react';

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [userName, setUserName] = useState('');

    const PAYMENT_AMOUNT_IN_CENTS = 4790; // R$ 47,90

    useEffect(() => {
        const createPayment = async () => {
            const userDataString = sessionStorage.getItem('cnh_userData');
            if (!userDataString) {
                setError("Sessão expirada. Por favor, reinicie o processo.");
                setIsLoading(false);
                return;
            }
            const userData = JSON.parse(userDataString);
            setUserName(userData.name.split(' ')[0]);

            try {
                const { data: companyData, error: companyError } = await supabase.functions.invoke('get-company-data');
                if (companyError) throw new Error("Não foi possível obter os dados para pagamento.");
                setCompanyInfo(companyData);

                const payload = {
                    amount: PAYMENT_AMOUNT_IN_CENTS,
                    customer: {
                        name: userData.name,
                        email: userData.email,
                        document: { type: 'cpf', number: userData.cpf.replace(/\D/g, '') },
                        phone: userData.phone.replace(/\D/g, ''),
                    },
                    items: [{ 
                        title: 'Taxa de Adesão - Programa CNH do Brasil', 
                        unit_price: PAYMENT_AMOUNT_IN_CENTS, 
                        quantity: 1,
                        tangible: false
                    }],
                    metadata: { lead_id: userData.leadId, product: 'cnh_fee' },
                };

                const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', { body: payload });
                if (paymentError) throw paymentError;
                setPaymentInfo(paymentData);
            } catch (err: any) {
                console.error("Erro ao criar pagamento:", err);
                setError(err.message || "Ocorreu um erro ao gerar o PIX. Tente novamente.");
            } finally {
                setIsLoading(false);
            }
        };
        createPayment();
    }, []);

    useEffect(() => {
        if (!paymentInfo) return;

        const interval = setInterval(async () => {
            try {
                const { data, error: functionError } = await supabase.functions.invoke('get-payment-status', {
                    body: { gatewayTransactionId: paymentInfo.Id }
                });

                if (functionError) {
                    console.error('Error polling transaction status:', functionError);
                } else if (data && data.status === 'paid') {
                    clearInterval(interval);
                    navigate('/phone-confirmation');
                }
            } catch (e) {
                console.error('Error invoking get-payment-status function:', e);
            }
        }, 15000); // Poll every 15 seconds

        return () => clearInterval(interval);
    }, [paymentInfo, navigate]);

    const handleCopy = () => {
        if (paymentInfo?.Pix?.QrCodeText) {
            navigator.clipboard.writeText(paymentInfo.Pix.QrCodeText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex flex-col items-center justify-center text-center"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" /><p className="text-lg text-gray-600">Gerando sua guia de pagamento PIX...</p></div>;
        }
        if (error) {
            return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3"><AlertTriangle size={20} /> <p>{error}</p></div>;
        }
        if (paymentInfo && companyInfo) {
            const amountInReais = (PAYMENT_AMOUNT_IN_CENTS / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            return (
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Taxa de Emissão da CNH</h1>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">Esta é a taxa de adesão obrigatória. Após a confirmação do pagamento, você receberá acesso completo ao aplicativo do Programa CNH do Brasil.</p>
                    
                    <div className="my-8 flex justify-center">
                        <div className="p-4 bg-blue-100 rounded-full">
                            <Smartphone size={40} className="text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 text-left p-4 rounded-lg mb-6 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-blue-800">
                            <Info size={20} />
                            <h3>Importante</h3>
                        </div>
                        <ul className="list-disc list-inside text-blue-900 text-sm space-y-1">
                            <li>Esta taxa é <strong>obrigatória</strong> para finalizar seu cadastro no Programa CNH do Brasil</li>
                            <li>Valor único pago uma única vez</li>
                            <li>Taxa destinada ao processo de emissão e regularização da CNH</li>
                            <li>Seu cadastro só será concluído após a confirmação deste pagamento</li>
                        </ul>
                    </div>

                    <div className="bg-red-50 border border-red-200 text-left p-4 rounded-lg mb-8 animate-pulse-red">
                         <div className="flex items-center gap-2 font-bold text-red-800">
                            <AlertTriangle size={20} />
                            <h3>Atenção</h3>
                        </div>
                        <p className="text-red-900 text-sm mt-2">
                            Informamos que, caso o pagamento da <strong>Taxa de Emissão da CNH</strong> não seja realizado, seu cadastro <strong>não será concluído</strong> e você <strong>perderá o direito de participar do Programa CNH do Brasil</strong>. O não pagamento desta taxa impede a conclusão do seu cadastro e a liberação do seu acesso.
                        </p>
                    </div>

                    <p className="font-semibold text-gray-700 text-lg mb-4">Pague o valor de <strong>{amountInReais}</strong> via PIX:</p>

                    <div className="flex justify-center mb-6">
                        <QRCodeSVG
                            value={paymentInfo.Pix.QrCodeText}
                            size={256}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="L"
                            includeMargin={false}
                        />
                    </div>

                    <div className="space-y-4">
                        <p className="font-semibold text-gray-700 text-lg">Ou copie o código e pague no seu app do banco:</p>
                        <div className="relative bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm text-gray-600 text-left break-all">
                            {paymentInfo.Pix.QrCodeText}
                        </div>
                        <button 
                            onClick={handleCopy} 
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
                        >
                            {isCopied ? (
                                <>
                                    <CheckCircle size={20} />
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy size={20} />
                                    Copiar Código PIX
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-3 text-blue-600 font-semibold">
                        <Clock size={20} />
                        <p>Aguardando confirmação do pagamento...</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <PaymentHeader userName={userName} />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default PaymentPage;