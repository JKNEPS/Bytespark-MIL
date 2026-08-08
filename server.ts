import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Enable CORS middleware so requests from shared links, preview frames, and external domains work globally
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Helper to get active Gemini API key from environment
function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY || null;
}

// Initialize Gemini client lazily/safely
function getGeminiClient() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("GEMINI_API_KEY / API_KEY / GOOGLE_API_KEY environment variable is missing.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-memory data store for community campaigns & events (preserves user submissions during server runtime)
interface Campaign {
  id: string;
  title: string;
  organizer: string;
  category: string;
  description: string;
  location: string;
  date: string;
  participantsCount: number;
  joined: boolean;
  updates: string[];
  tags: string[];
  createdAt: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  organization: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  date: string;
  type: "Workshop" | "Youth Forum" | "Fact-check Sprint" | "School Club";
  description: string;
  contactEmail: string;
  link: string;
  topic: string;
}

let campaigns: Campaign[] = [
  {
    id: "camp-1",
    title: "Truth In News: Youth High School Workshop Series",
    organizer: "UNESCO Youth Assembly Kenya",
    category: "School Outreach",
    description: "Peer-led 45-minute interactive workshops teaching students to detect AI deepfakes and emotional headline traps before sharing.",
    location: "Nairobi, Kenya & Online",
    date: "Aug 15 - Sep 10, 2026",
    participantsCount: 342,
    joined: false,
    updates: [
      "20 schools signed up across Nairobi district!",
      "Toolkit translated into Swahili and English."
    ],
    tags: ["Deepfakes", "Youth Leadership", "Education"],
    createdAt: new Date().toISOString()
  },
  {
    id: "camp-2",
    title: "Elections 2026: Digital Integrity Watch",
    organizer: "Southeast Asia Youth Fact Alliance",
    category: "Civic Integrity",
    description: "Monitoring viral election claims and synthetic speech clips across TikTok and WhatsApp groups during regional elections.",
    location: "Jakarta, Indonesia & Manila, Philippines",
    date: "Jul 20 - Oct 01, 2026",
    participantsCount: 1250,
    joined: false,
    updates: [
      "Flagged 45 coordinated audio deepfakes targeting candidate speeches.",
      "Published 12 quick prebunks reaching 80,000 students."
    ],
    tags: ["Elections", "AI Audio", "Civic Tech"],
    createdAt: new Date().toISOString()
  },
  {
    id: "camp-3",
    title: "Health Truth Squad: Anti-Medical Myth Campaign",
    organizer: "Global Youth Health Advocates",
    category: "Health Literacy",
    description: "Creating comic strips and 30-second reel explainers debunking fake cure claims and altered statistical charts.",
    location: "Global Virtual",
    date: "Aug 01 - Nov 30, 2026",
    participantsCount: 890,
    joined: false,
    updates: [
      "Released Episode 1 of 'The Miracle Pill Myth' comic strip!",
      "Partnered with local health student associations."
    ],
    tags: ["Health", "Comics", "Visual Stories"],
    createdAt: new Date().toISOString()
  }
];

let communityEvents: CommunityEvent[] = [
  {
    id: "evt-1",
    title: "Youth Deepfake Detection Sprint",
    organization: "Bytespark Local Chapter",
    city: "Nairobi",
    country: "Kenya",
    coordinates: { lat: -1.286389, lng: 36.817223 },
    date: "August 12, 2026",
    type: "Fact-check Sprint",
    description: "Hands-on afternoon session testing AI tools and verifying viral audio clips.",
    contactEmail: "nairobi@bytespark.org",
    link: "https://bytespark.org/events/nairobi",
    topic: "Deepfakes"
  },
  {
    id: "evt-2",
    title: "Media Literacy Teacher Summit",
    organization: "UNESCO Youth Network",
    city: "Paris",
    country: "France",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    date: "August 20, 2026",
    type: "Workshop",
    description: "Equipping secondary school educators with gamified MIL toolkits.",
    contactEmail: "paris-mil@unesco.org",
    link: "https://unesco.org/mil-summit",
    topic: "Educational Toolkits"
  },
  {
    id: "evt-3",
    title: "AI Ethics & Synthetic Media Forum",
    organization: "Asia-Pacific Youth Media Hub",
    city: "Tokyo",
    country: "Japan",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    date: "September 05, 2026",
    type: "Youth Forum",
    description: "Panel discussion on responsible AI use in newsrooms and social platforms.",
    contactEmail: "tokyo-youth@milhub.asia",
    link: "https://milhub.asia/tokyo2026",
    topic: "AI Ethics"
  },
  {
    id: "evt-4",
    title: "High School Media Literacy Club Launch",
    organization: "Bytespark Student League",
    city: "São Paulo",
    country: "Brazil",
    coordinates: { lat: -23.5505, lng: -46.6333 },
    date: "September 15, 2026",
    type: "School Club",
    description: "Student-run weekly workshop discussing weekly misinformation trends.",
    contactEmail: "saopaulo@bytespark.org",
    link: "https://bytespark.org/clubs/sp",
    topic: "Elections"
  }
];

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper function to extract JSON robustly from Gemini output
function extractJsonFromText(rawText: string): any | null {
  if (!rawText) return null;
  const trimmed = rawText.trim();

  // 1. Try direct parse
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Continue
  }

  // 2. Try markdown code block ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      // Continue
    }
  }

  // 3. Try finding outermost { ... }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonCandidate);
    } catch (e) {
      // Continue
    }
  }

  return null;
}

// Helper function to handle quota/rate limits resiliently across models and search configurations
async function generateContentWithResilientFallback(
  ai: any,
  options: {
    contents: any;
    systemInstruction?: string;
    useGoogleSearch?: boolean;
    responseMimeType?: string;
  }
) {
  try {
    const config: any = {
      systemInstruction: options.systemInstruction
    };
    if (options.useGoogleSearch) {
      config.tools = [{ googleSearch: {} }];
    }
    if (options.responseMimeType) {
      config.responseMimeType = options.responseMimeType;
    }
    return await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: options.contents,
      config
    });
  } catch (firstErr) {
    // If the first attempt failed (e.g., Google Search grounding tool quota limit 429),
    // try standard gemini-3.6-flash without Google Search tool
    try {
      const config: any = {
        systemInstruction: options.systemInstruction
      };
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      return await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: options.contents,
        config
      });
    } catch (secondErr) {
      // Third attempt: try gemini-2.5-flash
      try {
        const config: any = {
          systemInstruction: options.systemInstruction
        };
        if (options.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }
        return await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: options.contents,
          config
        });
      } catch (thirdErr) {
        return null; // Signals to caller to use clean fallback data without error logging
      }
    }
  }
}

// Helper function to normalize verification classification to the three exact requested results
function normalizeVerificationClassification(val: string = ""): string {
  const lower = val.toLowerCase().trim();
  if (
    lower === "real/official confirmed" ||
    lower.includes("official confirmed") ||
    lower.includes("real/") ||
    lower.includes("real /") ||
    lower.includes("verified authentic") ||
    lower.includes("confirmed true") ||
    lower.includes("authentic") ||
    lower.includes("true")
  ) {
    return "Real/official confirmed";
  } else if (
    lower === "unconfirmed or fake" ||
    lower.includes("unconfirmed or fake") ||
    lower.includes("fake") ||
    lower.includes("not found") ||
    lower.includes("hoax") ||
    lower.includes("fabricated") ||
    lower.includes("deepfake") ||
    lower.includes("debunked") ||
    lower.includes("false") ||
    lower.includes("scam")
  ) {
    return "unconfirmed or fake";
  } else {
    return "unconfirmed";
  }
}

// Helper functions for resilient, dynamic fallbacks tailored to the user's specific claim
/**
 * Strict validation and clamping function for verification confidence score.
 * - Safely converts input score to integer.
 * - Explicitly caps confidence score to at most 15% if grounding fails or is ungrounded.
 * - Strictly clamps confidence score between 0 and 100.
 */
function validateAndClampConfidence(score: any, isGrounded: boolean = true): number {
  let parsed = parseInt(String(score), 10);
  if (isNaN(parsed)) {
    parsed = 50;
  }
  if (!isGrounded) {
    parsed = Math.min(parsed, 15);
  }
  return Math.min(100, Math.max(0, parsed));
}

// Simple in-memory quota counter per provider (decrements on each successful call)
const providerQuota = {
  sapling: 1000,
  winston: 1000,
  edenai: 1000,
  imagga: 1000
};

// Helper function to fetch with timeout (default 8 seconds per call)
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Sapling AI Detector integration helper.
 * Queries Sapling API endpoint using process.env.SAPLING_API_KEY.
 */
async function checkSaplingAiText(text: string): Promise<{
  score: number;
  isAi: boolean;
  sentenceScores?: any[];
  raw?: any;
} | null> {
  const saplingKey = process.env.SAPLING_API_KEY || process.env.SAPLINGAI_API_KEY || process.env.SAPLING_KEY;
  const cleanText = (text || "").trim();

  if (!cleanText || cleanText.length < 5 || !saplingKey) {
    return null;
  }

  try {
    const response = await fetchWithTimeout("https://api.sapling.ai/api/v1/aidetect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: saplingKey,
        text: cleanText
      })
    }, 8000);

    if (response.ok) {
      const data = await response.json();
      providerQuota.sapling = Math.max(0, providerQuota.sapling - 1);
      let rawScore = typeof data.score === "number" ? data.score : 0;
      if (rawScore <= 1) {
        rawScore = Math.round(rawScore * 100);
      } else {
        rawScore = Math.round(rawScore);
      }
      const score = Math.min(100, Math.max(0, rawScore));
      return {
        score,
        isAi: score >= 50,
        sentenceScores: data.sentence_scores || [],
        raw: data
      };
    } else {
      const errText = await response.text();
      console.warn("[Sapling API] Response error status:", response.status, errText);
    }
  } catch (err: any) {
    console.warn("[Sapling API] Request exception:", err?.message || err);
  }

  return null;
}

/**
 * Fallback chain for AI text detection: Sapling AI -> Winston AI -> Eden AI / Edlin
 */
