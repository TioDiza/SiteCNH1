import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { User, Loader2, AlertTriangle, Copy, CheckCircle, Clock, Wifi } from 'lucide-react';

const PaymentHeader: React.FC<{ userName?: string }> = ({ userName }) => (
    <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
            <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Wifi className="text-blue-600" />
                    <span className="font-bold text-xl text-gray-700">Starlink</span>
                </div>
                <button className="flex items-center gap-2 bg-[#004381] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors">
                    <User size={18} />
                    <span>{userName || 'Entrar'}</span>
                </button>
            </div>
        </div>
    </header>
);

const StarlinkPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const createPayment = async () => {
            const customerDataString = sessionStorage.getItem('starlink_customerData');
            if (!customerDataString) {
                setError("Sessão expirada. Por favor, preencha seus dados novamente.");
                setIsLoading(false);
                setTimeout(() => navigate('/starlink-checkout'), 3000);
                return;
            }
            const customerData = JSON.parse(customerDataString);
            setUserName(customerData.name.split(' ')[0]);

            try {
                const { data: companyData, error: companyError } = await supabase.functions.invoke('get-company-data');
                if (companyError) throw new Error("Não foi possível obter os dados para pagamento.");
                setCompanyInfo(companyData);

                const paymentPayload = {
                    amount: 23690, // R$ 236,90
                    customer: {
                        name: customerData.name,
                        email: customerData.email,
                        document: { type: 'cpf', number: customerData.cpf.replace(/\D/g, '') },
                        phone: customerData.phone.replace(/\D/g, ''),
                    },
                    items: [{ 
                        title: 'Kit Antena Starlink - Taxa de Adesão Promocional', 
                        unit_price: 23690, 
                        quantity: 1,
                        tangible: true
                    }],
                    metadata: { starlink_customer_id: customerData.id, product: 'starlink_kit' },
                };

                const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', { body: paymentPayload });
                if (paymentError) throw paymentError;
                setPaymentInfo(paymentData);

            } catch (err: any) {
                console.error("Erro ao criar pagamento Starlink:", err);
                setError(err.message || "Ocorreu um erro ao gerar o PIX. Tente novamente.");
            } finally {
                setIsLoading(false);
            }
        };

        createPayment();
    }, [navigate]);

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
                    sessionStorage.removeItem('starlink_customerData');
                    navigate('/starlink-thank-you');
                }
            } catch (e) {
                console.error('Error invoking get-payment-status function:', e);
            }
        }, 12000);

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
            return <div className="flex flex-col items-center justify-center text-center"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" /><p className="text-lg text-gray-600">Gerando seu PIX para pagamento...</p></div>;
        }
        if (error) {
            return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3"><AlertTriangle size={20} /> <p>{error}</p></div>;
        }
        if (paymentInfo && companyInfo) {
            const amountInReais = paymentInfo.Amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            return (
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Finalize sua compra Starlink</h1>
                    <p className="text-gray-600 mb-6">Para garantir sua antena, pague o valor de <strong>{amountInReais}</strong> via PIX.</p>
                    
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
                        <div className="relative">
                            <input type="text" readOnly value={paymentInfo.Pix.QrCodeText} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 pr-12 text-sm text-gray-600" />
                            <button onClick={handleCopy} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                                {isCopied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} />}
                            </button>
                        </div>
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

export default StarlinkPaymentPage;