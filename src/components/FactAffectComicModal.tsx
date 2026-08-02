import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Award, 
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Search,
  Shield,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ComicStory } from '../types';

interface FactAffectComicModalProps {
  comic: ComicStory;
  onClose: () => void;
  onRewardXP: (amount: number) => void;
}

/* ==========================================================================
   SCENE 1: INTRODUCTION
   "Young superhero Fact Detective, wearing a blue cape with a magnifying glass emblem,
    stands on a rooftop at sunrise overlooking a small town."
   ========================================================================== */
const Scene1Intro: React.FC = () => (
  <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
    {/* Sunrise Sky */}
    <defs>
      <linearGradient id="skyGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF7A00" />
        <stop offset="50%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#FFF176" />
      </linearGradient>
    </defs>
    <rect width="400" height="240" fill="url(#skyGrad1)" />

    {/* Rising Sun */}
    <circle cx="200" cy="140" r="50" fill="#FFEB3B" stroke="black" strokeWidth="3" />
    {/* Sun rays */}
    <line x1="200" y1="70" x2="200" y2="40" stroke="black" strokeWidth="3" strokeLinecap="round" />
    <line x1="140" y1="90" x2="115" y2="70" stroke="black" strokeWidth="3" strokeLinecap="round" />
    <line x1="260" y1="90" x2="285" y2="70" stroke="black" strokeWidth="3" strokeLinecap="round" />

    {/* Small Town Skyline in background */}
    <g stroke="black" strokeWidth="3" fill="#6D4C41">
      <rect x="20" y="160" width="40" height="80" fill="#8D6E63" />
      <rect x="70" y="140" width="50" height="100" fill="#795548" />
      <rect x="130" y="170" width="45" height="70" fill="#A1887F" />
      <rect x="230" y="150" width="55" height="90" fill="#795548" />
      <rect x="300" y="130" width="40" height="110" fill="#5D4037" />
      <rect x="350" y="160" width="40" height="80" fill="#8D6E63" />
    </g>

    {/* Foreground Rooftop */}
    <polygon points="0,200 400,200 400,240 0,240" fill="#37474F" stroke="black" strokeWidth="3" />
    {/* Rooftop Brick lines */}
    <line x1="0" y1="220" x2="400" y2="220" stroke="black" strokeWidth="2" />
    <line x1="80" y1="200" x2="80" y2="220" stroke="black" strokeWidth="2" />
    <line x1="240" y1="200" x2="240" y2="220" stroke="black" strokeWidth="2" />
    <line x1="160" y1="220" x2="160" y2="240" stroke="black" strokeWidth="2" />

    {/* FACT DETECTIVE HERO STANDING ON ROOFTOP */}
    <g transform="translate(180, 85)">
      {/* Blue Cape blowing left */}
      <path d="M10,40 Q-30,50 -50,90 Q-20,95 10,75 Z" fill="#0288D1" stroke="black" strokeWidth="3" strokeLinejoin="round" />
      
      {/* Legs & Boots */}
      <rect x="8" y="75" width="10" height="35" rx="4" fill="#D32F2F" stroke="black" strokeWidth="3" />
      <rect x="22" y="75" width="10" height="35" rx="4" fill="#D32F2F" stroke="black" strokeWidth="3" />
      <rect x="5" y="100" width="15" height="12" rx="3" fill="#FBC02D" stroke="black" strokeWidth="3" />
      <rect x="20" y="100" width="15" height="12" rx="3" fill="#FBC02D" stroke="black" strokeWidth="3" />

      {/* Hero Body / Suit */}
      <rect x="5" y="35" width="30" height="42" rx="6" fill="#1976D2" stroke="black" strokeWidth="3" />
      {/* Belt */}
      <rect x="5" y="70" width="30" height="8" fill="#FBC02D" stroke="black" strokeWidth="2" />

      {/* Magnifying Glass Emblem on Chest */}
      <circle cx="20" cy="52" r="8" fill="#FFF9C4" stroke="black" strokeWidth="2" />
      <circle cx="19" cy="50" r="4" fill="#29B6F6" stroke="black" strokeWidth="1.5" />
      <line x1="22" y1="53" x2="26" y2="58" stroke="black" strokeWidth="2.5" strokeLinecap="round" />

      {/* Hero Arms on Hips */}
      <path d="M5,40 Q-10,55 5,65" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <path d="M35,40 Q50,55 35,65" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />

      {/* Hero Head */}
      <circle cx="20" cy="18" r="18" fill="#FFCC80" stroke="black" strokeWidth="3" />
      {/* Hero Mask */}
      <path d="M4,14 Q20,20 36,14 Q36,24 20,24 Q4,24 4,14 Z" fill="#D32F2F" stroke="black" strokeWidth="2.5" />
      {/* Expressive Confident Eyes */}
      <circle cx="13" cy="18" r="3" fill="white" />
      <circle cx="14" cy="18" r="1.5" fill="black" />
      <circle cx="27" cy="18" r="3" fill="white" />
      <circle cx="28" cy="18" r="1.5" fill="black" />
      {/* Confident Smile */}
      <path d="M14,28 Q20,33 26,28" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
      {/* Hero Hair */}
      <path d="M6,8 Q20,-4 34,8 Q25,2 15,4 Z" fill="#4E342E" stroke="black" strokeWidth="2" />
    </g>
  </svg>
);

