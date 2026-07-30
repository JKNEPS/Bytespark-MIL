import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Shield, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PrebunkQuiz } from '../types';

interface PrebunkQuizCardProps {
  quiz: PrebunkQuiz;
  onAnswerCorrect: (points: number) => void;
}

export const PrebunkQuizCard: React.FC<PrebunkQuizCardProps> = ({ quiz, onAnswerCorrect }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    if (hasAnswered) return;
    setSelectedOptionId(optionId);
    setHasAnswered(true);

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#7A1F2B', '#9B1B30', '#F5F5F5', '#FFD700']
      });
      onAnswerCorrect(quiz.points);
    }
  };

  const selectedOption = quiz.options.find(o => o.id === selectedOptionId);

  return (
    <div className="bg-[#F9F1F2] border-2 border-[#7A1F2B]/20 rounded-3xl p-5 shadow-xs my-4 relative overflow-hidden">
      {/* Quiz Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 bg-[#7A1F2B] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Prebunk Challenge</span>
        </div>
        <span className="text-xs font-bold text-[#7A1F2B] bg-white px-2.5 py-0.5 rounded-full border border-[#7A1F2B]/20">
          +{quiz.points} XP
        </span>
      </div>

      <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">
        {quiz.question}
      </h3>

      <p className="text-xs text-slate-500 font-medium mb-3.5 flex items-center gap-1">
        <Shield className="w-3.5 h-3.5 text-[#7A1F2B]" />
        <span>Technique Focus: <strong className="text-slate-700">{quiz.milTechnique}</strong></span>
      </p>

      {/* Options List */}
      <div className="space-y-2 mb-3">
        {quiz.options.map((opt) => {
          let optionStyle = 'bg-white border-slate-200 text-slate-800 hover:border-[#7A1F2B]/50';
          
          if (hasAnswered) {
            if (opt.isCorrect) {
              optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
            } else if (opt.id === selectedOptionId && !opt.isCorrect) {
              optionStyle = 'bg-rose-50 border-rose-400 text-rose-900';
            } else {
              optionStyle = 'bg-white/50 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              disabled={hasAnswered}
              onClick={() => handleSelect(opt.id, opt.isCorrect)}
              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${optionStyle}`}
            >
              <div className="mt-0.5 shrink-0">
                {hasAnswered && opt.isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {hasAnswered && opt.id === selectedOptionId && !opt.isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
                {(!hasAnswered || (hasAnswered && !opt.isCorrect && opt.id !== selectedOptionId)) && (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500">
                    {opt.id.toUpperCase()}
                  </div>
                )}
              </div>
              <span className="flex-1 leading-normal">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {hasAnswered && (
        <div className="mt-3.5 p-3 rounded-xl bg-white border border-[#E0E0E0] shadow-2xs text-xs animate-fade-in">
          <div className="flex items-center gap-1.5 font-bold text-[#7A1F2B] mb-1">
            <HelpCircle className="w-4 h-4 text-[#7A1F2B]" />
            <span>MIL Fact Breakdown</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-normal">
            {quiz.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
