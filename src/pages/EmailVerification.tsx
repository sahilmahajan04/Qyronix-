/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, RefreshCw, Send, CheckCircle2, ShieldAlert, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import GlassCard from '../components/GlassCard';
import { ViewType } from '../types';

interface EmailVerificationProps {
  isDark: boolean;
  onNavigate: (view: ViewType) => void;
}

export default function EmailVerification({ isDark, onNavigate }: EmailVerificationProps) {
  const { user, resendVerification, logout, refreshProfile } = useAuth();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorVal, setErrorVal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll Firebase auth state to see if they verified in another tab or mailbox
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(async () => {
      try {
        await auth.currentUser?.reload();
        if (auth.currentUser?.emailVerified) {
          clearInterval(intervalId);
          await refreshProfile();
          // Forward them to the dashboard
          onNavigate('dashboard');
        }
      } catch (err) {
        console.error("Polled reload failed: ", err);
      }
    }, 3000); // Poll reload state every 3 seconds

    return () => clearInterval(intervalId);
  }, [user, onNavigate, refreshProfile]);

  const handleResend = async () => {
    setResending(true);
    setMessage(null);
    setErrorVal(null);
    try {
      await resendVerification();
      setMessage('A fresh verification register transmission has been dispatched to your mailbox!');
    } catch (err: any) {
      console.error(err);
      setErrorVal(err.message || 'Verification dispatch failed or reached quota limit.');
    } finally {
      setResending(false);
    }
  };

  const handleManualCheck = async () => {
    setIsRefreshing(true);
    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        await refreshProfile();
        onNavigate('dashboard');
      } else {
        setMessage('Status unverified. Ensure you clicked the link inside our mail.');
      }
    } catch (err: any) {
      setErrorVal(err.message || 'Reload failed.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBypass = () => {
    localStorage.setItem('qyronix_bypass_verify', 'true');
    onNavigate('dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('login');
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <GlassCard isDark={isDark} className="max-w-md w-full text-center py-8">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-4 animate-bounce" />
          <p className={`text-sm ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>
            Please authenticate first before checking verification status.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="mt-4 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-aurora-blue"
          >
            Go to Login
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div id="verification-page" className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-md">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className={`font-heading text-3xl font-bold transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Verify Platform Email
          </h2>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Audit code synchronization
          </p>
        </div>

        {/* CONTAINER */}
        <GlassCard isDark={isDark} className="relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          
          <div className="text-center space-y-5">
            
            {/* Ambient indicator */}
            <div className="inline-flex p-4 rounded-full bg-aurora-purple/10 text-aurora-purple relative mb-2">
              <Mail className="h-12 w-12 animate-pulse" />
              <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
            </div>

            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Logs Sent to Your Inbox
            </h3>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-350' : 'text-slate-655'}`}>
              We registered a digital verification token link to your mail account:<br />
              <span className="font-mono text-cyan-400 font-semibold mt-1.5 block">{user.email}</span>
            </p>

            {/* Note about auto refresh */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] bg-slate-900/10 dark:bg-slate-950/40 text-slate-400 font-mono tracking-tight">
              <Sparkles className="h-3.0 w-3.0 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Auto-detecting verified click...</span>
            </div>

            {/* MESSAGE / ERROR BANNER */}
            {message && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 text-left"
              >
                {message}
              </motion.div>
            )}

            {errorVal && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-left"
              >
                {errorVal}
              </motion.div>
            )}

            {/* SUBMIT ACTIONS */}
            <div className="space-y-3 pt-3">
              <button
                id="verify-check-button"
                onClick={handleManualCheck}
                disabled={isRefreshing}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-lg font-medium text-xs text-white bg-gradient-to-r from-aurora-blue to-aurora-purple hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Verifying status...' : 'Check Verification Status Now'}
              </button>

              <button
                id="verify-resend-button"
                onClick={handleResend}
                disabled={resending}
                className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-semibold font-medium active:scale-[0.98] transition-all cursor-pointer ${
                  isDark 
                    ? 'border-slate-800 bg-slate-950/25 text-slate-300 hover:bg-slate-900' 
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                {resending ? 'Transmitting link...' : 'Resend Verification Mail'}
              </button>

              {/* Functional skip button for modern developer sandbox flow */}
              <button
                id="verify-bypass-button"
                onClick={handleBypass}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed text-xs font-semibold font-medium text-cyan-400 border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-950/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Skip Verification & Enter Dashboard
              </button>

              {/* Special skip verification guide for local debugging ease */}
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-indigo-950/20 border border-indigo-900/30 text-indigo-400' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'}`}>
                <p className="text-[10px] leading-normal font-sans">
                  <strong>Developer Sandbox Tip:</strong> For testing logins easily without actual inbox links, you can use any of the preloaded <strong>Demo Accounts</strong> on the Login page which are already auto-verified in the Firestore!
                </p>
              </div>

              {/* LOG OUT */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors pt-2 hover:underline cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Log Out of Profile
              </button>
            </div>

          </div>

        </GlassCard>

      </div>
    </div>
  );
}
