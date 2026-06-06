/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Briefcase, 
  Users, 
  Terminal, 
  LogOut, 
  Plus, 
  FileCheck, 
  FileText,
  Settings, 
  TrendingUp, 
  Award,
  Upload,
  Layers,
  ChevronRight,
  Sparkles,
  Send,
  Trash2,
  Lock,
  Cpu,
  BookmarkCheck,
  Building,
  DollarSign,
  Video,
  Mic,
  Route,
  Target,
  Shirt,
  Palette,
  HeartHandshake,
  BookOpen,
  Activity,
  CheckCircle2,
  ListFilter,
  Clipboard,
  Globe,
  Languages,
  Menu,
  X,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { UserRole, UserProfile } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import CandidateDashboard from './CandidateDashboard';
import ResumeScanner from './ResumeScanner';
import ResumeReports from './ResumeReports';
import AIInterview from './AIInterview';
import CommunicationCoach from './CommunicationCoach';
import HumanIntelligence from './HumanIntelligence';

// Phase 5 Premium Features
import AICareerTwin from './AICareerTwin';
import VoiceAssistant from './VoiceAssistant';
import PremiumMentorship from './PremiumMentorship';
import RecruiterDashboard from './RecruiterDashboard';
import PermissionsDashboard from '../components/PermissionsDashboard';
import { translations, SUPPORTED_LANGUAGES, AppLanguage } from '../lib/translations';

interface DashboardProps {
  isDark: boolean;
  onNavigate: (view: 'landing' | 'login' | 'signup' | 'forgot-password' | 'verify-email' | 'dashboard') => void;
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  salary: string;
  type: string;
  location: string;
}

