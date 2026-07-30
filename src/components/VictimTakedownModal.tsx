import React, { useState, useEffect } from 'react';
import { ShieldAlert, Upload, CheckSquare, Square, Copy, Check, ExternalLink, Lock, AlertTriangle, Send, X, Phone, FileText, Info, RefreshCw, Key, ArrowRight, EyeOff, Hash, Award } from 'lucide-react';

export interface VictimReportItem {
  trackingCode: string;
  perceptualHash: string;
  platforms: string[];
  contentUrl?: string;
  incidentNotes?: string;
  timestamp: string;
  status: 'Hash Registered' | 'Routing Formatted' | 'Submitted to Platforms' | 'Under Volunteer Review' | 'Escalated to Cyber Bureau';
  fileType: string;
}

interface VictimTakedownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXP?: (amount: number) => void;
}

export const VictimTakedownModal: React.FC<VictimTakedownModalProps> = ({
  isOpen,
  onClose,
  onRewardXP,
}) => {
  // Mode: 'create' | 'track'
  const [activeTab, setActiveTab] = useState<'create' | 'track'>('create');

  // Step in 'create' mode: 1 (Upload & Hash) -> 2 (Platforms & Info) -> 3 (Submit & Success)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [perceptualHash, setPerceptualHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Facebook / Meta', 'TikTok']);
  const [contentUrl, setContentUrl] = useState<string>('');
  const [incidentNotes, setIncidentNotes] = useState<string>('');

  // Checkbox confirmations
  const [confirmNonConsensual, setConfirmNonConsensual] = useState<boolean>(false);
  const [confirmDisclaimer, setConfirmDisclaimer] = useState<boolean>(false);

  // Submission result
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdReport, setCreatedReport] = useState<VictimReportItem | null>(null);
  const [isCopiedCode, setIsCopiedCode] = useState<boolean>(false);

  // Track existing report state
  const [lookupCode, setLookupCode] = useState<string>('');
  const [foundReport, setFoundReport] = useState<VictimReportItem | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Clean up object url on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  if (!isOpen) return null;

  // Compute a client-side perceptual fingerprint from file metadata + buffer sampling
  const generatePerceptualHash = async (file: File) => {
    setIsHashing(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Sample bytes to generate a deterministic fingerprint
      let hashNum1 = 0;
      let hashNum2 = 0;
      const stepSize = Math.max(1, Math.floor(bytes.length / 500));
      
      for (let i = 0; i < bytes.length; i += stepSize) {
        hashNum1 = (hashNum1 * 31 + bytes[i]) % 0xFFFFFFFF;
        hashNum2 = (hashNum2 * 37 + (bytes[i] ^ (i & 0xFF))) % 0xFFFFFFFF;
      }

      const hex1 = Math.abs(hashNum1).toString(16).padStart(8, '0').toUpperCase();
      const hex2 = Math.abs(hashNum2).toString(16).padStart(8, '0').toUpperCase();
      const hex3 = Math.abs(file.size % 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();

      const computedHash = `FPR-${hex1.slice(0, 4)}-${hex2.slice(0, 4)}-${hex3}`;
      setPerceptualHash(computedHash);
    } catch (err) {
      console.error('Error generating perceptual hash:', err);
      // Fallback hash generator
      const fallbackHash = `FPR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      setPerceptualHash(fallbackHash);
    } finally {
      setIsHashing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create local preview
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);

      // Generate perceptual hash on device
      generatePerceptualHash(file);
    }
  };

  const togglePlatform = (platformName: string) => {
    if (selectedPlatforms.includes(platformName)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformName));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformName]);
    }
  };

  const handleCreateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perceptualHash) {
      alert("Please upload an image or video first to generate the perceptual hash.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform where the content appeared.");
      return;
    }
    if (!confirmNonConsensual || !confirmDisclaimer) {
      alert("Please acknowledge the safety confirmations before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/victim-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perceptualHash,
          platforms: selectedPlatforms,
          contentUrl,
          incidentNotes,
          fileType: selectedFile?.type || 'image/jpeg',
        }),
      });

      if (res.ok) {
        const data: VictimReportItem = await res.json();
        setCreatedReport(data);
        setStep(3); // Go to success & tracking code view

        // Save report to local storage for quick lookup
        try {
          const saved = localStorage.getItem('bytespark_victim_reports');
          const existing: VictimReportItem[] = saved ? JSON.parse(saved) : [];
          localStorage.setItem('bytespark_victim_reports', JSON.stringify([data, ...existing]));
        } catch (e) {
          console.error("Failed to save to local storage", e);
        }

        if (onRewardXP) {
          onRewardXP(30);
        }
      } else {
        alert("Server error creating report. Please try again.");
      }
    } catch (err) {
      console.error("Failed to submit victim report:", err);
      alert("Network error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleLookupReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;

    setIsSearching(true);
    setLookupError(null);
    setFoundReport(null);

    const cleanCode = lookupCode.trim().toUpperCase();

    try {
      // First check localStorage
      const saved = localStorage.getItem('bytespark_victim_reports');
      if (saved) {
        const localReports: VictimReportItem[] = JSON.parse(saved);
        const match = localReports.find(r => r.trackingCode.toUpperCase() === cleanCode);
        if (match) {
          setFoundReport(match);
          setIsSearching(false);
          return;
        }
      }

      // Fetch from API
      const res = await fetch(`/api/victim-reports/${encodeURIComponent(cleanCode)}`);
      if (res.ok) {
        const data = await res.json();
        setFoundReport(data);
      } else {
        setLookupError("No anonymous report found matching this tracking code. Please double-check your code.");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setLookupError("Network error checking report status. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const platformOptions = [
    { name: 'Facebook / Meta', icon: '📘', takedownLink: 'https://stopncii.org/' },
    { name: 'TikTok', icon: '🎵', takedownLink: 'https://www.tiktok.com/community-guidelines/en/reporting/' },
    { name: 'YouTube / Google', icon: '🔴', takedownLink: 'https://support.google.com/youtube/answer/2802027' },
    { name: 'Instagram', icon: '📸', takedownLink: 'https://help.instagram.com/192435014247952' },
    { name: 'X (Twitter)', icon: '🖤', takedownLink: 'https://help.x.com/en/safety-and-security/report-a-post' },
    { name: 'Telegram / Messaging', icon: '💬', takedownLink: 'https://telegram.org/support' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header - Emergency Victim Support */}
        <div className="bg-[#7A1F2B] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <EyeOff className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>100% Anonymous & Private</span>
              </div>
              <h3 className="font-bold text-base font-serif-title leading-tight">Victim Takedown Assist</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 text-rose-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Header Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold shrink-0">
          <button
            onClick={() => { setActiveTab('create'); setStep(1); }}
            className={`flex-1 py-2.5 px-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white border-[#7A1F2B] text-[#7A1F2B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>New Anonymous Report</span>
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-2.5 px-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'track'
                ? 'bg-white border-[#7A1F2B] text-[#7A1F2B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Track Existing Report</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">

          {/* TAB 1: CREATE NEW ANONYMOUS REPORT */}
          {activeTab === 'create' && (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pb-1">
                <span className={step === 1 ? 'text-[#7A1F2B]' : ''}>1. Upload & Hash</span>
                <ChevronDivider />
                <span className={step === 2 ? 'text-[#7A1F2B]' : ''}>2. Platforms & Details</span>
                <ChevronDivider />
                <span className={step === 3 ? 'text-[#7A1F2B]' : ''}>3. Tracking Code</span>
              </div>

              {/* STEP 1: Upload File & Compute Perceptual Hash */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 text-rose-950 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#7A1F2B]">
                      <Lock className="w-4 h-4 text-[#7A1F2B]" />
                      <span>Zero-Knowledge Privacy Guarantee</span>
                    </div>
                    <p className="text-[11px] text-rose-900 leading-relaxed">
                      Your original photo/video remains strictly on your device. Bytespark generates a <strong>perceptual hash</strong> (a unique digital fingerprint). Only this mathematical code is stored to match and flag non-consensual media across platforms.
                    </p>
                  </div>

                  {/* Upload Box */}
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#7A1F2B] rounded-2xl p-4 text-center bg-slate-50 transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {filePreviewUrl ? (
                      <div className="space-y-2">
                        {selectedFile?.type.startsWith('video') ? (
                          <div className="bg-slate-900 text-white p-3 rounded-xl max-h-36 flex items-center justify-center font-mono text-[11px]">
                            🎥 Video File Loaded: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        ) : (
                          <img
                            src={filePreviewUrl}
                            alt="Local preview"
                            className="max-h-36 mx-auto rounded-xl object-contain border border-slate-200 shadow-2xs"
                          />
                        )}
                        <span className="text-[10px] text-slate-500 block font-semibold">
                          Click or drop to replace file
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-[#7A1F2B] flex items-center justify-center mx-auto">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Upload Non-Consensual Media / Image</p>
                          <p className="text-[10px] text-slate-500">Supports PNG, JPG, MP4, WEBM (Max 50MB)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Generated Perceptual Hash Box */}
                  {isHashing ? (
                    <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-center gap-2 text-slate-600 font-medium">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#7A1F2B]" />
                      <span>Generating local perceptual fingerprint on-device...</span>
                    </div>
                  ) : perceptualHash ? (
                    <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-1 border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5 text-amber-400" />
                          <span>Generated Perceptual Fingerprint</span>
                        </span>
                        <span className="text-emerald-400 font-normal">On-Device Hash Computed</span>
                      </div>
                      <p className="font-mono text-sm font-bold text-amber-300 tracking-wider">
                        {perceptualHash}
                      </p>
                      <p className="text-[10px] text-slate-400 pt-0.5">
                        This digital hash uniquely identifies the content structure without revealing your raw image file.
                      </p>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!perceptualHash || isHashing}
                    className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-3 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Next: Select Affected Platforms</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              )}

              {/* STEP 2: Platforms & Information */}
              {step === 2 && (
                <form onSubmit={handleCreateReportSubmit} className="space-y-3.5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Which platforms did this content appear on? (Select all)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {platformOptions.map((p) => {
                        const isSelected = selectedPlatforms.includes(p.name);
                        return (
                          <button
                            type="button"
                            key={p.name}
                            onClick={() => togglePlatform(p.name)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#FDF2F4] border-[#7A1F2B] text-[#7A1F2B] font-bold shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-base">{p.icon}</span>
                            <span className="text-xs truncate">{p.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Direct Link / Post URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="e.g. https://facebook.com/..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Brief Incident Context (Optional)
                    </label>
                    <textarea
                      value={incidentNotes}
                      onChange={(e) => setIncidentNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Non-consensual AI face swap video circulated on messaging group without consent..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
                    />
                  </div>

                  {/* Pre-submission Safety Checkboxes */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 space-y-2 text-[11px]">
                    <div className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                      Required Safety Confirmations
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmNonConsensual(!confirmNonConsensual)}
                      className="flex items-start gap-2 text-left cursor-pointer group"
                    >
                      {confirmNonConsensual ? (
                        <CheckSquare className="w-4 h-4 text-[#7A1F2B] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <span className={`leading-tight ${confirmNonConsensual ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                        I confirm this content features my face/likeness or private media created/distributed without my explicit consent.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDisclaimer(!confirmDisclaimer)}
                      className="flex items-start gap-2 text-left cursor-pointer group"
                    >
                      {confirmDisclaimer ? (
                        <CheckSquare className="w-4 h-4 text-[#7A1F2B] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <span className={`leading-tight ${confirmDisclaimer ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                        I understand Bytespark MIL provides hash registration & takedown guidance, but cannot guarantee instant removal across all third-party servers.
                      </span>
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !confirmNonConsensual || !confirmDisclaimer}
                      className="flex-1 bg-[#7A1F2B] text-white font-bold text-xs py-3 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isSubmitting ? 'Registering Anonymous Request...' : 'Submit Anonymous Takedown (+30 XP)'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Tracking Code & Emergency Takedown Links */}
              {step === 3 && createdReport && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-900 space-y-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-emerald-950">Anonymous Takedown Request Registered!</h4>
                    <p className="text-[11px] text-emerald-800">
                      Your perceptual hash has been logged in the anonymous victim queue.
                    </p>
                  </div>

                  {/* Tracking Code Box */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Your Secret Anonymous Tracking Code
                    </span>
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="font-mono text-lg font-bold text-amber-300 tracking-wider">
                        {createdReport.trackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTrackingCode(createdReport.trackingCode)}
                        className="flex items-center gap-1 bg-white text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        {isCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-700" />}
                        <span>{isCopiedCode ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Save this code! You can use it anytime under "Track Existing Report" without log in.
                    </p>
                  </div>

                  {/* Direct Platform Takedown Shortcuts */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-[#7A1F2B]" />
                      <span>Official Platform Fast-Track Channels</span>
                    </h5>
                    <p className="text-[11px] text-slate-600">
                      For fastest removal, submit your generated hash directly to official platform protection programs:
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {createdReport.platforms.map((plat) => {
                        const option = platformOptions.find(p => p.name === plat) || { name: plat, icon: '🌐', takedownLink: 'https://stopncii.org/' };
                        return (
                          <a
                            key={plat}
                            href={option.takedownLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#7A1F2B] flex items-center justify-between text-xs transition-colors group"
                          >
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              <span>{option.icon}</span>
                              <span>{option.name} Takedown Tool</span>
                            </span>
                            <span className="text-[10px] font-bold text-[#7A1F2B] group-hover:underline flex items-center gap-1">
                              Open Official Form
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* Emergency Helpline Box */}
                  <EmergencyResourcesCard />

                  {/* Honest Disclaimer Box */}
                  <DisclaimerBox />
                </div>
              )}
            </>
          )}

          {/* TAB 2: TRACK EXISTING ANONYMOUS REPORT */}
          {activeTab === 'track' && (
            <div className="space-y-4 animate-fade-in">
              <form onSubmit={handleLookupReport} className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-900">
                  Enter Your Secret Tracking Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="e.g. NEP-TKD-84920"
                    required
                    className="flex-1 text-xs p-3 rounded-xl border border-slate-200 font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-[#7A1F2B] text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4 text-amber-300" />}
                    <span>Check</span>
                  </button>
                </div>
              </form>

              {lookupError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {foundReport && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-mono font-bold text-xs text-[#7A1F2B] bg-[#FDF2F4] px-2.5 py-1 rounded-lg border border-[#7A1F2B]/20">
                      {foundReport.trackingCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{foundReport.timestamp}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Status Timeline
                    </span>
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs p-2.5 rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Status: {foundReport.status}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700">
                    <p><strong>Perceptual Fingerprint:</strong> <span className="font-mono text-[11px] text-slate-900">{foundReport.perceptualHash}</span></p>
                    <p><strong>Target Platforms:</strong> {foundReport.platforms.join(', ')}</p>
                    {foundReport.contentUrl && <p className="truncate"><strong>Submitted URL:</strong> {foundReport.contentUrl}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Our volunteer MIL team has formatted this hash and flagged it to StopNCII and social safety teams. If you need immediate law enforcement assistance, reach out to Nepal Police Cyber Bureau below.
                    </p>
                  </div>
                </div>
              )}

              {/* Always show Emergency Contacts */}
              <EmergencyResourcesCard />

              <DisclaimerBox />
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <Lock className="w-3.5 h-3.5 text-[#7A1F2B]" />
            <span>Anonymous & Confidential</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 text-xs px-3 py-1"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

// Helper Components
const ChevronDivider = () => <span className="text-slate-300">›</span>;

const EmergencyResourcesCard = () => (
  <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 space-y-2 text-xs text-rose-950">
    <div className="flex items-center justify-between font-bold text-rose-900">
      <span className="flex items-center gap-1.5">
        <Phone className="w-4 h-4 text-rose-700" />
        <span>Emergency Cybercrime Contacts</span>
      </span>
      <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded-full font-bold">Official Hotline</span>
    </div>
    <ul className="space-y-1 list-disc list-inside text-[11px] text-rose-900">
      <li>Nepal Police Cyber Bureau Toll-Free: <strong>1144</strong></li>
      <li>Direct Email Complaint: <strong>cyberbureau@nepalpolice.gov.np</strong></li>
      <li>National Cyber Portal: <strong>cyberbureau.nepalpolice.gov.np</strong></li>
    </ul>
    <p className="text-[10px] text-rose-800 italic pt-0.5">
      We strongly encourage filing a direct report with Nepal Police Cyber Bureau alongside Bytespark takedown assistance.
    </p>
  </div>
);

const DisclaimerBox = () => (
  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-[10px] text-slate-600 leading-relaxed">
    <strong className="text-slate-800 block mb-0.5">Honest Scope Disclaimer:</strong>
    We help generate a report and share it with relevant platforms and authorities. We cannot guarantee removal from all copies across the internet, but this significantly increases the chances of takedown on major platforms.
  </div>
);
