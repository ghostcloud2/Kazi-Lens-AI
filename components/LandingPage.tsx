
import React, { useState } from 'react';
import { Rocket, Shield, Globe, Briefcase, FileText, Zap, Sparkles, Upload, Loader2, Search, TrendingUp, Mic } from 'lucide-react';
import { analyzeResume } from '../services/geminiService';

interface LandingPageProps {
  onStart: () => void;
  onResumeAnalyzed: (analysis: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onResumeAnalyzed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // For this demo, we'll read the file as text. 
      // In a real app, you'd use a PDF parser or send the binary to Gemini 1.5/2.0
      const text = await file.text();
      const analysis = await analyzeResume(text || "Example ICT Intern resume...");
      onResumeAnalyzed(analysis);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#00D4FF] mb-8 animate-pulse">
          <Sparkles size={16} />
          <span className="text-sm font-semibold tracking-wide uppercase">AI-Powered Career Evolution</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          Find Your Dream Job <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D4FF] to-blue-500">
            Powered by Gemini AI
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl">
          Upload your resume and let our agentic AI optimize your profile, match you with top 1% opportunities, 
          and prepare you for interviews with real-time voice coaching.
        </p>

        {/* Upload Box */}
        <div 
          className={`w-full max-w-2xl p-8 md:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 relative ${
            dragActive ? 'border-electric-blue bg-blue-500/10 scale-[1.02]' : 'border-slate-700 bg-slate-800/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="w-16 h-16 text-electric-blue animate-spin mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Analyzing your expertise...</h3>
              <p className="text-slate-400">Our AI is parsing your skills and experience</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                <Upload className="text-electric-blue w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Drop your resume here</h3>
              <p className="text-slate-400 mb-8">PDF, DOCX or TXT (Max 5MB)</p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <label className="cursor-pointer bg-electric-blue hover:bg-cyan-400 text-navy-900 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
                  <input type="file" className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} />
                  Choose File
                </label>
                <button 
                  onClick={onStart}
                  className="px-8 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-bold text-lg transition-all"
                >
                  Browse Jobs First
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-slate-900/50 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Shield className="text-electric-blue" />
            </div>
            <h4 className="text-xl font-bold text-white">Smart Match Engine</h4>
            <p className="text-slate-400 leading-relaxed">
              Our AI doesn't just look for keywords. It understands your career trajectory and matches you with roles where you'll thrive.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-400" />
            </div>
            <h4 className="text-xl font-bold text-white">Resume Power-Up</h4>
            <p className="text-slate-400 leading-relaxed">
              Get 3 actionable, high-impact improvements to your resume based on live market demands and industry standards.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Mic className="text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-white">Live Voice Coach</h4>
            <p className="text-slate-400 leading-relaxed">
              Practice for your big interview with our Gemini-powered voice agent. Get real-time feedback on your answers and tone.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">50k+</div>
            <div className="text-sm uppercase tracking-widest text-slate-500">Active Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">10k+</div>
            <div className="text-sm uppercase tracking-widest text-slate-500">Users Placed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">98%</div>
            <div className="text-sm uppercase tracking-widest text-slate-500">Match Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">1 hr</div>
            <div className="text-sm uppercase tracking-widest text-slate-500">Update Frequency</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-6 text-center border-t border-slate-800">
        <p className="text-slate-500 text-sm">© 2026 KaziLens AI. Bridging the gap between talent and opportunity.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