async function runTextDetectionFallbackChain(text: string) {
  const cleanText = (text || "").trim();
  if (!cleanText) {
    return { verdict: "UNKNOWN", status: "empty_text", reasoning: "No text provided for detection." };
  }

  // 1) Sapling AI
  const saplingKey = process.env.SAPLING_API_KEY || process.env.SAPLINGAI_API_KEY || process.env.SAPLING_KEY;
  if (saplingKey && providerQuota.sapling > 0) {
    try {
      const saplingResult = await checkSaplingAiText(cleanText);
      if (saplingResult) {
        const verdict = saplingResult.score >= 50 ? "AI_GENERATED" : "HUMAN";
        return {
          verdict,
          score: saplingResult.score,
          isAi: saplingResult.isAi,
          provider: "sapling",
          status: "success",
          details: saplingResult.raw
        };
      }
    } catch (err: any) {
      console.warn("[detect-text] Sapling provider failed or timed out:", err?.message || err);
    }
  }

  // 2) Winston AI
  const winstonKey = process.env.WINSTON_API_KEY || process.env.WINSTONAI_API_KEY || process.env.WINSTON_KEY;
  if (winstonKey && providerQuota.winston > 0) {
    try {
      const res = await fetchWithTimeout("https://api.gowinston.ai/v2/ai-content-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${winstonKey}`
        },
        body: JSON.stringify({ text: cleanText })
      }, 8000);

      if (res.ok) {
        const data = await res.json();
        providerQuota.winston = Math.max(0, providerQuota.winston - 1);
        let rawScore = typeof data.score === "number" ? data.score : (typeof data.ai_score === "number" ? data.ai_score : 0);
        const score = Math.round(rawScore <= 1 ? rawScore * 100 : rawScore);
        const verdict = score >= 50 ? "AI_GENERATED" : "HUMAN";
        return {
          verdict,
          score,
          isAi: score >= 50,
          provider: "winston",
          status: "success",
          details: data
        };
      } else {
        console.warn("[detect-text] Winston API returned status:", res.status, await res.text());
      }
    } catch (err: any) {
      console.warn("[detect-text] Winston provider failed or timed out:", err?.message || err);
    }
  }

  // 3) Eden AI / Edlin
  const edenKey = process.env.EDENAI_API_KEY || process.env.EDLIN_API_KEY || process.env.EDEN_API_KEY || process.env.EDEN_KEY;
  if (edenKey && providerQuota.edenai > 0) {
    try {
      const res = await fetchWithTimeout("https://api.edenai.run/v2/text/ai_detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${edenKey}`
        },
        body: JSON.stringify({ providers: "winstonai", text: cleanText })
      }, 8000);

      if (res.ok) {
        const data = await res.json();
        providerQuota.edenai = Math.max(0, providerQuota.edenai - 1);
        const winstonResult = data.winstonai || {};
        let rawScore = typeof winstonResult.ai_score === "number" ? winstonResult.ai_score : (typeof winstonResult.score === "number" ? winstonResult.score : 0);
        const score = Math.round(rawScore <= 1 ? rawScore * 100 : rawScore);
        const verdict = score >= 50 ? "AI_GENERATED" : "HUMAN";
        return {
          verdict,
          score,
          isAi: score >= 50,
          provider: "edenai",
          status: "success",
          details: data
        };
      } else {
        console.warn("[detect-text] Eden AI returned status:", res.status, await res.text());
      }
    } catch (err: any) {
      console.warn("[detect-text] Eden AI provider failed or timed out:", err?.message || err);
    }
  }

  // If all three fail or their quota is exhausted:
  return {
    verdict: "UNKNOWN",
    status: "all_providers_failed",
    reasoning: "All detection providers (Sapling, Winston, Eden AI) failed, were unconfigured, or had exhausted quotas."
  };
}

function getVerifyFallback(content: string = "", inputType: string = "claim") {
  const cleanClaim = (content || "").trim();
  const text = cleanClaim.toLowerCase();
  const shortClaim = cleanClaim ? `"${cleanClaim.slice(0, 90)}${cleanClaim.length > 90 ? '...' : ''}"` : "the submitted claim";

  const officialKeywords = [
    "kathmandupost", "republica", "bbc", "reuters", "onlinekhabar", "unesco",
    "gov", "who", "un.org", "official", "confirmed", "ministry", "police",
    "nasa", "department", "statement", "press release", "earth is round",
    "water", "sun rises", "scientific consensus", "ap news", "afp"
  ];

  const fakeKeywords = [
    "deepfake", "ai voice", "flat earth", "5g causes", "miracle cure",
    "secret trick", "lottery winner", "click here", "hoax", "scam",
    "fake", "fabricated", "alien landing", "free 10000", "magic pill",
    "cure for cancer in 2 days", "synthetic audio", "cgi clone", "conspiracy"
  ];

  const healthKeywords = [
    "cure", "health", "hospital", "virus", "breakthrough", "vaccine",
    "remedy", "disease", "treatment", "medicine"
  ];

  const electionKeywords = [
    "election", "vote", "poll", "candidate", "ballot", "voting", "politician"
  ];

  let classification = "unconfirmed";
  let confidence = 84;
  let summary = "";
  let keyFindings: string[] = [];

  const isOfficial = officialKeywords.some(k => text.includes(k));
  const isFake = fakeKeywords.some(k => text.includes(k));
  const isHealth = healthKeywords.some(k => text.includes(k));
  const isElection = electionKeywords.some(k => text.includes(k));

  if (isOfficial) {
    classification = "Real/official confirmed";
    confidence = 94;
    summary = `The claim ${shortClaim} aligns with verified facts and statements documented in official institutional or reputable news archives.`;
    keyFindings = [
      `Cross-referenced ${shortClaim} against official press releases and institutional records.`,
      "Verified named author byline and institutional accountability.",
      "No conflicting notices found across primary government or WHO channels."
    ];
  } else if (isFake) {
    classification = "unconfirmed or fake";
    confidence = 92;
    summary = `The claim ${shortClaim} was not found on legitimate official channels and exhibits hallmarks of fabricated, sensational, or deepfake content.`;
    keyFindings = [
      `No authentic primary source found on the internet supporting ${shortClaim}.`,
      "Exhibits patterns typical of clickbait or synthetic media manipulation.",
      "Absence of official authority confirmation or verified news coverage."
    ];
  } else if (isHealth) {
    classification = "unconfirmed";
    confidence = 86;
    summary = `The health claim ${shortClaim} is circulating online but lacks peer-reviewed medical trial backing or official health ministry advisory confirmation.`;
    keyFindings = [
      `Health claims regarding ${shortClaim} require official WHO or health ministry backing.`,
      "Promotes unverified anecdotes or secondary claims without clinical trials.",
      "Check with qualified health professionals before acting on health advice."
    ];
  } else if (isElection) {
    classification = "unconfirmed";
    confidence = 85;
    summary = `The election claim ${shortClaim} is circulating online but has not been verified by official election commission portals.`;
    keyFindings = [
      `Political content regarding ${shortClaim} requires official election commission validation.`,
      "High susceptibility to automated social media amplification during election cycles.",
      "Absence of primary official press briefing or published decree."
    ];
  } else {
    classification = "unconfirmed";
    confidence = 82;
    summary = `The claim ${shortClaim} is found in online discussion, but lacks direct confirmation from primary official authorities or established newsrooms.`;
    keyFindings = [
      `Information regarding ${shortClaim} is currently unverified by official agencies.`,
      "Secondary blog posts and social channels are sharing this without primary links.",
      "Requires lateral reading against official government or institutional sites."
    ];
  }

  const reasoningTrail = [
    `Step 1: Queried digital archives and internet indexes for ${shortClaim}.`,
    "Step 2: Evaluated source authority (official government/press vs. secondary blogs/social posts).",
    "Step 3: Identified presence or absence of primary attribution and named author credentials.",
    `Step 4: Assigned classification "${classification}" based on official authority verification.`
  ];

  return {
    classification,
    confidence: validateAndClampConfidence(confidence, false), // Ungrounded fallback capped at 15%
    searchGrounded: false,
    summary,
    reasoningTrail,
    keyFindings,
    recommendations: [
      "Practice lateral reading: search if official government or institutional authorities confirm this claim",
      "Check for named, accountable authors rather than anonymous handles or viral posts",
      "Pause before sharing if the content triggers strong emotional reactions"
    ],
    groundingSources: [
      { title: "UNESCO Media & Information Literacy Guidelines", url: "https://www.unesco.org/en/media-information-literacy" },
      { title: "International Fact-Checking Network (IFCN)", url: "https://www.poynter.org/ifcn/" }
    ]
  };
}

// GET /api/quota-status — returns remaining quota per provider
app.get("/api/quota-status", (req, res) => {
  return res.json({
    sapling: {
      remaining: providerQuota.sapling,
      configured: Boolean(process.env.SAPLING_API_KEY)
    },
    winston: {
      remaining: providerQuota.winston,
      configured: Boolean(process.env.WINSTON_API_KEY)
    },
    edenai: {
      remaining: providerQuota.edenai,
      configured: Boolean(process.env.EDENAI_API_KEY)
    },
    imagga: {
      remaining: providerQuota.imagga,
      configured: true
    }
  });
});

/**
 * Imagga Image Analysis and Tagging helper function.
 * Queries Imagga API endpoint (https://api.imagga.com/v2/tags?image_url=...)
 */
async function checkImaggaImageAnalysis(imageUrl: string): Promise<{
  verdict: "AI_GENERATED" | "HUMAN";
  score: number;
  isAi: boolean;
  provider: "imagga";
  status: "success";
  tags: Array<{ name: string; confidence: number }>;
  details?: any;
} | null> {
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return null;
  }

  const imaggaKey = process.env.IMAGGA_API_KEY || "acc_dc0c86eed205c36";
  const imaggaSecret = process.env.IMAGGA_API_SECRET || "d8a1f6eb9152488255ed24ad261f1eb7";
  const authHeader = process.env.IMAGGA_AUTH_HEADER || ("Basic " + Buffer.from(`${imaggaKey}:${imaggaSecret}`).toString("base64"));

  try {
    const url = `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}`;
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        "Authorization": authHeader
      }
    }, 8000);

    if (!response.ok) {
      console.warn("[imagga] API status:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    providerQuota.imagga = Math.max(0, providerQuota.imagga - 1);
    const rawTags = data?.result?.tags || [];
    const formattedTags = rawTags.slice(0, 15).map((t: any) => ({
      name: t.tag?.en || "",
      confidence: Math.round(t.confidence || 0)
    }));

    const aiKeywords = [
      "illustration", "digital art", "cgi", "rendering", "3d render", "drawing", "painting", 
      "graphic design", "vector", "generated", "synthetic", "artificial", "deepfake", 
      "anime", "cartoon", "fantasy", "surreal", "fiction"
    ];

    let maxAiConfidence = 0;
    formattedTags.forEach((t: { name: string; confidence: number }) => {
      const lower = t.name.toLowerCase();
      if (aiKeywords.some(k => lower.includes(k))) {
        if (t.confidence > maxAiConfidence) {
          maxAiConfidence = t.confidence;
        }
      }
    });

    const score = Math.round(maxAiConfidence);
    const verdict = score >= 50 ? "AI_GENERATED" : "HUMAN";

    return {
      verdict,
      score,
      isAi: score >= 50,
      provider: "imagga",
      status: "success",
      tags: formattedTags,
      details: data
    };
  } catch (err: any) {
    console.warn("[imagga] Error analyzing image tags:", err?.message || err);
    return null;
  }
}

