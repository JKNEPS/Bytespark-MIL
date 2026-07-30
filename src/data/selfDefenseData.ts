export interface SelfDefenseGuide {
  id: string;
  title: string;
  category: 'Evidence Preservation' | 'Account Lockdown' | 'Platform Takedowns' | 'Deepfake Prevention';
  iconName: string;
  readTime: string;
  summary: string;
  steps: {
    title: string;
    description: string;
    proTip?: string;
  }[];
}

export interface MentalHealthResource {
  id: string;
  name: string;
  region: string;
  hotline: string;
  availability: string;
  website: string;
  description: string;
  contactMethod: string;
}

export interface PartnerNGO {
  id: string;
  name: string;
  region: string;
  focus: string;
  email: string;
  phone: string;
  website: string;
}

export const selfDefenseGuides: SelfDefenseGuide[] = [
  {
    id: 'guide-1',
    title: 'How to Properly Capture Legal-Grade Screenshots & Evidence',
    category: 'Evidence Preservation',
    iconName: 'Camera',
    readTime: '2 min read',
    summary: 'Before content gets deleted or hidden, capture immutable evidence required by cyber police and legal counsel.',
    steps: [
      {
        title: '1. Include Full URL & System Timestamp',
        description: 'Ensure the full browser URL bar and system clock (date and time) are clearly visible in the screenshot or video recording.',
        proTip: 'Use full-page screenshot extensions like "GoFullPage" or web archiving tools like Archive.is.'
      },
      {
        title: '2. Capture Account Identifiers & Unique Handles',
        description: 'Screenshot the uploader’s profile page showing their unique handle (@username), account creation date, and numerical ID.',
        proTip: 'Never rely on display names alone as users can rename themselves instantly.'
      },
      {
        title: '3. Record Video Scrolls for Dynamic Media',
        description: 'Record a short screen video scrolling from the post to comments, showing interactions, shares, and timestamps.',
        proTip: 'Store original uncompressed image files on an encrypted offline drive without renaming.'
      }
    ]
  },
  {
    id: 'guide-2',
    title: 'Emergency Social Media Account Lockdown Protocol',
    category: 'Account Lockdown',
    iconName: 'Lock',
    readTime: '3 min read',
    summary: 'Prevent perpetrators from scraping your photo galleries or impersonating your profile on major social channels.',
    steps: [
      {
        title: '1. Switch Profile & Friend List to Private',
        description: 'Immediately set Instagram, Facebook, and TikTok profiles to private. Restrict "Who can view my friend list" to "Only Me".',
        proTip: 'Scrapers harvest mutual friend lists to target contacts; hiding friends cuts off harassment vectors.'
      },
      {
        title: '2. Disable Tagging & Mention Permissions',
        description: 'Go to Settings > Privacy > Tags & Mentions. Set to "Only People You Follow" or require manual approval before tags appear.',
        proTip: 'On Meta, enable "Review posts you are tagged in before the post appears on your timeline".'
      },
      {
        title: '3. Turn On 2-Factor Authentication (2FA)',
        description: 'Activate 2FA using Authenticator Apps (Google/Authy) rather than SMS to protect against SIM-swapping.',
        proTip: 'Revoke active sessions on suspicious devices in Settings > Active Logins.'
      }
    ]
  },
  {
    id: 'guide-3',
    title: 'Fast-Tracking Same-Day Platform Removal Requests',
    category: 'Platform Takedowns',
    iconName: 'Zap',
    readTime: '3 min read',
    summary: 'How to bypass automated bot forms and escalate directly to human trust & safety managers.',
    steps: [
      {
        title: '1. Use Non-Consensual Intimate Imagery (NCII) Categories',
        description: 'Select "Non-Consensual Sexual Content", "Harassment of Private Individual", or "Impersonation" rather than generic spam.',
        proTip: 'Platform algorithms prioritize NCII and deepfake reports over general copyright or offensive speech tags.'
      },
      {
        title: '2. Register Hash on StopNCII.org',
        description: 'Upload your original image/video to StopNCII.org to generate an anonymized hash shared directly with Meta, TikTok, and Reddit.',
        proTip: 'This prevents the same file from being re-uploaded anywhere on participating platforms.'
      },
      {
        title: '3. Request Google Search De-Indexing',
        description: 'Submit Google’s "Remove Non-Consensual Explicit Imagery" form to remove search result thumbnails globally.',
        proTip: 'Google de-indexes non-consensual synthetic media within 24–48 hours upon verification.'
      }
    ]
  },
  {
    id: 'guide-4',
    title: 'Protecting Yourself Against AI Voice & Video Cloning',
    category: 'Deepfake Prevention',
    iconName: 'ShieldAlert',
    readTime: '2 min read',
    summary: 'Proactive measures to guard your digital likeness and voice samples from generative AI training.',
    steps: [
      {
        title: '1. Avoid Posting Long Clean Audio Clips Publicly',
        description: 'Generative voice cloning tools require only 3 seconds of clear audio. Limit publicly available podcast/vlog audio.',
        proTip: 'Establish a secret verbal verification code with close family members for emergency calls.'
      },
      {
        title: '2. Apply Glaze / Nightshade Cloaking',
        description: 'Before uploading artistic or personal portrait photography online, run images through Glaze or Nightshade cloaking software.',
        proTip: 'This disrupts AI model training and face-swap feature extraction.'
      }
    ]
  }
];

