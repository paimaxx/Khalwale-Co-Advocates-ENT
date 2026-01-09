
import React, { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { createChatSession } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
  isAction?: boolean;
}

interface ChatWidgetProps {
    onStartReview: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onStartReview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Greetings. I am Khatiebi, your dedicated assistant at the Khalwale & Co IP Division. How may I assist you with your entertainment legal matters today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg });
      let fullText = '';
      let hasOfferedUpload = false;

      for await (const chunk of result) {
        const c = chunk as any;
        if (c.functionCalls && c.functionCalls.length > 0) {
             if (c.functionCalls[0].name === 'offerContractUpload') hasOfferedUpload = true;
        }
        if (c.text) {
          fullText += c.text;
          setMessages(prev => {
            const newHistory = [...prev];
            const lastMsg = newHistory[newHistory.length - 1];
            if (lastMsg.role === 'model') lastMsg.text = fullText;
            return newHistory;
          });
        }
      }
      if (hasOfferedUpload) setMessages(prev => [...prev, { role: 'model', text: 'Shall we begin your review?', isAction: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Forgive me, I encountered a connection issue. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-14 right-6 z-50 flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="bg-slate-900 border border-legal-gold/50 rounded-xl shadow-2xl w-80 sm:w-96 h-[500px] mb-4 overflow-hidden pointer-events-auto flex flex-col animate-fade-in-up">
          <div className="bg-legal-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-serif font-bold">Khatiebi • IP Division</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-900/95 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.isAction ? (
                    <button onClick={() => { setIsOpen(false); onStartReview(); }} className="w-full py-3 bg-legal-gold text-legal-900 font-bold rounded-lg shadow-lg">Review My Contract</button>
                ) : (
                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-legal-gold text-legal-900 font-medium' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                        {msg.role === 'model' ? <div className="prose prose-invert prose-sm"><ReactMarkdown>{msg.text}</ReactMarkdown></div> : msg.text}
                    </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Consult Khatiebi..." className="w-full bg-slate-900 border border-slate-600 rounded-full pl-4 pr-10 py-2 text-sm text-white focus:border-legal-gold outline-none" />
          </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="pointer-events-auto bg-legal-gold text-legal-900 rounded-full p-4 shadow-lg border-2 border-legal-900 transform transition-transform hover:scale-110">
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};
