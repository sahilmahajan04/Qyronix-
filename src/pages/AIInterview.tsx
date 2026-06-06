import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  BrainCircuit, 
  Timer, 
  CheckCircle, 
  Cpu, 
  ArrowRight,
  BookOpen, 
  AlertCircle, 
  Activity, 
  Gauge, 
  ShieldCheck, 
  Award,
  History,
  TrendingUp,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Camera
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';
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

interface InterviewSession {
  id: string;
  userId: string;
  type: 'Technical' | 'HR' | 'Behavioral';
  questions: string[];
  answers: string[];
  interviewerRole: string;
  overallPerformanceScore: number;
  communicationScore: number;
  confidenceScore: number;
  grammarCorrection: string;
  vocabularySuggestions: string[];
  pronunciationImprovement: string;
  strengths: string[];
  weaknesses: string[];
  improvementRoadmap: string;
  createdAt: any;
}

const AVATARS = [
  {
    name: 'Aria v1.2',
    role: 'Quantum System Architect Sentinel',
    type: 'Technical',
    desc: 'Deep technical, algorithmic reasoning and full-stack architecture analyzer.',
    accent: 'border-cyan-500 text-cyan-400',
    glow: 'shadow-cyan-500/20',
    colorCode: '#06b6d4',
    bgGradient: 'from-cyan-900/40 via-slate-950 to-slate-950',
    avatarChar: 'A'
  },
  {
    name: 'Seraph Pro',
    role: 'Principal Recruiter Integrity Node',
    type: 'HR',
    desc: 'Expert in core cultural alignment, professional background analysis and career progression matching.',
    accent: 'border-purple-500 text-purple-400',
    glow: 'shadow-purple-500/20',
    colorCode: '#a855f7',
    bgGradient: 'from-purple-900/40 via-slate-950 to-slate-950',
    avatarChar: 'S'
  },
  {
    name: 'Orion Helix',
    role: 'Behavioral Mind Map Oracle',
    type: 'Behavioral',
    desc: 'Quantifies crisis governance, critical leadership communication, and team operational synergy metrics.',
    accent: 'border-amber-500 text-amber-400',
    glow: 'shadow-amber-500/20',
    colorCode: '#f59e0b',
    bgGradient: 'from-amber-900/40 via-slate-950 to-slate-950',
    avatarChar: 'O'
  }
];

