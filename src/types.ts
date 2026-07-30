export type TabType = 'home' | 'verify' | 'authenticity' | 'source' | 'debate' | 'explore' | 'profile' | 'legal-rights' | 'self-defense' | 'response-team';

export type ClaimCategory = 'Deepfakes' | 'AI Ethics' | 'Health' | 'Elections' | 'Climate' | 'Satire' | 'General';

export interface AuthenticityCheckResult {
  id: string;
  contentType: 'image' | 'video_audio' | 'text';
  inputSummary: string;
  mediaUrl?: string;
  aiScore: number; // 0 to 100 (% likelihood of being AI generated)
  signals: string[];
  summary: string;
  disclaimer: string;
  timestamp: string;
}

export interface SourceCredibilityResult {
  id: string;
  urlOrHeadline: string;
  publisherReputation: 'Established Outlet' | 'Unknown / New Site' | 'Known Unreliable Source' | string;
  biasIndicator: 'Center / Neutral' | 'Left-Leaning' | 'Right-Leaning' | 'Not Applicable' | string;
  authorTransparency: string;
  summary: string;
  credibilityScore: number; // 0 to 100
  timestamp: string;
}

export interface FlaggedSource {
  id: string;
  sourceNameOrUrl: string;
  reason: string;
  reporter: string;
  flagCount: number;
  status: 'Under Review' | 'Verified Misleading' | 'Dismissed' | string;
  category: string;
  createdAt: string;
}

export interface FeedArticle {
  id: string;
  type: 'article';
  title: string;
  source: string;
  date: string;
  category: ClaimCategory;
  summary: string;
  imageUrl?: string;
  initialClassification?: string;
  confidence?: number;
  likesCount: number;
  commentsCount: number;
  claimText: string;
  isFlagged: boolean;
}

export interface PrebunkQuiz {
  id: string;
  type: 'quiz';
  title: string;
  category: ClaimCategory;
  question: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'text';
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  milTechnique: string;
  points: number;
}

export type FeedItem = FeedArticle | PrebunkQuiz;

export interface VerificationResult {
  classification: string;
  confidence: number;
  summary: string;
  reasoningTrail: string[];
  keyFindings: string[];
  recommendations: string[];
  groundingSources?: { title: string; url: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  classificationSuggestion?: string;
}

export interface CommunityArgument {
  id: string;
  author: string;
  avatar: string;
  stance: 'Pro' | 'Con' | 'Nuanced';
  argumentText: string;
  evidence: string;
  upvotes: number;
  aiScore: number;
  createdAt: string;
}

export interface DebateTopic {
  id: string;
  title: string;
  category: ClaimCategory;
  description: string;
  backgroundContext: string;
  argumentsCount: number;
  communityArguments: CommunityArgument[];
}

export interface ModerationResult {
  logicScore: number;
  evidenceScore: number;
  respectScore: number;
  overallScore: number;
  strengths: string[];
  fallaciesDetected: string[];
  improvementTip: string;
  literacyPointsEarned: number;
}

export interface MiniGame {
  id: string;
  title: string;
  description: string;
  category: ClaimCategory;
  durationMinutes: number;
  iconName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  playCount: number;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  podcastName: string;
  duration: string;
  audioUrl?: string;
  category: ClaimCategory;
  description: string;
  hosts: string[];
  transcriptSnippet: string;
}

export interface ComicStory {
  id: string;
  title: string;
  subtitle: string;
  category: ClaimCategory;
  coverImage: string;
  slides: {
    panelNumber: number;
    title: string;
    description: string;
    imagePromptText: string;
    milLesson: string;
  }[];
}

export interface DocumentaryItem {
  id: string;
  title: string;
  director: string;
  duration: string;
  category: ClaimCategory;
  summary: string;
  videoPlaceholderUrl: string;
  keyTakeaways: string[];
}

export interface EducationalToolkit {
  id: string;
  title: string;
  targetAudience: string;
  category: ClaimCategory | string;
  format: string;
  pages: number;
  summary: string;
  fileSize: string;
  downloadUrl: string;
  sections: { title: string; summary: string }[];
}

export interface Campaign {
  id: string;
  title: string;
  organizer: string;
  category: ClaimCategory | string;
  description: string;
  location: string;
  date: string;
  participantsCount: number;
  joined: boolean;
  updates: string[];
  tags: string[];
  createdAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  organization: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  date: string;
  type: 'Workshop' | 'Youth Forum' | 'Fact-check Sprint' | 'School Club';
  description: string;
  contactEmail: string;
  link: string;
  topic: ClaimCategory | string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  level: number;
  levelTitle: string;
  xpPoints: number;
  nextLevelXp: number;
  streakDays: number;
  lastActiveDate: string;
  verificationsCount: number;
  quizzesCompleted: number;
  gamesPlayed: number;
  podcastsListened: number;
  campaignsJoined: number;
  badges: Badge[];
}
