import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, MoreVertical, Globe, AppWindow } from 'lucide-react';

// --- Interfaces ---
interface UserData {
    name: string;
    cpf: string;
}

interface Message {
    id: number;
    sender: 'bot' | 'user' | 'component';
    content: React.ReactNode;
}

// --- State Abbreviations ---
const stateAbbreviations: { [key: string]: string } = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
    'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
    'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
    'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
    'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
    'Sergipe': 'SE', 'Tocantins': 'TO'
};

// --- Components ---

const CategorySelectionHeader: React.FC<{ userName?: string }> = ({ userName }) => (
    <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
            <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img 
                        src="/Gov.br_logo.svg.png" 
                        alt="gov.br" 
                        className="h-8 md:h-10"
                    />
                    <button className="text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical size={20} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Globe size={20} /></button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><AppWindow size={20} /></button>
                    <button className="flex items-center gap-2 bg-[#004381] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors">
                        <User size={18} />
                        <span>{userName || 'Entrar'}</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const BotMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start gap-3 animate-fade-in">
        <img 
            src="/gov-br-avatar.jpg" 
            alt="Atendimento Gov.br" 
            className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div>
            <p className="font-bold text-gray-800">Atendimento Gov.br</p>
            <div className="bg-[#004381] text-white p-4 rounded-lg rounded-tl-none mt-1 max-w-md">
                {children}
            </div>
        </div>
    </div>
);

const UserMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex justify-end animate-fade-in">
        <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-md">
            {children}
        </div>
    </div>
);

const LoadingMessage: React.FC = () => (
     <div className="flex items-start gap-3 animate-fade-in">
        <img 
            src="/gov-br-avatar.jpg" 
            alt="Atendimento Gov.br" 
            className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div>
             <p className="font-bold text-gray-800">Atendimento Gov.br</p>
            <div className="bg-[#004381] text-white p-4 rounded-lg rounded-tl-none mt-1 inline-flex items-center gap-2">
               <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
               <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:0.2s]"></div>
               <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
        </div>
    </div>
);

