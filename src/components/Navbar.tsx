import React, { useState, useEffect } from 'react';
import { Flame, Award, Download, CheckCircle, Sparkles, EyeOff, ShieldAlert, Globe, Megaphone, Home, Laptop, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';
import { SupportedLanguage, languageOptions } from '../data/translations';

interface NavbarProps {
  userProfile: UserProfile;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  activeTab?: string;
  onGoHome?: () => void;
  onOpenProfile: () => void;
  onOpenVictimModal?: () => void;
  onOpenSOSModal?: () => void;
  onOpenWhistleblowerModal?: () => void;
  onOpenSpotTheFakeModal?: () => void;
  deviceMode?: 'laptop' | 'mobile';
  onToggleDeviceMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  currentLanguage,
  onLanguageChange,
  activeTab = 'home',
  onGoHome,
  onOpenProfile,
  onOpenVictimModal,
  onOpenSOSModal,
  onOpenWhistleblowerModal,
  onOpenSpotTheFakeModal,
  deviceMode = 'mobile',
  onToggleDeviceMode
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      });
    } else {
      alert('To install Bytespark MIL on your home screen, tap your browser menu and select "Add to Home Screen" or "Install App".');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E0E0E0] shadow-xs pt-safe">
      <div className={`${deviceMode === 'laptop' ? 'max-w-5xl' : 'max-w-md'} mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-1.5 transition-all duration-300`}>
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          {activeTab !== 'home' && onGoHome ? (
            <button
              onClick={onGoHome}
              title="Return to Home Screen"
              className="flex items-center gap-1.5 bg-[#7A1F2B] text-white hover:bg-[#5A131E] px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs border border-[#5A131E]"
            >
              <Home className="w-3.5 h-3.5 text-amber-300" />
              <span>Home</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenProfile}>
              <div className="w-8 h-8 rounded-xl bg-[#7A1F2B] text-white flex items-center justify-center font-bold text-base shadow-sm border border-[#5A131E] shrink-0">
                <span className="font-serif-title text-lg">B</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-900 tracking-tight text-sm">Bytespark</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#7A1F2B] text-white uppercase tracking-wider">
                    MIL
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 font-medium leading-none">UNESCO Youth</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions & Status Indicators */}
        <div className="flex items-center gap-1">
          {/* Device Screen Ratio Toggle Button */}
          {onToggleDeviceMode && (
            <button
              onClick={onToggleDeviceMode}
              title={deviceMode === 'laptop' ? 'Switch to Mobile App Screen Ratio' : 'Switch to Laptop Screen Ratio'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[#7A1F2B] text-[11px] font-bold border border-slate-200 transition-colors"
            >
              {deviceMode === 'laptop' ? (
                <>
                  <Laptop className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Laptop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </>
              )}
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 rounded-full px-2 py-1 text-[11px] font-bold text-slate-800 transition-colors">
            <Globe className="w-3 h-3 text-[#7A1F2B] mr-1 shrink-0" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer appearance-none pr-1"
            >
              {languageOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.flag} {opt.code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Spot the Fake IQ Game Button */}
          {onOpenSpotTheFakeModal && (
            <button
              onClick={onOpenSpotTheFakeModal}
              title="Spot the Fake — Check Your Media Literacy IQ"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-[#7A1F2B] hover:from-amber-600 hover:to-[#5A131E] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs transition-all"
            >
              <span className="text-xs">🔍</span>
              <span>IQ Game</span>
            </button>
          )}

          {/* Emergency SOS High Priority Pill */}
          {onOpenSOSModal && (
            <button
              onClick={onOpenSOSModal}
              title="Emergency SOS Fast-Track"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-2xs transition-all animate-pulse"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              <span>SOS</span>
            </button>
          )}

          {/* Anonymous Whistleblower Icon */}
          {onOpenWhistleblowerModal && (
            <button
              onClick={onOpenWhistleblowerModal}
              title="Anonymous Whistleblower Mode"
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#7A1F2B] transition-colors border border-slate-200"
            >
              <Megaphone className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Streak pill */}
          <div className="hidden sm:flex items-center gap-1 bg-[#FDF2F4] text-[#7A1F2B] border border-[#7A1F2B]/20 px-2 py-0.5 rounded-full text-[11px] font-bold">
            <Flame className="w-3 h-3 text-[#7A1F2B] fill-[#7A1F2B]" />
            <span>{userProfile.streakDays}d</span>
          </div>

          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              title="Install App"
              className="p-1.5 rounded-full bg-[#7A1F2B] text-white hover:bg-[#5A131E] transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

