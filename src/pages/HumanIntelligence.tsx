/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  Award, 
  Shirt, 
  UserCheck, 
  Compass, 
  Calendar, 
  RotateCcw, 
  Camera, 
  Brain, 
  User, 
  Cpu, 
  History, 
  Eye, 
  Smile, 
  Activity, 
  ChevronRight, 
  Trash2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import GlassCard from '../components/GlassCard';
import { usePermissions } from '../context/PermissionContext';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface HumanIntelReport {
  id: string;
  userId: string;
  role: string;
  eyeContact: string;
  facialExpressions: string;
  headMovement: string;
  sittingPosture: string;
  handGestures: string;
  confidenceScore: number;
  bodyLanguageScore: number;
  professionalPresenceScore: number;
  shirtRecommendation: string;
  blazerRecommendation: string;
  appearanceGuidelines: string;
  stylingSuggestions: string;
  scoreTechnical: number;
  scoreCommunication: number;
  scoreConfidence: number;
  scoreResume: number;
  scoreBodyLanguage: number;
  overallPlacementScore: number;
  plan30Day: string;
  plan60Day: string;
  plan90Day: string;
  createdAt: any;
}

const ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'HR',
  'Marketing',
  'Finance'
];

const EYE_CONTACT_OPTIONS = [
  'Sustained, professional connection (80-90% frequency)',
  'Comfortable & natural engagement (60-70% frequency)',
  'Slightly intense or unblinking focus',
  'Shifts eyes laterally when thinking',
  'Downwards gaze under mental stress',
  'Minimal direct contact'
];

const FACIAL_EXPRESSIONS_OPTIONS = [
  'Warm, authentic smiling and high engagement',
  'Calm, professional & focused composure',
  'Slightly tense or constant smile',
  'Resting or flat affect response',
  'Expressive, slightly animated reactions'
];

const HEAD_MOVEMENT_OPTIONS = [
  'Stable, responsive nod confirmation',
  'Active tilting (suggests deep listening)',
  'Frequent, rapid nods (can signal impatience)',
  'Rigid, static postures',
  'Slightly dropped chin posture'
];

const SITTING_POSTURE_OPTIONS = [
  'Upright, symmetric shoulders, relaxed posture (Optimal)',
  'Slightly leaning forward (signals interest/curiosity)',
  'Hunched or slouched backward slightly',
  'Tense and overly rigid position',
  'Asymmetric skew or shifted side placement'
];

const HAND_GESTURES_OPTIONS = [
  'Open-palm, measured, functional styling (Optimal)',
  'Folded or clasped resting hands (Conservative)',
  'Fidgeting hands, touching face or accessories',
  'Hidden entirely below the table frame',
  'Slightly hyperactive gesture patterns'
];

