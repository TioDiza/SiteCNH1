import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { X, Loader2, AlertTriangle, Copy, CheckCircle, DollarSign } from 'lucide-react';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setAmount('');
      return;
    }
    const numberValue = parseInt(value, 10);
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue / 100);
    setAmount(formattedValue);
  };

  const parseAmountToCents = (formattedAmount: string): number => {
    const numericString = formattedAmount.replace(/\D/g, '');
    return parseInt(numericString, 10) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const amountInCents = parseAmountToCents(amount);
    if (amountInCents <= 0) {
      setError("Por favor, insira um valor válido.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        amount: amountInCents,
        customer: {
          name: "Pagamento Avulso - Admin",
          email: user?.email || "admin@gov.br",
          document: { type: 'cpf', number: "00000000000" },
          phone: "00000000000",
        },
        items: [{
          title: 'Pagamento Avulso',
          unit_price: amountInCents,
          quantity: 1,
          tangible: false
        }],
        metadata: {
          source: 'admin_dashboard',
          created_by: user?.id || 'unknown_admin'
        },
      };

      const { data, error: paymentError } = await supabase.functions.invoke('create-payment', { body: payload });
      if (paymentError) throw paymentError;
      setPaymentInfo(data);

    } catch (err: any) {
      console.error("Erro ao criar pagamento avulso:", err);
      setError(err.message || "Ocorreu um erro ao gerar o PIX. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (paymentInfo?.Pix?.QrCodeText) {
      navigator.clipboard.writeText(paymentInfo.Pix.QrCodeText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setAmount('');
    setError(null);
    setPaymentInfo(null);
    setIsLoading(false);
    setIsCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <img src="/Gov.br_logo.svg.png" alt="gov.br" className="h-8" />
            <h2 className="text-lg font-bold text-gray-800">Receber Pagamento</h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </header>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-lg text-gray-600">Gerando PIX...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3">
              <AlertTriangle size={20} /> <p>{error}</p>
            </div>
          ) : paymentInfo ? (
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">PIX Gerado com Sucesso!</h3>
              <p className="text-gray-600 mb-4">
                Valor: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paymentInfo.Amount)}</strong>
              </p>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={paymentInfo.Pix.QrCodeText} size={200} />
              </div>
              <div className="relative bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm text-gray-600 text-left break-all">
                {paymentInfo.Pix.QrCodeText}
              </div>
              <button onClick={handleCopy} className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                {isCopied ? <><CheckCircle size={20} /> Copiado!</> : <><Copy size={20} /> Copiar Código PIX</>}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Valor a ser cobrado</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="R$ 0,00"
                    required
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors">
                Gerar PIX
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivePaymentModal;