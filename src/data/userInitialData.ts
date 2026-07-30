import { UserProfile } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Alex Rivera',
  username: '@alex_bytespark',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  level: 3,
  levelTitle: 'MIL Truth Sentinel',
  xpPoints: 850,
  nextLevelXp: 1200,
  streakDays: 5,
  lastActiveDate: new Date().toISOString(),
  verificationsCount: 14,
  quizzesCompleted: 18,
  gamesPlayed: 6,
  podcastsListened: 4,
  campaignsJoined: 2,
  badges: [
    {
      id: 'badge-1',
      title: 'Fact Sentinel',
      description: 'Run 10 successful media verifications.',
      icon: 'ShieldCheck',
      unlocked: true,
      unlockedAt: '2 days ago'
    },
    {
      id: 'badge-2',
      title: 'Prebunk Pioneer',
      description: 'Score 100% on 5 consecutive Prebunk Quizzes.',
      icon: 'Zap',
      unlocked: true,
      unlockedAt: 'Yesterday'
    },
    {
      id: 'badge-3',
      title: 'Logic Champion',
      description: 'Earn a 90+ AI Moderator score in Debate Point.',
      icon: 'Scale',
      unlocked: true,
      unlockedAt: '3 days ago'
    },
    {
      id: 'badge-4',
      title: 'Podcast Scholar',
      description: 'Listen to 3 MIL Waves podcast episodes.',
      icon: 'Headphones',
      unlocked: true,
      unlockedAt: 'Today'
    },
    {
      id: 'badge-5',
      title: 'Community Leader',
      description: 'Join or organize a local youth MIL campaign.',
      icon: 'Users',
      unlocked: true,
      unlockedAt: '4 days ago'
    },
    {
      id: 'badge-6',
      title: 'Deepfake Detective',
      description: 'Identify 5 AI-generated synthetic media clips.',
      icon: 'Eye',
      unlocked: false
    }
  ]
};
