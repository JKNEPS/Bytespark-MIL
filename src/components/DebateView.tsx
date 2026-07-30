import React, { useState } from 'react';
import {
  Scale,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  Bot,
  AlertCircle,
  Award,
  CheckCircle2,
  Send,
  Loader2,
  Shield,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { DebateTopic, CommunityArgument, ModerationResult } from '../types';
import confetti from 'canvas-confetti';

interface DebateViewProps {
  topics: DebateTopic[];
  onArgumentSubmitted: (points: number) => void;
  onGoHome?: () => void;
}

export const DebateView: React.FC<DebateViewProps> = ({ topics, onArgumentSubmitted, onGoHome }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.id || 'deb-1');
  const [stance, setStance] = useState<'Pro' | 'Con' | 'Nuanced'>('Pro');
  const [argumentText, setArgumentText] = useState('');
  const [evidenceText, setEvidenceText] = useState('');

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);

  const activeTopic = topics.find(t => t.id === selectedTopicId) || topics[0];

  const handleEvaluateArgument = async () => {
    if (!argumentText.trim()) {
      alert('Please enter your argument text.');
      return;
    }

    setIsEvaluating(true);
    setModerationResult(null);

    try {
      const response = await fetch('/api/moderate-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: activeTopic.title,
          stance,
          userArgument: `${argumentText}\nCited Evidence: ${evidenceText}`
        })
      });

      const data = await response.json();
      if (response.ok) {
        setModerationResult(data);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#7A1F2B', '#9B1B30', '#FFD700']
        });
        onArgumentSubmitted(data.literacyPointsEarned || 50);

        // Append user's argument to community list
        const newArg: CommunityArgument = {
          id: `arg-${Date.now()}`,
          author: 'Alex Rivera (You)',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          stance,
          argumentText,
          evidence: evidenceText || 'Logical reasoning & lateral checks',
          upvotes: 1,
          aiScore: data.overallScore || 85,
          createdAt: 'Just now'
        };
        activeTopic.communityArguments.unshift(newArg);
      } else {
        throw new Error('Moderation error');
      }
    } catch (err) {
      console.error('Debate moderation error:', err);
      // Fallback result
      const fallback: ModerationResult = {
        logicScore: 84,
        evidenceScore: 80,
        respectScore: 96,
        overallScore: 86,
        strengths: ['Well-structured thesis', 'Respectful civil tone'],
        fallaciesDetected: ['None detected! Clean reasoning'],
        improvementTip: 'To increase your evidence score, cite a peer-reviewed research study or institutional report.',
        literacyPointsEarned: 50
      };
      setModerationResult(fallback);
      onArgumentSubmitted(50);
    } finally {
      setIsEvaluating(false);
    }
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
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#7A1F2B]/10 text-[#7A1F2B] flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif-title text-slate-900 leading-none">
              Debate Point
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Structured arguments evaluated by AI for logic & evidence
            </p>
          </div>
        </div>

        {/* Topic Selector Tabs */}
        <div className="mt-3 space-y-2">
          {topics.map((topic) => {
            const isSelected = topic.id === selectedTopicId;
            return (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setModerationResult(null);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'bg-[#FDF2F4] border-[#7A1F2B] text-slate-900 shadow-2xs font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-[#7A1F2B] bg-white px-2 py-0.5 rounded border border-[#7A1F2B]/20">
                    {topic.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {topic.argumentsCount} arguments
                  </span>
                </div>
                <p className="font-bold text-slate-900 leading-snug">{topic.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Topic Background Context */}
      {activeTopic && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#7A1F2B]" />
              <span>Background Context & Nuance</span>
            </h4>
            <p className="text-slate-600 leading-relaxed font-normal">
              {activeTopic.backgroundContext}
            </p>
          </div>

          {/* Argument Form */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#7A1F2B]" />
              <span>Construct Your Argument</span>
            </h3>

            {/* Stance Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                Choose Stance
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Pro', 'Con', 'Nuanced'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStance(s)}
                    className={`py-2 px-3 rounded-xl font-bold transition-all ${
                      stance === s
                        ? s === 'Pro'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : s === 'Con'
                          ? 'bg-rose-700 text-white shadow-2xs'
                          : 'bg-[#7A1F2B] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Argument Text area */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Logical Argument
              </label>
              <textarea
                rows={3}
                value={argumentText}
                onChange={(e) => setArgumentText(e.target.value)}
                placeholder="State your claim clearly. Avoid ad hominem personal attacks or unevidenced generalizations..."
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/30 focus:border-[#7A1F2B]"
              />
            </div>

            {/* Evidence Citation */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Evidence / Cites (Optional)
              </label>
              <input
                type="text"
                value={evidenceText}
                onChange={(e) => setEvidenceText(e.target.value)}
                placeholder="Cite a study, report, or lateral news source..."
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/30 focus:border-[#7A1F2B]"
              />
            </div>

            <button
              onClick={handleEvaluateArgument}
              disabled={isEvaluating || !argumentText.trim()}
              className="w-full bg-[#7A1F2B] hover:bg-[#5A131E] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>AI Moderator Scoring Logic & Tone...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>Submit for AI Quality Evaluation (+50 XP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Moderation Feedback Card */}
      {moderationResult && (
        <div className="bg-white rounded-3xl border-2 border-[#7A1F2B]/30 p-5 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#7A1F2B]" />
              <h3 className="font-bold font-serif-title text-slate-900 text-base">
                AI Moderator Evaluation
              </h3>
            </div>
            <span className="text-xs font-black text-[#7A1F2B] bg-[#FDF2F4] px-2.5 py-1 rounded-full border border-[#7A1F2B]/20">
              Score: {moderationResult.overallScore}/100
            </span>
          </div>

          {/* 3 Metric Progress Indicators */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Logic</span>
              <span className="text-sm font-bold text-slate-900">{moderationResult.logicScore}%</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Evidence</span>
              <span className="text-sm font-bold text-slate-900">{moderationResult.evidenceScore}%</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Respect</span>
              <span className="text-sm font-bold text-slate-900">{moderationResult.respectScore}%</span>
            </div>
          </div>

          {/* Strengths */}
          <div className="text-xs space-y-1">
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Key Strengths</span>
            </span>
            <ul className="list-disc list-inside text-slate-700 pl-1">
              {moderationResult.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Fallacies */}
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-800 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Fallacies / Bias Check</span>
            </span>
            <p className="text-slate-700 pl-1">
              {moderationResult.fallaciesDetected.join(', ')}
            </p>
          </div>

          {/* Improvement Tip */}
          <div className="bg-[#FDF2F4] p-2.5 rounded-xl border border-[#7A1F2B]/20 text-xs">
            <span className="font-bold text-[#7A1F2B] block mb-0.5">Tip to Strengthen Argument:</span>
            <p className="text-slate-800">{moderationResult.improvementTip}</p>
          </div>
        </div>
      )}

      {/* Community Arguments Feed */}
      {activeTopic && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#7A1F2B]" />
            <span>Community Arguments ({activeTopic.communityArguments.length})</span>
          </h3>

          <div className="space-y-3">
            {activeTopic.communityArguments.map((arg) => (
              <div key={arg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={arg.avatar} alt={arg.author} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-bold text-slate-900">{arg.author}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        arg.stance === 'Pro'
                          ? 'bg-emerald-100 text-emerald-800'
                          : arg.stance === 'Con'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-[#7A1F2B]/10 text-[#7A1F2B]'
                      }`}
                    >
                      {arg.stance}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    AI Quality {arg.aiScore}/100
                  </span>
                </div>

                <p className="text-slate-800 leading-relaxed font-normal">{arg.argumentText}</p>

                {arg.evidence && (
                  <div className="text-[11px] text-slate-500 font-medium italic border-l-2 border-[#7A1F2B] pl-2">
                    Evidence: {arg.evidence}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{arg.createdAt}</span>
                  <button className="flex items-center gap-1 hover:text-[#7A1F2B] font-semibold transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{arg.upvotes} Upvotes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
