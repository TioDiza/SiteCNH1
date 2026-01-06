import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { LogOut, ShieldCheck, Users, DollarSign, Percent, Loader2, AlertTriangle, MessageSquare, CheckSquare, RefreshCw, Wifi, Car } from 'lucide-react';

// Interfaces
interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    contact_status: string;
}

interface Transaction {
    id: string;
    amount: number;
    status: string;
    provider: string;
    created_at: string;
    leads: Lead | null;
}

interface StarlinkCustomer {
    id: string;
    name: string;
    cpf: string;
    phone: string;
    address: {
        cep: string;
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
    } | null;
    created_at: string;
    transactions: { status: string, created_at: string }[];
}

// Components
const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AdminDashboardPage: React.FC = () => {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('cnh');
    
    // CNH State
    const [cnhStats, setCnhStats] = useState({ totalLeads: 0, totalRevenue: 0, paidTransactions: 0 });
    const [cnhTransactions, setCnhTransactions] = useState<Transaction[]>([]);

    // Starlink State
    const [starlinkCustomers, setStarlinkCustomers] = useState<StarlinkCustomer[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch CNH Data
            const { count: totalLeadsCount, error: countError } = await supabase.from('leads').select('*', { count: 'exact', head: true });
            if (countError) throw countError;

            const { data: cnhData, error: cnhError } = await supabase.from('transactions').select('*, leads(*)').not('lead_id', 'is', null).eq('status', 'paid').order('created_at', { ascending: false });
            if (cnhError) throw cnhError;
            
            const typedCnhTransactions = cnhData as Transaction[];
            
            const paidLeads = new Map<string, Transaction>();
            typedCnhTransactions.forEach(t => {
                if (t.leads && !paidLeads.has(t.leads.id)) {
                    paidLeads.set(t.leads.id, t);
                }
            });
            const uniquePaidLeadTransactions = Array.from(paidLeads.values());
            const paidLeadsCount = paidLeads.size;

            const cnhRevenue = typedCnhTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            
            setCnhTransactions(uniquePaidLeadTransactions);
            setCnhStats({ totalLeads: totalLeadsCount || 0, totalRevenue: cnhRevenue, paidTransactions: paidLeadsCount });

            // Fetch Starlink Data
            const { data: starlinkData, error: starlinkError } = await supabase.from('starlink_customers').select('*, transactions(status, created_at)').order('created_at', { ascending: false });
            if (starlinkError) throw starlinkError;
            setStarlinkCustomers(starlinkData as StarlinkCustomer[]);

        } catch (err: any) {
            console.error("Erro ao buscar dados:", err);
            setError("Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateContactStatus = async (leadId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Aguardando Contato' ? 'Contato Realizado' : 'Aguardando Contato';
        setCnhTransactions(prev => prev.map(t => t.leads?.id === leadId ? { ...t, leads: { ...t.leads!, contact_status: newStatus } } : t));
        const { error: updateError } = await supabase.from('leads').update({ contact_status: newStatus }).eq('id', leadId);
        if (updateError) {
            setError("Falha ao atualizar o status.");
            setCnhTransactions(prev => prev.map(t => t.leads?.id === leadId ? { ...t, leads: { ...t.leads!, contact_status: currentStatus } } : t));
        }
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');
    const conversionRate = cnhStats.totalLeads > 0 ? ((cnhStats.paidTransactions / cnhStats.totalLeads) * 100).toFixed(2) : '0.00';

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3"><img src="/Gov.br_logo.svg.png" alt="gov.br" className="h-8" /><h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1></div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600"><ShieldCheck size={20} /><span className="font-semibold hidden sm:inline">{user?.email}</span></div>
                        <button onClick={fetchData} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400" disabled={loading}>{loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}<span className="hidden sm:inline">Atualizar</span></button>
                        <button onClick={signOut} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors"><LogOut size={18} /> Sair</button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('cnh')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'cnh' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Car size={16}/> Vendas CNH</button>
                        <button onClick={() => setActiveTab('starlink')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'starlink' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Wifi size={16}/> Clientes Starlink</button>
                    </nav>
                </div>

                {loading ? <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div> : error ? <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3"><AlertTriangle size={20} /> <p>{error}</p></div> : 
                
                activeTab === 'cnh' ? (
                    <div id="cnh-content">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <StatCard title="Total de Leads" value={cnhStats.totalLeads.toString()} icon={Users} />
                            <StatCard title="Receita Total" value={formatCurrency(cnhStats.totalRevenue)} icon={DollarSign} />
                            <StatCard title="Taxa de Conversão" value={`${conversionRate}%`} icon={Percent} />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold text-gray-800 mb-4">Clientes CNH com Pagamento Aprovado</h2><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3">Cliente</th><th scope="col" className="px-4 py-3">Email</th><th scope="col" className="px-4 py-3">Telefone</th><th scope="col" className="px-4 py-3">CPF</th><th scope="col" className="px-4 py-3">Data Pagamento</th><th scope="col" className="px-4 py-3">Status Contato</th><th scope="col" className="px-4 py-3">Ações</th></tr></thead><tbody>{cnhTransactions.map(t => t.leads && (<tr key={t.id} className="bg-white border-b hover:bg-gray-50"><td className="px-4 py-4 font-medium text-gray-900">{t.leads.name}</td><td className="px-4 py-4">{t.leads.email}</td><td className="px-4 py-4">{t.leads.phone}</td><td className="px-4 py-4">{t.leads.cpf}</td><td className="px-4 py-4">{formatDate(t.created_at)}</td><td className="px-4 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.leads.contact_status === 'Contato Realizado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t.leads.contact_status}</span></td><td className="px-4 py-4"><button onClick={() => handleUpdateContactStatus(t.leads!.id, t.leads!.contact_status)} className={`flex items-center gap-2 text-xs font-bold py-1 px-3 rounded-full transition-colors ${t.leads.contact_status === 'Aguardando Contato' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>{t.leads.contact_status === 'Aguardando Contato' ? <><MessageSquare size={14}/> Marcar como Contatado</> : <><CheckSquare size={14}/> Mover para Aguardando</>}</button></td></tr>))}</tbody></table></div></div>
                    </div>
                ) : (
                    <div id="starlink-content">
                        <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold text-gray-800 mb-4">Clientes Starlink</h2><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3">Cliente</th><th scope="col" className="px-4 py-3">Contato</th><th scope="col" className="px-4 py-3">Endereço</th><th scope="col" className="px-4 py-3">Data Cadastro</th><th scope="col" className="px-4 py-3">Status Pagamento</th></tr></thead><tbody>{starlinkCustomers.map(c => (<tr key={c.id} className="bg-white border-b hover:bg-gray-50"><td className="px-4 py-4 font-medium text-gray-900">{c.name}<br/><span className="font-normal text-gray-500">{c.cpf}</span></td><td className="px-4 py-4">{c.phone}</td><td className="px-4 py-4">{c.address ? `${c.address.street}, ${c.address.number} - ${c.address.neighborhood}, ${c.address.city} - ${c.address.state}, ${c.address.cep}` : 'Endereço não informado'}</td><td className="px-4 py-4">{formatDate(c.created_at)}</td><td className="px-4 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.transactions[0]?.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.transactions[0]?.status === 'paid' ? 'Pago' : 'Pendente'}</span></td></tr>))}</tbody></table></div></div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboardPage;