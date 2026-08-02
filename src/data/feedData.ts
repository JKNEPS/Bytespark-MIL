import { FeedItem } from '../types';

export const initialFeedItems: FeedItem[] = [
  {
    id: 'feed-1',
    type: 'article',
    title: 'Viral Video Claims Eiffel Tower Caught Fire During Summer Heatwave',
    source: 'Global Fact Watch',
    date: '2 hours ago',
    category: 'Deepfakes',
    summary: 'A short TikTok video showing smoke rising from the Eiffel Tower went viral with 4M views. Reverse image analysis shows CGI effects overlayed on stock video footage.',
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
    initialClassification: 'Deepfake / Manipulated CGI',
    confidence: 96,
    likesCount: 1420,
    commentsCount: 88,
    claimText: 'Video of Eiffel tower burning in Paris 2026 heatwave',
    isFlagged: true
  },
  {
    id: 'quiz-1',
    type: 'quiz',
    title: 'Prebunk Quiz: Synthetic Speech Check',
    category: 'Deepfakes',
    question: 'You receive an urgent voice note from a politician asking for emergency donations. How do you spot if it is an AI voice clone?',
    options: [
      { id: 'a', text: 'If the tone sounds emotional, it must be real.', isCorrect: false },
      { id: 'b', text: 'Listen for unnatural breathing, robotic cadence, and lack of ambient room noise.', isCorrect: true },
      { id: 'c', text: 'Check if the audio file ends in .mp3 format.', isCorrect: false },
      { id: 'd', text: 'Assume all voice notes on messaging apps are verified.', isCorrect: false }
    ],
    explanation: 'AI voice generators often lack natural breathing pauses, lip-smack sounds, and room acoustics. Always cross-verify unexpected financial requests through an official secondary channel!',
    milTechnique: 'Acoustic Artifact Detection',
    points: 25
  },
  {
    id: 'feed-2',
    type: 'article',
    title: 'Altered Chart Inflates Renewable Energy Cost Figures by 400%',
    source: 'EcoCheck Initiative',
    date: '5 hours ago',
    category: 'Climate',
    summary: 'A widely shared infographic omitted the logarithmic Y-axis label, making solar installation cost spikes look dramatic when costs actually decreased.',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    initialClassification: 'Doctored Statistic / Misleading Graph',
    confidence: 91,
    likesCount: 930,
    commentsCount: 42,
    claimText: 'Solar power costs soared 400% in 2026 chart',
    isFlagged: true
  },
  {
    id: 'feed-3',
    type: 'article',
    title: 'Satirical Article About "Robot Teachers Replacing Exams" Shared as Genuine Policy',
    source: 'Youth Media Watch',
    date: '1 day ago',
    category: 'Satire',
    summary: 'An article from parody news outlet "The Daily Chuckle" was reposted by several parent groups without satire disclaimers, sparking online petitions.',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    initialClassification: 'Satire Mistaken as News',
    confidence: 98,
    likesCount: 2100,
    commentsCount: 156,
    claimText: 'Ministry of Education replacing all final exams with AI robots',
    isFlagged: true
  },
  {
    id: 'quiz-2',
    type: 'quiz',
    title: 'Prebunk Quiz: Lateral Reading Skills',
    category: 'General',
    question: 'When reading a news article on an unfamiliar website, what is "Lateral Reading"?',
    options: [
      { id: 'a', text: 'Reading from left to right twice to catch grammar errors.', isCorrect: false },
      { id: 'b', text: 'Opening new tabs to research what OTHER credible sources say about the site.', isCorrect: true },
      { id: 'c', text: 'Scrolling directly to the bottom comments section.', isCorrect: false },
      { id: 'd', text: 'Checking if the website has a professional color design.', isCorrect: false }
    ],
    explanation: 'Lateral Reading is the single most effective habit used by professional fact-checkers! Instead of staying on the page, open new browser tabs to check independent reviews and Wikipedia for the publisher.',
    milTechnique: 'Lateral Reading',
    points: 30
  },
  {
    id: 'feed-4',
    type: 'article',
    title: 'Recycled 2018 Concert Photograph Claimed as Recent Political Rally in Manila',
    source: 'Asia Fact Network',
    date: '2 days ago',
    category: 'Elections',
    summary: 'Reverse image lookup confirms the photo showing a crowd of 500,000 was taken at a music festival 8 years ago, not at yesterday\'s youth election rally.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    initialClassification: 'Out-of-Context Photo',
    confidence: 95,
    likesCount: 1850,
    commentsCount: 79,
    claimText: 'Record breaking Manila campaign rally photo 2026',
    isFlagged: true
  },
  {
    id: 'quiz-3',
    type: 'quiz',
    title: 'Prebunk Quiz: Emotional Baiting',
    category: 'Health',
    question: 'Why do disinformation creators deliberately use extreme outrage or miracle headlines like "DOCTORS ARE HIDING THIS!"?',
    options: [
      { id: 'a', text: 'To bypass your logical reasoning and trigger immediate panic-sharing.', isCorrect: true },
      { id: 'b', text: 'Because emotional headlines are required by journalism standards.', isCorrect: false },
      { id: 'c', text: 'To prove that the author is deeply passionate about health.', isCorrect: false },
      { id: 'd', text: 'Because panic makes people read more carefully.', isCorrect: false }
    ],
    explanation: 'High emotional arousal (anger, fear, awe) suppresses critical thinking and increases viral sharing velocity. When a post makes you feel intense panic or anger, PAUSE before sharing!',
    milTechnique: 'Emotional Trigger Awareness',
    points: 25
  }
];
