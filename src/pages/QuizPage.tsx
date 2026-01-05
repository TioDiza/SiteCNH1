import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

const QuizHeader: React.FC = () => (
    <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
            <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img 
                        src="/Gov.br_logo.svg.png" 
                        alt="gov.br" 
                        className="h-8 md:h-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-[#004381] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors">
                        <User size={18} />
                        <span>Entrar</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const quizQuestions = [
    { id: 1, question: "Qual dessas situações mais representa você hoje?", options: ["Quero tirar a CNH, mas sempre acabo adiando", "Já tentei e reprovei, isso me desmotivou", "Meu processo venceu e não sei como resolver", "Preciso da CNH com urgência", "Nunca tentei, mas quero começar do jeito certo"] },
    { id: 2, question: "O que mais te impede de tirar a CNH hoje?", options: ["Medo de reprovar novamente", "Falta de orientação clara", "Falta de tempo", "Questão financeira", "Nunca soube por onde começar"] },
    { id: 3, question: "Em qual etapa você parou ou está hoje?", options: ["Nunca iniciei nenhum processo", "Fiz exames médico e psicológico", "Fiz a prova teórica", "Reprovei na prova prática", "Meu processo venceu", "Já tive CNH e preciso regularizar"] },
    { id: 4, question: "O que mudaria na sua vida se você tivesse a CNH hoje?", options: ["Conseguiria melhores oportunidades de trabalho", "Teria mais liberdade e autonomia", "Ajudaria minha família", "Economizaria tempo e dinheiro", "Tudo isso"] },
    { id: 5, question: "Você sente que já perdeu oportunidades por não ter CNH?", options: ["Sim, várias", "Sim, algumas", "Talvez", "Não tinha pensado nisso", "Não"] },
    { id: 6, question: "Qual seu nível de urgência para resolver isso?", options: ["Urgente — preciso da CNH o quanto antes", "Alta — não quero mais adiar", "Média — quero planejar com calma", "Baixa — só estou pesquisando por enquanto"] },
];

const QuizPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

    const handleNext = () => {
        if (selectedOption) {
            const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
            setAnswers(newAnswers);
            setSelectedOption(null);

            if (currentQuestionIndex < quizQuestions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                const userData = location.state?.userData;
                navigate('/contact-info', { state: { answers: newAnswers, userData: userData } });
            }
        } else {
            alert("Por favor, selecione uma opção.");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <QuizHeader />
            <main className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-[#004381]">PERGUNTA {currentQuestionIndex + 1} DE {quizQuestions.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-[#0d6efd] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.question}</h2>
                    <div className="space-y-4 mb-8">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedOption(option)}
                                className={`w-full text-left p-4 border rounded-lg transition-all duration-200 text-lg ${selectedOption === option ? 'bg-[#0d6efd] text-white border-blue-700 shadow-lg' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={!selectedOption}
                        className="w-full bg-[#004381] text-white py-3 rounded-full font-bold text-lg hover:bg-blue-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {currentQuestionIndex < quizQuestions.length - 1 ? 'Próxima Pergunta' : 'Finalizar'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default QuizPage;