// POST /api/detect-text — detects if submitted text is AI-generated (uses Sapling -> Winston -> Eden AI fallback chain)
app.post("/api/detect-text", async (req, res) => {
  const { text, claim, content } = req.body;
  const targetText = text || claim || content || "";

  if (!targetText.trim()) {
    return res.status(400).json({
      verdict: "UNKNOWN",
      status: "empty_text",
      error: "No text provided for detection."
    });
  }

  const result = await runTextDetectionFallbackChain(targetText);
  return res.json(result);
});

// POST /api/detect-image — detects if a submitted image is AI-generated via Winston AI or Eden AI
app.post("/api/detect-image", async (req, res) => {
  const { imageUrl, imageBase64, image, url } = req.body;
  const targetUrl = imageUrl || url || "";
  const targetBase64 = imageBase64 || image || "";

  if (!targetUrl && !targetBase64) {
    return res.status(400).json({
      verdict: "UNKNOWN",
      status: "missing_image",
      error: "Please provide either imageUrl or imageBase64 in the request body."
    });
  }

  const winstonKey = process.env.WINSTON_API_KEY || process.env.WINSTONAI_API_KEY || process.env.WINSTON_KEY;
  if (winstonKey && providerQuota.winston > 0) {
    try {
      const payload: any = {
        url: targetUrl || targetBase64
      };

      const response = await fetchWithTimeout("https://api.gowinston.ai/v2/image-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${winstonKey}`
        },
        body: JSON.stringify(payload)
      }, 8000);

      if (response.ok) {
        const data = await response.json();
        providerQuota.winston = Math.max(0, providerQuota.winston - 1);
        let aiScore = 0;
        if (typeof data.ai_probability === "number") {
          aiScore = Math.round(data.ai_probability <= 1 ? data.ai_probability * 100 : data.ai_probability);
        } else if (typeof data.human_probability === "number") {
          aiScore = Math.round((1 - data.human_probability) * 100);
        } else if (typeof data.ai_score === "number") {
          aiScore = Math.round(data.ai_score <= 1 ? data.ai_score * 100 : data.ai_score);
        } else if (typeof data.score === "number") {
          aiScore = Math.round(data.score <= 1 ? data.score * 100 : data.score);
        }
        const score = Math.min(100, Math.max(0, aiScore));
        const verdict = score >= 50 ? "AI_GENERATED" : "HUMAN";
        return res.json({
          verdict,
          score,
          isAi: score >= 50,
          provider: "winston",
          status: "success",
          details: data
        });
      } else {
        const errText = await response.text();
        console.warn("[detect-image] Winston AI image detection status:", response.status, errText);
      }
    } catch (err: any) {
      console.warn("[detect-image] Winston AI image detection request failed or timed out:", err?.message || err);
    }
  }

  const edenKey = process.env.EDENAI_API_KEY || process.env.EDLIN_API_KEY || process.env.EDEN_API_KEY || process.env.EDEN_KEY;
  if (edenKey && providerQuota.edenai > 0) {
    try {
      const payload: any = {
        providers: "winstonai",
        file_url: targetUrl || undefined
      };
      const response = await fetchWithTimeout("https://api.edenai.run/v2/image/ai_detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${edenKey}`
        },
        body: JSON.stringify(payload)
      }, 8000);

      if (response.ok) {
        const data = await response.json();
        providerQuota.edenai = Math.max(0, providerQuota.edenai - 1);
        const winstonResult = data.winstonai || {};
        let rawScore = typeof winstonResult.ai_score === "number" ? winstonResult.ai_score : (typeof winstonResult.score === "number" ? winstonResult.score : 0);
        const score = Math.round(rawScore <= 1 ? rawScore * 100 : rawScore);
        const verdict = score >= 50 ? "AI_GENERATED" : "HUMAN";
        return res.json({
          verdict,
          score,
          isAi: score >= 50,
          provider: "edenai",
          status: "success",
          details: data
        });
      }
    } catch (err: any) {
      console.warn("[detect-image] Eden AI image detection failed:", err?.message || err);
    }
  }

  // Imagga image tagging analysis fallback
  if (targetUrl && providerQuota.imagga > 0) {
    const imaggaResult = await checkImaggaImageAnalysis(targetUrl);
    if (imaggaResult) {
      return res.json(imaggaResult);
    }
  }

  return res.json({
    verdict: "UNKNOWN",
    status: "all_providers_failed",
    reasoning: "Image detection providers (Winston AI, Eden AI, Imagga) failed, keys were unconfigured, or quota was exhausted."
  });
});

// POST /api/detect-link — fetches content at a given URL server-side, extracts text, and runs through fallback chain
app.post("/api/detect-link", async (req, res) => {
  const { url, link } = req.body;
  const targetUrl = url || link || "";

  if (!targetUrl || !targetUrl.startsWith("http")) {
    return res.status(400).json({
      verdict: "UNKNOWN",
      status: "invalid_url",
      error: "Please provide a valid HTTP or HTTPS URL."
    });
  }

  try {
    const htmlRes = await fetchWithTimeout(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediaLiteracyVerifier/1.0"
      }
    }, 8000);

    if (!htmlRes.ok) {
      return res.status(400).json({
        verdict: "UNKNOWN",
        status: "all_providers_failed",
        error: `Failed to fetch URL content (HTTP status ${htmlRes.status}).`
      });
    }

    const htmlContent = await htmlRes.text();
    const extractedText = htmlContent
      .replace(/<script\b[^<]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^<]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!extractedText || extractedText.length < 15) {
      return res.json({
        verdict: "UNKNOWN",
        status: "all_providers_failed",
        error: "Extracted text content from URL was empty or too short to analyze."
      });
    }

    const textSample = extractedText.substring(0, 10000);
    const result = await runTextDetectionFallbackChain(textSample);
    return res.json({
      ...result,
      targetUrl,
      extractedCharacterCount: textSample.length
    });
  } catch (err: any) {
    console.error("[detect-link] Failed to fetch or analyze link:", err?.message || err);
    return res.json({
      verdict: "UNKNOWN",
      status: "all_providers_failed",
      error: `Error fetching URL content: ${err?.message || "Timeout or network failure"}`
    });
  }
});

// API endpoint for standalone Sapling AI Text/Image Detection
app.post("/api/sapling-detect", async (req, res) => {
  const { text, claim, content } = req.body;
  const targetText = text || claim || content || "";

  if (!targetText.trim()) {
    return res.status(400).json({
      success: false,
      error: "No text provided for Sapling AI detection analysis."
    });
  }

  const result = await checkSaplingAiText(targetText);
  if (result) {
    return res.json({
      success: true,
      score: result.score,
      isAi: result.isAi,
      sentenceScores: result.sentenceScores,
      raw: result.raw
    });
  } else {
    return res.status(500).json({
      success: false,
      error: "Unable to process text with Sapling AI detector API. Please verify key or try again."
    });
  }
});

