/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  MapPin, 
  Award, 
  BrainCircuit, 
  Briefcase, 
  Compass, 
  Activity, 
  Gauge, 
  Tv, 
  Zap,
  Target,
  FileSpreadsheet,
  Workflow
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

interface CandidateDashboardProps {
  isDark: boolean;
  onNavigateToTab: (tab: 'scanner' | 'reports' | 'hub') => void;
}

interface ReportData {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  uploadedAt: any;
  atsScore: number;
  resumeScore: number;
  communicationScore: number;
  confidenceScore: number;
  placementReadiness: number;
  careerProgress: number;
  extractedSkills: string[];
  missingKeywords: string[];
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export default function CandidateDashboard({ isDark, onNavigateToTab }: CandidateDashboardProps) {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync historical reports from Firestore
  useEffect(() => {
    if (!user) return;
    
    async function loadReports() {
      try {
        const q = query(collection(db, 'reports'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetched: ReportData[] = [];
        querySnapshot.forEach((docSnap) => {
          fetched.push({ ...docSnap.data(), id: docSnap.id } as ReportData);
        });
        
        // Client-side sort by uploadedAt to avoid manual index requirements
        fetched.sort((a, b) => {
          const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
          const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
          return timeB - timeA;
        });
        
        setReports(fetched);
      } catch (err) {
        console.error("Error loading candidate dashboard reports:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [user]);

  // Fallback defaults if no scans exist yet
  const latestReport = reports[0];
  const atsScore = latestReport ? latestReport.atsScore : 0;
  const resumeScore = latestReport ? latestReport.resumeScore : 0;
  const commsScore = latestReport ? latestReport.communicationScore : 0;
  const confidenceScore = latestReport ? latestReport.confidenceScore : 0;
  const placementScore = latestReport ? latestReport.placementReadiness : 0;
  const progressScore = latestReport ? latestReport.careerProgress : 0;

  // OS System Diagnostics Panel Metrics
  const systemStatus = reports.length > 0 ? "STABLE" : "STANDBY";
  const integrityIndex = reports.length > 0 ? "Optimal (98%)" : "Locked (0%)";

  return (
    <div className="space-y-8">
      
      {/* HUD HEADER TELEMETRY STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "OS Core State", val: systemStatus, col: reports.length > 0 ? "text-cyan-400" : "text-amber-400 font-pulse", sub: "Interactive Scanner active" },
          { label: "Talent Feed Integrity", val: integrityIndex, col: reports.length > 0 ? "text-emerald-400" : "text-slate-500", sub: "ABAC gate sync active" },
          { label: "Quantum Upload Logs", val: `${reports.length} Transmissions`, col: "text-purple-400", sub: "Firebase Storage direct uploads" },
          { label: "Hiring Clearance Level", val: roleClearance(progressScore), col: "text-violet-300", sub: "Strategic career placement tier" }
        ].map((hud, idx) => (
          <div 
            key={idx} 
            className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/60 bg-white/20 dark:bg-slate-950/40 backdrop-blur shadow-sm flex items-center justify-between group hover:border-[#1e293b] hover:dark:border-slate-700 transition-all font-mono"
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">{hud.label}</span>
              <span className={`text-base font-bold tracking-tight ${hud.col}`}>{hud.val}</span>
              <span className="text-[9px] text-slate-450 block mt-0.5">{hud.sub}</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse self-start mt-1" />
          </div>
        ))}
      </div>

      {reports.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-950/10 text-center space-y-4 max-w-2xl mx-auto"
        >
          <BrainCircuit className="h-12 w-12 text-cyan-400 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-bold text-white tracking-wide">NO SCAN TELEMETRY DETECTED</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your profile currently lacks initialized resume analysis files. Upload your PDF or DOCX resume to boot the diagnostics core.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('scanner')}
            className="px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-cyan-400/20 active:scale-95"
          >
            <Zap className="h-4 w-4" /> Initialize Quantum Scanner
          </button>
        </motion.div>
      )}

      {/* CORE 6 METRIC OS HUD WIDGETS */}
      {(reports.length > 0 || loading) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. ATS COMPARE WIDGET */}
          <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-400/10 mb-2">
                  <Activity className="h-3 w-3" /> Real-time
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-0.5">ATS Scanner Compatibility</h4>
                <p className="text-xs text-slate-400">Compliance with recruiter parsing nodes</p>
              </div>
              <Gauge className="h-5 w-5 text-cyan-400" />
            </div>

            {/* CYBERPUNK RADIAL RING IN METER */}
            <div className="relative flex items-center justify-center py-4">
              {loading ? (
                <div className="h-28 w-28 rounded-full border-2 border-slate-800 border-t-cyan-400 animate-spin" />
              ) : (
                <>
                  <svg className="w-32 h-32 transform -rotate-90">
                    {/* Background Ring */}
                    <circle cx="64" cy="64" r="50" fill="transparent" stroke="#0f172a" strokeWidth="8" className="opacity-40" />
                    {/* Glow and foreground arc */}
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      fill="transparent" 
                      stroke="url(#atsGrad)" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 * (1 - atsScore / 100)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold font-mono text-cyan-400">{atsScore}%</span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Compatibility</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800/40 pt-4 leading-relaxed">
              {loading ? "Decrypting diagnostics..." : `ATS score of ${atsScore}% matches professional brackets. Eliminate missing keywords to boost pipeline sorting rates.`}
            </p>
          </GlassCard>

          {/* 2. RESUME SCORE */}
          <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-400/10 mb-2">
                  <Target className="h-3 w-3" /> Impact Rating
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-0.5">Resume Score</h4>
                <p className="text-xs text-slate-400">Aesthetic blueprint and structure integrity</p>
              </div>
              <Cpu className="h-5 w-5 text-purple-400" />
            </div>

            {/* CYBERPUNK RADIAL RING IN METER */}
            <div className="relative flex items-center justify-center py-4">
              {loading ? (
                <div className="h-28 w-28 rounded-full border-2 border-slate-800 border-t-purple-400 animate-spin" />
              ) : (
                <>
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="transparent" stroke="#0f172a" strokeWidth="8" className="opacity-40" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      fill="transparent" 
                      stroke="url(#resumeGrad)" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 * (1 - resumeScore / 100)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="resumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold font-mono text-purple-400">{resumeScore}%</span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Formatting</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800/40 pt-4 leading-relaxed">
              {loading ? "Calculating blueprint indexes..." : `Document layout structure scored at ${resumeScore}%. Font pairs and structural margins optimized for machine parsing.`}
            </p>
          </GlassCard>

          {/* 3. COMMUNICATION STRENGTH */}
          <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-400/10 mb-2">
                  <BrainCircuit className="h-3 w-3" /> Lexical Index
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-0.5">Communication Quality</h4>
                <p className="text-xs text-slate-400">Verbal density, grammar, and action-verb metricic</p>
              </div>
              <Compass className="h-5 w-5 text-emerald-400" />
            </div>

            {/* CYBERPUNK RADIAL RING IN METER */}
            <div className="relative flex items-center justify-center py-4">
              {loading ? (
                <div className="h-28 w-28 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
              ) : (
                <>
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="transparent" stroke="#0f172a" strokeWidth="8" className="opacity-40" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      fill="transparent" 
                      stroke="url(#commsGrad)" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 * (1 - commsScore / 100)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="commsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold font-mono text-emerald-400">{commsScore}%</span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Lexical</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800/40 pt-4 leading-relaxed">
              {loading ? "Analyzing speech matrix..." : `Action dynamic indexing active at ${commsScore}%. Tone analyzed as professional, confident, and results-focused.`}
            </p>
          </GlassCard>

          {/* 4. CONFIDENCE INDEX */}
          <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 mb-2">
                  <Sparkles className="h-3 w-3" /> Authority Core
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-0.5">Self-Presentation Score</h4>
                <p className="text-xs text-slate-400">Statement clarity and strong declarative verbs</p>
              </div>
              <Gauge className="h-5 w-5 text-amber-400" />
            </div>

            <div className="space-y-3 py-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Holographic Assertiveness</span>
                <span className="text-amber-400">{loading ? "..." : `${confidenceScore}%`}</span>
              </div>
              <div className="w-full bg-slate-950/60 border border-slate-900 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: loading ? '0%' : `${confidenceScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight font-mono">
                Measured by quantifying active vs passive voice expressions and outcomes-based metric mentions.
              </span>
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800/40 pt-4 leading-relaxed">
              {loading ? "Synthesizing tone authority..." : `Tone is highly supportive of executive authority in critical environments.`}
            </p>
          </GlassCard>

          {/* 5. PLACEMENT READINESS */}
          <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-rose-400 px-2 py-0.5 rounded bg-rose-400/10 mb-2">
                  <Workflow className="h-3 w-3" /> Tech Matching
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-0.5">Corporate Placement Index</h4>
                <p className="text-xs text-slate-400">Technical fit evaluation for top-tier hiring roles</p>
              </div>
              <Target className="h-5 w-5 text-rose-400" />
            </div>

            <div className="space-y-3 py-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Match Readiness Level</span>
                <span className="text-rose-400">{loading ? "..." : `${placementScore}%`}</span>
              </div>
              <div className="w-full bg-slate-950/60 border border-slate-900 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-rose-400 to-red-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: loading ? '0%' : `${placementScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight font-mono">
                Synthesized based on current key skills match metrics across all corporate open roles.
              </span>
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800/40 pt-4 leading-relaxed">
              {loading ? "Computing placement metrics..." : `A score of ${placementScore}% qualifies you for advanced AI and Infrastructure positions.`}
            </p>
          </GlassCard>

          {/* 6. CAREER PROGRESS / SECTOR RANK */}
          <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-400/10 mb-2">
                  <Compass className="h-3 w-3" /> Vector Map
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-0.5">Global Career Progress</h4>
                <p className="text-xs text-slate-400">Strategic milestone alignment rating</p>
              </div>
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>

            <div className="space-y-3 py-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Position Leveling Index</span>
                <span className="text-indigo-400">{loading ? "..." : `${progressScore}%`}</span>
              </div>
              <div className="w-full bg-slate-950/60 border border-slate-900 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-400 to-violet-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: loading ? '0%' : `${progressScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight font-mono">
                Aggregates candidate growth rate, historical experiences, and active education credentials.
              </span>
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800/40 pt-4 leading-relaxed">
              {loading ? "Matching historical trends..." : `Level ${Math.round(progressScore / 20) || 1} clearance. Track improvements dynamically inside "Diagnostic Reports".`}
            </p>
          </GlassCard>

        </div>
      )}

      {/* HISTORIC OS CAREER ROADMAP & PIPELINE TRACKER */}
      {(reports.length > 0) && (
        <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded bg-cyan-400/10 text-cyan-400">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">Quantum Career OS Progression Vector</h3>
              <p className="text-xs text-slate-400">Active milestone channels guarding recruiter placements</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative font-mono text-[11px] select-none">
            {/* Visual connector grid line */}
            <div className="hidden md:block absolute top-[18px] left-[10%] right-[10%] h-[1px] bg-slate-800 z-0 bg-dotted" />

            {[
              { title: "Identity Registered", desc: "Profile validated securely through Firebase Auth", ok: true, active: false },
              { title: "Credentials Uploaded", desc: `${reports.length} resume versions verified in storage`, ok: reports.length > 0, active: false },
              { title: "Quantum Diagnosis Complete", desc: "AI-extracted ATS diagnostic reports live", ok: reports.length > 0, active: reports.length === 1 },
              { title: "Corporate Matchmaker Audit", desc: "Direct recruitment indexing via hiring nodes", ok: progressScore >= 80, active: reports.length > 0 && progressScore < 80 },
              { title: "Strategic Clearance", desc: "Assigned Executive Placement ranking level", ok: progressScore >= 90, active: progressScore >= 80 && progressScore < 90 }
            ].map((milestone, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-2 group">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all ${
                  milestone.ok 
                    ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-400/15' 
                    : milestone.active 
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 animate-pulse shadow-lg shadow-cyan-400/15'
                      : 'bg-slate-950 border-slate-850 text-slate-500'
                }`}>
                  <span className="font-bold text-xs">{idx + 1}</span>
                </div>
                <div>
                  <h5 className={`font-bold text-xs ${milestone.ok ? 'text-white' : milestone.active ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {milestone.title}
                  </h5>
                  <p className="text-[10px] text-slate-450 mt-1 max-w-[150px] mx-auto leading-normal">
                    {milestone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

    </div>
  );
}

// OS Role clearance converter
function roleClearance(score: number): string {
  if (score >= 90) return "Global Director Tier";
  if (score >= 80) return "Lead System Architect";
  if (score >= 65) return "Senior Domain Expert";
  if (score >= 45) return "Technical Consultant";
  return "Initial Operator";
}