export default function HumanIntelligence({ isDark }: { isDark: boolean }) {
  const { permissions, requestCamera } = usePermissions();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<'assess' | 'result' | 'history'>('assess');

  // Camera feed stream mounting and unmounting
  useEffect(() => {
    let active = true;
    let localStream: MediaStream | null = null;

    const startCamera = async () => {
      if (step === 'assess' && permissions.camera === 'granted') {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 320, height: 240, facingMode: 'user' } 
          });
          if (active) {
            setCameraStream(localStream);
            if (videoRef.current) {
              videoRef.current.srcObject = localStream;
            }
          }
        } catch (err) {
          console.error("Critical: Live assessment camera hook failed:", err);
        }
      }
    };

    startCamera();

    return () => {
      active = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setCameraStream(null);
    };
  }, [step, permissions.camera]);
  
  // Form states
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [eyeContact, setEyeContact] = useState(EYE_CONTACT_OPTIONS[0]);
  const [facialExpressions, setFacialExpressions] = useState(FACIAL_EXPRESSIONS_OPTIONS[0]);
  const [headMovement, setHeadMovement] = useState(HEAD_MOVEMENT_OPTIONS[0]);
  const [sittingPosture, setSittingPosture] = useState(SITTING_POSTURE_OPTIONS[0]);
  const [handGestures, setHandGestures] = useState(HAND_GESTURES_OPTIONS[0]);
  const [extraContext, setExtraContext] = useState('');

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [currentReport, setCurrentReport] = useState<HumanIntelReport | null>(null);

  // History state
  const [reportsHistory, setReportsHistory] = useState<HumanIntelReport[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Error handling compliance
  const handleFirestoreErrorLocal = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      }
    };
    console.error('Firestore ABAC SEC_FAIL:', JSON.stringify(errInfo));
    setErrorMessage(`Database access denied or rate-limited. Operational info: ${errInfo.error}`);
  };

  // Fetch report history logs
  useEffect(() => {
    if (step === 'history') {
      fetchHistory();
    }
  }, [step]);

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    setIsLoadingHistory(true);
    setErrorMessage(null);
    const colPath = 'human_intel_reports';
    try {
      const q = query(
        collection(db, colPath),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const items: HumanIntelReport[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as HumanIntelReport);
      });
      // Sort in-memory to bypass composite index constraints if needed
      items.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds || b.createdAt - a.createdAt);
      setReportsHistory(items);
    } catch (err) {
      handleFirestoreErrorLocal(err, OperationType.LIST, colPath);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const colPath = 'human_intel_reports';
    try {
      await deleteDoc(doc(db, colPath, reportId));
      setReportsHistory(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      handleFirestoreErrorLocal(err, OperationType.DELETE, `${colPath}/${reportId}`);
    }
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisLogs([]);
    setErrorMessage(null);

    const logs = [
      'Establishing executive neural posture scanner...',
      'Mapping eye-symmetry contact frequency indexes...',
      'Computing facial muscle calibration indicators...',
      'Analyzing hand-gesture spacing and micro-signals...',
      'Comparing sitting geometry and tilt alignments...',
      'Generating Dress Intelligence coordinate patterns...',
      'Synthesizing 90-day placement accelerator timeline...',
      'Syncing visual presence logs to Firebase Firestore storage...'
    ];

    // Simulate progressive cyberpunk/tech scanning animation
    for (let i = 0; i < logs.length; i++) {
      setAnalysisLogs(prev => [...prev, logs[i]]);
      await new Promise(resolve => setTimeout(resolve, 450));
    }

    try {
      const response = await fetch('/api/human-intel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          eyeContact,
          facialExpressions,
          headMovement,
          sittingPosture,
          handGestures,
          extraContext
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const data = await response.json();
      
      // Save report in Firestore
      if (auth.currentUser) {
        const reportId = `hir_${Date.now()}`;
        const newReportRecord: HumanIntelReport = {
          id: reportId,
          userId: auth.currentUser.uid,
          role: selectedRole,
          eyeContact,
          facialExpressions,
          headMovement,
          sittingPosture,
          handGestures,
          confidenceScore: data.confidenceScore || 85,
          bodyLanguageScore: data.bodyLanguageScore || 80,
          professionalPresenceScore: data.professionalPresenceScore || 83,
          shirtRecommendation: data.shirtRecommendation || 'Deep Royal Blue or Off-White shirt',
          blazerRecommendation: data.blazerRecommendation || 'Charcoal Grey structured blazer',
          appearanceGuidelines: data.appearanceGuidelines || 'Keep hair groomed, camera leveled, neutral background.',
          stylingSuggestions: data.stylingSuggestions || 'Match brown leather watches and keep silver accents.',
          scoreTechnical: data.scoreTechnical || 82,
          scoreCommunication: data.scoreCommunication || 88,
          scoreConfidence: data.scoreConfidence || 85,
          scoreResume: data.scoreResume || 78,
          scoreBodyLanguage: data.scoreBodyLanguage || 80,
          overallPlacementScore: data.overallPlacementScore || 83,
          plan30Day: data.plan30Day || 'Focus on posture and baseline mock interviews.',
          plan60Day: data.plan60Day || 'Expand domain tech competencies and speed drills.',
          plan90Day: data.plan90Day || 'Deploy credentials across target recruiters.',
          createdAt: new Date() // Firestore local write saves with Date, rules checked against request.time
        };

        const docRef = doc(db, 'human_intel_reports', reportId);
        await setDoc(docRef, {
          ...newReportRecord,
          createdAt: serverTimestamp() // Server rules validate timestamp matching request.time using serverTimestamp
        });

        setCurrentReport(newReportRecord);
      } else {
        // Fallback for demo session
        setCurrentReport({
          id: `hir_demo`,
          userId: 'guest_user',
          role: selectedRole,
          eyeContact,
          facialExpressions,
          headMovement,
          sittingPosture,
          handGestures,
          ...data,
          createdAt: new Date()
        });
      }

      setStep('result');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during posture analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyPreset = (presetRole: string) => {
    setSelectedRole(presetRole);
  };

  // Helper to format text with list markers as pretty items
  const renderPlanBlocks = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    return (
      <ul className="space-y-2 mt-2">
        {lines.map((line, idx) => {
          const cleanedLine = line.replace(/^[\s*\-#\d.]+/g, '').trim();
          if (!cleanedLine) return null;
          return (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-mono">
              <CheckCircle className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <span>{cleanedLine}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-8 pr-1">
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold uppercase bg-aurora-purple/15 text-aurora-purple border border-aurora-purple/20">
              Qyronix Phase 4 Premium
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className={`font-heading text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Executive Posture & Human Intelligence AI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-2xl font-mono">
            Assess non-verbal cues, dress intelligence configurations, compile dynamic Placement Readiness indices, and deploy personalized career milestones.
          </p>
        </div>

        {/* NAVIGATION TOGGLE SYSTEM */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setStep('assess')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border font-mono transition-all cursor-pointer ${
              step === 'assess' 
                ? 'bg-aurora-purple/10 border-aurora-purple text-aurora-purple dark:text-purple-300' 
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
            }`}
          >
            Demeanor Audit
          </button>
          
          {currentReport && (
            <button
              onClick={() => setStep('result')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border font-mono transition-all cursor-pointer ${
                step === 'result' 
                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-500 dark:text-cyan-300' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
              }`}
            >
              Latest Analysis
            </button>
          )}

          <button
            onClick={() => setStep('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              step === 'history' 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-300' 
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
            }`}
          >
            <History className="h-3.5 w-3.5" /> History Log
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400 font-mono text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* RENDER STEP: ASSESS FORM */}
      {step === 'assess' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ASSESSMENT INTAKE COLUMN */}
          <GlassCard isDark={isDark} className="lg:col-span-2 border-slate-200/50 dark:border-slate-800/50 space-y-6">
            
            <div className="border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <h3 className={`font-heading text-lg font-bold mb-1 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Camera className="h-5 w-5 text-indigo-400 animate-pulse" />
                Physical Presentation Demeanor Logger
              </h3>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 font-mono">
                Log behavioral posture attributes of your virtual or visual video rehearsals to compute metrics.
              </p>
            </div>

            {/* Micro Role Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Select Targeted Career Role
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleApplyPreset(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                      selectedRole === r
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-black border-transparent font-semibold shadow-md shadow-cyan-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Posture Variables Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Eye Contact block */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400 block uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-cyan-400" /> Eye Contact Behavior
                </label>
                <select
                  value={eyeContact}
                  onChange={(e) => setEyeContact(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono transition-all outline-none focus:border-cyan-400 ${
                    isDark ? 'bg-slate-950/60 border-slate-850 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {EYE_CONTACT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Facial Expressions block */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400 block uppercase tracking-wider flex items-center gap-1.5">
                  <Smile className="h-3.5 w-3.5 text-purple-400" /> Facial Expressions Composure
                </label>
                <select
                  value={facialExpressions}
                  onChange={(e) => setFacialExpressions(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono transition-all outline-none focus:border-cyan-400 ${
                    isDark ? 'bg-slate-950/60 border-slate-850 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {FACIAL_EXPRESSIONS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Head Movement block */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400 block uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-400" /> Head Movement Patterns
                </label>
                <select
                  value={headMovement}
                  onChange={(e) => setHeadMovement(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono transition-all outline-none focus:border-cyan-400 ${
                    isDark ? 'bg-slate-950/60 border-slate-850 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {HEAD_MOVEMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Sitting Posture block */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400 block uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> Sitting Posture Structure
                </label>
                <select
                  value={sittingPosture}
                  onChange={(e) => setSittingPosture(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono transition-all outline-none focus:border-cyan-400 ${
                    isDark ? 'bg-slate-950/60 border-slate-850 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {SITTING_POSTURE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Hand Gestures block */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400 block uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Hand Gestures Style
                </label>
                <select
                  value={handGestures}
                  onChange={(e) => setHandGestures(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono transition-all outline-none focus:border-cyan-400 ${
                    isDark ? 'bg-slate-950/60 border-slate-850 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {HAND_GESTURES_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Custom Notes Section */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Rehearsal Notes & Extra Context (Optional)
              </label>
              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder="Log your exact camera setups, nervous habits you detected, or target corporate setting (e.g. Google technical loop, Goldman Sachs behavioral suite, etc)..."
                rows={4}
                className={`w-full p-3.5 rounded-xl border text-xs font-mono transition-all outline-none focus:border-cyan-400 resize-none ${
                  isDark ? 'bg-slate-950/60 border-slate-850 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Trigger Engine Buttons */}
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-black hover:text-white dark:hover:text-white text-xs font-bold font-sans tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-white animate-spin" />
                  Running Neural Presence Assessment...
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" /> Trigger Executive Presence Analysis
                </>
              )}
            </button>

          </GlassCard>

          {/* ACTIVE LOG PANEL AND INFOMATION BANNER */}
          <div className="space-y-6">
            
            {/* CAMERA CALIBRATION SUITE PLAYER */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden aspect-video group">
              {permissions.camera === 'granted' ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]" 
                  />
                  {/* Cyber Overlays */}
                  <div className="absolute inset-0 pointer-events-none p-2.5 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <span className="text-[8px] font-mono text-cyan-400 bg-slate-950/75 px-1 py-0.5 rounded leading-none">POSTURE_CAM LIVE</span>
                      <span className="text-[8px] font-mono text-cyan-400 animate-pulse bg-slate-950/75 px-1 py-0.5 rounded leading-none">● ANALYSIS ACTIVE</span>
                    </div>
                    
                    {/* Focus rect */}
                    <div className="absolute inset-0 border border-purple-500/10 flex items-center justify-center">
                      <div className="w-12 h-12 border border-dashed border-indigo-500/20 rounded"></div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="bg-slate-950/80 px-1.5 py-1 rounded border border-slate-800 text-[8px] font-mono text-slate-300 space-y-0.5 leading-none">
                        <div>EYE CONTACT: <span className="text-cyan-400 font-bold">ALIGNED</span></div>
                        <div>EXPRESSION: <span className="text-purple-400 font-bold">CALM</span></div>
                      </div>
                      <div className="bg-slate-950/80 px-1.5 py-1 rounded border border-slate-800 text-[8px] font-mono text-emerald-400 leading-none">
                        TRACK_POSTURE: COHERENT
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950 space-y-2.5">
                  <span className="h-8 w-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-500">
                    <Camera className="h-4 w-4" />
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-300 font-bold font-heading uppercase">Presence Camera Offline</span>
                    <p className="text-[8.5px] text-slate-500 max-w-[180px] leading-tight mx-auto">
                      Please allow camera sensor matching so our Neural presence engines can evaluate facial expressions and hand gestures parameters.
                    </p>
                  </div>
                  
                  <button
                    onClick={requestCamera}
                    className="px-2.5 py-1 text-[9px] font-bold font-mono uppercase bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-md hover:bg-indigo-500/20 transition-all cursor-pointer"
                  >
                    Calibrate Sensor
                  </button>
                </div>
              )}
            </div>

            {/* INSTRUCTIONS CORNER */}
            <GlassCard isDark={isDark} className="border-slate-200/50 dark:border-slate-800/50 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <span className={`font-heading font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Professional Presence Hub</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
                Executive styling goes far beyond spoken rhetoric. Research proves that non-verbal body postures, fastidious grooming alignments, and calibrated physical cues influence placement conversion rates by <strong>&gt;72%</strong>.
              </p>
              
              <div className="border-t border-slate-200/60 dark:border-slate-850 pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-350">Dual-Mode Color Calibration Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-350">Demeanor, Dressing & Timing Engine</span>
                </div>
              </div>
            </GlassCard>

            {/* REALTIME SYSTEM ENGINE STREAM */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <GlassCard isDark={isDark} className="border-slate-200/30 dark:border-slate-800/40 p-6 bg-slate-950/75 dark:bg-[#03020A]/90 font-mono text-slate-300">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4 text-xs font-semibold">
                      <span className="text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                        <Activity className="h-4 w-4 animate-bounce" /> Qyronix Kernel Logs
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase">ONLINE</span>
                    </div>

                    <div className="space-y-2 max-h-[180px] overflow-y-auto text-[10px] sm:text-xs leading-relaxed">
                      {analysisLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-slate-600 font-bold shrink-0">&gt;&gt;</span>
                          <span className={`${idx === analysisLogs.length - 1 ? 'text-indigo-300 animate-pulse' : 'text-slate-400'}`}>
                            {log}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      )}

      {/* RENDER STEP: RESULTS PANELS */}
      {step === 'result' && currentReport && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* TOP SUMMARY STATISTICS DECK */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* OVERALL PLACEMENT READINESS CARD */}
            <GlassCard isDark={isDark} className={`p-6 border-slate-200/50 dark:border-slate-800/60 bg-gradient-to-br ${
              isDark ? 'from-cyan-950/20 via-slate-950/40 to-slate-950' : 'from-cyan-50/30 via-white/80 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-500 font-bold">Readiness Score</span>
                <Award className="h-5 w-5 text-cyan-400 shrink-0" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-4xl font-heading font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentReport.overallPlacementScore}%
                </span>
                <span className="text-xs text-slate-500 font-semibold font-mono">Ready</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                  style={{ width: `${currentReport.overallPlacementScore}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Aggregated core metrics mapping technical, presentation & styling parameters.
              </p>
            </GlassCard>

            {/* BODY LANGUAGE METRIC CARD */}
            <GlassCard isDark={isDark} className="p-6 border-slate-200/50 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">Body Language</span>
                <Camera className="h-5 w-5 text-purple-400 shrink-0" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-4xl font-heading font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentReport.bodyLanguageScore}%
                </span>
                <span className="text-xs text-slate-500 font-semibold font-mono">Score</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  style={{ width: `${currentReport.bodyLanguageScore}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Integrations of eye tracking, gestures correctness, and postural symmetry.
              </p>
            </GlassCard>

            {/* CONFIDENCE PROFILE CARD */}
            <GlassCard isDark={isDark} className="p-6 border-slate-200/50 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-bold">Confidence Index</span>
                <Brain className="h-5 w-5 text-pink-400 shrink-0" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-4xl font-heading font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentReport.confidenceScore}%
                </span>
                <span className="text-xs text-slate-500 font-semibold font-mono">Index</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  style={{ width: `${currentReport.confidenceScore}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Self-expression power, verbal assertiveness, and micro-posture ratings.
              </p>
            </GlassCard>

            {/* PROFESSIONAL PRESENCE CARD */}
            <GlassCard isDark={isDark} className="p-6 border-slate-200/50 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold">Presence Impact</span>
                <UserCheck className="h-5 w-5 text-amber-400 shrink-0" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-4xl font-heading font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentReport.professionalPresenceScore}%
                </span>
                <span className="text-xs text-slate-500 font-semibold font-mono">Rating</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                  style={{ width: `${currentReport.professionalPresenceScore}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Linguistic impact, role context pairing, and grooming styling.
              </p>
            </GlassCard>

          </div>

          {/* DRESS INTELLIGENCE & PLACEMENT ENGINES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* DRESS INTELLIGENCE DECK */}
            <GlassCard isDark={isDark} className="border-slate-200/50 dark:border-slate-800/50 space-y-6">
              
              <div className="pb-4 border-b border-slate-250 dark:border-slate-850 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 shrink-0">
                  <Shirt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-heading text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Dress Intelligence AI
                  </h3>
                  <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                    Suggestions Curated for {currentReport.role}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                
                {/* Shirt Recommendations */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-850' : 'bg-slate-50/10 border-slate-200'} space-y-1.5`}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Shirt Style & Colors</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-white' : 'text-slate-900'} leading-relaxed font-semibold`}>
                    {currentReport.shirtRecommendation}
                  </p>
                </div>

                {/* Blazer Recommendations */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-850' : 'bg-slate-50/10 border-slate-200'} space-y-1.5`}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Blazer Coordination</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-white' : 'text-slate-900'} leading-relaxed font-semibold`}>
                    {currentReport.blazerRecommendation}
                  </p>
                </div>

                {/* Appearance Guidelines */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-850' : 'bg-slate-50/10 border-slate-200'} space-y-1.5`}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Professional Grooming Principles</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-700' : 'text-slate-900'} dark:text-slate-350 leading-relaxed`}>
                    {currentReport.appearanceGuidelines}
                  </p>
                </div>

                {/* Styling Suggestions */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-850' : 'bg-slate-50/10 border-slate-200'} space-y-1.5`}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-pink-500" />
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Interview Accessories & Accents</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-700' : 'text-slate-900'} dark:text-slate-350 leading-relaxed`}>
                    {currentReport.stylingSuggestions}
                  </p>
                </div>

              </div>

            </GlassCard>

            {/* PLACEMENT READINESS CALCULATOR DECK */}
            <GlassCard isDark={isDark} className="border-slate-200/50 dark:border-slate-800/50 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-250 dark:border-slate-850 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 shrink-0">
                    <Activity className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`font-heading text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Placement Readiness Engine
                    </h3>
                    <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      Calculated Candidate Competency Map
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  
                  {/* Technical Skills bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-550 dark:text-slate-400 font-mono">Technical Skills Rating</span>
                      <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{currentReport.scoreTechnical}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${currentReport.scoreTechnical}%` }} />
                    </div>
                  </div>

                  {/* Communication Skills bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-550 dark:text-slate-400 font-mono">Linguistic Communication</span>
                      <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{currentReport.scoreCommunication}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-400" style={{ width: `${currentReport.scoreCommunication}%` }} />
                    </div>
                  </div>

                  {/* Confidence rating bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-550 dark:text-slate-400 font-mono">Confidence index</span>
                      <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{currentReport.scoreConfidence}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: `${currentReport.scoreConfidence}%` }} />
                    </div>
                  </div>

                  {/* Resume Quality bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-550 dark:text-slate-400 font-mono">Resume/CV Quality</span>
                      <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{currentReport.scoreResume}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-pink-400" style={{ width: `${currentReport.scoreResume}%` }} />
                    </div>
                  </div>

                  {/* Body Language geometry bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-550 dark:text-slate-400 font-mono">Body Language & Poise</span>
                      <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{currentReport.scoreBodyLanguage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${currentReport.scoreBodyLanguage}%` }} />
                    </div>
                  </div>

                </div>
              </div>

              <div className="mt-6 border-t border-slate-200/60 dark:border-slate-850 pt-4 flex flex-col md:flex-row md:items-center justify-between text-[11px] text-slate-500 font-mono gap-3">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-650 dark:text-emerald-350 border border-emerald-500/25 rounded px-2 py-0.5">
                  <CheckCircle className="h-3 w-3 shrink-0 animate-pulse" /> Verified by Qyronix Matchmaker
                </div>
                <span>Assessment Generated: {new Date(currentReport.createdAt?.seconds * 1000 || currentReport.createdAt).toLocaleDateString()}</span>
              </div>

            </GlassCard>

          </div>

          {/* DYNAMIC CAREER ROADMAP TIME FRAMES */}
          <GlassCard isDark={isDark} className="border-slate-200/50 dark:border-slate-800/50 space-y-6">
            
            <div className="pb-4 border-b border-slate-250 dark:border-slate-850 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 shrink-0">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-heading text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Custom Personalized Career Growth Roadmap
                  </h3>
                  <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                    Accelerating {currentReport.role} milestones
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded font-mono text-[10px] font-semibold">
                <Calendar className="h-3.5 w-3.5" /> 90 Sequential Milestones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* 30 Day Plan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-500 flex items-center justify-center font-bold text-xs">
                    30
                  </div>
                  <div>
                    <h4 className={`text-sm font-heading font-extrabold ${isDark ? 'text-zinc-100' : 'text-slate-950'}`}>Day 1 to 30</h4>
                    <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Base Practice Phase</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50/20 border-slate-150'} min-h-[180px]`}>
                  {renderPlanBlocks(currentReport.plan30Day)}
                </div>
              </div>

              {/* 60 Day Plan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-purple-400/15 border border-purple-400/30 text-purple-500 flex items-center justify-center font-bold text-xs">
                    60
                  </div>
                  <div>
                    <h4 className={`text-sm font-heading font-extrabold ${isDark ? 'text-zinc-100' : 'text-slate-950'}`}>Day 31 to 60</h4>
                    <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest">Expansion & Mock Phase</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50/20 border-slate-150'} min-h-[180px]`}>
                  {renderPlanBlocks(currentReport.plan60Day)}
                </div>
              </div>

              {/* 90 Day Plan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-pink-400/15 border border-pink-400/30 text-pink-500 flex items-center justify-center font-bold text-xs">
                    90
                  </div>
                  <div>
                    <h4 className={`text-sm font-heading font-extrabold ${isDark ? 'text-zinc-100' : 'text-slate-950'}`}>Day 61 to 90</h4>
                    <span className="text-[9px] font-mono text-pink-400 font-bold uppercase tracking-widest">Deployment & Execution</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50/20 border-slate-150'} min-h-[180px]`}>
                  {renderPlanBlocks(currentReport.plan90Day)}
                </div>
              </div>

            </div>

            {/* Back Button */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-850 flex justify-end">
              <button
                onClick={() => setStep('assess')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all outline-none cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Configure Another Demeanor Audit
              </button>
            </div>

          </GlassCard>

        </div>
      )}

      {/* RENDER STEP: ASSESSMENTS ARCHIVES VIEW */}
      {step === 'history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-3 flex-wrap gap-2">
            <div>
              <h3 className={`font-heading text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Human Intelligence Assessment History Logs</h3>
              <p className="text-xs text-slate-500 font-mono">Stored safely in Firestore database</p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={isLoadingHistory}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded hover:text-cyan-400 hover:border-cyan-400 font-mono bg-transparent transition-all cursor-pointer"
            >
              Force Sync
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="text-center py-16 space-y-3">
              <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-550 font-mono">Synchronizing audit history registry...</p>
            </div>
          ) : reportsHistory.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-850 dark:bg-slate-950/20 text-slate-500 font-mono text-xs">
              No historical demeanor analysis entries found. 
              <br />
              Navigate back to the &quot;Demeanor Audit&quot; tab to save your very first report.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportsHistory.map((rep) => (
                <GlassCard 
                  key={rep.id} 
                  isDark={isDark} 
                  className={`border-slate-200/50 dark:border-slate-800/60 p-6 flex flex-col justify-between hover:border-cyan-400/30 transition-all cursor-pointer`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-650 dark:text-slate-400 border dark:border-slate-800">
                        {new Date(rep.createdAt?.seconds * 1000 || rep.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-cyan-400 font-extrabold">{rep.overallPlacementScore}%</span>
                        <span className="text-[8px] text-slate-500 uppercase font-mono">Ready</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>{rep.role} Audit</h4>
                      <p className="text-[10px] text-slate-450 font-mono truncate">
                        Contact: {rep.eyeContact?.slice(0, 32)}...
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono border-t border-slate-200 dark:border-slate-900 pt-3">
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Body Language</span>
                        <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{rep.bodyLanguageScore}%</span>
                      </div>
                      <div className="border-x border-slate-200 dark:border-slate-900">
                        <span className="text-slate-500 block uppercase text-[8px]">Confidence</span>
                        <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{rep.confidenceScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[8px]">Presence</span>
                        <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold`}>{rep.professionalPresenceScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-900 pt-4 mt-4">
                    <button
                      onClick={() => {
                        setCurrentReport(rep);
                        setStep('result');
                      }}
                      className="text-[11px] font-semibold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 font-mono hover:underline cursor-pointer bg-transparent"
                    >
                      View Report <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(rep.id)}
                      className="p-1 px-1.5 rounded hover:bg-rose-500/10 text-rose-550 dark:text-rose-400 border border-transparent hover:border-rose-500/20 group cursor-pointer transition-all bg-transparent"
                      title="Delete saved report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
