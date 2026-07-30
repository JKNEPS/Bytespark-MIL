import React from 'react';
import {
  Flame,
  Award,
  Sparkles,
  ShieldCheck,
  Gamepad2,
  Headphones,
  Users,
  CheckCircle2,
  HelpCircle,
  Trophy,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  userProfile: UserProfile;
  onGoHome?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onGoHome }) => {
  const xpPercentage = Math.min(
    100,
    Math.round((userProfile.xpPoints / userProfile.nextLevelXp) * 100)
  );

  const leaderboardUsers = [
    { rank: 1, name: 'Siddharth M.', level: 5, points: 2450, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { rank: 2, name: 'Alex Rivera (You)', level: userProfile.level, points: userProfile.xpPoints, avatar: userProfile.avatar, isUser: true },
    { rank: 3, name: 'Fatima Z.', level: 3, points: 810, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { rank: 4, name: 'Lucas S.', level: 2, points: 620, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
  ];

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto">
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-[#FDF2F4] hover:bg-[#F9E5E8] border border-[#7A1F2B]/20 px-3.5 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Screen</span>
        </button>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#7A1F2B] to-[#9B1B30]" />

        <div className="relative pt-6">
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-18 h-18 rounded-full border-4 border-white shadow-md mx-auto object-cover"
          />

          <h2 className="font-bold font-serif-title text-slate-900 text-lg mt-2">{userProfile.name}</h2>
          <p className="text-xs text-slate-500 font-medium">{userProfile.username}</p>

          <div className="inline-flex items-center gap-1.5 bg-[#FDF2F4] border border-[#7A1F2B]/20 px-3 py-1 rounded-full text-xs font-bold text-[#7A1F2B] mt-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F2B]" />
            <span>Level {userProfile.level}: {userProfile.levelTitle}</span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-4 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-slate-700">MIL Literacy Progress</span>
            <span className="text-[#7A1F2B]">{userProfile.xpPoints} / {userProfile.nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#7A1F2B] h-full rounded-full transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Earn {userProfile.nextLevelXp - userProfile.xpPoints} XP to unlock Level {userProfile.level + 1} "MIL Ambassador"!
          </p>
        </div>
      </div>

      {/* Streak & Core Metrics */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] text-[#7A1F2B] flex items-center justify-center shrink-0 border border-[#7A1F2B]/20">
            <Flame className="w-5 h-5 fill-[#7A1F2B]" />
          </div>
          <div>
            <span className="text-base font-black text-slate-900">{userProfile.streakDays} Days</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Streak</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-black text-slate-900">Rank #2</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Global Leaderboard</span>
          </div>
        </div>
      </div>

      {/* Engagement Across All Modalities Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#7A1F2B]" />
          <span>Multi-Modality Engagement Activity</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1 mb-0.5">
              <ShieldCheck className="w-3 h-3 text-[#7A1F2B]" /> Verifications
            </span>
            <span className="text-base font-black text-slate-900">{userProfile.verificationsCount} Claims</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1 mb-0.5">
              <HelpCircle className="w-3 h-3 text-[#7A1F2B]" /> Quizzes Passed
            </span>
            <span className="text-base font-black text-slate-900">{userProfile.quizzesCompleted} Challenges</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1 mb-0.5">
              <Gamepad2 className="w-3 h-3 text-[#7A1F2B]" /> Games Played
            </span>
            <span className="text-base font-black text-slate-900">{userProfile.gamesPlayed} Mini-Games</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1 mb-0.5">
              <Headphones className="w-3 h-3 text-[#7A1F2B]" /> Podcast Waves
            </span>
            <span className="text-base font-black text-slate-900">{userProfile.podcastsListened} Episodes</span>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#7A1F2B]" />
          <span>Unlocked Badges ({userProfile.badges.filter(b => b.unlocked).length} / {userProfile.badges.length})</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {userProfile.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 ${
                badge.unlocked
                  ? 'bg-[#FDF2F4] border-[#7A1F2B]/30 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  badge.unlocked ? 'bg-[#7A1F2B] text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{badge.title}</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Global Youth Leaderboard</span>
        </h3>

        <div className="space-y-2 text-xs">
          {leaderboardUsers.map((usr) => (
            <div
              key={usr.rank}
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                usr.isUser
                  ? 'bg-[#FDF2F4] border-[#7A1F2B] font-bold text-[#7A1F2B]'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 text-center font-black ${usr.rank === 1 ? 'text-amber-500 text-sm' : ''}`}>
                  #{usr.rank}
                </span>
                <img src={usr.avatar} alt={usr.name} className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <span className="font-bold text-slate-900 block">{usr.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Level {usr.level}</span>
                </div>
              </div>

              <span className="font-black text-[#7A1F2B]">{usr.points} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
