import {
  MiniGame,
  PodcastEpisode,
  ComicStory,
  DocumentaryItem,
  EducationalToolkit,
  DebateTopic
} from '../types';

export const sampleGames: MiniGame[] = [
  {
    id: 'game-spot-the-fake',
    title: 'Spot the Fake — Junior Fact Detectives (Check Your IQ)',
    description: 'Check your Media Literacy IQ! Spot false information across Easy, Medium, Hard & Extreme detective levels with 64 real-world cases.',
    category: 'General',
    durationMinutes: 5,
    iconName: 'Search',
    difficulty: 'Beginner',
    playCount: 9480
  },
  {
    id: 'game-1',
    title: 'Spot the Deepfake',
    description: 'Compare 5 side-by-side face renders. Spot subtle skin blending artifacts, asymmetry, and reflection errors!',
    category: 'Deepfakes',
    durationMinutes: 3,
    iconName: 'Eye',
    difficulty: 'Beginner',
    playCount: 4210
  },
  {
    id: 'game-2',
    title: 'Source Sorting Challenge',
    description: 'Drag and drop 8 news snippets into "Peer-Reviewed", "Opinion / Editorial", "Satire", or "Unverified Rumor".',
    category: 'General',
    durationMinutes: 4,
    iconName: 'Filter',
    difficulty: 'Intermediate',
    playCount: 3120
  },
  {
    id: 'game-3',
    title: 'Headline Matcher',
    description: 'Match sensational clickbait headlines with their actual nuanced, verified context before time runs out!',
    category: 'AI Ethics',
    durationMinutes: 2,
    iconName: 'Zap',
    difficulty: 'Advanced',
    playCount: 2890
  }
];

export const samplePodcasts: PodcastEpisode[] = [
  {
    id: 'pod-1',
    title: 'Episode 12: Synthetic Audio & Voice Cloning in Elections',
    podcastName: 'Bytespark MIL Waves',
    duration: '14 mins',
    category: 'Elections',
    description: 'How candidate voice clones spread in messaging groups and how youth fact-checkers respond in real-time.',
    hosts: ['Amina Diallo (UNESCO Youth)', 'Prof. Kenji Sato'],
    transcriptSnippet: 'Amina: "When an audio clip circulates without video or venue details, that is your first clue to inspect the spectral noise background..."'
  },
  {
    id: 'pod-2',
    title: 'Episode 13: Algorithmic Bubbles & The Illusion of Consensus',
    podcastName: 'Bytespark MIL Waves',
    duration: '18 mins',
    category: 'AI Ethics',
    description: 'Why your feed makes it feel like "everyone agrees" with a extreme viewpoint and how recommendation systems work.',
    hosts: ['Lucas Silva', 'Elena Rostova (Civic Tech)'],
    transcriptSnippet: 'Lucas: "If 10 posts in a row express extreme anger about a topic, you aren\'t seeing public consensus—you\'re seeing engagement optimization."'
  },
  {
    id: 'pod-3',
    title: 'Episode 14: Medical Myths & Miracle Cures',
    podcastName: 'Bytespark MIL Waves',
    duration: '11 mins',
    category: 'Health',
    description: 'Deconstructing viral wellness claims on TikTok and understanding double-blind clinical trial evidence.',
    hosts: ['Dr. Sarah Jenkins', 'Marcus Chen'],
    transcriptSnippet: 'Dr. Sarah: "Personal anecdotes are compelling stories, but scientific truth requires repeatable sample testing with control groups."'
  }
];

