import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Flame, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle,
  Trophy,
  ArrowLeft
} from 'lucide-react';

export interface SpotTheFakeGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardXP?: (points: number) => void;
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

interface BinaryCase {
  mode: 'binary';
  text: string;
  isFake: boolean;
  why: string;
  flags: string[];
  levelNum: number;
  levelTitle: string;
  source: string;
}

interface ChooseFakeCase {
  mode: 'chooseFake';
  statements: string[];
  lieIndex: number;
  why: string;
  levelNum: number;
  levelTitle: string;
  source: string;
  displayStatements: string[];
  correctDisplayIndex: number;
}

type GameCase = BinaryCase | ChooseFakeCase;

const LEVEL_META = [
  { title: "Headline Check", source: "NEWS HEADLINE" },
  { title: "Number Check", source: "STAT REPORT" },
  { title: "Science Fact Check", source: "SCIENCE FACT" },
  { title: "History Fact Check", source: "HISTORY FACT" },
  { title: "Quote Check", source: "QUOTE" },
  { title: "Social Post Check", source: "SOCIAL POST" },
  { title: "Two Truths, One Lie", source: "MIXED CLAIMS" },
  { title: "Boss Round", source: "BREAKING NEWS" }
];

const RANKS: Record<Difficulty, string> = {
  easy: "Rookie Detective 🕵️",
  medium: "Sharp-Eyed Sleuth 🔎",
  hard: "Senior Investigator 🎩",
  extreme: "Master Truth Detective 🏆"
};

const DIFF_LABEL: Record<Difficulty, string> = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
  extreme: "EXTREME"
};

const DIFF_COLOR: Record<Difficulty, string> = {
  easy: "#3FAE72",
  medium: "#2E93C6",
  hard: "#c98a1f",
  extreme: "#E14F42"
};

function b(text: string, isFake: boolean, why: string, flags: string[] = []): { mode: 'binary'; text: string; isFake: boolean; why: string; flags: string[] } {
  return { mode: 'binary', text, isFake, why, flags };
}

function c3(statements: string[], lieIndex: number, why: string): { mode: 'chooseFake'; statements: string[]; lieIndex: number; why: string } {
  return { mode: 'chooseFake', statements, lieIndex, why };
}

