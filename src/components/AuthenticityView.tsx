import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Search, UserCheck, FileText, Image as ImageIcon, Link as LinkIcon, ArrowLeft, Compass, Shield, BookOpen } from 'lucide-react';
import { TabType } from '../types';

interface AuthenticityViewProps {
  onRewardXP?: (amount: number) => void;
  onNavigateToTab?: (tab: TabType, categoryFilter?: string) => void;
  onGoHome?: () => void;
}

export const AuthenticityView: React.FC<AuthenticityViewProps> = ({ onNavigateToTab, onGoHome }) => {
  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1 animate-fade-in">
      {/* Back to Home Button */}
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-[#FDF2F4] hover:bg-[#F9E5E8] border border-[#7A1F2B]/20 px-3.5 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Screen</span>
        </button>
      )}

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-[#1E1B4B] to-[#7A1F2B] text-white rounded-3xl p-6 shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Media Literacy Educational Article</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-title tracking-tight leading-tight text-white">
            How Do Machines Know What's Real?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            A citizen's guide to understanding digital authenticity, synthetic content, automated detection mechanics, and practical media discernment.
          </p>
        </div>
      </div>

      {/* Section 1: Why This Matters to You */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-[#7A1F2B]">
          <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-[#7A1F2B]" />
          </div>
          <h2 className="text-lg font-bold font-serif-title text-slate-900">
            Why This Matters to You
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Generative AI tools, deepfakes, synthetic voice cloners, and automated article generators have reshaped how digital content is created and spread. Today, hyper-realistic photos, authentic-sounding audio clips, and persuasive news articles can be manufactured in seconds at zero cost. As synthetic media becomes virtually indistinguishable from genuine human capture, understanding the underlying mechanics of automated verification empowers citizens to critically evaluate digital claims rather than falling victim to viral manipulation or synthetic panic.
        </p>
      </section>

      {/* Section 2: The Three Things That Get Faked */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#7A1F2B]">
          <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4 text-[#7A1F2B]" />
          </div>
          <h2 className="text-lg font-bold font-serif-title text-slate-900">
            The Three Things That Get Faked
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Fake Text */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1. Fake Text</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Large language models (LLMs) generate plausible-sounding essays, news snippets, and social comments by predicting statistical tokens. They exhibit predictable token cadence, uniform vocabulary distribution, and characteristic stylistic markers.
            </p>
          </div>

          {/* Fake Images */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#7A1F2B]/10 text-[#7A1F2B] flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">2. Fake Images</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diffusion models and GANs synthesize photorealistic images from mathematical noise. While visual quality is high, they frequently leave micro-texture distortions, irregular lighting vectors, unnatural pupil reflections, or mismatched background geometries.
            </p>
          </div>

          {/* Fake or Misleading Links */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold">
              <LinkIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3. Fake or Misleading Links</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Malicious actors register lookalike domain names (typosquatting), wrap clickbait headlines around fabricated stories, or use redirect chains to spoof authoritative publishers and trick users into trusting false claims.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: How a Detection System Actually Thinks */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#7A1F2B]">
          <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] flex items-center justify-center font-bold">
            <Search className="w-4 h-4 text-[#7A1F2B]" />
          </div>
          <h2 className="text-lg font-bold font-serif-title text-slate-900">
            How a Detection System Actually Thinks
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Automated AI detection tools do not possess human instinct or secret knowledge. Instead, they operate through four structured analytical steps:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-[#7A1F2B] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Analyze the Pattern</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                The system evaluates mathematical signals, artifact frequency distributions, token perplexity, facial keypoint vectors, or domain registration metadata.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-[#7A1F2B] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Cross-Check When Possible</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                The engine cross-references content against known databases, reverse-image indexes, publisher reputation lists, and web grounding search engines.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-[#7A1F2B] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Score the Confidence, Not Just the Verdict</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Instead of a binary "true" or "false" declaration, modern systems calculate a probabilistic score (e.g., 88% likelihood of synthetic generation) to communicate uncertainty and statistical probability.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-[#7A1F2B] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Admit When It Doesn't Know</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                When media resolution is degraded, signals are ambiguous, or data is missing, a reliable system refuses to guess, flagging the result as "UNKNOWN" to prevent false certainty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Highlighted Callout Box */}
      <div className="bg-gradient-to-r from-[#7A1F2B] to-[#5A131E] text-white rounded-3xl p-6 shadow-md border border-[#7A1F2B]/40 relative overflow-hidden">
        <div className="flex items-start gap-3 relative z-10">
          <ShieldAlert className="w-6 h-6 text-amber-300 shrink-0 mt-1" />
          <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-amber-100">
            "ByteSpark Eye is built with this principle at its core: if live verification fails, it returns 'UNKNOWN' rather than fabricating a confident-sounding but baseless answer. A tool that always has an answer, even when it shouldn't, is more dangerous than no tool at all."
          </p>
        </div>
      </div>

      {/* Section 5: Spotting Fake Accounts */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#7A1F2B]">
          <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4 text-[#7A1F2B]" />
          </div>
          <h2 className="text-lg font-bold font-serif-title text-slate-900">
            Spotting Fake Accounts: The Human Behind the Post Matters Too
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Evaluating online claims requires looking beyond the post itself to inspect the account distributing it. Automated bot networks, sockpuppet profiles, and coordinated influence campaigns leave behind distinct behavioral and metadata signals:
        </p>

        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-[#7A1F2B] shrink-0 mt-1.5" />
            <div>
              <strong>Account Age vs. Activity:</strong> Brand new accounts created days ago with thousands of posts or zero historical posts suddenly tweeting viral political claims.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-[#7A1F2B] shrink-0 mt-1.5" />
            <div>
              <strong>Follower-to-Following Ratio:</strong> Accounts following 5,000 users with only 12 followers (or vice versa with purchased bot followers and zero engagement).
            </div>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-[#7A1F2B] shrink-0 mt-1.5" />
            <div>
              <strong>Posting Patterns:</strong> Inhuman posting cadence (e.g., tweeting 24 hours a day without sleep, or identical copypasta posted across dozens of handles within seconds).
            </div>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-[#7A1F2B] shrink-0 mt-1.5" />
            <div>
              <strong>Profile Completeness:</strong> Generic AI-generated stock avatars, missing bio details, default usernames, or stolen profile photos.
            </div>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-[#7A1F2B] shrink-0 mt-1.5" />
            <div>
              <strong>Engagement Quality:</strong> Bot accounts posting repetitive, low-context replies (e.g., "So true!", "100% agree") designed purely to boost algorithmic reach.
            </div>
          </li>
        </ul>

        <p className="text-xs text-slate-500 italic">
          Why it's harder than it looks: Modern disinformation networks blend stealth bots with real human echo chambers and compromised legitimate handles, making account verification a multi-layered investigation rather than a single metric check.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <h4 className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-700" />
            <span>Human Checklist: 4 Questions to Ask</span>
          </h4>
          <ol className="space-y-1.5 text-xs text-amber-950 list-decimal list-inside font-medium">
            <li>Who created this account, and when?</li>
            <li>Is this account posting at humanly possible times and intervals?</li>
            <li>Are real people genuinely discussing the post, or is it automated echo-repeating?</li>
            <li>Does this account have an established, verifiable record of identity outside this single viral post?</li>
          </ol>
        </div>
      </section>

      {/* Section 6: What You Can Learn From This — Without Any Software (SIFT Method) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#7A1F2B]">
          <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] flex items-center justify-center font-bold">
            <Compass className="w-4 h-4 text-[#7A1F2B]" />
          </div>
          <h2 className="text-lg font-bold font-serif-title text-slate-900">
            What You Can Learn From This — Without Any Software
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          You don't need complex software to protect yourself from digital deception. Practicing the four steps of the <strong>SIFT Method</strong> (developed by Mike Caulfield) provides immediate mental defense:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-base font-extrabold font-serif-title text-[#7A1F2B]">S — Stop</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Pause before sharing, reacting, or amplifying emotional content. Recognize emotional triggers designed to bypass critical thinking.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-base font-extrabold font-serif-title text-[#7A1F2B]">I — Investigate the Source</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Check who published the piece and what their credentials, track record, and motives are before trusting the claim.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-base font-extrabold font-serif-title text-[#7A1F2B]">F — Find Better Coverage</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Read laterally across trusted, independent mainstream reporting or fact-checking consensus on the same topic.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
            <span className="text-base font-extrabold font-serif-title text-[#7A1F2B]">T — Trace the Claim</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Track quotes, images, or figures back to their original primary context to verify whether they were altered or misquoted.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Why This Skill Is Now Essential */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-[#7A1F2B]">
          <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] flex items-center justify-center font-bold">
            <Shield className="w-4 h-4 text-[#7A1F2B]" />
          </div>
          <h2 className="text-lg font-bold font-serif-title text-slate-900">
            Why This Skill Is Now Essential
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Media literacy is no longer just about checking footnotes — it is a core civic necessity for modern digital participation. As AI generation technologies evolve, the ability to slow down, analyze underlying motives, check author accountability, and verify primary claims protects open discourse and democratic decision-making. By cultivating healthy skepticism and mastering simple verification habits, every citizen becomes a resilient defender of truth in their community.
        </p>

        {onNavigateToTab && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-500">Ready to verify live claims?</span>
            <button
              onClick={() => onNavigateToTab('verify')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#7A1F2B] hover:bg-[#5A131E] px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              <span>Go to Verify a Claim</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
