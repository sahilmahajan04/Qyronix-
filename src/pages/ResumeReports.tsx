/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  Search, 
  Gauge, 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  Lightbulb, 
  Activity, 
  BarChart4, 
  Grid,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

interface ResumeReportsProps {
  isDark: boolean;
  onNavigateToTab: (tab: 'scanner' | 'dashboard' | 'hub') => void;
}

interface FullReport {
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
  storagePath?: string;
}

export default function ResumeReports({ isDark, onNavigateToTab }: ResumeReportsProps) {
  const { user } = useAuth();
  const [reports, setReports] = useState<FullReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string>('');

  // Load all reports for this user
  useEffect(() => {
    if (!user) return;
    
    async function loadReports() {
      try {
        const q = query(collection(db, 'reports'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetched: FullReport[] = [];
        querySnapshot.forEach((docSnap) => {
          fetched.push({ ...docSnap.data(), id: docSnap.id } as FullReport);
        });
        
        // Sort newest first
        fetched.sort((a, b) => {
          const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
          const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
          return timeB - timeA;
        });

        setReports(fetched);
        if (fetched.length > 0) {
          setSelectedReportId(fetched[0].id);
        }
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [user]);

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  return (
    <div className="space-y-8">
      
      {/* SECTOR HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <BarChart4 className="h-5.5 w-5.5 text-indigo-400" />
            Core Forensic Reports
          </h2>
          <p className="text-xs text-slate-400">Deep AI structural evaluations and strategic improvements logs</p>
        </div>

        {/* SELECT CONTROL */}
        {reports.length > 1 && (
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-500">Active Deposit Stream:</span>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="bg-[#0c0a1a] border border-slate-800 rounded px-2 py-1.5 text-cyan-400 font-semibold focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
            >
              {reports.map((r, i) => (
                <option key={r.id} value={r.id}>
                  {r.fileName.substring(0, 20)} ({new Date(r.uploadedAt?.seconds * 1000 || r.uploadedAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-850 border-t-indigo-400 animate-spin mx-auto" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Retrieving diagnostic files...</span>
        </div>
      ) : reports.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-950/10 text-center space-y-4 max-w-2xl mx-auto"
        >
          <Activity className="h-12 w-12 text-indigo-400 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-bold text-white tracking-wide">NO REQUISITE DIAGNOSTICS LOGGED</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Before viewing deep analysis audit files, you must upload your resume credentials inside the Active Scanner Core.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('scanner')}
            className="px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-[#818cf8] hover:bg-[#6366f1] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
          >
            <Zap className="h-4 w-4" /> Go to Resume Scanner
          </button>
        </motion.div>
      ) : (
        <div id="full-report-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: DETAILED REPORT VIEW */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. SECTOR SUMMARY CHANNELS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "Linguistic Index", score: activeReport.communicationScore, desc: "Action dynamic density", tag: "Comms" },
                { title: "Authority Index", score: activeReport.confidenceScore, desc: "Subjective declarative verbs", tag: "Confidence" },
                { title: "Placement Index", score: activeReport.placementReadiness, desc: "Corporate technical mapping", tag: "Placement" },
                { title: "Growth milestones", score: activeReport.careerProgress, desc: "Career experience scaling", tag: "Milestones" }
              ].map((sub, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/60 bg-white/20 dark:bg-slate-950/20 backdrop-blur shadow-sm flex flex-col justify-between font-mono"
                >
                  <span className="text-[9px] uppercase text-slate-500 tracking-wider font-bold mb-1">{sub.title}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-white">{sub.score}%</span>
                    <span className="text-[9px] text-[#22c55e] font-semibold leading-none">+Premium</span>
                  </div>
                  <div className="mt-3 w-full bg-slate-900 border border-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${sub.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 2. DYNAMIC EVALUATION BREAKDOWN - CHIPS MATRIX */}
            <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55">
              <div className="flex items-center gap-2 mb-6 border-b border-light-slate-line dark:border-slate-850 pb-3">
                <Grid className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-white">Quantum Skill Gap Audit</h3>
                  <p className="text-xs text-slate-400">Verifying credential taxonomy against industry search indices</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2A. EXTRACTED EXPERTISES */}
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider font-bold text-[#10b981] px-2 py-1 rounded bg-[#10b981]/10">
                    <CheckCircle className="h-3.5 w-3.5" /> Extracted Core Expertises
                  </span>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    The following skill identifiers were successfully located in your credential logs and compiled for matching indices.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {activeReport.extractedSkills?.map((skill, si) => (
                      <span 
                        key={si}
                        className="text-[10px] font-mono bg-emerald-500/5 border border-emerald-500/25 text-emerald-400 px-2.5 py-1 rounded-md shadow-sm shadow-emerald-500/5"
                      >
                        {skill}
                      </span>
                    )) || <span className="text-[10px] font-mono text-slate-450">None extracted</span>}
                  </div>
                </div>

                {/* 2B. GAPS / MISSING KEYWORDS */}
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider font-bold text-[#f59e0b] px-2 py-1 rounded bg-[#f59e0b]/10">
                    <XCircle className="h-3.5 w-3.5" /> Missing Strategic Keywords
                  </span>
                  <p className="text-[11px] text-slate-450 leading-relaxed">
                    Adding these critical strategic tokens into your work descriptions will heavily optimize your ATS compliance rate.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {activeReport.missingKeywords?.map((kw, ki) => (
                      <span 
                        key={ki}
                        className="text-[10px] font-mono bg-amber-500/5 border border-amber-500/25 text-amber-400 px-2.5 py-1 rounded-md shadow-sm shadow-amber-500/5"
                      >
                        + {kw}
                      </span>
                    )) || <span className="text-[10px] font-mono text-slate-450">None missing</span>}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* 3. AI STRUCTURED QUANTUM FEEDBACK */}
            <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55">
              <div className="flex items-center gap-2 mb-4 border-b border-light-slate-line dark:border-slate-850 pb-3">
                <Lightbulb className="h-5 w-5 text-yellow-400 animate-pulse" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-white">Quantum Advisory Core Log</h3>
                  <p className="text-xs text-slate-400">Targeted strategic action recommendations computed directly from scanned file</p>
                </div>
              </div>

              {/* QUALITATIVE HIGHLIGHT FEED */}
              <div className="prose prose-invert max-w-none text-slate-350 text-xs leading-relaxed space-y-4 whitespace-pre-line font-mono select-text selection:bg-indigo-500/30 selection:text-white">
                {activeReport.feedback}
              </div>
            </GlassCard>

          </div>

          {/* RIGHT COLUMN: STRENGTHS & DIAGNOSTICS KEY */}
          <div className="space-y-6">
            
            {/* SCORING CIRCLE GRAPH SUMMARY */}
            <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between bg-[#04020a]">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block mb-2">Diagnostic Score Deck</span>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <h4 className="text-white font-bold font-heading text-sm text-[13px]">{activeReport.fileName}</h4>
                  <span className="text-[9px] text-slate-500 font-mono">FILE_VERIFIED</span>
                </div>

                <div className="py-4 flex flex-col items-center justify-center space-y-3">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="46" fill="transparent" stroke="#110d29" strokeWidth="8" />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="46" 
                        fill="transparent" 
                        stroke="url(#reportAts)" 
                        strokeWidth="8" 
                        strokeDasharray={2 * Math.PI * 46}
                        strokeDashoffset={2 * Math.PI * 46 * (1 - activeReport.atsScore / 100)}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="reportAts" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-bold font-mono text-indigo-400">{activeReport.atsScore}%</span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-500 font-mono leading-none">ATS Level</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-slate-350 block leading-tight font-mono">Quantum Grade Tier</span>
                    <span className="text-lg font-bold text-[#c084fc] font-heading font-mono">
                      {activeReport.atsScore >= 90 ? "TIER - A++" : activeReport.atsScore >= 80 ? "TIER - A" : "TIER - B"}
                    </span>
                  </div>
                </div>

                {/* Submetrics list */}
                <div className="space-y-2 border-t border-slate-900 pt-4 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-slate-450">
                    <span>ATS Matching Engine</span>
                    <span className="text-cyan-400 font-bold">{activeReport.atsScore}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-450">
                    <span>Aesthetic / Layout Metric</span>
                    <span className="text-purple-400 font-bold">{activeReport.resumeScore}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-450">
                    <span>Lexical Verbs Metric</span>
                    <span className="text-emerald-400 font-bold">{activeReport.communicationScore}%</span>
                  </div>
                </div>
              </div>

              {activeReport.storagePath && (
                <div className="border-t border-slate-900 pt-4 mt-6">
                  <a
                    href={activeReport.storagePath}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white transition-all cursor-pointer font-mono text-[11px] block text-center border border-indigo-500/20"
                  >
                    View Original Resume In Storage
                  </a>
                </div>
              )}
            </GlassCard>

            {/* STRENGTH FEED VECTOR */}
            <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 font-bold block">
                  Highlighted Strength Vectors
                </span>
                <div className="space-y-3">
                  {activeReport.strengths?.map((str, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-[10px] leading-relaxed text-slate-350 font-mono">
                      <span className="h-4.5 w-4.5 flex-shrink-0 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">✓</span>
                      <span>{str}</span>
                    </div>
                  )) || <p className="text-xs text-slate-550 font-mono">None logged</p>}
                </div>
              </div>
            </GlassCard>

            {/* WEAKNESS/IMPROVEMENT FEED VECTOR */}
            <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-wider font-mono text-amber-400 font-bold block">
                  Identified Weaknesses & Gaps
                </span>
                <div className="space-y-3">
                  {activeReport.weaknesses?.map((wk, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-[10px] leading-relaxed text-slate-350 font-mono">
                      <span className="h-4.5 w-4.5 flex-shrink-0 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">!</span>
                      <span>{wk}</span>
                    </div>
                  )) || <p className="text-xs text-slate-550 font-mono">None logged</p>}
                </div>
              </div>
            </GlassCard>

          </div>

        </div>
      )}

    </div>
  );
}
