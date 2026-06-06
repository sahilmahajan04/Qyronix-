/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ViewType, UserRole } from '../types';

interface SignupProps {
  isDark: boolean;
  onNavigate: (view: ViewType) => void;
  selectedRole?: UserRole;
}

export default function Signup({ isDark, onNavigate, selectedRole = 'Candidate' }: SignupProps) {
  const { signUpEmail } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(selectedRole);
  
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Initial valid checks
    if (!name.trim()) {
      setErrorMsg('Display name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setErrorMsg('Display name must be at least 2 characters.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await signUpEmail(email, password, name, role);
      setSuccess(true);
      // Wait a brief moment then push to email verification screen
      setTimeout(() => {
        onNavigate('verify-email');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during profile registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="signup-page" className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-md">
        
        {/* TOP ACC COMP */}
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Nexus
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className={`font-heading text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Assemble Credentials
          </h2>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Register with Qyronix Decentralized Identity
          </p>
        </div>

        {/* CARD CONTAINER */}
        <GlassCard isDark={isDark} className="border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          {success ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="inline-flex p-3 rounded-full bg-emerald-500/15 text-emerald-400 mb-2">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Database Registered!
              </h3>
              <p className={`text-xs leading-relaxed max-w-xs mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Account structured successfully! Forwarding to the email verification interface to dispatch confirmation logs...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              
              {/* Error box */}
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
                      <div className="font-bold uppercase tracking-wider flex items-center gap-1 text-slate-800 dark:text-white-250">
                        <UserPlus className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                        Firebase Auth SignUp Configuration Requirement
                      </div>
                      <p>
                        To allow new candidate or recruiter registrations using email and password, please configure your project setup:
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-500 dark:text-slate-400 font-mono">
                        <li>Visit the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-aurora-blue">Firebase Console</a>.</li>
                        <li>Select your matching project database.</li>
                        <li>Go to <strong>Build &gt; Authentication &gt; Sign-in method</strong>.</li>
                        <li>Select <strong>Email/Password</strong> and toggle both <strong>Email/Password</strong> and <strong>Email link (passwordless sign-in)</strong> or just <strong>Email/Password</strong> to Enabled, then click **Save**.</li>
                      </ol>
                      <p className="font-semibold text-aurora-blue pt-1 border-t border-slate-200 dark:border-slate-800/60 mt-2">
                        💡 Alternatively, go to the login screen and click **Sign In with Google Cloud** which requires zero configuration!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Name Field */}
              <div>
                <label className={`block text-xs font-semibold tracking-wide uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="signup-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-950/40 border-slate-800 text-white focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue'
                    }`}
                    placeholder="Althea Vance"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className={`block text-xs font-semibold tracking-wide uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  System Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="signup-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-950/40 border-slate-800 text-white focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue'
                    }`}
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className={`block text-xs font-semibold tracking-wide uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  System Role Access
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Candidate', 'Recruiter', 'Admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 rounded-lg border text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer ${
                        role === r
                          ? 'text-white bg-gradient-to-r from-aurora-blue to-aurora-purple border-transparent shadow'
                          : isDark
                            ? 'border-slate-800 bg-slate-950/20 text-slate-400 hover:bg-slate-900/60'
                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 text-center leading-relaxed">
                  {role === 'Candidate' && 'Enters recruitment queue, builds resume, manages AI applications.'}
                  {role === 'Recruiter' && 'Deploys vacancies, processes candidates, reads AI conversion funnels.'}
                  {role === 'Admin' && 'Monitors operations database, edits user profiles, performs system audit.'}
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-xs font-semibold tracking-wide uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Define Password (min 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg text-sm border focus:outline-none transition-all ${
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

              {/* Confirm Password */}
              <div>
                <label className={`block text-xs font-semibold tracking-wide uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Re-type Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="signup-confirm-input"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-950/40 border-slate-800 text-white focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* REGISTER SUBMIT BUTTON */}
              <button
                id="signup-submit-button"
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-aurora-blue to-aurora-purple hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Registering Matrix...' : 'Provision Account'}
                <UserPlus className="h-4.5 w-4.5" />
              </button>

              <div className="text-center text-xs mt-4">
                <span className={isDark ? 'text-slate-400' : 'text-slate-550'}>Already registered? </span>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-aurora-blue font-semibold hover:underline"
                >
                  Log In instead
                </button>
              </div>

            </form>
          )}
        </GlassCard>

      </div>
    </div>
  );
}
