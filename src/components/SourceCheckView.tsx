import React, { useState, useEffect } from 'react';
import { Globe, Search, AlertOctagon, CheckCircle, ShieldCheck, Flag, Info, ExternalLink, X, HelpCircle, ArrowRight, RefreshCw, UserCheck, Scale, Award, History, ArrowLeft } from 'lucide-react';
import { SourceCredibilityResult, FlaggedSource, TabType } from '../types';
import { ReportEscalateModal, ReportLogItem } from './ReportEscalateModal';

interface SourceCheckViewProps {
  onRewardXP: (amount: number) => void;
  onNavigateToTab: (tab: TabType, categoryFilter?: string) => void;
  onGoHome?: () => void;
}

export const SourceCheckView: React.FC<SourceCheckViewProps> = ({ onRewardXP, onNavigateToTab, onGoHome }) => {
  const [sourceInput, setSourceInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [credibilityResult, setCredibilityResult] = useState<SourceCredibilityResult | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [flaggedSources, setFlaggedSources] = useState<FlaggedSource[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [history, setHistory] = useState<SourceCredibilityResult[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Check onboarding tooltip status and fetch flagged sources
  useEffect(() => {
    const seen = localStorage.getItem('bytespark_seen_source_tooltip');
    if (seen === 'true') {
      setShowTooltip(false);
    }
    fetchFlaggedSources();

    try {
      const saved = localStorage.getItem('bytespark_source_checks');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load source check history", e);
    }
  }, []);

  const saveToHistory = (result: SourceCredibilityResult) => {
    const updated = [result, ...history].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem('bytespark_source_checks', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save source check history", e);
    }
  };

  const fetchFlaggedSources = async () => {
    try {
      const res = await fetch('/api/flagged-sources');
      if (res.ok) {
        const data = await res.json();
        setFlaggedSources(data);
      }
    } catch (e) {
      console.error("Failed to fetch flagged sources:", e);
    }
  };

  const handleDismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('bytespark_seen_source_tooltip', 'true');
  };

  const handleSampleClick = (sample: string) => {
    setSourceInput(sample);
  };

  const handleRunScan = async () => {
    if (!sourceInput.trim()) {
      alert("Please enter a news URL or article headline to scan.");
      return;
    }

    setIsScanning(true);
    setCredibilityResult(null);

    try {
      const response = await fetch('/api/scan-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrlOrHeadline: sourceInput }),
      });

      const data = await response.json();

      const result: SourceCredibilityResult = {
        id: `source-${Date.now()}`,
        urlOrHeadline: sourceInput,
        publisherReputation: data.publisherReputation || 'Unknown / New Site',
        biasIndicator: data.biasIndicator || 'Not Applicable',
        authorTransparency: data.authorTransparency || 'Anonymous / No Byline',
        summary: data.summary || 'This source requires cautious lateral verification before trusting.',
        credibilityScore: data.credibilityScore ?? 60,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCredibilityResult(result);
      saveToHistory(result);
      onRewardXP(40);
    } catch (error) {
      console.error("Error scanning source:", error);
      alert("Failed to scan source. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenReportModal = () => {
    setShowReportModal(true);
  };

  const getReputationBadgeClass = (rep: string) => {
    if (rep.toLowerCase().includes('established') || rep.toLowerCase().includes('credible')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (rep.toLowerCase().includes('unreliable') || rep.toLowerCase().includes('known')) {
      return 'bg-[#FDF2F4] text-[#7A1F2B] border-[#7A1F2B]/30';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto">
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-[#FDF2F4] hover:bg-[#F9E5E8] border border-[#7A1F2B]/20 px-3.5 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Screen</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7A1F2B]/10 text-[#7A1F2B] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-title text-slate-900 leading-tight">
                Check a Source
              </h2>
              <p className="text-xs text-slate-500">Publisher Credibility & Transparency Scanner</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7A1F2B] bg-[#FDF2F4] border border-[#7A1F2B]/20 px-2.5 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>My Checks ({history.length})</span>
            </button>

            <button
              onClick={() => setShowTooltip(true)}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="How to read credibility cards"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Onboarding Tooltip Card */}
      {showTooltip && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-md relative overflow-hidden animate-fade-in">
          <button
            onClick={handleDismissTooltip}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <Info className="w-4 h-4" />
            <span>How to Read Credibility Cards</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Before sharing an article, inspect three key signals:
          </p>

          <ul className="text-xs space-y-1.5 text-slate-200 mb-4 list-disc list-inside">
            <li><strong>Publisher Reputation:</strong> Established outlets adhere to editor policies and public corrections.</li>
            <li><strong>Bias & Framing:</strong> Indicates political leaning or emotional framing techniques.</li>
            <li><strong>Author Byline:</strong> Verified named authors are held accountable for evidence accuracy.</li>
          </ul>

          <button
            onClick={handleDismissTooltip}
            className="bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Got it, Let's Scan
          </button>
        </div>
      )}

      {/* Input Scanner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Paste News URL or Article Headline
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value)}
              placeholder="e.g. https://kathmandupost.com/... or headline claim..."
              className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
            />
          </div>
        </div>

        {/* Sample Shortcuts */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Test a sample source:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSampleClick('https://kathmandupost.com/national/2026/election-updates')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition-colors"
            >
              📰 Established Mainstream News URL
            </button>
            <button
              onClick={() => handleSampleClick('nepal-health-breakthroughs.blogspot.com')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition-colors"
            >
              ⚠️ Unverified Rumor Blog Link
            </button>
            <button
              onClick={() => handleSampleClick('Shocking Secret Cure Discovered By Local Student Overnight!')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition-colors"
            >
              🔥 Sensational Headline
            </button>
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-3.5 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning Publisher Database...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Evaluate Source Credibility (+40 XP)</span>
            </>
          )}
        </button>
      </div>

      {/* Credibility Card Results */}
      {credibilityResult && (
        <div className="bg-white rounded-3xl border-2 border-[#7A1F2B]/30 p-5 shadow-md space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Credibility Assessment
              </span>
              <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs">
                {credibilityResult.urlOrHeadline}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold font-mono text-[#7A1F2B] bg-[#FDF2F4] px-2.5 py-1 rounded-full border border-[#7A1F2B]/20">
                Score: {credibilityResult.credibilityScore}/100
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Publisher Reputation */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Publisher
              </span>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${getReputationBadgeClass(credibilityResult.publisherReputation)}`}>
                {credibilityResult.publisherReputation}
              </span>
            </div>

            {/* Bias Indicator */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Bias Framing
              </span>
              <div className="flex items-center gap-1 font-bold text-slate-700 text-xs">
                <Scale className="w-3.5 h-3.5 text-[#7A1F2B]" />
                <span>{credibilityResult.biasIndicator}</span>
              </div>
            </div>

            {/* Author Transparency */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Author Byline
              </span>
              <div className="flex items-center gap-1 font-bold text-slate-700 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#7A1F2B]" />
                <span className="truncate">{credibilityResult.authorTransparency}</span>
              </div>
            </div>
          </div>

          {/* Plain-Language Summary */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <p className="font-medium">{credibilityResult.summary}</p>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleOpenReportModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#7A1F2B] hover:bg-[#5A131E] px-3.5 py-2 rounded-xl shadow-xs transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-amber-300" />
              <span>Report & Escalate Source</span>
            </button>

            <button
              onClick={() => onNavigateToTab('explore', 'Educational Toolkits')}
              className="text-xs font-bold text-[#7A1F2B] hover:underline flex items-center gap-1"
            >
              <span>MIL Toolkits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Community Crowd-Sourced Flagged Sources Registry */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-[#7A1F2B]" />
            <h3 className="font-bold text-slate-900 text-sm">
              Local Misinformation Flagged List
            </h3>
          </div>
          <button
            onClick={handleOpenReportModal}
            className="text-xs font-bold text-[#7A1F2B] hover:underline"
          >
            + Report Source
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Crowd-sourced registry of flagged rumors, unverified portals, and synthetic media channels reviewed by youth advocates.
        </p>

        <div className="space-y-2 pt-1">
          {flaggedSources.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 font-mono truncate max-w-[200px]">
                  {item.sourceNameOrUrl}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF2F4] text-[#7A1F2B] border border-[#7A1F2B]/20">
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                {item.reason}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                <span>Category: {item.category}</span>
                <span>Flagged by {item.reporter} ({item.flagCount} flags)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report & Escalate Modal */}
      <ReportEscalateModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentUrlOrHeadline={credibilityResult?.urlOrHeadline || sourceInput || 'Flagged Source'}
        checkType="source"
        score={credibilityResult?.credibilityScore}
        summary={credibilityResult?.summary}
        signalsOrMetrics={[
          credibilityResult?.publisherReputation ? `Publisher: ${credibilityResult.publisherReputation}` : '',
          credibilityResult?.biasIndicator ? `Bias: ${credibilityResult.biasIndicator}` : '',
          credibilityResult?.authorTransparency ? `Author: ${credibilityResult.authorTransparency}` : ''
        ].filter(Boolean)}
        onRewardXP={onRewardXP}
        onCommunityWatchSubmitted={fetchFlaggedSources}
      />

      {/* Source Check History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#7A1F2B]" />
                <h3 className="font-bold text-slate-900 text-base">Source Scan History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No previous source scans saved yet.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCredibilityResult(item);
                      setShowHistoryModal(false);
                    }}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-[#7A1F2B]/40 bg-slate-50 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500 truncate max-w-[200px]">{item.urlOrHeadline}</span>
                      <span className="text-slate-400 font-mono shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-2">{item.summary}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded-full border border-[#7A1F2B]/20">
                        Score: {item.credibilityScore}/100
                      </span>
                      <span className="font-semibold text-slate-500">{item.publisherReputation}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-3">
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('bytespark_source_checks');
                  }}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Clear History
                </button>
                <span className="text-[11px] text-slate-400">{history.length} items</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
