/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Mic, 
  Bell, 
  FileText, 
  Clipboard, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { usePermissions } from '../context/PermissionContext';
import GlassCard from './GlassCard';

export default function WelcomePermissionsModal() {
  const { 
    permissions, 
    hasSeenWelcomeModal, 
    setHasSeenWelcomeModal, 
    requestCamera, 
    requestMicrophone, 
    requestNotifications, 
    requestLocation, 
    requestFiles, 
    requestClipboard 
  } = usePermissions();

  const [activeTab, setActiveTab] = useState<'request' | 'info'>('request');
  const [requestLogs, setRequestLogs] = useState<string[]>([]);
  const [requestingItem, setRequestingItem] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setRequestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGrant = async (key: string) => {
    setRequestingItem(key);
    addLog(`Requesting access to: ${key}...`);
    try {
      let result = 'prompt';
      if (key === 'camera') result = await requestCamera();
      else if (key === 'microphone') result = await requestMicrophone();
      else if (key === 'notifications') result = await requestNotifications();
      else if (key === 'location') result = await requestLocation();
      else if (key === 'files') result = await requestFiles();
      else if (key === 'clipboard') result = await requestClipboard();

      addLog(`Permission for ${key} resolved to: ${result.toUpperCase()}`);
    } catch (err: any) {
      addLog(`Error requesting ${key}: ${err.message || err}`);
    } finally {
      setRequestingItem(null);
    }
  };

  const handleGrantAllRecommended = async () => {
    addLog('Initiating recommended permissions baseline...');
    const order = ['camera', 'microphone', 'notifications', 'clipboard', 'files'];
    for (const item of order) {
      setRequestingItem(item);
      try {
        let result = 'prompt';
        if (item === 'camera') result = await requestCamera();
        else if (item === 'microphone') result = await requestMicrophone();
        else if (item === 'notifications') result = await requestNotifications();
        else if (item === 'clipboard') result = await requestClipboard();
        else if (item === 'files') result = await requestFiles();
        addLog(`Granted ${item} -> ${result.toUpperCase()}`);
      } catch (err) {
        addLog(`Failed requesting ${item}`);
      }
    }
    setRequestingItem(null);
    addLog('Baseline setup completed successfully.');
  };

  const handleDone = () => {
    setHasSeenWelcomeModal(true);
  };

  if (hasSeenWelcomeModal) return null;

  const permissionsList = [
    {
      key: 'camera',
      icon: Camera,
      title: 'High-Fidelity Camera access',
      desc: 'Used for body language analysis, posture tracking, clothing intelligence and full candidate face framing.',
      recommendText: 'Highly Recommended for Candidate Interviews',
      required: true
    },
    {
      key: 'microphone',
      icon: Mic,
      title: 'Vocals & Microphone stream',
      desc: 'Powers real-time English communication pacing alerts, audio recordings, and voice assistant transcripts.',
      recommendText: 'Highly Recommended for Communication Auditing',
      required: true
    },
    {
      key: 'notifications',
      icon: Bell,
      title: 'Workspace Notifications API',
      desc: 'Provides automated alerts for recruitment review events, upcoming mock interview invites, and profile views.',
      recommendText: 'Optional but Recommended for Recruiter Followups',
      required: false
    },
    {
      key: 'files',
      icon: FileText,
      title: 'CV & Credentials File picker',
      desc: 'Enables quick workspace uploads for PDF, DOCX resumes and candidate profile avatars to Qyronix storage.',
      recommendText: 'Required for ATS Scan & Report functions',
      required: true
    },
    {
      key: 'clipboard',
      icon: Clipboard,
      title: 'Structured Clipboard integration',
      desc: 'Permits instant workspace transfers of summary ATS scores, feedback bulletpoints, and interview metrics.',
      recommendText: 'Highly Recommended for clipboard utility',
      required: false
    },
    {
      key: 'location',
      icon: MapPin,
      title: 'Geoposition location check',
      desc: 'Assists in highlighting relevant local physical matches, regional hybrid opportunities, and local mentors.',
      recommendText: 'Requested solely on regional filter selection',
      required: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-slate-950/50 to-indigo-950/10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#04030a] border border-slate-500/15 rounded-3xl p-6 md:p-8 relative overflow-hidden text-left shadow-2xl"
      >
        {/* Glow accent */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-5 border-b border-slate-500/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-400/10 to-indigo-500/10 border border-cyan-400/20 text-cyan-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400 animate-pulse" /> Unified Security & Diagnostics Console
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-white bg-gradient-to-r from-white via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Initialize Digital Device Integration
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Qyronix requires authorized device capabilities to unlock the diagnostic interview portals, oral speech scanners, posture detectors, and file-check services.
            </p>
          </div>
          
          {/* Tab togglers */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/40 rounded-xl border border-slate-900 shrink-0 self-end md:self-center font-mono">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${
                activeTab === 'request'
                  ? 'bg-gradient-to-r from-aurora-blue to-aurora-purple text-white shadow'
                  : 'text-slate-450 hover:text-white'
              }`}
            >
              Consent Panel
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${
                activeTab === 'info'
                  ? 'bg-gradient-to-r from-aurora-blue to-aurora-purple text-white shadow'
                  : 'text-slate-450 hover:text-white'
              }`}
            >
              Trust & Privacy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 max-h-[52vh] overflow-y-auto pr-1">
          {activeTab === 'request' ? (
            <>
              {/* Detailed permissions selection */}
              <div className="lg:col-span-2 space-y-3.5">
                {permissionsList.map((item) => {
                  const status = permissions[item.key as keyof typeof permissions];
                  const Icon = item.icon;
                  
                  return (
                    <div 
                      key={item.key} 
                      className={`p-4 border rounded-2xl transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        status === 'granted' 
                          ? 'border-emerald-500/20 bg-emerald-500/[0.02]' 
                          : status === 'denied'
                          ? 'border-red-500/20 bg-red-500/[0.02]'
                          : 'border-slate-800 bg-slate-950/10'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 max-w-[80%]">
                        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                          status === 'granted'
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                            : status === 'denied'
                            ? 'border-red-500/20 bg-red-500/10 text-red-400'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white font-heading">{item.title}</span>
                            {item.required && (
                              <span className="text-[8px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 bg-yellow-500/15 border border-yellow-500/20 text-yellow-500 rounded">
                                Base Core
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-slate-450 mt-1">{item.desc}</p>
                          <span className="text-[9px] text-slate-500 tracking-wide font-medium mt-1.5 block">
                            {item.recommendText}
                          </span>
                        </div>
                      </div>

                      {/* Request status trigger */}
                      <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                        {status === 'granted' ? (
                          <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20 rounded-lg">
                            <CheckCircle className="h-3.5 w-3.5" /> APPROVED
                          </div>
                        ) : status === 'denied' ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-500 bg-red-500/10 px-2.5 py-1 border border-red-500/20 rounded-lg">
                              <AlertTriangle className="h-3.5 w-3.5" /> BLOCKED
                            </div>
                            <button
                              onClick={() => handleGrant(item.key)}
                              className="text-[9px] font-mono font-semibold text-slate-300 hover:text-white underline"
                            >
                              Retry Request
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`init-consent-${item.key}`}
                            disabled={requestingItem !== null}
                            onClick={() => handleGrant(item.key)}
                            className={`px-3 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg border border-slate-700 hover:border-cyan-400 hover:bg-slate-900 transition-all ${
                              requestingItem === item.key ? 'animate-pulse text-cyan-400 border-cyan-400' : 'text-slate-300'
                            }`}
                          >
                            {requestingItem === item.key ? 'WAITING' : 'AUTHORIZE'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action summary sidebar */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900/60 leading-normal">
                  <h3 className="text-xs font-bold font-heading text-white flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Automated Baseline Setup
                  </h3>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed mb-4">
                    Instantly request consent for the recommended package (Camera, Mic, Notifications, Clipboard, Documents) in a single unified flow.
                  </p>
                  <button
                    onClick={handleGrantAllRecommended}
                    className="w-full py-2.5 bg-gradient-to-r from-aurora-blue to-aurora-purple text-white text-[11px] font-bold rounded-xl shadow hover:brightness-115 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                  >
                    Authorize Baseline Recommended <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Console execution log trace */}
                <div className="p-4 rounded-2xl bg-black border border-slate-905 flex flex-col h-[180px]">
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-widest block mb-2">Consoles Trace Logs</span>
                  <div className="flex-1 overflow-y-auto font-mono text-[9.5px] leading-relaxed text-slate-400 space-y-1">
                    {requestLogs.length === 0 ? (
                      <span className="text-slate-600 block">Awaiting system integration commands...</span>
                    ) : (
                      requestLogs.map((log, i) => (
                        <div key={i} className="text-cyan-400/85">{log}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-3 space-y-4 text-slate-300 text-xs leading-relaxed max-w-3xl">
              <div className="p-4 border border-slate-800 bg-slate-950/20 rounded-2xl">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure Sandbox Consent Principles
                </h4>
                <p className="mb-2">
                  At Qyronix, protecting your visual, audio, spatial, and file data is our top structural priority. All media capturing features conform strictly to modern enterprise sandboxing mechanisms:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                  <li><strong>Local Pre-Evaluation Capture:</strong> Camera and speaking inputs are processed through secure client browser sandboxes. Streaming inputs never leak to unauthorized public environments and are guarded by secure Firestore rules structures.</li>
                  <li><strong>On-Demand Media Hooks:</strong> Your microphones and camera web cams are only initialized when you explicitly click <em>&quot;Start AI Assessment Session&quot;</em>. They deactivate completely immediately upon final evaluation.</li>
                  <li><strong>Strict Manual Overrides:</strong> No device inputs are ever fetched or collected without your express toggle confirmation. You may rescind or clear any permission locks instantly in the core Dashboard settings or your browser titlebar.</li>
                </ul>
              </div>

              <div className="p-4 border border-slate-800 bg-slate-950/20 rounded-2xl">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-cyan-400" /> Platform Frame constraints inside IFrames
                </h4>
                <p className="text-slate-400">
                  Because Qyronix operates as a deep diagnostic platform inside developer Sandboxes, standard browsers may restrict camera, microphone, or localization access unless explicitly granted in metadata configurations. Qyronix is fully configured with <strong>requestFramePermissions</strong> to allow safe execution. If you still see blocking faults, opening the application in a separate full browser tab bypasses any restricted environment issues immediately.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-500/10 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-[11px] leading-none text-slate-450 font-medium">
            <Info className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>You may adjust these consents at any moment in the <strong>Settings Page Registry</strong>.</span>
          </div>

          <button
            onClick={handleDone}
            className="px-6 py-2.5 bg-white text-slate-950 text-xs hover:bg-slate-150 rounded-xl font-bold transition-all hover:scale-103 active:scale-97 cursor-pointer"
          >
            Launch Qyronix Workspace
          </button>
        </div>
      </motion.div>
    </div>
  );
}
