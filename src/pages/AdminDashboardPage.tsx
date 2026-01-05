import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Users, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Customer {
    name: string | null;
    cpf: string | null;
    email: string | null;
    phone: string | null;
    status: string;
}

const formatCPF = (cpf: string | null) => {
    if (!cpf) return 'N/A';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatPhone = (phone: string | null) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
};

const AdminDashboardPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaidCustomers = async () => {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    status,
                    leads (
                        name,
                        cpf,
                        email,
                        phone
                    )
                `)
                .eq('status', 'paid');

            if (error) {
                console.error('Error fetching customers:', error);
                setError('Falha ao buscar os dados dos clientes. Tente novamente mais tarde.');
            } else if (data) {
                const formattedData = data
                    .filter(tx => tx.leads) // Garante que o lead associado não é nulo
                    .map(tx => ({
                        name: tx.leads!.name,
                        cpf: tx.leads!.cpf,
                        email: tx.leads!.email,
                        phone: tx.leads!.phone,
                        status: tx.status,
                    }));
                setCustomers(formattedData);
            }
            setIsLoading(false);
        };

        fetchPaidCustomers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/Gov.br_logo.svg.png" alt="gov.br" className="h-8" />
                        <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                        <ShieldCheck size={20} />
                        <span className="font-semibold">Acesso Seguro</span>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <Users className="w-8 h-8 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Clientes com Pagamento Aprovado</h2>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3">
                            <AlertTriangle />
                            <p>{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Celular</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customers.length > 0 ? (
                                        customers.map((customer, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCPF(customer.cpf)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhone(customer.phone)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Pago
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                                Nenhum cliente com pagamento aprovado encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;