/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  Mic, 
  Bell, 
  FileText, 
  Clipboard, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Lock, 
  RefreshCw,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usePermissions } from '../context/PermissionContext';
import GlassCard from './GlassCard';

export default function PermissionsDashboard({ isDark }: { isDark: boolean }) {
  const { 
    permissions, 
    requestCamera, 
    requestMicrophone, 
    requestNotifications, 
    requestLocation, 
    requestFiles, 
    requestClipboard,
    resetPermissions,
    syncAllPermissions,
    isIframe
  } = usePermissions();

  const [expandedManual, setExpandedManual] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  const handleSync = async () => {
    setSyncing(true);
    await syncAllPermissions();
    setTimeout(() => setSyncing(false), 600);
  };

  const handleRequest = async (key: string) => {
    if (key === 'camera') await requestCamera();
    else if (key === 'microphone') await requestMicrophone();
    else if (key === 'notifications') await requestNotifications();
    else if (key === 'location') await requestLocation();
    else if (key === 'files') await requestFiles();
    else if (key === 'clipboard') await requestClipboard();
  };

  const toggleManual = (key: string) => {
    setExpandedManual(prev => prev === key ? null : key);
  };

  const keys = [
    {
      id: 'camera',
      icon: Camera,
      title: 'High-Fidelity Camera Access',
      desc: 'Drives face positioning, facial expressions, skeletal gestures and postural feedback assessments.',
      whyNeeded: 'Crucial for Candidate Mock Interviews and Body Language Coaching audits. It enables immediate compliance feedback during virtual interview simulations.',
      standardInstructions: 'In Chrome/Firefox, click the "Lock/Tune" icon beside the URL in your browser address bar. Under Site Settings, set Camera to Allowed, then refresh.'
    },
    {
      id: 'microphone',
      icon: Mic,
      title: 'Vocal Stream & Microphone Capture',
      desc: 'Permits speech recordings, oral response checks, and voice commands dictation.',
      whyNeeded: 'Powers real-time English communication coach transcripts, syllable pacing metrics, and vocal voice assistants.',
      standardInstructions: 'Click the padlock icon on the Left side of the browser URL bar. Choose site settings, change Microphone from blocked to Allow, and reload the workspace.'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Automated Site Notifications API',
      desc: 'Enables high-priority push events, candidate profile view updates, and interview invites.',
      whyNeeded: 'Dispatches instant alerts for interview completions, recruiter inquiries, scoring outputs, and scheduled mentoring sessions.',
      standardInstructions: 'In your browser Address bar, select the settings padlock or Site Tune controls. Choose Notifications and select Allowed from the dropdown.'
    },
    {
      id: 'files',
      icon: FileText,
      title: 'Candidate CV & Documents File System',
      desc: 'Grants selection of local PDF and Word credentials for automated upload scanners.',
      whyNeeded: 'Supports importing resume credentials for detailed ATS evaluations, score calculations, and profile image uploads.',
      standardInstructions: 'Since standard files utilize reactive user click selectors (input elements), browser access is naturally sandboxed. Restricting it merely halts scanner imports.'
    },
    {
      id: 'clipboard',
      icon: Clipboard,
      title: 'Dynamic Clipboard Sync API',
      desc: 'Furnishes instant copy actions for scoring transcripts, feedback segments, and roadmaps.',
      whyNeeded: 'Permits candidate-recruiter teams to instantly capture evaluated scorecard lists, resume keywords, and diagnostic reports to their devices.',
      standardInstructions: 'Copy operations are generally permitted. If pasting values in is blocked by your browser, enable the clipboard permission via the browser settings menu.'
    },
    {
      id: 'location',
      icon: MapPin,
      title: 'Job Location Metadata Diagnostics',
      desc: 'Finds regional mentor accounts and highlights hyper-local hybrid job listings.',
      whyNeeded: 'Leverages device geo-position parameters to arrange proximity-matched job proposals and physically near mentors.',
      standardInstructions: 'Browser will prompt for location parameters strictly on request. Click Allow when prompted, or edit the location setting via the URL locks panel if blocked.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-heading">
              <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" /> Authorized Hardware & Site Consents
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
              Inspect current digital permissions configured for this workspace session. Some services are restricted if run within sandboxed environments (iframes).
            </p>
          </div>
          
          <div className="flex items-center gap-2 font-mono">
            <button
              id="permissions-sync-btn"
              onClick={handleSync}
              disabled={syncing}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                isDark 
                  ? 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin text-cyan-400' : ''}`} />
              Sync Sensors
            </button>
            <button
              id="permissions-reset-all-btn"
              onClick={resetPermissions}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all`}
            >
              Reset Cache
            </button>
          </div>
        </div>

        {isIframe && (
          <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl flex items-start gap-2.5 text-[10.5px]">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5">Sandboxed execution detected (Iframe context):</strong>
              Browser sensors may restrict hardware components inside embedded previews. For authentic device access, consider utilizing the <span className="font-semibold text-white">Open in New Tab</span> portal option in the upper top bar.
            </div>
          </div>
        )}
      </div>

      {/* Grid of permissions list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keys.map((perm) => {
          const status = permissions[perm.id as keyof typeof permissions] || 'prompt';
          const Icon = perm.icon;
          const isManualOpen = expandedManual === perm.id;

          return (
            <div 
              key={perm.id}
              className={`p-4 rounded-2xl border transition-all ${
                isDark 
                  ? 'bg-slate-950/30 border-slate-900/60' 
                  : 'bg-white border-slate-200'
              } ${
                status === 'granted' 
                  ? 'border-emerald-500/10' 
                  : status === 'denied' 
                  ? 'border-red-500/10' 
                  : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${
                    status === 'granted'
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                      : status === 'denied'
                      ? 'border-red-500/20 bg-red-500/5 text-red-4005 text-red-400'
                      : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white font-heading">{perm.title}</h5>
                    <p className={`text-[10px] leading-relaxed mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {perm.desc}
                    </p>
                  </div>
                </div>

                {/* Microstatus badge */}
                <div className="shrink-0">
                  {status === 'granted' ? (
                    <span className="inline-flex text-[8px] tracking-wider uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                      Granted
                    </span>
                  ) : status === 'denied' ? (
                    <span className="inline-flex text-[8px] tracking-wider uppercase font-mono font-bold px-2 py-0.5 rounded bg-red-500/15 border border-red-500/25 text-red-450">
                      Denied
                    </span>
                  ) : (
                    <span className="inline-flex text-[8px] tracking-wider uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
                      Access Requested
                    </span>
                  )}
                </div>
              </div>

              {/* Functional explanations */}
              <div className="mt-3 pt-3 border-t border-slate-500/5 space-y-2">
                <div className="text-[10px] font-sans leading-relaxed text-slate-450 bg-slate-950/20 p-2 rounded-xl border border-slate-900/40">
                  <span className="font-semibold text-slate-300 block mb-0.5">Workflow Integration:</span>
                  {perm.whyNeeded}
                </div>

                {/* Call to Actions */}
                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  {status === 'denied' ? (
                    <button
                      onClick={() => toggleManual(perm.id)}
                      className="inline-flex items-center gap-1 text-[9px] text-slate-400 hover:text-white transition-all font-mono uppercase font-semibold"
                    >
                      {isManualOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {isManualOpen ? 'Hide Instructions' : 'Manual Override'}
                    </button>
                  ) : (
                    <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1 uppercase">
                      <Lock className="h-3 w-3" /> System Secures
                    </div>
                  )}

                  <button
                    onClick={() => handleRequest(perm.id)}
                    className={`px-3 py-1.5 text-[9.5px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all ${
                      status === 'granted'
                        ? 'bg-slate-900/50 text-slate-400 border border-slate-800/80 cursor-not-allowed'
                        : status === 'denied'
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-slate-900'
                        : 'border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-400 hover:border-cyan-400 cursor-pointer'
                    }`}
                    disabled={status === 'granted'}
                  >
                    {status === 'granted' ? 'Authorized ✓' : status === 'denied' ? 'Re-Request ↻' : 'Activate Probe'}
                  </button>
                </div>

                {/* Expandable User Manual instructions */}
                {isManualOpen && status === 'denied' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-red-500/[0.02] border border-red-500/10 rounded-xl space-y-2 mt-2"
                  >
                    <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed font-sans">
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block mb-0.5">Instruction Manual for blocked status:</strong>
                        Your browser or operational system is current blocking access requests. Sites must respect your privacy. Follow these instructions to override:
                        <p className="mt-1.5 text-slate-300 font-mono text-[9.5px] p-2 bg-slate-950 rounded-lg">
                          {perm.standardInstructions}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
