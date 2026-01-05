import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, User, Globe, AppWindow, MoreVertical } from 'lucide-react';

const ConfirmationHeader: React.FC = () => (
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
                        <span>Entrar</span>
                    </button>
                </div>
            </div>
            <div className="py-3 flex items-center justify-between border-t border-gray-200">
                 <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <Menu size={20} />
                    </button>
                    <span className="text-gray-700 font-medium">Programa CNH do Brasil</span>
                 </div>
                 <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Search size={20} />
                </button>
            </div>
        </div>
    </header>
);

interface UserData {
    name: string;
    birthDate: string;
    gender: string;
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-lg text-gray-800">{value}</p>
    </div>
);

const ConfirmationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [age, setAge] = useState<number | null>(null);

    useEffect(() => {
        if (location.state && location.state.userData) {
            const data = location.state.userData;
            setUserData(data);

            // Calculate age
            const [day, month, year] = data.birthDate.split('/').map(Number);
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge);
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    const handleConfirm = () => {
        navigate('/quiz', { state: { userData } });
    };

    if (!userData) {
        return null; // ou um loader
    }

    const genderDisplay = userData.gender === 'M' ? 'Masculino' : userData.gender === 'F' ? 'Feminino' : userData.gender;

    return (
        <div className="bg-gray-50 min-h-screen">
            <ConfirmationHeader />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 mb-8">
                        Confirme seus dados para o cadastro no Programa CNH do Brasil
                    </h1>
                    
                    <div className="space-y-6">
                        <InfoRow label="Nome Completo" value={userData.name} />
                        <InfoRow label="Data de Nascimento" value={userData.birthDate} />
                        {age !== null && <InfoRow label="Idade" value={`${age} anos`} />}
                        <InfoRow label="Sexo" value={genderDisplay} />

                        <div className="pt-4">
                             <button 
                                onClick={handleConfirm}
                                className="bg-[#0d6efd] text-white px-12 py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
                            >
                                Confirmar e Iniciar Questionário
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConfirmationPage;