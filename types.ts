
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  locationType: 'Remote' | 'Hybrid' | 'On-site' | 'Anywhere';
  sourceUrl: string;
  matchScore?: number;
  companyDetails?: string;
  postedDate?: string;
}

export interface ApplicationInsight {
  status: 'Strong Match' | 'Potential Match' | 'Gaps Detected';
  reasoning: string;
  missingKeywords: string[];
  tipsToWin: string;
}

export interface ResumeAnalysis {
  score: number;
  parsedName: string;
  parsedRole: string;
  improvements: string[];
  skills: string[];
  summary: string;
}

export enum AppSection {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  JOBS = 'jobs',
  COACH = 'coach',
  LIVE_PREP = 'live-prep'
}

export interface UserProfile {
  resumeUrl?: string;
  analysis?: ResumeAnalysis;
  isPro: boolean;
}