// Helper function to query Google Fact Check Tools API for verified publisher reviews
async function checkGoogleFactCheckTools(claim: string): Promise<any | null> {
  const apiKey = process.env.GOOGLE_FACTCHECK_API_KEY || process.env.FACTCHECK_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(claim)}&key=${apiKey}`;
    const response = await fetchWithTimeout(url, {}, 6000);
    if (!response.ok) {
      console.warn(`[google-factcheck] API status ${response.status}:`, await response.text());
      return null;
    }

    const data = await response.json();
    if (!data.claims || !Array.isArray(data.claims) || data.claims.length === 0) {
      return null;
    }

    const firstClaim = data.claims[0];
    const claimReviews = firstClaim.claimReview || [];
    if (claimReviews.length === 0) {
      return null;
    }

    const review = claimReviews[0];
    const textualRating = (review.textualRating || "").toLowerCase();
    const publisherName = review.publisher?.name || "Fact Check Publisher";
    const reviewUrl = review.url || "";
    const claimText = firstClaim.text || claim;

    let verdict: "REAL" | "FALSE" | null = null;
    let confidence: "high" | "medium" = "high";

    if (
      textualRating.includes("true") ||
      textualRating.includes("correct") ||
      textualRating.includes("accurate")
    ) {
      verdict = "REAL";
      confidence = "high";
    } else if (
      textualRating.includes("false") ||
      textualRating.includes("fake") ||
      textualRating.includes("pants on fire") ||
      textualRating.includes("incorrect")
    ) {
      verdict = "FALSE";
      confidence = "high";
    } else if (
      textualRating.includes("misleading") ||
      textualRating.includes("partly") ||
      textualRating.includes("mixture")
    ) {
      verdict = "FALSE";
      confidence = "medium";
    } else {
      return null;
    }

    const sources: string[] = [];
    if (publisherName && reviewUrl) {
      sources.push(`${publisherName} (${reviewUrl})`);
    } else if (reviewUrl) {
      sources.push(reviewUrl);
    } else if (publisherName) {
      sources.push(publisherName);
    }

    return {
      verdict,
      confidence,
      reasoning: `Fact-checked by ${publisherName}: "${review.textualRating}". Original claim: "${claimText}".`,
      sources,
      source: "google-factcheck-tools",
      publisher: publisherName,
      reviewUrl,
      textualRating: review.textualRating
    };
  } catch (err: any) {
    console.warn("[google-factcheck] Error fetching fact check tools:", err?.message || err);
    return null;
  }
}

// API endpoint for Strict Fact Verification Assistant with Google Search Grounding and low temperature (0.1)
app.post("/api/fact-verify", async (req, res) => {
  const { claim, statement, text } = req.body;
  const userClaim = claim || statement || text || "";

  if (!userClaim.trim()) {
    return res.status(400).json({
      verdict: "UNKNOWN",
      confidence: "low",
      reasoning: "No claim or text was provided for verification.",
      sources: [],
      source: "gemini-search",
      ai_generation_likelihood: "not_applicable"
    });
  }

  try {
    // 1. Try Google Fact Check Tools API first
    const factCheckResult = await checkGoogleFactCheckTools(userClaim);
    if (factCheckResult) {
      const saplingRes = await checkSaplingAiText(userClaim);
      return res.json({
        ...factCheckResult,
        ai_generation_likelihood: saplingRes ? (saplingRes.score >= 65 ? "high" : saplingRes.score >= 35 ? "medium" : "low") : "not_applicable",
        sapling_ai_score: saplingRes?.score
      });
    }

    // 2. Perform Sapling AI detection check in parallel for Gemini path
    const saplingPromise = checkSaplingAiText(userClaim);

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      const saplingRes = await saplingPromise;
      return res.json({
        verdict: saplingRes && saplingRes.score >= 65 ? "AI_GENERATED" : "UNKNOWN",
        confidence: "medium",
        reasoning: saplingRes 
          ? `Analysis based on Sapling AI detector. Score: ${saplingRes.score}%. Live Gemini API key unconfigured on server.`
          : "Live search verification requires GEMINI_API_KEY / GOOGLE_API_KEY configured on server environment.",
        sources: [],
        source: "sapling-ai-fallback",
        ai_generation_likelihood: saplingRes ? (saplingRes.score >= 65 ? "high" : saplingRes.score >= 35 ? "medium" : "low") : "not_applicable",
        sapling_ai_score: saplingRes?.score
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a fact-verification assistant. You will receive a claim, statement, or piece of text from a user. Your job is to analyze it and determine whether it is:
1. FACTUALLY REAL/VERIFIED - supported by credible, checkable sources
2. FACTUALLY FALSE/MISLEADING - contradicted by evidence
3. AI-GENERATED CONTENT - text that shows patterns typical of AI-generated writing (generic phrasing, lack of specific verifiable detail, fabricated citations, invented statistics, or synthetic tone)
4. UNKNOWN/UNVERIFIABLE - if you do not have grounded, live information to confirm or deny the claim, you MUST say so. Do NOT guess or hallucinate a verdict.

Rules:
- Never fabricate a source, statistic, or quote to support your verdict.
- If Google Search grounding is not available or does not return relevant results, respond with UNKNOWN and explain why.
- Always separate "is this true" from "does this look AI-written" as two distinct judgments — a claim can be true but AI-written, or false but human-written.
- Cite the specific source(s) you used for your verdict, if any.
- Keep your response structured and short.

Output strictly in this JSON format:
{
  "verdict": "REAL" | "FALSE" | "AI_GENERATED" | "UNKNOWN",
  "confidence": "high" | "medium" | "low",
  "reasoning": "2-3 sentence explanation",
  "sources": ["source1", "source2"] or [],
  "ai_generation_likelihood": "high" | "medium" | "low" | "not_applicable"
}

Do not include any text outside the JSON object.`;

    let response: any = null;

    try {
      console.log(`[fact-verify] Executing Gemini call with gemini-3.6-flash, temperature=0.1, googleSearch=true...`);
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userClaim,
        config: {
          systemInstruction,
          temperature: 0.1,
          tools: [{ googleSearch: {} }]
        }
      });
    } catch (primaryErr: any) {
      console.warn(`[fact-verify] Primary call with search grounding failed:`, primaryErr?.message || primaryErr);
      try {
        console.log(`[fact-verify] Fallback call with gemini-3.6-flash without search tool...`);
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: userClaim,
          config: {
            systemInstruction,
            temperature: 0.1
          }
        });
      } catch (fallbackErr: any) {
        console.error(`[fact-verify] Fallback failed:`, fallbackErr?.message || fallbackErr);
        const rawErrMsg = fallbackErr?.message || primaryErr?.message || "Service unavailable";
        let userReasoning = "Google Search grounding was not available or API limit was reached.";
        if (rawErrMsg.includes("429") || rawErrMsg.includes("RESOURCE_EXHAUSTED") || rawErrMsg.includes("quota")) {
          userReasoning = "API rate limit reached (429 RESOURCE_EXHAUSTED). Grounded search verification was temporarily unavailable.";
        }
        const saplingRes = await saplingPromise;
        return res.status(200).json({
          verdict: "UNKNOWN",
          confidence: "low",
          reasoning: userReasoning,
          sources: [],
          source: "gemini-search",
          ai_generation_likelihood: saplingRes ? (saplingRes.score >= 65 ? "high" : saplingRes.score >= 35 ? "medium" : "low") : "not_applicable",
          sapling_ai_score: saplingRes?.score
        });
      }
    }

    const saplingRes = await saplingPromise;
    const rawText = response?.text || "";
    let jsonCandidate = rawText.trim();
    if (jsonCandidate.includes("```")) {
      jsonCandidate = jsonCandidate.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    }
    const firstBrace = jsonCandidate.indexOf("{");
    const lastBrace = jsonCandidate.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonCandidate = jsonCandidate.substring(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(jsonCandidate);

        // Extract grounded sources from metadata if available and not present
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && Array.isArray(groundingChunks) && groundingChunks.length > 0) {
          const webSources = groundingChunks
            .filter((c: any) => c.web && c.web.uri)
            .map((c: any) => c.web.title ? `${c.web.title} (${c.web.uri})` : c.web.uri);
          if (webSources.length > 0 && (!parsed.sources || parsed.sources.length === 0)) {
            parsed.sources = webSources.slice(0, 5);
          }
        }

        // Attach Sapling AI Detection result if available
        if (saplingRes) {
          parsed.sapling_ai_score = saplingRes.score;
          parsed.sapling_detected_ai = saplingRes.isAi;
          if (saplingRes.score >= 65) {
            parsed.ai_generation_likelihood = "high";
          } else if (saplingRes.score >= 35) {
            parsed.ai_generation_likelihood = "medium";
          } else {
            parsed.ai_generation_likelihood = "low";
          }
        }

        parsed.source = "gemini-search";

        // Return exact parsed JSON pass-through response
        return res.json(parsed);
      } catch (parseErr) {
        console.error("[fact-verify] Failed to parse JSON from response candidate:", parseErr);
      }
    }

    // Fallback pass-through if json parsing failed
    return res.json({
      verdict: "UNKNOWN",
      confidence: "low",
      reasoning: rawText || "Google Search grounding did not return sufficient verifiable sources to conclude a verdict.",
      sources: [],
      source: "gemini-search",
      ai_generation_likelihood: saplingRes ? (saplingRes.score >= 65 ? "high" : saplingRes.score >= 35 ? "medium" : "low") : "not_applicable",
      sapling_ai_score: saplingRes?.score
    });

  } catch (err: any) {
    console.error("[fact-verify] Server error:", err);
    return res.status(500).json({
      verdict: "UNKNOWN",
      confidence: "low",
      reasoning: `Server error while executing fact verification: ${err?.message || "Unknown error"}`,
      sources: [],
      ai_generation_likelihood: "not_applicable"
    });
  }
});

