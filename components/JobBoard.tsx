
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Filter, 
  Briefcase, 
  Sparkles,
  ExternalLink,
  TrendingUp,
  Globe,
  Clock,
  ShieldCheck,
  ChevronDown,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Building2,
  Linkedin,
  Zap,
  Target
} from 'lucide-react';
import { UserProfile, Job, ApplicationInsight } from '../types';
import { fetchJobs, getCompanyLocation, getApplicationInsights } from '../services/geminiService';

interface JobBoardProps {
  profile: UserProfile;
}

const JobBoard: React.FC<JobBoardProps> = ({ profile }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(profile.analysis?.parsedRole || "");
  const [location, setLocation] = useState("Nairobi, Kenya");
  const [filters, setFilters] = useState({
    employmentType: 'Full-time',
    locationType: 'Remote'
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [locationInfo, setLocationInfo] = useState<string | null>(null);
  const [insights, setInsights] = useState<ApplicationInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const performSearch = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const results = await fetchJobs(searchQuery, location, filters);
      const matchedResults = results.map(job => {
        let score = Math.floor(Math.random() * 20) + 70;
        if (profile.analysis?.skills.some(s => job.title.toLowerCase().includes(s.toLowerCase()))) {
          score += 10;
        }
        return { ...job, matchScore: Math.min(score, 99) };
      });
      setJobs(matchedResults.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)));
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message?.includes('429') ? "API Quota exceeded. Please try again in a few minutes." : "Failed to fetch jobs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleJobClick = async (job: Job) => {
    setSelectedJob(job);
    setLocationInfo(null);
    setInsights(null);
    setApplySuccess(false);
    
    getCompanyLocation(job.company).then(setLocationInfo).catch(console.error);
    
    if (profile.analysis) {
      setIsInsightLoading(true);
      getApplicationInsights(profile.analysis, job)
        .then(setInsights)
        .catch(console.error)
        .finally(() => setIsInsightLoading(false));
    }
  };

  const handleApply = () => {
    if (!profile.isPro) {
      setShowUpgradeModal(true);
      return;
    }
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setApplySuccess(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
      {/* Search & List */}
      <div className="flex-1 space-y-6">
        <div className="glass-card p-6 rounded-[2rem] space-y-4 shadow-2xl border-white/5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-[2] flex items-center gap-3 px-5 py-4 bg-slate-800/40 rounded-2xl border border-slate-700 focus-within:border-electric-blue transition-all">
              <Search className="text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Job Title or Skill" 
                className="bg-transparent border-none outline-none text-white w-full font-medium placeholder:text-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-slate-800/40 rounded-2xl border border-slate-700 focus-within:border-electric-blue transition-all">
              <MapPin className="text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Location" 
                className="bg-transparent border-none outline-none text-white w-full font-medium placeholder:text-slate-600"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700 text-sm">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Type</span>
              <select 
                className="bg-transparent text-slate-200 outline-none font-semibold"
                value={filters.employmentType}
                onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700 text-sm">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Work</span>
              <select 
                className="bg-transparent text-slate-200 outline-none font-semibold"
                value={filters.locationType}
                onChange={(e) => setFilters({...filters, locationType: e.target.value})}
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Anywhere">Worldwide</option>
              </select>
            </div>
            <button 
              onClick={performSearch}
              disabled={isLoading}
              className="ml-auto px-8 py-4 bg-electric-blue text-navy-900 font-black rounded-2xl hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
              Search Jobs
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
            <AlertCircle size={20} /> {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-8 rounded-[2rem] animate-pulse h-40"></div>
            ))
          ) : (
            jobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => handleJobClick(job)}
                className={`glass-card p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.01] cursor-pointer group ${
                  selectedJob?.id === job.id ? 'border-electric-blue bg-blue-900/10' : 'border-transparent'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-electric-blue font-bold text-3xl border border-slate-700 group-hover:border-electric-blue transition-colors">
                    {job.company[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-black text-white group-hover:text-electric-blue transition-colors">{job.title}</h3>
                        <p className="text-slate-300 font-bold flex items-center gap-2">
                          {job.company} 
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <span className="text-slate-500 font-normal">{job.postedDate || 'Just now'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 bg-blue-500/10 text-electric-blue text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-tighter">
                          {job.matchScore}% Optimal
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5"><MapPin size={16} className="text-electric-blue" /> {job.location}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-electric-blue" /> {job.employmentType}</span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-200"><DollarSign size={16} className="text-green-500" /> {job.salary}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Side Panel */}
      <div className="lg:w-[450px]">
        {selectedJob ? (
          <div className="glass-card p-8 rounded-[2.5rem] sticky top-24 border border-blue-500/20 shadow-2xl animate-in fade-in slide-in-from-right-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
               <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-electric-blue text-4xl font-black border border-slate-700">
                {selectedJob.company[0]}
               </div>
               {selectedJob.sourceUrl.includes('linkedin') && (
                 <Linkedin className="text-[#0A66C2]" size={28} />
               )}
            </div>

            <div className="mb-6 relative z-10">
               <h2 className="text-3xl font-black text-white leading-tight mb-2">{selectedJob.title}</h2>
               <div className="flex items-center gap-2 text-electric-blue font-bold">
                 {selectedJob.company} <ExternalLink size={14} />
               </div>
            </div>

            {/* AI Insights Section */}
            <div className="mb-8 space-y-4 relative z-10">
               <h4 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black flex items-center gap-2">
                 <Sparkles size={14} className="text-yellow-400" /> AI Opportunity Report
               </h4>
               {isInsightLoading ? (
                 <div className="p-5 bg-slate-800/30 rounded-2xl animate-pulse border border-slate-700">
                    <div className="h-4 bg-slate-700 rounded w-1/2 mb-3"></div>
                    <div className="h-3 bg-slate-700 rounded w-full"></div>
                 </div>
               ) : insights ? (
                 <div className={`p-5 rounded-2xl border ${
                   insights.status.includes('Strong') ? 'bg-green-500/5 border-green-500/20' : 'bg-yellow-500/5 border-yellow-500/20'
                 }`}>
                    <div className="flex items-center gap-2 mb-3">
                       {insights.status.includes('Strong') ? <CheckCircle className="text-green-400" size={18} /> : <AlertCircle className="text-yellow-400" size={18} />}
                       <span className={`text-sm font-black uppercase tracking-tight ${insights.status.includes('Strong') ? 'text-green-400' : 'text-yellow-400'}`}>{insights.status}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">{insights.reasoning}</p>
                    {insights.missingKeywords.length > 0 && (
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gaps Detected:</p>
                         <div className="flex flex-wrap gap-2">
                            {insights.missingKeywords.map((kw, i) => (
                              <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-black rounded-lg uppercase tracking-tight">{kw}</span>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="p-5 bg-slate-800/40 rounded-2xl text-xs text-slate-500 italic border border-slate-700/50">
                   Upload your resume to get custom AI application strategy.
                 </div>
               )}
            </div>

            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">Requirements</h4>
                <ul className="space-y-2">
                  {selectedJob.requirements?.map((req, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-3">
                      <span className="text-electric-blue font-black mt-0.5">•</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">Company Insights</h4>
                <div className="p-4 bg-slate-800/40 rounded-2xl text-xs text-slate-400 leading-relaxed border border-slate-700/50">
                  {locationInfo || "Scanning web for company culture..."}
                </div>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
               {applySuccess ? (
                 <div className="w-full bg-green-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 animate-in zoom-in duration-300">
                    <CheckCircle size={24} /> Application Sent!
                 </div>
               ) : (
                 <button 
                   onClick={handleApply}
                   disabled={isApplying}
                   className="w-full bg-electric-blue text-navy-900 font-black py-5 rounded-2xl flex flex-col items-center justify-center hover:bg-cyan-400 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-cyan-500/30 group"
                 >
                   <span className="flex items-center gap-2 text-lg">
                    {isApplying ? <Loader2 className="animate-spin" /> : <Zap size={22} />}
                    ONE-CLICK APPLY
                   </span>
                   {profile.isPro && !isApplying && <span className="text-[10px] opacity-70 uppercase font-black tracking-widest mt-1">Direct to Recruiter Inbox</span>}
                 </button>
               )}
               <a 
                 href={selectedJob.sourceUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-full bg-slate-800/50 text-slate-300 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all text-xs border border-slate-700"
               >
                 View Original Post <ExternalLink size={14} />
               </a>
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center text-slate-500 border-2 border-dashed border-slate-700/50 h-[600px]">
            <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mb-6">
               <Briefcase size={48} className="opacity-10" />
            </div>
            <h3 className="text-xl font-black text-slate-400 mb-2">Select an Opportunity</h3>
            <p className="max-w-[250px] text-sm">Review AI insights and requirements before applying.</p>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/95 backdrop-blur-xl" onClick={() => setShowUpgradeModal(false)}></div>
          <div className="relative w-full max-w-xl glass-card p-12 rounded-[3rem] border-2 border-electric-blue/40 shadow-[0_0_100px_rgba(0,212,255,0.15)] animate-in zoom-in-95 duration-300">
             <button className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors" onClick={() => setShowUpgradeModal(false)}>
                <X size={28} />
             </button>
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-electric-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-electric-blue">
                   <ShieldCheck size={48} />
                </div>
                <h3 className="text-4xl font-black text-white mb-3">Go Pro Accelerator</h3>
                <p className="text-slate-400">Unlock One-Click Apply and 100% matched hidden job market.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="p-5 bg-slate-800/40 rounded-2xl text-center space-y-3 border border-slate-700/50">
                   <TrendingUp className="mx-auto text-green-400" />
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Global Reach</p>
                </div>
                <div className="p-5 bg-slate-800/40 rounded-2xl text-center space-y-3 border border-slate-700/50">
                   <Globe className="mx-auto text-blue-400" />
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Live Search</p>
                </div>
                <div className="p-5 bg-slate-800/40 rounded-2xl text-center space-y-3 border border-electric-blue/20 bg-electric-blue/5">
                   <Zap className="mx-auto text-yellow-400" />
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">1-Click Apply</p>
                </div>
             </div>

             <div className="space-y-4">
                <button 
                  onClick={() => { setShowUpgradeModal(false); }}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black py-5 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-xl"
                >
                  UPGRADE FOR KES 500
                </button>
                <div className="flex justify-center gap-6 opacity-40 grayscale">
                   <span className="text-[10px] font-bold">M-PESA</span>
                   <span className="text-[10px] font-bold">VISA</span>
                   <span className="text-[10px] font-bold">PAYPAL</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
