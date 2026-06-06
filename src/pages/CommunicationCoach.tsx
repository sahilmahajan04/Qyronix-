import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  MessageSquareCode, 
  Gauge, 
  Award, 
  ChevronRight, 
  Cpu, 
  TrendingUp, 
  RotateCcw, 
  BookOpen,
  Volume2,
  Calendar,
  Layers,
  ArrowRight,
  ListRestart
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import GlassCard from '../components/GlassCard';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface CoachAnalysis {
  id: string;
  userId: string;
  text: string;
  targetContext: string;
  communicationScore: number;
  confidenceScore: number;
  grammarCorrection: string;
  vocabularySuggestions: string[];
  pronunciationAnalysis: string;
  speakingConfidenceAnalysis: string;
  professionalSuggestions: string[];
  improvementRoadmap: string;
  createdAt: string;
}

export default function CommunicationCoach({ isDark }: { isDark: boolean }) {
  const [text, setText] = useState('');
  const [targetContext, setTargetContext] = useState('Senior Technical Board meeting');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CoachAnalysis | null>(null);
  
  // History lists state
  const [coachHistory, setCoachHistory] = useState<CoachAnalysis[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Simulated Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionRef = useRef<any>(null);

  const handleFirestoreErrorLocal = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
      }
    };
    console.error('Firestore coach Error context detail:', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  // Speaks out professional recommendations
  const speakTip = (tip: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(tip);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Linguistic tip compilation failed:', e);
    }
  };

  // Speech Recognition listener
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Rec error:', e);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const fetchHistoryLogs = async () => {
    if (!auth.currentUser) return;
    setHistoryLoading(true);
    // Since we're using reports/ collection with customized shape schemas or custom coach mapping
    const cacheKey = `qyronix_coach_${auth.currentUser.uid}`;
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        setCoachHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Could not restore coach local lists cache:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryLogs();
  }, []);

  // Format record duration
  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleRecord = () => {
    if (!SpeechRecognition) {
      // Simulate recordings
      setIsRecording(!isRecording);
      if (!isRecording) {
        setRecordDuration(0);
        recTimerRef.current = setInterval(() => {
          setRecordDuration(prev => prev + 1);
        }, 1000);
        
        // Feed mock transcript chunks
        setTimeout(() => {
          setText(prev => prev + (prev ? " " : "") + "Basically, there was a bug on the production database. So I went ahead and optimized the query and it runs in like thirty milliseconds now, which is super fast.");
          setIsRecording(false);
          if (recTimerRef.current) clearInterval(recTimerRef.current);
        }, 5000);
      } else {
        if (recTimerRef.current) clearInterval(recTimerRef.current);
        setIsRecording(false);
      }
      return;
    }

    try {
      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
        if (recTimerRef.current) clearInterval(recTimerRef.current);
      } else {
        setText('');
        setRecordDuration(0);
        recognitionRef.current.start();
        setIsRecording(true);
        recTimerRef.current = setInterval(() => {
          setRecordDuration(prev => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.error('Mic toggle capture error:', err);
      setIsRecording(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true);

    try {
      const response = await fetch('/api/coach/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim(),
          targetContext
        })
      });

      const metrics = await response.json();

      const newAnalysis: CoachAnalysis = {
        id: `coach-${Date.now()}`,
        userId: auth.currentUser?.uid || 'anonymous',
        text: text.trim(),
        targetContext,
        communicationScore: metrics.communicationScore || 75,
        confidenceScore: metrics.confidenceScore || 75,
        grammarCorrection: metrics.grammarCorrection || '',
        vocabularySuggestions: metrics.vocabularySuggestions || [],
        pronunciationAnalysis: metrics.pronunciationAnalysis || '',
        speakingConfidenceAnalysis: metrics.speakingConfidenceAnalysis || '',
        professionalSuggestions: metrics.professionalSuggestions || [],
        improvementRoadmap: metrics.improvementRoadmap || '',
        createdAt: new Date().toISOString()
      };

      setAnalysisResult(newAnalysis);

      // Save to local list for cache persistence
      if (auth.currentUser) {
        const cacheKey = `qyronix_coach_${auth.currentUser.uid}`;
        const updatedList = [newAnalysis, ...coachHistory.slice(0, 19)];
        localStorage.setItem(cacheKey, JSON.stringify(updatedList));
        setCoachHistory(updatedList);
      }

    } catch (err) {
      console.error('Error conducting coaching audit:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteCoachRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Prune this historical communication coaching report?')) return;
    if (auth.currentUser) {
      const cacheKey = `qyronix_coach_${auth.currentUser.uid}`;
      const filtered = coachHistory.filter(c => c.id !== id);
      localStorage.setItem(cacheKey, JSON.stringify(filtered));
      setCoachHistory(filtered);
      if (analysisResult?.id === id) {
        setAnalysisResult(null);
      }
    }
  };

  const renderCleanCoachMarkdown = (rawText: string) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    return (
      <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
        {lines.map((line, d) => {
          let cleanLine = line.trim();
          if (cleanLine.startsWith('###')) {
            return <h5 key={d} className="font-bold text-xs uppercase tracking-wider text-cyan-400 mt-4 mb-1">{cleanLine.replace('###', '')}</h5>;
          }
          if (cleanLine.startsWith('##')) {
            return <h4 key={d} className="font-bold text-sm tracking-wide text-white mt-5 mb-1 border-b border-slate-900 pb-1">{cleanLine.replace('##', '')}</h4>;
          }
          if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
            return (
              <ul key={d} className="list-disc pl-5 space-y-1 my-1 text-slate-350">
                <li>{cleanLine.substring(1).trim()}</li>
              </ul>
            );
          }
          if (cleanLine.match(/^\d+\./)) {
            return <div key={d} className="pl-4 font-mono text-slate-400 my-1">{cleanLine}</div>;
          }
          return <p key={d} className="my-1">{cleanLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* COOPERATIVE PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUT AND MIC ACTION CAPTURES SECTION */}
        <div className="lg:col-span-2 space-y-8">
          
          <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 space-y-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquareCode className="h-5 w-5 text-indigo-400 animate-pulse" />
                  Continuous Communication Coach
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                  Lexical Matrix v2.1
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-normal">
                Speak or paste any textual response (e.g. mock behavioral questions, elevator pitches, or dynamic project reports) to run an immediate quantum semantic audit.
              </p>
            </div>

            {/* PRE-SELECT CONTEXT MODE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-450 mb-1.5">Desired Professional Objective</label>
                <select
                  value={targetContext}
                  onChange={(e) => setTargetContext(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs sm:text-sm text-slate-300 font-sans cursor-pointer focus:border-indigo-400 focus:outline-none"
                >
                  <option value="Executive Suite Boardroom Meeting">Executive Board Meeting Prep</option>
                  <option value="Staff engineer architectural systemic design drill">Staff Engineer Systemic Design</option>
                  <option value="HR cultural fit self-presentation introduction">HR Cultural Self-Intro Pitch</option>
                  <option value="Dynamic daily standup project update sprint review">Compact Team Lead Sync</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-450 mb-1.5">Microphone Dictation Feed</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleRecord}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-mono font-bold uppercase transition-all flex-grow justify-center cursor-pointer ${
                      isRecording 
                        ? 'bg-red-500/20 border border-red-500 animate-pulse text-red-400' 
                        : 'bg-slate-950 border border-slate-800 hover:border-indigo-400 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-3.5 w-3.5" /> Recording {formatSecs(recordDuration)}
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5 text-indigo-450" /> Initiate Speak Capture
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* TRANSCRIPTION/COPY TEXT SEGMENT */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-450">
                <span>Compose or dictates assessment draft</span>
                <span>{text.split(/\s+/).filter(Boolean).length} absolute words</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-44 p-4 rounded-xl border border-slate-805 bg-slate-950/40 text-xs sm:text-sm text-slate-250 placeholder-slate-650 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400/20 leading-relaxed font-sans"
                placeholder="Basically, are there any key highlights you'd like to analyze? Or click 'Initiate Speak Capture' to directly capture spoken enunciation details..."
              />
            </div>

            {/* TRIGGER CTA */}
            <button
              onClick={handleRunAnalysis}
              disabled={!text.trim() || analyzing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-black hover:text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-white animate-spin" />
                  Running Lexical Syntactic Audit...
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" /> Analyze Phrasing Mechanics
                </>
              )}
            </button>
          </GlassCard>

          {/* ACTIVE COACHING EVALUATION OUTPUT */}
          <AnimatePresence mode="wait">
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-8"
              >
                {/* DOUBLE PROGRESS GRADIENTS CARD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                  
                  {/* RADIAL SCORE A */}
                  <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between items-center text-center">
                    <span className="text-[9px] font-mono text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded font-bold">Linguistic Index</span>
                    
                    <div className="relative flex items-center justify-center my-6">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="46" fill="transparent" stroke="#111827" strokeWidth="8" />
                        <circle 
                          cx="56" 
                          cy="56" 
                          r="46" 
                          fill="transparent" 
                          stroke="#a855f7" 
                          strokeWidth="8" 
                          strokeDasharray={2 * Math.PI * 46}
                          strokeDashoffset={2 * Math.PI * 46 * (1 - analysisResult.communicationScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xl font-bold font-mono text-white">{analysisResult.communicationScore}%</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-300 font-sans uppercase">Communication Clarity</h4>
                  </GlassCard>

                  {/* RADIAL SCORE B */}
                  <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 flex flex-col justify-between items-center text-center">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded font-bold">Assertiveness Core</span>
                    
                    <div className="relative flex items-center justify-center my-6">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="46" fill="transparent" stroke="#111827" strokeWidth="8" />
                        <circle 
                          cx="56" 
                          cy="56" 
                          r="46" 
                          fill="transparent" 
                          stroke="#06b6d4" 
                          strokeWidth="8" 
                          strokeDasharray={2 * Math.PI * 46}
                          strokeDashoffset={2 * Math.PI * 46 * (1 - analysisResult.confidenceScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xl font-bold font-mono text-white">{analysisResult.confidenceScore}%</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-300 font-sans uppercase">Acoustic & Structural Integrity</h4>
                  </GlassCard>

                </div>

                {/* DETAILED DRILLS DEEP DIVE */}
                <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 space-y-6">
                  
                  {/* Grammar Table/Markdown Block */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-indigo-500/10 pb-2">
                      <Layers className="h-4 w-4 text-indigo-400" />
                      Grammitical & syntactic corrections
                    </h4>
                    <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-xs text-slate-300 font-mono">
                      {renderCleanCoachMarkdown(analysisResult.grammarCorrection)}
                    </div>
                  </div>

                  {/* Vocabulary alternatives upgraded list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-cyan-500/10 pb-2">
                      <Award className="h-4 w-4 text-cyan-400" />
                      Enhanced lexical equivalents
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {analysisResult.vocabularySuggestions.map((term, codeIdx) => (
                        <div 
                          key={codeIdx}
                          className="p-3 rounded-lg border border-slate-900 bg-slate-950/40 text-[10px] font-mono text-slate-300 hover:border-cyan-500/20 hover:bg-slate-950/80 transition-colors"
                        >
                          <span className="text-cyan-400 block font-bold mb-1">Upgrade option #{codeIdx + 1}:</span>
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spoken Enunciation rhythm & Pacing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 p-4 rounded-xl border border-slate-900 bg-slate-950/30">
                      <span className="text-[9px] font-mono text-amber-500 block uppercase font-bold">Vocal enunciation & acoustics analysis</span>
                      <p className="text-xs text-slate-400 leading-relaxed font-mono">
                        {analysisResult.pronunciationAnalysis}
                      </p>
                    </div>

                    <div className="space-y-2 p-4 rounded-xl border border-slate-900 bg-slate-950/30">
                      <span className="text-[9px] font-mono text-purple-400 block uppercase font-bold">Declarative speech assertiveness review</span>
                      <p className="text-xs text-slate-400 leading-relaxed font-mono">
                        {analysisResult.speakingConfidenceAnalysis}
                      </p>
                    </div>
                  </div>

                  {/* Professional suggestions interactive list */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-mono text-slate-450 uppercase tracking-widest block">Alternate corporate workspace equivalent phrasings:</span>
                    <div className="space-y-2">
                      {analysisResult.professionalSuggestions.map((tip, idx) => (
                        <div 
                          key={idx}
                          onClick={() => speakTip(tip)}
                          className="p-3 rounded-lg border border-slate-900 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-300 hover:border-slate-750 hover:bg-slate-950 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-cyan-400 font-bold font-sans">#</span>
                            <span className="text-[11px] leading-tight group-hover:text-cyan-300">{tip}</span>
                          </div>
                          <Volume2 className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Step Roadmap */}
                  <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/35 space-y-3">
                    <span className="text-xs font-mono font-bold text-purple-400 block uppercase">Personal development roadmap actions</span>
                    <div className="text-xs text-slate-300 font-mono leading-relaxed pl-1">
                      {renderCleanCoachMarkdown(analysisResult.improvementRoadmap)}
                    </div>
                  </div>

                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RECENT HISTORIC COACH RECORDS LISTS */}
        <div className="space-y-6">
          <GlassCard isDark={isDark} className="p-6 border-slate-200/40 dark:border-slate-800/60 bg-slate-950/20 space-y-4">
            <div>
              <h4 className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-indigo-400" />
                Historic Coach runs archive
              </h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">Quick cached diagnostic files</p>
            </div>

            {historyLoading ? (
              <p className="text-center py-6 text-xs text-slate-500 font-mono animate-pulse">Requesting list logs...</p>
            ) : coachHistory.length === 0 ? (
              <p className="text-center py-12 text-[10px] text-slate-600 font-mono uppercase">No coached histories yet</p>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {coachHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setAnalysisResult(item);
                      setText(item.text);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      analysisResult?.id === item.id 
                        ? 'border-indigo-500 bg-indigo-950/5 text-slate-200' 
                        : 'border-slate-900 bg-slate-950 hover:border-slate-750 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="text-indigo-400 font-bold">Score {item.communicationScore}%</span>
                    </div>
                    <p className="text-xs font-bold text-white font-heading truncate mt-1">
                      Goal: {item.targetContext.split(' ').slice(0, 3).join(' ')}...
                    </p>
                    <p className="text-[10px] font-mono text-slate-450 line-clamp-1 mt-0.5">
                      &apos;{item.text}&apos;
                    </p>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={(e) => handleDeleteCoachRecord(item.id, e)}
                        className="text-[8px] font-mono uppercase text-red-500 hover:text-red-400 cursor-pointer"
                      >
                        Delete log
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
