/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Terminal, 
  HelpCircle,
  Play,
  Settings,
  X,
  Cpu
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

interface VoiceAssistantProps {
  isDark: boolean;
  onCommand: (command: 'start-interview' | 'open-dashboard' | 'upload-resume' | 'show-reports') => void;
  t: (key: string) => string;
}

export default function VoiceAssistant({ isDark, onCommand, t }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('Welcome. Tap the microphone to trigger vocal commands.');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setFeedbackText('Listening for command...');
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        setFeedbackText('Could not capture speech. Try again.');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        setTranscript(speechToText);
        handleVoiceCommand(speechToText);
      };

      recognitionRef.current = rec;
    }

    // Load synthesised voices
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const list = window.speechSynthesis.getVoices();
        setVoices(list);
        if (list.length > 0) {
          const defaultVoice = list.find(v => v.lang.includes('en')) || list[0];
          setSelectedVoice(defaultVoice.name);
        }
      }
    };

    loadVoices();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (text: string) => {
    if (isMuted) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel previous speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        const vObj = voices.find(v => v.name === selectedVoice);
        if (vObj) utterance.voice = vObj;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Recognition already active", err);
      }
    } else {
      setFeedbackText("Your browser does not support Web Speech Recognition API. Simulating typing commands.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceCommand = (text: string) => {
    const raw = text.toLowerCase();
    
    // Command 1: Start Interview
    if (raw.includes('start interview') || raw.includes('begin interview') || raw.includes('interview')) {
      setFeedbackText("Acknowledging speech command: Starting Interview Sessions...");
      speakText("Initiating your AI interview chamber right away.");
      setTimeout(() => onCommand('start-interview'), 1500);
      return;
    }

    // Command 2: Open Dashboard
    if (raw.includes('open dashboard') || raw.includes('show dashboard') || raw.includes('overview')) {
      setFeedbackText("Acknowledging speech command: Routing to Overview Mainframe...");
      speakText("Opening your portal overview workspace.");
      setTimeout(() => onCommand('open-dashboard'), 1500);
      return;
    }

    // Command 3: Upload Resume
    if (raw.includes('upload resume') || raw.includes('scan resume') || raw.includes('resume scanner')) {
      setFeedbackText("Acknowledging speech command: Directing to Quantum Scanner...");
      speakText("Directing you to the resume parsing engine.");
      setTimeout(() => onCommand('upload-resume'), 1500);
      return;
    }

    // Command 4: Show Reports
    if (raw.includes('show reports') || raw.includes('open reports') || raw.includes('view reports')) {
      setFeedbackText("Acknowledging speech command: Extracting diagnostic score files...");
      speakText("Decrypting and opening your reports log.");
      setTimeout(() => onCommand('show-reports'), 1500);
      return;
    }

    // Unrecognized commands defaults
    setFeedbackText(`Captured: "${text}". Command unrecognized. Try saying: "Start Interview" or "Open Dashboard".`);
    speakText("I captured your statement, but did not match a portal directive. Try saying, Start Interview, or Open Dashboard.");
  };

  // Simulated commands for browsers without Mic support
  const handleSimulatedCommand = (cmd: string) => {
    setTranscript(cmd);
    handleVoiceCommand(cmd);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-aurora-purple py-1 px-2 rounded bg-purple-500/5 border border-purple-500/10">
          AURORA VOCAL KERNEL
        </span>
        <h2 className="text-2xl font-heading font-bold text-white mt-1.5 flex items-center gap-2">
          <Volume2 className="h-6 w-6 text-aurora-purple animate-pulse" />
          {t('voiceAssistant')}
        </h2>
        <p className="text-xs text-slate-400">Control your recruiter pipelines, start mock sessions, and access files purely with spoken commands.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ASSISTANT CARD */}
        <div className="lg:col-span-2">
          <GlassCard isDark={isDark} className="relative overflow-hidden p-6 border border-slate-800/60 flex flex-col justify-between h-[380px]">
            {/* Visual Ring Backdrop */}
            <div className={`absolute inset-0 bg-radial from-aurora-purple/5 to-transparent pointer-events-none transition-opacity duration-500 ${isListening ? 'opacity-100' : 'opacity-0'}`} />

            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-cyan-400" />
                Vocal Signal Telemetry
              </span>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 rounded bg-slate-800/40 text-slate-400 hover:text-white transition-all cursor-pointer"
                title={isMuted ? 'Unmute Speech Synthesis' : 'Mute Speech Synthesis'}
              >
                {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5 text-cyan-400" />}
              </button>
            </div>

            {/* RADAR WAVES COGNITIVE */}
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="relative flex items-center justify-center">
                {isListening && (
                  <>
                    <motion.span 
                      animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="absolute h-16 w-16 rounded-full bg-cyan-400/35 border border-cyan-400/30" 
                    />
                    <motion.span 
                      animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      className="absolute h-16 w-16 rounded-full bg-aurora-purple/20 border border-aurora-purple/30" 
                    />
                  </>
                )}
                
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`h-16 w-16 rounded-full transition-all flex items-center justify-center shadow-lg cursor-pointer ${
                    isListening 
                      ? 'bg-gradient-to-tr from-cyan-400 to-aurora-blue text-white ring-4 ring-cyan-500/20' 
                      : 'bg-[#0f0e21] border border-slate-850 hover:bg-[#1a1738] text-slate-300'
                  }`}
                >
                  {isListening ? <Mic className="h-7 w-7 animate-pulse text-white" /> : <MicOff className="h-7 w-7" />}
                </button>
              </div>

              <div className="text-center">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  {isListening ? 'MICROPHONE STREAM ACTIVE' : 'TAP MIC & DEClARE COMMAND'}
                </span>
              </div>
            </div>

            {/* LIVE CONSOLE READOUT */}
            <div className="bg-[#05040a] rounded-xl p-4 border border-slate-850/80 z-10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                Vocal Transcription & Instructions
              </div>
              <div className="min-h-[48px] text-xs font-mono space-y-1">
                {transcript && (
                  <p className="text-cyan-400">
                    <span className="text-slate-500">Candidate Speech:</span> &quot;{transcript}&quot;
                  </p>
                )}
                <p className="text-slate-300">
                  <span className="text-slate-500">AI Response:</span> {feedbackText}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* COMMANDS DESK */}
        <div className="lg:col-span-1">
          <GlassCard isDark={isDark} className="border border-slate-800/60 p-6 flex flex-col justify-between h-[380px]">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4">
                <HelpCircle className="h-4.5 w-4.5 text-aurora-purple" />
                {t('voiceCommands')}
              </h3>

              <p className="text-xs text-slate-400 mb-4">
                Speak any of these vocal instructions to navigate or activate subsegments:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleSimulatedCommand('Start Interview')}
                  className="w-full text-left p-2.5 rounded-lg border dark:border-slate-850 dark:bg-slate-950/40 hover:border-cyan-500/20 text-xs font-mono flex justify-between items-center text-slate-300 transition-all cursor-pointer hover:bg-cyan-500/5 group"
                >
                  <span>&quot;Start Interview&quot;</span>
                  <Play className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>

                <button
                  onClick={() => handleSimulatedCommand('Open Dashboard')}
                  className="w-full text-left p-2.5 rounded-lg border dark:border-slate-850 dark:bg-slate-950/40 hover:border-cyan-500/20 text-xs font-mono flex justify-between items-center text-slate-300 transition-all cursor-pointer hover:bg-cyan-500/5 group"
                >
                  <span>&quot;Open Dashboard&quot;</span>
                  <Play className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>

                <button
                  onClick={() => handleSimulatedCommand('Upload Resume')}
                  className="w-full text-left p-2.5 rounded-lg border dark:border-slate-850 dark:bg-slate-950/40 hover:border-cyan-500/20 text-xs font-mono flex justify-between items-center text-slate-300 transition-all cursor-pointer hover:bg-cyan-500/5 group"
                >
                  <span>&quot;Upload Resume&quot;</span>
                  <Play className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>

                <button
                  onClick={() => handleSimulatedCommand('Show Reports')}
                  className="w-full text-left p-2.5 rounded-lg border dark:border-slate-850 dark:bg-slate-950/40 hover:border-cyan-500/20 text-xs font-mono flex justify-between items-center text-slate-300 transition-all cursor-pointer hover:bg-cyan-500/5 group"
                >
                  <span>&quot;Show Reports&quot;</span>
                  <Play className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono text-center">
              WebkitSpeechRecognition API active
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