const CategoryOption: React.FC<{ category: string; description: string; onClick: () => void }> = ({ category, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4 shadow-sm"
    >
        <span className="font-bold text-xl text-[#004381]">{category}</span>
        <span className="text-gray-700">{description}</span>
    </button>
);

const MonthOption: React.FC<{ month: string; vagas: number; onClick: () => void }> = ({ month, vagas, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-center p-3 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
    >
        <p className="font-semibold text-gray-700">{month}</p>
        <p className="text-sm text-blue-600 font-bold">{vagas} vagas</p>
    </button>
);

const ComprovanteCadastro: React.FC<{
    userData: UserData;
    selectedState: string;
    selectedMonth: string;
    selectedCategory: string;
    renach: string;
    protocolo: string;
    emissionDate: string;
}> = ({ userData, selectedState, selectedMonth, selectedCategory, renach, protocolo, emissionDate }) => {
    const stateAbbr = stateAbbreviations[selectedState || ''] || '';
    return (
        <div className="bg-white text-gray-800 rounded-lg border border-gray-200 p-4 font-sans text-sm w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-lg tracking-wider">DETRAN.{stateAbbr}</p>
                <p className="text-xs text-gray-500">Protocolo: {protocolo}</p>
            </div>
            <p className="text-center font-bold text-gray-600 mb-6">COMPROVANTE DE CADASTRO - RENACH</p>
            <div className="grid grid-cols-2 gap-y-4 text-left">
                <div>
                    <p className="text-xs text-gray-500">NOME</p>
                    <p className="font-semibold">{userData.name}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">CPF</p>
                    <p className="font-semibold">{userData.cpf}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-l-md -ml-4">
                    <p className="text-xs text-gray-500">Nº RENACH</p>
                    <p className="font-semibold text-blue-700">{renach}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-r-md -mr-4">
                    <p className="text-xs text-gray-500">CATEGORIA</p>
                    <p className="font-bold">{selectedCategory}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">MÊS PREVISTO</p>
                    <p className="font-semibold">{selectedMonth.replace('/', '/ ')}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">STATUS</p>
                    <p className="font-bold text-orange-500">PENDENTE</p>
                </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">Emitido em {emissionDate}</p>
        </div>
    );
};

const CategorySelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const userData: UserData | undefined = location.state?.userData || JSON.parse(sessionStorage.getItem('cnh_userData') || 'null');
    const selectedState: string | undefined = location.state?.selectedState || sessionStorage.getItem('cnh_selectedState') || undefined;
    
    const firstName = userData?.name.split(' ')[0];

    const [messages, setMessages] = useState<Message[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [conversationStep, setConversationStep] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const effectRan = useRef(false);

    const categoryOptions = [
        { category: "A", description: "Categoria A - Motocicletas" },
        { category: "B", description: "Categoria B - Carros" },
        { category: "AB", description: "Categoria AB - Motocicletas e Carros" },
    ];

    const monthOptions = [
        { month: 'JANEIRO/2026', vagas: 9 }, { month: 'FEVEREIRO/2026', vagas: 6 },
        { month: 'MARÇO/2026', vagas: 10 }, { month: 'ABRIL/2026', vagas: 12 },
        { month: 'MAIO/2026', vagas: 12 }, { month: 'JUNHO/2026', vagas: 8 },
        { month: 'JULHO/2026', vagas: 9 }, { month: 'AGOSTO/2026', vagas: 8 },
        { month: 'SETEMBRO/2026', vagas: 6 }, { month: 'OUTUBRO/2026', vagas: 12 },
    ];

    const addMessage = (sender: 'bot' | 'user' | 'component', content: React.ReactNode) => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender, content }]);
    };

    useEffect(() => {
        if (effectRan.current === false) {
            if (!userData || !selectedState) {
                console.error("CategorySelectionPage: Dados de usuário ou estado não encontrados. Redirecionando para o login.", { userData, selectedState });
                navigate('/login');
            } else {
                addMessage('bot', "Para dar continuidade ao seu cadastro no Programa CNH do Brasil, informamos que é necessário selecionar a categoria de CNH pretendida.");
            }
        }

        return () => {
            effectRan.current = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isBotTyping]);

    const handleCategorySelect = (category: string, description: string) => {
        if (conversationStep !== 0) return;
        addMessage('user', description);
        setSelectedCategory(category);
        setConversationStep(1);

        setIsBotTyping(true);
        setTimeout(() => {
            addMessage('bot', <p>Prezado(a) {firstName}, informamos que as aulas teóricas do Programa CNH do Brasil podem ser realizadas de forma remota, por meio de dispositivo móvel ou computador, conforme sua disponibilidade de horário.</p>);
            setIsBotTyping(false);
        }, 1500);
    };

    const handleProsseguir = () => {
        if (conversationStep !== 1 && conversationStep !== 2) return;
        addMessage('user', "Prosseguir");
        const nextStep = conversationStep + 1;
        setConversationStep(nextStep);

        setIsBotTyping(true);
        setTimeout(() => {
            if (nextStep === 2) {
                addMessage('bot', <p>O Programa CNH do Brasil segue as seguintes etapas: o candidato realiza as aulas teóricas através do aplicativo oficial e, após a conclusão, o Detran {selectedState || ''} disponibilizará um instrutor credenciado, sem custo adicional, para a realização das aulas práticas obrigatórias.</p>);
            } else if (nextStep === 3) {
                addMessage('bot', "Selecione o mês de sua preferência para realização das avaliações:");
            }
            setIsBotTyping(false);
        }, 1500);
    };

    const handleMonthSelect = (month: string) => {
        if (conversationStep !== 3) return;
        addMessage('user', month);
        setConversationStep(4);

        if (!userData || !selectedState || !selectedCategory) {
            setIsBotTyping(true);
            setTimeout(() => {
                addMessage('bot', 'Ocorreu um erro. Por favor, reinicie o processo.');
                setIsBotTyping(false);
            }, 1000);
            return;
        }

        setIsBotTyping(true);
        setTimeout(() => {
            const renach = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const protocolo = `2026658${Math.floor(100000 + Math.random() * 900000).toString()}`;
            const emissionDate = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' às');

            addMessage('bot', (
                <>
                    <p className="mb-4">Prezado(a) {firstName}, seu número de RENACH foi gerado com sucesso junto ao Detran {selectedState}.</p>
                    <p className="mb-4"><strong>Número do RENACH: {renach}</strong></p>
                    <p>O RENACH (Registro Nacional de Carteira de Habilitação) é o número de identificação único do candidato no Sistema Nacional de Habilitação.</p>
                </>
            ));
            addMessage('component', 
                <ComprovanteCadastro
                    userData={userData}
                    selectedState={selectedState}
                    selectedMonth={month}
                    selectedCategory={selectedCategory}
                    renach={renach}
                    protocolo={protocolo}
                    emissionDate={emissionDate}
                />
            );
            setIsBotTyping(false);
            setConversationStep(5);
        }, 2000);
    };

    const handleFinalProsseguir = () => {
        if (!userData) return;
        navigate('/thank-you', { state: { userData } });
    };

    const renderUserActions = () => {
        if (isBotTyping) return null;
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.sender === 'user') return null;

        switch (conversationStep) {
            case 0:
                return (
                    <div className="space-y-3 mt-4 animate-fade-in">
                        {categoryOptions.map(opt => <CategoryOption key={opt.category} {...opt} onClick={() => handleCategorySelect(opt.category, opt.description)} />)}
                    </div>
                );
            case 1:
            case 2:
                return (
                    <div className="mt-4 animate-fade-in">
                        <button onClick={handleProsseguir} className="p-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm">Prosseguir</button>
                    </div>
                );
            case 3:
                return (
                    <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-in">
                        {monthOptions.map(opt => <MonthOption key={opt.month} {...opt} onClick={() => handleMonthSelect(opt.month)} />)}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <CategorySelectionHeader userName={firstName} />
            <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto pb-4">
                    {messages.map((msg) => {
                        if (msg.sender === 'bot') return <BotMessage key={msg.id}>{msg.content}</BotMessage>;
                        if (msg.sender === 'user') return <UserMessage key={msg.id}>{msg.content}</UserMessage>;
                        if (msg.sender === 'component') return <div key={msg.id} className="animate-fade-in">{msg.content}</div>;
                        return null;
                    })}
                    {renderUserActions()}
                    {isBotTyping && <LoadingMessage />}
                    <div ref={chatEndRef} />
                </div>
                {conversationStep === 5 && !isBotTyping && (
                    <div className="mt-4 animate-fade-in">
                        <button onClick={handleFinalProsseguir} className="w-full bg-[#004381] text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors">
                            Prosseguir &gt;
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CategorySelectionPage;