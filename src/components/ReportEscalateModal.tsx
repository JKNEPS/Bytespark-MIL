import React, { useState, useEffect } from 'react';
import { Flag, ExternalLink, ShieldAlert, CheckSquare, Square, Copy, Check, AlertTriangle, Send, X, Globe, Lock, Info, Share2, Award, ChevronRight } from 'lucide-react';

export interface ReportLogItem {
  id: string;
  target: string;
  checkType: 'authenticity' | 'source' | 'general';
  score?: number;
  routeType: 'social_media' | 'cyber_bureau' | 'community_watch';
  destinationName: string;
  timestamp: string;
  status: 'Reported' | 'Escalated to Authorities' | 'Flagged to Community';
}

interface ReportEscalateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentUrlOrHeadline: string;
  checkType: 'authenticity' | 'source' | 'general';
  score?: number;
  summary?: string;
  signalsOrMetrics?: string[];
  onRewardXP?: (amount: number) => void;
  onCommunityWatchSubmitted?: () => void;
  onReportLogged?: (logItem: ReportLogItem) => void;
}

export const ReportEscalateModal: React.FC<ReportEscalateModalProps> = ({
  isOpen,
  onClose,
  contentUrlOrHeadline,
  checkType,
  score,
  summary,
  signalsOrMetrics = [],
  onRewardXP,
  onCommunityWatchSubmitted,
  onReportLogged,
}) => {
  // Pre-report checklist state
  const [hasSavedScreenshot, setHasSavedScreenshot] = useState(false);
  const [hasAcknowledgedTruthfulness, setHasAcknowledgedTruthfulness] = useState(false);

  // Active tab in report modal
  const [activeRoute, setActiveRoute] = useState<'social_media' | 'cyber_bureau' | 'community_watch'>('social_media');

  // Community watch form
  const [reportCategory, setReportCategory] = useState<string>('Deepfake / AI Audio');
  const [reportReason, setReportReason] = useState<string>('');
  const [isSubmittingWatch, setIsSubmittingWatch] = useState(false);

  // Template copy status
  const [isCopied, setIsCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Detected platform
  const [detectedPlatform, setDetectedPlatform] = useState<{
    name: string;
    url: string;
    icon: string;
  } | null>(null);

  const [selectedPlatformUrl, setSelectedPlatformUrl] = useState<string>('');

  useEffect(() => {
    if (!contentUrlOrHeadline) return;

    const lower = contentUrlOrHeadline.toLowerCase();
    if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
      const p = { name: 'Facebook', url: 'https://www.facebook.com/help/138041852936493', icon: '📘' };
      setDetectedPlatform(p);
      setSelectedPlatformUrl(p.url);
    } else if (lower.includes('tiktok.com')) {
      const p = { name: 'TikTok', url: 'https://www.tiktok.com/community-guidelines/en/reporting/', icon: '🎵' };
      setDetectedPlatform(p);
      setSelectedPlatformUrl(p.url);
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      const p = { name: 'YouTube', url: 'https://support.google.com/youtube/answer/2802027', icon: '🔴' };
      setDetectedPlatform(p);
      setSelectedPlatformUrl(p.url);
    } else if (lower.includes('x.com') || lower.includes('twitter.com')) {
      const p = { name: 'X (Twitter)', url: 'https://help.x.com/en/safety-and-security/report-a-post', icon: '🖤' };
      setDetectedPlatform(p);
      setSelectedPlatformUrl(p.url);
    } else if (lower.includes('instagram.com')) {
      const p = { name: 'Instagram', url: 'https://help.instagram.com/192435014247952', icon: '📸' };
      setDetectedPlatform(p);
      setSelectedPlatformUrl(p.url);
    } else {
      // Default to Facebook as general choice
      setDetectedPlatform(null);
      setSelectedPlatformUrl('https://www.facebook.com/help/138041852936493');
    }
  }, [contentUrlOrHeadline]);

  if (!isOpen) return null;

  const platformOptions = [
    { name: 'Facebook', url: 'https://www.facebook.com/help/138041852936493', icon: '📘' },
    { name: 'TikTok', url: 'https://www.tiktok.com/community-guidelines/en/reporting/', icon: '🎵' },
    { name: 'YouTube', url: 'https://support.google.com/youtube/answer/2802027', icon: '🔴' },
    { name: 'X (Twitter)', url: 'https://help.x.com/en/safety-and-security/report-a-post', icon: '🖤' },
    { name: 'Instagram', url: 'https://help.instagram.com/192435014247952', icon: '📸' },
  ];

  const currentDate = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate copyable pre-filled template text
  const reportTemplateText = `[BYTESPARK MIL VERIFICATION & ESCALATION REPORT]
Target Content/URL: ${contentUrlOrHeadline || 'N/A'}
Check Type: ${checkType === 'authenticity' ? 'AI Content & Synthetic Media Diagnostic' : 'Publisher Credibility & Transparency Scan'}
${score !== undefined ? `Diagnostic Score: ${score}% ${checkType === 'authenticity' ? 'Synthetic AI Likelihood' : 'Credibility Index'}` : ''}
Timestamp: ${currentDate}
Category: ${reportCategory}
Summary of Signals:
${summary || 'Content flagged for unverified claims or potential synthetic manipulation.'}
${signalsOrMetrics.length > 0 ? `Key Metrics: ${signalsOrMetrics.slice(0, 3).join('; ')}` : ''}

Reason for Flagging:
${reportReason || 'Unverified claims, potential deepfake, or misleading information violating platform integrity standards.'}

-- Generated via Bytespark MIL Youth Verification Engine`;

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(reportTemplateText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleLogReport = (routeType: 'social_media' | 'cyber_bureau' | 'community_watch', destName: string) => {
    const logItem: ReportLogItem = {
      id: `report-${Date.now()}`,
      target: contentUrlOrHeadline || 'Flagged Media Item',
      checkType,
      score,
      routeType,
      destinationName: destName,
      timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: routeType === 'cyber_bureau' ? 'Escalated to Authorities' : routeType === 'community_watch' ? 'Flagged to Community' : 'Reported'
    };

    // Save to localStorage history
    try {
      const saved = localStorage.getItem('bytespark_report_history');
      const existingLogs: ReportLogItem[] = saved ? JSON.parse(saved) : [];
      const updated = [logItem, ...existingLogs].slice(0, 30);
      localStorage.setItem('bytespark_report_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save report history', e);
    }

    if (onReportLogged) {
      onReportLogged(logItem);
    }

    if (onRewardXP) {
      onRewardXP(20);
    }
  };

  const handleOpenPlatformReport = (platformUrl: string, platformName: string) => {
    if (!hasSavedScreenshot || !hasAcknowledgedTruthfulness) {
      alert("Please complete the pre-report safety checklist first.");
      return;
    }

    handleLogReport('social_media', platformName);
    setActionNotice(`Logged report attempt on ${platformName}! (+20 XP)`);
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenCyberBureau = () => {
    if (!hasSavedScreenshot || !hasAcknowledgedTruthfulness) {
      alert("Please complete the pre-report safety checklist first.");
      return;
    }

    handleLogReport('cyber_bureau', 'Nepal Police Cyber Bureau');
    setActionNotice('Logged escalation to Nepal Police Cyber Bureau! (+20 XP)');
    window.open('https://cyberbureau.nepalpolice.gov.np/', '_blank', 'noopener,noreferrer');
  };

  const handleCommunityWatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSavedScreenshot || !hasAcknowledgedTruthfulness) {
      alert("Please complete the pre-report safety checklist first.");
      return;
    }

    setIsSubmittingWatch(true);
    try {
      const res = await fetch('/api/flagged-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceNameOrUrl: contentUrlOrHeadline || 'Flagged Content',
          reason: reportReason || 'Flagged via Bytespark MIL Report & Escalate Tool',
          category: reportCategory,
          reporter: 'Youth MIL Advocate',
        }),
      });

      if (res.ok) {
        handleLogReport('community_watch', 'Bytespark Community Watch Registry');
        if (onCommunityWatchSubmitted) {
          onCommunityWatchSubmitted();
        }
        setActionNotice('Submitted to Bytespark Community Watch Registry! (+20 XP)');
        setReportReason('');
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting community watch report:', err);
      alert('Network error submitting report.');
    } finally {
      setIsSubmittingWatch(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-fade-in flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#7A1F2B] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Flag className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base font-serif-title leading-tight">Report & Escalate</h3>
              <p className="text-[11px] text-rose-100">Official Routing & Evidence Summary Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 text-rose-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Target Content Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Item Being Reported
            </span>
            <p className="font-bold text-slate-900 text-xs truncate">
              {contentUrlOrHeadline || 'Unspecified Content or Link'}
            </p>
            {score !== undefined && (
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="font-semibold text-slate-500">Diagnostic Score:</span>
                <span className="font-bold text-[#7A1F2B] font-mono bg-[#FDF2F4] px-2 py-0.5 rounded-md border border-[#7A1F2B]/20">
                  {score}% {checkType === 'authenticity' ? 'AI Synthetic' : 'Credibility'}
                </span>
              </div>
            )}
          </div>

          {/* Action Confirmation Banner Notice */}
          {actionNotice && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-800 flex items-center gap-2 animate-fade-in">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-xs">{actionNotice}</span>
            </div>
          )}

          {/* Mandatory Pre-Report Safety Checklist */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Pre-Report Safety Checklist</span>
            </div>

            <div className="space-y-2 pt-0.5">
              <button
                type="button"
                onClick={() => setHasSavedScreenshot(!hasSavedScreenshot)}
                className="flex items-start gap-2 text-left cursor-pointer group"
              >
                {hasSavedScreenshot ? (
                  <CheckSquare className="w-4 h-4 text-[#7A1F2B] shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 mt-0.5" />
                )}
                <span className={`text-[11px] leading-tight ${hasSavedScreenshot ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                  I have saved a screenshot or local recording of the content (it may be deleted after reporting).
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHasAcknowledgedTruthfulness(!hasAcknowledgedTruthfulness)}
                className="flex items-start gap-2 text-left cursor-pointer group"
              >
                {hasAcknowledgedTruthfulness ? (
                  <CheckSquare className="w-4 h-4 text-[#7A1F2B] shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 mt-0.5" />
                )}
                <span className={`text-[11px] leading-tight ${hasAcknowledgedTruthfulness ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                  I confirm that false reporting damages community trust and platform integrity.
                </span>
              </button>
            </div>
          </div>

          {/* Smart Routing Destination Tabs */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Choose Routing Destination
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
              <button
                onClick={() => setActiveRoute('social_media')}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  activeRoute === 'social_media' ? 'bg-white text-[#7A1F2B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🌐 Social Platform
              </button>
              <button
                onClick={() => setActiveRoute('cyber_bureau')}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  activeRoute === 'cyber_bureau' ? 'bg-white text-[#7A1F2B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🚨 Cyber Bureau
              </button>
              <button
                onClick={() => setActiveRoute('community_watch')}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  activeRoute === 'community_watch' ? 'bg-white text-[#7A1F2B] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🛡️ Community
              </button>
            </div>
          </div>

          {/* ROUTE 1: Social Media Platform Direct Routing */}
          {activeRoute === 'social_media' && (
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 animate-fade-in">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#7A1F2B]" />
                  <span>Report via Official Social Platform Tool</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select the platform where this content was posted to access their official report form:
                </p>
              </div>

              {detectedPlatform && (
                <div className="bg-[#FDF2F4] border border-[#7A1F2B]/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{detectedPlatform.icon}</span>
                    <div>
                      <span className="font-bold text-slate-900 block">Detected: {detectedPlatform.name}</span>
                      <span className="text-[10px] text-slate-500">Matching URL pattern detected</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#7A1F2B] text-white px-2 py-0.5 rounded-full font-bold">Auto-Matched</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {platformOptions.map((p) => {
                  const isSelected = selectedPlatformUrl === p.url;
                  return (
                    <div
                      key={p.name}
                      onClick={() => setSelectedPlatformUrl(p.url)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-white border-[#7A1F2B] shadow-2xs' : 'bg-white/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{p.icon}</span>
                        <span className="font-bold text-slate-800 text-xs">{p.name} Reporting Portal</span>
                      </div>
                      <input
                        type="radio"
                        name="platform_choice"
                        checked={isSelected}
                        onChange={() => setSelectedPlatformUrl(p.url)}
                        className="accent-[#7A1F2B]"
                      />
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  const found = platformOptions.find(p => p.url === selectedPlatformUrl) || { name: 'Social Platform' };
                  handleOpenPlatformReport(selectedPlatformUrl, found.name);
                }}
                disabled={!hasSavedScreenshot || !hasAcknowledgedTruthfulness}
                className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-3 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Open Official Platform Reporting Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          )}

          {/* ROUTE 2: Cybercrime Bureau National Portal */}
          {activeRoute === 'cyber_bureau' && (
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 animate-fade-in">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-700" />
                  <span>Escalate to National Cybercrime Bureau</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  For severe violations including online scams, non-consensual deepfakes, financial fraud, impersonation, or cyber harassment:
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3 space-y-2 text-[11px] text-rose-900">
                <div className="flex items-center justify-between font-bold">
                  <span>Police Cyber Bureau Complaint Portal:</span>
                  <span className="font-mono text-[10px] bg-rose-100 px-2 py-0.5 rounded-md">Official Channel</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-rose-800">
                  <li>Direct Web Portal: <strong>cyberbureau.nepalpolice.gov.np</strong></li>
                  <li>Toll-Free Helpline: <strong>1144</strong></li>
                  <li>Official Email: <strong>cyberbureau@nepalpolice.gov.np</strong></li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleOpenCyberBureau}
                disabled={!hasSavedScreenshot || !hasAcknowledgedTruthfulness}
                className="w-full bg-rose-800 text-white font-bold text-xs py-3 rounded-xl shadow-xs hover:bg-rose-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Proceed to Official Cyber Bureau Complaint Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          )}

          {/* ROUTE 3: Bytespark Community Watch Registry */}
          {activeRoute === 'community_watch' && (
            <form onSubmit={handleCommunityWatchSubmit} className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 animate-fade-in">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Flag className="w-4 h-4 text-[#7A1F2B]" />
                  <span>Flag to Bytespark Community Registry</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Submit this claim/source to Bytespark's crowd-sourced registry reviewed by local youth advocates.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-white font-medium"
                >
                  <option value="Deepfake / AI Audio">Deepfake / AI Synthetic Audio</option>
                  <option value="Health Rumor">Health Rumor / Unverified Remedy</option>
                  <option value="Clickbait / Phishing">Clickbait / Phishing Portal</option>
                  <option value="Election Misinformation">Election Misinformation</option>
                  <option value="General Misleading">General Misleading Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason for Flagging
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={2}
                  placeholder="Describe why this content is misleading or dangerous..."
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingWatch || !hasSavedScreenshot || !hasAcknowledgedTruthfulness}
                className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-3 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSubmittingWatch ? 'Submitting to Registry...' : 'Submit to Bytespark Community Watch (+20 XP)'}</span>
              </button>
            </form>
          )}

          {/* Pre-filled Report Summary Template Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Copy className="w-3.5 h-3.5" />
                <span>Auto-Filled Pre-Formatted Report Template</span>
              </div>
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-700" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Copy this template to paste directly into the platform or authority's own reporting form:
            </p>

            <pre className="text-[10px] font-mono bg-slate-950 p-2.5 rounded-xl text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-32 border border-slate-800">
              {reportTemplateText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px]">Routes directly to official channels.</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 text-xs px-3 py-1"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
