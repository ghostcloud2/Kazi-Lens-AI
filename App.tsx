
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  User, 
  Mic, 
  MessageSquare, 
  Zap, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  TrendingUp,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { AppSection, UserProfile, Job } from './types';
import LandingPage from './components/LandingPage';
import ResumeDashboard from './components/ResumeDashboard';
import JobBoard from './components/JobBoard';
import ChatCoach from './components/ChatCoach';
import LivePrep from './components/LivePrep';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.LANDING);
  const [userProfile, setUserProfile] = useState<UserProfile>({ isPro: false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleResumeAnalyzed = (analysis: any) => {
    setUserProfile(prev => ({ ...prev, analysis }));
    setCurrentSection(AppSection.DASHBOARD);
  };

  const navItems = [
    { id: AppSection.DASHBOARD, label: 'Dashboard', icon: FileText },
    { id: AppSection.JOBS, label: 'Job Search', icon: Briefcase },
    { id: AppSection.COACH, label: 'Career Coach', icon: MessageSquare },
    { id: AppSection.LIVE_PREP, label: 'Mock Interview', icon: Mic },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case AppSection.LANDING:
        return <LandingPage onStart={() => setCurrentSection(AppSection.DASHBOARD)} onResumeAnalyzed={handleResumeAnalyzed} />;
      case AppSection.DASHBOARD:
        return <ResumeDashboard profile={userProfile} onAnalyze={handleResumeAnalyzed} />;
      case AppSection.JOBS:
        return <JobBoard profile={userProfile} />;
      case AppSection.COACH:
        return <ChatCoach profile={userProfile} />;
      case AppSection.LIVE_PREP:
        return <LivePrep profile={userProfile} />;
      default:
        return <LandingPage onStart={() => setCurrentSection(AppSection.DASHBOARD)} onResumeAnalyzed={handleResumeAnalyzed} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A192F] text-slate-300">
      {/* Sidebar for Desktop */}
      {currentSection !== AppSection.LANDING && (
        <aside className="hidden md:flex flex-col w-64 glass-card border-r border-slate-800 p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-electric-blue rounded-xl flex items-center justify-center">
              <Sparkles className="text-navy-900 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">KaziLens <span className="text-[#00D4FF]">AI</span></h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentSection === item.id 
                  ? 'bg-blue-600/20 text-[#00D4FF] border border-blue-600/30' 
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            {!userProfile.isPro && (
              <button 
                onClick={() => setUserProfile(p => ({...p, isPro: true}))}
                className="w-full mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Zap size={18} fill="currentColor" />
                Upgrade to Pro
              </button>
            )}
            <button 
              onClick={() => setCurrentSection(AppSection.LANDING)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Nav */}
      {currentSection !== AppSection.LANDING && (
        <div className="md:hidden flex items-center justify-between p-4 glass-card border-b border-slate-800 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Sparkles className="text-electric-blue" />
            <span className="font-bold text-white">KaziLens AI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0A192F] z-40 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <span className="font-bold text-2xl text-white">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)}><X size={32} /></button>
          </div>
          <nav className="flex-1 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSection(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 text-xl py-4 border-b border-slate-800 ${
                  currentSection === item.id ? 'text-electric-blue' : 'text-slate-400'
                }`}
              >
                <item.icon size={24} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto ${currentSection === AppSection.LANDING ? '' : 'p-4 md:p-8 lg:p-12'}`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
