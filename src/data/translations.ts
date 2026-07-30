export type SupportedLanguage = 'en' | 'ne' | 'hi';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  flag: string;
}

export const languageOptions: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ne', label: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Nav & General
    appTitle: 'Bytespark MIL',
    appSubtitle: 'Media & Information Literacy',
    home: 'Home',
    verify: 'Verify Claim',
    authenticity: 'AI Deepfake Check',
    source: 'Source Check',
    debate: 'MIL Forum',
    explore: 'Explore & Learn',
    profile: 'Profile',
    sosButton: 'EMERGENCY SOS',
    sosSub: 'Instant Fast-Track Help',
    
    // Victim & Whistleblower
    reportVictim: 'Report as a Victim (Anonymous)',
    reportWhistleblower: 'Whistleblower Mode',
    reportWhistleblowerSub: 'Report Scams & Disinformation Anonymously',
    knowYourRights: 'Know Your Rights (Legal Info)',
    selfDefense: 'Protect Yourself (Self-Defense)',
    responseTeam: 'Volunteer Response Team',
    adminDashboard: 'Admin Control Center',
    
    // Actions
    submit: 'Submit Report',
    cancel: 'Cancel',
    close: 'Close',
    copyCode: 'Copy Tracking Code',
    trackReport: 'Track Existing Report',
    emergencyHotline: 'Emergency Police Helpline',
    
    // Disclaimers
    anonymousGuarantee: '100% Anonymous & Confidential',
    honestDisclaimer: 'We assist with hash registration and escalation. Direct platform/police reporting is recommended for fastest removal.'
  },
  ne: {
    // Nav & General
    appTitle: 'बाट्सपार्क एमआईएल',
    appSubtitle: 'मिडिया तथा सूचना साक्षरता',
    home: 'गृह (होम)',
    verify: 'दाबी जाँच गर्नुहोस्',
    authenticity: 'डीपफेक र एआई जाँच',
    source: 'स्रोतको विश्वसनीयता',
    debate: 'एमआईएल मञ्च',
    explore: 'अध्ययन र खोज',
    profile: 'प्रोफाइल',
    sosButton: 'आपत्कालीन SOS',
    sosSub: 'द्रुत सहायता र उजुरी',

    // Victim & Whistleblower
    reportVictim: 'पिडितको रूपमा उजुरी (बेनामी)',
    reportWhistleblower: 'ह्विसलभ्लोअर मोड',
    reportWhistleblowerSub: 'भ्रामक समाचार र ठगीको बेनामी उजुरी',
    knowYourRights: 'आफ्नो अधिकार जान्नुहोस् (कानुनी जानकारी)',
    selfDefense: 'सुरक्षित रहनुहोस् (डिजिटल आत्म-रक्षा)',
    responseTeam: 'स्वयंसेवक प्रतिक्रिया टोली',
    adminDashboard: 'एडमिन नियन्त्रण केन्द्र',

    // Actions
    submit: 'उजुरी पेश गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    close: 'बन्द गर्नुहोस्',
    copyCode: 'ट्र्याकिङ कोड कपी गर्नुहोस्',
    trackReport: 'उजुरीको स्थिति हेर्नुहोस्',
    emergencyHotline: 'साइबर ब्युरो हटलाइन',

    // Disclaimers
    anonymousGuarantee: '१००% पूर्ण रूपमा गोप्य र बेनामी',
    honestDisclaimer: 'हामी उजुरी प्रक्रिया र सहजीकरणमा मद्दत गर्दछौं। छिटो हटाउन साइबर ब्युरोमा सीधा सम्पर्क गर्नुहोस्।'
  },
  hi: {
    // Nav & General
    appTitle: 'बाइट्सपार्क एमआईएल',
    appSubtitle: 'मीडिया एवं सूचना साक्षरता',
    home: 'होम',
    verify: 'दावे की जांच',
    authenticity: 'एआई डीपफेक जांच',
    source: 'स्रोत विश्वसनीयता',
    debate: 'एमआईएल फोरम',
    explore: 'सीखें और खोजें',
    profile: 'प्रोफाइल',
    sosButton: 'आपातकालीन SOS',
    sosSub: 'तुरंत सहायता प्राप्त करें',

    // Victim & Whistleblower
    reportVictim: 'पीड़ित के रूप में रिपोर्ट करें (गुमनाम)',
    reportWhistleblower: 'विसलब्लोअर मोड',
    reportWhistleblowerSub: 'फर्जी खबर व धोखाधड़ी की गुमनाम रिपोर्ट',
    knowYourRights: 'अपने अधिकार जानें (कानूनी जानकारी)',
    selfDefense: 'डिजिटल आत्म-रक्षा निर्देशिका',
    responseTeam: 'स्वयंसेवक प्रतिक्रिया टीम',
    adminDashboard: 'एडमिन कंट्रोल सेंटर',

    // Actions
    submit: 'रिपोर्ट जमा करें',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    copyCode: 'ट्रैकिंग कोड कॉपी करें',
    trackReport: 'रिपोर्ट की स्थिति जांचें',
    emergencyHotline: 'साइबर क्राइम हेल्पलाइन',

    // Disclaimers
    anonymousGuarantee: '100% पूरी तरह से गोपनीय और गुमनाम',
    honestDisclaimer: 'हम हैश पंजीकरण और रिपोर्ट भेजने में सहायता करते हैं। त्वरित कार्रवाई के लिए सीधे साइबर पोर्टल पर भी शिकायत दर्ज करें।'
  }
};

export const getTranslation = (key: string, lang: SupportedLanguage): string => {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  return translations['en'][key] || key;
};
