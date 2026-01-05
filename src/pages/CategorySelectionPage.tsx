import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, MoreVertical, Globe, AppWindow } from 'lucide-react';

// --- Interfaces ---
interface UserData {
    name: string;
}

interface Message {
    id: number;
    sender: 'bot' | 'user' | 'loading';
    content: React.ReactNode;
}

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
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            G
        </div>
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
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            G
        </div>
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

const CategorySelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state?.userData as UserData | undefined;
    const firstName = userData?.name.split(' ')[0];

    const [messages, setMessages] = useState<Message[]>([]);
    const [step, setStep] = useState<'initial' | 'loading' | 'final'>('initial');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const categoryOptions = [
        { category: "A", description: "Categoria A - Motocicletas" },
        { category: "B", description: "Categoria B - Carros" },
        { category: "AB", description: "Categoria AB - Motocicletas e Carros" },
    ];

    useEffect(() => {
        setMessages([{
            id: 1,
            sender: 'bot',
            content: "Para dar continuidade ao seu cadastro no Programa CNH do Brasil, informamos que é necessário selecionar a categoria de CNH pretendida."
        }]);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleCategorySelect = (description: string) => {
        if (step !== 'initial') return;

        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', content: description }]);
        setStep('loading');

        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'loading', content: <LoadingMessage /> }]);
        }, 500);

        setTimeout(() => {
            setMessages(prev => {
                const filtered = prev.filter(m => m.sender !== 'loading');
                return [...filtered, {
                    id: Date.now() + 2,
                    sender: 'bot',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Prezado(a) {firstName}, informamos que as aulas teóricas do Programa CNH do Brasil podem ser realizadas de forma remota, por meio de dispositivo móvel ou computador, conforme sua disponibilidade de horário.
                            </p>
                            <p>
                                Após a finalização do cadastro, o sistema liberará o acesso ao aplicativo oficial com o passo a passo completo, e você já poderá iniciar as aulas imediatamente.
                            </p>
                            <button 
                                onClick={() => navigate('/thank-you', { state: { userData } })}
                                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                Prosseguir <span aria-hidden="true">&gt;</span>
                            </button>
                        </div>
                    )
                }];
            });
            setStep('final');
        }, 2500);
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <CategorySelectionHeader userName={firstName} />
            <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto pb-4">
                    {messages.map(msg => {
                        if (msg.sender === 'bot') {
                            return (
                                <div key={msg.id}>
                                    <BotMessage>{msg.content}</BotMessage>
                                    {msg.id === 1 && step === 'initial' && (
                                        <div className="space-y-3 mt-4 animate-fade-in">
                                            {categoryOptions.map(opt => (
                                                <CategoryOption
                                                    key={opt.category}
                                                    category={opt.category}
                                                    description={opt.description}
                                                    onClick={() => handleCategorySelect(opt.description)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        if (msg.sender === 'user') return <UserMessage key={msg.id}>{msg.content}</UserMessage>;
                        if (msg.sender === 'loading') return <div key={msg.id}>{msg.content}</div>;
                        return null;
                    })}
                    <div ref={chatEndRef} />
                </div>
            </main>
        </div>
    );
};

export default CategorySelectionPage;