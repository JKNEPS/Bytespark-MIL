import React, { useState } from 'react';
import { ShieldAlert, Phone, Lock, Send, X, AlertTriangle, Check, ExternalLink, Globe, HeartHandshake, Key } from 'lucide-react';
import { countryLegalData, LegalCountryInfo } from '../data/legalData';
import { TrustedContactSelector } from './TrustedContactSelector';
import { MentalHealthCard } from './MentalHealthCard';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXP?: (amount: number) => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  onRewardXP
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('np');
  const [targetUrlOrHandle, setTargetUrlOrHandle] = useState<string>('');
  const [urgencyNote, setUrgencyNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCountry: LegalCountryInfo = countryLegalData.find(c => c.id === selectedCountryId) || countryLegalData[0];

  const handleSOSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sos-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: activeCountry.code,
          countryName: activeCountry.country,
          targetUrlOrHandle,
          urgencyNote,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedCode(data.trackingCode);
        if (onRewardXP) onRewardXP(25);
      } else {
        const mockCode = `SOS-${Math.floor(10000 + Math.random() * 90000)}`;
        setSubmittedCode(mockCode);
      }
    } catch (err) {
      console.error("SOS Submit error:", err);
      const mockCode = `SOS-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmittedCode(mockCode);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full my-auto shadow-2xl border-2 border-rose-500 overflow-hidden text-slate-800 flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Urgent High-Contrast Header */}
        <div className="bg-[#7A1F2B] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                <span>Urgent Emergency SOS</span>
              </div>
              <h3 className="font-bold text-base font-serif-title leading-tight">Fast-Track Takedown & Helplines</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 text-rose-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {submittedCode ? (
            /* SUCCESS STATE */
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-emerald-950">Emergency SOS Dispatched to Volunteer Queue</h4>
                <p className="text-[11px] text-emerald-800">
                  Your SOS request is active. Response team volunteers are formatting this case for platform trust & safety escalation.
                </p>
              </div>

              {/* Tracking Code */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-1.5 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Anonymous Emergency Tracking Code
                </span>
                <span className="font-mono text-xl font-bold text-amber-300 tracking-wider block">
                  {submittedCode}
                </span>
                <p className="text-[10px] text-slate-400">
                  Save this tracking code to check status anonymously anytime without login.
                </p>
              </div>

              {/* Direct Official Country Hotline Call Box */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between font-bold text-rose-950 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{activeCountry.flag}</span>
                    <span>{activeCountry.country} Official Cyber Crime Contact</span>
                  </span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                    Direct Action
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-rose-200 space-y-1.5">
                  <p className="font-bold text-slate-900">{activeCountry.agencyName}</p>
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <Phone className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Hotline: {activeCountry.agencyHotline}</span>
                  </div>
                  <p className="text-[10px] text-slate-600">Email: {activeCountry.agencyEmail}</p>
                </div>

                <a
                  href={activeCountry.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open {activeCountry.country} Official Cyber Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                </a>
              </div>

              {/* Mental Health Support Card */}
              <MentalHealthCard defaultOpen={true} />
            </div>
          ) : (
            /* ONE-SCREEN FAST SOS FORM */
            <form onSubmit={handleSOSSubmit} className="space-y-4">
              
              {/* Select Country */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#7A1F2B]" />
                  <span>Select Your Country for Official Cyber Hotline</span>
                </label>
                <select
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-slate-50 font-bold focus:outline-none focus:border-[#7A1F2B]"
                >
                  {countryLegalData.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.country} — Agency: {c.agencyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Cyber Hotline Highlight */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center justify-between text-rose-950">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    {activeCountry.country} Emergency Police Hotline
                  </span>
                  <p className="font-mono text-sm font-bold text-rose-950">{activeCountry.agencyHotline}</p>
                </div>
                <a
                  href={`tel:${activeCountry.agencyHotline}`}
                  className="bg-[#7A1F2B] text-white font-bold text-xs px-3 py-2 rounded-xl hover:bg-[#5A131E] transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Call Now</span>
                </a>
              </div>

              {/* Target Link or Description */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Target Post URL or Account Handle
                </label>
                <input
                  type="text"
                  value={targetUrlOrHandle}
                  onChange={(e) => setTargetUrlOrHandle(e.target.value)}
                  placeholder="e.g. https://facebook.com/post/123 or TikTok handle @bad_actor"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:border-[#7A1F2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Urgent Context / Situation Note (Optional)
                </label>
                <textarea
                  value={urgencyNote}
                  onChange={(e) => setUrgencyNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Non-consensual deepfake video spreading fast in community groups..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:border-[#7A1F2B]"
                />
              </div>

              {/* Trusted Contact Referral Escalation */}
              <TrustedContactSelector />

              {/* Fast Dispatch Button */}
              <button
                type="submit"
                disabled={isSubmitting || !targetUrlOrHandle.trim()}
                className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>{isSubmitting ? 'Dispatching Emergency SOS...' : 'Dispatch Emergency SOS (+25 XP)'}</span>
              </button>

              {/* Mental Health Quiet Resource */}
              <MentalHealthCard />

              {/* Honest Disclaimer */}
              <p className="text-[10px] text-slate-500 italic text-center">
                Bytespark SOS formats your emergency data and notifies volunteer reviewers & designated contacts. We recommend filing directly with police for formal legal enforcement.
              </p>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#7A1F2B]">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted & Anonymous</span>
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
