import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Headphones,
  BookOpen,
  Film,
  FileSpreadsheet,
  Megaphone,
  MapPin,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Download,
  Plus,
  Users,
  CheckCircle2,
  Search,
  Sparkles,
  Award,
  Eye,
  X,
  Volume2,
  ArrowLeft
} from 'lucide-react';
import {
  MiniGame,
  PodcastEpisode,
  ComicStory,
  DocumentaryItem,
  EducationalToolkit,
  Campaign,
  CommunityEvent,
  ClaimCategory
} from '../types';
import confetti from 'canvas-confetti';
import { FactAffectComicModal } from './FactAffectComicModal';

interface ExploreViewProps {
  games: MiniGame[];
  podcasts: PodcastEpisode[];
  comics: ComicStory[];
  documentaries: DocumentaryItem[];
  toolkits: EducationalToolkit[];
  onRewardXP: (points: number) => void;
  initialTopicTag?: ClaimCategory | 'All';
  onGoHome?: () => void;
  onOpenSpotTheFakeModal?: () => void;
}

const ExploreImageWithFallback: React.FC<{ imageUrl: string; title: string; category: string }> = ({ imageUrl, title, category }) => {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-[#7A1F2B]/80 to-slate-800 flex flex-col items-center justify-center p-4 text-center text-white">
        <Sparkles className="w-8 h-8 text-amber-400 mb-1" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-0.5">{category}</span>
        <p className="text-xs font-bold line-clamp-1 px-2 text-white/90">{title}</p>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={title}
      className="w-full h-full object-cover group-hover:scale-103 transition-transform"
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
};

export const ExploreView: React.FC<ExploreViewProps> = ({
  games,
  podcasts,
  comics,
  documentaries,
  toolkits,
  onRewardXP,
  initialTopicTag = 'All',
  onGoHome,
  onOpenSpotTheFakeModal
}) => {
  const [activeModality, setActiveModality] = useState<
    'games' | 'podcasts' | 'comics' | 'documentaries' | 'toolkits' | 'campaigns' | 'map'
  >('games');

  const [selectedTopicTag, setSelectedTopicTag] = useState<ClaimCategory | 'All'>(initialTopicTag);

  useEffect(() => {
    if (initialTopicTag) {
      setSelectedTopicTag(initialTopicTag);
    }
  }, [initialTopicTag]);

  // Interactive Modals & Active Players
  const [activeGameModal, setActiveGameModal] = useState<MiniGame | null>(null);
  const [gameStep, setGameStep] = useState(0);
  const [gameScore, setGameScore] = useState(0);

  // Podcast Player State
  const [activePodcast, setActivePodcast] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Comic Viewer State
  const [activeComic, setActiveComic] = useState<ComicStory | null>(null);

  // Toolkit Viewer Modal State
  const [activeToolkit, setActiveToolkit] = useState<EducationalToolkit | null>(null);

  // Documentary Modal State
  const [activeDoc, setActiveDoc] = useState<DocumentaryItem | null>(null);

  // Campaign & Map Data State
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [eventsList, setEventsList] = useState<CommunityEvent[]>([]);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // New Campaign Form
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampLocation, setNewCampLocation] = useState('');

  // New Event Form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventOrg, setNewEventOrg] = useState('');
  const [newEventCity, setNewEventCity] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  const topics: (ClaimCategory | 'All')[] = ['All', 'Deepfakes', 'Elections', 'Health', 'AI Ethics', 'Climate'];

  // Fetch campaigns and community events from backend
  useEffect(() => {
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then((data) => setCampaignsList(data))
      .catch((err) => console.error('Error loading campaigns:', err));

    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => setEventsList(data))
      .catch((err) => console.error('Error loading events:', err));
  }, []);

  // Podcast Audio Timer Simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying && activePodcast) {
      interval = setInterval(() => {
        setAudioProgress((prev) => (prev >= 100 ? 100 : prev + 1));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activePodcast]);

  useEffect(() => {
    if (audioProgress >= 100 && isPlaying) {
      setIsPlaying(false);
      setAudioProgress(0);
      onRewardXP(20);
    }
  }, [audioProgress, isPlaying, onRewardXP]);

  // Toggle Join Campaign
  const handleToggleJoinCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}/join`, { method: 'POST' });
      const updated = await res.json();
      setCampaignsList((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (updated.joined) {
        confetti({ particleCount: 30, spread: 50 });
        onRewardXP(30);
      }
    } catch (e) {
      console.error('Error joining campaign:', e);
    }
  };

  // Submit New Campaign
  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle.trim()) return;

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCampTitle,
          description: newCampDesc,
          location: newCampLocation || 'Online Youth Hub',
          organizer: 'Youth Ambassador',
          category: selectedTopicTag === 'All' ? 'General MIL' : selectedTopicTag
        })
      });
      const created = await res.json();
      setCampaignsList((prev) => [created, ...prev]);
      setIsCreatingCampaign(false);
      setNewCampTitle('');
      setNewCampDesc('');
      setNewCampLocation('');
      confetti({ particleCount: 40 });
      onRewardXP(50);
    } catch (err) {
      console.error('Create campaign error:', err);
    }
  };

  // Submit New Event
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEventTitle,
          organization: newEventOrg || 'Youth Fact Network',
          city: newEventCity || 'Local City',
          country: 'Youth Chapter',
          description: newEventDesc,
          topic: selectedTopicTag === 'All' ? 'Deepfakes' : selectedTopicTag
        })
      });
      const created = await res.json();
      setEventsList((prev) => [created, ...prev]);
      setIsSubmittingEvent(false);
      setNewEventTitle('');
      setNewEventOrg('');
      setNewEventCity('');
      setNewEventDesc('');
      confetti({ particleCount: 40 });
      onRewardXP(40);
    } catch (err) {
      console.error('Create event error:', err);
    }
  };

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

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#7A1F2B]/10 text-[#7A1F2B] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif-title text-slate-900 leading-none">
              Explore MIL Hub
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Creative modalities across games, podcasts, comics & youth action
            </p>
          </div>
        </div>

        {/* Modality Horizontal Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-3 -mx-1 px-1">
          {[
            { id: 'games', label: 'Games', icon: Gamepad2 },
            { id: 'podcasts', label: 'Podcast Corner', icon: Headphones },
            { id: 'comics', label: 'Comics & Stories', icon: BookOpen },
            { id: 'documentaries', label: 'Documentary', icon: Film },
            { id: 'toolkits', label: 'Toolkits', icon: FileSpreadsheet },
            { id: 'campaigns', label: 'Campaign Board', icon: Megaphone },
            { id: 'map', label: 'Community Map', icon: MapPin }
          ].map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModality === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModality(mod.id as any)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#7A1F2B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>

        {/* Topic Tag Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pt-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Filter:
          </span>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopicTag(t)}
              className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                selectedTopicTag === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 1. GAMES TAB */}
      {activeModality === 'games' && (
        <div className="space-y-3">
          {games
            .filter((g) => selectedTopicTag === 'All' || g.category === selectedTopicTag)
            .map((game) => (
              <div
                key={game.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs flex items-start gap-3 transition-all cursor-pointer ${
                  game.id === 'game-spot-the-fake'
                    ? 'border-amber-400 hover:border-amber-500 bg-gradient-to-r from-amber-50/50 to-white'
                    : 'border-slate-200 hover:border-[#7A1F2B]/40'
                }`}
                onClick={() => {
                  if (game.id === 'game-spot-the-fake' && onOpenSpotTheFakeModal) {
                    onOpenSpotTheFakeModal();
                    return;
                  }
                  setActiveGameModal(game);
                  setGameStep(0);
                  setGameScore(0);
                }}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  game.id === 'game-spot-the-fake'
                    ? 'bg-amber-100 text-amber-700 font-extrabold text-xl'
                    : 'bg-[#7A1F2B]/10 text-[#7A1F2B]'
                }`}>
                  {game.id === 'game-spot-the-fake' ? '🔍' : <Gamepad2 className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1F2B]/20">
                      {game.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {game.playCount} played
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{game.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{game.difficulty}</span>
                    <span className="text-[#7A1F2B] flex items-center gap-0.5 font-bold">
                      Play Now (+40 XP) <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 2. PODCAST CORNER TAB */}
      {activeModality === 'podcasts' && (
        <div className="space-y-3">
          {/* Active Player Deck if podcast selected */}
          {activePodcast && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                  Now Playing Podcast
                </span>
                <span className="text-xs font-semibold text-slate-300">{activePodcast.duration}</span>
              </div>

              <div>
                <h3 className="font-bold font-serif-title text-base">{activePodcast.title}</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {activePodcast.podcastName} • {activePodcast.hosts.join(', ')}
                </p>
              </div>

              {/* Progress Wave Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7A1F2B] h-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Listening...</span>
                  <span>{audioProgress}% completed</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 bg-[#7A1F2B] hover:bg-[#9B1B30] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isPlaying ? 'Pause Episode' : 'Play Episode'}</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span>24kHz Clean Audio</span>
                </div>
              </div>

              {/* Transcript Snippet */}
              <div className="bg-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-300 italic border border-slate-700">
                "{activePodcast.transcriptSnippet}"
              </div>
            </div>
          )}

          {/* Podcast List */}
          {podcasts
            .filter((p) => selectedTopicTag === 'All' || p.category === selectedTopicTag)
            .map((pod) => (
              <div
                key={pod.id}
                onClick={() => {
                  setActivePodcast(pod);
                  setIsPlaying(true);
                  setAudioProgress(0);
                }}
                className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-xs flex items-center justify-between hover:border-[#7A1F2B]/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1F2B]/20">
                      {pod.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{pod.title}</h4>
                    <p className="text-[11px] text-slate-500">{pod.duration} • {pod.hosts[0]}</p>
                  </div>
                </div>
                <button className="p-2 rounded-full bg-[#7A1F2B] text-white shrink-0 hover:bg-[#5A131E]">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* 3. COMICS & VISUAL STORIES TAB */}
      {activeModality === 'comics' && (
        <div className="space-y-3">
          {comics
            .filter((c) => selectedTopicTag === 'All' || c.category === selectedTopicTag)
            .map((comic) => (
              <div
                key={comic.id}
                onClick={() => {
                  setActiveComic(comic);
                }}
                className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-xs overflow-hidden cursor-pointer hover:border-[#7A1F2B]/40 transition-colors group"
              >
                <div className="relative rounded-xl overflow-hidden aspect-video mb-2.5 bg-slate-100">
                  <ExploreImageWithFallback
                    imageUrl={comic.coverImage}
                    title={comic.title}
                    category={comic.category}
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20 uppercase">
                    Instagram-Story Style
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1F2B]/20">
                    {comic.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {comic.slides.length} Panels
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{comic.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{comic.subtitle}</p>
              </div>
            ))}
        </div>
      )}

      {/* 4. DOCUMENTARY SHELF TAB */}
      {activeModality === 'documentaries' && (
        <div className="space-y-3">
          {documentaries
            .filter((d) => selectedTopicTag === 'All' || d.category === selectedTopicTag)
            .map((doc) => (
              <div
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-xs space-y-2 cursor-pointer hover:border-[#7A1F2B]/40 transition-colors"
              >
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center">
                  <ExploreImageWithFallback
                    imageUrl={doc.videoPlaceholderUrl}
                    title={doc.title}
                    category={doc.category}
                  />
                  <div className="absolute w-12 h-12 rounded-full bg-[#7A1F2B] text-white flex items-center justify-center shadow-lg border border-white">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {doc.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1F2B]/20">
                    {doc.category}
                  </span>
                  <span className="text-[11px] text-slate-500">{doc.director}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{doc.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{doc.summary}</p>
              </div>
            ))}
        </div>
      )}

      {/* 5. EDUCATIONAL TOOLKITS TAB */}
      {activeModality === 'toolkits' && (
        <div className="space-y-3">
          {toolkits
            .filter((t) => selectedTopicTag === 'All' || t.category === selectedTopicTag)
            .map((tool) => (
              <div
                key={tool.id}
                onClick={() => setActiveToolkit(tool)}
                className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-xs space-y-2 cursor-pointer hover:border-[#7A1F2B]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1F2B]/20">
                    {tool.format}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">{tool.fileSize}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{tool.title}</h3>
                <p className="text-xs text-slate-500">{tool.targetAudience} • {tool.pages} Pages</p>
                <p className="text-xs text-slate-600 line-clamp-2">{tool.summary}</p>
                <div className="pt-2 flex justify-end">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-[#FDF2F4] px-3 py-1.5 rounded-lg border border-[#7A1F2B]/20">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>View Interactive Toolkit</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 6. CAMPAIGN BOARD TAB */}
      {activeModality === 'campaigns' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Youth Organizing Campaigns</h3>
            <button
              onClick={() => setIsCreatingCampaign(!isCreatingCampaign)}
              className="flex items-center gap-1 text-xs font-bold text-white bg-[#7A1F2B] px-3 py-1.5 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Campaign</span>
            </button>
          </div>

          {/* New Campaign Submission Modal Form */}
          {isCreatingCampaign && (
            <form onSubmit={handleCreateCampaignSubmit} className="bg-white rounded-2xl border-2 border-[#7A1F2B] p-4 space-y-3 animate-fade-in shadow-md">
              <h4 className="font-bold text-slate-900 text-xs">Launch Youth MIL Campaign</h4>
              <input
                type="text"
                required
                placeholder="Campaign Title (e.g. High School Deepfake Watch)"
                value={newCampTitle}
                onChange={(e) => setNewCampTitle(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-2.5 text-xs text-slate-900"
              />
              <textarea
                rows={2}
                placeholder="Campaign goals & how youth can join..."
                value={newCampDesc}
                onChange={(e) => setNewCampDesc(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-2.5 text-xs text-slate-900"
              />
              <input
                type="text"
                placeholder="City / Region or 'Online'"
                value={newCampLocation}
                onChange={(e) => setNewCampLocation(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-2.5 text-xs text-slate-900"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCampaign(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#7A1F2B]"
                >
                  Publish Campaign (+50 XP)
                </button>
              </div>
            </form>
          )}

          {/* Campaign Items List */}
          {campaignsList.map((camp) => (
            <div key={camp.id} className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1F2B]/20">
                  {camp.category}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{camp.location}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{camp.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{camp.description}</p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Users className="w-3.5 h-3.5 text-[#7A1F2B]" />
                  <span>{camp.participantsCount} Youth Joined</span>
                </div>

                <button
                  onClick={() => handleToggleJoinCampaign(camp.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                    camp.joined
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-[#7A1F2B] text-white hover:bg-[#5A131E]'
                  }`}
                >
                  {camp.joined ? 'Joined Campaign ✓' : 'Join Campaign (+30 XP)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. COMMUNITY INTERVENTIONS MAP TAB */}
      {activeModality === 'map' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Community MIL Interventions</h3>
            <button
              onClick={() => setIsSubmittingEvent(!isSubmittingEvent)}
              className="flex items-center gap-1 text-xs font-bold text-white bg-[#7A1F2B] px-3 py-1.5 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Event</span>
            </button>
          </div>

          {/* New Event Form */}
          {isSubmittingEvent && (
            <form onSubmit={handleCreateEventSubmit} className="bg-white rounded-2xl border-2 border-[#7A1F2B] p-4 space-y-3 animate-fade-in shadow-md">
              <h4 className="font-bold text-slate-900 text-xs">Submit Local MIL Initiative</h4>
              <input
                type="text"
                required
                placeholder="Event Title (e.g. Nairobi Fact-Check Sprint)"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-2.5 text-xs text-slate-900"
              />
              <input
                type="text"
                placeholder="Organization / High School Name"
                value={newEventOrg}
                onChange={(e) => setNewEventOrg(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-2.5 text-xs text-slate-900"
              />
              <input
                type="text"
                placeholder="City & Country (e.g. Paris, France)"
                value={newEventCity}
                onChange={(e) => setNewEventCity(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-2.5 text-xs text-slate-900"
              />
              <textarea
                rows={2}
                placeholder="Details & contact email..."
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                className="w-full bg-slate-50 border border-[#E0E0E0] rounded-xl p-2.5 text-xs text-slate-900"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmittingEvent(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#7A1F2B]"
                >
                  Pin to Map (+40 XP)
                </button>
              </div>
            </form>
          )}

          {/* Interactive Visual Map Representation */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-2 relative overflow-hidden min-h-48 flex flex-col justify-between">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30 uppercase">
                Global Youth MIL Map
              </span>
              <span className="text-[11px] text-slate-300">{eventsList.length} Active Pins</span>
            </div>

            {/* Map Pin Visual Grid */}
            <div className="grid grid-cols-2 gap-2 my-2 z-10">
              {eventsList.slice(0, 4).map((evt) => (
                <div key={evt.id} className="bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-1 font-bold text-amber-300 text-[11px]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{evt.city}, {evt.country}</span>
                  </div>
                  <p className="font-bold text-white text-[11px] truncate mt-0.5">{evt.title}</p>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{evt.date}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 z-10">
              Tap any pin below to connect with local youth MIL organizers.
            </div>
          </div>

          {/* Full Events List */}
          <div className="space-y-2">
            {eventsList.map((evt) => (
              <div key={evt.id} className="bg-white rounded-2xl border border-[#E0E0E0] p-3.5 shadow-xs text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded text-[10px] border border-[#7A1F2B]/20">
                    {evt.type}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">{evt.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{evt.title}</h4>
                <p className="text-slate-600 text-[11px]">{evt.description}</p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Org: {evt.organization}</span>
                  <a href={`mailto:${evt.contactEmail}`} className="text-[#7A1F2B] font-bold hover:underline">
                    Contact Organizer →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MINI-GAME PLAYABLE MODAL */}
      {activeGameModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl animate-scale-up">
            <button
              onClick={() => setActiveGameModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#7A1F2B] text-white flex items-center justify-center font-bold">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{activeGameModal.title}</h3>
                <span className="text-[10px] font-bold text-[#7A1F2B]">Interactive Mini-Game</span>
              </div>
            </div>

            {/* Game Content Round */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
              <p className="font-bold text-slate-900 text-sm">Round 1 of 3: Artifact Inspection</p>
              <p className="text-slate-600 leading-relaxed">
                Look closely at the image shadow and earlobe symmetry. Is this synthetic AI or authentic photography?
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    confetti({ particleCount: 30 });
                    onRewardXP(40);
                    setActiveGameModal(null);
                  }}
                  className="p-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-center"
                >
                  Synthetic AI Deepfake
                </button>
                <button
                  onClick={() => {
                    alert('Incorrect! Notice the earlobe glitching and asymmetric shadow reflection.');
                    setActiveGameModal(null);
                  }}
                  className="p-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-center"
                >
                  Authentic Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMIC STORY SWIPE MODAL */}
      {activeComic && (
        <FactAffectComicModal
          comic={activeComic}
          onClose={() => setActiveComic(null)}
          onRewardXP={onRewardXP}
        />
      )}

      {/* TOOLKIT VIEWER MODAL */}
      {activeToolkit && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveToolkit(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-bold uppercase text-[#7A1F2B] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1F2B]/20">
              Interactive Toolkit Viewer
            </span>

            <h3 className="font-bold font-serif-title text-base text-slate-900">{activeToolkit.title}</h3>
            <p className="text-xs text-slate-500">{activeToolkit.targetAudience}</p>

            <div className="space-y-2 pt-2">
              {activeToolkit.sections.map((sec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900">{sec.title}</h4>
                  <p className="text-slate-600 mt-1">{sec.summary}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                alert(`Downloading ${activeToolkit.title} PDF package (${activeToolkit.fileSize})...`);
                onRewardXP(20);
                setActiveToolkit(null);
              }}
              className="w-full bg-[#7A1F2B] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 mt-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Printable Toolkit ({activeToolkit.fileSize})</span>
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENTARY VIDEO MODAL */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 relative shadow-2xl">
            <button
              onClick={() => setActiveDoc(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center text-white relative">
              <img src={activeDoc.videoPlaceholderUrl} alt={activeDoc.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute flex flex-col items-center gap-1">
                <Play className="w-8 h-8 fill-white text-white" />
                <span className="text-xs font-bold text-amber-300">Playing Documentary</span>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">{activeDoc.title}</h3>
            <p className="text-xs text-slate-600">{activeDoc.summary}</p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-[#7A1F2B] block">Key Takeaways:</span>
              <ul className="list-disc list-inside text-slate-700 text-[11px]">
                {activeDoc.keyTakeaways.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