/* ==========================================================================
   SCENE 2: VILLAIN REVEAL
   "Mister Misinformation, a sneaky cartoonish villain in a patchwork coat covered in 
    tiny fake newspaper clippings, grins while typing on a glowing laptop shooting out 
    speech bubbles full of exclamation points."
   ========================================================================== */
const Scene2Villain: React.FC = () => (
  <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
    {/* Villain Lair Background */}
    <rect width="400" height="240" fill="#4A148C" />
    <circle cx="200" cy="120" r="130" fill="#6A1B9A" opacity="0.6" />

    {/* Desk / Table */}
    <rect x="40" y="170" width="320" height="70" fill="#311B92" stroke="black" strokeWidth="3" />

    {/* Glowing Laptop */}
    <g transform="translate(150, 125)">
      {/* Laptop Screen with Neon Glow */}
      <rect x="0" y="0" width="90" height="50" rx="4" fill="#00E676" stroke="black" strokeWidth="3" />
      <text x="12" y="28" fill="black" fontSize="13" fontWeight="900" fontFamily="sans-serif">FAKE NEWS!</text>
      {/* Laptop Base */}
      <polygon points="-10,50 100,50 110,65 -20,65" fill="#BDBDBD" stroke="black" strokeWidth="3" />
    </g>

    {/* Speech Bubble Bursts Shooting Out from Laptop */}
    <g transform="translate(240, 45)">
      <path d="M0,40 L-20,70 L10,65 Z" fill="#FF1744" stroke="black" strokeWidth="2" />
      <rect x="-10" y="10" width="80" height="36" rx="10" fill="#FFD600" stroke="black" strokeWidth="3" />
      <text x="10" y="34" fill="black" fontSize="18" fontWeight="900">! ! ! !</text>
    </g>
    <g transform="translate(50, 40)">
      <path d="M70,45 L100,80 L75,70 Z" fill="#FF1744" stroke="black" strokeWidth="2" />
      <rect x="10" y="15" width="75" height="34" rx="10" fill="#FF5252" stroke="black" strokeWidth="3" />
      <text x="22" y="38" fill="white" fontSize="15" fontWeight="900">SHOCK!!</text>
    </g>

    {/* MISTER MISINFORMATION CHARACTER */}
    <g transform="translate(130, 60)">
      {/* Patchwork Coat covered in tiny fake newspaper clippings */}
      <path d="M-30,65 L-40,120 L80,120 L70,65 Z" fill="#7E57C2" stroke="black" strokeWidth="3" />
      {/* Tiny Newspaper Clippings on Coat */}
      <rect x="-25" y="75" width="22" height="16" fill="#FFF9C4" stroke="black" strokeWidth="1.5" transform="rotate(-10 -25 75)" />
      <text x="-21" y="86" fontSize="7" fontWeight="bold" fill="black">LIES</text>
      <rect x="45" y="80" width="22" height="16" fill="#FFCDD2" stroke="black" strokeWidth="1.5" transform="rotate(12 45 80)" />
      <text x="48" y="91" fontSize="7" fontWeight="bold" fill="black">FAKE</text>
      <rect x="5" y="90" width="26" height="18" fill="#C8E6C9" stroke="black" strokeWidth="1.5" />
      <text x="8" y="102" fontSize="7" fontWeight="bold" fill="black">HOAX</text>

      {/* Villain Head */}
      <circle cx="20" cy="30" r="24" fill="#C5E1A5" stroke="black" strokeWidth="3" />
      {/* Pointy Sneaky Hair & Mustache */}
      <path d="M-6,20 Q20,-10 46,20 Q20,5 -6,20 Z" fill="#212121" stroke="black" strokeWidth="2" />
      {/* Sneaky Grinning Eyes */}
      <path d="M5,26 Q12,20 19,26" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
      <path d="M23,26 Q30,20 37,26" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
      {/* Big Sneaky Grin */}
      <path d="M10,40 Q20,50 34,40 Z" fill="white" stroke="black" strokeWidth="2.5" />
      {/* Evil Mustache */}
      <path d="M5,37 Q20,33 35,37" fill="none" stroke="black" strokeWidth="2.5" />

      {/* Typing Hands */}
      <circle cx="-10" cy="70" r="8" fill="#C5E1A5" stroke="black" strokeWidth="2.5" />
      <circle cx="50" cy="70" r="8" fill="#C5E1A5" stroke="black" strokeWidth="2.5" />
    </g>
  </svg>
);

