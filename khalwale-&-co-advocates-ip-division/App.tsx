
import React, { useState, useRef, useEffect } from 'react';
import { UserInfo, AppState, ContractFile, CaseFile, QuizCategory, QuizQuestion } from './types';
import { analyzeContract, generateAttorneyBrief, generateQuizQuestions } from './services/geminiService';
import { LegalDisclaimer } from './components/LegalDisclaimer';
import { Spinner } from './components/Spinner';
import { ChatWidget } from './components/ChatWidget';
import ReactMarkdown from 'react-markdown';

// --- Icons ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-legal-gold mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-legal-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);

const MusicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-legal-gold mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const MixerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-legal-gold mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-legal-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-legal-gold mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-legal-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const NewsTicker = () => {
  const newsItems = [
    "BREAKING: Kenya Copyright Board (KECOBO) announces new digital royalty collection framework for 2025.",
    "INDUSTRY: KFCB to revise licensing fees for independent content creators in Nairobi.",
    "EVENT: Kalasha Awards nominations now open for film and TV categories.",
    "MUSIC: MCSK releases quarterly royalty distribution schedule for registered artists.",
    "LEGAL: High Court rules on precedent-setting case regarding AI-generated music ownership in Kenya.",
    "FILM: Netflix increases investment in Kenyan original content production.",
    "NOTICE: Performers Rights Society of Kenya (PRISK) AGM scheduled for next month."
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-legal-900 border-t border-legal-gold z-40 h-10 flex items-center overflow-hidden">
      <div className="bg-legal-gold text-legal-900 px-4 py-2 font-bold text-xs uppercase tracking-wider z-10 h-full flex items-center shadow-lg whitespace-nowrap">
        Live Feed
      </div>
      <div className="whitespace-nowrap animate-marquee flex items-center">
        {newsItems.map((item, index) => (
          <span key={index} className="text-slate-300 text-xs md:text-sm mx-6 md:mx-8 inline-block">
            <span className="text-legal-gold mr-2">●</span> {item}
          </span>
        ))}
         {newsItems.map((item, index) => (
          <span key={`dup-${index}`} className="text-slate-300 text-xs md:text-sm mx-6 md:mx-8 inline-block">
            <span className="text-legal-gold mr-2">●</span> {item}
          </span>
        ))}
      </div>
      <style>{`
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '', whatsapp: '' });
  const [file, setFile] = useState<ContractFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [clientComplaints, setClientComplaints] = useState<string>('');
  const [caseFile, setCaseFile] = useState<CaseFile | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [mailingListStatus, setMailingListStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  // Quiz State
  const [quizCategory, setQuizCategory] = useState<QuizCategory>('Music Business');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [failedQuestions, setFailedQuestions] = useState<QuizQuestion[]>([]);

  const [loadingStep, setLoadingStep] = useState<string>('Initializing...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [appState]);

  const handleMailingListSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMailingListStatus('loading');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setMailingListStatus('success');
    setTimeout(() => setMailingListStatus('idle'), 5000);
    (e.target as HTMLFormElement).reset();
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.name && userInfo.email && userInfo.whatsapp) {
      if (appState === AppState.QUIZ_INTRO) {
        startQuizGeneration();
      } else {
        setAppState(AppState.UPLOAD);
      }
    }
  };

  const startQuizGeneration = async () => {
    setLoadingStep("Khatiebi is curating 20 professional questions...");
    setAppState(AppState.GENERATING_BRIEF);
    try {
      const questions = await generateQuizQuestions(quizCategory);
      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setSelectedOption(null);
      setFailedQuestions([]);
      setAppState(AppState.QUIZ_GAME);
    } catch (e) {
      setErrorMsg("Failed to generate quiz questions.");
      setAppState(AppState.ERROR);
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (quizAnswered) return;
    setSelectedOption(optionIndex);
    setQuizAnswered(true);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (optionIndex === currentQuestion.correctAnswerIndex) {
      setQuizScore(prev => prev + 1);
    } else {
      setFailedQuestions(prev => [...prev, currentQuestion]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuizAnswered(false);
      setSelectedOption(null);
    } else {
      setAppState(AppState.QUIZ_RESULTS);
    }
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppState(AppState.GENERATING_BRIEF);
    setLoadingStep("Khatiebi is creating your Case Folder...");
    try {
      const brief = await generateAttorneyBrief(userInfo, analysisResult, clientComplaints);
      setCaseFile({
        id: `KCA-${Math.floor(Math.random() * 10000)}`,
        createdDate: new Date().toLocaleDateString(),
        clientComplaints,
        attorneyBrief: brief
      });
      setAppState(AppState.BOOKING);
    } catch (e) {
      setErrorMsg("Failed to generate brief.");
      setAppState(AppState.ERROR);
    }
  };

  const handlePaymentSubmit = async () => {
    setIsProcessingPayment(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessingPayment(false);
    setAppState(AppState.CONSULT_FORM);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFile({
        name: selectedFile.name,
        type: selectedFile.type,
        mimeType: selectedFile.type || 'application/pdf',
        base64: base64String.split(',')[1]
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setAppState(AppState.ANALYZING);
    setLoadingStep("Khatiebi is reviewing legal clauses...");
    try {
      const result = await analyzeContract(file, userInfo);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      setErrorMsg("An error occurred during analysis.");
      setAppState(AppState.ERROR);
    }
  };

  const renderLanding = () => (
    <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto py-12 px-6">
      <div className="bg-legal-800 p-4 rounded-full border border-legal-gold/30">
        <ScaleIcon />
      </div>
      <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-legal-goldLight to-legal-gold">
        Khalwale & Co Advocates <br/> <span className="text-white italic text-3xl md:text-4xl">IP Division</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
        Expert Intellectual Property protection and contract vetting for the <span className="text-white font-medium">Creative Economy</span>.
      </p>

      <button 
          onClick={() => setAppState(AppState.DETAILS_FORM)}
          className="px-10 py-5 bg-legal-gold hover:bg-legal-goldLight text-legal-900 font-bold text-lg rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-3"
      >
          <span>Start My Review</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
        <div onClick={() => setAppState(AppState.ARTIST_EDU)} className="group cursor-pointer bg-legal-800/40 p-8 rounded-2xl border border-slate-700 hover:border-legal-gold transition-all hover:bg-legal-800/60">
          <div className="flex justify-center"><MusicIcon /></div>
          <h2 className="text-xl font-serif text-white mb-3 group-hover:text-legal-gold transition-colors">For Artists</h2>
          <p className="text-slate-400 text-sm">Protect your royalties, masters, and creative legacy.</p>
        </div>
        <div onClick={() => setAppState(AppState.PRODUCER_EDU)} className="group cursor-pointer bg-legal-800/40 p-8 rounded-2xl border border-slate-700 hover:border-legal-gold transition-all hover:bg-legal-800/60">
          <div className="flex justify-center"><MixerIcon /></div>
          <h2 className="text-xl font-serif text-white mb-3 group-hover:text-legal-gold transition-colors">For Producers</h2>
          <p className="text-slate-400 text-sm">Secure your points, splits, and mechanical rights.</p>
        </div>
        <div onClick={() => setAppState(AppState.QUIZ_INTRO)} className="group cursor-pointer bg-legal-gold/10 p-8 rounded-2xl border border-legal-gold/50 hover:border-legal-gold transition-all hover:bg-legal-gold/20 shadow-[0_0_15px_rgba(204,164,59,0.1)]">
          <div className="flex justify-center"><AcademicCapIcon /></div>
          <h2 className="text-xl font-serif text-white mb-3 group-hover:text-legal-gold transition-colors">20-Question IP Quiz</h2>
          <p className="text-slate-300 text-sm">Test your knowledge of MCSK, KECOBO, and the Berne Convention.</p>
          <span className="text-legal-gold text-xs font-bold mt-4 inline-block uppercase tracking-wider">Play Now &rarr;</span>
        </div>
      </div>

      <section className="w-full mt-16 py-12 bg-slate-800/30 rounded-3xl border border-slate-700/50 max-w-4xl px-8">
          <div className="flex flex-col items-center mb-8">
              <MailIcon />
              <h2 className="text-2xl font-serif text-white mt-4">Join Our Creative Database</h2>
              <p className="text-slate-400 mt-2 text-sm max-w-md">Register for industry alerts and official IP updates.</p>
          </div>
          {mailingListStatus === 'success' ? (
              <div className="bg-green-900/20 border border-green-500/50 p-4 rounded-xl text-green-400 font-bold animate-fade-in">Profile Registered Successfully.</div>
          ) : (
              <form onSubmit={handleMailingListSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <input required type="text" placeholder="Full Name" className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-legal-gold" />
                  <select required className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-legal-gold">
                      <option value="">Category</option>
                      <option>Music</option><option>Film</option><option>Digital</option><option>Other</option>
                  </select>
                  <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                      <input required type="email" placeholder="you@example.com" className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-legal-gold" />
                      <button type="submit" disabled={mailingListStatus === 'loading'} className="bg-legal-gold hover:bg-legal-goldLight text-legal-900 font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-50">{mailingListStatus === 'loading' ? 'Saving...' : 'Register Me'}</button>
                  </div>
              </form>
          )}
      </section>
    </div>
  );

  const renderQuizIntro = () => (
    <div className="w-full max-w-md mx-auto py-12 px-6 animate-fade-in">
      <div className="flex justify-center mb-6"><AcademicCapIcon /></div>
      <h2 className="text-3xl font-serif text-white mb-6 text-center">Intellectual Property Mastery</h2>
      <p className="text-slate-400 text-center mb-8">Complete 20 advanced questions on MCSK, KECOBO, and International IP Treaties. 20/20 earns a Certificate.</p>
      <form onSubmit={handleUserInfoSubmit} className="space-y-6">
        <input required type="text" value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" placeholder="Name for Certificate" />
        <select value={quizCategory} onChange={(e) => setQuizCategory(e.target.value as QuizCategory)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white">
          <option>Music Business</option><option>Film Industry</option><option>Publishing</option>
        </select>
        <button type="submit" className="w-full py-4 bg-legal-gold text-legal-900 font-bold rounded-lg shadow-lg">Begin Quiz</button>
      </form>
    </div>
  );

  const renderQuizGame = () => {
    const question = quizQuestions[currentQuestionIndex];
    if (!question) return <Spinner message="Khatiebi is preparing your quiz..." />;
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-6 animate-fade-in">
         <div className="flex justify-between items-center mb-6">
            <span className="text-legal-gold text-sm font-bold uppercase tracking-wider">{quizCategory}</span>
            <span className="text-slate-400 text-sm">Q {currentQuestionIndex + 1} / 20</span>
         </div>
         <div className="w-full bg-slate-800 h-2 rounded-full mb-8">
            <div className="bg-legal-gold h-2 rounded-full transition-all duration-500" style={{width: `${((currentQuestionIndex + 1) / 20) * 100}%`}}></div>
         </div>
         <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl mb-8">
            <h3 className="text-xl md:text-2xl font-serif text-white mb-6 leading-relaxed">{question.question}</h3>
            <div className="space-y-3">
               {question.options.map((option, idx) => (
                 <button key={idx} onClick={() => handleQuizAnswer(idx)} disabled={quizAnswered} className={`w-full text-left p-4 rounded-lg border transition-all ${quizAnswered ? (idx === question.correctAnswerIndex ? 'border-green-500 bg-green-900/20 text-green-400 font-bold' : idx === selectedOption ? 'border-red-500 bg-red-900/20 text-red-400' : 'border-slate-700 opacity-50') : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}>
                   {option}
                 </button>
               ))}
            </div>
         </div>
         {quizAnswered && (
           <div className="animate-fade-in-up">
              <div className={`p-4 rounded-lg mb-6 bg-slate-900/50 border border-slate-700`}>
                  <p className="text-slate-300 text-sm">{question.explanation}</p>
              </div>
              <button onClick={handleNextQuestion} className="w-full py-4 bg-legal-gold text-legal-900 font-bold rounded-lg shadow-lg">Next Question</button>
           </div>
         )}
      </div>
    );
  };

  const renderQuizResults = () => (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 animate-fade-in">
       <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-white mb-2">Quiz Results</h2>
          <p className="text-2xl text-slate-300">Score: <span className="text-legal-gold font-bold">{quizScore}/20</span></p>
          {quizScore === 20 ? (
             <button onClick={() => setAppState(AppState.CERTIFICATE)} className="mt-8 px-8 py-3 bg-legal-gold text-legal-900 font-bold rounded-full">Claim Certificate</button>
          ) : (
            <p className="text-slate-500 mt-4 italic">Score 20/20 for the official certificate.</p>
          )}
       </div>

       {failedQuestions.length > 0 && (
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl mb-8">
             <h3 className="text-xl font-serif text-legal-gold mb-6 border-b border-slate-700 pb-4">Study and Learn More</h3>
             <p className="text-sm text-slate-400 mb-6">Review these resources based on the questions you missed:</p>
             <div className="space-y-6">
                {failedQuestions.map((q, idx) => (
                   <div key={idx} className="border-l-2 border-legal-gold/30 pl-4 py-2">
                      <p className="text-white text-sm font-medium mb-2">{q.question}</p>
                      <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-legal-gold text-xs hover:underline flex items-center">
                         <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                         Official IP Source
                      </a>
                   </div>
                ))}
             </div>
          </div>
       )}

       <div className="flex flex-col space-y-4">
          <button onClick={startQuizGeneration} className="w-full py-4 bg-slate-700 text-white rounded-lg">Try Again</button>
          <button onClick={() => setAppState(AppState.LANDING)} className="w-full py-4 text-slate-500 hover:text-white">Back to Home</button>
       </div>
    </div>
  );

  const renderArtistEdu = () => (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fade-in">
      <button onClick={() => setAppState(AppState.LANDING)} className="text-slate-500 hover:text-white mb-8">&larr; Back to Home</button>
      <div className="flex items-center space-x-4 mb-8">
         <MusicIcon />
         <h1 className="text-4xl font-serif text-white">The Artist's Guide to IP Protection</h1>
      </div>
      
      <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-8">
        <div className="bg-red-900/10 border-l-4 border-red-500 p-6 rounded-r-lg">
          <h3 className="text-xl font-bold text-white mb-2">The "Recoupment" Trap</h3>
          <p>Labels often advance money for recording and marketing. This isn't a gift. It's an interest-free loan that you pay back from <i>your</i> share of royalties. You won't see royalty income until the label is fully paid back.</p>
        </div>

        <div>
          <h3 className="text-2xl font-serif text-legal-gold mb-3">Critical Vulnerabilities</h3>
          <ul className="list-disc pl-5 space-y-4">
            <li><strong>Master Rights Ownership:</strong> Are you giving away your masters forever? Most standard deals strip you of ownership in exchange for a percentage of sales.</li>
            <li><strong>Perpetuity Clauses:</strong> Avoid contracts that claim rights "throughout the universe, in perpetuity." Forever is a long time.</li>
            <li><strong>360 Deals:</strong> These allow the label to take a percentage of EVERYTHING you do—merchandise, touring, and even brand deals outside of music.</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 bg-legal-800 p-8 rounded-xl border border-legal-gold/30 text-center">
        <h3 className="text-2xl font-serif text-white mb-4">Protect Your Masters</h3>
        <p className="text-slate-400 mb-6">Khatiebi can scan your contract for these specific predatory clauses.</p>
        <button onClick={() => setAppState(AppState.DETAILS_FORM)} className="px-8 py-4 bg-legal-gold text-legal-900 font-bold rounded-full">Start My Review</button>
      </div>
    </div>
  );

  const renderProducerEdu = () => (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fade-in">
      <button onClick={() => setAppState(AppState.LANDING)} className="text-slate-500 hover:text-white mb-8">&larr; Back to Home</button>
      <div className="flex items-center space-x-4 mb-8">
         <MixerIcon />
         <h1 className="text-4xl font-serif text-white">Protecting Your Sound: Producer IP</h1>
      </div>
      
      <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
             <h3 className="text-xl font-bold text-legal-gold mb-2">Beat Leasing</h3>
             <p className="text-sm">Non-exclusive licensing. You retain ownership and can sell the same beat to multiple artists. Essential for volume-based cash flow.</p>
           </div>
           <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
             <h3 className="text-xl font-bold text-legal-gold mb-2">Exclusive Buyouts</h3>
             <p className="text-sm">You transfer all rights to one artist. This should command a significantly higher premium and a guaranteed percentage of the publishing.</p>
           </div>
        </div>

        <div>
          <h3 className="text-2xl font-serif text-white mb-3">Mechanicals & Publishing Splits</h3>
          <p>Don't settle for just an upfront production fee. As a producer, you are a composer. Ensure your contract guarantees:</p>
          <ul className="list-disc pl-5 space-y-4 mt-4">
            <li><strong>Producer Points:</strong> Typically 3-4% of the master recording royalty (PPD).</li>
            <li><strong>The Writer's Share:</strong> You are entitled to 50% of the composition copyright for the music you created.</li>
            <li><strong>Sync Fees:</strong> A 50/50 split on any licensing for movies, TV, or advertisements.</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 bg-legal-800 p-8 rounded-xl border border-legal-gold/30 text-center">
        <h3 className="text-2xl font-serif text-white mb-4">Secure Your Publishing</h3>
        <p className="text-slate-400 mb-6">Let Khatiebi verify your splits are legally documented.</p>
        <button onClick={() => setAppState(AppState.DETAILS_FORM)} className="px-8 py-4 bg-legal-gold text-legal-900 font-bold rounded-full">Start My Review</button>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="w-full max-w-md mx-auto py-12 px-6 animate-fade-in">
      <h2 className="text-3xl font-serif text-white mb-6 text-center">Client Intake</h2>
      <p className="text-slate-400 text-center mb-8">Details required for the IP Division client record.</p>
      <form onSubmit={handleUserInfoSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <input required type="text" value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-legal-gold" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input required type="email" value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-legal-gold" placeholder="john@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp Number</label>
          <input required type="tel" value={userInfo.whatsapp} onChange={(e) => setUserInfo({...userInfo, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-legal-gold" placeholder="+254 700 000000" />
        </div>
        <button type="submit" className="w-full py-4 bg-legal-gold text-legal-900 font-bold rounded-lg shadow-lg">Continue</button>
        <button type="button" onClick={() => setAppState(AppState.LANDING)} className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm">Back</button>
      </form>
    </div>
  );

  const renderUpload = () => (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 animate-fade-in text-center">
      <h2 className="text-3xl font-serif text-white mb-6">Upload Contract</h2>
      <p className="text-slate-400 mb-8">Khatiebi will process your document immediately. Max 4MB.</p>
      <div className="border-2 border-dashed border-slate-700 hover:border-legal-gold rounded-xl p-12 bg-slate-800/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt" />
        <div className="flex flex-col items-center">
          <UploadIcon />
          {file ? <div className="text-legal-gold font-bold flex items-center"><CheckIcon />{file.name}</div> : <p className="text-white font-bold mb-2">Select Document</p>}
        </div>
      </div>
      {errorMsg && <p className="text-red-400 mt-4 text-sm">{errorMsg}</p>}
      <div className="mt-8 space-y-4">
        <button onClick={startAnalysis} disabled={!file} className="w-full py-4 bg-legal-gold text-legal-900 font-bold rounded-lg shadow-lg disabled:opacity-50">Analyze Document</button>
        <button onClick={() => setAppState(AppState.LANDING)} className="text-slate-500 hover:text-white text-sm">Cancel</button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 animate-fade-in">
       <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif text-white">IP Analysis Report</h2>
          <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{file?.name}</div>
       </div>
       <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl mb-8">
          <div className="prose prose-invert max-w-none prose-headings:text-legal-gold">
             <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
          <LegalDisclaimer />
       </div>
       <div className="bg-gradient-to-r from-legal-900 to-slate-900 p-8 rounded-xl border border-legal-gold/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Secure a Legal Consultation</h3>
            <p className="text-slate-400 text-sm max-w-md">Khatiebi has identified risks. Book a call with a senior partner to discuss your negotiation strategy.</p>
          </div>
          <button onClick={() => setAppState(AppState.PAYMENT)} className="px-8 py-3 bg-legal-gold text-legal-900 font-bold rounded-lg shadow-lg">Book Now (KES 5,000)</button>
       </div>
    </div>
  );

  const renderPayment = () => (
    <div className="w-full max-w-md mx-auto py-12 px-6 animate-fade-in text-center">
       <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><CreditCardIcon /></div>
          <h2 className="text-2xl font-serif text-white mb-2">Secure Payment</h2>
          <p className="text-slate-400 mb-8">Powered by <span className="text-blue-400 font-bold">Pesapal</span></p>
          <div className="space-y-3 mb-8 text-left">
             <div className="flex items-center justify-between p-3 border border-slate-600 rounded bg-slate-900/50"><span className="text-slate-300">Consultation Fee</span><span className="text-white">KES 4,310</span></div>
             <div className="flex items-center justify-between p-3 border border-slate-600 rounded bg-slate-900/50"><span className="text-slate-300">VAT (16%)</span><span className="text-white">KES 690</span></div>
             <div className="h-px bg-slate-600 my-2"></div>
             <div className="flex items-center justify-between font-bold"><span className="text-white">Total</span><span className="text-legal-gold">KES 5,000.00</span></div>
          </div>
          <div className="flex justify-center space-x-4 mb-6">
              <div className="bg-white rounded px-2 py-1 flex items-center h-8"><img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" /></div>
              <div className="bg-white rounded px-2 py-1 flex items-center h-8"><img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" /></div>
              <div className="bg-white rounded px-2 py-1 flex items-center h-8"><span className="text-green-600 font-bold text-xs">M-PESA</span></div>
          </div>
          <button onClick={handlePaymentSubmit} disabled={isProcessingPayment} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex justify-center items-center">
             {isProcessingPayment ? "Initializing Pesapal..." : "Proceed to Secure Payment"}
          </button>
       </div>
       <button onClick={() => setAppState(AppState.RESULTS)} className="mt-6 text-slate-500 hover:text-white text-sm">Cancel</button>
    </div>
  );

  const renderConsultForm = () => (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 animate-fade-in">
       <h2 className="text-3xl font-serif text-white mb-6 text-center">Open Case File</h2>
       <p className="text-slate-400 text-center mb-8">Payment successful. Please state your primary concerns for the attorney.</p>
       <form onSubmit={handleConsultSubmit} className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
          <textarea required value={clientComplaints} onChange={(e) => setClientComplaints(e.target.value)} className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-legal-gold mb-6" placeholder="e.g. Royalty transparency and rights duration..." />
          <button type="submit" className="w-full py-4 bg-legal-gold text-legal-900 font-bold rounded-lg shadow-lg">Finalize Case Brief</button>
       </form>
    </div>
  );

  const renderBooking = () => (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 animate-fade-in">
       <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-xl mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-4"><CheckIcon /></div>
          <h2 className="text-2xl font-serif text-white">Case Brief Ready</h2>
          <p className="text-green-400">Reference: {caseFile?.id}</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
             <h3 className="text-xl font-bold text-legal-gold mb-4 uppercase tracking-wider">Attorney Note</h3>
             <div className="prose prose-invert prose-sm max-w-none h-96 overflow-y-auto pr-2"><ReactMarkdown>{caseFile?.attorneyBrief || ''}</ReactMarkdown></div>
          </div>
          <div className="flex flex-col justify-center space-y-6">
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-2">Schedule Video Call</h3>
                <p className="text-slate-400 text-sm mb-4">Select a slot in our Calendly for your video consultation.</p>
                <button className="w-full py-3 bg-blue-600 text-white font-bold rounded">Open Calendly</button>
             </div>
             <button onClick={() => setAppState(AppState.LANDING)} className="text-slate-500 hover:text-white">Return Home</button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col pb-10">
      {appState !== AppState.CERTIFICATE && (
        <header className="border-b border-slate-800 bg-legal-900/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setAppState(AppState.LANDING)}>
              <div className="w-8 h-8 bg-legal-gold rounded-sm flex items-center justify-center">
                  <span className="font-serif font-bold text-legal-900 text-xl">K</span>
              </div>
              <span className="text-xl font-serif text-slate-100 tracking-wide">Khalwale & Co <span className="text-legal-gold font-bold">IP Division</span></span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => setAppState(AppState.ARTIST_EDU)} className="text-sm text-slate-400 hover:text-legal-gold">For Artists</button>
              <button onClick={() => setAppState(AppState.PRODUCER_EDU)} className="text-sm text-slate-400 hover:text-legal-gold">For Producers</button>
              <button onClick={() => setAppState(AppState.QUIZ_INTRO)} className="text-sm text-legal-gold font-bold">Play Quiz</button>
            </nav>
          </div>
        </header>
      )}

      <main className={`flex-grow ${appState === AppState.CERTIFICATE ? 'bg-white' : 'bg-legal-900'} relative mb-12`}>
        <div className="relative z-10">
          {appState === AppState.LANDING && renderLanding()}
          {appState === AppState.ARTIST_EDU && renderArtistEdu()}
          {appState === AppState.PRODUCER_EDU && renderProducerEdu()}
          {appState === AppState.QUIZ_INTRO && renderQuizIntro()}
          {appState === AppState.QUIZ_GAME && renderQuizGame()}
          {appState === AppState.QUIZ_RESULTS && renderQuizResults()}
          {appState === AppState.DETAILS_FORM && renderForm()}
          {appState === AppState.UPLOAD && renderUpload()}
          {appState === AppState.ANALYZING && <div className="min-h-[60vh] flex items-center justify-center"><Spinner message={loadingStep} /></div>}
          {appState === AppState.RESULTS && renderResults()}
          {appState === AppState.PAYMENT && renderPayment()}
          {appState === AppState.CONSULT_FORM && renderConsultForm()}
          {appState === AppState.BOOKING && renderBooking()}
          {appState === AppState.ERROR && <div className="p-8 text-center text-red-500">{errorMsg}</div>}
          {appState === AppState.GENERATING_BRIEF && <div className="min-h-[60vh] flex items-center justify-center"><Spinner message={loadingStep} /></div>}
        </div>
      </main>

      {appState !== AppState.CERTIFICATE && <NewsTicker />}
      {appState !== AppState.CERTIFICATE && <ChatWidget onStartReview={() => setAppState(AppState.UPLOAD)} />}
    </div>
  );
}
