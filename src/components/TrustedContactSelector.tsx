import React, { useState } from 'react';
import { Users, Mail, Phone, CheckCircle, Send, ShieldCheck, HeartHandshake } from 'lucide-react';
import { partnerNGOs, PartnerNGO } from '../data/selfDefenseData';

interface TrustedContactSelectorProps {
  onContactSelected?: (contactInfo: { type: 'ngo' | 'custom'; nameOrDetail: string }) => void;
}

export const TrustedContactSelector: React.FC<TrustedContactSelectorProps> = ({
  onContactSelected
}) => {
  const [selectedType, setSelectedType] = useState<'none' | 'ngo' | 'custom'>('none');
  const [selectedNgoId, setSelectedNgoId] = useState<string>(partnerNGOs[0].id);
  const [customContact, setCustomContact] = useState<string>('');
  const [isNotified, setIsNotified] = useState<boolean>(false);

  const handleApply = () => {
    setIsNotified(true);
    let detail = '';
    if (selectedType === 'ngo') {
      const ngo = partnerNGOs.find(n => n.id === selectedNgoId);
      detail = ngo ? ngo.name : 'Partner Support Organization';
    } else if (selectedType === 'custom') {
      detail = customContact.trim() || 'Custom Trusted Contact';
    }

    if (onContactSelected) {
      onContactSelected({ type: selectedType === 'ngo' ? 'ngo' : 'custom', nameOrDetail: detail });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <HeartHandshake className="w-4 h-4 text-[#7A1F2B]" />
          <span>Notify a Trusted Contact or Support NGO (Optional)</span>
        </div>
        <span className="text-[10px] bg-slate-200 font-semibold px-2 py-0.5 rounded-full text-slate-700">
          Privacy Safe
        </span>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed">
        You can choose to dispatch an automated referral notice to a partner support organization or a personal trusted contact. <strong>Bytespark does not link your identity to your report.</strong>
      </p>

      {/* Options */}
      <div className="space-y-2 pt-1">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input
            type="radio"
            name="trusted_contact_type"
            checked={selectedType === 'none'}
            onChange={() => { setSelectedType('none'); setIsNotified(false); }}
            className="text-[#7A1F2B] focus:ring-[#7A1F2B]"
          />
          <span>Do not notify third-party contacts for now</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input
            type="radio"
            name="trusted_contact_type"
            checked={selectedType === 'ngo'}
            onChange={() => { setSelectedType('ngo'); setIsNotified(false); }}
            className="text-[#7A1F2B] focus:ring-[#7A1F2B]"
          />
          <span>Select Verified Partner Legal / Crisis Support NGO</span>
        </label>

        {selectedType === 'ngo' && (
          <div className="pl-6 space-y-2 animate-fade-in">
            <select
              value={selectedNgoId}
              onChange={(e) => setSelectedNgoId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#7A1F2B]"
            >
              {partnerNGOs.map((ngo) => (
                <option key={ngo.id} value={ngo.id}>
                  {ngo.name} ({ngo.region}) - {ngo.focus}
                </option>
              ))}
            </select>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
          <input
            type="radio"
            name="trusted_contact_type"
            checked={selectedType === 'custom'}
            onChange={() => { setSelectedType('custom'); setIsNotified(false); }}
            className="text-[#7A1F2B] focus:ring-[#7A1F2B]"
          />
          <span>Enter Personal Trusted Contact Method (Email or Phone)</span>
        </label>

        {selectedType === 'custom' && (
          <div className="pl-6 space-y-2 animate-fade-in">
            <input
              type="text"
              value={customContact}
              onChange={(e) => setCustomContact(e.target.value)}
              placeholder="e.g. advocate@myfamily.org or +977 9801234567"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#7A1F2B]"
            />
          </div>
        )}
      </div>

      {selectedType !== 'none' && !isNotified && (
        <button
          type="button"
          onClick={handleApply}
          className="mt-2 w-full bg-[#7A1F2B] text-white font-bold text-xs py-2 rounded-xl hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-amber-300" />
          <span>Confirm Trusted Referral Dispatch</span>
        </button>
      )}

      {isNotified && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-2.5 flex items-center gap-2 font-bold text-[11px] animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Referral dispatch confirmed! The designated contact will receive encrypted report status updates.</span>
        </div>
      )}
    </div>
  );
};