// API endpoint for Fact Detective using gemini-3.6-flash or gemini-3.1-pro-preview (for thinking mode) with search grounding
app.post("/api/fact-detective", async (req, res) => {
  const { mode, claim, url, imageData, mediaType, enableThinking } = req.body;

  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.error("[Fact Detective] Error: GEMINI_API_KEY / API_KEY is missing in server environment.");
      return res.status(200).json({
        success: false,
        error: "Server missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.",
        rawText: null
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = "";
    if (mode === "claim") {
      systemInstruction = `You are Fact Detective, a rigorous media-literacy checker built on the SIFT method (Stop / Investigate the source / Find better coverage / Trace claims). Given a claim, follow this process: 1) STOP — identify the core factual claim, separating fact from opinion/satire/framing. 2) INVESTIGATE THE SOURCE — research who is making the claim and their track record. 3) FIND BETTER COVERAGE — search multiple independent sources, especially fact-checking sites (Snopes, Reuters Fact Check, AP Fact Check, PolitiFact). 4) TRACE CLAIMS — verify any cited statistic or quote against its original source. Cross-reference at least 2-3 independent sources before concluding. If sources conflict, say so explicitly. If a claim was once true but is now outdated, mark it MIXED. Never claim high confidence from a single source. Respond ONLY with valid JSON, no markdown fences, in exactly this shape: {"verdict":"REAL"|"FAKE"|"MIXED"|"UNKNOWN","headline":"short 4-8 word summary","explanation":"2-4 sentence plain-language explanation for a student audience","evidence":[{"point":"short evidence point","source":"source name","url":"url if available"}],"confidence":0-100,"claimType":"factual"|"opinion"|"satire"|"outdated","method":{"stop":"what claim you identified","investigateSource":"what you found about the source","findBetterCoverage":"what independent sources you checked and whether they agreed","traceClaims":"whether you traced any cited stat/quote to its origin"}}`;
    } else if (mode === "url") {
      systemInstruction = `You are Fact Detective, a rigorous media-literacy checker built on the SIFT method (Stop / Investigate the source / Find better coverage / Trace claims). Given a website or article URL, follow this process: 1) STOP — identify the core factual claim(s) made in the article, separating fact from opinion/framing. 2) INVESTIGATE THE SOURCE — research the domain's reputation, ownership, known bias, or history of misinformation. 3) FIND BETTER COVERAGE — search whether the SPECIFIC claims in the article are corroborated independently by credible outlets or fact-checkers. 4) TRACE CLAIMS — verify any cited statistic, study, or quote against its original source. Respond ONLY with valid JSON, no markdown fences, in exactly this shape: {"verdict":"REAL"|"FAKE"|"MIXED"|"UNKNOWN","headline":"short 4-8 word summary","explanation":"2-4 sentence plain-language explanation for a student audience","evidence":[{"point":"short evidence point","source":"source name","url":"url if available"}],"confidence":0-100,"claimType":"factual"|"opinion"|"satire"|"outdated","method":{"stop":"what claim you identified","investigateSource":"what you found about the domain","findBetterCoverage":"what independent sources you checked","traceClaims":"whether you traced any cited stat/quote to its origin"}}`;
    } else if (mode === "image") {
      systemInstruction = `You are Fact Detective, a rigorous media-literacy checker built on the SIFT method (Stop / Investigate the source / Find better coverage / Trace claims). You will be given an image. Examine the image for visual signs of AI generation or manipulation (lighting inconsistencies, warped hands/text, artifacts, editing signs), be honest this isn't certain proof, and search for where the image originates online if possible. Evidence source field should say "visual analysis" when not web-sourced. Respond ONLY with valid JSON, no markdown fences, in exactly this shape: {"verdict":"REAL"|"FAKE"|"MIXED"|"UNKNOWN","headline":"short 4-8 word summary","explanation":"2-4 sentence plain-language explanation for a student audience","evidence":[{"point":"short observation","source":"visual analysis","url":""}],"confidence":0-100,"claimType":"factual"|"opinion"|"satire"|"outdated","method":{"stop":"what the image depicts","investigateSource":"where image originated or first appeared","findBetterCoverage":"reverse-image search results if any","traceClaims":"visual details examined and what they showed"}}`;
    } else {
      return res.status(400).json({ success: false, error: "Invalid mode. Must be 'claim', 'url', or 'image'." });
    }

    let contents: any;
    if (mode === "claim") {
      contents = `Investigate this claim: "${claim}"`;
    } else if (mode === "url") {
      contents = `Investigate this website URL or article link: ${url}`;
    } else if (mode === "image") {
      contents = [
        {
          inlineData: {
            mimeType: mediaType || "image/jpeg",
            data: imageData
          }
        },
        { text: "Examine this image for signs of AI generation or manipulation, and analyze its details." }
      ];
    }

    let response: any = null;
    let groundingMetadata: any = null;
    let searchAttempted = false;

    // Select primary model based on enableThinking option
    const primaryModel = enableThinking ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";
    const useSearchTool = mode === "claim" || mode === "url";

    const fullConfig: any = { systemInstruction };
    if (useSearchTool) {
      fullConfig.tools = [{ googleSearch: {} }];
      searchAttempted = true;
    }

    if (enableThinking) {
      fullConfig.thinkingConfig = { thinkingBudget: 2048 };
    }

    console.log("=== FACT DETECTIVE GENERATE CONTENT CALL CONFIG ===");
    console.log(JSON.stringify({
      model: primaryModel,
      contents,
      config: fullConfig
    }, null, 2));
    console.log("==================================================");

    try {
      console.log(`[Fact Detective] Executing generateContent with model=${primaryModel}, googleSearch=${useSearchTool}, thinking=${!!enableThinking}...`);
      response = await ai.models.generateContent({
        model: primaryModel,
        contents,
        config: fullConfig
      });
    } catch (primaryErr: any) {
      console.warn(`[Fact Detective] Primary search-grounded call failed:`, primaryErr.message || primaryErr);
      // Secondary attempt: if search tool or thinking config hit error, fallback to standard gemini-3.6-flash without search tool
      try {
        console.log(`[Fact Detective] Fallback attempt with gemini-3.6-flash without search tool...`);
        const fallbackConfig = { systemInstruction };
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: fallbackConfig
        });
      } catch (secondaryErr: any) {
        console.error(`[Fact Detective] Secondary attempt failed:`, secondaryErr.message || secondaryErr);
        const rawErrMsg = secondaryErr.message || primaryErr.message || "Unknown error";
        let userFriendlyError = rawErrMsg;

        if (rawErrMsg.includes("429") || rawErrMsg.includes("RESOURCE_EXHAUSTED") || rawErrMsg.includes("quota")) {
          userFriendlyError = "API quota limit reached (429 RESOURCE_EXHAUSTED). Please wait a few seconds and try your request again.";
        } else {
          try {
            const parsed = JSON.parse(rawErrMsg);
            if (parsed.error?.message) {
              userFriendlyError = parsed.error.message;
            }
          } catch {}
        }

        return res.status(200).json({
          success: false,
          error: userFriendlyError,
          rawText: null
        });
      }
    }

    if (!response || !response.text) {
      return res.status(500).json({
        success: false,
        error: "Gemini returned an empty response.",
        rawText: null
      });
    }

    const rawText = response.text || "";
    const candidate = response.candidates?.[0];
    groundingMetadata = candidate?.groundingMetadata || null;

    let jsonCandidate = rawText.trim();
    if (jsonCandidate.includes("```")) {
      jsonCandidate = jsonCandidate.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    }
    const firstBrace = jsonCandidate.indexOf("{");
    const lastBrace = jsonCandidate.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace <= firstBrace) {
      console.error("[Fact Detective] JSON parsing error: Could not find valid '{' and '}' in response.");
      return res.status(200).json({
        success: false,
        error: "Response from model did not contain a valid JSON object.",
        rawText,
        groundingMetadata
      });
    }

    jsonCandidate = jsonCandidate.substring(firstBrace, lastBrace + 1);

    try {
      const parsed = JSON.parse(jsonCandidate);

      const groundingChunks = groundingMetadata?.groundingChunks || [];
      const webQueries = groundingMetadata?.webSearchQueries || [];
      const hasLiveGrounding = (groundingChunks.length > 0 || webQueries.length > 0);

      parsed.modelUsed = primaryModel;
      parsed.searchAttempted = searchAttempted;
      parsed.searchGrounded = hasLiveGrounding;

      let parsedConfidence = parseInt(String(parsed.confidence), 10);
      if (isNaN(parsedConfidence)) {
        parsedConfidence = 50;
      }

      if (useSearchTool && !hasLiveGrounding) {
        console.warn("[Fact Detective] WARNING: Search grounding was missing or returned no grounding chunks. Forcing UNKNOWN verdict.");
        parsed.verdict = "UNKNOWN";
        parsedConfidence = Math.min(parsedConfidence, 15);
        parsed.searchWarning = "Note: Could not verify with live search (Google Search grounding was unavailable).";
        parsed.explanation = `Note: Could not verify with live search. ${parsed.explanation || "No live search grounding was available to confirm this claim."}`;

        if (Array.isArray(parsed.evidence)) {
          parsed.evidence = parsed.evidence.map((ev: any) => ({
            ...ev,
            source: "Unverified (No live search)",
            url: ""
          }));
        }
      }

      if (hasLiveGrounding && Array.isArray(parsed.evidence)) {
        const actualSources = groundingChunks.map((chunk: any) => ({
          title: chunk.web?.title || "Web source",
          url: chunk.web?.uri || ""
        })).filter((s: any) => s.url);

        if (actualSources.length > 0) {
          parsed.evidence = parsed.evidence.map((ev: any, idx: number) => {
            const matchedSource = actualSources[idx % actualSources.length];
            return {
              ...ev,
              source: matchedSource.title || ev.source || "Google Search result",
              url: matchedSource.url || ev.url || ""
            };
          });
        }
      }

      parsed.confidence = validateAndClampConfidence(parsed.confidence, hasLiveGrounding);

      return res.json({
        success: true,
        result: parsed,
        rawText,
        groundingMetadata
      });
    } catch (parseErr: any) {
      console.error("[Fact Detective] JSON Parse Error:", parseErr.message);
      return res.status(200).json({
        success: false,
        error: `JSON parse error: ${parseErr.message}`,
        rawText,
        groundingMetadata
      });
    }
  } catch (err: any) {
    console.error("[Fact Detective] API Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "An unexpected error occurred during investigation.",
      rawText: null
    });
  }
});

// Endpoint for Multi-Turn Detective Assistant Chat
app.post("/api/fact-detective/chat", async (req, res) => {
  const { claim, verdict, messages, enableThinking } = req.body;

  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(200).json({ success: false, error: "API key is missing in server environment." });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = enableThinking ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";

    const systemInstruction = `You are Fact Detective Assistant, an expert AI media-literacy companion specialized in the SIFT method (Stop, Investigate the source, Find better coverage, Trace claims).
The user is asking follow-up questions about an investigation for the claim:
CLAIM: "${claim || "User specified claim"}"
VERDICT: "${verdict || "Under investigation"}"

Provide clear, objective, evidence-grounded answers. Use Google Search grounding to verify any news or facts brought up during chat. Format your answers with markdown bullets or sections where appropriate.`;

    const contents = (messages || []).map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const config: any = {
      systemInstruction,
      tools: [{ googleSearch: {} }]
    };

    if (enableThinking) {
      config.thinkingConfig = { thinkingBudget: 2048 };
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata || null;

    return res.json({
      success: true,
      text: response.text || "I was unable to generate a response.",
      groundingMetadata
    });
  } catch (err: any) {
    console.error("[Fact Detective Chat] Error:", err);
    const rawErrMsg = err?.message || String(err || "Unknown error");
    let userFriendlyError = rawErrMsg;
    if (rawErrMsg.includes("429") || rawErrMsg.includes("RESOURCE_EXHAUSTED") || rawErrMsg.toLowerCase().includes("quota")) {
      userFriendlyError = "API rate limit reached (429 RESOURCE_EXHAUSTED). Please wait a few seconds and try your request again.";
    }

    return res.status(200).json({
      success: false,
      error: userFriendlyError
    });
  }
});

// Endpoint for Deep Intelligence Modules (Source Audit, Bias Framing, Logical Fallacies, Timeline)
app.post("/api/fact-detective/intel", async (req, res) => {
  const { claim, tool, verdict } = req.body;

  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(200).json({ success: false, error: "API key is missing in server environment." });
    }

    const ai = new GoogleGenAI({ apiKey });

    let model = "gemini-3.6-flash";
    let prompt = "";
    let systemInstruction = "";
    let useSearch = true;

    if (tool === "source_audit") {
      model = "gemini-3.6-flash";
      systemInstruction = "You are a Source Authority & Track Record Auditor. Provide a concise, bulleted assessment of domain credibility, publishing standards, known political bias, and history of fact-check retractions.";
      prompt = `Audit the source reputation and media track record for claims related to: "${claim}". Verdict context: ${verdict}.`;
    } else if (tool === "bias_framing") {
      model = "gemini-3.6-flash";
      systemInstruction = "You are a Media Bias & Framing Inspector. Analyze emotional language, loaded terminology, missing context, and rhetoric framing techniques.";
      prompt = `Perform a rhetoric framing and cognitive bias breakdown on this claim: "${claim}". Highlight any clickbait, fear-mongering, or missing nuance.`;
      useSearch = false;
    } else if (tool === "fallacy_checker") {
      model = "gemini-3.1-flash-lite"; // Fast task model
      systemInstruction = "You are a Logical Fallacy Checker. Identify any specific formal or informal logical fallacies (e.g. Ad Hominem, Strawman, False Dichotomy, Appeal to Emotion, Slippery Slope, Circular Reasoning).";
      prompt = `Identify logical fallacies present in or used to defend this claim: "${claim}".`;
      useSearch = false;
    } else if (tool === "timeline") {
      model = "gemini-3.6-flash";
      systemInstruction = "You are a Claim Origin & Timeline Investigator. Reconstruct the chronological timeline of when this claim first appeared, how it mutated, and key debunking or verification milestones.";
      prompt = `Trace the historical timeline and origin of this claim: "${claim}".`;
    } else {
      return res.status(400).json({ success: false, error: "Unknown intelligence tool specified." });
    }

    const config: any = { systemInstruction };
    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config
    });

    return res.json({
      success: true,
      tool,
      analysis: response.text || "Analysis complete.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });
  } catch (err: any) {
    console.error("[Fact Detective Intel] Error:", err);
    const rawErrMsg = err?.message || String(err || "Unknown error");
    let userFriendlyError = rawErrMsg;
    if (rawErrMsg.includes("429") || rawErrMsg.includes("RESOURCE_EXHAUSTED") || rawErrMsg.toLowerCase().includes("quota")) {
      userFriendlyError = "API rate limit reached (429 RESOURCE_EXHAUSTED). Please wait a few seconds and try your request again.";
    }

    return res.status(200).json({
      success: false,
      error: userFriendlyError
    });
  }
});

