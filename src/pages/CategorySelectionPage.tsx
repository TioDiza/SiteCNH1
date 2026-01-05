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

// --- Mappings ---
const stateAbbreviations: { [key: string]: string } = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
    'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
    'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
    'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
    'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
    'Sergipe': 'SE', 'Tocantins': 'TO'
};

const detranLogos: { [key: string]: string } = {
    'Acre': '/detran-logos/acre.png',
    'Alagoas': '/detran-logos/alagoas.png',
    'Amapá': '/detran-logos/amapa.png',
    'Amazonas': '/detran-logos/amazonas.png',
    'Bahia': '/detran-logos/bahia.png',
    'Ceará': '/detran-logos/ceara.png',
    'Distrito Federal': '/detran-logos/distrito-federal.png',
    'Espírito Santo': '/detran-logos/espirito-santo.png',
    'Goiás': '/detran-logos/goias.png',
    'Maranhão': '/detran-logos/maranhao.png',
    'Mato Grosso': '/detran-logos/mato-grosso.png',
    'Mato Grosso do Sul': '/detran-logos/mato-grosso-do-sul.png',
    'Minas Gerais': '/detran-logos/minas-gerais.png',
    'Pará': '/detran-logos/para.png',
    'Paraíba': '/detran-logos/paraiba.png',
    'Paraná': '/detran-logos/parana.png',
    'Pernambuco': '/detran-logos/pernambuco.png',
    'Piauí': '/detran-logos/piaui.png',
    'Rio de Janeiro': '/detran-logos/rio-de-janeiro.png',
    'Rio Grande do Norte': '/detran-logos/rio-grande-do-norte.png',
    'Rio Grande do Sul': '/detran-logos/rio-grande-do-sul.png',
    'Rondônia': '/detran-logos/rondonia.png',
    'Roraima': '/detran-logos/roraima.png',
    'Santa Catarina': '/detran-logos/santa-catarina.png',
    'São Paulo': '/detran-logos/sao-paulo.png',
    'Sergipe': '/detran-logos/sergipe.png',
    'Tocantins': '/detran-logos/tocantins.png'
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
        className="w-full text-left p-4 border-2 border-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 flex items-center gap-4 shadow-md hover:shadow-lg transform hover:-translate-y-1"
    >
        <span className="font-bold text-2xl text-[#004381]">{category}</span>
        <span className="text-gray-800 font-semibold">{description}</span>
    </button>
);

