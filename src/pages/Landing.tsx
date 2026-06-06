/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Terminal, 
  Code,
  FileCheck,
  TrendingUp,
  Cpu,
  Globe,
  Video,
  Mic,
  Route,
  Target,
  Shirt,
  Palette,
  HeartHandshake,
  BookOpen,
  Award,
  Activity,
  CheckCircle2,
  DollarSign,
  Send,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { ViewType } from '../types';

interface LandingProps {
  isDark: boolean;
  onNavigate: (view: ViewType) => void;
  onSelectRole?: (role: 'Candidate' | 'Recruiter' | 'Admin') => void;
}

export default function Landing({ isDark, onNavigate, onSelectRole }: LandingProps) {
  const [activeTab, setActiveTab] = useState<'candidate' | 'recruiter' | 'admin'>('candidate');
  const [demoActive, setDemoActive] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactEmail('');
      setContactMsg('');
    }, 3000);
  };

  // Demo cards content
  const demos = [
    {
      id: 'landing',
      title: 'Landing Page Hub',
      desc: 'High-speed public matching and career information architecture portal.',
      previewText: 'Ready to dispatch credentials? Instantly access the decentralized talent matching gateway.',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20'
    },
    {
      id: 'resume',
      title: 'Resume Scanner',
      desc: 'Automatic multi-profile ATS compliance calculations and metric reports.',
      previewText: 'Matching stats: Resume Score: 92%. Alignment: High. AI recommendation dispatched to Nebula Dynamics.',
      color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20'
    },
    {
      id: 'interview',
      title: 'AI Interview Room',
      desc: 'Synchronous real-time oral dialog questioning & automatic pacing score.',
      previewText: 'Active dialog tracking: "Explain how you manage database transaction concurrency in PostgreSQL." (Pace: 110 wpm, Confidence: 94%)',
      color: 'from-cyan-500/10 to-teal-500/10 border-cyan-500/20'
    },
    {
      id: 'coach',
      title: 'Communication Coach',
      desc: 'Pacing trainer, English word-emphasis analysis, and filler word counter.',
      previewText: 'Session logs: Filler "like" occurrences: 1 (Reduced by 80%). English clarity score: Excellent.',
      color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20'
    },
    {
      id: 'placement',
      title: 'Placement Dashboard',
      desc: 'Interactive candidate career track tracking with dynamic readiness index.',
      previewText: 'Unified Placement Readiness: 87/100 (Highly Recommended for Senior Tech Roles).',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20'
    },
    {
      id: 'recruiter',
      title: 'Recruiter Dashboard',
      desc: 'Examine inbound matches, select candidate pairs, and compare ratings.',
      previewText: 'Evaluating Althea Vance. AI Match Score: 98%. Recommendation: Highly Recommended.',
      color: 'from-rose-500/10 to-pink-500/10 border-rose-500/20'
    }
  ];

  return (
    <div id="landing-page" className="relative transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section id="hero-section" className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12 mt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Futuristic Badge */}
          <motion.div 
            variants={itemVariants}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide mb-6 border transition-all ${
              isDark 
                ? 'bg-purple-950/40 border-purple-800/40 text-purple-300' 
                : 'bg-purple-50 border-purple-200 text-purple-700'
            }`}
          >
            <Sparkles className="h-3 w-3 text-purple-500 animate-pulse" />
            <span>Introducing Qyronix v1.0 • Nebula AI Interface</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className={`font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            The Autonomous
            <span className="block mt-1 bg-gradient-to-r from-aurora-blue via-aurora-purple to-cyan-400 bg-clip-text text-transparent pb-1">
              Aurora AI Recruiting
            </span>
            Identity Platform
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className={`text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed transition-colors ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Seamlessly coordinate candidates, match recruitment analytics, and oversee identity profiles autonomously. Armed with fortified Firestore security constraints and immersive aurora ambient backdrops.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              id="landing-signup-cta"
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all text-white bg-gradient-to-r from-aurora-blue to-aurora-purple hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="landing-login-cta"
              onClick={() => onNavigate('login')}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium border active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isDark 
                  ? 'border-slate-800 bg-slate-950/20 text-slate-300 hover:bg-slate-900/60' 
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Sign In to Portal
            </button>
          </motion.div>
        </motion.div>

        {/* ROLE INTERACTIVE SANDBOX */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-5xl mb-12"
        >
          <div className="text-center mb-6">
            <h2 className={`font-heading text-2xl sm:text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              One Unified Interface, Three Tailored Roles
            </h2>
            <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Choose an access viewpoint to customize the Qyronix portal setup
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center p-1 rounded-xl border max-w-sm mx-auto mb-6 bg-slate-900/10 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850">
            {(['candidate', 'recruiter', 'admin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (onSelectRole) {
                    const roleLabel = tab === 'candidate' ? 'Candidate' : tab === 'recruiter' ? 'Recruiter' : 'Admin';
                    onSelectRole(roleLabel);
                  }
                }}
                className={`flex-1 py-2 px-3.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'shadow text-white bg-gradient-to-r from-aurora-blue/80 to-aurora-purple/80 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-amber-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Interactive Bento Card displaying features */}
          <GlassCard isDark={isDark} className="relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8">
            {activeTab === 'candidate' && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white bg-aurora-blue mb-4">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                  <h3 className={`text-xl font-heading font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Launch Your Career Orbit
                  </h3>
                  <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Candidates register credentials, fill smart profiles, upload materials directly, and track live job placements. The automated agent analyzes profile parameters to draft custom applications.
                  </p>
                  <ul className={`space-y-2 text-xs mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <li className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-cyan-400" /> Professional-grade digital portfolios
                    </li>
                    <li className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-violet-400" /> Automated AI matching parameters
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Verified email authentication seals
                    </li>
                  </ul>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-aurora-blue hover:bg-aurora-blue/90 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Register as Candidate
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className={`relative rounded-xl border p-5 font-mono text-xs ${isDark ? 'bg-slate-950/60 border-slate-800/70 text-cyan-400' : 'bg-slate-50 border-slate-200 text-indigo-705'}`}>
                  <div className="flex gap-1.5 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <p className="text-slate-500">// Candidate Profile State</p>
                  <pre className={`mt-2 leading-relaxed overflow-x-auto text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-750'}`}>
{`{
  id: "cand_93jf82",
  name: "Althea Vance",
  status: "active",
  verified: true,
  matches: [
    { title: "Senior ML Engineer", score: 98 }
  ]
}`}
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === 'recruiter' && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white bg-aurora-purple mb-4">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <h3 className={`text-xl font-heading font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Command Talent Intelligence
                  </h3>
                  <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Recruiters curate listings, manage inbound candidacies, compile analytics, and make secure feedback entries. Protect your internal candidate evaluation lists from data harvesting.
                  </p>
                  <ul className={`space-y-2 text-xs mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <li className="flex items-center gap-2">
                      <FileCheck className="h-3.5 w-3.5 text-cyan-400" /> Intelligent pipeline visualization
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-purple-400" /> Analytics charting suite
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> Dynamic recruiter verification tags
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      if (onSelectRole) onSelectRole('Recruiter');
                      onNavigate('signup');
                    }}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-aurora-purple hover:bg-aurora-purple/90 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Register as Recruiter
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className={`relative rounded-xl border p-5 font-mono text-xs ${isDark ? 'bg-slate-950/60 border-slate-800/70 text-cyan-400' : 'bg-slate-50 border-slate-200 text-indigo-750'}`}>
                  <div className="flex gap-1.5 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <p className="text-slate-500">// Recruiter Dashboard Stats</p>
                  <pre className={`mt-2 leading-relaxed overflow-x-auto text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-755'}`}>
{`{
  activeListings: 12,
  applicantsReceived: 412,
  aiMatchedScoreThreshold: ">=85",
  pipelineConversion: "24.5%"
}`}
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white bg-indigo-650 mb-4">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <h3 className={`text-xl font-heading font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Oversee Decentralized Systems
                  </h3>
                  <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Administrators govern users, inspect system operations, and audit user logs. Full read-modify access over Firestore telemetry registers with zero self-escalation updates allowed to clients.
                  </p>
                  <ul className={`space-y-2 text-xs mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <li className="flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-emerald-400" /> Real-time activity console
                    </li>
                    <li className="flex items-center gap-2">
                      <Code className="h-3.5 w-3.5 text-blue-400" /> Strict rule schema validation audit
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      if (onSelectRole) onSelectRole('Admin');
                      onNavigate('signup');
                    }}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Register as Admin
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className={`relative rounded-xl border p-5 font-mono text-xs ${isDark ? 'bg-slate-950/60 border-slate-800/70 text-cyan-400' : 'bg-slate-50 border-slate-200 text-indigo-750'}`}>
                  <div className="flex gap-1.5 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <p className="text-slate-500">// Firestore Verification Engine</p>
                  <pre className={`mt-2 leading-relaxed overflow-x-auto text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-755'}`}>
{`match /users/{userId} {
  allow create: if isSignedIn();
  allow update: if isOwner(userId) 
    && request.resource.data.role == resource.data.role;
}`}
                  </pre>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </section>

      {/* 2. PROBLEM STATEMENT */}
      <section id="problem-section" className={`py-16 border-t border-b ${isDark ? 'bg-slate-950/40 border-slate-900/60' : 'bg-slate-50/50 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">The Modern Recruiting Dilemma</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Traditional hiring and assessment is fundamentally broken for both sides.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950/20 border-slate-800/80' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1.5 text-white dark:text-white light:text-slate-800">Somatic & Non-Verbal Blindspots</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-450 leading-relaxed">
                    93% of communication occurs through gestures, postures, and vocal pacing. Yet, standard resume scanners entirely ignore candidate presence, grooming alignment, and presentation fluency under cognitive pressure.
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950/20 border-slate-800/80' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1.5 text-white dark:text-white light:text-slate-800">Keyword Padding & ATS Fatigue</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-455 leading-relaxed">
                    Hiring algorithms filter candidacies based purely on typed keyword frequency, rendering resumes superficial. True capability is lost in arbitrary compliance checks, leaving recruiters with unverified lists of credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SOLUTION */}
      <section id="solution-section" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-4">Our Solution: Multi-Modal Career Intelligence</h2>
        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
          Qyronix delivers an autonomous matching framework that coordinates professional resumes with oral interviews, non-verbal indicators, and interactive coaching. Structured secure data ensures privacy constraints are strictly respected.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 border dark:bg-slate-950/20 dark:border-slate-850 rounded-2xl text-left">
            <div className="h-10 w-10 text-cyan-400 bg-cyan-400/10 rounded-xl flex items-center justify-center mb-4 font-bold">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Automated Skill Verification</h3>
            <p className="text-xs text-slate-400 dark:text-slate-450 leading-relaxed">
              We translate standard resume documents into certified skill telemetry profiles using state-of-the-art multi-intent analysis.
            </p>
          </div>

          <div className="p-5 border dark:bg-slate-950/20 dark:border-slate-850 rounded-2xl text-left">
            <div className="h-10 w-10 text-purple-400 bg-purple-400/10 rounded-xl flex items-center justify-center mb-4 font-bold">
              <Video className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Human Expression Metrics</h3>
            <p className="text-xs text-slate-400 dark:text-slate-450 leading-relaxed">
              Analyze non-verbal feedback loops like posture, filler words, and color psychology to elevate candidate confidence values.
            </p>
          </div>

          <div className="p-5 border dark:bg-slate-950/20 dark:border-slate-850 rounded-2xl text-left">
            <div className="h-10 w-10 text-blue-400 bg-blue-400/10 rounded-xl flex items-center justify-center mb-4 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Fortified Data Vaults</h3>
            <p className="text-xs text-slate-400 dark:text-slate-450 leading-relaxed">
              All credentials and ratings are encrypted inside Firestore using strict Attribute-Based Access Control security parameters.
            </p>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES */}
      <section id="key-features" className={`py-16 border-t border-b ${isDark ? 'bg-slate-950/40 border-slate-900/60' : 'bg-slate-50/50 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Standard Core Features</h2>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-2">The core utilities designed to verify and optimize recruiting operations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'}`}>
              <FileCheck className="h-8 w-8 text-cyan-400 mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-1">AI Resume Scanner</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Extract ATS compatibility parity stats from text files instantly.</p>
            </div>

            <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Cpu className="h-8 w-8 text-purple-400 mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-1">AI Interview System</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Conduct structured oral conversations via our customized speech agent.</p>
            </div>

            <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Video className="h-8 w-8 text-violet-400 mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-1">Body Language</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Evaluate non-verbal communication gestures during online sessions.</p>
            </div>

            <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Mic className="h-8 w-8 text-emerald-400 mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-1">Communication Coach</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Interactive monitoring of filler terms and overall technical pacing.</p>
            </div>

            <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Target className="h-8 w-8 text-blue-400 mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-1">Placement Readiness</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Verify unified competency matrices to track placement chances.</p>
            </div>

            <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Sparkles className="h-8 w-8 text-amber-400 mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-1">Voice AI Assistant</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Oral navigation console which interprets technical query keywords.</p>
            </div>

            <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Route className="h-8 w-8 text-rose-400 mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-1">AI Career Twin</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Holographic representation displaying actual mock feedback velocities.</p>
            </div>

            <div className={`p-4 border rounded-xl ${isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Globe className="h-8 w-8 text-teal-400 mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-1">Multilingual Console</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Fully localizable framework translating feedback on the fly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TECHNOLOGY STACK */}
      <section id="stack-section" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fadeIn">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">Engineered on Robust Pillars</h2>
        <p className="text-xs text-slate-400 text-center max-w-xl mx-auto mb-12">The unified tech stack powering deterministic system integrity and secure profile checks.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/40 rounded-xl space-y-1">
            <span className="text-xs font-mono text-cyan-400 block font-bold">FRONTEND LAYER</span>
            <span className="text-white text-sm font-semibold block">React 19 & Vite</span>
            <span className="text-[10px] text-slate-500 block">High performance rendering SPA structure</span>
          </div>

          <div className={`p-4 border dark:border-slate-850 dark:bg-slate-950/40 rounded-xl space-y-1`}>
            <span className="text-xs font-mono text-purple-400 block font-bold">BACKEND & COMMS</span>
            <span className="text-white text-sm font-semibold block">Express & Node.js</span>
            <span className="text-[10px] text-slate-500 block">Port 3000 local request forwarding routing</span>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/40 rounded-xl space-y-1">
            <span className="text-xs font-mono text-emerald-400 block font-bold">DATABASE VAULT</span>
            <span className="text-white text-sm font-semibold block">Google Firestore</span>
            <span className="text-[10px] text-slate-500 block">Realtime synchronization ABAC rules controls</span>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/40 rounded-xl space-y-1">
            <span className="text-xs font-mono text-blue-400 block font-bold">INTELLIGENT REASONING</span>
            <span className="text-white text-sm font-semibold block">Google GenAI SDK</span>
            <span className="text-[10px] text-slate-500 block">Modern @google/genai structured query response</span>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className={`py-16 border-t border-b ${isDark ? 'bg-slate-950/40 border-slate-900/60' : 'bg-slate-50/50 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">The Recruitment Sequence</h2>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-2">A step-by-step roadmap demonstrating how we coordinate profiles to secure verified placements.</p>
          </div>

          <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
            
            <div className="flex gap-4 relative">
              <div className="h-12 w-12 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center font-bold text-cyan-400 text-sm z-10 shrink-0">1</div>
              <div className="space-y-1 mt-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 font-mono">STEP 01 — DEPLOYING CREDENTIALS</span>
                <h4 className="text-base font-semibold text-white">Resume Analysis</h4>
                <p className="text-xs text-slate-400">Candidate uploads text or digital PDF resumes. The scanner parses certifications under verified constraints.</p>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="h-12 w-12 rounded-full bg-slate-950 border-2 border-purple-400 flex items-center justify-center font-bold text-purple-400 text-sm z-10 shrink-0">2</div>
              <div className="space-y-1 mt-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 font-mono">STEP 02 — ACTIVE QUESTIONING</span>
                <h4 className="text-base font-semibold text-white">AI Interview Room</h4>
                <p className="text-xs text-slate-400">Autonomous audio questioning queries technical knowledge and measures live speech metrics to prevent keyword cheating.</p>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="h-12 w-12 rounded-full bg-slate-950 border-2 border-violet-400 flex items-center justify-center font-bold text-violet-400 text-sm z-10 shrink-0">3</div>
              <div className="space-y-1 mt-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 font-mono">STEP 03 — METADATA CAPTURE</span>
                <h4 className="text-base font-semibold text-white">Human Intelligence Analysis</h4>
                <p className="text-xs text-slate-400">The platform evaluates physical demeanor, non-verbal colors, and clothing alignment during response intervals.</p>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="h-12 w-12 rounded-full bg-slate-950 border-2 border-blue-400 flex items-center justify-center font-bold text-blue-400 text-sm z-10 shrink-0">4</div>
              <div className="space-y-1 mt-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 font-mono">STEP 04 — PERSONALIZED ROADMAP</span>
                <h4 className="text-base font-semibold text-white">Career Roadmap</h4>
                <p className="text-xs text-slate-405">Generate a detailed, actionable career path, skill checklists, and mock instructions targeting areas that need enhancement.</p>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="h-12 w-12 rounded-full bg-slate-950 border-2 border-rose-400 flex items-center justify-center font-bold text-rose-400 text-sm z-10 shrink-0">5</div>
              <div className="space-y-1 mt-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 font-mono">STEP 05 — SECURE DISTRIBUTION</span>
                <h4 className="text-base font-semibold text-white">Recruiter Evaluation</h4>
                <p className="text-xs text-slate-400">Send encrypted assessment reports to verified partner recruiters, placing the candidate in premium hiring loops.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. UNIQUE FEATURES */}
      <section id="unique-features" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">Immersive Premium Features</h2>
          <p className="text-xs text-slate-450">What makes Qyronix the ultimate, futuristic recruitment lab globally.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-xl space-y-2">
            <Video className="h-6 w-6 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Body Language Intelligence</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Continuous posture check algorithms measuring communication confidence in live frames.</p>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-xl space-y-2">
            <Activity className="h-6 w-6 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Gesture Training</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Interactive tutorials providing visual feedback to refine expressive movements.</p>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-xl space-y-2">
            <Shirt className="h-6 w-6 text-violet-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dress Intelligence AI</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Automatic physical grooming and structural clothing evaluation for peak interview presentation.</p>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-xl space-y-2">
            <Palette className="h-6 w-6 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Color Psychology Engine</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Recommends background tones and wardrobe color options to optimize psychological impact.</p>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-xl space-y-2">
            <Mic className="h-6 w-6 text-blue-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">English Communication Coach</h4>
            <p className="text-[10.5px] text-slate-405 leading-relaxed">Tone pacing controls and syntax metrics targeting professional fluency.</p>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-xl space-y-2">
            <Target className="h-6 w-6 text-pink-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Placement Readiness Score</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Unified index dynamically calculated from resume, interview, and somatic metrics.</p>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-xl space-y-2">
            <Cpu className="h-6 w-6 text-rose-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Career Twin</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Simulated database twin that automatically test-runs job matches globally.</p>
          </div>

          <div className="p-4 border dark:border-slate-850 dark:bg-slate-950/20 rounded-xl space-y-2">
            <HeartHandshake className="h-6 w-6 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Expert Mentorship</h4>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">Connects candidates with human experts for mock interview review loops.</p>
          </div>
        </div>
      </section>

      {/* 8. SCREENSHOTS / PRODUCT DEMO */}
      <section id="demo-section" className={`py-16 border-t border-b ${isDark ? 'bg-slate-950/40 border-slate-900/60' : 'bg-slate-50/50 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Interactive Product Showcase</h2>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-2">Click any module card below to pop up its live operational simulation console.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {demos.map((d) => (
              <button
                key={d.id}
                onClick={() => setDemoActive(d.id === demoActive ? null : d.id)}
                className={`p-6 border rounded-2xl text-left bg-gradient-to-br hover:-translate-y-1 hover:shadow-lg transition-all focus:outline-none cursor-pointer flex flex-col justify-between h-[180px] ${d.color} ${
                  demoActive === d.id ? 'ring-2 ring-cyan-400 scale-[1.01]' : ''
                }`}
              >
                <div>
                  <h4 className="font-heading text-base font-bold text-white mb-1.5">{d.title}</h4>
                  <p className="text-xs text-slate-350 leading-relaxed line-clamp-3">{d.desc}</p>
                </div>
                <div className="text-[10.5px] font-mono text-cyan-400 font-bold flex items-center gap-1 mt-3">
                  {demoActive === d.id ? 'Operational Module Running' : 'Activate Operational Console'} 
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            ))}
          </div>

          {/* Operational Output Screen */}
          <AnimatePresence>
            {demoActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-8 p-5 border rounded-2xl bg-black/90 font-mono text-xs text-[#22c55e] border-slate-800 leading-relaxed relative overflow-hidden`}
              >
                <div className="flex gap-1.5 mb-3.5 border-b border-slate-800 pb-2.5 justify-between items-center">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] text-slate-550 select-none uppercase tracking-widest">Qyronix Kernel Interface v1.0</span>
                </div>
                
                <p className="font-semibold text-white">&gt; boot-service --evaluate-module --id={demoActive}</p>
                <p className="mt-1 text-slate-400">// Streaming live telemetry simulations from Memory Bus:</p>
                <p className="mt-3.5 bg-slate-900/40 p-3.5 border border-slate-800/40 rounded-xl leading-normal text-slate-100 italic">
                  &quot;{demos.find(d => d.id === demoActive)?.previewText}&quot;
                </p>
                <p className="mt-4 text-slate-500">// System evaluation completes under 12ms. Secure. zero leak index.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 9. FUTURE SCOPE */}
      <section id="future-section" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">Nebula Vision: Future Orbits</h2>
          <p className="text-xs text-slate-450 leading-relaxed">The roadmap mapping what our AI developers are planning to coordinate in future updates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="p-5 border dark:border-slate-850 dark:bg-slate-950/20 rounded-2xl relative overflow-hidden group">
            <span className="absolute top-2 right-4 text-xs font-mono text-slate-700 font-bold">RELEASE v2.0</span>
            <div className="h-8 w-8 text-purple-400 bg-purple-400/10 rounded-lg flex items-center justify-center font-bold mb-3">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-sm font-semibold mb-1 text-white">Multi-Agent Corporate Orchestration</h4>
            <p className="text-xs text-slate-400 leading-normal">Deploy networks of autonomous agents that automatically draft custom technical take-homes, evaluate compliance, and coordinate final schedule times without human delay.</p>
          </div>

          <div className="p-5 border dark:border-slate-850 dark:bg-slate-950/20 rounded-2xl relative overflow-hidden group">
            <span className="absolute top-2 right-4 text-xs font-mono text-slate-700 font-bold">RELEASE v2.3</span>
            <div className="h-8 w-8 text-cyan-400 bg-cyan-400/10 rounded-lg flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-sm font-semibold mb-1 text-white">Decentralized Credentials Verification</h4>
            <p className="text-xs text-slate-400 leading-normal">Incorporate cryptographic certification hashes, storing candidate scores and badges on-chain so that fraud is cryptographically impossible.</p>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section id="testimonials-section" className={`py-16 border-t border-b ${isDark ? 'bg-slate-950/40 border-slate-900/60' : 'bg-slate-50/50 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Verified Operations Statistics</h2>
            <p className="text-xs text-slate-505 mt-2">Hear from early candidates and tech recruiters on their performance gains.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-900/15 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex gap-1 text-yellow-405 mb-3 text-lg">★★★★★</div>
              <p className="text-xs text-slate-350 dark:text-slate-400 italic leading-relaxed mb-4">
                &quot;The body language coach completely transformed how I present. My filler words decreased by 90% and I secured a Chief ML role in under 6 days!&quot;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-cyan-400/10 flex items-center justify-center text-xs font-bold text-cyan-400">AV</div>
                <div>
                  <h5 className="text-[11px] font-bold text-white">Althea Vance</h5>
                  <p className="text-[9px] text-slate-500">Candidate (Now Lead ML Architect)</p>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-900/15 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex gap-1 text-yellow-405 mb-3 text-lg">★★★★★</div>
              <p className="text-xs text-slate-350 dark:text-slate-400 italic leading-relaxed mb-4">
                &quot;The placement scores helped us hire senior system builders directly without conducting manual early screening loops. The efficiency gains are stellar.&quot;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-purple-400/10 flex items-center justify-center text-xs font-bold text-purple-400">MB</div>
                <div>
                  <h5 className="text-[11px] font-bold text-white">Marcus Brody</h5>
                  <p className="text-[9px] text-slate-500">Recruiter, Nebula Dynamics</p>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-900/15 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex gap-1 text-yellow-405 mb-3 text-lg">★★★★★</div>
              <p className="text-xs text-slate-350 dark:text-slate-400 italic leading-relaxed mb-4">
                &quot;Deploying administrative checks and tracking system integrity under ABAC is remarkably visual. Beautiful design system in dark mode.&quot;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-slate-500/10 flex items-center justify-center text-xs font-bold font-heading">AM</div>
                <div>
                  <h5 className="text-[11px] font-bold text-white">Admin Mainframe</h5>
                  <p className="text-[9px] text-slate-500">Systems Overseer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. PRICING */}
      <section id="pricing-section" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">Simple Operational Tiers</h2>
        <p className="text-xs text-slate-450 tracking-wide mb-12">No hidden billing codes. Cancel your subscription anytime instantly.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 border dark:border-slate-850 dark:bg-slate-950/20 rounded-2xl flex flex-col justify-between text-left">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">CANDIDATE BASIC</span>
              <div className="flex items-baseline gap-1 mt-2.5 mb-4">
                <span className="text-3xl font-bold font-heading text-white">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">Perfect for job applicants looking to run basic compliance checks on their resumes.</p>
              <ul className="space-y-2.5 text-xs text-slate-350 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> ATS compatibility scanning</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Local application dispatching</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Basic communications overview</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('signup')}
              className="w-full py-2.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-750 text-white text-center cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          <div className="p-6 border-2 border-cyan-400 dark:bg-slate-950/40 rounded-2xl flex flex-col justify-between text-left relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold bg-cyan-400 text-slate-950 px-2.5 py-1 rounded-full">MOST POPULAR OPTION</span>
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">CANDIDATE ELITE</span>
              <div className="flex items-baseline gap-1 mt-2.5 mb-4">
                <span className="text-3xl font-bold font-heading text-white">$19</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">For elite job seekers requiring body language guidance, pacing coaching, and career holograms.</p>
              <ul className="space-y-2.5 text-xs text-slate-350 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Everything in Free, plus:</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Unlimited Speech Interviews</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Dress & Gesture AI Evaluation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Synchronized Career Twin</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('signup')}
              className="w-full py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-aurora-blue to-aurora-purple text-white text-center hover:brightness-110 cursor-pointer"
            >
              Subscribe Today
            </button>
          </div>

          <div className="p-6 border dark:border-slate-850 dark:bg-slate-950/20 rounded-2xl flex flex-col justify-between text-left">
            <div>
              <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-widest">RECRUITER QUANTUM PRO</span>
              <div className="flex items-baseline gap-1 mt-2.5 mb-4">
                <span className="text-3xl font-bold font-heading text-white">$149</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">Designed for professional talent search organizations seeking to audit expression scores.</p>
              <ul className="space-y-2.5 text-xs text-slate-350 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Unified Recruiter Workspace</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Match Evaluation Scores</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Candidate Pair Comparison Grid</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Encrypted ABAC Files Dispatch</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('signup')}
              className="w-full py-2.5 text-xs font-bold rounded-lg bg-[#2E1065] hover:bg-[#3B0764] text-white text-center cursor-pointer"
            >
              Deploy Recruiter Node
            </button>
          </div>

        </div>
      </section>

      {/* 12. CONTACT */}
      <section id="contact-section" className={`py-16 border-t ${isDark ? 'bg-slate-950/60 border-slate-900/60' : 'bg-slate-100/40 border-slate-200'}`}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mb-2">Connect with our Dev Office</h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mb-8 leading-relaxed">Have custom questions about our Attribute-Based Access Controls or speech modeling APIs? Shoot us a transaction dispatch below.</p>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                id="contact-email"
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.email@qyronix.io"
                className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                  isDark ? 'bg-slate-900/40 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <button
                id="contact-submit"
                type="submit"
                className="px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-aurora-blue to-aurora-purple rounded-xl hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Send Transaction
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
              placeholder="Detail your request or integration inquiry here..."
              className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                isDark ? 'bg-slate-900/40 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </form>

          {/* Contact Alert dialog feedback */}
          <AnimatePresence>
            {contactSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 rounded-xl text-xs bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-center font-mono font-bold"
              >
                ✓ Transaction synchronized! Your integration inquiry has been appended to memory queues. Our system agents will reach out.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer id="footer-section" className={`py-12 border-t text-center ${isDark ? 'bg-[#03020A] border-slate-900/80 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-left">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-aurora-blue to-aurora-purple p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-md flex items-center justify-center text-white">
                <Briefcase className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-white dark:text-white block font-heading">Qyronix Labs</span>
              <span className="text-[10px] text-slate-500 block font-mono">Autonomous Enterprise Recruitment Interfaces</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono">
            <button onClick={() => handleContactSubmit({ preventDefault: () => {} } as any)} className="hover:text-white transition-colors cursor-pointer">Security Protocol</button>
            <button onClick={() => handleContactSubmit({ preventDefault: () => {} } as any)} className="hover:text-white transition-colors cursor-pointer">Firestore Rules</button>
            <button onClick={() => handleContactSubmit({ preventDefault: () => {} } as any)} className="hover:text-white transition-colors cursor-pointer">API Keys Settings</button>
            <button onClick={() => handleContactSubmit({ preventDefault: () => {} } as any)} className="hover:text-white transition-colors cursor-pointer">Terms of Operation</button>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono mt-8 uppercase tracking-widest">
          &copy; 2026 Qyronix Inc. Protected by deterministic ABAC database bounds. All systems secure.
        </div>
      </footer>

    </div>
  );
}