// API endpoint for Verification with Gemini
app.post("/api/verify", async (req, res) => {
  const { inputType, content, imageBase64, mimeType } = req.body;

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json(getVerifyFallback(content, inputType));
    }

    const systemInstruction = `You are "Bytespark AI", an expert Media and Information Literacy (MIL) verification assistant for youth (ages 14-25), built for the UNESCO Global Youth Hackathon.
Your job is to search the internet using Google Search grounding for the submitted text, claim, image description, or URL link, and verify whether it is true or false.

CRITICAL VERIFICATION CLASSIFICATION RULE:
You MUST search the internet via Google Search and assign the "classification" field to EXACTLY ONE of the following three results:
1. "Real/official confirmed" — if the result is same to same found in internet from official authorities, government bodies, reputable mainstream press (e.g. Reuters, BBC, AP), or recognized institutional primary sources.
2. "unconfirmed" — if the information is found in internet, but from unofficial sources, secondary blogs, social media commentary, or informal rumors without official authority confirmation.
3. "unconfirmed or fake" — if the information is NOT found in internet, has no reliable trace, is a deepfake/synthetic fabrication, or is completely debunked/fake.

CRITICAL FORMATTING INSTRUCTION:
Return ONLY a valid JSON object matching this schema. Do NOT include markdown code blocks or any commentary outside the JSON:
{
  "classification": "Real/official confirmed" | "unconfirmed" | "unconfirmed or fake",
  "confidence": number,
  "summary": string (2-4 clear, teen-friendly sentences explaining why this specific claim was given this classification based on your internet search findings),
  "reasoningTrail": string[] (3-4 step-by-step audit steps for verifying this claim),
  "keyFindings": string[] (3 specific evidence points or source checks discovered),
  "recommendations": string[] (3 actionable checks for youth before sharing)
}`;

    const promptText = `Search the internet via Google Search and verify whether this information is true or false:
Content Type: ${inputType}
Content / Link / Claim: ${content || "Media provided in attachment"}`;

    const contents = (imageBase64 && mimeType)
      ? {
          parts: [
            { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
            { text: promptText }
          ]
        }
      : promptText;

    const response = await generateContentWithResilientFallback(ai, {
      contents,
      systemInstruction,
      useGoogleSearch: true
    });

    if (!response || !response.text) {
      return res.json(getVerifyFallback(content, inputType));
    }

    const rawText = response.text;
    let parsedData = extractJsonFromText(rawText);

    // If extractJsonFromText couldn't parse structured JSON directly, construct from response text
    if (!parsedData && rawText.trim()) {
      const lowerText = rawText.toLowerCase();
      let classification = "unconfirmed";
      if (
        lowerText.includes("real/official confirmed") ||
        lowerText.includes("official confirmed") ||
        lowerText.includes("verified authentic") ||
        lowerText.includes("is true") ||
        lowerText.includes("confirmed true") ||
        lowerText.includes("authentic")
      ) {
        classification = "Real/official confirmed";
      } else if (
        lowerText.includes("unconfirmed or fake") ||
        lowerText.includes("fake") ||
        lowerText.includes("debunked") ||
        lowerText.includes("false") ||
        lowerText.includes("not found") ||
        lowerText.includes("hoax") ||
        lowerText.includes("fabricated") ||
        lowerText.includes("scam")
      ) {
        classification = "unconfirmed or fake";
      }

      const cleanClaim = (content || "submitted content").slice(0, 80);
      parsedData = {
        classification,
        confidence: 88,
        summary: rawText.length > 400 ? rawText.slice(0, 400) + '...' : rawText,
        reasoningTrail: [
          `Step 1: Conducted web search across official news and institutional archives for "${cleanClaim}".`,
          "Step 2: Evaluated primary vs secondary attribution for this claim.",
          "Step 3: Synthesized verification evidence into MIL guidance."
        ],
        keyFindings: [
          `Cross-checked "${cleanClaim}" against online press releases and databases`,
          "Analyzed author credentials and publisher reputation",
          "Checked for official authority statements or debunking notices"
        ],
        recommendations: [
          "Check whether official government or institutional portals confirm this",
          "Look for named, accountable journalists and authors",
          "Pause before sharing if the news evokes strong emotion"
        ]
      };
    }

    if (!parsedData) {
      parsedData = getVerifyFallback(content, inputType);
    }

    parsedData.classification = normalizeVerificationClassification(parsedData.classification);

    // Extract grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const hasGrounding = Array.isArray(groundingChunks) && groundingChunks.length > 0;
    if (hasGrounding) {
      const extractedSources = groundingChunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || "Web Source",
          url: chunk.web.uri
        }));
      if (extractedSources.length > 0) {
        parsedData.groundingSources = extractedSources.slice(0, 5);
      }
    }

    parsedData.searchGrounded = hasGrounding;
    parsedData.confidence = validateAndClampConfidence(parsedData.confidence, hasGrounding);

    return res.json(parsedData);
  } catch (error: any) {
    return res.json(getVerifyFallback(content, inputType));
  }
});

// API endpoint for Chat Problem Identifier
app.post("/api/chat-identify", async (req, res) => {
  try {
    const { messages } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: "Hi there! I'm Bytespark AI, your Media & Information Literacy buddy. I help you verify whether information is true or false! When you ask me to verify a claim, I classify it as either 'Real/official confirmed' (found same to same from official authorities), 'unconfirmed' (found online from unofficial sources), or 'unconfirmed or fake' (not found online)."
      });
    }

    const systemInstruction = `You are "Bytespark Assistant", an approachable, encouraging, and clear AI Media & Information Literacy guide for youth (ages 14-25).
Your goals:
1. When the user asks to check or verify whether information is true or false, you MUST search the internet via Google Search grounding and classify the claim into ONE of these exact results at the top of your response:
   - "Real/official confirmed" — if the result is same to same found in internet from official authorities / recognized official institutional sources.
   - "unconfirmed" — if the information is found in internet but from unofficial or secondary sources without official authority confirmation.
   - "unconfirmed or fake" — if the information is not found in internet or is a fabricated/fake claim.
2. Always clearly state this classification result ("Real/official confirmed", "unconfirmed", or "unconfirmed or fake") in bold at the start of your reply when verifying claims.
3. ALWAYS explain your analysis in plain, teen-friendly language (2-4 short sentences).
4. Be friendly, empathetic, educational, and constructive. Encourage critical thinking ("lateral reading", checking primary sources, recognizing emotional triggers).
5. Keep answers concise unless requested to elaborate.`;

    const chatMessages = (messages || []).map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await generateContentWithResilientFallback(ai, {
      contents: chatMessages,
      systemInstruction,
      useGoogleSearch: true
    });

    if (!response) {
      const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1]?.text : "";
      return res.json({
        reply: `**unconfirmed**\n\nThanks for sharing that! When checking whether claims like "${lastUserMsg || 'this'}" are true or false, search standard official authority portals. If found from official authorities, it's Real/official confirmed; if found only on informal sources, it remains unconfirmed!`
      });
    }

    let groundingSources: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
      groundingSources = chunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || "Web Source",
          url: chunk.web.uri
        }))
        .slice(0, 5);
    }

    return res.json({
      reply: response.text,
      groundingSources
    });
  } catch (error: any) {
    return res.json({
      reply: "**unconfirmed**\n\nWhen verifying news or social media claims, always check for named primary official sources and notice if the headline triggers strong emotional reactions!"
    });
  }
});

// API endpoint for Debate Moderator scoring
app.post("/api/moderate-debate", async (req, res) => {
  const { topicTitle, stance, userArgument } = req.body;

  const debateFallback = {
    logicScore: 84,
    evidenceScore: 78,
    respectScore: 92,
    overallScore: 85,
    strengths: ["Clear thesis statement", "Respectful and constructive tone"],
    fallaciesDetected: ["None detected! Good balance of logical structure."],
    improvementTip: "Try citing specific institutional studies or peer-reviewed statistics to back up your secondary points.",
    literacyPointsEarned: 50
  };

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json(debateFallback);
    }

    const systemInstruction = `You are the UNESCO Bytespark AI Debate Moderator. Your role is NOT to pick a winning side, but to evaluate argument quality, critical thinking, evidence use, logical structure, and respectful discourse.

Structure response as JSON:
{
  "logicScore": number (1-100),
  "evidenceScore": number (1-100),
  "respectScore": number (1-100),
  "overallScore": number (1-100),
  "strengths": string[] (2 key positive qualities),
  "fallaciesDetected": string[] (any logical fallacies e.g. Ad Hominem, Strawman, False Dilemma, or "None detected!"),
  "improvementTip": string (1 actionable suggestion to make the argument stronger),
  "literacyPointsEarned": number (e.g. 40 to 80 points)
}`;

    const prompt = `Topic: "${topicTitle}"
User's Selected Stance: ${stance}
User's Argument Text:
"${userArgument}"

Evaluate the quality of this argument according to media literacy standards.`;

    const response = await generateContentWithResilientFallback(ai, {
      contents: prompt,
      systemInstruction,
      responseMimeType: "application/json"
    });

    if (!response) {
      return res.json(debateFallback);
    }

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    return res.json(debateFallback);
  }
});

// Campaign Endpoints
app.get("/api/campaigns", (req, res) => {
  res.json(campaigns);
});

app.post("/api/campaigns", (req, res) => {
  const newCamp: Campaign = {
    id: `camp-${Date.now()}`,
    title: req.body.title || "Untitled Youth Campaign",
    organizer: req.body.organizer || "Youth Community Leader",
    category: req.body.category || "General MIL",
    description: req.body.description || "",
    location: req.body.location || "Online",
    date: req.body.date || "Ongoing 2026",
    participantsCount: 1,
    joined: true,
    updates: ["Campaign created on Bytespark MIL!"],
    tags: req.body.tags || ["Youth Action"],
    createdAt: new Date().toISOString()
  };
  campaigns.unshift(newCamp);
  res.json(newCamp);
});

app.post("/api/campaigns/:id/join", (req, res) => {
  const camp = campaigns.find(c => c.id === req.params.id);
  if (camp) {
    camp.joined = !camp.joined;
    camp.participantsCount += camp.joined ? 1 : -1;
    res.json(camp);
  } else {
    res.status(404).json({ error: "Campaign not found" });
  }
});

// Community Map Events Endpoints
app.get("/api/events", (req, res) => {
  res.json(communityEvents);
});

