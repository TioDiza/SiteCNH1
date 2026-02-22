import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import * as qrcode from 'qrcode.react';
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
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const { paymentInfo: pi, userName: un } = location.state || {};

        if (!pi || !un) {
            setError("Dados de pagamento inválidos. Por favor, tente novamente.");
            setIsLoading(false);
            return;
        }

        setPaymentInfo(pi);
        setUserName(un);

        const fetchCompanyInfo = async () => {
            try {
                const { data: companyData, error: companyError } = await supabase.functions.invoke('get-company-data');
                if (companyError) throw new Error("Não foi possível obter os dados para pagamento.");
                setCompanyInfo(companyData);
            } catch (err: any) {
                setError(err.message || "Ocorreu um erro ao buscar dados do recebedor.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanyInfo();
    }, [location.state]);

    useEffect(() => {
        if (!paymentInfo) return;

        const interval = setInterval(async () => {
            const { data, error: pollError } = await supabase
                .from('transactions')
                .select('status')
                .eq('gateway_transaction_id', paymentInfo.Id)
                .single();

            if (pollError) {
                console.error('Error polling transaction status:', pollError);
            } else if (data && data.status === 'paid') {
                clearInterval(interval);
                navigate('/starlink-thank-you');
            }
        }, 5000); // Poll every 5 seconds

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
            const amountInReais = (paymentInfo.Amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            return (
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Finalize sua compra Starlink</h1>
                    <p className="text-gray-600 mb-6">Para garantir sua antena, pague o valor de <strong>{amountInReais}</strong> via PIX.</p>
                    
                    <div className="border-2 border-blue-500 rounded-lg p-6 max-w-sm mx-auto bg-blue-50">
                        <qrcode.QRCodeSVG value={paymentInfo.Pix.QrCodeText} size={200} className="mx-auto" />
                        <p className="font-bold text-lg mt-4">Escaneie o QR Code</p>
                    </div>

                    <p className="my-4 font-semibold text-gray-500">ou</p>

                    <div className="space-y-4">
                        <p className="font-semibold text-gray-700">Copie o código e pague no seu app do banco:</p>
                        <div className="relative">
                            <input type="text" readOnly value={paymentInfo.Pix.QrCodeText} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 pr-12 text-sm text-gray-600" />
                            <button onClick={handleCopy} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                                {isCopied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 bg-gray-100 p-4 rounded-lg text-left text-sm space-y-2">
                        <p><strong>Destinatário:</strong> {companyInfo.Name}</p>
                        <p><strong>CNPJ:</strong> {companyInfo.Document.Number.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</p>
                        <p><strong>Instituição:</strong> {companyInfo.Bank.Name}</p>
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