export const sampleComics: ComicStory[] = [
  {
    id: 'comic-fact-affect',
    title: 'The Fact-Affect Hero',
    subtitle: 'Somewhere, someone is about to believe a lie. Not on my watch.',
    category: 'Elections',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    slides: [
      {
        panelNumber: 1,
        title: 'Page 1 — Introduction',
        description: 'Young superhero Fact Detective, wearing a blue cape with a magnifying glass emblem, stands on a rooftop at sunrise overlooking a small town.',
        imagePromptText: 'Young superhero Fact Detective, wearing a blue cape with a magnifying glass emblem, stands on a rooftop at sunrise overlooking a small town.',
        milLesson: 'Always be vigilant! Misinformation spreads when people aren’t watching out for fake news.',
        speechBubbleText: 'Somewhere, someone is about to believe a lie. Not on my watch.',
        speechBubbleType: 'thought',
        speaker: 'Fact Detective',
        customSceneId: 'fact-affect-1'
      },
      {
        panelNumber: 2,
        title: 'Page 2 — Villain Reveal',
        description: 'Mister Misinformation, a sneaky cartoonish villain in a patchwork coat covered in tiny fake newspaper clippings, grins while typing on a glowing laptop shooting out speech bubbles full of exclamation points.',
        imagePromptText: 'Mister Misinformation, a sneaky cartoonish villain in a patchwork coat covered in tiny fake newspaper clippings, grins while typing on a glowing laptop shooting out speech bubbles full of exclamation points.',
        milLesson: 'Fake news creators often use sensational headlines and lots of exclamation points to trigger strong emotions.',
        speechBubbleText: 'Hehe... one fake headline, coming right up!',
        speechBubbleType: 'exclamation',
        speaker: 'Mister Misinformation',
        customSceneId: 'fact-affect-2'
      },
      {
        panelNumber: 3,
        title: 'Page 3 — Confrontation',
        description: 'Fact Detective bursts into a classroom where three curious kids stare worriedly at a phone showing a shocking fake headline.',
        imagePromptText: 'Fact Detective bursts into a classroom where three curious kids stare worriedly at a phone showing a shocking fake headline.',
        milLesson: 'Never share a shocking post immediately. Stop, breathe, and check where the information came from.',
        speechBubbleText: 'Wait, let\'s check the source before we believe it.',
        speechBubbleType: 'speech',
        speaker: 'Fact Detective',
        customSceneId: 'fact-affect-3'
      },
      {
        panelNumber: 4,
        title: 'Page 4 — The Lesson',
        description: 'Fact Detective and the three kids gather around a glowing checklist with three icons, a magnifying glass, a question mark, and a checkmark.',
        imagePromptText: 'Fact Detective and the three kids gather around a glowing checklist with three icons, a magnifying glass, a question mark, and a checkmark.',
        milLesson: 'Use the 3-step check: 1) Who is the source? 2) Why are they saying it? 3) Is there real evidence?',
        speechBubbleText: 'Check the source, ask who said it, and look for proof.',
        speechBubbleType: 'speech',
        speaker: 'Fact Detective',
        customSceneId: 'fact-affect-4'
      },
      {
        panelNumber: 5,
        title: 'Page 5 — Ending',
        description: 'Fact Detective and the kids hold up a glowing shield of checkmarks as Mister Misinformation shrinks away, his fake headlines turning to dust.',
        imagePromptText: 'Fact Detective and the kids hold up a glowing shield of checkmarks as Mister Misinformation shrinks away, his fake headlines turning to dust.',
        milLesson: 'When we fact-check together, misinformation loses its power!',
        speechBubbleText: 'We checked the facts and beat the fake news! — Great job, Fact Detectives!',
        speechBubbleType: 'speech',
        speaker: 'Kid & Fact Detective',
        customSceneId: 'fact-affect-5'
      }
    ]
  },
  {
    id: 'comic-1',
    title: 'The Illusion of Consensus',
    subtitle: 'How bot networks fake viral popularity',
    category: 'AI Ethics',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    slides: [
      {
        panelNumber: 1,
        title: 'Panel 1: The Viral Spike',
        description: 'Maya scrolls her feed and sees 50 identical comments praising a sketchy new miracle drink.',
        imagePromptText: 'Illustration of a teen looking at glowing phone screen surrounded by repeating avatar icons',
        milLesson: 'Coordinated bot accounts often copy-paste identical phrases to create synthetic social proof.'
      },
      {
        panelNumber: 2,
        title: 'Panel 2: Inspecting the Accounts',
        description: 'Maya taps 5 profiles. All created on the same day, with generic stock avatars and 0 original posts.',
        imagePromptText: 'Magnifying glass over account timestamps showing identical creation dates',
        milLesson: 'Check profile creation date and activity patterns before trusting sudden "unanimous" consensus.'
      },
      {
        panelNumber: 3,
        title: 'Panel 3: Breaking the Chain',
        description: 'Instead of reposting, Maya leaves a comment explaining the bot network discovery.',
        imagePromptText: 'Character typing an insightful comment with a shield icon glowing',
        milLesson: 'Call out synthetic manipulation calmly with proof rather than spreading the outrage.'
      }
    ]
  },
  {
    id: 'comic-2',
    title: 'Out of Context, Out of Mind',
    subtitle: 'When real media is twisted with fake dates',
    category: 'Elections',
    coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
    slides: [
      {
        panelNumber: 1,
        title: 'Panel 1: The Shocking Photo',
        description: 'A photo shows empty store shelves with a caption blaming new local legislation.',
        imagePromptText: 'Comic panel showing empty supermarket aisles with dramatic lighting',
        milLesson: 'Misinformation often uses REAL photos with FAKE or outdated storylines.'
      },
      {
        panelNumber: 2,
        title: 'Panel 2: The Reverse Search',
        description: 'Leo uploads the image to Bytespark Verify. The image was actually taken during a 2020 snowstorm.',
        imagePromptText: 'Phone scanning photo with reverse image search beam',
        milLesson: 'Reverse image search instantly exposes recycled media taken out of historical context.'
      }
    ]
  }
];