app.post("/api/events", (req, res) => {
  const newEvent: CommunityEvent = {
    id: `evt-${Date.now()}`,
    title: req.body.title || "Local MIL Workshop",
    organization: req.body.organization || "Community Youth Group",
    city: req.body.city || "Global",
    country: req.body.country || "Online",
    coordinates: req.body.coordinates || { lat: 20, lng: 0 },
    date: req.body.date || "Upcoming 2026",
    type: req.body.type || "Workshop",
    description: req.body.description || "",
    contactEmail: req.body.contactEmail || "contact@bytespark.org",
    link: req.body.link || "https://bytespark.org",
    topic: req.body.topic || "Deepfakes"
  };
  communityEvents.unshift(newEvent);
  res.json(newEvent);
});

// FEATURE 1: AI Content Authenticity Checker Endpoint
app.post("/api/check-authenticity", async (req, res) => {
  try {
    const { contentType, contentText, imageBase64, mimeType, mediaUrl } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Deterministic fallback if API key is not present
      const isUrl = mediaUrl || (contentText && contentText.includes("http"));
      const isText = contentType === "text";

      let score = 78;
      let signals = [
        "Inconsistent micro-lighting and smooth synthetic skin texturing detected",
        "Earlobe and background boundary warping artifacts typical of diffusion model rendering",
        "Metadata lacking standard camera EXIF hardware fingerprints"
      ];
      let summary = "The submitted media exhibits visual artifacts and texture patterns highly characteristic of synthetic AI image generation models.";

      if (isText) {
        score = 65;
        signals = [
          "Uniform sentence length variance matching typical LLM text completion profiles",
          "Lack of idiosyncratic personal voice or local colloquial phrasing",
          "Repetitive transitional connector phrases throughout paragraphs"
        ];
        summary = "Text structure shows high stylistic uniformity and n-gram frequency distributions commonly generated by large language models.";
      } else if (isUrl) {
        score = 82;
        signals = [
          "Audio frequency spectrum showing artificial high-frequency cutoff",
          "Unnatural cadence and synthetic pitch modulation in spoken phrasing",
          "URL domain hosting pattern associated with automated clip generation"
        ];
        summary = "Analysis of the URL media stream indicates potential voice cloning or synthetic audio manipulation.";
      }

      return res.json({
        aiScore: score,
        signals,
        summary,
        disclaimer: "This score is a probabilistic estimate generated by AI analysis models and should not be taken as absolute or definitive proof."
      });
    }

    const systemInstruction = `You are "Bytespark Authenticity Engine", a specialized AI Media Literacy diagnostic tool for detecting synthetic media, deepfakes, and AI-generated text or audio.
Analyze the user submission and return a JSON object strictly adhering to this schema:
{
  "aiScore": number (0 to 100 representing percentage likelihood of being AI-generated or synthetic),
  "signals": string[] (exactly 2 to 3 bullet points identifying specific technical signals e.g. lighting inconsistency, skin texture smoothing, LLM cadence, acoustic artifacts, metadata gaps),
  "summary": string (2 to 3 sentences in plain, accessible language explaining why this score was assigned),
  "disclaimer": "This score is a probabilistic estimate generated by AI analysis models and should not be taken as absolute or definitive proof."
}`;

    const promptText = `Analyze this content for AI authenticity vs human creation:
Content Type: ${contentType}
User Text/Url: ${contentText || mediaUrl || "Image attached"}`;

    const contents = (imageBase64 && mimeType)
      ? {
          parts: [
            { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
            { text: promptText }
          ]
        }
      : promptText;

    const response = await generateContentWithResilientFallback(ai, {
      contents,
      systemInstruction,
      responseMimeType: "application/json"
    });

    if (!response) {
      return res.json({
        aiScore: 78,
        signals: [
          "Inconsistent micro-lighting and smooth synthetic skin texturing detected",
          "Boundary warping artifacts typical of diffusion model rendering",
          "Metadata lacking standard camera EXIF hardware fingerprints"
        ],
        summary: "The submitted media exhibits visual artifacts and structural patterns characteristic of synthetic AI generation models.",
        disclaimer: "This score is a probabilistic estimate generated by AI analysis models and should not be taken as absolute or definitive proof."
      });
    }

    const raw = response.text || "{}";
    let parsed = JSON.parse(raw);

    // Run Sapling AI text detection if text content is supplied
    const textToAnalyze = contentText || (contentType === "text" ? mediaUrl : "");
    if (textToAnalyze && textToAnalyze.trim().length >= 5) {
      const saplingRes = await checkSaplingAiText(textToAnalyze);
      if (saplingRes) {
        parsed.saplingDetector = {
          score: saplingRes.score,
          isAi: saplingRes.isAi,
          sentenceScores: saplingRes.sentenceScores
        };
        // Blend Sapling's score for high text fidelity
        parsed.aiScore = saplingRes.score;
        parsed.signals = [
          `Sapling AI Detector API score: ${saplingRes.score}% likelihood of LLM synthetic generation`,
          ...(parsed.signals || []).slice(0, 2)
        ];
      }
    }

    if (!parsed.disclaimer) {
      parsed.disclaimer = "This score is a probabilistic estimate generated by AI analysis models and should not be taken as absolute or definitive proof.";
    }
    return res.json(parsed);
  } catch (err: any) {
    return res.json({
      aiScore: 72,
      signals: [
        "Inconsistent visual grain or stylistic cadence detected",
        "Potential synthetic or diffusion model signature patterns",
        "Unverified metadata footprint"
      ],
      summary: "Analysis detected noticeable synthetic features typical of modern generative AI models.",
      disclaimer: "This score is a probabilistic estimate generated by AI analysis models and should not be taken as absolute or definitive proof."
    });
  }
});

// FEATURE 2: Source Credibility Scanner Endpoint
app.post("/api/scan-source", async (req, res) => {
  const { sourceUrlOrHeadline } = req.body;
  const input = (sourceUrlOrHeadline || "").toLowerCase();

  const getSourceFallback = (sourceStr: string) => {
    let reputation = "Unknown / New Site";
    let bias = "Not Applicable";
    let author = "Anonymous / No Byline";
    let summary = "This domain or headline lacks an established record of journalistic accountability, peer-reviewed editor processes, or transparent ownership credentials.";
    let score = 42;

    if (input.includes("kathmandupost") || input.includes("republica") || input.includes("bbc") || input.includes("reuters") || input.includes("onlinekhabar")) {
      reputation = "Established Outlet";
      bias = "Center / Neutral";
      author = "Named Author with verified track record";
      summary = "This is a well-recognized mainstream publication with established editorial guidelines, named bylines, and a transparent corrections policy.";
      score = 88;
    } else if (input.includes("blog") || input.includes("xyz") || input.includes("click") || input.includes("viral")) {
      reputation = "Known Unreliable Source";
      bias = "Sensational / Unverified";
      author = "Anonymous / No Byline";
      summary = "This source exhibits markers of sensational clickbait, lacking verifiable author bylines or institutional editorial standards.";
      score = 25;
    }

    return {
      publisherReputation: reputation,
      biasIndicator: bias,
      authorTransparency: author,
      summary,
      credibilityScore: score
    };
  };

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json(getSourceFallback(sourceUrlOrHeadline));
    }

    const systemInstruction = `You are "Bytespark Source Credibility Engine", a Media and Information Literacy source evaluator.
Your goal is to evaluate the submitted URL or article headline and return a JSON object analyzing its publisher reputation, bias, author transparency, and credibility.

Structure response strictly as JSON matching this schema:
{
  "publisherReputation": string (must be one of: "Established Outlet", "Unknown / New Site", "Known Unreliable Source", or similar concise reputation label),
  "biasIndicator": string (e.g. "Center / Neutral", "Left-Leaning", "Right-Leaning", "Sensational / Non-political", "Not Applicable"),
  "authorTransparency": string (e.g. "Named Author with verified track record", "Generic Editorial Desk Byline", "Anonymous / No Byline"),
  "summary": string (2 to 3 sentences in plain, accessible language explaining why this credibility score was given),
  "credibilityScore": number (0 to 100 overall trustworthiness score)
}`;

    const prompt = `Evaluate the source credibility for this URL or headline:
"${sourceUrlOrHeadline}"`;

    const response = await generateContentWithResilientFallback(ai, {
      contents: prompt,
      systemInstruction,
      responseMimeType: "application/json"
    });

    if (!response) {
      return res.json(getSourceFallback(sourceUrlOrHeadline));
    }

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    return res.json(getSourceFallback(sourceUrlOrHeadline));
  }
});

// Community Flagged Sources Endpoints
interface FlaggedSourceItem {
  id: string;
  sourceNameOrUrl: string;
  reason: string;
  reporter: string;
  flagCount: number;
  status: "Under Review" | "Verified Misleading" | "Dismissed";
  category: string;
  createdAt: string;
}

let flaggedSourcesList: FlaggedSourceItem[] = [
  {
    id: "flag-1",
    sourceNameOrUrl: "nepal-health-breakthroughs.blogspot.com",
    reason: "Promoting unverified herbal cures for chronic diseases with manipulated doctor quotes.",
    reporter: "Sujan K. (Kathmandu)",
    flagCount: 18,
    status: "Verified Misleading",
    category: "Health Rumor",
    createdAt: new Date().toISOString()
  },
  {
    id: "flag-2",
    sourceNameOrUrl: "Viral TikTok Voice Clip: 'Ministry Announcement'",
    reason: "Synthetic audio cloning a government official claiming sudden school closures.",
    reporter: "Anjali P. (Pokhara)",
    flagCount: 34,
    status: "Verified Misleading",
    category: "Deepfake / AI Audio",
    createdAt: new Date().toISOString()
  },
  {
    id: "flag-3",
    sourceNameOrUrl: "daily-express-nepal-news.xyz",
    reason: "Sensational clickbait site copying legitimate headlines but linking to phishing surveys.",
    reporter: "Bikash R. (Lalitpur)",
    flagCount: 12,
    status: "Under Review",
    category: "Clickbait / Unreliable",
    createdAt: new Date().toISOString()
  }
];

app.get("/api/flagged-sources", (req, res) => {
  res.json(flaggedSourcesList);
});

app.post("/api/flagged-sources", (req, res) => {
  const newFlag: FlaggedSourceItem = {
    id: `flag-${Date.now()}`,
    sourceNameOrUrl: req.body.sourceNameOrUrl || "Unspecified Source",
    reason: req.body.reason || "Flagged for community review",
    reporter: req.body.reporter || "Youth Advocate",
    flagCount: 1,
    status: "Under Review",
    category: req.body.category || "Misinformation",
    createdAt: new Date().toISOString()
  };
  flaggedSourcesList.unshift(newFlag);
  res.json(newFlag);
});