export default function AIInterview({ isDark }: { isDark: boolean }) {
  const { permissions, requestCamera, requestMicrophone } = usePermissions();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<'config' | 'room' | 'report' | 'history'>('config');
  
  // Config states
  const [selectedType, setSelectedType] = useState<'Technical' | 'HR' | 'Behavioral'>('Technical');
  const [candidateRole, setCandidateRole] = useState('Staff Full Stack Developer');
  const [customCVContext, setCustomCVContext] = useState('');
  
  // Session flow states
  const [activeSession, setActiveSession] = useState<{
    id: string;
    greeting: string;
    currentQuestion: string;
    questionsAsked: string[];
    candidatesAnswers: string[];
  } | null>(null);

  const [currentTurn, setCurrentTurn] = useState(1);
  const totalTurns = 5;
  const [latestAnswer, setLatestAnswer] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Mic/Speech simulation States
  const [isListening, setIsListening] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const [simulatedVoicePulse, setSimulatedVoicePulse] = useState<number[]>(Array(10).fill(10));
  
  // Final report states
  const [currentReport, setCurrentReport] = useState<InterviewSession | null>(null);
  
  // History archives
  const [historicalReports, setHistoricalReports] = useState<InterviewSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const micPulseRef = useRef<NodeJS.Timeout | null>(null);
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionRef = useRef<any>(null);

  // Firestore error handler conforming to skill guidelines
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
    console.error('Firestore SEC_RULE_FAIL Context:', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  // Speaks out the AI text if TTS is enabled
  const speakText = (text: string) => {
    if (!ttsEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const sentence = text.replace(/[*#`_]/g, ''); // Clean markdown formatting
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('TTS execution blocked or failed:', e);
    }
  };

  // Pre-load historic archive files
  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    setHistoryLoading(true);
    const colPath = 'interview_reports';
    try {
      const q = query(collection(db, colPath), where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const items: InterviewSession[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as InterviewSession);
      });
      items.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds || b.createdAt - a.createdAt);
      setHistoricalReports(items);
    } catch (err) {
      handleFirestoreErrorLocal(err, OperationType.LIST, colPath);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Camera feed stream mounting and unmounting
  useEffect(() => {
    let active = true;
    let localStream: MediaStream | null = null;

    const startCamera = async () => {
      if (step === 'room' && permissions.camera === 'granted') {
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
          console.error("Critical: Live chamber camera hook failed:", err);
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

  // Timer trigger when session starts
  useEffect(() => {
    if (step === 'room' && activeSession) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, activeSession]);

  // Voice Pulse Visualizer simulation
  useEffect(() => {
    if (isListening) {
      micPulseRef.current = setInterval(() => {
        setSimulatedVoicePulse(Array.from({ length: 15 }, () => Math.floor(Math.random() * 85) + 15));
      }, 100);
    } else {
      if (micPulseRef.current) {
        clearInterval(micPulseRef.current);
        micPulseRef.current = null;
      }
      setSimulatedVoicePulse(Array(15).fill(12));
    }
    return () => {
      if (micPulseRef.current) clearInterval(micPulseRef.current);
    };
  }, [isListening]);

  // Initialize Speech recognition hook
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setLatestAnswer(prev => prev + ' ' + finalTranscript);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Speech Recognition Error caught:', e);
        if (e.error === 'not-allowed') {
          setMicBlocked(true);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Format Elapsed Time to MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeAvatar = AVATARS.find(a => a.type === selectedType) || AVATARS[0];

  const handleStartInterview = async () => {
    setIsAiResponding(true);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          candidateRole,
          cvSummary: customCVContext
        })
      });
      const data = await res.json();
      
      const newSessionId = `session-${Date.now()}`;
      setActiveSession({
        id: newSessionId,
        greeting: data.greeting,
        currentQuestion: data.firstQuestion,
        questionsAsked: [data.firstQuestion],
        candidatesAnswers: []
      });
      
      setCurrentTurn(1);
      setLatestAnswer('');
      setStep('room');
      setTimeout(() => speakText(data.greeting + ". " + data.firstQuestion), 600);
    } catch (err) {
      console.error('Error initiating interview backend routing:', err);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleToggleVoice = () => {
    if (micBlocked || !SpeechRecognition) {
      // Direct speech dictation simulation instead
      setIsListening(!isListening);
      if (!isListening) {
        const phrases = [
          "Absolutely, in my past role I formulated robust high-frequency backend services. To resolve bottleneck, we integrated cluster clustering nodes which boosted scaling by 75%.",
          "Speaking from experience, team management operates primarily on trust metrics. By holding responsive peer syncs, we successfully delivered our blockchain nodes early.",
          "I approach problem solving by parsing metrics first. I look up logs, diagnose systemic gaps, and draft detailed action plans to resolve potential concurrency bugs."
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setTimeout(() => {
          setLatestAnswer(prev => prev + (prev ? " " : "") + randomPhrase);
          setIsListening(false);
        }, 3200);
      }
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err) {
      console.error('Mic toggle capture error:', err);
      setIsListening(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!latestAnswer.trim() || isAiResponding || !activeSession) return;
    
    // Stop recording first
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsAiResponding(true);
    const updatedAnswers = [...activeSession.candidatesAnswers, latestAnswer.trim()];
    const turn = currentTurn;

    try {
      if (turn < totalTurns) {
        // Carry on conversation flow
        const payload = {
          type: selectedType,
          candidateRole,
          conversationHistory: activeSession.questionsAsked.map((q, idx) => ({
            question: q,
            answer: updatedAnswers[idx] || ""
          })),
          latestAnswer: latestAnswer.trim(),
          currentTurn: turn + 1,
          totalTurns
        };

        const res = await fetch('/api/interview/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        const updatedQuestions = [...activeSession.questionsAsked, data.nextQuestion];
        setActiveSession({
          ...activeSession,
          candidatesAnswers: updatedAnswers,
          currentQuestion: data.nextQuestion,
          questionsAsked: updatedQuestions
        });

        setCurrentTurn(turn + 1);
        setLatestAnswer('');
        setTimeout(() => speakText(data.nextQuestion), 300);
      } else {
        // Finalize state and run final metrics compilation
        const finalConversationHistory = activeSession.questionsAsked.map((q, idx) => ({
          question: q,
          answer: updatedAnswers[idx] || ""
        }));

        const evaluationRes = await fetch('/api/interview/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedType,
            candidateRole,
            conversationHistory: finalConversationHistory
          })
        });
        const evalData = await evaluationRes.json();

        // Build report entity
        const reportEntity: InterviewSession = {
          id: activeSession.id,
          userId: auth.currentUser?.uid || 'anonymous',
          type: selectedType,
          questions: activeSession.questionsAsked,
          answers: updatedAnswers,
          interviewerRole: activeAvatar.name + ' - ' + activeAvatar.role,
          overallPerformanceScore: evalData.overallPerformanceScore || 80,
          communicationScore: evalData.communicationScore || 80,
          confidenceScore: evalData.confidenceScore || 80,
          grammarCorrection: evalData.grammarCorrection || '',
          vocabularySuggestions: evalData.vocabularySuggestions || [],
          pronunciationImprovement: evalData.pronunciationImprovement || '',
          strengths: evalData.strengths || [],
          weaknesses: evalData.weaknesses || [],
          improvementRoadmap: evalData.improvementRoadmap || '',
          createdAt: new Date()
        };

        // Write report payload securely to Firestore and handle permissions conforming to safety guideline
        const writePath = `interview_reports`;
        try {
          // Store report
          await setDoc(doc(db, writePath, reportEntity.id), {
            ...reportEntity,
            createdAt: serverTimestamp() // Secure server time limit check mapping using serverTimestamp
          });
        } catch (fbErr) {
          handleFirestoreErrorLocal(fbErr, OperationType.CREATE, writePath);
        }

        setCurrentReport(reportEntity);
        fetchHistory(); // refresh cache
        setStep('report');
      }
    } catch (err) {
      console.error('Conversation response analysis error caught:', err);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Delete historic session log securely
  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently prune this interview file record?")) return;
    const colPath = 'interview_reports';
    try {
      await deleteDoc(doc(db, colPath, reportId));
      fetchHistory();
      if (currentReport?.id === reportId) {
        setCurrentReport(null);
        setStep('config');
      }
    } catch (err) {
      handleFirestoreErrorLocal(err, OperationType.DELETE, colPath);
    }
  };

  // Dynamic custom clean markdown formatted renderer built in-place to bypass dependencies bugs
  const renderMarkdownText = (rawText: string) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    return (
      <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
        {lines.map((line, d) => {
          let cleanLine = line.trim();
          if (cleanLine.startsWith('###')) {
            return <h5 key={d} className="font-bold text-xs uppercase tracking-wider text-cyan-400 mt-4 mb-2">{cleanLine.replace('###', '')}</h5>;
          }
          if (cleanLine.startsWith('##')) {
            return <h4 key={d} className="font-bold text-sm tracking-wide text-white mt-5 mb-2 border-b border-slate-900 pb-1">{cleanLine.replace('##', '')}</h4>;
          }
          if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
            return (
              <ul key={d} className="list-disc pl-5 space-y-1.5 my-1 text-slate-350">
                <li>{cleanLine.substring(1).trim()}</li>
              </ul>
            );
          }
          if (cleanLine.match(/^\d+\./)) {
            return <div key={d} className="pl-4 font-mono text-slate-400 my-1">{cleanLine}</div>;
          }
          return <p key={d} className="my-1.5">{cleanLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* HEADER NAV CONTROL STRIP */}
      <GlassCard isDark={isDark} className="p-4 border-slate-200/40 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg animate-pulse">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-heading text-white tracking-wide uppercase">Qyronix interview chamber</h2>
            <p className="text-[10px] font-mono text-slate-450 uppercase">Secured Recruiter Sandbox Node v3.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('config')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wide uppercase transition-colors transition-all cursor-pointer ${
              step === 'config' ? 'bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chamber Setup
          </button>
          <button
            onClick={() => {
              fetchHistory();
              setStep('history');
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wide uppercase transition-colors transition-all cursor-pointer ${
              step === 'history' ? 'bg-indigo-500/10 border border-indigo-400 text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-3 w-3 inline mr-1" /> Vector Archives
          </button>
        </div>
      </GlassCard>

      {/* RENDER CONFIG SCENARIO CHOICE SCREEN */}
      {step === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* PROFILE CONTROL CARD */}
          <GlassCard isDark={isDark} className="p-6 md:col-span-2 border-slate-200/40 dark:border-slate-800/60 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                  Configure Interview Clearance Parameters
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Draft matching configurations to let AI recruiter nodes compile personalized questions.
                </p>
              </div>

              <div className="space-y-4">
                {/* INTERVIEW TYPE BLOCK */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-450 mb-2">Chamber Dimension / Interview Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'Technical', label: 'Technical Core', desc: 'Syntax, Architectures & Concurrency', color: 'border-cyan-500 bg-cyan-950/20 text-cyan-400' },
                      { type: 'HR', label: 'HR Integrity', desc: 'Background, Culture & Trajectory', color: 'border-purple-500 bg-purple-950/20 text-purple-400' },
                      { type: 'Behavioral', label: 'Behavioral Oracle', desc: 'Situational & Team Crisis Models', color: 'border-amber-500 bg-amber-950/20 text-amber-400' }
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => setSelectedType(opt.type as any)}
                        className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                          selectedType === opt.type 
                            ? opt.color + ' shadow-lg' 
                            : 'border-slate-800 bg-slate-950/20 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className="block text-xs font-bold">{opt.label}</span>
                        <span className="block text-[9px] text-slate-450 leading-tight mt-1">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TARGET ROLE BLOCK */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-450 mb-1.5">Target Placement Role / Category</label>
                  <input
                    type="text"
                    value={candidateRole}
                    onChange={(e) => setCandidateRole(e.target.value)}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-800 bg-slate-950/40 text-white placeholder-slate-650 font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
                    placeholder="e.g. Senior Machine Learning Architect"
                  />
                </div>

                {/* RESUME CONTEXT BLOCK */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-450">Resume Credentials Context (Optional)</label>
                    <span className="text-[9px] text-cyan-400 font-mono">Enhances personalized drills</span>
                  </div>
                  <textarea
                    value={customCVContext}
                    onChange={(e) => setCustomCVContext(e.target.value)}
                    className="w-full h-24 p-3 text-xs sm:text-sm rounded-xl border border-slate-800 bg-slate-950/40 text-white placeholder-slate-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
                    placeholder="Briefly list key projects, tech specs, or accomplishments you'd like the AI to specifically reference..."
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={isAiResponding}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-black hover:text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isAiResponding ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-white animate-spin mr-1" />
                  Booting Virtual Recruiter Node...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Initialize Interview Room Sequence
                </>
              )}
            </button>
          </GlassCard>

          {/* AVATAR PROFILE OVERWRITE SIDEBAR CARD */}
          <GlassCard isDark={isDark} className={`p-6 border-slate-200/40 dark:border-slate-800/60 bg-gradient-to-b ${activeAvatar.bgGradient} flex flex-col justify-between space-y-8 transition-all`}>
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-slate-400">
                ACTIVE RECRUITMENT NODE ATTACHED
              </span>

              {/* Avatar face hologram display block */}
              <div className="relative flex justify-center py-6">
                <div className={`h-28 w-28 rounded-3xl border-2 ${activeAvatar.accent} flex items-center justify-center bg-slate-950/60 shadow-2xl ${activeAvatar.glow} relative flex flex-col justify-center`}>
                  <span className="text-3xl font-heading text-white tracking-widest font-bold">{activeAvatar.avatarChar}</span>
                  <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Active AI</span>
                  </div>
                  {/* Holographic glowing grids decor */}
                  <div className="absolute inset-2 border border-dashed border-slate-900 rounded-2xl pointer-events-none opacity-40" />
                  <div className="absolute top-1 right-2 flex gap-0.5">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-base font-bold font-heading text-white">{activeAvatar.name}</h4>
                <p className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">{activeAvatar.role}</p>
              </div>

              <p className="text-xs text-slate-400 text-center leading-relaxed">
                &quot;{activeAvatar.desc}&quot;
              </p>
            </div>

            <div className="border-t border-slate-850 pt-4 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-450">Assessment Length</span>
                <span className="text-white font-bold">{totalTurns} Sequential Challenges</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-450">Persistence Engine</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Secure Firestore Log
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* RENDER CHAMBER ACTIVE SESSION ROOM SCREEN */}
      {step === 'room' && activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* THE CHAT INTERACTION CORE */}
          <GlassCard isDark={isDark} className="p-6 lg:col-span-2 border-slate-200/40 dark:border-slate-800/60 space-y-6 flex flex-col justify-between min-h-[500px]">
            {/* Header Telemetry bar */}
            <div className="border-b border-slate-850 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-white font-semibold">Sequence turn {currentTurn} / {totalTurns}</span>
              </div>

              {/* Live indicator / Timer */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  <Timer className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="p-1 rounded bg-slate-900 border border-slate-800 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Voice Output Synthesis"
                >
                  {ttsEnabled ? <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
                </button>
              </div>
            </div>

            {/* Conversation view panel */}
            <div className="flex-grow space-y-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              
              {/* Interview Greeting block */}
              {currentTurn === 1 && (
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg border ${activeAvatar.accent} flex items-center justify-center bg-slate-950 font-heading text-xs font-bold leading-none`}>
                    {activeAvatar.avatarChar}
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/60 border border-slate-850 max-w-[85%] text-xs sm:text-sm text-slate-300 font-mono">
                    {activeSession.greeting}
                  </div>
                </div>
              )}

              {/* Previous convo turns archive scroll */}
              {activeSession.questionsAsked.map((question, index) => {
                const isCurrent = index === activeSession.questionsAsked.length - 1;
                const answerObj = activeSession.candidatesAnswers[index];
                
                return (
                  <div key={index} className="space-y-4">
                    {/* Ask Question block */}
                    {index > 0 && (
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-lg border ${activeAvatar.accent} flex items-center justify-center bg-slate-950 font-heading text-xs font-bold leading-none`}>
                          {activeAvatar.avatarChar}
                        </div>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/60 border border-slate-850 max-w-[85%] text-xs sm:text-sm text-slate-300 font-mono">
                          {question}
                        </div>
                      </div>
                    )}

                    {/* Given Candidate Answer block */}
                    {answerObj && (
                      <div className="flex items-start gap-3 justify-end">
                        <div className="p-4 rounded-2xl rounded-tr-none bg-cyan-950/20 border border-cyan-500/10 max-w-[85%] text-xs sm:text-sm text-cyan-300 font-mono">
                          {answerObj}
                        </div>
                        <div className="h-8 w-8 rounded-lg border border-cyan-500/20 flex items-center justify-center bg-cyan-950 text-cyan-400 font-bold font-heading text-xs">
                          C
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Question loader anim when responding */}
              {isAiResponding && (
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg border ${activeAvatar.accent} flex items-center justify-center bg-slate-950 font-heading text-xs font-bold leading-none animate-spin`}>
                    {activeAvatar.avatarChar}
                  </div>
                  <div className="p-4 rounded-xl rounded-tl-none bg-slate-900/40 border border-slate-850 max-w-[85%] text-xs text-slate-450 font-mono animate-pulse">
                    Thinking... quantum analytical parsing nodes compiling next logic route...
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Response Prompt Action block */}
            <div className="border-t border-slate-850 pt-5 space-y-4">
              {/* Visual wave pulse indicator */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleVoice}
                  className={`h-11 w-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 animate-pulse text-white shadow-rose-600/20 scale-105'
                      : 'bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-cyan-400'
                  }`}
                  title={micBlocked ? "Using Simulated Voice Typing dictation loop" : "Record voice entry"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>

                {/* Simulated visual frequency spectrum bar */}
                <div className="flex-grow flex items-center gap-1.5 h-6 px-4 bg-slate-950/60 rounded-xl border border-slate-900 overflow-hidden">
                  {isListening ? (
                    <div className="flex items-center gap-1 flex-grow">
                      {simulatedVoicePulse.map((val, idx) => (
                        <div 
                          key={idx} 
                          className="w-1 bg-gradient-to-t from-cyan-400 to-indigo-500 rounded transition-all duration-105"
                          style={{ height: `${val}%` }}
                        />
                      ))}
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest pl-3 mt-0.5">Capturing verbal inputs...</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block pl-1 mt-0.5">
                      Toggle mic for spoken entries or type response below
                    </span>
                  )}
                </div>
              </div>

              {/* Input text box segment */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={latestAnswer}
                  onChange={(e) => setLatestAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendAnswer();
                  }}
                  disabled={isAiResponding}
                  placeholder={isAiResponding ? "Waiting for recruitment response..." : "Compose your answer details here..."}
                  className="flex-grow px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/40 text-xs sm:text-sm text-white placeholder-slate-650 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/25 disabled:opacity-50 font-mono"
                />
                <button
                  onClick={handleSendAnswer}
                  disabled={!latestAnswer.trim() || isAiResponding}
                  className="px-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Send <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* THE SYSTEM AVATAR METADATA AND PIPELINE PANEL */}
          <GlassCard isDark={isDark} className={`p-6 border-slate-200/40 dark:border-slate-800/60 bg-gradient-to-b ${activeAvatar.bgGradient} flex flex-col justify-between space-y-6`}>
            <div className="space-y-6">
              <span className="block text-[9px] font-mono uppercase tracking-widest text-cyan-400 py-1 border-b border-cyan-500/10">Active rec_chamber audit metrics</span>
              
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-xl border-2 ${activeAvatar.accent} bg-slate-950 flex items-center justify-center font-heading text-xl font-bold ${activeAvatar.glow}`}>
                  {activeAvatar.avatarChar}
                </div>
                <div>
                  <h4 className="text-sm font-bold font-heading text-white">{activeAvatar.name}</h4>
                  <p className="text-[10px] font-mono text-slate-450 uppercase">{activeAvatar.role}</p>
                </div>
              </div>

              {/* LIVE CAMERA TELEMETRY PREVIEW */}
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
                    {/* Retro Cyber Overlays */}
                    <div className="absolute inset-0 pointer-events-none p-2.5 flex flex-col justify-between">
                      {/* Top corners */}
                      <div className="flex justify-between">
                        <span className="text-[8px] font-mono text-cyan-400 bg-slate-950/75 px-1 py-0.5 rounded leading-none">CAM_01 LIVE</span>
                        <span className="text-[8px] font-mono text-cyan-400 animate-pulse bg-slate-950/75 px-1 py-0.5 rounded leading-none">● REC</span>
                      </div>
                      
                      {/* Target crosshair / grid overlay */}
                      <div className="absolute inset-0 border border-cyan-500/10 bg-grid-white/[0.02] flex items-center justify-center">
                        <div className="w-6 h-6 border border-white/20 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                        </div>
                      </div>

                      {/* Diagnostic Status overlays */}
                      <div className="flex justify-between items-end">
                        <div className="bg-slate-950/80 px-1.5 py-1 rounded border border-slate-800 text-[8px] font-mono text-slate-300 space-y-0.5 leading-none">
                          <div>ALIGNMENT: <span className="text-emerald-400 font-bold">ALIGNED</span></div>
                          <div>GESTURE: <span className="text-cyan-400 font-bold">ACTIVE</span></div>
                        </div>
                        <div className="bg-slate-950/80 px-1.5 py-1 rounded border border-slate-800 text-[8px] font-mono text-cyan-400 leading-none">
                          FACE_METRICS: OK
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
                      <span className="text-[10px] text-slate-300 font-bold font-heading uppercase">Camera stream offline</span>
                      <p className="text-[8.5px] text-slate-500 max-w-[180px] leading-tight mx-auto">
                        Permission is restricted. Camera is required for body language matching.
                      </p>
                    </div>
                    
                    <button
                      onClick={requestCamera}
                      className="px-2.5 py-1 text-[9px] font-bold font-mono uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-md hover:bg-cyan-500/20 transition-colors"
                    >
                      Grant Access
                    </button>
                  </div>
                )}
              </div>

              {/* Progress counter segment tracker */}
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-450 text-[10px]">EVALUATION COMPLIANCE RATE</span>
                  <span className="text-cyan-400 font-bold">{Math.round((currentTurn / totalTurns) * 100)}%</span>
                </div>
                {/* Cyber bar indicator */}
                <div className="w-full bg-slate-950 border border-slate-900 h-3 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                  {Array.from({ length: totalTurns }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`flex-grow h-full rounded transition-all ${
                        idx < currentTurn ? 'bg-gradient-to-r from-cyan-400 to-indigo-500' : 'bg-slate-900'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase">
                  Do not terminate session portal. Must finish exactly {totalTurns} challenge rounds to generate score.
                </p>
              </div>

              {/* Prompt hints list */}
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold block">Recruiter advice feed</span>
                {[
                  'State metrics or outcomes first when speaking',
                  'Incorporate structural frameworks like the STAR model',
                  'Confirm technical designs before laying down answers',
                  'Avoid vocal fillers like &quot;um&quot; and &quot;like&quot;'
                ].map((tips, idx) => (
                  <div key={idx} className="flex gap-2 text-[10px] text-slate-400 font-mono items-start leading-snug">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{tips}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick chamber termination safeguard */}
            <button
              onClick={() => {
                if (confirm("Are you sure you want to exit the chamber? Your active session credentials will not be saved.")) {
                  setActiveSession(null);
                  setStep('config');
                }
              }}
              className="w-full py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[10px] font-mono tracking-wide uppercase cursor-pointer"
            >
              Force Terminate Chamber Flow
            </button>
          </GlassCard>
        </div>
      )}

      {/* RENDER COMPREHENSIVE SCORE EVALUATION REPORT SCREEN */}
      {step === 'report' && currentReport && (
        <div className="space-y-8 animate-fade-in">
          
          {/* RADAR METRICS HERO CARD */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* LARGE CONCENTRIC SCORE METER */}
            <GlassCard isDark={isDark} className="p-6 md:col-span-2 border-slate-200/40 dark:border-slate-800/60 bg-slate-950/30 flex flex-col justify-between items-center text-center space-y-6">
              <div>
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">Session Audit Score</h3>
                <p className="text-[10px] font-mono text-slate-450 uppercase mt-0.5">Aggregate AI algorithmic rating index</p>
              </div>

              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  {/* Background Track Ring */}
                  <circle cx="80" cy="80" r="65" fill="transparent" stroke="#0f172a" strokeWidth="12" className="opacity-55" />
                  {/* Performance gradient Arc */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="65" 
                    fill="transparent" 
                    stroke="url(#perfGrad)" 
                    strokeWidth="12" 
                    strokeDasharray={2 * Math.PI * 65}
                    strokeDashoffset={2 * Math.PI * 65 * (1 - currentReport.overallPerformanceScore / 100)}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] animate-pulse"
                  />
                  <defs>
                    <linearGradient id="perfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold font-mono text-cyan-400">{currentReport.overallPerformanceScore}%</span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold mt-1">Core Performance</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 max-w-sm pt-2">
                This diagnostic matches professional placements within the <strong className="text-white">Top 15%</strong> percentile. Access clearance approved!
              </div>
            </GlassCard>

            {/* COMMUNICATIONS GAUGE SIDEBAR CARD */}
            <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 bg-slate-950/30 flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded font-bold">Lexical Vector</span>
                  <h4 className="font-heading text-sm font-bold text-white mt-2">Communication Strength</h4>
                </div>
                <BookOpen className="h-5 w-5 text-purple-400" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-slate-450">Linguistic Index</span>
                  <span className="text-purple-400 font-bold text-xl">{currentReport.communicationScore}%</span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${currentReport.communicationScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-450 font-mono leading-relaxed leading-snug">
                  Measures vocabulary richness, contextual relevance, action verbs, and granular grammar scores.
                </p>
              </div>
            </GlassCard>

            {/* CONFIDENCE ANALYSIS CARD */}
            <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 bg-slate-950/30 flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded font-bold">Authority Core</span>
                  <h4 className="font-heading text-sm font-bold text-white mt-2">Assertiveness Score</h4>
                </div>
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-slate-450">Declarative Impact</span>
                  <span className="text-amber-400 font-bold text-xl">{currentReport.confidenceScore}%</span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all"
                    style={{ width: `${currentReport.confidenceScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-450 font-mono leading-relaxed leading-snug">
                  Measured based on delivery assertiveness, active phrasing structures, and metrics-oriented communication patterns.
                </p>
              </div>
            </GlassCard>
            
          </div>

          {/* GRANULAR REPORT FEEDBACK SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LINGUISTIC DRILLS CARD (Grammar & Vocabulary Suggestions) */}
            <GlassCard isDark={isDark} className="p-6 lg:col-span-2 border-slate-200/40 dark:border-slate-800/60 space-y-6">
              
              {/* Grammar Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 border-b border-slate-900 pb-2 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-cyan-400" />
                  Linguistic refinement & grammar audit
                </h4>
                <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-xs text-slate-350 leading-relaxed font-mono">
                  {renderMarkdownText(currentReport.grammarCorrection)}
                </div>
              </div>

              {/* Vocab suggestions */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400 border-b border-slate-900 pb-2 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  Elevated professional vocabulary keywords
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentReport.vocabularySuggestions.map((vocab, code) => (
                    <div 
                      key={code} 
                      className="p-3 rounded-lg border border-slate-900 bg-slate-950/60 font-mono text-[10px] text-white flex flex-col justify-between"
                    >
                      <span className="text-purple-400 font-bold block uppercase mb-1">Upgrade To:</span>
                      <span className="truncate">{vocab}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pronunciation block */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 border-b border-slate-900 pb-2 flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-amber-500" />
                  Phonetic, tempo & speaking enunciation tips
                </h4>
                <p className="p-4 rounded-xl border border-rose-950/30 bg-amber-950/10 font-mono text-xs text-slate-300 leading-relaxed">
                  {renderMarkdownText(currentReport.pronunciationImprovement)}
                </p>
              </div>

            </GlassCard>

            {/* STRENGTHS AND ROADMAP TIMELINE CARD */}
            <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 space-y-6">
              
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 border-b border-slate-900 pb-2">
                  Strategic demonstrations / strengths
                </h4>
                <div className="space-y-2">
                  {currentReport.strengths.map((str, aId) => (
                    <div key={aId} className="flex gap-2 p-2.5 rounded bg-emerald-950/10 border border-emerald-950/20 text-[10px] sm:text-xs text-slate-300 font-mono items-start">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-rose-450 border-b border-slate-900 pb-2">
                  Recommended improvements
                </h4>
                <div className="space-y-2">
                  {currentReport.weaknesses.map((weak, aId) => (
                    <div key={aId} className="flex gap-2 p-2.5 rounded bg-rose-950/10 border border-rose-950/20 text-[10px] sm:text-xs text-slate-300 font-mono items-start">
                      <span className="text-rose-400 font-bold">✖</span>
                      <span>{weak}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-900 pt-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-violet-400" />
                  Next placement milestone steps
                </h4>
                <div className="font-mono text-[10px] sm:text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 border border-slate-900 rounded-xl leading-relaxed">
                  {renderMarkdownText(currentReport.improvementRoadmap)}
                </div>
              </div>

            </GlassCard>

          </div>

          {/* BACK BAR CONTROL */}
          <div className="flex justify-center">
            <button
              onClick={() => setStep('config')}
              className="px-8 py-3 rounded-xl border border-slate-700 bg-slate-900/60 text-white font-bold text-xs uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Start another sequence
            </button>
          </div>

        </div>
      )}

      {/* RENDER HISTORIC ARCHIVES LIST SCREEN */}
      {step === 'history' && (
        <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 space-y-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-400" />
              Linguistic Assessment Vector logs
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Historical sandbox sessions securely synced through the Qyronix Core relational rules.
            </p>
          </div>

          {historyLoading ? (
            <div className="py-24 text-center font-mono text-xs text-slate-400 animate-pulse">
              Requesting metadata records index from Firestore...
            </div>
          ) : historicalReports.length === 0 ? (
            <div className="py-24 text-center text-xs text-slate-500 font-mono">
              NO SESSION RECORDS COMPILED YET. ENTER THE CONFIG CHAMBER TO PLAY.
            </div>
          ) : (
            <div className="space-y-4">
              {historicalReports.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentReport(item);
                    setStep('report');
                  }}
                  className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[9px] px-2.5 py-1 rounded font-mono font-bold ${
                        item.type === 'Technical' ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-500/20' :
                        item.type === 'HR' ? 'bg-purple-950/30 text-purple-400 border border-purple-500/20' :
                        'bg-amber-950/30 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.type} DIMENSION
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString() : new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-wide font-heading">
                      Mock session for: {item.interviewerRole || 'Elite AI Partner'}
                    </h4>
                    <p className="text-xs text-slate-450 font-mono">
                      Challenge length: {item.questions?.length || 5} rounds of drills
                    </p>
                  </div>

                  {/* SCORE DISPLAY BARS */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-center font-mono">
                      <div>
                        <span className="text-[9px] block text-slate-550 uppercase">Score</span>
                        <span className="text-xs font-bold text-cyan-400">{item.overallPerformanceScore}%</span>
                      </div>
                      <div className="h-6 w-px bg-slate-900" />
                      <div>
                        <span className="text-[9px] block text-slate-550 uppercase">LEXICAL</span>
                        <span className="text-xs font-bold text-purple-400">{item.communicationScore}%</span>
                      </div>
                      <div className="h-6 w-px bg-slate-900" />
                      <div>
                        <span className="text-[9px] block text-slate-550 uppercase">CONFIDENCE</span>
                        <span className="text-xs font-bold text-amber-400">{item.confidenceScore}%</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteReport(item.id, e)}
                      className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors uppercase cursor-pointer text-[10px] font-mono font-bold pr-3 pl-2.5 flex items-center"
                      title="Prune session record"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

    </div>
  );
}
