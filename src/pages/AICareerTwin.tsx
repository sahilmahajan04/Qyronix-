/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Award, 
  TrendingUp, 
  Brain, 
  ShieldCheck, 
  MessageSquare, 
  Zap, 
  Activity, 
  RefreshCw,
  Clock
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface CareerTwinData {
  skills: { name: string; level: number }[];
  communication: number;
  interviewGrowth: number;
  confidence: number;
  placementReadiness: number;
  avatarPersonality: string;
  twinAdvice: string;
}

interface AICareerTwinProps {
  isDark: boolean;
  language?: string;
  t: (key: string) => string;
}

export default function AICareerTwin({ isDark, language = 'en', t }: AICareerTwinProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  
  const [twinData, setTwinData] = useState<CareerTwinData>({
    skills: [
      { name: 'TypeScript / React', level: 92 },
      { name: 'Generative AI Systems', level: 85 },
      { name: 'System Architecture', level: 78 },
      { name: 'CI/CD Automation', level: 80 }
    ],
    communication: 88,
    interviewGrowth: 74,
    confidence: 82,
    placementReadiness: 84,
    avatarPersonality: "Analytical, Strategic, High-Energy",
    twinAdvice: "Your analytical foundations are rock-solid. To achieve elite-level placement readiness, prioritize mock behavioral drills to elevate your spontaneous communication pace under pressure."
  });

  useEffect(() => {
    async function loadTwinData() {
      if (!user) return;
      setLoading(true);
      try {
        const twinRef = doc(db, 'careerTwins', user.uid);
        const twinSnap = await getDoc(twinRef);
        if (twinSnap.exists()) {
          setTwinData(twinSnap.data() as CareerTwinData);
        } else {
          // Initialize first twin snapshot
          await setDoc(twinRef, {
            ...twinData,
            userId: user.uid,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Error loading twin data from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTwinData();
  }, [user]);

  const handleSyncTwin = async () => {
    if (!user) return;
    setSyncing(true);
    // Simulate smart sync from other evaluation databases
    try {
      const updated: CareerTwinData = {
        ...twinData,
        interviewGrowth: Math.min(100, twinData.interviewGrowth + Math.floor(Math.random() * 5) + 1),
        confidence: Math.min(100, twinData.confidence + Math.floor(Math.random() * 4)),
        placementReadiness: Math.min(100, twinData.placementReadiness + Math.floor(Math.random() * 3) + 1),
        twinAdvice: "Twin database updated with latest telemetry. Your communication fluidity shows positive velocity, particularly in structured framing. Keep refining technical deep dives."
      };
      
      const twinRef = doc(db, 'careerTwins', user.uid);
      await setDoc(twinRef, {
        ...updated,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
      
      // Also write placement scores
      const scoreRef = doc(db, 'placementScores', user.uid);
      await setDoc(scoreRef, {
        userId: user.uid,
        scoreTechnical: 90,
        scoreCommunication: updated.communication,
        scoreConfidence: updated.confidence,
        scoreResume: 87,
        scoreBodyLanguage: 84,
        overallPlacementScore: updated.placementReadiness,
        createdAt: new Date().toISOString()
      });

      setTwinData(updated);
    } catch (err) {
      console.error("Error syncing twin stats:", err);
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Activity className="h-10 w-10 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-450 font-mono uppercase tracking-widest">Reconstructing Career Hologram...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-cyan-400 py-1 px-2 rounded bg-cyan-400/5 border border-cyan-400/10">
            AURORA COGNITIVE TWIN
          </span>
          <h2 className="text-2xl font-heading font-bold text-white mt-2 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-aurora-purple" />
            {t('aiCareerTwin')}
          </h2>
          <p className="text-xs text-slate-400">Your real-time autonomous agent mirroring skill telemetry, speech patterns, and industry readiness.</p>
        </div>

        <button
          onClick={handleSyncTwin}
          disabled={syncing}
          className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-xs border border-cyan-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'SYNCHRONIZING...' : 'SYNC SYSTEM METRICS'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT PANEL: TWIN AVATAR INTERFACE */}
        <div className="lg:col-span-1">
          <GlassCard isDark={isDark} className="relative overflow-hidden flex flex-col justify-between h-full border border-slate-800/60 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="space-y-4 text-center relative">
              <div className="relative inline-flex items-center justify-center mx-auto">
                {/* Visual Radar Rings */}
                <span className="absolute inline-flex h-20 w-20 rounded-full bg-cyan-400/20 animate-ping" />
                <span className="absolute inline-flex h-24 w-24 rounded-full bg-aurora-purple/15 animate-pulse" />
                
                <div className="h-16 w-16 bg-gradient-to-tr from-cyan-400 via-aurora-blue to-aurora-purple rounded-full p-0.5 flex items-center justify-center">
                  <div className="h-full w-full bg-slate-950 rounded-full flex items-center justify-center">
                    <Brain className="h-8 w-8 text-cyan-400 animate-pulse" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Twin Persona: Oracle</h3>
                <span className="inline-block text-[10px] bg-slate-800/50 text-slate-400 rounded px-2.5 py-0.5 font-mono mt-1 border border-slate-700/35">
                  ID: {user?.uid.substring(0, 8).toUpperCase()}_TWIN
                </span>
              </div>
            </div>

            {/* ADVICE CHAT BUBBLE */}
            <div className="bg-slate-950/50 rounded-xl p-4 mt-6 border border-slate-850 relative">
              <div className="text-[11px] uppercase font-mono font-bold tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Active Recommendation
              </div>
              <p className="text-xs text-slate-350 leading-relaxed italic">
                &ldquo;{twinData.twinAdvice}&rdquo;
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/40 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Last Tuned: Just now
              </div>
              <span className="text-emerald-500 font-bold">&#x25CF; TWIN STABLE</span>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT PANEL: TELEMETRY AND RADAR-STYLE BAR CHARTS */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard isDark={isDark} className="border border-slate-800/60 p-6">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-1.5 justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-cyan-300" />
                Core Career Metrics
              </span>
              <span className="text-xs font-semibold text-cyan-400 font-mono bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                Composite Score: {twinData.placementReadiness}%
              </span>
            </h3>

            <div className="space-y-6">
              {/* Placement Readiness */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Award className="h-4 w-4 text-cyan-400" /> {t('placementReadiness')}
                  </span>
                  <span className="font-bold text-cyan-400 font-mono">{twinData.placementReadiness}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${twinData.placementReadiness}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-aurora-blue"
                  />
                </div>
              </div>

              {/* Communication Score */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-purple-400" /> {t('communication')}
                  </span>
                  <span className="font-bold text-purple-400 font-mono">{twinData.communication}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${twinData.communication}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  />
                </div>
              </div>

              {/* Confidence Index */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> {t('confidence')}
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">{twinData.confidence}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${twinData.confidence}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  />
                </div>
              </div>

              {/* Interview Growth */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-400 animate-pulse" /> {t('interviewGrowth')}
                  </span>
                  <span className="font-bold text-yellow-400 font-mono">{twinData.interviewGrowth}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${twinData.interviewGrowth}%` }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-rose-500"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* EXTRAPOLATED SKILLS RADAR LABELS */}
          <GlassCard isDark={isDark} className="border border-slate-800/60 p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
              <Cpu className="h-5 w-5 text-cyan-350" />
              {t('skills')}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {twinData.skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-xl border dark:bg-slate-950/40 dark:border-slate-850 bg-slate-50 border-slate-200"
                >
                  <span className="text-[10px] text-slate-500 font-mono">{skill.name}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-bold text-white font-heading">{skill.level}%</span>
                    <span className="text-[10px] text-cyan-400 font-semibold font-mono">PRO</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
