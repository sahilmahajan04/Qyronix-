/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ViewType } from '../types';

interface ForgotPasswordProps {
  isDark: boolean;
  onNavigate: (view: ViewType) => void;
}

export default function ForgotPassword({ isDark, onNavigate }: ForgotPasswordProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dispatched, setDispatched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await resetPassword(email);
      setDispatched(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred while requesting password reset. Verify the email format.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="forgot-password-page" className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-md">
        
        {/* BACK CALL BUTTON */}
        <button
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Entrance Gate
        </button>

        {/* LOGO STATE */}
        <div className="text-center mb-6">
          <h2 className={`font-heading text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Restore Password
          </h2>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Request a secure password sync link
          </p>
        </div>

        {/* glass block */}
        <GlassCard isDark={isDark} className="border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          {dispatched ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="inline-flex p-3 rounded-full bg-emerald-500/15 text-emerald-400 mb-1">
                <CheckCircle2 className="h-10 w-10 animate-pulse" />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Link Dispatched!
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>
                A secure recovery token has been synchronized and transmitted to:<br />
                <span className="font-mono text-aurora-blue font-semibold mt-1 block">{email}</span>
              </p>
              <div className="pt-2 text-xs">
                Check your inbox, apply the new credentials, and return to log in.
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 rounded-lg font-semibold text-xs text-white bg-gradient-to-r from-aurora-blue to-aurora-purple hover:brightness-110 active:scale-95 transition-all text-center mt-2 cursor-pointer"
              >
                Log In with New Password
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/10 rounded-lg text-xs text-red-500">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className={`block text-xs font-semibold tracking-wide uppercase mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                  Account Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="forgot-email-input"
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

              {/* ACTION BTN */}
              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={submitting || !email}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-aurora-blue to-aurora-purple hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Transmitting code...' : 'Send Recovery Authorization'}
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          )}
        </GlassCard>

      </div>
    </div>
  );
}
