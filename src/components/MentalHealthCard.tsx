import React, { useState } from 'react';
import { Heart, ChevronDown, ChevronUp, Phone, ExternalLink, X, Shield, MessageCircle } from 'lucide-react';
import { mentalHealthResources, MentalHealthResource } from '../data/selfDefenseData';

interface MentalHealthCardProps {
  defaultOpen?: boolean;
  compact?: boolean;
}

export const MentalHealthCard: React.FC<MentalHealthCardProps> = ({
  defaultOpen = false,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) return null;

  return (
    <div className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-3.5 space-y-2 text-xs text-rose-950 shadow-2xs relative">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-bold text-[#7A1F2B] text-xs hover:underline cursor-pointer text-left"
        >
          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <Heart className="w-3.5 h-3.5 text-[#7A1F2B] fill-[#7A1F2B]" />
          </div>
          <span>Need someone to talk to? (Free & Confidential Counseling)</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-rose-700 ml-1" /> : <ChevronDown className="w-4 h-4 text-rose-700 ml-1" />}
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-rose-400 hover:text-rose-700 transition-colors"
          title="Dismiss card"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-rose-900 leading-relaxed">
        Dealing with online harassment, deepfake abuse, or digital scams can feel overwhelming. You do not have to navigate this alone. Free, compassionate counseling support is available 24/7.
      </p>

      {isOpen && (
        <div className="space-y-2 pt-2 border-t border-rose-200/80 animate-fade-in">
          <div className="space-y-2">
            {mentalHealthResources.map((res: MentalHealthResource) => (
              <div
                key={res.id}
                className="bg-white/90 border border-rose-200 rounded-xl p-2.5 space-y-1 hover:border-[#7A1F2B]/40 transition-colors"
              >
                <div className="flex items-center justify-between font-bold text-[#7A1F2B] text-xs">
                  <span>{res.name}</span>
                  <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full font-semibold">
                    {res.region}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">{res.description}</p>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 pt-1">
                  <span className="flex items-center gap-1 text-[#7A1F2B]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{res.hotline}</span>
                  </span>
                  <a
                    href={res.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7A1F2B] hover:underline flex items-center gap-1 font-semibold text-[10px]"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-rose-800 italic pt-1 text-center">
            All helplines operate independently with complete confidentiality and zero judgment.
          </p>
        </div>
      )}
    </div>
  );
};