/* ==========================================================================
   SCENE 3: CONFRONTATION
   "Fact Detective bursts into a classroom where three curious kids stare worriedly 
    at a phone showing a shocking fake headline."
   ========================================================================== */
const Scene3Confrontation: React.FC = () => (
  <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
    {/* Bright Classroom Wall Background */}
    <rect width="400" height="240" fill="#FFF59D" />
    {/* Classroom Whiteboard in background */}
    <rect x="150" y="20" width="220" height="90" rx="6" fill="white" stroke="black" strokeWidth="3" />
    <text x="170" y="55" fill="#1976D2" fontSize="14" fontWeight="bold">SCIENCE & MEDIA CLASS</text>
    <text x="170" y="80" fill="#555" fontSize="11">Lesson: Think Before You Share!</text>

    {/* Classroom Desk */}
    <rect x="150" y="160" width="220" height="80" fill="#8D6E63" stroke="black" strokeWidth="3" />

    {/* Glowing Alert Mobile Phone on Desk */}
    <g transform="translate(230, 120)">
      <rect x="0" y="0" width="36" height="55" rx="6" fill="#212121" stroke="black" strokeWidth="2.5" />
      <rect x="3" y="4" width="30" height="45" rx="3" fill="#FF1744" />
      <text x="6" y="22" fill="white" fontSize="8" fontWeight="bold">SHOCK</text>
      <text x="8" y="33" fill="yellow" fontSize="8" fontWeight="bold">NEWS!</text>
      {/* Alert rays */}
      <line x1="-8" y1="10" x2="-3" y2="15" stroke="#FF1744" strokeWidth="2.5" />
      <line x1="44" y1="10" x2="39" y2="15" stroke="#FF1744" strokeWidth="2.5" />
    </g>

    {/* 3 Curious Kids Staring Worriedly at Phone */}
    {/* Kid 1 (Left) */}
    <g transform="translate(170, 95)">
      <circle cx="15" cy="15" r="15" fill="#FFCC80" stroke="black" strokeWidth="2.5" />
      <path d="M8,12 Q15,8 22,12" fill="none" stroke="black" strokeWidth="2" />
      <circle cx="11" cy="15" r="2" fill="black" />
      <circle cx="19" cy="15" r="2" fill="black" />
      <path d="M12,23 Q15,20 18,23" fill="none" stroke="black" strokeWidth="2" />
      <rect x="3" y="30" width="24" height="40" rx="4" fill="#4CAF50" stroke="black" strokeWidth="2.5" />
    </g>

    {/* Kid 2 (Center) */}
    <g transform="translate(235, 80)">
      <circle cx="15" cy="15" r="15" fill="#F48FB1" stroke="black" strokeWidth="2.5" />
      <circle cx="11" cy="14" r="2.5" fill="black" />
      <circle cx="19" cy="14" r="2.5" fill="black" />
      <ellipse cx="15" cy="22" rx="3" ry="4" fill="black" />
      <rect x="3" y="30" width="24" height="45" rx="4" fill="#AB47BC" stroke="black" strokeWidth="2.5" />
    </g>

    {/* Kid 3 (Right) */}
    <g transform="translate(300, 95)">
      <circle cx="15" cy="15" r="15" fill="#FFE082" stroke="black" strokeWidth="2.5" />
      <path d="M8,10 L14,13" stroke="black" strokeWidth="2" />
      <path d="M22,10 L16,13" stroke="black" strokeWidth="2" />
      <circle cx="11" cy="15" r="2" fill="black" />
      <circle cx="19" cy="15" r="2" fill="black" />
      <path d="M11,24 Q15,21 19,24" fill="none" stroke="black" strokeWidth="2" />
      <rect x="3" y="30" width="24" height="40" rx="4" fill="#29B6F6" stroke="black" strokeWidth="2.5" />
    </g>

    {/* FACT DETECTIVE BURSTING IN FROM LEFT */}
    <g transform="translate(35, 75)">
      {/* Speed lines */}
      <line x1="-25" y1="30" x2="-5" y2="30" stroke="black" strokeWidth="3" strokeLinecap="round" />
      <line x1="-30" y1="50" x2="-10" y2="50" stroke="black" strokeWidth="3" strokeLinecap="round" />
      <line x1="-20" y1="70" x2="0" y2="70" stroke="black" strokeWidth="3" strokeLinecap="round" />

      {/* Blue Cape Flowing */}
      <path d="M10,30 Q-25,40 -25,90 Q-5,85 15,65 Z" fill="#0288D1" stroke="black" strokeWidth="3" />
      
      {/* Body & Magnifying Glass Emblem */}
      <rect x="5" y="35" width="36" height="50" rx="6" fill="#1976D2" stroke="black" strokeWidth="3" />
      <circle cx="23" cy="55" r="9" fill="#FFF9C4" stroke="black" strokeWidth="2" />
      <circle cx="22" cy="53" r="4.5" fill="#29B6F6" stroke="black" strokeWidth="1.5" />
      <line x1="25" y1="56" x2="30" y2="61" stroke="black" strokeWidth="2.5" strokeLinecap="round" />

      {/* Arm Pointing Forward */}
      <path d="M35,45 L70,35" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <circle cx="72" cy="34" r="6" fill="#FFCC80" stroke="black" strokeWidth="2.5" />

      {/* Head */}
      <circle cx="23" cy="16" r="18" fill="#FFCC80" stroke="black" strokeWidth="3" />
      <path d="M7,12 Q23,18 39,12 Q39,22 23,22 Q7,22 7,12 Z" fill="#D32F2F" stroke="black" strokeWidth="2" />
      <circle cx="16" cy="16" r="2.5" fill="white" />
      <circle cx="17" cy="16" r="1.5" fill="black" />
      <circle cx="30" cy="16" r="2.5" fill="white" />
      <circle cx="31" cy="16" r="1.5" fill="black" />
      <path d="M17,25 Q23,29 29,25" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

/* ==========================================================================
   SCENE 4: THE LESSON
   "Fact Detective and the three kids gather around a glowing checklist with three 
    icons, a magnifying glass, a question mark, and a checkmark."
   ========================================================================== */
const Scene4Lesson: React.FC = () => (
  <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
    {/* Warm Blue/Teal Tech Background */}
    <rect width="400" height="240" fill="#E0F7FA" />
    <circle cx="200" cy="115" r="110" fill="#B2EBF2" />

    {/* GLOWING CHECKLIST BOARD IN CENTER */}
    <g transform="translate(90, 20)">
      {/* Outer Neon Glow */}
      <rect x="-6" y="-6" width="232" height="172" rx="18" fill="#00E676" opacity="0.3" />
      <rect x="0" y="0" width="220" height="160" rx="14" fill="white" stroke="black" strokeWidth="4" />
      
      {/* Checklist Header */}
      <rect x="0" y="0" width="220" height="36" rx="14" fill="#1976D2" stroke="black" strokeWidth="3" />
      <text x="35" y="24" fill="white" fontSize="14" fontWeight="900">3-STEP FACT CHECKLIST</text>

      {/* Row 1: Magnifying Glass Icon -> Check the source */}
      <g transform="translate(18, 52)">
        <circle cx="14" cy="14" r="10" fill="#FFF9C4" stroke="black" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="5" fill="#29B6F6" stroke="black" strokeWidth="2" />
        <line x1="16" y1="16" x2="22" y2="22" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <text x="38" y="18" fill="black" fontSize="13" fontWeight="bold">1. Check the Source</text>
      </g>

      {/* Row 2: Question Mark Icon -> Ask who said it */}
      <g transform="translate(18, 88)">
        <circle cx="14" cy="14" r="10" fill="#FFE082" stroke="black" strokeWidth="2.5" />
        <text x="10" y="20" fill="black" fontSize="16" fontWeight="900">?</text>
        <text x="38" y="18" fill="black" fontSize="13" fontWeight="bold">2. Ask Who Said It</text>
      </g>

      {/* Row 3: Checkmark Icon -> Look for proof */}
      <g transform="translate(18, 124)">
        <circle cx="14" cy="14" r="10" fill="#C8E6C9" stroke="black" strokeWidth="2.5" />
        <path d="M8,14 L12,18 L20,10" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="38" y="18" fill="black" fontSize="13" fontWeight="bold">3. Look for Proof</text>
      </g>
    </g>

    {/* Fact Detective on Left side pointing at Checklist */}
    <g transform="translate(25, 95)">
      <rect x="5" y="40" width="30" height="60" rx="6" fill="#1976D2" stroke="black" strokeWidth="3" />
      <path d="M10,40 Q-15,50 -15,95" fill="none" stroke="#0288D1" strokeWidth="12" strokeLinecap="round" />
      <circle cx="20" cy="20" r="18" fill="#FFCC80" stroke="black" strokeWidth="3" />
      <path d="M4,16 Q20,22 36,16 Q36,26 20,26 Q4,26 4,16 Z" fill="#D32F2F" stroke="black" strokeWidth="2" />
      <circle cx="14" cy="19" r="2" fill="white" />
      <circle cx="26" cy="19" r="2" fill="white" />
      <path d="M13,28 Q20,33 27,28" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
      {/* Arm pointing up at checklist */}
      <path d="M30,50 L65,25" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* 3 Kids on Right side smiling and looking at Checklist */}
    <g transform="translate(325, 110)">
      <circle cx="15" cy="15" r="15" fill="#FFCC80" stroke="black" strokeWidth="2.5" />
      <path d="M9,21 Q15,26 21,21" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="2" y="32" width="26" height="55" rx="5" fill="#4CAF50" stroke="black" strokeWidth="2.5" />
    </g>
    <g transform="translate(355, 95)">
      <circle cx="15" cy="15" r="15" fill="#F48FB1" stroke="black" strokeWidth="2.5" />
      <path d="M9,21 Q15,26 21,21" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="2" y="32" width="26" height="65" rx="5" fill="#AB47BC" stroke="black" strokeWidth="2.5" />
    </g>
  </svg>
);

