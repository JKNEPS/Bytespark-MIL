import React from 'react';
import { Home, ShieldCheck, Sparkles, Globe, Scale, Compass, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  deviceMode?: 'laptop' | 'mobile';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, deviceMode = 'mobile' }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Feed', icon: Home },
    { id: 'verify' as TabType, label: 'Verify', icon: ShieldCheck, badge: 'AI' },
    { id: 'authenticity' as TabType, label: 'Authenticity', icon: Sparkles },
    { id: 'source' as TabType, label: 'Source', icon: Globe },
    { id: 'debate' as TabType, label: 'Debate', icon: Scale },
    { id: 'explore' as TabType, label: 'Explore', icon: Compass },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E0E0E0] pb-safe shadow-lg">
      <div className={`${deviceMode === 'laptop' ? 'max-w-5xl' : 'max-w-md'} mx-auto px-1 flex items-center justify-between h-15 overflow-x-auto no-scrollbar transition-all duration-300`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[52px] flex-1 py-1 transition-all duration-200 ${
                isActive ? 'text-[#7A1F2B]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#7A1F2B]' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#7A1F2B] text-white text-[8px] font-extrabold px-1 py-0.2 rounded-full border border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium tracking-tight whitespace-nowrap ${isActive ? 'font-bold text-[#7A1F2B]' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-[#7A1F2B] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
