import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Loader2, ClipboardCopy, CheckCircle, AlertTriangle, Smartphone, Info } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const PaymentHeader: React.FC<{ userName?: string }> = ({ userName }) => (
    <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
            <div className="py-3 flex items-center justify-between">
                <img src="/Gov.br_logo.svg.png" alt="gov.br" className="h-8 md-h-10" />
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
    const [userData, setUserData] = useState<{ name: string; cpf: string; leadId: string; email: string; phone: string; } | null>(null);
    
    const [paymentData, setPaymentData] = useState<{ qrCode: string; pixCode: string; transactionId: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [feeAmount] = useState(87.90);

    useEffect(() => {
        let data: { name: string; cpf: string; leadId: string; email: string; phone: string; } | null = null;
        
        const savedData = sessionStorage.getItem('cnh_userData');
        
        if (savedData) {
            try {
                data = JSON.parse(savedData);
            } catch (e) {
                data = null;
            }
        }

        if (data && data.leadId && data.email && data.phone) {
            setUserData(data);
        } else {
            setError('Não foi possível encontrar seus dados de contato. Por favor, reinicie o cadastro.');
            setIsLoading(false);
            return;
        }

        const generatePayment = async () => {
            if (!data) return;

            try {
                const unformattedCpf = data.cpf.replace(/\D/g, '');

                const clientPayload = {
                    name: data.name,
                    document: unformattedCpf,
                    telefone: data.phone.replace(/\D/g, ''),
                    email: data.email,
                };

                const { data: paymentResult, error: functionError } = await supabase.functions.invoke('create-payment', {
                    body: { client: clientPayload, amount: feeAmount, lead_id: data.leadId },
                });

                if (functionError) throw new Error(functionError.message);
                if (paymentResult.status !== 'success') throw new Error(paymentResult.message || 'Falha ao gerar o pagamento PIX.');

                setPaymentData({
                    qrCode: paymentResult.paymentCodeBase64,
                    pixCode: paymentResult.paymentCode,
                    transactionId: paymentResult.idTransaction,
                });

            } catch (err: any) {
                setError(err.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.');
            } finally {
                setIsLoading(false);
            }
        };

        if (data) {
            generatePayment();
        }
    }, [feeAmount]);

    // Listener para aguardar a confirmação do pagamento via webhook
    useEffect(() => {
        if (!paymentData) return;

        const channel = supabase
            .channel(`transactions:gateway_transaction_id=eq.${paymentData.transactionId}`)
            .on(
                'postgres_changes',
                { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'transactions', 
                    filter: `gateway_transaction_id=eq.${paymentData.transactionId}` 
                },
                (payload) => {
                    if (payload.new.status === 'paid') {
                        navigate('/payment-success');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [paymentData, navigate]);

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
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Taxa de Emissão da CNH</h1>
                    <p className="text-gray-600 mb-6 text-center">Esta é a última taxa obrigatória. Após a confirmação do pagamento, você receberá acesso completo ao aplicativo do Programa CNH do Brasil.</p>

                    <div className="flex justify-center my-6">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                            <Smartphone size={48} className="text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-6 space-y-2">
                        <p className="font-bold flex items-center gap-2"><Info size={20} /> Importante</p>
                        <ul className="list-disc list-inside text-sm space-y-1 pl-2">
                            <li>Esta taxa é <strong>obrigatória</strong> para finalizar seu cadastro no Programa CNH do Brasil</li>
                            <li>Valor único pago uma única vez</li>
                            <li>Taxa destinada ao processo de emissão e regularização da CNH</li>
                            <li>Seu cadastro só será concluído após a confirmação deste pagamento</li>
                        </ul>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-8">
                        <p className="font-bold flex items-center gap-2"><AlertTriangle size={20} /> Atenção</p>
                        <p className="text-sm mt-2">
                            Informamos que, caso o pagamento da <strong>Taxa de Emissão da CNH</strong> não seja realizado, seu cadastro <strong>não será concluído</strong> e você <strong>perderá o direito de participar do Programa CNH do Brasil</strong>. Conforme o art. 49, §2º da Lei nº 8.078/1990 (Código de Defesa do Consumidor), não haverá reembolso do valor já pago referente às taxas administrativas, uma vez que o serviço de processamento já foi iniciado junto ao DETRAN.
                        </p>
                    </div>

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
                            <p className="text-lg font-semibold text-gray-800">Taxa única de emissão</p>
                            <p className="text-5xl font-bold text-gray-900 my-2">
                                R$ {feeAmount.toFixed(2).replace('.', ',')}
                            </p>
                            
                            <div className="bg-yellow-100 text-yellow-800 font-semibold px-4 py-2 rounded-full my-4 text-sm animate-pulse">
                                Aguardando pagamento...
                            </div>

                            <img 
                                src={paymentData.qrCode} 
                                alt="QR Code para pagamento PIX"
                                className="w-64 h-64 rounded-lg border-4 border-gray-200 my-4"
                            />
                            <p className="font-semibold text-gray-700 mb-4">Escaneie o QR Code com o app do seu banco</p>
                            
                            <p className="font-semibold text-gray-700 mb-2 mt-4">Código PIX Copia e Cola:</p>
                            <div className="relative w-full mb-4">
                                <textarea
                                    readOnly
                                    value={paymentData.pixCode}
                                    className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm text-gray-600 resize-none h-24"
                                />
                            </div>
                            <button 
                                onClick={handleCopyToClipboard}
                                className="w-full bg-[#0d6efd] text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isCopied ? <><CheckCircle size={20} /> Copiado!</> : <><ClipboardCopy size={20} /> Copiar Código PIX</>}
                            </button>

                            <p className="text-xs text-gray-400 mt-6">ID da Transação: {paymentData.transactionId}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PaymentPage;