export default function Dashboard({ isDark, onNavigate }: DashboardProps) {
  const { user, userProfile, logout, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lang, setLang] = useState<AppLanguage>('en');
  const t = (key: string) => translations[lang]?.[key] || translations['en']?.[key] || key;
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Role verification helper
  const role: UserRole = userProfile?.role || 'Candidate';

  // Automatically sync initial activeTab based on role on logon/refresh
  useEffect(() => {
    if (role === 'Recruiter') {
      setActiveTab('recruiter-dash');
    } else if (role === 'Admin') {
      setActiveTab('admin-overview');
    } else {
      setActiveTab('overview');
    }
  }, [role]);

  // State for Candidate Applications Activity
  const [applications, setApplications] = useState<Array<{ jobId: string, status: string, appliedAt: string }>>([
    { jobId: 'job-1', status: 'In Review', appliedAt: '2026-06-01T15:30:00Z' },
    { jobId: 'job-3', status: 'AI Match Approved', appliedAt: '2026-06-03T09:45:00Z' }
  ]);

  // State for Resume File Simulation
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // State for Recruiter Postings
  const [jobs, setJobs] = useState<JobListing[]>([
    { id: 'job-1', title: 'Senior Machine Learning Architect', company: 'Nebula Dynamics', salary: '$185,000 - $210,000', type: 'Full-Time', location: 'Remote (Global)' },
    { id: 'job-2', title: 'Senior Blockchain Infrastructure Specialist', company: 'Decentral Cloud Syndicate', salary: '$160,000 - $190,000', type: 'Contract', location: 'Hybrid (Sydney, AU)' },
    { id: 'job-3', title: 'Generative AI Prompt Security Auditor', company: 'Aether Cryptography Corp.', salary: '$145,000 - $175,000', type: 'Full-Time', location: 'Remote (US/Canada)' },
  ]);

  // Form states for Recruiter Add Job
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobSalary, setNewJobSalary] = useState('');
  const [newJobType, setNewJobType] = useState('Full-Time');
  const [newJobLocation, setNewJobLocation] = useState('');

  // State for Recruiter Applicants queue
  const [recruiterApplicants, setRecruiterApplicants] = useState([
    { id: 'app-1', name: 'Althea Vance', email: 'althea.vance@qyronix.io', job: 'Senior Machine Learning Architect', score: 98, status: 'Recommended by AI' },
    { id: 'app-2', name: 'Elijah Sterling', email: 'e.sterling@ciphernet.com', job: 'Generative AI Prompt Security Auditor', score: 91, status: 'Interview Scheduled' },
    { id: 'app-3', name: 'Zoe Thorne', email: 'zoe@hyperplane.org', job: 'Senior Blockchain Infrastructure Specialist', score: 85, status: 'In Evaluation' }
  ]);

  // State for Admin Users Registry
  const [userRegistry, setUserRegistry] = useState<UserProfile[]>([
    { uid: 'uId-1', name: 'Althea Vance', email: 'althea.vance@qyronix.io', role: 'Candidate', createdAt: '2026-05-15T12:00:00Z' },
    { uid: 'uId-2', name: 'Marcus Brody', email: 'recruiter@qyronix.io', role: 'Recruiter', createdAt: '2026-05-16T15:24:00Z' },
    { uid: 'uId-3', name: 'Administrator Mainframe', email: 'admin@qyronix.io', role: 'Admin', createdAt: '2026-05-10T09:00:00Z' },
    { uid: 'uId-4', name: 'Lyra Heartwell', email: 'lyra.heart@candidate.net', role: 'Candidate', createdAt: '2026-06-01T11:42:00Z' }
  ]);

  // State for Admin Terminal Stream Logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toISOString()}] INITIALIZING INTEGRATION PORT_3000...`,
    `[${new Date().toISOString()}] FIREBASE AUTH LISTENER INITIALIZED WITH RESOLVE_TOKEN_PERSISTENCE`,
    `[${new Date().toISOString()}] FIRESTORE CONFIG: database_enterprise_active[${userProfile?.email || 'unidentified'}]`
  ]);

  // Settings tab state vars
  const [settingsName, setSettingsName] = useState(userProfile?.name || '');
  const [settingsCategory, setSettingsCategory] = useState('Machine Learning / AI');
  const [settingsAlerts, setSettingsAlerts] = useState(true);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Recruiter settings states
  const [recSettingsCompany, setRecSettingsCompany] = useState('Nebula Dynamics');
  const [recSettingsPosition, setRecSettingsPosition] = useState('Talent acquisition director');
  const [recSettingsSaved, setRecSettingsSaved] = useState(false);

  // Sync initial forms
  useEffect(() => {
    if (userProfile?.name) {
      setSettingsName(userProfile.name);
    }
  }, [userProfile]);

  // Recruiter comparing tool selections
  const [compareList, setCompareList] = useState<string[]>([]);

  // Append terminal logs for Admin
  useEffect(() => {
    if (role !== 'Admin') return;
    const logInterval = setInterval(() => {
      const actions = [
        'FIRESTORE OPERATION /usersRead SUCCESS - queryMatches: 12',
        'ABAC RULE VALIDATION: isValidUser -- OK',
        'ESTABLISHING TOKEN REFRESH TUNNEL INTERFACE',
        'DETERMINISTIC CONFLICT MATRIX VERIFIED: zero update leaks detected',
        'SYSTEM STATUS: SECURE (100% integrity index)',
        'RECRUITER FEEDBACK INBOUND BATCH SYNCHRONIZED',
        'AUDITING ACCESS CHANNELS: TLS ENCRYPTED PORT 3000 CONCURRENCY'
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setTerminalLogs(prev => [...prev.slice(-9), `[${new Date().toISOString()}] ${randomAction}`]);
    }, 4500);

    return () => clearInterval(logInterval);
  }, [role]);

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Submit Job Application Simulation
  const submitApplication = (jobId: string) => {
    if (applications.some(app => app.jobId === jobId)) return;
    const newApp = {
      jobId,
      status: 'Applied (AI Evaluation)',
      appliedAt: new Date().toISOString()
    };
    setApplications(prev => [newApp, ...prev]);
  };

  // Recruiter actions: Add listing
  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobCompany) return;
    const newJob: JobListing = {
      id: `job-${jobs.length + 1}`,
      title: newJobTitle,
      company: newJobCompany,
      salary: newJobSalary || '$100,000 - $120,000',
      type: newJobType,
      location: newJobLocation || 'Remote'
    };
    setJobs(prev => [...prev, newJob]);
    setNewJobTitle('');
    setNewJobCompany('');
    setNewJobSalary('');
    setNewJobLocation('');
    setActiveTab('recruiter-dash');
  };

  // Settings Save directly to firestore
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        name: settingsName
      });
      await refreshProfile();
      setSettingsSavedMessage(true);
      setTimeout(() => setSettingsSavedMessage(false), 2500);
    } catch (err) {
      console.error("Firestore settings update error:", err);
    }
  };

  // Recruiter Save Settings
  const handleSaveRecSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setRecSettingsSaved(true);
    setTimeout(() => setRecSettingsSaved(false), 2500);
  };

  // Recruiter action: Accept applicant
  const updateApplicantStatus = (id: string, newStatus: string) => {
    setRecruiterApplicants(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: newStatus };
      }
      return app;
    }));
  };

  // Admin action: Switch user profile role on the client
  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    setUserRegistry(prev => prev.map(usr => {
      if (usr.uid === userId) {
        return { ...usr, role: targetRole };
      }
      return usr;
    }));

    if (user && userId === user.uid) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { role: targetRole });
        await refreshProfile();
      } catch (err) {
        console.error("Self role update blocked:", err);
      }
    }
  };

  // Candidate sidebar navigation buttons definers
  const candidateNav = [
    { title: 'Dashboard', tab: 'overview', icon: Layers },
    { title: 'Resume Scanner', tab: 'scanner', icon: FileCheck },
    { title: 'AI Interview', tab: 'interview', icon: Cpu },
    { title: 'Communication Coach', tab: 'coach', icon: Mic },
    { title: 'Body Language Analysis', tab: 'human-intel', icon: Video },
    { title: 'Placement Readiness', tab: 'placement-readiness', icon: Target },
    { title: 'Career Twin', tab: 'career-twin', icon: Route },
    { title: 'Reports', tab: 'reports', icon: Clipboard },
    { title: 'Settings', tab: 'settings', icon: Settings }
  ];

  // Recruiter side navigation items definers
  const recruiterNav = [
    { title: 'Dashboard', tab: 'recruiter-dash', icon: Layers },
    { title: 'Candidates', tab: 'recruiter-candidates', icon: Users },
    { title: 'Resume Analysis', tab: 'recruiter-resumes', icon: FileCheck },
    { title: 'Interview Reports', tab: 'recruiter-interviews', icon: Cpu },
    { title: 'Human Intelligence Reports', tab: 'recruiter-human', icon: Video },
    { title: 'Rankings', tab: 'recruiter-rankings', icon: Award },
    { title: 'Analytics', tab: 'recruiter-analytics', icon: TrendingUp },
    { title: 'Settings', tab: 'recruiter-settings', icon: Settings }
  ];

  // Admin sidebar navigation list definers
  const adminNav = [
    { title: 'Dashboard', tab: 'admin-overview', icon: Terminal },
    { title: 'Users', tab: 'admin-users', icon: Users },
    { title: 'Candidates', tab: 'admin-candidates', icon: User },
    { title: 'Recruiters', tab: 'admin-recruiters', icon: Building },
    { title: 'Reports', tab: 'admin-reports', icon: Clipboard },
    { title: 'Analytics', tab: 'admin-analytics', icon: TrendingUp },
    { title: 'Mentorship', tab: 'admin-mentorship', icon: HeartHandshake },
    { title: 'Settings', tab: 'admin-settings', icon: Settings }
  ];

  const handleSidebarSelect = (tab: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  const activeNav = role === 'Candidate' ? candidateNav : role === 'Recruiter' ? recruiterNav : adminNav;

  return (
    <div id="dashboard-container" className="pt-24 pb-16 px-4 md:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 min-h-screen">
      
      {/* MOBILE HEADER BUTTON BAR */}
      <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-500/10 mb-4">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer font-semibold"
        >
          {mobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Menu Navigation
        </button>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-500">View</span>
            <div className="text-[11px] font-bold text-cyan-400 font-heading">{role} Mainframe</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-500/10 text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER DRAWER */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={`fixed inset-0 z-50 lg:hidden flex`}
          >
            <div className="absolute inset-0 bg-black/80" onClick={() => setMobileSidebarOpen(false)} />
            <div className={`w-64 max-w-xs h-full relative z-10 p-5 flex flex-col justify-between border-r ${
              isDark ? 'bg-[#04030a] border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-500/15">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-cyan-400" />
                    <span className="font-heading font-bold text-base bg-gradient-to-r from-white via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Qyronix Portal</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)}>
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-1">
                  {activeNav.map((n) => (
                    <button
                      key={n.tab}
                      onClick={() => handleSidebarSelect(n.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                        activeTab === n.tab 
                          ? 'bg-gradient-to-r from-aurora-blue/20 to-aurora-purple/10 border-l-2 border-cyan-400 text-white font-bold' 
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <n.icon className={`h-4.5 w-4.5 shrink-0 ${activeTab === n.tab ? 'text-cyan-400' : 'text-slate-500'}`} />
                      {n.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-500/15">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-lg cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Terminate Session
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP LEFT SIDEBAR PANEL */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r pr-4 border-slate-500/10 min-h-[70vh]">
        <div className="space-y-6">
          
          {/* USER CHIP PROFILE */}
          <div className="p-4 rounded-xl border dark:bg-slate-950/20 border-slate-500/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-aurora-blue to-aurora-purple p-0.5 flex items-center justify-center shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-full flex items-center justify-center text-white text-xs font-bold font-heading">
                {userProfile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{userProfile?.name || 'Authorized Session'}</h4>
              <span className={`text-[9px] uppercase font-mono font-bold block ${
                role === 'Admin' ? 'text-emerald-400' : role === 'Recruiter' ? 'text-purple-400' : 'text-cyan-400'
              }`}>{role} MAINBOARD</span>
            </div>
          </div>

          <div className="space-y-1">
            {activeNav.map((n) => (
              <button
                key={n.tab}
                onClick={() => handleSidebarSelect(n.tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                  activeTab === n.tab 
                    ? 'bg-gradient-to-r from-aurora-blue/20 to-aurora-purple/10 border-l-2 border-cyan-400 text-white font-bold' 
                    : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                }`}
              >
                <n.icon className={`h-4.5 w-4.5 shrink-0 ${activeTab === n.tab ? 'text-cyan-400 font-bold' : 'text-slate-550'}`} />
                {n.title}
              </button>
            ))}
          </div>

        </div>

        <div>
          {/* Interactive controls */}
          <div className="mb-4 text-left p-2 rounded-lg bg-slate-950/40 border border-slate-900/60 flex items-center justify-between text-[10px] font-mono select-none text-slate-505">
            <span>Security Index: 100%</span>
            <span className="text-emerald-400 animate-pulse">&#x25CF;</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-95 border border-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* CORE WORKSPACE PANEL */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          
          {/* CANDIDATE COMPONENT WORKSPACE ROUTES */}
          {role === 'Candidate' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {activeTab === 'overview' && (
                <div className="space-y-6 border-none">
                  <CandidateDashboard 
                    isDark={isDark} 
                    onNavigateToTab={(tab) => {
                      if (tab === 'scanner') setActiveTab('scanner');
                      if (tab === 'reports') setActiveTab('reports');
                      if (tab === 'hub') setActiveTab('actions');
                    }}
                  />
                  
                  {/* Pipelines listings */}
                  <GlassCard isDark={isDark} className="p-6 border border-slate-800">
                    <h3 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-1.5 border-none">
                      <Layers className="h-4.5 w-4.5 text-aurora-purple" />
                      Candidate Pipeline Inboxes
                    </h3>
                    {applications.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500">No pipelines logged.</div>
                    ) : (
                      <div className="space-y-3.5">
                        {applications.map((app) => {
                          const jobObj = jobs.find(jb => jb.id === app.jobId) || {
                            title: 'System Specialist Engineer',
                            company: 'Qyronix Corp',
                            location: 'Remote'
                          };
                          return (
                            <div key={app.jobId} className="flex items-center justify-between p-3.5 border dark:border-slate-850 dark:bg-slate-950/20 bg-white border-slate-200 rounded-xl">
                              <div>
                                <h4 className="text-xs font-bold text-white">{jobObj.title}</h4>
                                <span className="text-[10px] text-slate-500 block">{jobObj.company} • {jobObj.location}</span>
                              </div>
                              <span className="text-[10px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2.5 border border-emerald-500/20 py-0.5 rounded">{app.status}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </GlassCard>
                </div>
              )}

              {activeTab === 'scanner' && (
                <ResumeScanner 
                  isDark={isDark} 
                  onNavigateToTab={(tab) => {
                    if (tab === 'dashboard') setActiveTab('overview');
                    if (tab === 'reports') setActiveTab('reports');
                    if (tab === 'hub') setActiveTab('actions');
                  }}
                />
              )}

              {activeTab === 'interview' && (
                <AIInterview 
                  isDark={isDark} 
                />
              )}

              {activeTab === 'coach' && (
                <CommunicationCoach 
                  isDark={isDark} 
                />
              )}

              {activeTab === 'human-intel' && (
                <HumanIntelligence 
                  isDark={isDark} 
                />
              )}

              {/* 6. PLACEMENT READINESS COMPONENT */}
              {activeTab === 'placement-readiness' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-850 bg-slate-950/10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-slate-500/10 pb-4">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-white">Placement Readiness Indicator</h2>
                      <p className="text-xs text-slate-450 leading-relaxed font-semibold">Unified index metrics compiled dynamically across all evaluated checkpoints</p>
                    </div>
                    <div className="px-3.5 py-1.5 bg-gradient-to-tr from-cyan-400/15 via-purple-400/15 to-transparent rounded-lg text-[10.5px] border border-cyan-400/20 font-mono text-cyan-300 uppercase tracking-widest font-bold">
                      Portal Status: Recommended
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Dial */}
                    <div className="p-4 border border-slate-500/10 dark:bg-black/40 rounded-xl flex flex-col items-center justify-center text-center">
                      <div className="relative h-28 w-28 flex items-center justify-center mb-3">
                        {/* Circular Meter SVG representation */}
                        <svg className="absolute inset-0 h-full w-full -rotate-90">
                          <circle cx="56" cy="56" r="48" className="stroke-slate-800 fill-none" strokeWidth="6" />
                          <circle cx="56" cy="56" r="48" className="stroke-cyan-400 fill-none" strokeWidth="6" strokeDasharray="301" strokeDashoffset="40" />
                        </svg>
                        <span className="text-2xl font-bold font-heading text-white">87%</span>
                      </div>
                      <span className="text-xs font-semibold text-cyan-400 font-mono uppercase tracking-widest">Unified Readiness Index</span>
                    </div>

                    {/* Breakdown */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-slate-350">Technical ATS Resume Parity</span>
                          <span className="font-bold font-mono text-cyan-400">92%</span>
                        </div>
                        <div className="h-1.5 rounded bg-slate-800"><div className="h-full bg-cyan-400 rounded" style={{width: '92%'}} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-slate-350">Vocal & Oral Comm Fluidity</span>
                          <span className="font-bold font-mono text-purple-400">88%</span>
                        </div>
                        <div className="h-1.5 rounded bg-slate-800"><div className="h-full bg-purple-400 rounded" style={{width: '88%'}} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-slate-350">Somatic Facial Frame Postures</span>
                          <span className="font-bold font-mono text-emerald-400">82%</span>
                        </div>
                        <div className="h-1.5 rounded bg-slate-800"><div className="h-full bg-emerald-400 rounded" style={{width: '82%'}} /></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl dark:bg-slate-900/30 border border-slate-500/10 leading-normal text-xs text-slate-300">
                    <strong className="text-white block mb-1">AI Recommendation Log:</strong>
                    Your resume has elite matches with remote Machine Learning positions. Direct pacing drills in the <strong>English Communication Coach</strong> module will elevate spontaneous conversation responses to match senior level thresholds under 15ms.
                  </div>
                </GlassCard>
              )}

              {activeTab === 'career-twin' && (
                <div className="space-y-6">
                  <AICareerTwin 
                    isDark={isDark} 
                    language={lang} 
                    t={t} 
                  />
                  <VoiceAssistant 
                    isDark={isDark} 
                    onCommand={(cmd) => {
                      if (cmd === 'start-interview') setActiveTab('interview');
                      if (cmd === 'open-dashboard') setActiveTab('overview');
                      if (cmd === 'upload-resume') setActiveTab('scanner');
                      if (cmd === 'show-reports') setActiveTab('reports');
                    }}
                    t={t} 
                  />
                </div>
              )}

              {activeTab === 'reports' && (
                <ResumeReports 
                  isDark={isDark} 
                  onNavigateToTab={(tab) => {
                    if (tab === 'scanner') setActiveTab('scanner');
                    if (tab === 'dashboard') setActiveTab('overview');
                  }}
                />
              )}

              {/* 9. CANDIDATE PROFILE SETTINGS */}
              {activeTab === 'settings' && (
                <div id="candidate-settings-tab" className="space-y-6">
                  <GlassCard isDark={isDark} className="p-6 border border-slate-800">
                    <h3 className="font-heading text-lg font-bold text-white mb-4 border-none">Mainframe Settings Registry</h3>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Update Full Name</label>
                        <input
                          id="set-display-name"
                          type="text"
                          required
                          value={settingsName}
                          onChange={(e) => setSettingsName(e.target.value)}
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all ${
                            isDark ? 'bg-slate-950/40 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Preferred Industry Focus</label>
                        <select
                          id="set-pref-cat"
                          value={settingsCategory}
                          onChange={(e) => setSettingsCategory(e.target.value)}
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                            isDark ? 'bg-slate-950/40 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                          }`}
                        >
                          <option value="Machine Learning / AI">Machine Learning / AI Systems</option>
                          <option value="Blockchain Infrastructure">Blockchain Infrastructure</option>
                          <option value="Full-Stack Web Architect">Full-Stack Web Architect</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 py-2 border-t border-b border-slate-500/10">
                        <input
                          id="set-alerts-toggle"
                          type="checkbox"
                          checked={settingsAlerts}
                          onChange={(e) => setSettingsAlerts(e.target.checked)}
                          className="h-4 w-4 bg-transparent border-slate-800 rounded focus:ring-0"
                        />
                        <label className="text-xs text-slate-300 font-medium">Activate pipeline email transaction updates</label>
                      </div>

                      <div className="pt-4 flex justify-between items-center gap-2">
                        <button
                          id="set-save-btn"
                          type="submit"
                          className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-aurora-blue to-aurora-purple rounded-lg shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        >
                          Update My Identity
                        </button>
                        <AnimatePresence>
                          {settingsSavedMessage && (
                            <motion.span 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              exit={{ opacity: 0 }}
                              className="text-xs text-emerald-450 font-mono font-bold"
                            >
                              ✓ Firestore records updated!
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </form>
                  </GlassCard>

                  <PermissionsDashboard isDark={isDark} />
                </div>
              )}
            </motion.div>
          )}

          {/* RECRUITER COMPONENT WORKSPACE ROUTES */}
          {role === 'Recruiter' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {activeTab === 'recruiter-dash' && (
                <div className="space-y-6">
                  <RecruiterDashboard isDark={isDark} t={t} />

                  {/* Add listing vacancy */}
                  <GlassCard isDark={isDark} className="p-6 border border-slate-800">
                    <h3 className="font-heading text-base font-bold text-white mb-4">Publish Active Enterprise Vacancy</h3>
                    <form onSubmit={handleAddJob} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Listing Position Title</label>
                          <input
                            id="rec-job-title"
                            type="text"
                            required
                            value={newJobTitle}
                            onChange={(e) => setNewJobTitle(e.target.value)}
                            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                              isDark ? 'bg-slate-950/40 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                            placeholder="e.g. Lead Machine Learning Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Host Name</label>
                          <input
                            id="rec-job-comp"
                            type="text"
                            required
                            value={newJobCompany}
                            onChange={(e) => setNewJobCompany(e.target.value)}
                            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                              isDark ? 'bg-slate-950/40 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                            placeholder="e.g. Nebula Dynamics"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Shorthand Salary</label>
                          <input
                            id="rec-job-salary"
                            type="text"
                            value={newJobSalary}
                            onChange={(e) => setNewJobSalary(e.target.value)}
                            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                              isDark ? 'bg-slate-950/40 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-905'
                            }`}
                            placeholder="e.g. $185k - $210k"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Target Location</label>
                          <input
                            id="rec-job-loc"
                            type="text"
                            value={newJobLocation}
                            onChange={(e) => setNewJobLocation(e.target.value)}
                            className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                              isDark ? 'bg-slate-950/40 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                            placeholder="e.g. Remote"
                          />
                        </div>
                      </div>

                      <button
                        id="rec-publish-submit"
                        type="submit"
                        className="w-full mt-2 py-3 bg-gradient-to-r from-aurora-blue to-aurora-purple text-white text-xs font-bold rounded-xl active:scale-95 transition-all hover:brightness-110 cursor-pointer"
                      >
                        Publish Vacancy to Portal
                      </button>
                    </form>
                  </GlassCard>
                </div>
              )}

              {/* RECRUITER LIST OF INBOUND CANDIDATES */}
              {activeTab === 'recruiter-candidates' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-800">
                  <h3 className="font-heading text-base font-bold text-white mb-2">Applicants Evaluations Hub</h3>
                  <p className="text-xs text-slate-450 leading-relaxed mb-6">Examine inbound job candidate matching files and select decisions.</p>

                  <div className="space-y-4">
                    {recruiterApplicants.map((a) => (
                      <div key={a.id} className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{a.name}</h4>
                          <span className="text-[10px] text-slate-500 block">{a.email}</span>
                          <span className="text-[10.5px] mt-1.5 inline-block text-slate-350">Job: <strong className="text-cyan-400">{a.job}</strong></span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">AI Score</span>
                            <span className="text-base font-extrabold font-mono text-cyan-400 block">{a.score}%</span>
                          </div>

                          <div className="h-6 w-px bg-slate-800" />

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] px-2 py-0.5 rounded text-indigo-400 border border-slate-800 bg-slate-950/20 text-center font-mono">{a.status}</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => updateApplicantStatus(a.id, 'Approved (AI Verified)')}
                                className="px-2 py-1 text-[10px] rounded bg-emerald-500/15 text-emerald-450 border border-emerald-500/20 hover:bg-emerald-500/30 cursor-pointer font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateApplicantStatus(a.id, 'Needs Human Follow-up')}
                                className="px-2 py-1 text-[10px] rounded bg-amber-500/15 text-amber-450 border border-amber-500/20 hover:bg-amber-500/30 cursor-pointer font-bold"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* RECRUITER RESUME ANALYST TABLE */}
              {activeTab === 'recruiter-resumes' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-850">
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Resume Processing Terminal</h3>
                  <p className="text-xs text-slate-450 mb-6">Compare resumes side-by-side to determine ATS keywords disparity.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl border dark:border-slate-850 dark:bg-black/30">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Resume A (Standard candidate)</h4>
                      <div className="p-3 bg-slate-950 text-slate-400 rounded-lg text-[10.5px] font-mono leading-normal h-[140px] overflow-y-auto">
                        Skills extracted:<br />
                        - Javascript (9 years)<br />
                        - System architecture (4 years)<br />
                        - REST APIs, Docker, SQL, NodeJS<br />
                        ATS Score match: 72%
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border dark:border-slate-850 dark:bg-black/30">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Resume B (Elite candidate)</h4>
                      <div className="p-3 bg-slate-950 text-slate-400 rounded-lg text-[10.5px] font-mono leading-normal h-[140px] overflow-y-auto">
                        Skills extracted:<br />
                        - TypeScript, React, Next.js (8 years)<br />
                        - Generative AI, PyTorch, LLMs (3 years)<br />
                        - PostgreSQL Transaction optimization<br />
                        ATS Score match: 96%
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* AI INTERVIEWS RATING TAB */}
              {activeTab === 'recruiter-interviews' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-850 text-left">
                  <h3 className="font-heading text-lg font-bold text-white mb-2">AI Interviewer Sessions Review</h3>
                  <p className="text-xs text-slate-450 mb-6">Logs and grading reports compiled automatically from applicant speech answers.</p>

                  <div className="p-4 border dark:border-slate-800 dark:bg-slate-950/20 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-white">Althea Vance Session ID #int_83j21</strong>
                      <span className="font-mono text-cyan-400 font-bold">Fluidity: 98/100</span>
                    </div>

                    <div className="p-3 dark:bg-black/40 rounded-lg leading-normal font-mono text-[10.5px] text-slate-350 space-y-2">
                      <div>
                        <span className="text-purple-400 block font-bold">&gt; Question: Explain postgresql query index acceleration mechanics.</span>
                        <span className="text-slate-300 block">&quot;Indices construct standard binary B-Trees containing leaf-level node pointers, which accelerates query fetches under O(log n)...&quot;</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 block font-bold">&gt; AI Verdict: Expert. High-density keyword matching detected.</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* HUMAN INTEL/SOMATIC FEEDBACK REPORTS */}
              {activeTab === 'recruiter-human' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-850">
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Expression & Behavior Audit</h3>
                  <p className="text-xs text-slate-455 mb-6">Audit posture steadiness, filler-words profiles, and presentation confidence logs.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-normal font-mono text-slate-350">
                    <div className="p-4 border border-slate-800 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-cyan-400 block font-bold">Posture Steadiness</span>
                      <strong className="text-white text-base block">94%</strong>
                      <span className="text-[10px] text-slate-500 block">Frame displacement &lt; 2px. Strong presenter confidence.</span>
                    </div>
                    <div className="p-4 border border-slate-800 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-purple-400 block font-bold">Filler Frequency</span>
                      <strong className="text-white text-base block">0.8 / min</strong>
                      <span className="text-[10px] text-slate-500 block">Low reliance on filler keywords. Optimal tech pacing in speech.</span>
                    </div>
                    <div className="p-4 border border-slate-800 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-emerald-400 block font-bold">Grooming Alignment</span>
                      <strong className="text-white text-base block">Excellent</strong>
                      <span className="text-[10px] text-slate-500 block">Formal clothing symmetry verified via frame check indexes.</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* RECRUITER RANKINGS PANEL */}
              {activeTab === 'recruiter-rankings' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-855">
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Talent Match Rankings Grid</h3>
                  <p className="text-xs text-slate-455 mb-6">Applicants ranked dynamically. Select candidate checkmarks to generate comparison vectors.</p>

                  <div className="border border-slate-850 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/40 border-b border-slate-850 font-semibold text-slate-400 font-heading">
                          <th className="p-3 text-center">Select</th>
                          <th className="p-3">Rank No.</th>
                          <th className="p-3">Candidate</th>
                          <th className="p-3">Primary Tech Check</th>
                          <th className="p-3 text-right">Unified Placement Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40 text-slate-350">
                        <tr>
                          <td className="p-3 text-center">
                            <input
                              id="compare-1"
                              type="checkbox"
                              checked={compareList.includes('app-1')}
                              onChange={(e) => {
                                if (e.target.checked) setCompareList(prev => [...prev, 'app-1']);
                                else setCompareList(prev => prev.filter(c => c !== 'app-1'));
                              }}
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-cyan-400">#01</td>
                          <td className="p-3 font-semibold text-white">Althea Vance</td>
                          <td className="p-3">TypeScript / ML</td>
                          <td className="p-3 text-right font-mono font-bold text-cyan-400">98%</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-center">
                            <input
                              id="compare-2"
                              type="checkbox"
                              checked={compareList.includes('app-2')}
                              onChange={(e) => {
                                if (e.target.checked) setCompareList(prev => [...prev, 'app-2']);
                                else setCompareList(prev => prev.filter(c => c !== 'app-2'));
                              }}
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-purple-400">#02</td>
                          <td className="p-3 font-semibold text-white">Elijah Sterling</td>
                          <td className="p-3">Prompt Analyst</td>
                          <td className="p-3 text-right font-mono font-bold text-purple-400">91%</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-center">
                            <input
                              id="compare-3"
                              type="checkbox"
                              checked={compareList.includes('app-3')}
                              onChange={(e) => {
                                if (e.target.checked) setCompareList(prev => [...prev, 'app-3']);
                                else setCompareList(prev => prev.filter(c => c !== 'app-3'));
                              }}
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-500">#03</td>
                          <td className="p-3 font-semibold text-white">Zoe Thorne</td>
                          <td className="p-3">Rust / Blockchain</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-400">85%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <AnimatePresence>
                    {compareList.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-xs text-slate-300 font-mono leading-normal"
                      >
                        <strong className="text-white font-heading block mb-2">Simulated Comparative Matrices Log:</strong>
                        Compared applicants: <strong>{compareList.length} Selected</strong>. Althea Vance outperforms Elijah Sterling on Technical depth parity by +7%. Elijah Sterling exhibits slightly stronger vocal presentation pace consistency under stress. Recommendation: Proceed with Althea Vance for Core ML Role.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              )}

              {/* RECRUITER ANALYTICS GRAPHS PANEL */}
              {activeTab === 'recruiter-analytics' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-860">
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Recruitment Pipeline Analytics</h3>
                  <p className="text-xs text-slate-455 mb-6">Macro system parameters logging hiring metrics and throughput conversions.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-slate-850 dark:bg-black/35 rounded-xl">
                      <h4 className="text-xs font-bold text-white uppercase mb-3">Applicants Velocity Stream (Weekly)</h4>
                      <div className="h-44 w-full flex items-end gap-3 px-2 border-b border-l border-slate-800 pb-2">
                        {/* Interactive handbuilt SVG bar graph illustration */}
                        <div className="flex-1 bg-cyan-400/25 rounded-t hover:bg-cyan-400/50 transition-colors h-[25%]" title="Week 1: 112 matches" />
                        <div className="flex-1 bg-cyan-400/35 rounded-t hover:bg-cyan-400/50 transition-colors h-[45%]" title="Week 2: 182 matches" />
                        <div className="flex-1 bg-cyan-400/55 rounded-t hover:bg-cyan-400/50 transition-colors h-[75%]" title="Week 3: 312 matches" />
                        <div className="flex-1 bg-gradient-to-t from-cyan-400/80 to-purple-400/80 rounded-t h-[95%]" title="Week 4 (Current): 412 matches" />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                        <span>Wk 01</span>
                        <span>Wk 02</span>
                        <span>Wk 03</span>
                        <span>Wk 04 (Active)</span>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-850 dark:bg-black/35 rounded-xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase mb-1">Hiring Metric Highlights</h4>
                        <p className="text-[11px] text-slate-500 mb-3">Calculated over historical portal operations.</p>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Average Screening Velocity</span>
                          <span className="font-bold text-white font-mono">1.2 days (Ultra Fast)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Match Retention Parity</span>
                          <span className="font-bold text-white font-mono">94.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Database security integrity</span>
                          <span className="font-semibold text-emerald-400 font-mono">100% OK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* RECRUITER SETTINGS PANEL */}
              {activeTab === 'recruiter-settings' && (
                <div id="recruiter-settings-tab" className="space-y-6">
                  <GlassCard isDark={isDark} className="p-6 border border-slate-850">
                    <h3 className="font-heading text-lg font-bold text-white mb-2">Recruiter Access settings</h3>
                    <p className="text-xs text-slate-455 mb-6">Modify business credentials and set synchronization bounds.</p>

                    <form onSubmit={handleSaveRecSettings} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Workspace Domain</label>
                        <input
                          id="rec-set-company"
                          type="text"
                          required
                          value={recSettingsCompany}
                          onChange={(e) => setRecSettingsCompany(e.target.value)}
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all ${
                            isDark ? 'bg-slate-950/40 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Business Role Description</label>
                        <input
                          id="rec-set-role"
                          type="text"
                          required
                          value={recSettingsPosition}
                          onChange={(e) => setRecSettingsPosition(e.target.value)}
                          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all ${
                            isDark ? 'bg-slate-950/40 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                          }`}
                        />
                      </div>

                      <div className="pt-4 flex justify-between items-center">
                        <button
                          id="rec-set-save-btn"
                          type="submit"
                          className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-aurora-blue to-aurora-purple rounded-lg shadow hover:brightness-110 cursor-pointer"
                        >
                          Commit Business Profile
                        </button>
                        <AnimatePresence>
                          {recSettingsSaved && (
                            <motion.span 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              exit={{ opacity: 0 }}
                              className="text-xs text-emerald-450 font-mono font-bold"
                            >
                              ✓ Credentials synchronized!
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </form>
                  </GlassCard>

                  <PermissionsDashboard isDark={isDark} />
                </div>
              )}
            </motion.div>
          )}

          {/* ADMIN COMPONENT WORKSPACE ROUTES */}
          {role === 'Admin' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* ADMIN OVERVIEW TABLE AND CONSOLE */}
              {activeTab === 'admin-overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Terminal stream */}
                  <div className="md:col-span-1">
                    <GlassCard isDark={isDark} className="p-5 border border-slate-850 flex flex-col justify-between h-full bg-[#05040d]">
                      <div>
                        <h3 className="font-heading text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                          <Terminal className="h-4.5 w-4.5 animate-pulse" />
                          Master Logger Console
                        </h3>
                        <div className="bg-slate-950/90 rounded-lg p-3 font-mono text-[9px] text-[#22c55e] border border-slate-850 h-[280px] overflow-y-auto space-y-2 select-none leading-relaxed">
                          {terminalLogs.map((log, index) => (
                            <div key={index} className="border-b border-slate-900/40 pb-1 last:border-0 truncate">{log}</div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800/50 text-[9.5px] font-mono text-slate-500 flex justify-between items-center">
                        <span>Ingress: Port 3000 OK</span>
                        <span className="text-emerald-500 font-bold">&#x25CF; CENTRAL MAIN</span>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Settings overview */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 border dark:bg-slate-950/20 dark:border-slate-850 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Total Profiles</span>
                        <strong className="text-2xl font-bold font-heading text-white">{userRegistry.length}</strong>
                      </div>
                      <div className="p-4 border dark:bg-slate-950/20 dark:border-slate-850 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Db Safety Check</span>
                        <strong className="text-2xl font-bold font-heading text-emerald-400">Secure</strong>
                      </div>
                      <div className="p-4 border dark:bg-slate-950/20 dark:border-slate-850 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Leak indices</span>
                        <strong className="text-2xl font-bold font-heading text-cyan-400">0%</strong>
                      </div>
                    </div>

                    <GlassCard isDark={isDark} className="p-6 border border-slate-850">
                      <h3 className="font-heading text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                        <Award className="h-4.5 w-4.5 text-yellow-400" />
                        Platform Security Assertions
                      </h3>
                      <p className="text-xs text-slate-450 mb-4 leading-normal">Operational limits configured globally to restrict profile tampering across client browser processes.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 border dark:border-slate-850 dark:bg-slate-950/10 rounded-xl space-y-1">
                          <strong className="text-white block font-heading">Authentic User Checks</strong>
                          <span className="text-slate-450 block text-[11px] leading-relaxed">System demands valid verification links before editing candidate folders or uploading resume materials directly.</span>
                        </div>
                        <div className="p-3.5 border dark:border-slate-850 dark:bg-slate-950/10 rounded-xl space-y-1">
                          <strong className="text-white block font-heading">Token Integrity Assertions</strong>
                          <span className="text-slate-450 block text-[11px] leading-relaxed">Administrative promotion checks enforce verified source parameters, protecting general portal users from self-privilege upgrades.</span>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              )}

              {/* ADMIN USERS REGISTRY TABLE */}
              {activeTab === 'admin-users' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-850 text-left">
                  <h3 className="font-heading text-base font-bold text-white mb-1.5">Global System Users Directory</h3>
                  <p className="text-xs text-slate-455 mb-6">Modify user privilege settings and assign mainframe administrative targets.</p>

                  <div className="border border-slate-850 rounded-xl overflow-hidden glass-card-dark text-xs text-left">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/40 border-b border-slate-850 text-slate-400 font-semibold font-heading">
                          <th className="p-3">User</th>
                          <th className="p-3">Email Registry</th>
                          <th className="p-3">Role privilege</th>
                          <th className="p-3">Registered Chrono</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40 text-slate-300">
                        {userRegistry.map((u) => (
                          <tr key={u.uid}>
                            <td className="p-3 font-semibold text-white">{u.name}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-450">{u.email}</td>
                            <td className="p-3">
                              <select
                                id={`set-role-${u.uid}`}
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                                className="bg-slate-950/60 text-[11px] font-semibold text-cyan-400 px-2 py-1 rounded border border-slate-800 outline-none cursor-pointer"
                              >
                                <option value="Candidate">Candidate</option>
                                <option value="Recruiter">Recruiter</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </td>
                            <td className="p-3 font-mono text-[10.5px] text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}

              {/* AUDIT TABLE CANDIDATES */}
              {activeTab === 'admin-candidates' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-850">
                  <h3 className="font-heading text-base font-bold text-white mb-1.5">Candidate Profiles Audit</h3>
                  <p className="text-xs text-slate-455 mb-6">Review candidate identity tags and portfolio compliance.</p>

                  <div className="space-y-3.5">
                    {userRegistry.filter(u => u.role === 'Candidate').map(c => (
                      <div key={c.uid} className="flex justify-between items-center p-3.5 border border-slate-850 rounded-xl text-xs">
                        <div>
                          <strong className="text-white block">{c.name}</strong>
                          <span className="text-[10.5px] text-slate-500 font-mono block">{c.email}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Identity Compliant</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* AUDIT TABLE RECRUITERS */}
              {activeTab === 'admin-recruiters' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-855">
                  <h3 className="font-heading text-base font-bold text-white mb-1.5">Recruiter Verification registries</h3>
                  <p className="text-xs text-slate-455 mb-6">Audit active corporate licensing clearance levels for recruitment nodes.</p>

                  <div className="space-y-4">
                    <div className="p-4 border border-slate-850 dark:bg-slate-950/20 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white block font-heading">Nebula Dynamics Recruiting Hub</strong>
                        <span className="text-[10.5px] text-slate-500 block">Licence status: Elite partner node</span>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono font-bold uppercase">Cleared</span>
                    </div>

                    <div className="p-4 border border-slate-850 dark:bg-slate-950/20 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white block font-heading">Ciphernet Automation Partners</strong>
                        <span className="text-[10.5px] text-slate-500 block">Licence status: Verification complete</span>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono font-bold uppercase">Cleared</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* ADMIN SYSTEM REPORTS SUMMARIES */}
              {activeTab === 'admin-reports' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-855">
                  <h3 className="font-heading text-base font-bold text-white mb-2">Platform Totals Metric Report</h3>
                  <p className="text-xs text-slate-450 mb-6">General operations parameters compiled from active database transaction nodes.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center leading-normal font-mono text-slate-350 text-xs">
                    <div className="p-4 border border-slate-850 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-slate-500 block font-bold">Resumes scanned</span>
                      <strong className="text-white text-lg block">1,842</strong>
                    </div>
                    <div className="p-4 border border-slate-850 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-slate-500 block font-bold">Interviews held</span>
                      <strong className="text-white text-lg block">912</strong>
                    </div>
                    <div className="p-4 border border-slate-850 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-slate-500 block font-bold">Active candidates</span>
                      <strong className="text-white text-lg block">1,114</strong>
                    </div>
                    <div className="p-4 border border-slate-850 dark:bg-slate-950/40 rounded-xl space-y-1">
                      <span className="text-slate-500 block font-bold">Database matches</span>
                      <strong className="text-emerald-400 text-lg block">14,241</strong>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* SERVER ANALYTICS GRAPHICS */}
              {activeTab === 'admin-analytics' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-860">
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Systems performance metrics</h3>
                  <p className="text-xs text-slate-455 mb-6">Realtime CPU loads and active database transaction speeds charts.</p>

                  <div className="p-4 border border-slate-850 dark:bg-black/35 rounded-xl">
                    <h4 className="text-xs font-bold text-white uppercase mb-3">Database Server workloads (Millisecond latency)</h4>
                    <div className="h-40 w-full flex items-end gap-2.5 px-2 border-b border-l border-slate-800 pb-2">
                      <div className="flex-1 bg-emerald-400/20 h-[15%]" title="12ms" />
                      <div className="flex-1 bg-emerald-400/30 h-[25%]" title="18ms" />
                      <div className="flex-1 bg-emerald-400/40 h-[20%]" title="15ms" />
                      <div className="flex-1 bg-emerald-400/50 h-[35%]" title="28ms" />
                      <div className="flex-1 bg-gradient-to-t from-emerald-400/80 to-cyan-400/80 h-[10%]" title="8ms" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                      <span>03:00 AM</span>
                      <span>06:00 AM</span>
                      <span>09:00 AM</span>
                      <span>12:00 PM</span>
                      <span>Active (Current)</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* ADMIN MENTORSHIP TRANSACTIONS */}
              {activeTab === 'admin-mentorship' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-865">
                  <h3 className="font-heading text-base font-bold text-white mb-1.5">Mentorship Operations Audit</h3>
                  <p className="text-xs text-slate-455 mb-6">Review synchronization logs connecting student candidates to professional senior mentors.</p>

                  <div className="p-4 border border-slate-850 dark:bg-slate-950/20 rounded-xl leading-relaxed text-xs">
                    <strong className="text-white block font-heading mb-2">Global Mentorship connections active: 12 Pairs</strong>
                    <div className="font-mono text-[11px] text-slate-350 space-y-1.5">
                      <div className="border-b border-slate-850/40 pb-1.5 last:border-0 truncate">✓ Candidate Althea Vance matched with Mentor Dr. Sandra Collins (Senior Principle ML, OpenAI)</div>
                      <div className="border-b border-slate-850/40 pb-1.5 last:border-0 truncate">✓ Candidate Zoe Thorne matched with Mentor Sean Connors (Principle Security Engineer, Ciphernet)</div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* ADMIN SYSTEM MASTER CONTROLLERS */}
              {activeTab === 'admin-settings' && (
                <GlassCard isDark={isDark} className="p-6 border border-slate-850">
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Master Terminal Administration Config</h3>
                  <p className="text-xs text-slate-455 mb-6">Alter system thresholds and security assertion limits globally.</p>

                  <div className="p-4 border border-slate-500/10 dark:bg-slate-950/15 rounded-xl space-y-3 font-mono text-[11px] text-slate-350">
                    <div className="flex items-center justify-between">
                      <span>Mainframe ingress PORT encryption check</span>
                      <strong className="text-emerald-400">ENABLED (TLSv1.3)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Maximum candidate resume size upload barrier</span>
                      <strong className="text-white">5 MB</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Firestore rules compliance verifiers index</span>
                      <strong className="text-cyan-400 leading-none">100% SECURED (ABAC ENFORCED)</strong>
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}