/* ==========================================================================
   SCENE 5: ENDING
   "Fact Detective and the kids hold up a glowing shield of checkmarks as 
    Mister Misinformation shrinks away, his fake headlines turning to dust."
   ========================================================================== */
const Scene5Ending: React.FC = () => (
  <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
    {/* Victory Gold & Green Sunburst Background */}
    <defs>
      <radialGradient id="victoryGlow" cx="40%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="60%" stopColor="#6EE7B7" />
        <stop offset="100%" stopColor="#34D399" />
      </radialGradient>
    </defs>
    <rect width="400" height="240" fill="url(#victoryGlow)" />

    {/* GIANT GLOWING SHIELD OF CHECKMARKS IN CENTER-LEFT */}
    <g transform="translate(110, 40)">
      {/* Outer Shield Glow */}
      <path d="M70,0 L130,20 L130,90 Q130,140 70,165 Q10,140 10,90 L10,20 Z" fill="#10B981" opacity="0.4" transform="scale(1.08) translate(-5,-5)" />
      {/* Main Shield */}
      <path d="M70,0 L130,20 L130,90 Q130,140 70,165 Q10,140 10,90 L10,20 Z" fill="#059669" stroke="black" strokeWidth="4" />
      <path d="M70,10 L120,28 L120,88 Q120,130 70,150 Q20,130 20,88 L20,28 Z" fill="#34D399" stroke="black" strokeWidth="2.5" />
      
      {/* Big Glowing White Checkmark in Center */}
      <path d="M45,75 L65,95 L98,55" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45,75 L65,95 L98,55" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Little checkmark sparkles around Shield */}
      <path d="M5,30 L10,35 L20,25" fill="none" stroke="black" strokeWidth="2.5" />
      <path d="M130,40 L135,45 L145,35" fill="none" stroke="black" strokeWidth="2.5" />
      <path d="M125,110 L130,115 L140,105" fill="none" stroke="black" strokeWidth="2.5" />
    </g>

    {/* Fact Detective & Kids holding up the Shield */}
    <g transform="translate(40, 85)">
      {/* Fact Detective Hero */}
      <circle cx="20" cy="20" r="18" fill="#FFCC80" stroke="black" strokeWidth="3" />
      <path d="M4,16 Q20,22 36,16 Q36,26 20,26 Q4,26 4,16 Z" fill="#D32F2F" stroke="black" strokeWidth="2" />
      <path d="M12,28 Q20,34 28,28" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="5" y="40" width="30" height="55" rx="6" fill="#1976D2" stroke="black" strokeWidth="3" />
      {/* Hero Thumbs Up */}
      <path d="M35,55 L55,40" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Kids Cheering */}
    <g transform="translate(85, 110)">
      <circle cx="15" cy="15" r="15" fill="#FFCC80" stroke="black" strokeWidth="2.5" />
      <path d="M9,20 Q15,27 21,20" fill="none" stroke="black" strokeWidth="2.5" />
      <rect x="3" y="32" width="24" height="48" rx="4" fill="#4CAF50" stroke="black" strokeWidth="2.5" />
    </g>
    <g transform="translate(235, 110)">
      <circle cx="15" cy="15" r="15" fill="#F48FB1" stroke="black" strokeWidth="2.5" />
      <path d="M9,20 Q15,27 21,20" fill="none" stroke="black" strokeWidth="2.5" />
      <rect x="3" y="32" width="24" height="48" rx="4" fill="#AB47BC" stroke="black" strokeWidth="2.5" />
    </g>

    {/* MISTER MISINFORMATION SHRINKING AWAY ON RIGHT, HEADLINES TURNING TO DUST */}
    <g transform="translate(300, 130)">
      {/* Shrunk Scared Villain */}
      <circle cx="30" cy="25" r="16" fill="#C5E1A5" stroke="black" strokeWidth="2.5" />
      {/* Scared Wavy Mouth */}
      <path d="M22,32 Q30,28 38,32" fill="none" stroke="black" strokeWidth="2" />
      <path d="M10,42 L50,42 L45,85 L15,85 Z" fill="#7E57C2" stroke="black" strokeWidth="2.5" />
      
      {/* Fake newspaper clippings dissolving into dust */}
      <circle cx="0" cy="20" r="3" fill="#616161" />
      <circle cx="-15" cy="35" r="2" fill="#757575" />
      <circle cx="-5" cy="55" r="4" fill="#9E9E9E" />
      <circle cx="-25" cy="25" r="2.5" fill="#616161" />
      <circle cx="-10" cy="75" r="3" fill="#757575" />
      <circle cx="58" cy="30" r="2.5" fill="#616161" />
      <circle cx="65" cy="50" r="3.5" fill="#757575" />
      <text x="-35" y="15" fontSize="8" fill="#424242" fontWeight="bold">LIES...</text>
      <text x="45" y="10" fontSize="8" fill="#424242" fontWeight="bold">POOF!</text>
    </g>
  </svg>
);

