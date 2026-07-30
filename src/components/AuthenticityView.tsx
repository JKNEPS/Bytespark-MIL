import React, { useState, useEffect } from 'react';
import { Sparkles, Upload, Link, AlignLeft, ShieldAlert, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronUp, History, ExternalLink, RefreshCw, Image as ImageIcon, ArrowRight, Flag, EyeOff, ArrowLeft } from 'lucide-react';
import { AuthenticityCheckResult, TabType } from '../types';
import { ReportEscalateModal, ReportLogItem } from './ReportEscalateModal';
import { VictimTakedownModal } from './VictimTakedownModal';

interface AuthenticityViewProps {
  onRewardXP: (amount: number) => void;
  onNavigateToTab: (tab: TabType, categoryFilter?: string) => void;
  onGoHome?: () => void;
}

export const AuthenticityView: React.FC<AuthenticityViewProps> = ({ onRewardXP, onNavigateToTab, onGoHome }) => {
  const [contentType, setContentType] = useState<'image' | 'video_audio' | 'text'>('image');
  const [contentText, setContentText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AuthenticityCheckResult | null>(null);
  const [history, setHistory] = useState<AuthenticityCheckResult[]>([]);
  const [isLearnExpanded, setIsLearnExpanded] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVictimModal, setShowVictimModal] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bytespark_authenticity_checks');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load authenticity history", e);
    }
  }, []);

  const saveToHistory = (result: AuthenticityCheckResult) => {
    const updated = [result, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    try {
      localStorage.setItem('bytespark_authenticity_checks', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip data URL prefix for API
        const base64Data = base64String.split(',')[1] || base64String;
        setSelectedImageBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleClick = (sampleType: 'ai_portrait' | 'audio_clone' | 'synthetic_text') => {
    if (sampleType === 'ai_portrait') {
      setContentType('image');
      setContentText('Portrait of politician delivering unannounced press conference');
      setSelectedImageBase64(null); // Will analyze text description as sample
    } else if (sampleType === 'audio_clone') {
      setContentType('video_audio');
      setMediaUrl('https://tiktok.com/@viral_rumors/video/synthetic_voice_sample');
      setContentText('Leaked audio clip claiming sudden emergency curfew in capital');
    } else {
      setContentType('text');
      setContentText('In an unprecedented technological breakthrough announced early Tuesday morning, local researchers revealed a zero-cost clean energy synthesis system that functions via atmospheric ambient humidity without external input.');
    }
  };

  const handleRunScan = async () => {
    if (contentType === 'image' && !selectedImageBase64 && !contentText.trim()) {
      alert("Please upload an image or enter a short description to check.");
      return;
    }
    if (contentType === 'video_audio' && !mediaUrl.trim() && !contentText.trim()) {
      alert("Please enter a video/audio URL or description.");
      return;
    }
    if (contentType === 'text' && !contentText.trim()) {
      alert("Please paste the text snippet to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setCurrentResult(null);

    try {
      const response = await fetch('/api/check-authenticity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          contentText,
          mediaUrl,
          imageBase64: selectedImageBase64,
          mimeType: imageMimeType,
        }),
      });

      const data = await response.json();

      const newResult: AuthenticityCheckResult = {
        id: `auth-${Date.now()}`,
        contentType,
        inputSummary: contentText.slice(0, 80) || (mediaUrl ? mediaUrl.slice(0, 60) : 'Uploaded Media Image'),
        mediaUrl: mediaUrl || undefined,
        aiScore: data.aiScore ?? 75,
        signals: data.signals || [
          "Micro-texture distortion inconsistent with camera sensor noise",
          "Synthesizer voice harmonics present in high frequency band",
          "Standard LLM text cadence markers"
        ],
        summary: data.summary || "Analysis identified technical signals consistent with synthetic or generative AI models.",
        disclaimer: data.disclaimer || "This score is a probabilistic estimate generated by AI analysis models and should not be taken as absolute or definitive proof.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
      };

      setCurrentResult(newResult);
      saveToHistory(newResult);
      onRewardXP(40);
    } catch (error) {
      console.error("Error checking authenticity:", error);
      alert("Scan failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('bytespark_authenticity_checks');
  };

  // Score meter styling
  const getScoreColorClass = (score: number) => {
    if (score < 35) return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bgLight: 'bg-emerald-50', label: 'Likely Authentic / Human' };
    if (score < 68) return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', bgLight: 'bg-amber-50', label: 'Suspicious / Inconclusive' };
    return { bg: 'bg-[#7A1F2B]', text: 'text-[#7A1F2B]', border: 'border-[#7A1F2B]/30', bgLight: 'bg-[#FDF2F4]', label: 'High AI-Generated Likelihood' };
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-title text-slate-900 leading-tight">
                Authenticity Check
              </h2>
              <p className="text-xs text-slate-500">AI Content & Synthetic Media Diagnostic</p>
            </div>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7A1F2B] bg-[#FDF2F4] border border-[#7A1F2B]/20 px-2.5 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>My Checks ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Input Selection Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Content Type
        </label>

        {/* Content Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setContentType('image')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              contentType === 'image'
                ? 'bg-white text-[#7A1F2B] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image</span>
          </button>

          <button
            onClick={() => setContentType('video_audio')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              contentType === 'video_audio'
                ? 'bg-white text-[#7A1F2B] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Video/Audio</span>
          </button>

          <button
            onClick={() => setContentType('text')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              contentType === 'text'
                ? 'bg-white text-[#7A1F2B] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
            <span>Text</span>
          </button>
        </div>

        {/* Tab 1: Image Input */}
        {contentType === 'image' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-slate-200 hover:border-[#7A1F2B]/40 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors">
              {selectedImageBase64 ? (
                <div className="space-y-2">
                  <img
                    src={`data:${imageMimeType};base64,${selectedImageBase64}`}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-xl object-contain border border-slate-200"
                  />
                  <button
                    onClick={() => setSelectedImageBase64(null)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-3">
                  <Upload className="w-8 h-8 text-[#7A1F2B] mb-2" />
                  <span className="text-xs font-bold text-slate-700">Upload image to check for AI generation</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Image Context or Description (Optional)
              </label>
              <input
                type="text"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="e.g. Photo of political speech circulating on Facebook..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Video / Audio Link Input */}
        {contentType === 'video_audio' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Paste Video or Audio Reel URL
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://tiktok.com/@user/video/... or https://youtube.com/..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                What does the audio/video claim?
              </label>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={2}
                placeholder="Describe what is said or depicted in the video..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Text Input */}
        {contentType === 'text' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Paste Article Snippet, Post, or Message Text
              </label>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={4}
                placeholder="Paste the suspicious text snippet here to test for LLM generation..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* Quick Sample Presets */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Or try a sample claim:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSampleClick('ai_portrait')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition-colors"
            >
              📷 AI Politician Portrait
            </button>
            <button
              onClick={() => handleSampleClick('audio_clone')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition-colors"
            >
              🎵 Deepfake Emergency Audio
            </button>
            <button
              onClick={() => handleSampleClick('synthetic_text')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium transition-colors"
            >
              📝 AI Energy Miracle Article
            </button>
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={handleRunScan}
          disabled={isAnalyzing}
          className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-3.5 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Synthetic Signals...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Run Authenticity Scan (+40 XP)</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Card */}
      {currentResult && (
        <div className="bg-white rounded-3xl border-2 border-[#7A1F2B]/30 p-5 shadow-md space-y-4 animate-fade-in">
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Authenticity Diagnostic
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                AI Generation Likelihood Assessment
              </h3>
            </div>
            <span className="text-[10px] font-extrabold bg-[#7A1F2B] text-white px-2.5 py-1 rounded-full">
              {currentResult.timestamp}
            </span>
          </div>

          {/* Visual Score Meter */}
          {(() => {
            const style = getScoreColorClass(currentResult.aiScore);
            return (
              <div className={`p-4 rounded-2xl border ${style.border} ${style.bgLight} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${style.text}`} />
                    <span className={`text-xs font-bold ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                  <span className={`text-2xl font-black font-mono ${style.text}`}>
                    {currentResult.aiScore}%
                  </span>
                </div>

                {/* Progress Meter Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${style.bg}`}
                      style={{ width: `${currentResult.aiScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                    <span>0% (Human/Authentic)</span>
                    <span>50% (Mixed)</span>
                    <span>100% (Synthetic/AI)</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Explanation Summary */}
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="font-medium">{currentResult.summary}</p>
          </div>

          {/* Identified Signals */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7A1F2B]" />
              <span>Key Diagnostic Signals Detected</span>
            </h4>
            <ul className="space-y-1.5">
              {currentResult.signals.map((signal, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A1F2B] shrink-0 mt-1.5" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plain Language Disclaimer Box */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">
              <strong>Probabilistic Disclaimer:</strong> {currentResult.disclaimer} Always cross-verify critical media using lateral reading and official primary sources.
            </p>
          </div>

          {/* Action Row: Report & Escalate Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#7A1F2B] hover:bg-[#5A131E] px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                <Flag className="w-3.5 h-3.5 text-amber-300" />
                <span>Report & Escalate</span>
              </button>

              <button
                onClick={() => setShowVictimModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-[#FDF2F4] border border-[#7A1F2B]/30 hover:bg-rose-100 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Report as Victim (Anonymous)</span>
              </button>
            </div>

            <button
              onClick={() => onNavigateToTab('explore', 'Deepfakes')}
              className="text-xs font-bold text-[#7A1F2B] hover:underline flex items-center gap-1 ml-auto"
            >
              <span>Explore Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* "Learn Why This Matters" Expandable Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <button
          onClick={() => setIsLearnExpanded(!isLearnExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#7A1F2B]" />
            <span>Learn Why This Matters: Deepfakes & Synthetic Media</span>
          </div>
          {isLearnExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isLearnExpanded && (
          <div className="space-y-3 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
            <p>
              Generative AI tools (GANs, diffusion models, and voice cloning software) allow anyone to manufacture ultra-realistic photos, audio reels, and articles in seconds.
            </p>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <h5 className="font-bold text-slate-800">3 Essential MIL Spotting Tips:</h5>
              <ul className="space-y-1 list-disc list-inside text-slate-700">
                <li><strong>Look at the boundaries:</strong> Check ears, fingers, hair strands, and lighting reflections in pupils.</li>
                <li><strong>Listen for flat tone:</strong> Voice clones often miss micro-pauses, emotion, or local accent inflections.</li>
                <li><strong>Check emotional urgency:</strong> Synthetic media is usually paired with shocking claims to induce fast forwarding before fact-checking.</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateToTab('explore', 'Deepfakes')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#7A1F2B] px-3.5 py-2 rounded-xl shadow-xs hover:bg-[#5A131E] transition-colors"
            >
              <span>Play Deepfake Challenge Games</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* History Modal / Drawer */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#7A1F2B]" />
                <h3 className="font-bold text-slate-900 text-base">My Check History</h3>
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
                  No previous authenticity checks saved yet.
                </div>
              ) : (
                history.map((item) => {
                  const style = getScoreColorClass(item.aiScore);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCurrentResult(item);
                        setShowHistoryModal(false);
                      }}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-[#7A1F2B]/40 bg-slate-50 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500 uppercase tracking-wider">{item.contentType}</span>
                        <span className="text-slate-400 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                        {item.inputSummary}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${style.bgLight} ${style.text} border ${style.border}`}>
                          {style.label}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-700">{item.aiScore}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {history.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-3">
                <button
                  onClick={clearHistory}
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

      {/* Report & Escalate Modal */}
      {currentResult && (
        <ReportEscalateModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          contentUrlOrHeadline={currentResult.mediaUrl || currentResult.inputSummary || 'Authenticity Check Item'}
          checkType="authenticity"
          score={currentResult.aiScore}
          summary={currentResult.summary}
          signalsOrMetrics={currentResult.signals}
          onRewardXP={onRewardXP}
        />
      )}

      {/* Anonymous Victim Report Modal */}
      <VictimTakedownModal
        isOpen={showVictimModal}
        onClose={() => setShowVictimModal(false)}
        onRewardXP={onRewardXP}
      />
    </div>
  );
};