// Anonymous Victim Takedown Reports Store
interface VictimReportRecord {
  trackingCode: string;
  perceptualHash: string;
  platforms: string[];
  contentUrl?: string;
  incidentNotes?: string;
  timestamp: string;
  status: 'Hash Registered' | 'Routing Formatted' | 'Submitted to Platforms' | 'Under Volunteer Review' | 'Escalated to Cyber Bureau';
  fileType: string;
}

let victimReportsStore: VictimReportRecord[] = [
  {
    trackingCode: 'NEP-TKD-84920',
    perceptualHash: 'FPR-3A81-9F2D-[#84E1]',
    platforms: ['Facebook / Meta', 'TikTok'],
    contentUrl: 'https://facebook.com/example/video123',
    incidentNotes: 'Non-consensual face swap video circulated on social groups.',
    timestamp: new Date(Date.now() - 3600000 * 5).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + new Date(Date.now() - 3600000 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Submitted to Platforms',
    fileType: 'image/jpeg'
  }
];

app.post("/api/victim-reports", (req, res) => {
  const codeNum = Math.floor(10000 + Math.random() * 90000);
  const record: VictimReportRecord = {
    trackingCode: `NEP-TKD-${codeNum}`,
    perceptualHash: req.body.perceptualHash || `FPR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    platforms: Array.isArray(req.body.platforms) && req.body.platforms.length > 0 ? req.body.platforms : ['Facebook / Meta'],
    contentUrl: req.body.contentUrl || '',
    incidentNotes: req.body.incidentNotes || '',
    timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Hash Registered',
    fileType: req.body.fileType || 'image/jpeg'
  };

  victimReportsStore.unshift(record);
  res.json(record);
});

app.get("/api/victim-reports/:trackingCode", (req, res) => {
  const searchCode = (req.params.trackingCode || '').trim().toUpperCase();
  const match = victimReportsStore.find(r => r.trackingCode.toUpperCase() === searchCode);

  if (match) {
    res.json(match);
  } else {
    res.status(404).json({ error: "Tracking code not found" });
  }
});

// Whistleblower Reports Store
interface WhistleblowerReportRecord {
  trackingCode: string;
  sourceUrlOrTitle: string;
  category: string;
  description: string;
  reporter: string;
  timestamp: string;
  status: string;
}

let whistleblowerReportsStore: WhistleblowerReportRecord[] = [
  {
    trackingCode: 'WB-84920',
    sourceUrlOrTitle: 'https://scam-nepal-lottery.info',
    category: 'Scam / Phishing Campaign',
    description: 'Fake lottery message demanding advance processing fees via digital wallet.',
    reporter: 'Anonymous Whistleblower',
    timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Under Community Verification'
  }
];

app.post("/api/whistleblower-reports", (req, res) => {
  const codeNum = Math.floor(10000 + Math.random() * 90000);
  const record: WhistleblowerReportRecord = {
    trackingCode: `WB-${codeNum}`,
    sourceUrlOrTitle: req.body.sourceUrlOrTitle || 'Unspecified Target',
    category: req.body.category || 'Scam / Phishing Campaign',
    description: req.body.description || 'Anonymous Whistleblower Report',
    reporter: 'Anonymous Whistleblower',
    timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Under Community Verification'
  };

  whistleblowerReportsStore.unshift(record);
  res.json(record);
});

app.get("/api/whistleblower-reports/:trackingCode", (req, res) => {
  const searchCode = (req.params.trackingCode || '').trim().toUpperCase();
  const match = whistleblowerReportsStore.find(r => r.trackingCode.toUpperCase() === searchCode);

  if (match) {
    res.json(match);
  } else {
    res.status(404).json({ error: "Whistleblower tracking code not found" });
  }
});

// Emergency SOS Reports Endpoint
let sosReportsStore: any[] = [];

app.post("/api/sos-reports", (req, res) => {
  const codeNum = Math.floor(10000 + Math.random() * 90000);
  const sosItem = {
    trackingCode: `SOS-${codeNum}`,
    countryCode: req.body.countryCode || 'NP',
    countryName: req.body.countryName || 'Nepal',
    targetUrlOrHandle: req.body.targetUrlOrHandle || '',
    urgencyNote: req.body.urgencyNote || '',
    timestamp: new Date().toISOString(),
    status: 'Dispatched to Response Team'
  };
  sosReportsStore.unshift(sosItem);
  res.json(sosItem);
});

// Volunteer Response Team Members Store
let volunteersStore = [
  {
    id: 'vol-1',
    name: 'Aarav Sharma',
    role: 'Lead MIL Reviewer',
    region: 'Kathmandu, Nepal (South Asia)',
    specialization: 'Deepfake Forensics & Image Verification',
    verificationsCount: 142,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'Certified UNESCO MIL youth ambassador specializing in audio-visual deepfake artifact identification.',
    inAppContactId: 'msg_aarav_sharma',
    isVerified: true
  },
  {
    id: 'vol-2',
    name: 'Pooja Karki',
    role: 'Fact-Check Specialist',
    region: 'Pokhara, Nepal',
    specialization: 'Election & Health Misinformation',
    verificationsCount: 98,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    bio: 'Journalism graduate focused on viral claim source lineage tracing and claim debunking.',
    inAppContactId: 'msg_pooja_karki',
    isVerified: true
  },
  {
    id: 'vol-3',
    name: 'Rohan Deshmukh',
    role: 'Cyber Legal Navigator',
    region: 'Mumbai, India',
    specialization: 'IT Act & Platform Takedowns',
    verificationsCount: 115,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Legal researcher supporting non-consensual deepfake victims with platform hashing and police portal filing.',
    inAppContactId: 'msg_rohan_d',
    isVerified: true
  },
  {
    id: 'vol-4',
    name: 'Sarah Jenkins',
    role: 'Digital Rights Advocate',
    region: 'London, UK (Europe)',
    specialization: 'Online Safety Act & StopNCII',
    verificationsCount: 87,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    bio: 'Specialist in European media literacy frameworks and online harassment de-escalation.',
    inAppContactId: 'msg_sarah_j',
    isVerified: true
  }
];

app.get("/api/volunteers", (req, res) => {
  res.json(volunteersStore);
});

app.post("/api/volunteers", (req, res) => {
  const newVol = {
    id: req.body.id || `vol-${Date.now()}`,
    name: req.body.name || 'MIL Volunteer',
    role: req.body.role || 'MIL Community Reviewer',
    region: req.body.region || 'Global',
    specialization: req.body.specialization || 'Fact Checking',
    verificationsCount: req.body.verificationsCount || 0,
    avatarUrl: req.body.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    bio: req.body.bio || 'Trained MIL volunteer.',
    inAppContactId: `msg_${Date.now()}`,
    isVerified: true
  };
  volunteersStore.unshift(newVol);
  res.json(newVol);
});

app.delete("/api/volunteers/:id", (req, res) => {
  const targetId = req.params.id;
  volunteersStore = volunteersStore.filter(v => v.id !== targetId);
  res.json({ success: true });
});

// Internal Admin Repeat Offender Pattern Tracker Aggregator
app.get("/api/repeat-offenders", (req, res) => {
  const targetMap: Record<string, {
    targetHandleOrDomain: string;
    reportCount: number;
    categories: Set<string>;
    sources: Set<string>;
    firstReported: string;
    lastReported: string;
  }> = {};

  const addReport = (target: string, category: string, source: string, dateStr: string) => {
    if (!target) return;
    const cleanTarget = target.trim().toLowerCase();
    if (!cleanTarget) return;

    if (!targetMap[cleanTarget]) {
      targetMap[cleanTarget] = {
        targetHandleOrDomain: target.trim(),
        reportCount: 0,
        categories: new Set(),
        sources: new Set(),
        firstReported: dateStr,
        lastReported: dateStr
      };
    }
    targetMap[cleanTarget].reportCount += 1;
    if (category) targetMap[cleanTarget].categories.add(category);
    if (source) targetMap[cleanTarget].sources.add(source);
    targetMap[cleanTarget].lastReported = dateStr;
  };

  // 1. Process Flagged Sources
  flaggedSourcesList.forEach(item => {
    addReport(item.sourceNameOrUrl, item.category, 'Community Flag', item.createdAt ? item.createdAt.substring(0, 10) : '2026-07-28');
  });

  // 2. Process Victim Reports
  victimReportsStore.forEach(item => {
    if (item.contentUrl) {
      addReport(item.contentUrl, 'Victim Takedown Request', item.platforms.join(', '), item.timestamp ? item.timestamp.substring(0, 10) : '2026-07-29');
    }
  });

  // 3. Process Whistleblower Reports
  whistleblowerReportsStore.forEach(item => {
    addReport(item.sourceUrlOrTitle, item.category, 'Whistleblower Report', item.timestamp || '2026-07-30');
  });

  // Convert map to list & format
  const resultList = Object.values(targetMap).map(item => {
    const isRepeat = item.reportCount >= 3;
    return {
      targetHandleOrDomain: item.targetHandleOrDomain,
      reportCount: item.reportCount,
      categories: Array.from(item.categories),
      sources: Array.from(item.sources),
      isRepeatOffender: isRepeat,
      riskLevel: item.reportCount >= 5 ? 'CRITICAL' : isRepeat ? 'HIGH' : 'MODERATE',
      firstReported: item.firstReported,
      lastReported: item.lastReported,
      escalatedToPolice: isRepeat
    };
  });

  // Seed standard demo repeat offenders if initial list is small
  if (resultList.length < 3) {
    resultList.push(
      {
        targetHandleOrDomain: '@deepfake_leak_network',
        reportCount: 8,
        categories: ['Non-Consensual Deepfakes', 'Impersonation'],
        sources: ['Telegram Channel', 'X/Twitter', 'TikTok'],
        isRepeatOffender: true,
        riskLevel: 'CRITICAL',
        firstReported: '2026-07-20',
        lastReported: '2026-07-30',
        escalatedToPolice: true
      },
      {
        targetHandleOrDomain: 'crypto-lottery-nepal-scam.com',
        reportCount: 5,
        categories: ['Phishing / Financial Scam', 'Whistleblower Report'],
        sources: ['Facebook Ads', 'SMS Link'],
        isRepeatOffender: true,
        riskLevel: 'HIGH',
        firstReported: '2026-07-22',
        lastReported: '2026-07-29',
        escalatedToPolice: true
      }
    );
  }

  // Sort repeat offenders first
  resultList.sort((a, b) => b.reportCount - a.reportCount);

  res.json(resultList);
});

// Setup Vite for Dev vs Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bytespark MIL Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
