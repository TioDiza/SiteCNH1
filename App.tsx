import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  User, 
  ChevronRight, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon, 
  Phone as WhatsApp,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

// --- Components ---

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="/Gov.br_logo.svg.png" 
            alt="gov.br" 
            className="h-8 md:h-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Search size={20} />
          </button>
          <button className="flex items-center gap-2 bg-[#004381] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors">
            <User size={18} />
            <span>Entrar</span>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

const Breadcrumbs: React.FC = () => {
  const items = ['Assuntos', 'Notícias', '2025', '12'];
  return (
    <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center flex-wrap gap-2 text-xs text-[#004381] font-medium">
      <div className="p-1 hover:bg-gray-100 rounded cursor-pointer">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="cursor-pointer hover:underline">{item}</span>
        </React.Fragment>
      ))}
    </nav>
  );
};

const RegistrationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(prev => prev + 1);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#004381] p-4 flex justify-between items-center text-white">
          <h3 className="font-bold">Inscrição CNH Social 2026</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 flex gap-3">
                <AlertCircle className="text-blue-500 shrink-0" />
                <p className="text-sm text-blue-800">Verifique sua elegibilidade informando seu CPF cadastrado no gov.br.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CPF</label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00"
                  className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button 
                onClick={handleNext}
                disabled={loading}
                className="w-full bg-[#004381] text-white py-3 rounded font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {loading ? 'Consultando...' : 'Consultar Elegibilidade'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800">Elegibilidade Confirmada!</h4>
              <p className="text-gray-600">Identificamos que você atende aos requisitos do programa CNH do Brasil 2026.</p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-left">
                <p className="text-sm font-bold text-gray-700 mb-2">Dados do Cadastro:</p>
                <p className="text-sm text-gray-600">Nome: ANDREZA LIMA DOS SANTOS (Simulado)</p>
                <p className="text-sm text-gray-600">Status: Disponível para matrícula imediata</p>
              </div>
              <button 
                onClick={handleNext}
                className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition-colors"
              >
                Confirmar Minha Inscrição
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <CheckCircle size={48} className="text-blue-600" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800">Protocolo Gerado com Sucesso!</h4>
              <p className="text-gray-600">Sua solicitação foi encaminhada para o DETRAN da sua região.</p>
              <div className="bg-blue-900 text-white p-4 rounded font-mono text-lg">
                #BR-2026-985231
              </div>
              <p className="text-sm text-gray-500">Você receberá um SMS e e-mail com os próximos passos em até 48 horas.</p>
              <button 
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded font-bold hover:bg-gray-50 transition-colors"
              >
                Fechar Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Carousel: React.FC = () => {
  const images = [
    '/banners/banner-cnh-entrega.jpeg',
    '/banners/banner-cnh-evento.jpeg',
    '/banners/banner-cnh-assinatura.png',
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg my-8">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Banner CNH Social ${index + 1}`}
            className="w-full flex-shrink-0 object-cover aspect-[16/9]"
          />
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#004381] text-white pt-10 pb-6 mt-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-blue-800 pb-10 mb-10">
          <div className="flex-1">
            <img 
              src="/Gov.br_logo.svg.png" 
              alt="gov.br" 
              className="h-10 mb-6 bg-white p-1 rounded"
            />
            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <a href="#" className="hover:underline">Assuntos</a>
              <a href="#" className="hover:underline">Composição</a>
              <a href="#" className="hover:underline">Acesso à Informação</a>
              <a href="#" className="hover:underline">Canais de Atendimento</a>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Facebook size={20}/></button>
            <button className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Twitter size={20}/></button>
            <button className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Linkedin size={20}/></button>
            <button className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><WhatsApp size={20}/></button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-blue-200">
          <p>© 2025 Governo do Brasil. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:underline">Política de Privacidade</a>
            <a href="#" className="hover:underline">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main Page ---

const App: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumbs />

      <main className="max-w-4xl mx-auto px-4 pb-20">
        {/* Article Meta */}
        <div className="mb-6">
          <span className="text-[#004381] text-sm font-bold uppercase tracking-wider mb-2 block">TRÂNSITO</span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight mb-6">
            CNH do Brasil: Governo libera carteira de motorista com 80% de desconto e sem necessidade de autoescola.
          </h1>

          {/* Share Bar */}
          <div className="flex items-center justify-between border-y border-gray-200 py-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500 mr-2">Compartilhe:</span>
              <button className="text-blue-600 hover:scale-110 transition-transform"><Facebook size={18} fill="currentColor" /></button>
              <button className="text-sky-400 hover:scale-110 transition-transform"><Twitter size={18} fill="currentColor" /></button>
              <button className="text-blue-800 hover:scale-110 transition-transform"><Linkedin size={18} fill="currentColor" /></button>
              <button className="text-green-500 hover:scale-110 transition-transform"><WhatsApp size={18} /></button>
              <button className="text-gray-400 hover:scale-110 transition-transform"><LinkIcon size={18} /></button>
            </div>
          </div>

          <div className="text-sm text-gray-500 italic space-y-1">
            <p>Publicado em 09/12/2025 20h58</p>
            <p>Atualizado em 04/01/2026 3h11</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
          
          {/* Video Container */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://player.vimeo.com/video/1151388642?background=1&autoplay=1&loop=1&muted=1"
              title="Vimeo video player"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Testimonial Box */}
          <div className="bg-gray-100 p-6 rounded-r-lg border-l-8 border-[#004381]">
            <p className="mb-4">
              <strong>Andreza Lima dos Santos</strong>, de 27 anos, empregada doméstica e mãe de dois filhos, iniciou o processo para tirar a CNH no dia 10/12/2025, um dia após a nova resolução entrar em vigor. 
            </p>
            <p>
              Em apenas 11 dias, no dia 21/12/2025, ela concluiu todas as etapas e realizou a prova prática. O Ministro dos Transportes Renan Filho, entregou pessoalmente a habilitação, tornando Andreza a primeira brasileira a obter a CNH pelo novo modelo gratuito.
            </p>
             <p>
              Com a Resolução nº 985/2025 do Contan, mais de 1 milhão de brasileiros já se inscreveram no programa. <strong> e as vagas para 2026 estão se esgotando </strong>.
            </p>
          </div>

          <Carousel />

          <p>
            O processo para obter a primeira Carteira Nacional de Habilitação ficou mais simples com o novo Programa CNH do Brasil, site oficial do Ministério dos Transportes. Pelo celular, o cidadão pode abrir o requerimento, acompanhar todas as etapas, realizar o curso teórico gratuito e acessar a versão digital da habilitação. Confira, ponto a ponto, como funciona.
          </p>

          {/* Sticky CTA for Mobile/Desktop visibility */}
          <div className="sticky top-4 z-40 bg-white shadow-lg border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            <div className="flex-1">
              <p className="text-[#004381] font-bold text-sm">VAGAS LIMITADAS PARA JANEIRO/2026</p>
              <p className="text-xs text-gray-500">Inscreva-se hoje para garantir gratuidade total.</p>
            </div>
            <button 
              onClick={() => setModalOpen(true)}
              className="w-full md:w-auto bg-[#004381] text-white px-8 py-3 rounded-md font-bold text-base hover:bg-blue-900 transition-all shadow-md active:scale-95"
            >
              Fazer Minha Inscrição Agora
            </button>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-[#004381] flex items-center justify-center text-sm">1</span>
              O que mudou com a nova resolução?
            </h2>
            <ul className="space-y-4 ml-4">
              <li className="flex gap-3">
                <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
                <span><strong>Fim da obrigatoriedade de autoescola:</strong> Candidatos não precisam mais frequentar Centros de Formação de Condutores (CFCs).</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
                <span><strong>Curso teórico online e gratuito:</strong> Disponível imediatamente após realizar o cadastro no portal gov.br.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
                <span><strong>Carga horária reduzida:</strong> De 20 horas obrigatórias para apenas 2 horas mínimas de orientação.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
                <span><strong>Aulas práticas flexíveis:</strong> Podem ser realizadas com instrutor autônomo credenciado pelo Detran local.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
                <span><strong>Redução de 80% nos custos:</strong> O processo que custava entre R$ 3.000 e R$ 5.000 agora é praticamente gratuito para baixa renda.</span>
              </li>
            </ul>
          </div>

          {/* Last Vacancies Card */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Últimas Vagas para 2026</h3>
            <p className="text-gray-700 leading-relaxed">
              Devido à alta demanda, restam poucas vagas para obter a CNH gratuitamente e sem autoescola. Estas são as últimas vagas disponíveis para <strong>janeiro de 2026</strong>. Caso não realize a inscrição com urgência, a próxima oportunidade será somente entre 2026 e 2027. Quem não se cadastrar arcará com os custos integrais do processo de habilitação.
            </p>
          </div>

          <img 
            src="/thumb-cnh-2.png" 
            alt="Mulher mostrando CNH Digital no celular" 
            className="w-full rounded-lg shadow-lg"
          />

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-[#004381] flex items-center justify-center text-sm">2</span>
              Como se inscrever no programa?
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <p className="font-semibold text-gray-600">O processo de inscrição é simples e 100% online:</p>
              <ol className="list-decimal list-inside space-y-4 font-medium text-gray-700">
                <li className="p-3 bg-gray-50 rounded">Clique no botão abaixo para iniciar seu cadastro seguro via gov.br</li>
                <li className="p-3 bg-gray-50 rounded">Informe seu CPF para verificar elegibilidade automática</li>
                <li className="p-3 bg-gray-50 rounded">Confirme seus dados pessoais e de endereço</li>
                <li className="p-3 bg-gray-50 rounded">Sua Carteira de Motorista Digital será emitida em até 20 dias após as provas</li>
              </ol>
              <button 
                onClick={() => setModalOpen(true)}
                className="w-full bg-[#004381] text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-2 mt-4"
              >
                Fazer Minha Inscrição Agora
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Legal Basis Section */}
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">3. Base Legal</h2>
            <div className="text-sm text-[#004381] space-y-2 underline font-medium">
              <p className="cursor-pointer hover:text-blue-900">• Resolução Contran nº 985/2025</p>
              <p className="cursor-pointer hover:text-blue-900">• Lei nº 14.071/2020 (Nova Lei de Trânsito)</p>
              <p className="cursor-pointer hover:text-blue-900">• Decreto nº 11.999/2025 (Programa CNH do Brasil)</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating V Libras Button (Accessibility Mockup) */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30">
        <div className="w-12 h-12 bg-[#004381] rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-105 transition-transform">
          <img 
            src="https://vlibras.gov.br/assets/images/widget/icon.png" 
            alt="V Libras" 
            className="w-8 h-8"
          />
        </div>
      </div>

      <Footer />
      
      {/* Registration Flow Modal */}
      <RegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
};

export default App;