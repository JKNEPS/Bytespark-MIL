import React, { useState, useEffect } from 'react';
import { TabType, FeedItem, UserProfile, VerificationResult } from './types';
import { initialFeedItems } from './data/feedData';
import { initialUserProfile } from './data/userInitialData';
import { sampleGames, samplePodcasts, sampleComics, sampleDocumentaries, sampleToolkits, sampleDebateTopics } from './data/exploreData';
import { SupportedLanguage } from './data/translations';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeFeedView } from './components/HomeFeedView';
import { VerifyView } from './components/VerifyView';
import { AuthenticityView } from './components/AuthenticityView';
import { SourceCheckView } from './components/SourceCheckView';
import { DebateView } from './components/DebateView';
import { ExploreView } from './components/ExploreView';
import { ProfileView } from './components/ProfileView';
import { VictimTakedownModal } from './components/VictimTakedownModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { WhistleblowerModal } from './components/WhistleblowerModal';
import { LegalRightsView } from './components/LegalRightsView';
import { DigitalSelfDefenseView } from './components/DigitalSelfDefenseView';
import { ResponseTeamView } from './components/ResponseTeamView';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { GlobalAIChatbot } from './components/GlobalAIChatbot';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  // Modals state
  const [showVictimModal, setShowVictimModal] = useState<boolean>(false);
  const [showSOSModal, setShowSOSModal] = useState<boolean>(false);
  const [showWhistleblowerModal, setShowWhistleblowerModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  const [exploreCategory, setExploreCategory] = useState<any>('All');
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bytespark_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialUserProfile;
      }
    }
    return initialUserProfile;
  });

  const [prefilledVerifyClaim, setPrefilledVerifyClaim] = useState<string>('');

  const handleNavigateToTab = (tab: TabType, categoryFilter?: string) => {
    if (categoryFilter) {
      setExploreCategory(categoryFilter);
    }
    setActiveTab(tab);
  };

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Bytespark MIL Service Worker Registered'))
        .catch((err) => console.log('SW registration failed:', err));
    }
  }, []);

  // Save profile state to localStorage
  useEffect(() => {
    localStorage.setItem('bytespark_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Handle XP rewards & Level ups
  const addXP = (earnedXp: number) => {
    setUserProfile((prev) => {
      let newXp = prev.xpPoints + earnedXp;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;
      let newTitle = prev.levelTitle;

      if (newXp >= newNextXp) {
        newLevel += 1;
        newNextXp = Math.round(newNextXp * 1.5);
        if (newLevel === 2) newTitle = 'Fact Detective';
        else if (newLevel === 3) newTitle = 'MIL Truth Sentinel';
        else if (newLevel === 4) newTitle = 'Media Discernment Specialist';
        else newTitle = 'UNESCO Youth Ambassador';
      }

      return {
        ...prev,
        xpPoints: newXp,
        level: newLevel,
        nextLevelXp: newNextXp,
        levelTitle: newTitle
      };
    });
  };

  // Callback when a claim card in Feed is tapped to inspect
  const handleVerifyClaimFromFeed = (claimText: string) => {
    setPrefilledVerifyClaim(claimText);
    setActiveTab('verify');
  };

  // Callback when user answers a prebunk quiz
  const handleQuizAnswer = (points: number) => {
    addXP(points);
    setUserProfile((prev) => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1
    }));
  };

  // Callback when user completes a verification run
  const handleVerificationSuccess = (result: VerificationResult) => {
    addXP(45);
    setUserProfile((prev) => ({
      ...prev,
      verificationsCount: prev.verificationsCount + 1
    }));
  };

  // Callback when user submits a debate argument
  const handleDebateArgumentSubmitted = (points: number) => {
    addXP(points);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 flex flex-col font-sans selection:bg-[#7A1F2B] selection:text-white">
      {/* Top Mobile Navbar */}
      <Navbar
        userProfile={userProfile}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeTab={activeTab}
        onGoHome={() => setActiveTab('home')}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenVictimModal={() => setShowVictimModal(true)}
        onOpenSOSModal={() => setShowSOSModal(true)}
        onOpenWhistleblowerModal={() => setShowWhistleblowerModal(true)}
      />

      {/* Main Content View Frame */}
      <main className="flex-1 px-3 sm:px-4 pt-3 max-w-md mx-auto w-full">
        {activeTab === 'home' && (
          <HomeFeedView
            feedItems={feedItems}
            onVerifyClaim={handleVerifyClaimFromFeed}
            onAnswerQuiz={handleQuizAnswer}
            onOpenVerifyTab={() => setActiveTab('verify')}
            onOpenVictimModal={() => setShowVictimModal(true)}
            onOpenSOSModal={() => setShowSOSModal(true)}
            onOpenWhistleblowerModal={() => setShowWhistleblowerModal(true)}
            onOpenLegalRights={() => setActiveTab('legal-rights')}
            onOpenSelfDefense={() => setActiveTab('self-defense')}
            onOpenResponseTeam={() => setActiveTab('response-team')}
            onOpenAdminDashboard={() => setShowAdminModal(true)}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyView
            initialClaimText={prefilledVerifyClaim}
            onVerificationSuccess={handleVerificationSuccess}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'authenticity' && (
          <AuthenticityView
            onRewardXP={addXP}
            onNavigateToTab={handleNavigateToTab}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'source' && (
          <SourceCheckView
            onRewardXP={addXP}
            onNavigateToTab={handleNavigateToTab}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'debate' && (
          <DebateView
            topics={sampleDebateTopics}
            onArgumentSubmitted={handleDebateArgumentSubmitted}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            games={sampleGames}
            podcasts={samplePodcasts}
            comics={sampleComics}
            documentaries={sampleDocumentaries}
            toolkits={sampleToolkits}
            onRewardXP={addXP}
            initialTopicTag={exploreCategory}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView userProfile={userProfile} onGoHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'legal-rights' && (
          <LegalRightsView onRewardXP={addXP} onGoHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'self-defense' && (
          <DigitalSelfDefenseView
            onRewardXP={addXP}
            onOpenVictimModal={() => setShowVictimModal(true)}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'response-team' && (
          <ResponseTeamView
            isAdmin={true}
            onRewardXP={addXP}
            onGoHome={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Global AI Chatbot Available On Every Page */}
      <GlobalAIChatbot />

      {/* Bottom PWA Mobile Navigation Bar */}
      <BottomNav
        activeTab={activeTab === 'legal-rights' || activeTab === 'self-defense' || activeTab === 'response-team' ? 'home' : activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Anonymous Victim Report & Takedown Assist Modal */}
      <VictimTakedownModal
        isOpen={showVictimModal}
        onClose={() => setShowVictimModal(false)}
        onRewardXP={addXP}
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
        onRewardXP={addXP}
      />

      {/* Anonymous Whistleblower Report Modal */}
      <WhistleblowerModal
        isOpen={showWhistleblowerModal}
        onClose={() => setShowWhistleblowerModal(false)}
        onRewardXP={addXP}
      />

      {/* Admin Dashboard & Repeat Offender Tracker Modal */}
      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  );
}

