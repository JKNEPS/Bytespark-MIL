import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Users, Database, Flag, Check, X, Search, RefreshCw, Lock, ExternalLink, Send, Shield } from 'lucide-react';
import { FlaggedSource } from '../types';

export interface RepeatOffenderItem {
  targetHandleOrDomain: string;
  reportCount: number;
  categories: string[];
  sources: string[];
  isRepeatOffender: boolean; // >= 3
  riskLevel: 'HIGH' | 'CRITICAL' | 'MODERATE';
  firstReported: string;
  lastReported: string;
  escalatedToPolice: boolean;
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  flaggedSources?: FlaggedSource[];
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  flaggedSources = []
}) => {
  const [activeTab, setActiveTab] = useState<'offenders' | 'queue' | 'volunteers'>('offenders');
  const [offenders, setOffenders] = useState<RepeatOffenderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<boolean>(false);

  // Load Repeat Offender data
  const loadRepeatOffenders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/repeat-offenders');
      if (res.ok) {
        const data = await res.json();
        setOffenders(data);
      } else {
        // Fallback mock aggregator if API endpoint is fresh
        generateFallbackOffenders();
      }
    } catch (e) {
      generateFallbackOffenders();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackOffenders = () => {
    const mockData: RepeatOffenderItem[] = [
      {
        targetHandleOrDomain: '@deepfake_leak_network',
        reportCount: 8,
        categories: ['Non-Consensual Deepfakes', 'Impersonation'],
        sources: ['Telegram Channel', 'X/Twitter', 'TikTok'],
        isRepeatOffender: true,
        riskLevel: 'CRITICAL',
        firstReported: '2026-07-20',
        lastReported: '2026-07-30',
        escalatedToPolice: true
      },
      {
        targetHandleOrDomain: 'crypto-lottery-nepal-scam.com',
        reportCount: 5,
        categories: ['Phishing / Financial Scam', 'Whistleblower Report'],
        sources: ['Facebook Ads', 'SMS Link'],
        isRepeatOffender: true,
        riskLevel: 'HIGH',
        firstReported: '2026-07-22',
        lastReported: '2026-07-29',
        escalatedToPolice: true
      },
      {
        targetHandleOrDomain: '@health_miracle_cure_np',
        reportCount: 4,
        categories: ['Dangerous Health Rumors'],
        sources: ['Instagram Reels', 'WhatsApp Groups'],
        isRepeatOffender: true,
        riskLevel: 'HIGH',
        firstReported: '2026-07-25',
        lastReported: '2026-07-30',
        escalatedToPolice: false
      },
      {
        targetHandleOrDomain: 'viral-election-fake-news.net',
        reportCount: 2,
        categories: ['Election Misinformation'],
        sources: ['Web Blog'],
        isRepeatOffender: false,
        riskLevel: 'MODERATE',
        firstReported: '2026-07-28',
        lastReported: '2026-07-28',
        escalatedToPolice: false
      }
    ];
    setOffenders(mockData);
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadRepeatOffenders();
    }
  }, [isOpen, isAuthenticated]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo admin pass: "admin123" or "bytespark"
    if (passcode.trim().toLowerCase() === 'admin123' || passcode.trim().toLowerCase() === 'bytespark' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
      loadRepeatOffenders();
    } else {
      setAuthError(true);
    }
  };

  const togglePoliceEscalation = (targetHandleOrDomain: string) => {
    setOffenders(prev =>
      prev.map(item =>
        item.targetHandleOrDomain === targetHandleOrDomain
          ? { ...item, escalatedToPolice: !item.escalatedToPolice }
          : item
      )
    );
  };

  if (!isOpen) return null;

  const filteredOffenders = offenders.filter(o =>
    o.targetHandleOrDomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-slate-300 overflow-hidden text-slate-800 flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Admin Header */}
        <div className="bg-[#7A1F2B] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                <span>Internal Admin Access Only</span>
              </div>
              <h3 className="font-bold text-base font-serif-title leading-tight">
                Repeat-Offender Pattern Tracker & Queue
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 text-rose-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Passcode Gate */
          <div className="p-6 text-center space-y-4 my-auto text-xs">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#7A1F2B] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Admin Authentication Required</h4>
              <p className="text-slate-600 text-[11px] max-w-xs mx-auto">
                Repeat offender aggregation data is strictly internal to prevent public vigilante targeting. Enter admin passcode to unlock.
              </p>
            </div>

            <form onSubmit={handleAdminAuth} className="max-w-xs mx-auto space-y-2">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Passcode (e.g. admin123)"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 text-center font-bold focus:outline-none focus:border-[#7A1F2B]"
              />
              {authError && (
                <p className="text-rose-600 font-bold text-[11px]">Incorrect admin passcode. Try 'admin123'.</p>
              )}
              <button
                type="submit"
                className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-[#5A131E] transition-colors"
              >
                Authenticate Admin Session
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            
            {/* Warning Banner: Internal Only */}
            <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3 rounded-2xl flex items-center gap-2.5 text-[11px]">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Strict Confidentiality:</strong> Data on this dashboard aggregates target handles appearing 3+ times. Do not publish list publicly.
              </span>
            </div>

            {/* Search and Refresh Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter repeat offender handles or domain URLs..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#7A1F2B]"
                />
              </div>
              <button
                onClick={loadRepeatOffenders}
                className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                title="Refresh aggregation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Repeat Offender List Stack */}
            <div className="space-y-3">
              {filteredOffenders.map((offender, idx) => (
                <div
                  key={idx}
                  className={`bg-white border rounded-2xl p-4 shadow-2xs space-y-2.5 transition-all ${
                    offender.isRepeatOffender
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                          {offender.targetHandleOrDomain}
                        </span>
                        {offender.isRepeatOffender && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">
                            🚨 REPEAT OFFENDER (3+ Reports)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        First reported: {offender.firstReported} • Last active: {offender.lastReported}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-base text-[#7A1F2B]">
                        {offender.reportCount}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Flags
                      </span>
                    </div>
                  </div>

                  {/* Categories & Sources */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {offender.categories.map((cat, cIdx) => (
                      <span key={cIdx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        {cat}
                      </span>
                    ))}
                    {offender.sources.map((src, sIdx) => (
                      <span key={sIdx} className="bg-rose-50 text-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-rose-100">
                        Source: {src}
                      </span>
                    ))}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => togglePoliceEscalation(offender.targetHandleOrDomain)}
                      className={`font-bold px-3 py-1.5 rounded-xl text-[11px] transition-colors flex items-center gap-1.5 ${
                        offender.escalatedToPolice
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-[#7A1F2B] text-white hover:bg-[#5A131E]'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>
                        {offender.escalatedToPolice
                          ? 'Escalated to Cyber Bureau'
                          : 'Escalate Dossier to Police'}
                      </span>
                    </button>

                    <span className="text-[10px] text-slate-500 italic">
                      Surfaced to Volunteer Response Team
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#7A1F2B]">
            <Shield className="w-3.5 h-3.5" />
            <span>Bytespark Internal Admin Portal</span>
          </span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 text-xs px-3 py-1"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
