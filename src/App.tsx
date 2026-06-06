/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { ViewType, UserRole } from './types';
import GradientCanvas from './components/GradientCanvas';
import ThemeToggle from './components/ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Briefcase, ChevronRight, Lock, Key } from 'lucide-react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import WelcomePermissionsModal from './components/WelcomePermissionsModal';

function AppContent() {
  const { user, loading, userProfile } = useAuth();
  
  // Design Theme state - default to Dark mode (space aurora vibe)
  const [isDark, setIsDark] = useState<boolean>(true);
  
  // Custom SPA Hash Routing
  const [view, setView] = useState<ViewType>('landing');
  
  // Temporary role selection storage (carried from landing tab clicks to signup fields)
  const [temporaryRole, setTemporaryRole] = useState<UserRole>('Candidate');

  // Sync state view on hash changes for page reload safety
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ViewType;
      const validViews: ViewType[] = ['landing', 'login', 'signup', 'forgot-password', 'verify-email', 'dashboard'];
      if (validViews.includes(hash)) {
        setView(hash);
      } else {
        setView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial parse
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when view state changes
  const navigateTo = (targetView: ViewType) => {
    window.location.hash = `#${targetView}`;
    setView(targetView);
  };

    // Protected Route Gates & Session Redirects
  useEffect(() => {
    if (loading) return;

    const bypassVerification = localStorage.getItem('qyronix_bypass_verify') === 'true';

    if (!user) {
      // Guest users cannot access protected views
      if (view === 'dashboard' || view === 'verify-email') {
        navigateTo('login');
      }
    } else {
      // Authenticated users
      if (!user.emailVerified && !bypassVerification) {
        // Enforce email verification portal redirection if not verified
        if (view !== 'verify-email') {
          navigateTo('verify-email');
        }
      } else {
        // Logged-in & verified users can't navigate to login/signup/verify
        if (view === 'login' || view === 'signup' || view === 'verify-email' || view === 'landing') {
          navigateTo('dashboard');
        }
      }
    }
  }, [user, loading, view]);

  // Synchronize document dark class toggles for tailwind v4 dark mode selector compatibility
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 bg-[#03020A]`}>
        <GradientCanvas isDark={true} />
        
        {/* Loading Indicator */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-cyan-400 animate-spin" />
            <Sparkles className="h-6 w-6 text-indigo-400 absolute animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-lg font-bold text-white tracking-widest uppercase">
              Qyronix Nexus
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
              Synchronizing Auth Database Modules...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Dynamic Aurora Ambient Canvas Backdrop */}
      <GradientCanvas isDark={isDark} />

      {/* Unified Permissions Onboarding Welcome Overlay */}
      {user && user.emailVerified && <WelcomePermissionsModal />}

      {/* CONDITIONAL PUBLIC NAVBAR VS DASHBOARD TOPBAR */}
      {view !== 'dashboard' ? (
        <div className="relative">
          <Navbar 
            isDark={isDark} 
            onNavigate={navigateTo} 
            onSelectRole={setTemporaryRole} 
          />
          {/* Float ThemeToggle at absolute high priority top corner */}
          <div className="fixed top-3.5 right-1.5 sm:right-4 z-[60] flex items-center gap-2">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
          </div>
        </div>
      ) : (
        <header className={`fixed top-0 left-0 right-0 z-4 z-40 transition-colors duration-300 border-b backdrop-blur-md ${
          isDark 
            ? 'bg-[#03020A]/70 border-slate-900/60' 
            : 'bg-white/60 border-slate-200/50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo Name block */}
            <button 
              onClick={() => navigateTo('landing')}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none"
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

            {/* Controls list */}
            <div className="flex items-center gap-4">
              <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
              <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono whitespace-nowrap opacity-75 ${
                isDark ? 'text-cyan-400' : 'text-slate-500'
              }`}>
                <Lock className="h-3 w-3" /> Encrypted Session Secure
              </span>
            </div>
          </div>
        </header>
      )}

      {/* MAIN SCREEN TRANSITION VIEWS CONTAINER */}
      <main className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Landing 
                isDark={isDark} 
                onNavigate={navigateTo} 
                onSelectRole={setTemporaryRole} 
              />
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Login 
                isDark={isDark} 
                onNavigate={navigateTo} 
                selectedRole={temporaryRole}
              />
            </motion.div>
          )}

          {view === 'signup' && (
            <motion.div 
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Signup 
                isDark={isDark} 
                onNavigate={navigateTo} 
                selectedRole={temporaryRole}
              />
            </motion.div>
          )}

          {view === 'forgot-password' && (
            <motion.div 
              key="forgot-password"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <ForgotPassword 
                isDark={isDark} 
                onNavigate={navigateTo} 
              />
            </motion.div>
          )}

          {view === 'verify-email' && (
            <motion.div 
              key="verify-email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EmailVerification 
                isDark={isDark} 
                onNavigate={navigateTo} 
              />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <Dashboard 
                isDark={isDark} 
                onNavigate={navigateTo} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SPA MOBILE ACC BOTTOM FLOATER (Optional simple guidance) */}
      <footer className="w-full text-center py-6 text-[10px] text-slate-500 font-mono tracking-wider bg-slate-950/5 mt-16 dark:border-t dark:border-slate-850/40 select-none">
        &copy; 2026 QYRONIX RECRUITMENT LABS. PROTECTED BY SECURE ABAC FIRESTORE GATEWAY CONFIG.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <PermissionProvider>
          <AppContent />
        </PermissionProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}
