import React, { useState } from 'react';
import { Scale, Globe, Phone, Mail, ExternalLink, ShieldCheck, Info, FileText, CheckCircle2, Bookmark, ArrowLeft } from 'lucide-react';
import { countryLegalData, LegalCountryInfo } from '../data/legalData';

interface LegalRightsViewProps {
  onRewardXP?: (amount: number) => void;
  onGoHome?: () => void;
}

export const LegalRightsView: React.FC<LegalRightsViewProps> = ({ onRewardXP, onGoHome }) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('np');
  const [bookmarkedCountries, setBookmarkedCountries] = useState<string[]>(['np']);

  const activeCountry: LegalCountryInfo =
    countryLegalData.find(c => c.id === selectedCountryId) || countryLegalData[0];

  const toggleBookmark = (id: string) => {
    if (bookmarkedCountries.includes(id)) {
      setBookmarkedCountries(bookmarkedCountries.filter(c => c !== id));
    } else {
      setBookmarkedCountries([...bookmarkedCountries, id]);
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
      
      {/* Module Title Banner */}
      <div className="bg-[#7A1F2B] text-white rounded-3xl p-5 shadow-xs relative overflow-hidden space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
          <Scale className="w-4 h-4" />
          <span>Know Your Digital Rights</span>
        </div>
        <h2 className="text-xl font-bold font-serif-title leading-tight">
          Global Cybercrime & Deepfake Legal Guide
        </h2>
        <p className="text-xs text-white/80 leading-relaxed">
          Plain-language summaries of non-consensual synthetic media laws, statutory reporting deadlines, and official police portals worldwide.
        </p>
      </div>

      {/* Country Selector Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs space-y-3">
        <label className="block text-xs font-bold text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#7A1F2B]" />
            <span>Select Jurisdiction / Country:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">
            {countryLegalData.length} Countries Pre-Verified
          </span>
        </label>

        <select
          value={selectedCountryId}
          onChange={(e) => {
            setSelectedCountryId(e.target.value);
            if (onRewardXP) onRewardXP(5);
          }}
          className="w-full text-xs p-3 rounded-2xl border border-slate-300 bg-slate-50 font-bold focus:outline-none focus:border-[#7A1F2B] cursor-pointer"
        >
          {countryLegalData.map((c) => (
            <option key={c.id} value={c.id}>
              {c.flag} {c.country} ({c.agencyName})
            </option>
          ))}
        </select>
      </div>

      {/* Main Selected Country Info Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4 animate-fade-in">
        
        {/* Country Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeCountry.flag}</span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{activeCountry.country}</h3>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Deepfake Laws Active</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleBookmark(activeCountry.id)}
            className={`p-2 rounded-2xl border transition-colors ${
              bookmarkedCountries.includes(activeCountry.id)
                ? 'bg-[#FDF2F4] border-[#7A1F2B] text-[#7A1F2B]'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
            }`}
            title="Bookmark jurisdiction"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Legal Summary */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#7A1F2B]" />
            <span>Plain-Language Legal Summary</span>
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {activeCountry.legalSummary}
          </p>
        </div>

        {/* Key Statutory Acts */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-xs text-slate-900">Key Applicable Acts & Statutes:</h4>
          <ul className="space-y-1 text-xs text-slate-700">
            {activeCountry.keyActs.map((act, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7A1F2B] shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Official Designated Agency Box */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2 text-rose-950">
          <div className="flex items-center justify-between font-bold text-xs text-rose-900">
            <span>Designated Cybercrime Agency</span>
            <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded-full font-bold">Official Hotline</span>
          </div>

          <p className="font-bold text-sm text-slate-900">{activeCountry.agencyName}</p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-rose-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#7A1F2B] shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Helpline</span>
                <span className="font-bold text-slate-900 font-mono text-[11px]">{activeCountry.agencyHotline}</span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-rose-200 flex items-center gap-2 truncate">
              <Mail className="w-4 h-4 text-[#7A1F2B] shrink-0" />
              <div className="truncate">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Email</span>
                <span className="font-semibold text-slate-900 text-[10px] truncate block">{activeCountry.agencyEmail}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-rose-900 italic pt-1">{activeCountry.notes}</p>

          <a
            href={activeCountry.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2 bg-[#7A1F2B] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-2"
          >
            <span>Launch Official {activeCountry.country} Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
          </a>
        </div>
      </div>

      {/* Architectural Roadmap Note */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 text-[11px] text-slate-600 space-y-1">
        <strong className="text-slate-800 flex items-center gap-1.5 font-bold">
          <Info className="w-3.5 h-3.5 text-[#7A1F2B]" />
          <span>Hackathon Build & Roadmap Architecture Note:</span>
        </strong>
        <p className="leading-relaxed text-[10px]">
          Legal frameworks are pre-verified for 10 initial nations. The underlying JSON/REST API architecture is engineered to dynamically sync statutory updates for all UN member states post-hackathon.
        </p>
      </div>

    </div>
  );
};
