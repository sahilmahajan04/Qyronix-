/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ViewType, UserRole } from '../types';

interface LoginProps {
  isDark: boolean;
  onNavigate: (view: ViewType) => void;
  selectedRole?: UserRole; // Inherit if they clicked candidate/recruiter/admin on landing
}

export default function Login({ isDark, onNavigate, selectedRole = 'Candidate' }: LoginProps) {
  const { signInEmail, signInGoogle, firebaseConnectionError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Role selector for Google Login if registering for first time
  const [googleRole, setGoogleRole] = useState<UserRole>(selectedRole);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please input both email and password.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await signInEmail(email, password);
      onNavigate('dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Login encountered an error. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await signInGoogle(googleRole);
      onNavigate('dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google Auth cancelled or failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to instantly login with demo credentials
  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await signInEmail(demoEmail, demoPass);
      onNavigate('dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="login-page" className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-md">
        
        {/* LOGO BRIEF */}
        <div className="text-center mb-8">
          <h2 className={`font-heading text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome Back
          </h2>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Enter the Qyronix Nexus portal
          </p>
        </div>

        {/* glass card */}
        <GlassCard isDark={isDark} className="relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          
          {firebaseConnectionError && (
            <div className={`p-4 mb-5 rounded-xl border text-[11px] font-mono leading-relaxed space-y-2.5 text-left ${
              isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-500 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Firestore Unreachable / Offline
              </div>
              <p>
                The app is unable to establish a connection to your Cloud Firestore database (project <strong>qyronix2</strong>). This usually means you haven&apos;t created or initialized the database inside the Firebase console yet.
              </p>
              <p className="font-bold">To resolve this in 30 seconds:</p>
              <ol className="list-decimal pl-4.5 space-y-1 text-slate-500 dark:text-slate-400">
                <li>Go to the <a href="https://console.firebase.google.com/project/qyronix2/firestore" target="_blank" rel="noopener noreferrer" className="underline font-bold text-aurora-blue">Cloud Firestore Console</a>.</li>
                <li>Click <strong>&quot;Create database&quot;</strong>.</li>
                <li>Select database ID: <strong>(default)</strong>.</li>
                <li>Choose a Firestore hosting location/region near you (e.g., <strong>us-central1</strong>).</li>
                <li>Start in <strong>Production Mode</strong> (or Test Mode). Our newly deployed security rules will protect your access securely!</li>
              </ol>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            
            {/* error banner */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>

                {errorMsg.toLowerCase().includes('operation-not-allowed') && (
                  <div className={`p-4 rounded-xl border text-[11px] font-mono leading-relaxed space-y-3 text-left ${
                    isDark ? 'bg-[#0f0e26] border-indigo-950/80 text-slate-300' : 'bg-[#f4f3ff] border-indigo-100 text-slate-700'
                  }`}>
                    <div className="font-bold uppercase tracking-wider flex items-center gap-1 text-slate-800 dark:text-white-200">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                      Firebase Auth Setup Required
                    </div>
                    <p>
                      The <strong>Email/Password</strong> sign-in provider is disabled in your Firebase Console. Follow these steps to enable it:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                      <li>Go to the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-aurora-blue">Firebase Console</a>.</li>
                      <li>Select your designated project.</li>
                      <li>Click <strong>Build &gt; Authentication</strong> in the sidebar menu.</li>
                      <li>Go to the <strong>Sign-in method</strong> tab.</li>
                      <li>Click <strong>Add new provider</strong>, select <strong>Email/Password</strong>, enable it, and select <strong>Save</strong>.</li>
                    </ol>
                    <p className="font-semibold text-aurora-purple dark:text-purple-300 pt-1 border-t border-slate-200 dark:border-slate-800/60 mt-2">
                      💡 Quick Alternative: Sign in with <strong>Google Cloud</strong> directly below (pre-configured and ready).
                    </p>
                  </div>
                )}

                {errorMsg.toLowerCase().includes('unauthorized-domain') && (
                  <div className={`p-4 rounded-xl border text-[11px] font-mono leading-relaxed space-y-3 text-left ${
                    isDark ? 'bg-[#180a14] border-rose-955/70 text-slate-300' : 'bg-[#fff5f5] border-rose-100 text-slate-700'
                  }`}>
                    <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-rose-500">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                      Add Authorized Domain in Firebase Auth
                    </div>
                    <p>
                      Google Cloud Sign-In requires your current hosting URL to be registered in the authorized domains list of your project (<strong>qyronix2</strong>).
                    </p>
                    <p className="font-bold">Follow these steps to authorize your domain:</p>
                    <ol className="list-decimal pl-4.5 space-y-1.5 text-slate-500 dark:text-slate-400">
                      <li>Go to your <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-aurora-blue">Firebase Console</a>.</li>
                      <li>Select your project <strong>qyronix2</strong>.</li>
                      <li>Navigate to <strong>Build &gt; Authentication</strong> from the left sidebar.</li>
                      <li>Click the <strong>Settings</strong> tab at the top.</li>
                      <li>In the menu on the left side of Settings, click <strong>Authorized domains</strong>.</li>
                      <li>Click <strong>Add domain</strong> and type or paste: <br />
                        <code className="inline-block my-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded font-semibold text-xs text-cyan-400 select-all font-mono break-all">{window.location.hostname}</code>
                      </li>
                    </ol>
                    <p className="font-semibold text-emerald-500 pt-1 border-t border-slate-200 dark:border-slate-800/60 mt-2">
                      💡 Hint: You can use the <strong>Demo Accounts</strong> quick login below to bypass Google login instantly and evaluate the dashboard immediately!
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className={`block text-xs font-semibold tracking-wide uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm border focus:outline-none transition-all ${
                    isDark 
                      ? 'bg-slate-950/40 border-slate-800 text-white focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue'
                  }`}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold tracking-wide uppercase ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Secret Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs text-aurora-blue hover:underline"
                >
                  Forgot Secret?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 rounded-lg text-sm border focus:outline-none transition-all ${
                    isDark 
                      ? 'bg-slate-950/40 border-slate-800 text-white focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-aurora-blue to-aurora-purple hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? 'Connecting...' : 'Synchronize Session'}
              <LogIn className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* SPLITTER */}
          <div className="relative my-6 text-center">
            <hr className={isDark ? 'border-slate-850' : 'border-slate-200'} />
            <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-[10px] uppercase tracking-widest font-semibold transition-colors ${
              isDark ? 'bg-[#0a0a14] text-slate-500' : 'bg-[#fafafd] text-slate-400'
            }`}>
              OR DECENTRALIZED
            </span>
          </div>

          {/* GOOGLE POPUP LOGIN */}
          <div className="space-y-4">
            {/* Google Signup Role choice explicitly displayed below */}
            <div>
              <label className={`block text-[10px] font-semibold tracking-wider uppercase mb-1.5 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                First Time Logging in with Google? Select Your Role:
              </label>
              <div className="flex rounded-md p-1 border dark:bg-slate-950/40 dark:border-slate-800 bg-slate-100 border-slate-200 gap-1">
                {(['Candidate', 'Recruiter', 'Admin'] as const).map((rl) => (
                  <button
                    key={rl}
                    type="button"
                    onClick={() => setGoogleRole(rl)}
                    className={`flex-1 py-1.5 text-[10px] font-semibold rounded ${
                      googleRole === rl
                        ? 'dark:bg-slate-800 dark:text-cyan-400 bg-white shadow text-aurora-purple'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {rl}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="login-google-button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-semibold active:scale-[0.98] transition-all ${
                isDark 
                  ? 'border-slate-800 hover:bg-slate-900 text-white' 
                  : 'border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-sm'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign In with Google Cloud
            </button>
          </div>

          {/* SIGNUP CTA */}
          <div className="mt-6 text-center text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-550'}>New to Qyronix? </span>
            <button
              onClick={() => onNavigate('signup')}
              className="text-aurora-purple font-semibold hover:underline"
            >
              Create Account <ArrowRight className="h-3.5 w-3.5 inline ml-0.5" />
            </button>
          </div>

        </GlassCard>

        {/* DEMO ACCOUNTS QUICK LOGIN PANEL - HIGH CONVENIENCE */}
        <div className={`mt-6 rounded-xl border p-4 text-xs transition-colors ${
          isDark ? 'bg-slate-950/20 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="font-semibold mb-2 text-center uppercase tracking-wider text-[10px] flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse" />
            Demo Evaluation Accounts (No Registration Required)
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => handleDemoLogin('candidate@qyronix.io', 'demo1234')}
              className={`p-1.5 rounded transition-all select-none ${isDark ? 'bg-slate-900 border border-slate-800 hover:border-aurora-blue/50 text-cyan-400' : 'bg-white border border-slate-200 hover:border-aurora-blue/50 text-aurora-blue shadow-sm'}`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('recruiter@qyronix.io', 'demo1234')}
              className={`p-1.5 rounded transition-all select-none ${isDark ? 'bg-slate-900 border border-slate-800 hover:border-aurora-purple/50 text-indigo-400' : 'bg-white border border-slate-200 hover:border-aurora-purple/50 text-aurora-purple shadow-sm'}`}
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@qyronix.io', 'demo1234')}
              className={`p-1.5 rounded transition-all select-none ${isDark ? 'bg-slate-900 border border-slate-800 hover:border-[#10b981]/50 text-emerald-400' : 'bg-white border border-slate-200 hover:border-[#10b981]/50 text-emerald-600 shadow-sm'}`}
            >
              System Admin
            </button>
          </div>
          <div className="text-[10px] mt-2 text-center text-slate-500">
            Click any button above to log in instantly (auto-registers if not created yet)
          </div>
        </div>

      </div>
    </div>
  );
}
