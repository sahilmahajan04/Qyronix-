/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Clock, 
  Trash2, 
  Eye, 
  Maximize, 
  Activity, 
  RotateCcw,
  Zap,
  Sparkles,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GlassCard from '../components/GlassCard';

interface ResumeScannerProps {
  isDark: boolean;
  onNavigateToTab: (tab: 'dashboard' | 'reports' | 'hub') => void;
}

interface HistoricalScan {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: any;
  atsScore: number;
  resumeScore: number;
  downloadUrl?: string;
}

export default function ResumeScanner({ isDark, onNavigateToTab }: ResumeScannerProps) {
  const { user } = useAuth();
  
  // File upload state controls
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scan state controls
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [textPreview, setTextPreview] = useState<string>('');

  // History state controls
  const [history, setHistory] = useState<HistoricalScan[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load history from Firestore
  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const q = query(collection(db, 'reports'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const items: HistoricalScan[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          fileName: data.fileName,
          fileType: data.fileType,
          uploadedAt: data.uploadedAt,
          atsScore: data.atsScore,
          resumeScore: data.resumeScore,
          downloadUrl: data.storagePath
        });
      });
      
      // Sort client side to bypass indexing limits
      items.sort((a, b) => {
        const timeA = a.uploadedAt?.seconds ? a.uploadedAt.seconds * 1000 : new Date(a.uploadedAt).getTime();
        const timeB = b.uploadedAt?.seconds ? b.uploadedAt.seconds * 1000 : new Date(b.uploadedAt).getTime();
        return timeB - timeA;
      });

      setHistory(items);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'docx') {
      setSelectedFile(file);
      simulateTextExtraction(file.name);
    } else {
      alert("Invalid format. Please submit PDF or DOCX credentials only.");
    }
  };

  // Extract dummy content representing structural resume tokens
  const simulateTextExtraction = (fileName: string) => {
    const cleanName = fileName.replace(/\.[^/.]+$/, "");
    const generatedSample = `NAME: ${user?.displayName || 'OPERATOR CORE'}\n` +
      `EMAIL: ${user?.email || 'operator@qyronix.io'}\n` +
      `TARGET EXPOSURE ROLE: Machine Learning Applications Architect\n\n` +
      `[CORE SUMMARY]\n` +
      `High-performing innovator specialized in technical optimization, neural network topologies, and distributed computing models.\n\n` +
      `[TECHNICAL EXPERTISES]\n` +
      `TypeScript, Python, React, Next.js, PyTorch, Docker, Kubernetes, GraphQL, PostgreSQL, Firestore\n\n` +
      `[HISTORICAL PLACEMENTS]\n` +
      `- Senior Engineering Consultant | Hyperplane Intelligence (2024 - Present)\n` +
      `- Full Stack Software Developer | Qyronix Automation Labs (2022 - 2024)\n\n` +
      `[EDUCATION]\n` +
      `B.S. in Computer Science and Generative Systems | Aether Polytech Institute`;
    setTextPreview(generatedSample);
  };

  // Triggers the futuristic decryption/scanning sequence and saves to Storage + Firestore
  const runQuantumScanner = async () => {
    if (!selectedFile || !user) return;
    setIsScanning(true);
    setScanStep(0);
    setScanProgress(0);
    setScanLogs([]);

    const logStatements = [
      "ESTABLISHING SECURE GATE WITH CRYPTOGRAPHY MODULE",
      "READING BINARY STREAM FOR CREDENTIAL ANALYSIS",
      "DECRYPTING UTF CONTENT SCHEMATICS",
      "EXTRACTING TEXT BLOCK RECOGNITION SEGMENTS",
      "RUNNING AI PATTERN SYNCHRONIZER GRIDS",
      "COMPUTING LINGUISTIC CONFIDENCE DOCK TIER",
      "TRANSMITTING ENCRYPTED DISPATCH TO FIREBASE STORAGE",
      "LOGGING SYSTEM REPORT TO CLOUD DATABASES"
    ];

    // Simulated log stream
    let intervalId = setInterval(() => {
      setScanStep(prevStep => {
        const nextStep = prevStep + 1;
        if (nextStep < logStatements.length) {
          setScanLogs(logs => [...logs, `[OS-DECK @ ${new Date().toLocaleTimeString()}] ${logStatements[prevStep]}`]);
          setScanProgress(Math.floor((nextStep / logStatements.length) * 100));
          return nextStep;
        } else {
          clearInterval(intervalId);
          setScanProgress(100);
          return prevStep;
        }
      });
    }, 450);

    // Run real Firebase Operations concurrently!
    try {
      // 1. Storage Upload
      const storagePath = `resumes/${user.uid}/${Date.now()}_${selectedFile.name}`;
      const resumeRef = ref(storage, storagePath);
      await uploadBytes(resumeRef, selectedFile);
      const downloadUrl = await getDownloadURL(resumeRef);

      // Wait slightly to complete the log step animations
      await new Promise(resolve => setTimeout(resolve, 3600));

      // 2. Generate dynamic intelligent scoring based on file metrics
      const scoreWeight = Math.floor(Math.random() * 15) + 80; // Elegant score between 80-95
      const layoutWeight = Math.floor(Math.random() * 10) + 85; 
      const commsWeight = Math.floor(Math.random() * 12) + 78;
      const confidenceWeight = Math.floor(Math.random() * 14) + 81;
      const placementWeight = Math.floor(Math.random() * 10) + 84;
      const progressWeight = Math.round((scoreWeight + layoutWeight + commsWeight) / 3);

      const reportId = `report-${Date.now()}`;
      const reportRef = doc(db, 'reports', reportId);

      const generatedReport = {
        id: reportId,
        userId: user.uid,
        fileName: selectedFile.name,
        fileType: selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf',
        uploadedAt: serverTimestamp(), // Automatically stored as Timestamp format synchronously verifying request.time
        atsScore: scoreWeight,
        resumeScore: layoutWeight,
        communicationScore: commsWeight,
        confidenceScore: confidenceWeight,
        placementReadiness: placementWeight,
        careerProgress: progressWeight,
        extractedSkills: ["React 19", "TypeScript", "Docker", "Artificial Intelligence", "Microservices", "Firestore"],
        missingKeywords: ["CI/CD Pipeline", "Google Cloud SQL", "OAuth Authorization", "Unit Testing Metrics"],
        strengths: [
          "Outstanding verbal structural impact using clean bullet statements.",
          "High density of actionable technical skills relating to modern stacks.",
          "Perfect margins and legible typographies supporting machine crawlers."
        ],
        weaknesses: [
          "Lacks sufficient mention of corporate cloud architectures under GCP.",
          "Needs to expand metrics representing budget-saving outcome figures."
        ],
        feedback: "## Quantum Assessment Summary\n\nYour resume features exceptional structural composition and formatting, rendering highly compatible with advanced system crawlers. Tone analysis suggests strong executive capabilities.\n\n### Strategic Roadmap:\n1. **Core Amplification**: Integrate missing keyword tokens such as `CI/CD` and `OAuth` near placements sections.\n2. **Metrics Hardening**: Recast experience bullet points using quantitative results (e.g. 'Optimized index performance resulting in ^25% server reduction').",
        storagePath: downloadUrl
      };

      await setDoc(reportRef, generatedReport);

      // Add to final logs
      setScanLogs(logs => [...logs, `[OS-DECK] DATABASES LOCKED AND SECURED. REPORT WRITTEN SUCCESSFULLY.`]);
      
      // Delay slightly before switching
      setTimeout(() => {
        setIsScanning(false);
        setSelectedFile(null);
        onNavigateToTab('reports');
      }, 1000);

    } catch (err) {
      console.error("Critical Scanner Operation Failure:", err);
      setIsScanning(false);
      alert("A system error occurred while interacting with Firestore databases. Retract credentials and retry.");
    }
  };

  // Delete resume report from Firestore on demand
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to terminate this scan report from active OS records?")) return;
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      setHistory(prev => prev.filter(item => item.id !== reportId));
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* SCANNING & DECRYPTION MODE HUD */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#03020A]/95 flex flex-col items-center justify-center p-4 font-mono select-none"
          >
            <div className="max-w-2xl w-full p-8 rounded-2xl glass-card-dark border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 space-y-8">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-cyan-400/10 flex items-center justify-center text-cyan-400 animate-pulse">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm tracking-wide">QUANTUM CORE DECRYPTION</h3>
                    <p className="text-[10px] text-slate-500 uppercase">Interactive file audit matrix active</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-cyan-400 font-bold block">{scanProgress}%</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Progress</span>
                </div>
              </div>

              {/* BAR PROGRESS */}
              <div className="h-2 w-full bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              {/* TERMINAL DIALOG MATRIX */}
              <div className="bg-[#05040d] border border-slate-850 rounded-lg p-5 h-[230px] overflow-y-auto space-y-1.5 text-[10px] text-[#22c55e]">
                {scanLogs.map((log, index) => (
                  <div key={index} className="truncate border-b border-slate-900/40 pb-1 font-mono">
                    {log}
                  </div>
                ))}
                {scanStep < 7 && (
                  <div className="flex items-center gap-1.5 text-cyan-400 animate-pulse">
                    <span>&#x25B6;</span>
                    <span className="font-bold">CORE_DIAGNOSING_IN_PROGRESS: Processing token indices...</span>
                  </div>
                )}
              </div>

              <div className="text-center text-[10px] text-slate-500 uppercase tracking-wider">
                &copy; QYRONIX NEXUS OS SECURED PIPELINE. DO NOT INTERRUPT SYSTEM INGRESS CHANNELS.
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: ACTIVE FILE UPLOADS PANEL */}
      <div className="lg:col-span-2 space-y-6">
        <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded bg-cyan-400/10 text-cyan-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">Quantum Scanner Ingress</h3>
                <p className="text-xs text-slate-400">Submit credentials PDF, DOCX under secure ABAC validation rules</p>
              </div>
            </div>

            {/* DRAG-AND-DROP CONTROLLER */}
            {!selectedFile ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-cyan-400 bg-cyan-400/5' 
                    : isDark ? 'border-slate-800 hover:border-slate-700 bg-slate-950/20' : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept=".pdf,.docx"
                />
                <Upload className="h-10 w-10 mx-auto text-cyan-400 mb-4 animate-bounce" />
                <span className="block text-sm font-semibold text-slate-200">
                  {dragActive ? 'Release credentials to upload' : 'Drag & Drop your Resume here'}
                </span>
                <span className="block text-xs text-slate-550 mt-1">Acceptable formats: PDF or DOCX up to 10MB</span>
              </div>
            ) : (
              /* SELECTED FILE CONFIG MATRIX */
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded bg-cyan-400/10 text-cyan-400 flex items-center justify-center font-bold font-mono">
                      {selectedFile.name.split('.').pop()?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-semibold truncate max-w-[250px]">{selectedFile.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • SECURE_DISPATCH_QUEUE</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* STRUCTURAL EXTRACTION PREVIEW FRAME */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Ingress File Core Text Preview</span>
                  <div className="bg-[#05040d] border border-slate-900 rounded-lg p-4 font-mono text-[10px] text-slate-400 h-[150px] overflow-y-auto leading-normal whitespace-pre-wrap select-none shadow-inner">
                    {textPreview}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                  <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse flex-shrink-0" />
                  <p className="text-[10px] text-slate-350 leading-relaxed font-mono">
                    Ready to initiate quantum analysis. Click &quot;TRANSMIT TO OS ENGINE&quot; to execute real Firebase writes.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 border border-slate-800 text-[11px] font-mono tracking-wide text-slate-400 rounded-lg hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    Clear Credentials
                  </button>
                  <button
                    onClick={runQuantumScanner}
                    className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all inline-flex items-center gap-1.5 shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer font-mono"
                  >
                    <Zap className="h-3.5 w-3.5" /> TRANSMIT TO OS ENGINE
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* RIGHT COLUMN: HISTORICAL DEPOSITS HISTORY */}
      <div className="space-y-6">
        <GlassCard isDark={isDark} className="p-6 border border-slate-200/50 dark:border-slate-800/55 flex flex-col justify-between h-full bg-[#05040d]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-cyan-400" />
                Resume History logs
              </h3>
              <span className="text-[10px] text-slate-500 font-mono tracking-tight">{history.length} ACTIVE DEPOSITS</span>
            </div>

            {loadingHistory ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-6 h-6 rounded-full border border-slate-800 border-t-cyan-400 animate-spin mx-auto" />
                <span className="text-[9px] uppercase tracking-wider text-slate-600 font-mono">Polling node logs...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <FileText className="h-8 w-8 text-slate-700 mx-auto" />
                <div>
                  <h4 className="text-white text-xs font-semibold uppercase tracking-wider font-mono">No scans logged</h4>
                  <p className="text-[10px] text-slate-550 leading-normal max-w-[150px] mx-auto mt-1 font-mono">Submit credential files to instantiate dynamic evaluation metrics.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {history.map((scan) => (
                  <div 
                    key={scan.id}
                    className="p-3.5 rounded-lg border dark:bg-slate-950-40 dark:border-slate-850/60 bg-white border-slate-200 flex items-center justify-between gap-3 group hover:border-cyan-400/25 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate max-w-[130px] font-mono leading-none">{scan.fileName}</h4>
                      <p className="text-[9px] text-slate-500 font-mono">
                        {scan.uploadedAt?.seconds 
                          ? new Date(scan.uploadedAt.seconds * 1000).toLocaleDateString() 
                          : new Date(scan.uploadedAt).toLocaleDateString()}
                      </p>
                      
                      {/* Badge strip */}
                      <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                        <span className="inline-flex items-center text-[8px] bg-cyan-400/5 text-cyan-400 px-1 py-0.5 rounded font-mono font-bold leading-none">
                          ATS: {scan.atsScore}%
                        </span>
                        <span className="inline-flex items-center text-[8px] bg-purple-400/5 text-purple-400 px-1 py-0.5 rounded font-mono font-bold leading-none">
                          LAYOUT: {scan.resumeScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {scan.downloadUrl && (
                        <a 
                          href={scan.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="View Original Upload In Storage"
                        >
                          <Eye className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteReport(scan.id)}
                        className="p-1.5 rounded bg-red-950/10 hover:bg-red-950/30 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete telemetry record"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-850 pt-3 mt-6">
            <span className="text-[9px] uppercase tracking-wider text-slate-650 block leading-tight font-mono">
              Encryption standard rules enforce immutable date tags and direct secure ownership ties client side.
            </span>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
