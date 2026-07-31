import React from 'react';
import { Laptop, Smartphone, Check, Sparkles } from 'lucide-react';

export type DeviceMode = 'laptop' | 'mobile';

interface DeviceSelectionModalProps {
  isOpen: boolean;
  onSelectMode: (mode: DeviceMode) => void;
}

export const DeviceSelectionModal: React.FC<DeviceSelectionModalProps> = ({
  isOpen,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#181119] to-[#3a0f16] text-white flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 relative overflow-x-hidden">
      {/* Top Brand Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-rose-300 uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Bytespark MIL • Protected Platform</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-title tracking-tight text-white drop-shadow-sm">
          Welcome to Bytespark MIL
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
          Before entering the platform, please select your current device type so we can display the application in your ideal screen ratio immediately.
        </p>
      </div>

      {/* Main Choice Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 text-slate-900 relative overflow-hidden">
        {/* Decorative Top Accent Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7A1F2B] via-rose-600 to-amber-500" />

        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Which device are you accessing from?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose your device mode below to launch the application:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* Laptop / Desktop Option */}
          <button
            onClick={() => onSelectMode('laptop')}
            className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-slate-200 hover:border-[#7A1F2B] bg-slate-50 hover:bg-[#FDF2F4]/70 transition-all shadow-xs hover:shadow-lg cursor-pointer relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-white text-[#7A1F2B] flex items-center justify-center mb-4 shadow-sm border border-slate-200 group-hover:bg-[#7A1F2B] group-hover:text-white transition-colors">
              <Laptop className="w-7 h-7" />
            </div>
            <span className="font-bold text-slate-900 text-lg group-hover:text-[#7A1F2B]">
              Laptop / Desktop
            </span>
            <span className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Widescreen laptop app ratio with expanded horizontal layout & full workspace view
            </span>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-white px-3.5 py-1.5 rounded-full border border-slate-200 group-hover:border-[#7A1F2B] group-hover:bg-[#7A1F2B] group-hover:text-white transition-all">
              <span>Choose Laptop Ratio</span>
              <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* Mobile Phone Option */}
          <button
            onClick={() => onSelectMode('mobile')}
            className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-slate-200 hover:border-[#7A1F2B] bg-slate-50 hover:bg-[#FDF2F4]/70 transition-all shadow-xs hover:shadow-lg cursor-pointer relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-white text-[#7A1F2B] flex items-center justify-center mb-4 shadow-sm border border-slate-200 group-hover:bg-[#7A1F2B] group-hover:text-white transition-colors">
              <Smartphone className="w-7 h-7" />
            </div>
            <span className="font-bold text-slate-900 text-lg group-hover:text-[#7A1F2B]">
              Mobile Phone
            </span>
            <span className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Standard mobile app screen ratio optimized for vertical mobile screens & touch
            </span>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-white px-3.5 py-1.5 rounded-full border border-slate-200 group-hover:border-[#7A1F2B] group-hover:bg-[#7A1F2B] group-hover:text-white transition-all">
              <span>Choose Mobile Ratio</span>
              <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400">
            💡 You can switch between Laptop and Mobile screen ratio anytime using the toggle button at the top of the app.
          </p>
        </div>
      </div>

      {/* Footer copyright note */}
      <div className="mt-8 text-xs text-slate-400 text-center">
        © {new Date().getFullYear()} Bytespark MIL • Empowering Verified Media Literacy
      </div>
    </div>
  );
};
