import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, MoreVertical, Globe, AppWindow } from 'lucide-react';

// --- Interfaces ---
interface UserData {
    name: string;
}

interface Message {
    id: number;
    sender: 'bot' | 'user';
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

const CategorySelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state?.userData as UserData | undefined;
    const firstName = userData?.name.split(' ')[0];

    const [messages, setMessages] = useState<Message[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [conversationStep, setConversationStep] = useState(0);
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
    }, [messages, isBotTyping]);

    const addMessage = (sender: 'bot' | 'user', content: React.ReactNode) => {
        setMessages(prev => [...prev, { id: Date.now(), sender, content }]);
    };

    const handleCategorySelect = (description: string) => {
        if (conversationStep !== 0) return;
        
        addMessage('user', description);
        setConversationStep(1);
        setIsBotTyping(true);

        setTimeout(() => {
            setIsBotTyping(false);
            addMessage('bot', (
                <p>
                    Prezado(a) {firstName}, informamos que as aulas teóricas do Programa CNH do Brasil podem ser realizadas de forma remota, por meio de dispositivo móvel ou computador, conforme sua disponibilidade de horário.
                </p>
            ));
        }, 1500);
    };

    const handleProsseguir = () => {
        if (conversationStep !== 1) return;

        addMessage('user', "Prosseguir");
        setConversationStep(2);
        setIsBotTyping(true);

        setTimeout(() => {
            setIsBotTyping(false);
            addMessage('bot', (
                <p>
                    O Programa CNH do Brasil segue as seguintes etapas: o candidato realiza as aulas teóricas através do aplicativo oficial e, após a conclusão, o Detran Acre disponibilizará um instrutor credenciado, sem custo adicional, para a realização das aulas práticas obrigatórias.
                </p>
            ));
        }, 1500);
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <CategorySelectionHeader userName={firstName} />
            <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto pb-4">
                    {messages.map((msg, index) => {
                        const isLastMessage = index === messages.length - 1;
                        if (msg.sender === 'bot') {
                            return (
                                <div key={msg.id}>
                                    <BotMessage>{msg.content}</BotMessage>
                                    {msg.id === 1 && conversationStep === 0 && (
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
                                    {isLastMessage && conversationStep === 1 && !isBotTyping && (
                                        <div className="mt-4 animate-fade-in">
                                            <button 
                                                onClick={handleProsseguir}
                                                className="p-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm"
                                            >
                                                Prosseguir
                                            </button>
                                        </div>
                                    )}
                                    {isLastMessage && conversationStep === 2 && !isBotTyping && (
                                        <div className="mt-4 animate-fade-in">
                                            <button 
                                                onClick={() => navigate('/thank-you', { state: { userData } })}
                                                className="p-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm"
                                            >
                                                Prosseguir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        if (msg.sender === 'user') return <UserMessage key={msg.id}>{msg.content}</UserMessage>;
                        return null;
                    })}
                    {isBotTyping && <LoadingMessage />}
                    <div ref={chatEndRef} />
                </div>
            </main>
        </div>
    );
};

export default CategorySelectionPage;