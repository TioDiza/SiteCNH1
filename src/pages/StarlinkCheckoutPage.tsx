import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const StarlinkCheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingCep, setIsFetchingCep] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cpf') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
        } else if (name === 'phone') {
            formattedValue = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
        } else if (name === 'cep') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setIsFetchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    street: data.logouro || '',
                    neighborhood: data.bairro || '',
                    city: data.localidade || '',
                    state: data.uf || '',
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setIsFetchingCep(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const customerToSave = {
            name: formData.name,
            cpf: formData.cpf.replace(/\D/g, ''),
            phone: formData.phone,
            email: formData.email,
            address: {
                cep: formData.cep,
                street: formData.street,
                number: formData.number,
                neighborhood: formData.neighborhood,
                city: formData.city,
                state: formData.state,
            }
        };

        try {
            const { data: customerData, error: upsertError } = await supabase.functions.invoke('upsert-starlink-customer', {
                body: customerToSave,
            });

            if (upsertError) {
                throw upsertError;
            }

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

            if (paymentError) {
                throw paymentError;
            }

            navigate('/starlink-payment', { state: { paymentInfo: paymentData, userName: customerData.name.split(' ')[0] } });

        } catch (err: any) {
            setIsLoading(false);
            console.error("Erro no processo de checkout:", err);
            // Tenta extrair uma mensagem de erro mais específica da resposta da função
            const functionError = err.context?.data?.error || err.context?.error || err.message;
            setError(functionError || "Ocorreu um erro. Tente novamente.");
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4">
            <main className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">Finalize sua Compra Starlink</h1>
                    <p className="text-gray-600">Preencha seus dados para entrega da antena.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-bold">Nome Completo</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                        <div>
                            <label className="font-bold">CPF</label>
                            <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-bold">Celular (WhatsApp)</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                        <div>
                            <label className="font-bold">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                    </div>
                    <hr />
                    <h2 className="text-xl font-bold text-gray-700">Endereço de Entrega</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 relative">
                            <label className="font-bold">CEP</label>
                            <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} onBlur={handleCepBlur} required className="w-full p-3 border rounded-lg mt-1" />
                            {isFetchingCep && <Loader2 className="absolute right-3 top-10 animate-spin text-gray-400" />}
                        </div>
                        <div className="md:col-span-2">
                            <label className="font-bold">Rua / Avenida</label>
                            <input type="text" name="street" value={formData.street} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="font-bold">Número</label>
                            <input type="text" name="number" value={formData.number} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="font-bold">Bairro</label>
                            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="font-bold">Cidade</label>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                        <div>
                            <label className="font-bold">Estado</label>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="w-full p-3 border rounded-lg mt-1" />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3">
                            <AlertTriangle size={20} /> <p>{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2">
                        {isLoading ? <><Loader2 className="animate-spin" /> Processando...</> : 'Finalizar Cadastro e Pagar'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default StarlinkCheckoutPage;