export const mentalHealthResources: MentalHealthResource[] = [
  {
    id: 'mh-1',
    name: 'TPO Nepal Mental Health Crisis Line',
    region: 'Nepal',
    hotline: '1660 010 2005 (Toll Free)',
    availability: 'Sun–Fri 8:00 AM – 6:00 PM',
    website: 'https://tponepal.org',
    description: 'Free, confidential psychosocial support and crisis counseling by certified counselors.',
    contactMethod: 'Phone: 16600102005'
  },
  {
    id: 'mh-[#2]',
    name: 'SAATHI Victim Helpline & Legal Aid',
    region: 'Nepal / South Asia',
    hotline: '+977 1 5421212',
    availability: '24/7 Helpline',
    website: 'https://saathi.org.np',
    description: 'Dedicated support for survivors of gender-based violence, online harassment, and cyber abuse.',
    contactMethod: 'Phone: +977-1-5421212'
  },
  {
    id: 'mh-3',
    name: 'Vandrevala Foundation Mental Health Support',
    region: 'India / Global',
    hotline: '+91 9999 666 555',
    availability: '24/7 Helpline',
    website: 'https://vandrevalafoundation.com',
    description: 'Multilingual round-the-clock emotional crisis hotline and online counselor chat.',
    contactMethod: 'Phone: +91-9999666555'
  },
  {
    id: 'mh-4',
    name: 'Crisis Text Line International',
    region: 'US / UK / Canada / Global',
    hotline: 'Text HOME to 741741',
    availability: '24/7 SMS Support',
    website: 'https://crisistextline.org',
    description: 'Free, 24/7 crisis text conversation with trained crisis volunteers.',
    contactMethod: 'SMS: Text HOME to 741741'
  },
  {
    id: 'mh-5',
    name: 'Befrienders Worldwide International Helpline',
    region: 'Global Network (32 Countries)',
    hotline: 'Online Confidential Matching',
    availability: '24/7 Global',
    website: 'https://befrienders.org',
    description: 'Global directory connecting individuals experiencing emotional distress with local confidential support centers.',
    contactMethod: 'Web Portal Search'
  }
];

export const partnerNGOs: PartnerNGO[] = [
  {
    id: 'ngo-1',
    name: 'Center for Cyber Safety & Digital Rights Nepal',
    region: 'Nepal',
    focus: 'Legal Escalation & Cyber Bureau Assistance',
    email: 'advocacy@cybersafetynepal.org',
    phone: '+977 1 4256789',
    website: 'https://cybersafetynepal.org'
  },
  {
    id: 'ngo-2',
    name: 'Cyber Peace Foundation (CPF)',
    region: 'South Asia / International',
    focus: 'Online Safety & Digital Evidence Audits',
    email: 'help@cyberpeace.net',
    phone: '+91 82350 50000',
    website: 'https://cyberpeace.org'
  },
  {
    id: 'ngo-[#3]',
    name: 'Digital Rights Foundation (DRF Cyberline)',
    region: 'Global / Regional',
    focus: 'Non-Consensual Image Takedowns & Counseling',
    email: 'helpdesk@digitalrightsfoundation.pk',
    phone: '0800 39393',
    website: 'https://digitalrightsfoundation.pk'
  },
  {
    id: 'ngo-4',
    name: 'Without My Consent Legal Network',
    region: 'Global',
    focus: 'Pro-Bono Legal & Privacy Advocacy',
    email: 'intake@withoutmyconsent.org',
    phone: 'Online Intake',
    website: 'https://withoutmyconsent.org'
  }
];
