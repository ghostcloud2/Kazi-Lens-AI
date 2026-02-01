
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Zap, 
  Star, 
  ChevronRight, 
  FileText,
  BarChart3,
  Award,
  ShieldCheck,
  CreditCard,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types';
import { analyzeResume } from '../services/geminiService';

interface ResumeDashboardProps {
  profile: UserProfile;
  onAnalyze: (analysis: any) => void;
}

const ResumeDashboard: React.FC<ResumeDashboardProps> = ({ profile, onAnalyze }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phone, setPhone] = useState("");
  const [isSimulatingSTK, setIsSimulatingSTK] = useState(false);

  const analysis = profile.analysis;

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsAnalyzing(true);
        try {
          const text = await file.text();
          const result = await analyzeResume(text);
          onAnalyze(result);
        } catch (error) {
          console.error(error);
          alert("Analysis failed. Try again.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
    input.click();
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingSTK(true);
    setTimeout(() => {
      setIsSimulatingSTK(false);
      setShowPaymentModal(false);
      alert("Pro features unlocked! Transaction successful.");
    }, 3000);
  };

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <FileText className="text-slate-600 w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">No Resume Uploaded</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Upload your resume to see your match score and get AI-powered recommendations to land your next role.
        </p>
        <button 
          onClick={handleUploadClick}
          disabled={isAnalyzing}
          className="bg-electric-blue text-navy-900 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-400 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing..." : "Upload Resume"}
          <Upload size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {analysis.parsedName}</h1>
          <p className="text-slate-400">Profile matches for: <span className="text-electric-blue">{analysis.parsedRole}</span></p>
        </div>
        <button 
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Upload size={16} /> Update Resume
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16"></div>
          <h3 className="text-lg font-semibold text-slate-400 mb-6 uppercase tracking-wider">Expertise Score</h3>
          <div className="relative w-48 h-48 mb-6">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - analysis.score / 100)}
                  className="text-electric-blue transition-all duration-1000 ease-out" 
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold text-white">{analysis.score}</span>
                <span className="text-sm text-slate-500 font-bold uppercase">Points</span>
             </div>
          </div>
          <p className="text-sm text-slate-400 max-w-[200px]">
            {analysis.score > 80 ? "Top 5% of candidates in your niche!" : "Solid foundation. Some improvements suggested."}
          </p>
        </div>

        {/* Improvements Card */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="text-yellow-400" size={24} /> 
              AI Improvement Engine
            </h3>
            <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-xs font-bold rounded-full border border-yellow-400/20">Action Required</span>
          </div>
          <div className="space-y-4">
            {analysis.improvements.map((imp, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 group hover:border-yellow-400/30 transition-all">
                <div className="w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-500 flex items-center justify-center flex-shrink-0 font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 font-medium">{imp}</p>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-yellow-400 transition-colors" />
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-between">
            <div>
              <h4 className="text-white font-bold mb-1">Resume Auto-Optimize</h4>
              <p className="text-xs text-slate-400">Let our AI rewrite your bullet points for max impact.</p>
            </div>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-electric-blue text-navy-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
            >
              KES 250
            </button>
          </div>
        </div>
      </div>

      {/* Skills and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="text-purple-400" /> Key Skills Detected
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill, idx) => (
              <span key={idx} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm border border-slate-700 hover:border-blue-500/50 transition-colors">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="text-green-400" /> Career Summary
          </h3>
          <p className="text-slate-400 leading-relaxed italic">
            "{analysis.summary}"
          </p>
        </div>
      </div>

      {/* Global Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSimulatingSTK && setShowPaymentModal(false)}></div>
          <div className="relative w-full max-w-md glass-card p-8 rounded-3xl animate-in zoom-in duration-300 border-electric-blue/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Complete Purchase</h3>
              <button onClick={() => !isSimulatingSTK && setShowPaymentModal(false)}><X className="text-slate-500" /></button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setPaymentMethod('mpesa')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'mpesa' ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-800'}`}
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-white">M</div>
                <span className="text-xs font-bold text-white">M-Pesa</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800'}`}
              >
                <CreditCard className="text-blue-500" />
                <span className="text-xs font-bold text-white">Card / PayPal</span>
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-2xl mb-6 border border-blue-500/20">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                 <Globe className="text-electric-blue" size={20} />
              </div>
              <div>
                <p className="text-white font-bold">Resume Optimizer</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Global Service</p>
              </div>
              <div className="ml-auto text-xl font-bold text-electric-blue">KES 250</div>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {paymentMethod === 'mpesa' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="07XX XXX XXX" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-green-500" 
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Card Number" 
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
                  />
                  <div className="flex gap-2">
                    <input type="text" placeholder="MM/YY" className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <input type="text" placeholder="CVC" className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}
              <button 
                type="submit"
                disabled={isSimulatingSTK}
                className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${paymentMethod === 'mpesa' ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                {isSimulatingSTK ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Confirm & Pay
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default ResumeDashboard;
