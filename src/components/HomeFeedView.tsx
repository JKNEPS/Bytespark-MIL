import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, MessageSquare, Heart, ArrowUpRight, Filter, Sparkles, AlertTriangle, EyeOff, Lock, ArrowRight, Megaphone, Scale, ShieldCheck, Users, Shield, ChevronRight } from 'lucide-react';
import { FeedItem, ClaimCategory, FeedArticle } from '../types';
import { PrebunkQuizCard } from './PrebunkQuizCard';

interface HomeFeedViewProps {
  feedItems: FeedItem[];
  onVerifyClaim: (claimText: string, imageBase64?: string) => void;
  onAnswerQuiz: (points: number) => void;
  onOpenVerifyTab: () => void;
  onOpenVictimModal?: () => void;
  onOpenSOSModal?: () => void;
  onOpenWhistleblowerModal?: () => void;
  onOpenLegalRights?: () => void;
  onOpenSelfDefense?: () => void;
  onOpenResponseTeam?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenSpotTheFakeModal?: () => void;
}

const FeedImageWithFallback: React.FC<{ imageUrl: string; title: string; category: string }> = ({ imageUrl, title, category }) => {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  const categoryFallbacks: Record<string, string> = {
    'Climate': 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    'Deepfakes': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
    'Satire': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    'Elections': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    'default': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
  };

  const handleError = () => {
    const fallback = categoryFallbacks[category] || categoryFallbacks.default;
    if (imgSrc !== fallback && !hasError) {
      setImgSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-slate-900 via-[#7A1F2B]/80 to-slate-800 border border-slate-700 flex flex-col items-center justify-center p-6 text-center text-white">
        <ShieldAlert className="w-9 h-9 text-amber-400 mb-2" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-900/40 px-2.5 py-0.5 rounded-full mb-1">
          {category} Media Inspection
        </span>
        <p className="text-xs font-bold line-clamp-2 px-2 text-white/90">{title}</p>
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          <span>Viral Claim</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
      <img
        src={imgSrc}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        referrerPolicy="no-referrer"
        onError={handleError}
      />
      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
        <ShieldAlert className="w-3 h-3 text-amber-400" />
        <span>Viral Claim</span>
      </div>
    </div>
  );
};

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  feedItems,
  onVerifyClaim,
  onAnswerQuiz,
  onOpenVerifyTab,
  onOpenVictimModal,
  onOpenSOSModal,
  onOpenWhistleblowerModal,
  onOpenLegalRights,
  onOpenSelfDefense,
  onOpenResponseTeam,
  onOpenAdminDashboard,
  onOpenSpotTheFakeModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ClaimCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});

  const categories: (ClaimCategory | 'All')[] = [
    'All',
    'Deepfakes',
    'AI Ethics',
    'Elections',
    'Health',
    'Satire',
    'Climate'
  ];

  const filteredItems = feedItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (item.type === 'article') {
        matchesSearch = item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.claimText.toLowerCase().includes(q);
      } else {
        matchesSearch = item.title.toLowerCase().includes(q) || item.question.toLowerCase().includes(q);
      }
    }
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedArticles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto">
      {/* Top Banner - UNESCO Youth Ecosystem */}
      <div className="bg-[#7A1F2B] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UNESCO Global Youth Ecosystem</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-title leading-snug mb-1.5">
            Spot Misinformation. Take Action.
          </h2>
          <p className="text-xs text-white/80 font-normal mb-4 max-w-xs leading-relaxed">
            Analyze claims with AI vision, prebunk viral rumors, and earn youth MIL certification.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenVerifyTab}
              className="inline-flex items-center gap-2 bg-white text-[#7A1F2B] font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-slate-100 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-[#7A1F2B]" />
              <span>Verify a Claim</span>
            </button>
            {onOpenSpotTheFakeModal && (
              <button
                onClick={onOpenSpotTheFakeModal}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
              >
                <span>🔍</span>
                <span>Spot the Fake IQ Game</span>
              </button>
            )}
            {onOpenSOSModal && (
              <button
                onClick={onOpenSOSModal}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-colors uppercase tracking-wider"
              >
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span>Emergency SOS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Spot the Fake IQ Game Banner */}
      {onOpenSpotTheFakeModal && (
        <div
          onClick={onOpenSpotTheFakeModal}
          className="bg-gradient-to-r from-[#16233F] via-[#1F3358] to-[#16233F] border-2 border-amber-500/40 hover:border-amber-400 text-[#FBF3E3] rounded-2xl p-4 shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F5B942] to-amber-600 flex items-center justify-center text-slate-900 font-extrabold text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              🔍
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#4FB6E8] mb-0.5">
                <span>Check Your Media Literacy IQ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-amber-300">64 Cases</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                Spot the Fake — Junior Fact Detectives
              </h3>
              <p className="text-xs text-[#FBF3E3]/70 font-medium line-clamp-1">
                Spot misleading headlines, false stats & viral hoaxes across Easy to Extreme detective levels.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-extrabold px-3.5 py-2 rounded-xl transition-colors shadow-xs">
            <span>Play Now</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Persistent Emergency SOS High-Contrast Bar */}
      {onOpenSOSModal && (
        <div 
          onClick={onOpenSOSModal}
          className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl p-3.5 shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm text-white block uppercase tracking-wider">
                Emergency SOS Fast-Track
              </span>
              <p className="text-[11px] text-white/90">
                1-Tap Emergency Report & Country Cyber Bureau Helplines
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-300 shrink-0" />
        </div>
      )}

      {/* Feature Quick Action Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Whistleblower Mode Card */}
        {onOpenWhistleblowerModal && (
          <div
            onClick={onOpenWhistleblowerModal}
            className="bg-white border border-slate-200 hover:border-[#7A1F2B] rounded-2xl p-3 shadow-2xs transition-all cursor-pointer space-y-1 group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FDF2F4] text-[#7A1F2B] flex items-center justify-center font-bold">
              <Megaphone className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-[#7A1F2B] text-xs transition-colors">
              Whistleblower Mode
            </h4>
            <p className="text-[10px] text-slate-500 leading-tight">
              Report scams & fake campaigns anonymously
            </p>
          </div>
        )}

        {/* Victim Takedown Card */}
        {onOpenVictimModal && (
          <div
            onClick={onOpenVictimModal}
            className="bg-white border border-slate-200 hover:border-[#7A1F2B] rounded-2xl p-3 shadow-2xs transition-all cursor-pointer space-y-1 group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FDF2F4] text-[#7A1F2B] flex items-center justify-center font-bold">
              <EyeOff className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-[#7A1F2B] text-xs transition-colors">
              Victim Takedown Assist
            </h4>
            <p className="text-[10px] text-slate-500 leading-tight">
              Fast-track non-consensual deepfake removal
            </p>
          </div>
        )}

        {/* Digital Self-Defense Card */}
        {onOpenSelfDefense && (
          <div
            onClick={onOpenSelfDefense}
            className="bg-white border border-slate-200 hover:border-[#7A1F2B] rounded-2xl p-3 shadow-2xs transition-all cursor-pointer space-y-1 group"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#7A1F2B] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-[#7A1F2B] text-xs transition-colors">
              Protect Yourself
            </h4>
            <p className="text-[10px] text-slate-500 leading-tight">
              Evidence preservation & privacy guides
            </p>
          </div>
        )}

        {/* Know Your Rights Card */}
        {onOpenLegalRights && (
          <div
            onClick={onOpenLegalRights}
            className="bg-white border border-slate-200 hover:border-[#7A1F2B] rounded-2xl p-3 shadow-2xs transition-all cursor-pointer space-y-1 group"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#7A1F2B] flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-[#7A1F2B] text-xs transition-colors">
              Know Your Rights
            </h4>
            <p className="text-[10px] text-slate-500 leading-tight">
              Deepfake laws & country police portals
            </p>
          </div>
        )}
      </div>

      {/* Admin Dashboard & Response Team Shortcuts */}
      <div className="flex items-center gap-2 text-xs">
        {onOpenResponseTeam && (
          <button
            onClick={onOpenResponseTeam}
            className="flex-1 bg-white border border-slate-200 hover:border-[#7A1F2B] p-2.5 rounded-2xl text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all"
          >
            <Users className="w-3.5 h-3.5 text-[#7A1F2B]" />
            <span>Response Team</span>
          </button>
        )}
        {onOpenAdminDashboard && (
          <button
            onClick={onOpenAdminDashboard}
            className="flex-1 bg-slate-900 text-white hover:bg-slate-800 p-2.5 rounded-2xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin Offender Tracker</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search viral claims, deepfakes, or topics..."
          className="w-full bg-white border border-[#E0E0E0] rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]/30 focus:border-[#7A1F2B] shadow-2xs transition-all"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1 -mx-1 px-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#7A1F2B] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E0E0E0]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Feed Cards List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          if (item.type === 'quiz') {
            return (
              <PrebunkQuizCard
                key={item.id}
                quiz={item as any}
                onAnswerCorrect={onAnswerQuiz}
              />
            );
          }

          const article = item as FeedArticle;
          const isLiked = likedArticles[article.id];

          return (
            <div
              key={article.id}
              onClick={() => onVerifyClaim(article.claimText, article.imageUrl)}
              className="bg-white rounded-2xl p-4 border border-[#E0E0E0] hover:border-[#7A1F2B]/40 shadow-2xs transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2.5 py-0.5 rounded-full text-[10px] tracking-wide uppercase border border-[#7A1F2B]/10">
                  {article.category}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {article.date}
                </span>
              </div>

              {article.imageUrl && (
                <FeedImageWithFallback
                  imageUrl={article.imageUrl}
                  title={article.title}
                  category={article.category}
                />
              )}

              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#7A1F2B] transition-colors leading-snug mb-1">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Claim Box */}
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-[11px] text-amber-800 uppercase block mb-0.5">
                    Analyzed Claim
                  </span>
                  <p className="italic font-medium text-[11px]">"{article.claimText}"</p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleLike(article.id, e)}
                    className={`flex items-center gap-1 transition-colors ${
                      isLiked ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />
                    <span>{article.likesCount + (isLiked ? 1 : 0)}</span>
                  </button>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{article.commentsCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#7A1F2B] font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect Claim</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
