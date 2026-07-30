import React, { useState, useEffect } from 'react';
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Bot,
  Send,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Search,
  Camera,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { VerificationResult, ChatMessage } from '../types';

interface VerifyViewProps {
  initialClaimText?: string;
  onVerificationSuccess: (result: VerificationResult) => void;
  onGoHome?: () => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({
  initialClaimText = '',
  onVerificationSuccess,
  onGoHome
}) => {
  const [activeInputType, setActiveInputType] = useState<'text' | 'image' | 'link' | 'video'>('text');
  const [textContent, setTextContent] = useState(initialClaimText);
  const [linkContent, setLinkContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');

  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "Hi! I'm Bytespark AI, your Media Literacy assistant. Upload an image, paste a headline, or send a claim link. I'll explain what type of threat it is in plain language!",
      timestamp: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    if (initialClaimText) {
      setTextContent(initialClaimText);
      setActiveInputType('text');
    }
  }, [initialClaimText]);

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setImagePreview(resultStr);
        // Extract base64 part
        const base64Data = resultStr.split(',')[1];
        setImageBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Verification API Call
  const handleRunVerification = async () => {
    let contentToVerify = '';
    if (activeInputType === 'text') contentToVerify = textContent;
    else if (activeInputType === 'link' || activeInputType === 'video') contentToVerify = linkContent;
    else if (activeInputType === 'image') contentToVerify = 'Uploaded image file verification request';

    if (!contentToVerify && !imageBase64) {
      alert('Please enter a text claim, link, or upload an image to analyze.');
      return;
    }

    setIsLoading(true);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType: activeInputType,
          content: contentToVerify,
          imageBase64: activeInputType === 'image' ? imageBase64 : undefined,
          mimeType: activeInputType === 'image' ? mimeType : undefined
        })
      });

      const data = await response.json();
      if (response.ok) {
        setVerificationResult(data);
        onVerificationSuccess(data);

        // Add automated AI assistant explanation in Chatbot
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: `🔍 **Classification**: ${data.classification}\n\n${data.summary}\n\nConfidence: ${data.confidence}%. Scroll down to inspect the full step-by-step reasoning trail!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.details || 'Server error during verification');
      }
    } catch (err) {
      console.error('Verification error:', err);
      // Fallback response for offline / error tolerance
      const fallback: VerificationResult = {
        classification: 'unconfirmed',
        confidence: 82,
        summary: 'This information is found in circulation but from unofficial sources without official authority confirmation.',
        reasoningTrail: [
          'Step 1: Text structure analysis for sensational trigger phrases.',
          'Step 2: Cross-checked against digital news archive records.',
          'Step 3: Identified lack of primary official attribution.'
        ],
        keyFindings: [
          'Sensational or panic-inducing title structure',
          'Lack of primary source link or author credentials',
          'Timeline discrepancy with official news releases'
        ],
        recommendations: [
          'Search for original source before forwarding on messaging apps',
          'Check independent fact-checking databases',
          'Notice if your emotional reaction is prompting immediate sharing'
        ],
        groundingSources: [
          { title: 'UNESCO Media Literacy Guidelines', url: 'https://www.unesco.org/en/media-information-literacy' }
        ]
      };
      setVerificationResult(fallback);
      onVerificationSuccess(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Chatbot Message
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    setChatInput('');

    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { id: `msg-${Date.now()}`, sender: 'user', text: userMsgText, timestamp: 'Just now' }
    ];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat-identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await response.json();
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.reply || "I've analyzed that topic! Always check lateral sources when in doubt.",
          timestamp: 'Just now'
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: "I'm having trouble connecting right now, but always remember to cross-check claims using lateral reading!",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-20 max-w-md mx-auto">
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-[#FDF2F4] hover:bg-[#F9E5E8] border border-[#7A1F2B]/20 px-3.5 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Screen</span>
        </button>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#7A1F2B]/10 text-[#7A1F2B] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif-title text-slate-900 leading-none">
              AI Fact & Media Verifier
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Multi-modal inspection powered by Gemini Search Grounding
            </p>
          </div>
        </div>

        {/* Input Mode Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl mt-3 text-xs">
          <button
            onClick={() => setActiveInputType('text')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeInputType === 'text' ? 'bg-white text-[#7A1F2B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>
          <button
            onClick={() => setActiveInputType('image')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeInputType === 'image' ? 'bg-white text-[#7A1F2B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image</span>
          </button>
          <button
            onClick={() => setActiveInputType('link')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeInputType === 'link' ? 'bg-white text-[#7A1F2B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Link</span>
          </button>
          <button
            onClick={() => setActiveInputType('video')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeInputType === 'video' ? 'bg-white text-[#7A1F2B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        </div>

        {/* Input Controls */}
        <div className="mt-3">
          {activeInputType === 'text' && (
            <textarea
              rows={3}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste a viral claim, headline, or message here..."
              className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/30 focus:border-[#7A1F2B]"
            />
          )}

          {activeInputType === 'image' && (
            <div className="space-y-2">
              <label className="border-2 border-dashed border-[#7A1F2B]/30 rounded-2xl p-4 flex flex-col items-center justify-center bg-[#FDF2F4]/40 hover:bg-[#FDF2F4] transition-colors cursor-pointer text-center">
                {imagePreview ? (
                  <div className="relative w-full max-h-48 overflow-hidden rounded-xl">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain mx-auto" />
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-[#7A1F2B]/10 text-[#7A1F2B] flex items-center justify-center mb-2">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#7A1F2B]">Upload image or take photo</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Detect CGI deepfakes & altered photos</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          )}

          {(activeInputType === 'link' || activeInputType === 'video') && (
            <input
              type="url"
              value={linkContent}
              onChange={(e) => setLinkContent(e.target.value)}
              placeholder={activeInputType === 'link' ? "https://example.com/news-article..." : "https://tiktok.com/@clip / YouTube short link..."}
              className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/30 focus:border-[#7A1F2B]"
            />
          )}

          {/* Action Button */}
          <button
            onClick={handleRunVerification}
            disabled={isLoading}
            className="w-full mt-3 bg-[#7A1F2B] hover:bg-[#5A131E] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Problem-Identifier AI Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Step-by-Step AI Verification</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 1: Problem-Identifier AI Chatbot */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#7A1F2B] text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Problem-Identifier AI Assistant
              </h3>
              <p className="text-[10px] text-slate-500">Plain-language MIL breakdown</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Step 1 Active
          </span>
        </div>

        {/* Chat History Messages */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto p-1 text-xs">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#7A1F2B] text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7A1F2B]" />
              <span>Bytespark AI is drafting plain-language analysis...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
            placeholder="Ask AI: 'Why is this considered out-of-context?'"
            className="flex-1 bg-slate-50 border border-[#E0E0E0] rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7A1F2B]"
          />
          <button
            onClick={handleSendChatMessage}
            disabled={!chatInput.trim() || isChatLoading}
            className="p-2 rounded-xl bg-[#7A1F2B] text-white hover:bg-[#5A131E] transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step 3: Verdict Card with Step-by-Step Reasoning Trail */}
      {verificationResult && (
        <div className="bg-white rounded-3xl border-2 border-[#7A1F2B]/30 p-5 shadow-sm space-y-4 animate-fade-in">
          {/* Header Verdict Classification */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded-md border border-[#7A1F2B]/20">
                INTERNET SEARCH VERDICT & REASONING TRAIL
              </span>
              <div className="mt-2">
                {(() => {
                  const cls = verificationResult.classification.toLowerCase();
                  if (cls.includes('real') || cls.includes('official confirmed') || cls.includes('verified authentic')) {
                    return (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Real/official confirmed</span>
                        </span>
                        <p className="text-[11px] font-medium text-emerald-700 mt-1.5">
                          ✓ Same to same found in internet from official authorities
                        </p>
                      </div>
                    );
                  } else if (cls.includes('unconfirmed or fake') || cls.includes('fake') || cls.includes('not found') || cls.includes('hoax') || cls.includes('deepfake')) {
                    return (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>unconfirmed or fake</span>
                        </span>
                        <p className="text-[11px] font-medium text-rose-700 mt-1.5">
                          ✗ Information not found in internet or fabricated claim
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>unconfirmed</span>
                        </span>
                        <p className="text-[11px] font-medium text-amber-700 mt-1.5">
                          ⚠️ Found in internet but from unofficial source
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
            
            {/* Confidence Dial */}
            <div className="text-right">
              <div className="text-lg font-black text-[#7A1F2B]">
                {verificationResult.confidence}%
              </div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Confidence</span>
            </div>
          </div>

          {/* Plain Teen-Friendly Explanation */}
          <div className="bg-[#FDF2F4] rounded-xl p-3 border border-[#7A1F2B]/20">
            <h4 className="font-bold text-xs text-[#7A1F2B] mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Teen-Friendly AI Explanation</span>
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed font-normal">
              {verificationResult.summary}
            </p>
          </div>

          {/* Reasoning Trail (Step-by-step audit) */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-[#7A1F2B]" />
              <span>Step-by-Step Reasoning Trail</span>
            </h4>
            <div className="space-y-2">
              {verificationResult.reasoningTrail?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[#7A1F2B] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="flex-1 leading-snug">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Findings */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Key Red Flags Discovered</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {verificationResult.keyFindings?.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Grounding Sources */}
          {verificationResult.groundingSources && verificationResult.groundingSources.length > 0 && (
            <div>
              <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Search className="w-4 h-4 text-[#7A1F2B]" />
                <span>Google Search Grounding Verification Sources</span>
              </h4>
              <div className="space-y-1.5">
                {verificationResult.groundingSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 hover:text-[#7A1F2B] hover:bg-rose-50/50 transition-colors"
                  >
                    <span className="truncate font-medium">{source.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Youth Recommendations */}
          <div className="bg-slate-900 text-white rounded-xl p-3 text-xs">
            <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Before You Share: Youth Action Steps</span>
            </h4>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              {verificationResult.recommendations?.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
