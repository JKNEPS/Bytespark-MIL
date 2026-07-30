import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Lock, Camera, Zap, ShieldAlert, CheckCircle2, Bookmark, ExternalLink, ArrowLeft } from 'lucide-react';
import { selfDefenseGuides, SelfDefenseGuide } from '../data/selfDefenseData';
import { MentalHealthCard } from './MentalHealthCard';

interface DigitalSelfDefenseViewProps {
  onRewardXP?: (amount: number) => void;
  onOpenVictimModal?: () => void;
  onGoHome?: () => void;
}

export const DigitalSelfDefenseView: React.FC<DigitalSelfDefenseViewProps> = ({
  onRewardXP,
  onOpenVictimModal,
  onGoHome
}) => {
  const [expandedId, setExpandedId] = useState<string>(selfDefenseGuides[0].id);
  const [completedGuides, setCompletedGuides] = useState<string[]>([]);

  const toggleGuide = (id: string) => {
    setExpandedId(expandedId === id ? '' : id);
  };

  const markGuideComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!completedGuides.includes(id)) {
      setCompletedGuides([...completedGuides, id]);
      if (onRewardXP) onRewardXP(15);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className="w-5 h-5 text-[#7A1F2B]" />;
      case 'Lock': return <Lock className="w-5 h-5 text-[#7A1F2B]" />;
      case 'Zap': return <Zap className="w-5 h-5 text-[#7A1F2B]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-[#7A1F2B]" />;
      default: return <ShieldCheck className="w-5 h-5 text-[#7A1F2B]" />;
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20 text-slate-800">
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-[#FDF2F4] hover:bg-[#F9E5E8] border border-[#7A1F2B]/20 px-3.5 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Screen</span>
        </button>
      )}
      
      {/* Title Banner */}
      <div className="bg-[#7A1F2B] text-white rounded-3xl p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          <span>Protect Yourself</span>
        </div>
        <h2 className="text-xl font-bold font-serif-title leading-tight">
          Digital Self-Defense Toolkit
        </h2>
        <p className="text-xs text-white/80 leading-relaxed">
          Step-by-step actionable guides to lock down your accounts, preserve legal-grade evidence, and enforce instant platform removals.
        </p>
      </div>

      {/* Guide Cards Stack */}
      <div className="space-y-3">
        {selfDefenseGuides.map((guide: SelfDefenseGuide) => {
          const isExpanded = expandedId === guide.id;
          const isDone = completedGuides.includes(guide.id);

          return (
            <div
              key={guide.id}
              className={`bg-white border rounded-3xl overflow-hidden shadow-2xs transition-all ${
                isExpanded ? 'border-[#7A1F2B] ring-1 ring-[#7A1F2B]/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Accordion */}
              <button
                onClick={() => toggleGuide(guide.id)}
                className="w-full text-left p-4 flex items-start justify-between gap-3 cursor-pointer bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] border border-[#7A1F2B]/20 flex items-center justify-center shrink-0">
                    {getIcon(guide.iconName)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {guide.category}
                      </span>
                      <span className="text-[10px] font-bold text-[#7A1F2B]">
                        {guide.readTime}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Learned</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {guide.title}
                    </h3>
                  </div>
                </div>

                <div className="text-slate-400 p-1 shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-[#7A1F2B]" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded Steps */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/50 animate-fade-in text-xs">
                  <p className="text-slate-600 italic leading-relaxed pt-3">
                    {guide.summary}
                  </p>

                  <div className="space-y-3">
                    {guide.steps.map((step, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                        <h4 className="font-bold text-slate-900 text-xs text-[#7A1F2B]">
                          {step.title}
                        </h4>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          {step.description}
                        </p>
                        {step.proTip && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[10px] text-amber-950 font-medium">
                            💡 <strong>Pro Tip:</strong> {step.proTip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Completion & Reward Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={(e) => markGuideComplete(guide.id, e)}
                      disabled={isDone}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-[#7A1F2B] text-white hover:bg-[#5A131E] cursor-pointer'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>{isDone ? 'Completed (+15 XP Earned)' : 'Mark Guide Complete (+15 XP)'}</span>
                    </button>

                    {guide.category === 'Platform Takedowns' && onOpenVictimModal && (
                      <button
                        onClick={onOpenVictimModal}
                        className="text-xs font-bold text-[#7A1F2B] hover:underline flex items-center gap-1"
                      >
                        <span>Start Takedown Form</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mental Health Quiet Support Card */}
      <MentalHealthCard defaultOpen={false} />

    </div>
  );
};