export const sampleDocumentaries: DocumentaryItem[] = [
  {
    id: 'doc-1',
    title: 'Behind the Synthetic Screen: Deepfakes in 2026',
    director: 'UNESCO Youth Media Labs',
    duration: '8 mins',
    category: 'Deepfakes',
    summary: 'An investigation into how generative video models work, how detection algorithms spot pixel glitches, and how youth creators protect media integrity.',
    videoPlaceholderUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    keyTakeaways: [
      'Generative video creates temporal incoherence in eye blinking & shadow movement',
      'Watermarking standards like C2PA embed cryptographic provenance in media',
      'Media literacy education is 4x more effective than reactive censorship'
    ]
  },
  {
    id: 'doc-2',
    title: 'The Truth Sorters: High School Fact-Checkers',
    director: 'Global Youth Journalism Network',
    duration: '12 mins',
    category: 'Elections',
    summary: 'Documenting student-led fact-checking newsrooms in Kenya, Indonesia, and Brazil operating during national youth elections.',
    videoPlaceholderUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    keyTakeaways: [
      'Peer-to-peer prebunking builds resilient community immunity against rumors',
      'Visual explainers in native dialects reach 3x more students than formal text reports'
    ]
  }
];

export const sampleToolkits: EducationalToolkit[] = [
  {
    id: 'tool-1',
    title: 'Youth MIL Workshop Leader Guide (2026 Edition)',
    targetAudience: 'Educators, Club Leaders, Youth Mentors',
    category: 'Educational Toolkits',
    format: 'Printable PDF & Interactive Module',
    pages: 24,
    summary: 'Complete step-by-step 60-minute session plan with icebreakers, deepfake detection exercises, debate prompts, and printable student certificates.',
    fileSize: '3.4 MB',
    downloadUrl: '#',
    sections: [
      { title: 'Module 1: The Emotion Pause (10 mins)', summary: 'Activity teaching students to recognize visceral reaction triggers before tapping share.' },
      { title: 'Module 2: Lateral Reading Sprint (20 mins)', summary: 'Hands-on browser challenge verifying claims across 3 independent tabs.' },
      { title: 'Module 3: Prebunking Roleplay (20 mins)', summary: 'Simulated debate spot-checking synthetic media and logical fallacies.' }
    ]
  },
  {
    id: 'tool-2',
    title: 'High School Fact-Check Club Starter Pack',
    targetAudience: 'High School & University Students',
    category: 'Educational Toolkits',
    format: 'Toolkit & Templates',
    pages: 16,
    summary: 'Templates for social media post templates, workflow checklists, reverse-search cheat sheets, and verification submission logs.',
    fileSize: '2.1 MB',
    downloadUrl: '#',
    sections: [
      { title: 'Workflow Checklist', summary: '5-step audit checklist for student editors before publishing verifications.' },
      { title: 'Social Media Graphic Templates', summary: 'Canva & Figma links for bite-sized claim breakdown graphics.' }
    ]
  }
];

export const sampleDebateTopics: DebateTopic[] = [
  {
    id: 'deb-1',
    title: 'Should Social Platforms Mandate Cryptographic Provenance Watermarks on All AI-Generated Media?',
    category: 'AI Ethics',
    description: 'Debate whether mandatory AI watermarking protects public truth or restricts creative freedom and privacy.',
    backgroundContext: 'With generative media becoming indistinguishable from real photography, standards like C2PA inject digital signatures into images. Critics argue malicious actors will remove watermarks while innocent creators suffer privacy risks.',
    argumentsCount: 128,
    communityArguments: [
      {
        id: 'arg-1',
        author: 'Tariq M.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        stance: 'Pro',
        argumentText: 'Provenance metadata is essential for public trust. Just as pharmaceuticals require ingredient labels, synthetic media requires clear provenance markers so citizens know what is real.',
        evidence: 'C2PA open specification studies show 88% reduction in accidental misinformation sharing.',
        upvotes: 45,
        aiScore: 92,
        createdAt: '3 hours ago'
      },
      {
        id: 'arg-2',
        author: 'Sofia R.',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        stance: 'Nuanced',
        argumentText: 'Watermarks help, but technical fixes cannot replace media literacy education. Bad actors will strip watermarks using open-source models, leaving law-abiding citizens vulnerable.',
        evidence: 'MIT Media Lab report on open-weight AI model watermark removal tools.',
        upvotes: 38,
        aiScore: 88,
        createdAt: '5 hours ago'
      }
    ]
  },
  {
    id: 'deb-2',
    title: 'Is Prebunking (Psychological Inoculation) More Effective Than Post-hoc Fact-Checking?',
    category: 'General',
    description: 'Examine whether exposing people to misinformation tactics BEFORE they encounter fake news works better than debunking after the fact.',
    backgroundContext: 'Psychological research suggests once a belief takes root, debunking often triggers defensive confirmation bias ("the backfire effect"). Prebunking equips users with cognitive defense mechanisms in advance.',
    argumentsCount: 94,
    communityArguments: [
      {
        id: 'arg-3',
        author: 'David K.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        stance: 'Pro',
        argumentText: 'Prebunking acts like a vaccine for the mind. When youth learn how emotional baiting works in advance through games, they instantly spot the tactic in the wild.',
        evidence: 'Cambridge Inoculation Theory research papers (2024-2025).',
        upvotes: 29,
        aiScore: 90,
        createdAt: '1 day ago'
      }
    ]
  }
];
