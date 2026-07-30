import React, { useState } from 'react';
import { Megaphone, Upload, Lock, Send, X, Check, Copy, AlertTriangle, Key, Shield, Eye, HelpCircle } from 'lucide-react';
import { TrustedContactSelector } from './TrustedContactSelector';

interface WhistleblowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXP?: (amount: number) => void;
  onSubmitted?: () => void;
}

export const WhistleblowerModal: React.FC<WhistleblowerModalProps> = ({
  isOpen,
  onClose,
  onRewardXP,
  onSubmitted
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'track'>('create');

  // Form fields
  const [reportUrlOrTitle, setReportUrlOrTitle] = useState('');
  const [category, setCategory] = useState('Scam / Phishing Campaign');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Track existing state
  const [lookupCode, setLookupCode] = useState('');
  const [foundReport, setFoundReport] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportUrlOrTitle.trim() || !description.trim()) {
      alert('Please provide the campaign URL/Title and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/whistleblower-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrlOrTitle: reportUrlOrTitle,
          category,
          description,
          reporter: 'Anonymous Whistleblower',
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTrackingCode(data.trackingCode);

        // Save locally for quick lookup
        try {
          const saved = localStorage.getItem('bytespark_wb_reports');
          const existing = saved ? JSON.parse(saved) : [];
          localStorage.setItem('bytespark_wb_reports', JSON.stringify([data, ...existing]));
        } catch (e) {
          console.error("Local save error:", e);
        }

        if (onRewardXP) onRewardXP(20);
        if (onSubmitted) onSubmitted();
      } else {
        alert('Server error registering whistleblower report.');
      }
    } catch (err) {
      console.error('Whistleblower submission error:', err);
      alert('Network error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;

    setIsSearching(true);
    setLookupError(null);
    setFoundReport(null);

    const cleanCode = lookupCode.trim().toUpperCase();

    try {
      // Local check
      const saved = localStorage.getItem('bytespark_wb_reports');
      if (saved) {
        const list = JSON.parse(saved);
        const match = list.find((r: any) => r.trackingCode.toUpperCase() === cleanCode);
        if (match) {
          setFoundReport(match);
          setIsSearching(false);
          return;
        }
      }

      const res = await fetch(`/api/whistleblower-reports/${encodeURIComponent(cleanCode)}`);
      if (res.ok) {
        const data = await res.json();
        setFoundReport(data);
      } else {
        setLookupError('No whistleblower report found matching this tracking code.');
      }
    } catch (e) {
      console.error('Lookup error:', e);
      setLookupError('Network error checking report status.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#7A1F2B] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Megaphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>Whistleblower Protection</span>
              </div>
              <h3 className="font-bold text-base font-serif-title leading-tight">Anonymous Scam & Disinformation Report</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 text-rose-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 px-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white border-[#7A1F2B] text-[#7A1F2B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>New Whistleblower Report</span>
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
            <span>Track Whistleblower Status</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'create' && (
            <>
              {trackingCode ? (
                /* Success View */
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-emerald-950">Anonymous Whistleblower Report Submitted!</h4>
                    <p className="text-[11px] text-emerald-800">
                      Your report has been routed to the Community Watch queue. Our volunteer response team will verify and escalate to network partners.
                    </p>
                  </div>

                  {/* Tracking Code Box */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Your Secret Whistleblower Tracking Code
                    </span>
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="font-mono text-lg font-bold text-amber-300 tracking-wider">
                        {trackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(trackingCode)}
                        className="flex items-center gap-1 bg-white text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-700" />}
                        <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Save this code! You can check verification progress anonymously under "Track Whistleblower Status".
                    </p>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-700 leading-relaxed text-[11px]">
                    <strong className="text-slate-900 block mb-0.5 font-bold">100% Anonymous & Secure</strong>
                    Report coordinated disinformation campaigns, viral scams, financial fraud networks, or election manipulation. No login or identity tracking required.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Target Campaign URL, Domain, or Page Title
                    </label>
                    <input
                      type="text"
                      value={reportUrlOrTitle}
                      onChange={(e) => setReportUrlOrTitle(e.target.value)}
                      placeholder="e.g. https://scam-site.org or Telegram channel @viral_scam"
                      required
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Misinformation / Scam Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50 font-medium"
                    >
                      <option value="Scam / Phishing Campaign">Scam / Phishing Network</option>
                      <option value="Election Misinformation">Election / Political Manipulation</option>
                      <option value="Health / Fake Medical Cure">Health Rumor / Dangerous Remedy</option>
                      <option value="AI Deepfake Impersonation">AI Synthetic Impersonation</option>
                      <option value="Coordinated Bot Network">Coordinated Bot / Troll Network</option>
                      <option value="General Misleading News">General Misleading Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Evidence & Context Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Describe how this campaign operates, affected groups, or viral reach..."
                      required
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
                    />
                  </div>

                  {/* Optional File Attachment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Attach Screenshot or Document (Optional)
                    </label>
                    <div className="border border-dashed border-slate-300 rounded-xl p-2.5 bg-slate-50 text-center relative cursor-pointer hover:border-[#7A1F2B]">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span className="text-[11px] text-slate-600 font-semibold">
                        {selectedFile ? `📎 ${selectedFile.name}` : 'Click or drag screenshot file'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-3 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Whistleblower Report (+20 XP)'}</span>
                  </button>
                </form>
              )}
            </>
          )}

          {activeTab === 'track' && (
            <div className="space-y-4 animate-fade-in">
              <form onSubmit={handleLookup} className="space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Enter Secret Whistleblower Tracking Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="e.g. WB-84920"
                    required
                    className="flex-1 text-xs p-3 rounded-xl border border-slate-200 font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-[#7A1F2B] text-white font-bold text-xs px-4 py-3 rounded-xl hover:bg-[#5A131E] transition-colors flex items-center gap-1.5"
                  >
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
                      Current Status
                    </span>
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs p-2.5 rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Status: {foundReport.status || 'Under Community Verification'}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700">
                    <p><strong>Target Source:</strong> {foundReport.sourceUrlOrTitle}</p>
                    <p><strong>Category:</strong> {foundReport.category}</p>
                    <p><strong>Notes:</strong> {foundReport.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#7A1F2B]">
            <Lock className="w-3.5 h-3.5" />
            <span>Anonymous Whistleblower Queue</span>
          </span>
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