const RAW_DATA: Record<Difficulty, Array<Array<any>>> = {
  easy: [
    [
      b("Honey never spoils if stored properly — archaeologists found 3,000-year-old honey that was still edible.", false, "Real and well documented — honey's low moisture and acidity keep it from spoiling."),
      b("BREAKING: Cows in Texas start giving purple milk after eating glittery grass.", true, "Impossible and absurd, with no real source — a classic silly fake headline.", ["BREAKING", "glittery grass"])
    ],
    [
      b("The human body has 206 bones in adulthood.", false, "A standard, verifiable anatomy fact."),
      b("Scientists say the average person's nose grows 3 inches every year.", true, "Wildly exaggerated and impossible — noses don't keep growing inches per year.", ["Scientists say", "3 inches every year"])
    ],
    [
      b("Water boils at 100°C (212°F) at sea level.", false, "A basic, verifiable physics fact."),
      b("Fact: If you microwave a banana, it turns into gold dust.", true, "Completely impossible — microwaving fruit doesn't transform its atoms.", ["Fact:", "gold dust"])
    ],
    [
      b("The Great Pyramid of Giza was built as a tomb for the pharaoh Khufu.", false, "Confirmed by archaeologists and Egyptologists."),
      b("Historians confirm the Eiffel Tower was originally built underwater before being moved to Paris.", true, "The Eiffel Tower has always stood in Paris — it was never built or moved from underwater.", ["Historians confirm", "built underwater"])
    ],
    [
      b("Albert Einstein once said, \"Imagination is more important than knowledge.\"", false, "A genuine, well-documented Einstein quote from a 1929 interview."),
      b("Abraham Lincoln once tweeted, \"Just landed in Chicago, traffic was wild!\"", true, "Impossible — Lincoln died in 1865, over a century before Twitter existed.", ["tweeted"])
    ],
    [
      b("Local bakery post: \"We're donating 100 loaves of bread to the shelter this weekend!\"", false, "A normal, plausible community post with nothing sensational or unverifiable about it."),
      b("Viral post: \"Aliens spotted directing traffic in downtown Chicago, video going viral!!!\"", true, "An outlandish, unverified claim with no credible evidence — classic viral hoax pattern.", ["Aliens spotted", "going viral!!!"])
    ],
    [
      c3(["Bananas are berries, botanically speaking.", "Strawberries are berries, botanically speaking.", "Avocados are berries, botanically speaking."], 1, "Botanists classify fruit by seed structure — bananas and avocados qualify as berries, but strawberries technically don't!"),
      c3(["The Sun is a star.", "The Moon produces its own light.", "Earth orbits the Sun."], 1, "The Moon has no light of its own — it only reflects sunlight.")
    ],
    [
      b("News: City announces a new public library opening downtown next spring.", false, "A normal, plausible local news item."),
      b("BREAKING: World Health Organization confirms chocolate cures the common cold overnight.", true, "No health organization has ever confirmed a food as an overnight cure — a classic miracle-cure fake.", ["BREAKING", "confirms", "cures the common cold overnight"])
    ]
  ],
  medium: [
    [
      b("NASA's Perseverance rover has been exploring Mars' Jezero Crater since 2021, searching for signs of ancient microbial life.", false, "Accurate and well-documented NASA mission details."),
      b("Headline: \"Scientists Find Ancient City Under the Bermuda Triangle Using New Sonar Tech\"", true, "No legitimate archaeological discovery like this exists — it recycles an old, unverified myth with vague \"new tech.\"", ["Scientists Find", "New Sonar Tech"])
    ],
    [
      b("The average adult human heart beats about 100,000 times per day.", false, "A commonly cited and accurate physiological estimate."),
      b("Report: Using your phone for more than 2 hours a day permanently shrinks your brain by 5%.", true, "No credible study shows a precise, permanent \"5% shrinkage\" from phone use — a fabricated fear-based statistic.", ["Report:", "permanently shrinks your brain by 5%"])
    ],
    [
      b("Lightning is about five times hotter than the surface of the sun, reaching around 30,000 Kelvin.", false, "A verified, often-cited physics fact."),
      b("New research shows humans only use 10% of their brains, and unlocking the rest gives psychic powers.", true, "A famous myth — brain scans show we use virtually all of our brain, just not all at once, and there's no link to psychic ability.", ["New research shows", "psychic powers"])
    ],
    [
      b("The Titanic sank in April 1912 after hitting an iceberg in the North Atlantic.", false, "A well-documented historical event."),
      b("Historians recently confirmed that Napoleon Bonaparte was unusually short for his era, standing under 5 feet tall.", true, "A famous myth — Napoleon was about average height for his time (around 5'7\"); the \"short\" idea came from a unit mix-up.", ["Historians recently confirmed"])
    ],
    [
      b("Neil Armstrong said, \"That's one small step for man, one giant leap for mankind,\" upon stepping on the Moon.", false, "A genuine, historically recorded quote from the 1969 Moon landing."),
      b("Mark Twain once said, \"The internet never forgets, so post wisely.\"", true, "Impossible — Mark Twain died in 1910, decades before the internet existed.", [])
    ],
    [
      b("Verified airline account: \"Flight 202 to Denver delayed by 45 minutes due to weather. We apologize for the inconvenience.\"", false, "A routine, plausible airline update with nothing unverifiable in it."),
      b("Viral post: \"This local river turned pink overnight — city says it's from a secret dye experiment gone wrong!\"", true, "No city or agency is named, and \"secret experiment\" claims like this are a common misinformation pattern.", ["turned pink overnight", "secret dye experiment"])
    ],
    [
      c3(["Venus is hotter than Mercury even though Mercury is closer to the Sun.", "A day on Venus is longer than its year.", "Mars has two moons that are each larger than Earth's Moon."], 2, "Mars's two moons, Phobos and Deimos, are tiny — far smaller than Earth's Moon, not larger."),
      c3(["Mount Everest is the tallest mountain above sea level.", "Mauna Kea in Hawaii is taller than Everest when measured base to peak.", "The Dead Sea is the deepest lake in the world."], 2, "The Dead Sea is the lowest point on land, but Lake Baikal in Russia is actually the deepest lake.")
    ],
    [
      b("News: A city council votes to add protected bike lanes downtown after a year-long public review process.", false, "A normal, plausible local governance story."),
      b("BREAKING: Leaked memo reveals a major tech company plans to replace all keyboards with mind-reading chips by next year.", true, "No real \"leaked memo\" or technology like this exists — an unrealistic claim with a vague, unnamed source.", ["BREAKING", "Leaked memo", "mind-reading chips"])
    ]
  ],
  hard: [
    [
      b("The James Webb Space Telescope, launched in 2021, is designed to observe some of the earliest galaxies in the universe.", false, "Accurate — this is JWST's real, well-documented mission."),
      b("Headline: \"New Study: The Great Barrier Reef Has Fully Recovered and Is Now Larger Than Ever\"", true, "The reef has faced ongoing bleaching events; no credible study claims a full, record-breaking recovery.", ["Fully Recovered", "Larger Than Ever"])
    ],
    [
      b("Mount Everest is approximately 8,849 meters (29,032 feet) tall.", false, "The current, officially surveyed height of Mount Everest."),
      b("Study finds that talking to houseplants in a foreign language makes them grow 30% faster.", true, "No credible study links language choice to a specific 30% growth boost — a pseudo-scientific fabricated statistic.", ["Study finds", "30% faster"])
    ],
    [
      b("Octopuses can change both the color and texture of their skin to camouflage almost instantly.", false, "A real, well-documented ability of octopuses."),
      b("New neuroscience research shows that classical music played to babies in the womb permanently raises their IQ by 15 points.", true, "This overstates the real (and much smaller, temporary, adult-only) \"Mozart effect\" findings — no permanent 15-point IQ gain is supported.", ["permanently raises their IQ by 15 points"])
    ],
    [
      b("The Berlin Wall fell in November 1989, leading to German reunification the following year.", false, "A well-documented historical event."),
      b("Historians have confirmed that Vikings wore horned helmets into battle, based on genuine Viking-era armor.", true, "A famous myth — no authentic Viking-era helmet with horns has ever been found; the image comes from 19th-century art.", ["Historians have confirmed", "genuine Viking-era armor"])
    ],
    [
      b("Martin Luther King Jr. said, \"Injustice anywhere is a threat to justice everywhere,\" in his Letter from Birmingham Jail.", false, "A genuine, historically documented quote."),
      b("Albert Einstein once said, \"The definition of insanity is doing the same thing over and over and expecting different results.\"", true, "One of the most commonly misattributed quotes online — there's no evidence Einstein ever said or wrote this.", [])
    ],
    [
      b("Official weather service post: \"Winter storm warning issued for the region, expect 6–10 inches of snowfall starting tonight.\"", false, "A routine, plausible official weather alert."),
      b("Viral post: \"Doctors at a major hospital confirm a new blood type was just discovered in a local patient, only 3 people worldwide share it.\"", true, "No hospital or doctor is named, and there's no way to verify this oddly specific, unsourced claim.", ["Doctors", "confirm", "only 3 people worldwide"])
    ],
    [
      c3(["Sharks existed before trees appeared on Earth.", "The human body replaces most of its skeleton roughly every decade through bone remodeling.", "Goldfish have a memory span of only a few seconds."], 2, "A very common myth — goldfish can actually remember things for months, not just seconds."),
      c3(["The Eiffel Tower can grow about 6 inches taller in summer due to thermal expansion.", "Diamonds are the hardest known natural material on Earth.", "Glass is a slow-moving liquid, which is why old windows are thicker at the bottom."], 2, "A persistent myth — glass is not a slow liquid; old windows are uneven because of how they were manufactured long ago.")
    ],
    [
      b("News: Researchers publish a peer-reviewed study linking a specific gene to increased risk of a rare disease, calling for further trials.", false, "A normal, cautious framing typical of real scientific reporting."),
      b("BREAKING: Internal documents reveal a popular social media app has been secretly using phone microphones to target ads, tech insider claims.", true, "A widely circulated, repeatedly investigated claim with no solid evidence — companies use other data signals, not secret mic recordings.", ["BREAKING", "Internal documents reveal", "tech insider claims"])
    ]
  ],
  extreme: [
    [
      b("In 2023, DeepMind's AlphaFold was recognized for predicting the 3D structures of nearly all known proteins.", false, "A real, well-documented AI and scientific achievement."),
      b("Headline: \"Leading University Confirms First Successful Human Memory Transfer Using AI Brain Chip\"", true, "No such procedure has been confirmed by any university — it borrows real AI/neurotech language to sound credible.", ["Confirms", "Memory Transfer"])
    ],
    [
      b("As of the early 2020s, more than half of the world's population lives in urban areas, according to UN data.", false, "A real, commonly cited UN demographic statistic."),
      b("A widely shared graphic claims 74% of all statistics shared on social media are made up on the spot — cited from a 2020 Stanford report.", true, "Ironic and fabricated — no such Stanford report exists; a fake statistic about fake statistics, dressed up with a specific citation.", ["74%", "2020 Stanford report"])
    ],
    [
      b("CRISPR gene-editing technology, which allows precise edits to DNA, won the Nobel Prize in Chemistry in 2020.", false, "Accurate and well documented."),
      b("New quantum physics research confirms that human consciousness can influence random number generators from across the globe, per a peer-reviewed 2022 study.", true, "Borrows real scientific terms (\"quantum,\" \"peer-reviewed\") to dress up a long-debunked fringe claim with no credible mainstream support.", ["confirms", "peer-reviewed 2022 study"])
    ],
    [
      b("The Chernobyl nuclear disaster occurred in 1986 in present-day Ukraine, then part of the Soviet Union.", false, "A well-documented historical event."),
      b("Recently declassified documents reveal that the 1969 Moon landing footage was reshot in a Nevada studio due to camera malfunctions, NASA insiders admit.", true, "A long-running conspiracy theory with no credible evidence — physical Moon samples and independent tracking by other countries confirm the landing was real.", ["declassified documents", "insiders admit"])
    ],
    [
      b("Carl Sagan wrote, \"Extraordinary claims require extraordinary evidence,\" popularizing a key principle of scientific skepticism.", false, "A genuine, well-documented quote."),
      b("A leaked internal email allegedly shows a tech CEO writing, \"We designed our app to be addictive on purpose, and we don't care about user wellbeing.\"", true, "No verified leak like this exists — it mimics real tech-ethics controversies to feel more believable than it is.", ["leaked internal email", "allegedly"])
    ],
    [
      b("Official health agency statement: \"We are monitoring a localized outbreak and have deployed additional testing resources to the affected area.\"", false, "A routine, plausible public-health communication style."),
      b("Screenshot circulating online shows a 'verified' government account announcing a total ban on a common food ingredient effective immediately — no official agency has confirmed this.", true, "Mimics the trust cues of a \"verified\" account, but no real agency has confirmed it — a classic impersonation-style fake.", ["'verified'", "effective immediately"])
    ],
    [
      c3(["Some deep-sea organisms can survive extreme pressure that would instantly crush a human.", "The 'Great Pacific Garbage Patch' is a solid floating island of trash visible from space.", "Antarctica is technically classified as a desert due to its low precipitation."], 1, "A common myth — the Garbage Patch is mostly diffuse microplastics spread over a huge area, not a solid visible island."),
      c3(["Vaccines undergo multiple phases of clinical trials before approval.", "5G wireless signals operate at frequencies that can weaken the human immune system, according to telecom industry-funded research.", "mRNA vaccine technology was in development for decades before large-scale COVID-19 use."], 1, "A well-known debunked claim — no credible research supports 5G weakening immunity, and the \"industry-funded\" framing is fabricated.")
    ],
    [
      b("News: A national health agency updates its guidelines after a multi-year peer-reviewed clinical trial, publishing full results for outside review.", false, "A normal, transparent process typical of real scientific and health reporting."),
      b("BREAKING: An anonymous whistleblower claims a major AI lab has already built a superintelligent system and is hiding it from regulators, citing 'internal Slack messages' as proof.", true, "Relies entirely on anonymous, unverifiable claims and screenshots — a hallmark of sophisticated modern misinformation.", ["anonymous whistleblower", "internal Slack messages"])
    ]
  ]
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildOrder(diffKey: Difficulty): GameCase[] {
  const levels = RAW_DATA[diffKey];
  const rounds: GameCase[] = [];

  levels.forEach((qs, li) => {
    qs.forEach((q) => {
      if (q.mode === 'binary') {
        rounds.push({
          ...q,
          levelNum: li + 1,
          levelTitle: LEVEL_META[li].title,
          source: LEVEL_META[li].source
        } as BinaryCase);
      } else if (q.mode === 'chooseFake') {
        const idxArr = q.statements.map((_: any, i: number) => i);
        const shuffled = shuffleArray(idxArr);
        rounds.push({
          ...q,
          levelNum: li + 1,
          levelTitle: LEVEL_META[li].title,
          source: LEVEL_META[li].source,
          displayStatements: shuffled.map((i) => q.statements[i]),
          correctDisplayIndex: shuffled.indexOf(q.lieIndex)
        } as ChooseFakeCase);
      }
    });
  });

  return rounds;
}

export const SpotTheFakeGameModal: React.FC<SpotTheFakeGameModalProps> = ({
  isOpen,
  onClose,
  onAwardXP
}) => {
  const [screen, setScreen] = useState<'diff' | 'game' | 'end'>('diff');
  const [currentDiff, setCurrentDiff] = useState<Difficulty>('easy');
  const [order, setOrder] = useState<GameCase[]>([]);
  const [idx, setIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [answered, setAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [bestScores, setBestScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
    extreme: 0
  });

  if (!isOpen) return null;

  const handleStartDifficulty = (diff: Difficulty) => {
    const newOrder = buildOrder(diff);
    setCurrentDiff(diff);
    setOrder(newOrder);
    setIdx(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setIsCorrect(false);
    setPickedIndex(null);
    setScreen('game');
  };

  const handleBackToDiff = () => {
    setScreen('diff');
  };

  const currentCase = order[idx];

  const handleBinaryAnswer = (choseFake: boolean) => {
    if (answered || !currentCase || currentCase.mode !== 'binary') return;
    setAnswered(true);
    const correct = choseFake === currentCase.isFake;
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleChooseFakeAnswer = (selectedIndex: number) => {
    if (answered || !currentCase || currentCase.mode !== 'chooseFake') return;
    setAnswered(true);
    setPickedIndex(selectedIndex);
    const correct = selectedIndex === currentCase.correctDisplayIndex;
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextCase = () => {
    if (idx + 1 >= order.length) {
      // Game over
      const newBest = Math.max(bestScores[currentDiff], score);
      setBestScores((prev) => ({ ...prev, [currentDiff]: newBest }));
      if (onAwardXP) {
        onAwardXP(score * 15); // Award XP for playing
      }
      setScreen('end');
    } else {
      setIdx((prev) => prev + 1);
      setAnswered(false);
      setIsCorrect(false);
      setPickedIndex(null);
    }
  };

  const renderHighlightedText = (text: string, flags: string[]) => {
    if (!flags || flags.length === 0 || !answered) {
      return <span>{text}</span>;
    }
    let parts: React.ReactNode[] = [text];
    flags.forEach((flag) => {
      const newParts: React.ReactNode[] = [];
      parts.forEach((part) => {
        if (typeof part === 'string') {
          const index = part.indexOf(flag);
          if (index !== -1) {
            if (index > 0) newParts.push(part.slice(0, index));
            newParts.push(
              <span key={flag + index} className="bg-rose-500/30 border-b-2 border-rose-500 text-rose-300 font-bold px-1 rounded-xs inline-flex items-center gap-1">
                {flag}
                <Search className="w-3.5 h-3.5 inline text-amber-300 animate-bounce" />
              </span>
            );
            if (index + flag.length < part.length) {
              newParts.push(part.slice(index + flag.length));
            }
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });
    return <span>{parts}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#16233F] text-[#FBF3E3] flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Bar with Brand and Close */}
      <header className="sticky top-0 z-10 bg-[#16233F]/90 backdrop-blur-md border-b border-[#1F3358] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5B942] to-amber-600 flex items-center justify-center text-slate-900 font-bold text-lg shadow-sm">
            🔍
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-wide text-white">
              Spot the Fake — Junior Fact Detectives
            </h1>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#4FB6E8]">
              Check Your Media Literacy IQ • Bytespark MIL
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-[#1F3358] hover:bg-[#2A4373] text-white transition-colors"
          title="Exit Game"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Game Content Area */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* DIFFICULTY SELECTION SCREEN */}
        {screen === 'diff' && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3358] text-[#4FB6E8] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>64 Realistic Cases across 4 Difficulties</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Select Your Detective Difficulty
              </h2>
              <p className="text-xs sm:text-sm text-[#FBF3E3]/70 mt-1 max-w-md mx-auto">
                Test your ability to spot misleading headlines, false statistics, fake quotes, and viral hoaxes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* EASY CARD */}
              <button
                onClick={() => handleStartDifficulty('easy')}
                className="group bg-[#FBF3E3] text-[#16233F] rounded-2xl p-5 text-center border-3 border-[#3FAE72] hover:-translate-y-1 transition-all shadow-xl cursor-pointer relative"
              >
                <div className="text-3xl mb-2">🟢</div>
                <h3 className="text-lg font-extrabold text-[#16233F]">Easy</h3>
                <p className="text-xs text-[#16233F]/70 font-bold mb-3">
                  Obvious fakes, warm-up cases
                </p>
                <span className="bg-[#3FAE72] text-white text-[11px] font-extrabold px-3 py-1 rounded-full tracking-wider">
                  LEVELS 1–8 (16 Cases)
                </span>
                {bestScores.easy > 0 && (
                  <div className="mt-2 text-[11px] text-[#16233F]/70 font-bold">
                    Best Score: {bestScores.easy} / 16
                  </div>
                )}
              </button>

              {/* MEDIUM CARD */}
              <button
                onClick={() => handleStartDifficulty('medium')}
                className="group bg-[#FBF3E3] text-[#16233F] rounded-2xl p-5 text-center border-3 border-[#4FB6E8] hover:-translate-y-1 transition-all shadow-xl cursor-pointer relative"
              >
                <div className="text-3xl mb-2">🔵</div>
                <h3 className="text-lg font-extrabold text-[#16233F]">Medium</h3>
                <p className="text-xs text-[#16233F]/70 font-bold mb-3">
                  Sneakier, semi-believable claims
                </p>
                <span className="bg-[#2E93C6] text-white text-[11px] font-extrabold px-3 py-1 rounded-full tracking-wider">
                  LEVELS 1–8 (16 Cases)
                </span>
                {bestScores.medium > 0 && (
                  <div className="mt-2 text-[11px] text-[#16233F]/70 font-bold">
                    Best Score: {bestScores.medium} / 16
                  </div>
                )}
              </button>

              {/* HARD CARD */}
              <button
                onClick={() => handleStartDifficulty('hard')}
                className="group bg-[#FBF3E3] text-[#16233F] rounded-2xl p-5 text-center border-3 border-[#F5B942] hover:-translate-y-1 transition-all shadow-xl cursor-pointer relative"
              >
                <div className="text-3xl mb-2">🟠</div>
                <h3 className="text-lg font-extrabold text-[#16233F]">Hard</h3>
                <p className="text-xs text-[#16233F]/70 font-bold mb-3">
                  Widely-believed myths & tricks
                </p>
                <span className="bg-[#c98a1f] text-white text-[11px] font-extrabold px-3 py-1 rounded-full tracking-wider">
                  LEVELS 1–8 (16 Cases)
                </span>
                {bestScores.hard > 0 && (
                  <div className="mt-2 text-[11px] text-[#16233F]/70 font-bold">
                    Best Score: {bestScores.hard} / 16
                  </div>
                )}
              </button>

              {/* EXTREME CARD */}
              <button
                onClick={() => handleStartDifficulty('extreme')}
                className="group bg-[#FBF3E3] text-[#16233F] rounded-2xl p-5 text-center border-3 border-[#FF6B5E] hover:-translate-y-1 transition-all shadow-xl cursor-pointer relative"
              >
                <div className="text-3xl mb-2">🔴</div>
                <h3 className="text-lg font-extrabold text-[#16233F]">Extreme</h3>
                <p className="text-xs text-[#16233F]/70 font-bold mb-3">
                  Sophisticated, near-real fakes
                </p>
                <span className="bg-[#E14F42] text-white text-[11px] font-extrabold px-3 py-1 rounded-full tracking-wider">
                  LEVELS 1–8 (16 Cases)
                </span>
                {bestScores.extreme > 0 && (
                  <div className="mt-2 text-[11px] text-[#16233F]/70 font-bold">
                    Best Score: {bestScores.extreme} / 16
                  </div>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-[#FBF3E3]/60 mt-6 max-w-md mx-auto leading-relaxed">
              💡 Each difficulty has 8 levels, including Headlines, Statistics, Science facts, History myths, Quotes, Social Posts, "Two Truths & a Lie," and a Boss Round.
            </p>
          </div>
        )}

        {/* ACTIVE GAME SCREEN */}
        {screen === 'game' && currentCase && (
          <div className="animate-in fade-in duration-300">
            {/* Top Return Button */}
            <button
              onClick={handleBackToDiff}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FBF3E3]/70 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Choose a different difficulty</span>
            </button>

            {/* Level Banner */}
            <div className="flex items-center justify-between bg-[#FBF3E3]/10 rounded-xl px-4 py-2.5 mb-4">
              <span className="text-xs font-bold text-[#F5B942]">
                Level {currentCase.levelNum} · {currentCase.levelTitle}
              </span>
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: DIFF_COLOR[currentDiff] }}
              >
                {DIFF_LABEL[currentDiff]}
              </span>
            </div>

            {/* Progress HUD */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-[#FBF3E3]/70 font-bold mb-1.5">
                  <span>Case {idx + 1} of {order.length}</span>
                  <span>{Math.round(((idx + 1) / order.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-[#FBF3E3]/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4FB6E8] to-[#F5B942] rounded-full transition-all duration-300"
                    style={{ width: `${((idx + 1) / order.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div>
                  <div className="text-lg font-extrabold text-white leading-none">
                    {score}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#FBF3E3]/60 tracking-wider mt-0.5">
                    Score
                  </div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-amber-400 flex items-center justify-center gap-0.5 leading-none">
                    <Flame className="w-4 h-4 fill-amber-400" />
                    <span>{streak}</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#FBF3E3]/60 tracking-wider mt-0.5">
                    Streak
                  </div>
                </div>
              </div>
            </div>

            {/* CASE CARD */}
            <div className="bg-[#FBF3E3] text-[#16233F] rounded-2xl p-6 shadow-2xl relative transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-[#2E93C6] flex items-center gap-1.5">
                  <span>📁</span>
                  <span>Case File {String(idx + 1).padStart(2, '0')}</span>
                </div>
                <span className="bg-[#16233F] text-white text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                  {currentCase.source}
                </span>
              </div>

              {/* BINARY MODE CLAIM TEXT */}
              {currentCase.mode === 'binary' && (
                <div className="text-base sm:text-xl font-extrabold text-[#16233F] leading-snug min-h-[80px] flex items-center">
                  {renderHighlightedText(currentCase.text, currentCase.flags)}
                </div>
              )}

              {/* CHOOSE FAKE MODE STATEMENTS */}
              {currentCase.mode === 'chooseFake' && (
                <div>
                  <p className="text-sm sm:text-base font-extrabold text-[#16233F] mb-3">
                    Which one of these is the LIE? (Tap the false statement)
                  </p>
                  <div className="space-y-2.5">
                    {currentCase.displayStatements.map((stmt, sIdx) => {
                      const isCorrectAnswer = sIdx === currentCase.correctDisplayIndex;
                      const isUserPick = sIdx === pickedIndex;
                      let btnClass = "w-full text-left p-3.5 rounded-xl border-2 font-bold text-sm transition-all ";
                      if (!answered) {
                        btnClass += "bg-white border-[#16233F]/20 hover:border-[#4FB6E8] hover:bg-[#4FB6E8]/10 cursor-pointer";
                      } else if (isCorrectAnswer) {
                        btnClass += "bg-[#3FAE72]/20 border-[#3FAE72] text-[#2C8B58]";
                      } else if (isUserPick && !isCorrectAnswer) {
                        btnClass += "bg-[#FF6B5E]/20 border-[#FF6B5E] text-[#E14F42]";
                      } else {
                        btnClass += "bg-white/60 border-[#16233F]/10 opacity-50";
                      }

                      return (
                        <button
                          key={sIdx}
                          disabled={answered}
                          onClick={() => handleChooseFakeAnswer(sIdx)}
                          className={btnClass}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{stmt}</span>
                            {answered && isCorrectAnswer && (
                              <CheckCircle2 className="w-5 h-5 text-[#3FAE72] shrink-0" />
                            )}
                            {answered && isUserPick && !isCorrectAnswer && (
                              <XCircle className="w-5 h-5 text-[#FF6B5E] shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* VERDICT EXPLANATION BOX */}
            {answered && (
              <div
                className={`mt-4 rounded-xl p-4 font-bold animate-in zoom-in-95 duration-200 border-2 ${
                  isCorrect
                    ? 'bg-[#3FAE72]/20 border-[#3FAE72] text-[#3FAE72]'
                    : 'bg-[#FF6B5E]/20 border-[#FF6B5E] text-[#FF6B5E]'
                }`}
              >
                <div className="flex items-center gap-2 text-base font-extrabold mb-1">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Correct! Sharp Detective Eye!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Not quite. Let's inspect the evidence:</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                  {currentCase.why}
                </p>
              </div>
            )}

            {/* BINARY CHOICE BUTTONS */}
            {currentCase.mode === 'binary' && (
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  disabled={answered}
                  onClick={() => handleBinaryAnswer(false)}
                  className={`py-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                    answered
                      ? !currentCase.isFake
                        ? 'bg-[#3FAE72] text-white ring-4 ring-white/50'
                        : 'bg-[#3FAE72]/40 text-white/60 cursor-default'
                      : 'bg-[#3FAE72] hover:bg-[#2C8B58] text-white cursor-pointer active:translate-y-0.5'
                  }`}
                >
                  <span>🕵️</span>
                  <span>REAL FACT</span>
                </button>

                <button
                  disabled={answered}
                  onClick={() => handleBinaryAnswer(true)}
                  className={`py-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                    answered
                      ? currentCase.isFake
                        ? 'bg-[#FF6B5E] text-white ring-4 ring-white/50'
                        : 'bg-[#FF6B5E]/40 text-white/60 cursor-default'
                      : 'bg-[#FF6B5E] hover:bg-[#E14F42] text-white cursor-pointer active:translate-y-0.5'
                  }`}
                >
                  <span>🚨</span>
                  <span>FAKE CLAIM</span>
                </button>
              </div>
            )}

            {/* NEXT CASE BUTTON */}
            {answered && (
              <button
                onClick={handleNextCase}
                className="w-full mt-4 py-3.5 rounded-xl bg-[#4FB6E8] hover:bg-[#2E93C6] text-slate-900 font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer animate-in fade-in"
              >
                <span>{idx + 1 >= order.length ? 'See Final Score & Rank' : 'Next Case'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* END GAME SCREEN */}
        {screen === 'end' && (
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-b from-[#F5B942] to-amber-600 flex items-center justify-center text-5xl shadow-2xl ring-8 ring-[#F5B942]/20">
              {score / order.length >= 0.9
                ? '🏆'
                : score / order.length >= 0.7
                ? '🥇'
                : score / order.length >= 0.5
                ? '🥈'
                : '🥉'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Case Closed!
            </h2>
            <div className="text-base sm:text-lg font-extrabold text-[#F5B942] mt-1">
              {RANKS[currentDiff]}
            </div>

            <div className="bg-[#FBF3E3] text-[#16233F] rounded-2xl p-6 my-6 shadow-xl">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#16233F]">
                {score} / {order.length}
              </div>
              <div className="text-xs sm:text-sm text-[#16233F]/70 font-bold mt-1">
                claims correctly identified
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Award className="w-4 h-4 text-amber-600" />
                <span>+{score * 15} XP Awarded to Your Bytespark Profile!</span>
              </div>
            </div>

            {/* DETECTIVE TIPS */}
            <div className="bg-[#FBF3E3]/10 rounded-xl p-4 text-left mb-6 border border-white/10">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#F5B942] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Detective Tips for Next Time</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#FBF3E3]/90">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">🚩</span>
                  <span>Watch for words like "BREAKING," "confirms," or "doctors say" with no real verifiable source.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">🚩</span>
                  <span>If it sounds too shocking, too perfect, or too scary to be true — pause and check it twice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">🚩</span>
                  <span>Real facts can usually be checked across multiple trustworthy independent outlets.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBackToDiff}
                className="flex-1 py-3.5 rounded-xl bg-[#FBF3E3]/20 hover:bg-[#FBF3E3]/30 text-white font-extrabold text-sm transition-all"
              >
                Change Difficulty
              </button>
              <button
                onClick={() => handleStartDifficulty(currentDiff)}
                className="flex-1 py-3.5 rounded-xl bg-[#F5B942] hover:bg-amber-500 text-slate-900 font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again ({DIFF_LABEL[currentDiff]})</span>
              </button>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-[#FBF3E3]/40">
          Built for interactive media literacy learning • Bytespark MIL
        </footer>
      </div>
    </div>
  );
};
