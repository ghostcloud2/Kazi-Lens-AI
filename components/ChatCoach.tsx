
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Send, User, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { UserProfile } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatCoach: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi ${profile.analysis?.parsedName || 'there'}! I'm your KaziLens Career Coach. How can I help you accelerate your job search today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are a high-level career coach at KaziLens AI. 
        You have the user's resume analysis: ${JSON.stringify(profile.analysis)}. 
        Be professional, encouraging, and provide tactical advice for job applications, networking, and salary negotiation. 
        Use the 'thinkingBudget' to provide extremely well-reasoned answers.`,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
  }, [profile.analysis]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to coach. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
             <BrainCircuit size={28} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-white">AI Career Consultant</h2>
             <p className="text-xs text-electric-blue flex items-center gap-1">
               <span className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></span>
               Powered by Gemini 3 Pro (Deep Thinking)
             </p>
           </div>
        </div>
        <div className="hidden md:block px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-400">
          Tailored to: <span className="text-slate-200">{profile.analysis?.parsedRole || 'General Profile'}</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 glass-card rounded-3xl p-6 overflow-y-auto space-y-6 mb-4 custom-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-electric-blue'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[85%]">
               <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-electric-blue">
                 <Loader2 size={20} className="animate-spin" />
               </div>
               <div className="p-4 rounded-2xl bg-slate-800/50 text-slate-400 italic text-sm">
                 Consultant is thinking deeply about your career path...
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about resume tips, salary negotiation, or job matching..."
          className="flex-1 px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-electric-blue transition-colors shadow-xl"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-14 h-14 bg-electric-blue text-navy-900 rounded-2xl flex items-center justify-center hover:bg-cyan-400 transition-colors disabled:opacity-50 shadow-xl"
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatCoach;
