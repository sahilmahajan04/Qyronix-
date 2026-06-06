/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  TrendingUp, 
  Briefcase, 
  FileText, 
  Cpu, 
  UserCheck, 
  Columns, 
  PieChart, 
  ChevronRight, 
  Sparkles,
  Award,
  BookOpen,
  ArrowUpDown,
  User,
  Heart,
  AwardIcon
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { db } from '../lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

interface CandidateProfile {
  id: string;
  name: string;
  role: string;
  atsScore: number;
  communicationScore: number;
  confidenceScore: number;
  presenceScore: number;
  alignmentRating: number;
  skills: string[];
  recommendation: string;
}

interface RecruiterDashboardProps {
  isDark: boolean;
  t: (key: string) => string;
}

export default function RecruiterDashboard({ isDark, t }: RecruiterDashboardProps) {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([
    {
      id: 'cand-1',
      name: 'Althea Vance',
      role: 'Senior Machine Learning Architect',
      atsScore: 98,
      communicationScore: 94,
      confidenceScore: 96,
      presenceScore: 92,
      alignmentRating: 95,
      skills: ['TensorFlow', 'LLM Fine-Tuning', 'Strategic Lead', 'Rust'],
      recommendation: "Strongly Recommended. Outstanding cognitive parsing and clean technical modularity under stress. Ideal candidate for the Principal Architect role."
    },
    {
      id: 'cand-2',
      name: 'Elijah Sterling',
      role: 'Generative AI Prompt Security Auditor',
      atsScore: 91,
      communicationScore: 89,
      confidenceScore: 84,
      presenceScore: 88,
      alignmentRating: 88,
      skills: ['Prompt Injections', 'OAuth Audits', 'Python', 'A/B Diagnostics'],
      recommendation: "Recommended with high technical merit. Recommending deep-dive HR behavioral assessment to evaluate response times during spontaneous high-risk scenarios."
    },
    {
      id: 'cand-3',
      name: 'Zoe Thorne',
      role: 'Senior Blockchain Infrastructure Specialist',
      atsScore: 85,
      communicationScore: 92,
      confidenceScore: 87,
      presenceScore: 90,
      alignmentRating: 86,
      skills: ['Solidity', 'Go Lang', 'Consensus Auditing', 'Zero-Knowledge'],
      recommendation: "Recommended. Exceptional peer-reviewed executive communication. Strong leadership foundation which offsets minor deviations from extreme core machine learning structures."
    },
    {
      id: 'cand-4',
      name: 'Marcus Sterling',
      role: 'Senior Machine Learning Architect',
      atsScore: 82,
      communicationScore: 85,
      confidenceScore: 90,
      presenceScore: 86,
      alignmentRating: 83,
      skills: ['NLP Pipelines', 'Flask', 'Sklearn', 'Distributed Training'],
      recommendation: "Evaluation scheduled. Candidate has robust traditional model deployment cycles. Recommending mock conversational coaching to bridge modern Transformer systems gaps."
    }
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [selectedCandidatesForCompare, setSelectedCandidatesForCompare] = useState<string[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'ranking' | 'comparison' | 'analytics' | 'recommendations'>('ranking');
  const [sortBy, setSortBy] = useState<'ats' | 'comm' | 'align'>('ats');

  // Filter candidates
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cand.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'All' || cand.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'ats') return b.atsScore - a.atsScore;
    if (sortBy === 'comm') return b.communicationScore - a.communicationScore;
    if (sortBy === 'align') return b.alignmentRating - a.alignmentRating;
    return 0;
  });

  const handleToggleCompare = (id: string) => {
    if (selectedCandidatesForCompare.includes(id)) {
      setSelectedCandidatesForCompare(prev => prev.filter(item => item !== id));
    } else {
      if (selectedCandidatesForCompare.length >= 2) {
        // limit to 2 for direct side-by-side comparison
        setSelectedCandidatesForCompare([selectedCandidatesForCompare[1], id]);
      } else {
        setSelectedCandidatesForCompare(prev => [...prev, id]);
      }
    }
  };

  // Compute stats for analytics
  const avgAts = Math.round(candidates.reduce((sum, c) => sum + c.atsScore, 0) / candidates.length);
  const avgComm = Math.round(candidates.reduce((sum, c) => sum + c.communicationScore, 0) / candidates.length);
  const avgConf = Math.round(candidates.reduce((sum, c) => sum + c.confidenceScore, 0) / candidates.length);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-400 py-1 px-2 rounded bg-indigo-500/5 border border-indigo-500/10">
            TALENT ACQUISITION SUITE
          </span>
          <h2 className="text-2xl font-heading font-bold text-white mt-1.5 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            {t('recruiterDashboard')}
          </h2>
          <p className="text-xs text-slate-400">Evaluate matched profiles, audit candidate communication index ratings, and process hiring selections with AI recommendations.</p>
        </div>
      </div>

      {/* FILTER BUTTONS & SYSTEM TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 dark:border-b dark:border-slate-800 pb-2">
        <div className="flex space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('ranking')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'ranking' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-450'
            }`}
          >
            Candidate Ranking
          </button>
          <button
            onClick={() => setActiveSubTab('comparison')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'comparison' 
                ? 'bg-indigo-600 text-white animate-pulse' 
                : 'bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-450'
            }`}
          >
            Resume Grid (Compare {selectedCandidatesForCompare.length} Selected)
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'analytics' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-450'
            }`}
          >
            Talent Analytics
          </button>
          <button
            onClick={() => setActiveSubTab('recommendations')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'recommendations' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-450'
            }`}
          >
            Hiring Advice
          </button>
        </div>

        {/* Global search & filter controls */}
        {activeSubTab === 'ranking' && (
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('searchFilters')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-1.5 rounded-lg border bg-slate-900 border-slate-800 text-xs focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 font-mono"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg bg-slate-900 border-slate-800 text-xs text-slate-350 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
            >
              <option value="All">All Jobs</option>
              <option value="Senior Machine Learning Architect">Senior ML Architect</option>
              <option value="Generative AI Prompt Security Auditor">AI Security Auditor</option>
              <option value="Senior Blockchain Infrastructure Specialist">Blockchain Specialist</option>
            </select>
          </div>
        )}
      </div>

      {/* CORE WORKSPACE SCREENS */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* SUBTAB 1: RANKING GRID */}
        {activeSubTab === 'ranking' && (
          <GlassCard isDark={isDark} className="border border-slate-800/60 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Columns className="h-4.5 w-4.5 text-indigo-400" />
                {t('candidateRanking')}
              </h3>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Rank By:</span>
                <button 
                  onClick={() => setSortBy('ats')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${sortBy === 'ats' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold' : ''}`}
                >
                  ATS Score
                </button>
                <button 
                  onClick={() => setSortBy('comm')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${sortBy === 'comm' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold' : ''}`}
                >
                  Speech Index
                </button>
                <button 
                  onClick={() => setSortBy('align')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${sortBy === 'align' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold' : ''}`}
                >
                  Hiring Fit
                </button>
              </div>
            </div>

            {sortedCandidates.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No candidates matched active search query or filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-widest text-[9px] pb-2 font-bold">
                      <th className="py-3 px-2">Compare</th>
                      <th className="py-3">Talent Profile</th>
                      <th className="py-3">Role Target</th>
                      <th className="py-3 text-center">ATS Match</th>
                      <th className="py-3 text-center">Speech Match</th>
                      <th className="py-3 text-center">Presence/Postures</th>
                      <th className="py-3 text-center">AI Fit Score</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCandidates.map((candidate, idx) => {
                      const isCompareSelected = selectedCandidatesForCompare.includes(candidate.id);
                      return (
                        <tr 
                          key={candidate.id}
                          className="border-b border-slate-900 hover:bg-slate-900/20 transition-all text-slate-350"
                        >
                          <td className="py-3 px-2">
                            <input
                              type="checkbox"
                              checked={isCompareSelected}
                              onChange={() => handleToggleCompare(candidate.id)}
                              className="accent-indigo-500 cursor-pointer h-3.5 w-3.5"
                            />
                          </td>
                          <td className="py-3 font-semibold text-white">
                            <span className="text-[10px] text-indigo-400 mr-1 pb-px pt-0.5 px-1 bg-indigo-500/5 rounded font-bold border border-indigo-550/15">
                              0{idx+1}
                            </span>
                            {candidate.name}
                          </td>
                          <td className="py-3 opacity-90">{candidate.role}</td>
                          <td className="py-3 text-center text-emerald-400 font-bold">{candidate.atsScore}%</td>
                          <td className="py-3 text-center text-cyan-400 font-bold">{candidate.communicationScore}%</td>
                          <td className="py-3 text-center text-purple-400 font-bold">{candidate.presenceScore}%</td>
                          <td className="py-3 text-center text-white font-bold bg-slate-900 rounded">{candidate.alignmentRating}%</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                handleToggleCompare(candidate.id);
                                setActiveSubTab('comparison');
                              }}
                              className="px-2.5 py-1 text-[10px] uppercase font-bold text-indigo-400 hover:text-white rounded bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-600 transition-colors cursor-pointer"
                            >
                              Direct Compare
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        )}

        {/* SUBTAB 2: RESUME REVIEWS SIDE-BY-SIDE COMPARE */}
        {activeSubTab === 'comparison' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-widest">
                <Columns className="h-4.5 w-4.5 text-indigo-400" />
                {t('resumeComparison')}
              </h3>

              {selectedCandidatesForCompare.length < 2 && (
                <span className="text-[10px] text-amber-400 bg-amber-500/5 py-1 px-2.5 rounded border border-amber-550/10 font-mono">
                  Select 2 candidates from Candidate Ranking tab for side-by-side diagnostics.
                </span>
              )}
            </div>

            {selectedCandidatesForCompare.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed dark:border-slate-803 dark:bg-slate-950/20 bg-slate-50 border-slate-200">
                <p className="text-xs text-slate-500 font-mono">
                  No profiles are selected for comparison. Switch to the <strong>Candidate Ranking</strong> grid, select the checkboxes beside any 2 profiles, and view them parsed side-by-side here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCandidatesForCompare.map(id => {
                  const cand = candidates.find(item => item.id === id);
                  if (!cand) return null;
                  return (
                    <GlassCard key={cand.id} isDark={isDark} className="border border-slate-800/60 p-6 relative">
                      <div className="flex justify-between items-start mb-4 border-b border-slate-900 pb-3">
                        <div>
                          <h4 className="text-base font-bold text-white mb-0.5">{cand.name}</h4>
                          <span className="text-[10px] font-mono font-medium text-indigo-300">{cand.role}</span>
                        </div>
                        <span className="text-xl font-bold text-indigo-400 font-heading bg-indigo-500/5 px-2.5 py-1 rounded">
                          Fit: {cand.alignmentRating}%
                        </span>
                      </div>

                      <div className="space-y-5 text-xs font-mono">
                        <div>
                          <strong className="text-white block uppercase tracking-wider text-[10px] text-slate-500 mb-1.5">Parsed Expertise Stack</strong>
                          <div className="flex flex-wrap gap-1.5">
                            {cand.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-0.5 bg-slate-900 text-slate-350 text-[10px] rounded border border-slate-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-[#07060f] border border-slate-900 text-center">
                            <span className="block text-[9px] text-slate-500">ATS Match</span>
                            <span className="text-sm font-bold text-emerald-400">{cand.atsScore}%</span>
                          </div>
                          <div className="p-3 rounded-lg bg-[#07060f] border border-slate-900 text-center">
                            <span className="block text-[9px] text-slate-500">Speech Index</span>
                            <span className="text-sm font-bold text-cyan-400">{cand.communicationScore}%</span>
                          </div>
                          <div className="p-3 rounded-lg bg-[#07060f] border border-slate-900 text-center">
                            <span className="block text-[9px] text-slate-500">Body Presence</span>
                            <span className="text-sm font-bold text-purple-400">{cand.presenceScore}%</span>
                          </div>
                        </div>

                        <div className="bg-[#05040a] p-4 rounded-xl border border-slate-850">
                          <span className="block text-[9px] text-slate-550 font-bold uppercase mb-1">Aurora AI Comparative Statement</span>
                          <p className="text-slate-300 text-xs italic leading-relaxed">
                            &ldquo;{cand.recommendation}&rdquo;
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleCompare(cand.id)}
                        className="mt-6 w-full text-center py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer hover:bg-red-500/20"
                      >
                        Remove from board
                      </button>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: CANDIDATE TALENT ANALYTICS */}
        {activeSubTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Widget A: Composite Average Metrics */}
            <GlassCard isDark={isDark} className="border border-slate-800/60 p-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
                Pipeline Performance Indicators
              </h4>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-400">Mean ATS Score</span>
                    <span className="text-white font-bold">{avgAts}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div style={{ width: `${avgAts}%` }} className="h-full bg-emerald-500" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-400">Mean Communication Index</span>
                    <span className="text-white font-bold">{avgComm}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div style={{ width: `${avgComm}%` }} className="h-full bg-cyan-400" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-400">Average Confidence Quotient</span>
                    <span className="text-white font-bold">{avgConf}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div style={{ width: `${avgConf}%` }} className="h-full bg-purple-500" />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Widget B: Skills Matrix Density */}
            <GlassCard isDark={isDark} className="border border-slate-800/60 p-6 md:col-span-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
                <Cpu className="h-4.5 w-4.5 text-cyan-400" />
                Inbound Capabilities Distribution
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-850 bg-[#070611] text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">AI / LLM Engineers</span>
                  <span className="text-xl font-bold font-heading text-white mt-1 block">50%</span>
                  <span className="text-[9px] text-emerald-400 font-mono mt-1 font-semibold block">Primary Stack</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-850 bg-[#070611] text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">Security / Auditing</span>
                  <span className="text-xl font-bold font-heading text-white mt-1 block">25%</span>
                  <span className="text-[9px] text-cyan-400 font-mono mt-1 font-semibold block">In Demand</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-850 bg-[#070611] text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">Go Lang / Rust</span>
                  <span className="text-xl font-bold font-heading text-white mt-1 block">33%</span>
                  <span className="text-[9px] text-purple-400 font-mono mt-1 font-semibold block">Syntactic Match</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-850 bg-[#070611] text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">Lead / Management</span>
                  <span className="text-xl font-bold font-heading text-white mt-1 block">40%</span>
                  <span className="text-[9px] text-indigo-400 font-mono mt-1 font-semibold block">Soft Skills Index</span>
                </div>
              </div>

              <div className="bg-[#05040a] rounded-xl border border-slate-850 p-4 mt-6">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1">Human Intelligence posture average</span>
                <p className="text-xs text-slate-350">
                  Across all evaluated applicants, <strong>Sitting Posture stability</strong> remains the highest metric at <strong>92%</strong> average, while <strong>Structured Hand Gestures usage</strong> requires development to reduce talking anxiety during high-tempo technical assessments.
                </p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* SUBTAB 4: HIRING ADVICE RECOMMENDATIONS */}
        {activeSubTab === 'recommendations' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-widest border-b border-slate-800 pb-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              {t('hiringRecommendations')}
            </h3>

            <div className="space-y-4">
              {candidates.map((cand) => (
                <div 
                  key={cand.id}
                  className="p-5 rounded-2xl border dark:bg-slate-950/40 dark:border-slate-850 bg-white border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-500/15 transition-all"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-550/10 font-bold">
                        Target: {cand.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-350 leading-relaxed font-mono">
                      {cand.recommendation}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1 font-mono justify-center flex-shrink-0">
                    <span className="text-[9px] text-slate-500">Overall Hiring Readiness</span>
                    <span className="text-base font-bold text-emerald-400">{cand.alignmentRating}% - Tier A</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
