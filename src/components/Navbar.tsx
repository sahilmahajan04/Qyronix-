/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles, 
  Key, 
  Globe, 
  Cpu, 
  UserCheck, 
  FileCheck, 
  Video, 
  Mic, 
  Route, 
  Target, 
  Shirt, 
  Palette, 
  HeartHandshake, 
  TrendingUp, 
  Share2, 
  Clipboard, 
  BarChart4
} from 'lucide-react';
import { ViewType } from '../types';

interface NavbarProps {
  isDark: boolean;
  onNavigate: (view: ViewType) => void;
  onSelectRole?: (role: 'Candidate' | 'Recruiter' | 'Admin') => void;
  onFeatureSelect?: (featureId: string) => void;
}

export default function Navbar({ isDark, onNavigate, onSelectRole, onFeatureSelect }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'features' | 'works' | 'intel' | 'recruiters' | null>(null);

  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    onNavigate('landing');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDropdownItemClick = (featureId: string, sectionId: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (onFeatureSelect) {
      onFeatureSelect(featureId);
    }
    handleScrollTo(sectionId);
  };

  const features = [
    { name: 'AI Resume Scanner', id: 'resume-scanner', icon: FileCheck, desc: 'Calculate ATS match parity metrics instantly.' },
    { name: 'AI Interview System', id: 'interview-system', icon: Cpu, desc: 'Real-time structured conversational agent.' },
    { name: 'Body Language Analysis', id: 'body-language', icon: Video, desc: 'Extract somatic feedback & gesture metrics.' },
    { name: 'Communication Coach', id: 'communication-coach', icon: Mic, desc: 'Elevate tone, posture, & English fluency.' },
    { name: 'Placement Readiness', id: 'placement-readiness', icon: Target, desc: 'Verify hiring status with live scoring.' },
    { name: 'Voice AI Assistant', id: 'voice-assistant', icon: Sparkles, desc: 'Voice-directed navigation and queries.' },
    { name: 'AI Career Twin', id: 'career-twin', icon: Route, desc: 'Your digital double predicting career orbits.' },
    { name: 'Multilingual Support', id: 'multilingual', icon: Globe, desc: 'Seamless localization spanning multiple languages.' }
  ];

  const works = [
    { name: 'Resume Analysis', id: 'work-resume', icon: FileCheck, desc: 'Parsing credentials under strict ABAC filters.' },
    { name: 'AI Interview', id: 'work-interview', icon: Cpu, desc: 'Interactive simulation testing system skills.' },
    { name: 'Human Intelligence Analysis', id: 'work-human', icon: Video, desc: 'Analyzing gestures and confidence intervals.' },
    { name: 'Career Roadmap', id: 'work-roadmap', icon: Route, desc: 'Mapping growth steps based on evaluation data.' },
    { name: 'Recruiter Evaluation', id: 'work-recruiter', icon: UserCheck, desc: 'Delivering pipeline matching files safely.' }
  ];

  const intelligence = [
    { name: 'Communication Coach', id: 'intel-coach', icon: Mic, desc: 'Pace, pitch, and keyword training.' },
    { name: 'Dress Intelligence', id: 'intel-dress', icon: Shirt, desc: 'Visual grooming & structural outfit alignment.' },
    { name: 'Color Psychology', id: 'intel-color', icon: Palette, desc: 'Evaluate dress colors on positive vibes.' },
    { name: 'Confidence Builder', id: 'intel-confidence', icon: Sparkles, desc: 'Interactive psychological calibration.' },
    { name: 'Career Roadmap', id: 'intel-roadmap', icon: Route, desc: 'Structured progress pipelines.' },
    { name: 'Placement Readiness', id: 'intel-readiness', icon: Target, desc: 'Unified candidate evaluation scoring.' },
    { name: 'Career Twin', id: 'intel-twin', icon: Cpu, desc: 'Holographic synchronized credentials.' }
  ];

  const recruiters = [
    { name: 'Candidate Analytics', id: 'rec-analytics', icon: BarChart4, desc: 'Examine macro hiring streams.' },
    { name: 'Resume Comparison', id: 'rec-compare', icon: Share2, desc: 'Examine candidate pairs on unified scores.' },
    { name: 'AI Hiring Reports', id: 'rec-reports', icon: Clipboard, desc: 'Export summary evaluations.' },
    { name: 'Candidate Ranking', id: 'rec-ranking', icon: TrendingUp, desc: 'Determine optimized candidate matches.' },
    { name: 'Human Intelligence Reports', id: 'rec-human-logs', icon: Video, desc: 'Audit non-verbal communication results.' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b backdrop-blur-md ${
      isDark 
        ? 'bg-[#03020A]/85 border-slate-900/80 text-white' 
        : 'bg-white/85 border-slate-200/60 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Name block */}
          <button 
            onClick={() => handleScrollTo('hero-section')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-aurora-blue via-aurora-purple to-cyan-400 p-0.5 shadow-lg group-hover:rotate-6 transition-all duration-300 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-lg flex items-center justify-center">
                <Briefcase className="h-4.5 w-4.5 text-cyan-400" />
              </div>
            </div>
            <span className={`text-xl font-heading font-bold tracking-tight bg-gradient-to-r from-white via-cyan-300 to-indigo-300 bg-clip-text text-transparent group-hover:brightness-110 transition-all ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Qyronix
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button 
              onClick={() => handleScrollTo('hero-section')}
              className="px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
            >
              Home
            </button>

            {/* FEATURES DROPDOWN */}
            <div className="relative">
              <button 
                onMouseEnter={() => setActiveDropdown('features')}
                onClick={() => setActiveDropdown(activeDropdown === 'features' ? null : 'features')}
                className={`px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-all cursor-pointer flex items-center gap-1 ${
                  activeDropdown === 'features' ? 'text-cyan-400 bg-slate-900/40' : ''
                }`}
              >
                Features <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'features' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={`absolute left-1/2 -translate-x-1/2 mt-2 w-[480px] rounded-2xl border p-4 shadow-2xl grid grid-cols-2 gap-2 z-50 ${
                      isDark ? 'bg-[#05040d]/95 border-slate-800/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    {features.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id, 'key-features')}
                        className={`flex gap-3 p-2.5 rounded-xl text-left transition-all ${
                          isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="h-4.5 w-4.5 text-cyan-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white dark:text-white dark:hover:text-cyan-300 light:text-slate-850">{item.name}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* HOW IT WORKS DROPDOWN */}
            <div className="relative">
              <button 
                onMouseEnter={() => setActiveDropdown('works')}
                onClick={() => setActiveDropdown(activeDropdown === 'works' ? null : 'works')}
                className={`px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-all cursor-pointer flex items-center gap-1 ${
                  activeDropdown === 'works' ? 'text-cyan-400 bg-slate-900/40' : ''
                }`}
              >
                How It Works <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'works' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={`absolute left-1/2 -translate-x-1/2 mt-2 w-[280px] rounded-2xl border p-3 shadow-2xl flex flex-col gap-1 z-50 ${
                      isDark ? 'bg-[#05040d]/95 border-slate-800/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    {works.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id, 'how-it-works')}
                        className={`flex gap-2.5 p-2 rounded-lg text-left transition-all ${
                          isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white dark:text-white">{item.name}</div>
                          <div className="text-[9px] text-slate-500 line-clamp-1">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CAREER INTELLIGENCE DROPDOWN */}
            <div className="relative">
              <button 
                onMouseEnter={() => setActiveDropdown('intel')}
                onClick={() => setActiveDropdown(activeDropdown === 'intel' ? null : 'intel')}
                className={`px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-all cursor-pointer flex items-center gap-1 ${
                  activeDropdown === 'intel' ? 'text-cyan-400 bg-slate-900/40' : ''
                }`}
              >
                Career Intelligence <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'intel' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={`absolute left-1/2 -translate-x-1/2 mt-2 w-[340px] rounded-2xl border p-3 shadow-2xl flex flex-col gap-1 z-50 ${
                      isDark ? 'bg-[#05040d]/95 border-slate-800/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    {intelligence.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item.id, 'unique-features')}
                        className={`flex gap-2.5 p-2 rounded-lg text-left transition-all ${
                          isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white dark:text-white">{item.name}</div>
                          <div className="text-[9px] text-slate-500 line-clamp-1">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FOR RECRUITERS DROPDOWN */}
            <div className="relative">
              <button 
                onMouseEnter={() => setActiveDropdown('recruiters')}
                onClick={() => setActiveDropdown(activeDropdown === 'recruiters' ? null : 'recruiters')}
                className={`px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-all cursor-pointer flex items-center gap-1 ${
                  activeDropdown === 'recruiters' ? 'text-cyan-400 bg-slate-900/40' : ''
                }`}
              >
                For Recruiters <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'recruiters' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={`absolute left-1/2 -translate-x-1/2 mt-2 w-[320px] rounded-2xl border p-3 shadow-2xl flex flex-col gap-1 z-50 ${
                      isDark ? 'bg-[#05040d]/95 border-slate-800/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    {recruiters.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveDropdown(null);
                          if (onSelectRole) onSelectRole('Recruiter');
                          handleScrollTo('demo-section');
                        }}
                        className={`flex gap-2.5 p-2 rounded-lg text-left transition-all ${
                          isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-white dark:text-white">{item.name}</div>
                          <div className="text-[9px] text-slate-500 line-clamp-1">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => handleScrollTo('unique-features')}
              className="px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
            >
              Mentorship
            </button>
            <button 
              onClick={() => handleScrollTo('pricing-section')}
              className="px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => handleScrollTo('solution-section')}
              className="px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button 
              onClick={() => handleScrollTo('contact-section')}
              className="px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Action buttons (Sign In / Register) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('login')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/60 transition-colors cursor-pointer ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-aurora-blue to-aurora-purple rounded-lg shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile hamburger icon */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-800/10 dark:hover:bg-slate-900/40 text-slate-400 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile expandable drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden border-t overflow-y-auto max-h-[85vh] ${
              isDark ? 'bg-[#03020A] border-slate-900' : 'bg-white border-slate-200'
            }`}
          >
            <div className="px-4 pt-3 pb-6 space-y-4">
              <button
                onClick={() => handleScrollTo('hero-section')}
                className="block w-full text-left py-2 text-sm font-semibold border-b border-slate-850"
              >
                Home
              </button>

              {/* Mobile Features Collapsible */}
              <div className="space-y-1.5 PL-2">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Features</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {features.map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleDropdownItemClick(f.id, 'key-features')}
                      className="text-amber-50 dark:text-slate-300 text-left py-1 text-xs pl-2 border-l border-slate-800 block"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Works Collapsible */}
              <div className="space-y-1.5 PL-2">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400">How It Works</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {works.map(w => (
                    <button
                      key={w.id}
                      onClick={() => handleDropdownItemClick(w.id, 'how-it-works')}
                      className="text-amber-50 dark:text-slate-300 text-left py-1 text-xs pl-2 border-l border-slate-800 block"
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Intelligence Collapsible */}
              <div className="space-y-1.5 PL-2">
                <div className="text-xs font-bold uppercase tracking-wider text-violet-400">Career Intelligence</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {intelligence.map(i => (
                    <button
                      key={i.id}
                      onClick={() => handleDropdownItemClick(i.id, 'unique-features')}
                      className="text-amber-50 dark:text-slate-300 text-left py-1 text-xs pl-2 border-l border-slate-805 block"
                    >
                      {i.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Mentorship/Pricing/Contact */}
              <button
                onClick={() => handleScrollTo('unique-features')}
                className="block w-full text-left py-2 text-sm font-semibold border-b border-slate-850"
              >
                Mentorship
              </button>
              <button
                onClick={() => handleScrollTo('pricing-section')}
                className="block w-full text-left py-2 text-sm font-semibold border-b border-slate-850"
              >
                Pricing
              </button>
              <button
                onClick={() => handleScrollTo('solution-section')}
                className="block w-full text-left py-2 text-sm font-semibold border-b border-slate-850"
              >
                About Us
              </button>
              <button
                onClick={() => handleScrollTo('contact-section')}
                className="block w-full text-left py-2 text-sm font-semibold border-b border-slate-850"
              >
                Contact
              </button>

              <div className="pt-4 border-t border-slate-850 flex flex-col gap-2.5">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-800 text-sm font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('signup'); }}
                  className="w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-aurora-blue to-aurora-purple text-white text-sm font-semibold"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
