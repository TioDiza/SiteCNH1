import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ClipboardCopy, CheckCircle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import QRCode from 'qrcode.react';

const StarlinkPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [customerData, setCustomerData] = useState<any>(null);
    
    const [paymentData, setPaymentData] = useState<{ pixCode: string; transactionId: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [feeAmount] = useState(236.90);

    useEffect(() => {
        if (location.state?.customerData) {
            setCustomerData(location.state.customerData);
        } else {
            navigate('/starlink-checkout');
        }
    }, [location, navigate]);

    useEffect(() => {
        const generatePayment = async () => {
            if (!customerData) return;

            try {
                const clientPayload = {
                    name: customerData.name,
                    document: customerData.cpf,
                };

                const { data: paymentResult, error: functionError } = await supabase.functions.invoke('create-payment', {
                    body: { client: clientPayload, amount: feeAmount, starlink_customer_id: customerData.id },
                });

                if (functionError) throw new Error(functionError.message);
                if (paymentResult.status !== 'success') throw new Error(paymentResult.message || 'Falha ao gerar o pagamento PIX.');

                setPaymentData({
                    pixCode: paymentResult.pixCode,
                    transactionId: paymentResult.transactionId,
                });

            } catch (err: any) {
                setError(err.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        if (customerData) {
            generatePayment();
        }
    }, [customerData, feeAmount]);

    useEffect(() => {
        if (!paymentData?.transactionId) return;

        const intervalId = setInterval(async () => {
            const { data } = await supabase.functions.invoke('get-transaction-status', {
                body: { transactionId: paymentData.transactionId },
            });
            if (data.status === 'paid') {
                clearInterval(intervalId);
                navigate('/starlink-success');
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [paymentData, navigate]);

    const handleCopyToClipboard = () => {
        if (paymentData) {
            navigator.clipboard.writeText(paymentData.pixCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4">
            <main className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold text-gray-800">Pagamento Starlink via PIX</h1>
                
                {isLoading && (
                    <div className="py-12"><Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" /></div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-md my-4">
                        <p className="font-bold">Erro!</p>
                        <p>{error}</p>
                    </div>
                )}

                {paymentData && (
                    <div className="animate-fade-in">
                        <p className="text-lg font-semibold text-gray-800 mt-4">Valor total:</p>
                        <p className="text-5xl font-bold text-gray-900 my-2">
                            R$ {feeAmount.toFixed(2).replace('.', ',')}
                        </p>
                        <div className="bg-yellow-100 text-yellow-800 font-semibold px-4 py-2 rounded-full my-4 text-sm animate-pulse">
                            Aguardando pagamento...
                        </div>
                        <div className="p-4 border-4 border-gray-200 rounded-lg inline-block my-4">
                            <QRCode value={paymentData.pixCode} size={240} />
                        </div>
                        <p className="font-semibold text-gray-700 mb-4">Escaneie o QR Code com o app do seu banco.</p>
                        
                        <button onClick={handleCopyToClipboard} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            {isCopied ? <><CheckCircle size={20} /> Copiado!</> : <><ClipboardCopy size={20} /> Copiar Código PIX</>}
                        </button>
                        <p className="text-xs text-gray-400 mt-6">ID da Transação: {paymentData.transactionId}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StarlinkPaymentPage;