const MonthOption: React.FC<{ month: string; vagas: number; onClick: () => void }> = ({ month, vagas, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-center p-3 border-2 border-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
    >
        <p className="font-bold text-gray-800">{month}</p>
        <p className="text-sm text-[#004381] font-extrabold uppercase">{vagas} vagas</p>
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
    const logoSrc = detranLogos[selectedState || ''];

    // Simple SVG placeholder for a QR Code
    const QrCodePlaceholder = () => (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 0H40V40H0V0ZM10 10V30H30V10H10Z" fill="black"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M60 0H100V40H60V0ZM70 10V30H90V10H70Z" fill="black"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M0 60H40V100H0V60ZM10 70V90H30V70H10Z" fill="black"/>
            <path d="M60 60H70V70H60V60Z" fill="black"/>
            <path d="M80 60H90V70H80V60Z" fill="black"/>
            <path d="M60 80H70V90H60V80Z" fill="black"/>
            <path d="M80 80H90V90H80V80Z" fill="black"/>
            <path d="M40 50H50V60H40V50Z" fill="black"/>
            <path d="M50 40H60V50H50V40Z" fill="black"/>
            <path d="M70 50H80V60H70V50Z" fill="black"/>
            <path d="M90 40H100V50H90V40Z" fill="black"/>
            <path d="M50 70H60V80H50V70Z" fill="black"/>
            <path d="M40 90H50V100H40V90Z" fill="black"/>
            <path d="M70 90H80V100H70V90Z" fill="black"/>
            <path d="M90 80H100V90H90V80Z" fill="black"/>
        </svg>
    );

    return (
        <div className="bg-white text-gray-800 rounded-lg border border-gray-300 p-6 font-sans text-sm w-full max-w-md shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                {logoSrc ? (
                    <img src={logoSrc} alt={`Logo DETRAN ${selectedState}`} className="h-14 w-auto" />
                ) : (
                    <div className="h-14"></div> // Placeholder to keep height consistent
                )}
                <div className="text-right">
                    <img src="/Gov.br_logo.svg.png" alt="gov.br" className="h-8 ml-auto mb-2" />
                    <div className="text-xs text-gray-600">
                        <p className="font-bold">República Federativa do Brasil</p>
                        <p>Ministério dos Transportes</p>
                        <p className="font-semibold">SENATRAN</p>
                    </div>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-center font-bold text-base text-gray-700 my-4 tracking-wider">
                COMPROVANTE DE INSCRIÇÃO
            </h1>

            {/* User Info */}
            <div className="space-y-3 text-xs mb-4">
                <div className="flex justify-between">
                    <div>
                        <p className="text-gray-500">NOME DO CANDIDATO</p>
                        <p className="font-semibold text-base">{userData.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">CPF</p>
                        <p className="font-semibold text-base">{userData.cpf}</p>
                    </div>
                </div>
            </div>

            {/* RENACH Section */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center my-4">
                <p className="text-xs text-gray-600 font-semibold tracking-wide">NÚMERO DO REGISTRO NACIONAL DE CONDUTORES HABILITADOS (RENACH)</p>
                <p className="font-mono text-2xl font-bold text-[#004381] tracking-widest py-2">{renach}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div>
                    <p className="text-gray-500">CATEGORIA PRETENDIDA</p>
                    <p className="font-bold text-lg">{selectedCategory}</p>
                </div>
                <div>
                    <p className="text-gray-500">MÊS DE AGENDAMENTO</p>
                    <p className="font-semibold text-base">{selectedMonth.replace('/', '/ ')}</p>
                </div>
                <div>
                    <p className="text-gray-500">PROTOCOLO</p>
                    <p className="font-mono text-base">{protocolo}</p>
                </div>
                <div>
                    <p className="text-gray-500">STATUS</p>
                    <span className="font-bold text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg inline-block mt-1">
                        AGUARDANDO AGENDAMENTO
                    </span>
                </div>
            </div>

            <hr className="border-dashed" />

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-left text-[10px] text-gray-500">
                    <p>Emitido em: {emissionDate}</p>
                    <p className="mt-1">Este é um comprovante provisório de inscrição.<br/>Acompanhe o status no aplicativo Gov.br.</p>
                </div>
                <div>
                    <QrCodePlaceholder />
                </div>
            </div>
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

    const handleShowTaxMessage = () => {
        if (conversationStep !== 5) return;
        addMessage('user', "Prosseguir");
        setConversationStep(6);
        setIsBotTyping(true);
        setTimeout(() => {
            addMessage('bot', (
                <>
                    <p className="mb-2">Prezado(a) {firstName}, seu cadastro encontra-se com status PENDENTE. Para liberação do acesso ao aplicativo de aulas e prosseguimento do processo, é obrigatório o recolhimento das Taxas Administrativas junto ao DETRAN.</p>
                    <p>O valor das taxas será calculado e apresentado na guia de pagamento.</p>
                </>
            ));
            setIsBotTyping(false);
        }, 1500);
    };

    const handleNavigateToThankYou = () => {
        navigate('/thank-you');
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
                        <button onClick={handleProsseguir} className="w-full bg-[#004381] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition-all shadow-md active:scale-95 text-center">Prosseguir</button>
                    </div>
                );
            case 3:
                return (
                    <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-in">
                        {monthOptions.map(opt => <MonthOption key={opt.month} {...opt} onClick={() => handleMonthSelect(opt.month)} />)}
                    </div>
                );
            case 5:
                return (
                    <div className="mt-4 animate-fade-in">
                        <button onClick={handleShowTaxMessage} className="w-full bg-[#004381] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition-all shadow-md active:scale-95 text-center">Prosseguir</button>
                    </div>
                );
            case 6:
                 return (
                    <div className="mt-4 animate-fade-in">
                        <button onClick={handleNavigateToThankYou} className="w-full bg-[#004381] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition-all shadow-md active:scale-95 text-center">Prosseguir</button>
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
            </main>
        </div>
    );
};

export default CategorySelectionPage;