/* ==========================================================================
   SCENE SELECTOR HELPER
   ========================================================================== */
const renderComicScene = (panelIndex: number, customSceneId?: string, comicId?: string, fallbackImage?: string) => {
  if (comicId === 'comic-fact-affect' || (customSceneId && customSceneId.startsWith('fact-affect'))) {
    switch (panelIndex) {
      case 0:
        return <Scene1Intro />;
      case 1:
        return <Scene2Villain />;
      case 2:
        return <Scene3Confrontation />;
      case 3:
        return <Scene4Lesson />;
      case 4:
        return <Scene5Ending />;
      default:
        return <Scene1Intro />;
    }
  }

  return (
    <img
      src={fallbackImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'}
      alt="Comic Scene"
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
  );
};

export const FactAffectComicModal: React.FC<FactAffectComicModalProps> = ({
  comic,
  onClose,
  onRewardXP,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = comic.slides.length || 5;
  const currentSlide = comic.slides[currentPage] || comic.slides[0];

  // Swipe gesture support
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50 && currentPage < totalPages - 1) {
      // Swiped Left -> Next Page
      setCurrentPage((prev) => prev + 1);
    } else if (diff < -50 && currentPage > 0) {
      // Swiped Right -> Previous Page
      setCurrentPage((prev) => prev - 1);
    }
    setTouchStartX(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleReadAgain = () => {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    setCurrentPage(0);
  };

  const handleFinishAndClaim = () => {
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    onRewardXP(50);
    onClose();
  };

  const speechType = currentSlide.speechBubbleType || 'speech';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-slate-900 flex flex-col max-h-[92vh]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* TOP HEADER: PROGRESS INDICATOR & TITLE */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b-4 border-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
              🦸‍♂️
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight text-amber-300">
                {comic.title}
              </h3>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Page {currentPage + 1} of {totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Visual step indicators */}
            <div className="flex items-center gap-1">
              {comic.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentPage
                      ? 'w-6 bg-amber-400'
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Close Comic"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* COMIC PAGE VIEWPORT WITH ANIMATED TRANSITIONS */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-3 sm:p-4 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border-4 border-slate-900 shadow-lg overflow-hidden flex flex-col flex-1"
            >
              {/* TOP / CENTER: FULL-WIDTH VECTOR CARTOON IMAGE ASSET */}
              <div className="relative aspect-[4/3] sm:aspect-video w-full bg-slate-900 border-b-4 border-slate-900 overflow-hidden">
                {renderComicScene(currentPage, currentSlide.customSceneId, comic.id, comic.coverImage)}

                {/* Panel Number Tag */}
                <div className="absolute top-2.5 left-2.5 bg-slate-900 text-amber-300 text-xs font-black px-3 py-1 rounded-full border-2 border-amber-400 uppercase tracking-wide shadow-md">
                  Panel {currentPage + 1}
                </div>

                {/* Speaker Badge if present */}
                {currentSlide.speaker && (
                  <div className="absolute bottom-2 left-2.5 bg-slate-900/90 text-white text-xs font-extrabold px-3 py-1 rounded-lg border-2 border-slate-700 flex items-center gap-1.5 shadow-md">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentSlide.speaker}</span>
                  </div>
                )}
              </div>

              {/* BOTTOM: SPEECH-BUBBLE-STYLED TEXT OVERLAY AT THE BOTTOM */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-amber-50/50">
                {/* Speech / Thought Bubble Container */}
                <div 
                  className={`relative p-4 sm:p-5 rounded-2xl border-4 border-slate-900 bg-white shadow-md my-2 ${
                    speechType === 'thought' 
                      ? 'rounded-3xl border-dashed border-amber-500' 
                      : speechType === 'exclamation' 
                      ? 'border-red-600 bg-red-50/40' 
                      : 'border-slate-900'
                  }`}
                >
                  {/* Comic Speech Bubble Tail */}
                  <div className="absolute -top-3 left-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-12 border-b-slate-900" />

                  {/* Large readable font for age 8-12 */}
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug tracking-tight font-sans">
                    {currentSlide.speechBubbleText || currentSlide.description}
                  </p>
                </div>

                {/* MIL Lesson Footer Pill */}
                {currentSlide.milLesson && (
                  <div className="mt-3 bg-emerald-100 border-2 border-emerald-600/50 rounded-xl p-3 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950 font-bold">
                    <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                        Fact Detective Tip:
                      </span>
                      <p>{currentSlide.milLesson}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM: TOUCH-FRIENDLY NAVIGATION BUTTONS SIZED FOR MOBILE */}
        <div className="bg-slate-900 p-3 sm:p-4 border-t-4 border-slate-900 flex items-center justify-between gap-2">
          {/* Previous Page Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="flex-1 sm:flex-initial py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1 bg-slate-800 text-white border-2 border-slate-700 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all min-h-[48px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Conditional Next / Ending Buttons */}
          {currentPage < totalPages - 1 ? (
            <button
              onClick={handleNextPage}
              className="flex-1 py-3 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 bg-amber-400 text-slate-950 border-2 border-amber-300 hover:bg-amber-300 active:scale-98 transition-all min-h-[48px] shadow-lg"
            >
              <span>Next Page</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              {/* READ AGAIN LOOP BUTTON AT THE END */}
              <button
                onClick={handleReadAgain}
                className="flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-blue-600 text-white border-2 border-blue-400 hover:bg-blue-500 transition-all min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Read Again</span>
              </button>

              {/* FINISH & CLAIM XP BUTTON */}
              <button
                onClick={handleFinishAndClaim}
                className="flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-emerald-500 text-white border-2 border-emerald-400 hover:bg-emerald-400 transition-all min-h-[48px] shadow-lg"
              >
                <Award className="w-4 h-4" />
                <span>Claim +50 XP ⭐</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
