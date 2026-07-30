export interface LegalCountryInfo {
  id: string;
  country: string;
  flag: string;
  code: string;
  hasDeepfakeLaws: boolean;
  legalSummary: string;
  keyActs: string[];
  agencyName: string;
  agencyHotline: string;
  agencyEmail: string;
  officialPortalUrl: string;
  notes: string;
}

export const countryLegalData: LegalCountryInfo[] = [
  {
    id: 'np',
    country: 'Nepal',
    flag: '🇳🇵',
    code: 'NP',
    hasDeepfakeLaws: true,
    legalSummary: 'Non-consensual image creation, synthetic face-swaps, and online harassment are criminalized under Nepal’s Electronic Transaction Act 2063 (Section 47) and National Penal Code 2074. Publishing vulgar, offensive, or defaming digital content carries fines up to NPR 100,000 and up to 5 years imprisonment.',
    keyActs: [
      'Electronic Transaction Act 2063 (Section 47)',
      'National Penal Code 2074 (Section 293 - Privacy Violations)',
      'Individual Right to Privacy Act 2075'
    ],
    agencyName: 'Nepal Police Cyber Bureau',
    agencyHotline: '1144',
    agencyEmail: 'cyberbureau@nepalpolice.gov.np',
    officialPortalUrl: 'https://cyberbureau.nepalpolice.gov.np',
    notes: 'You can submit evidence directly via email or present in person at Bhotahity, Kathmandu. Immediate takedown orders can be issued to ISP/platforms.'
  },
  {
    id: 'in',
    country: 'India',
    flag: '🇮🇳',
    code: 'IN',
    hasDeepfakeLaws: true,
    legalSummary: 'Deepfakes and non-consensual sexual media fall under Section 66E (privacy violation), 66D (impersonation), and 67/67A (obscene media) of the Information Technology Act 2000, alongside Bharatiya Nyaya Sanhita (BNS) provisions. Platforms are mandated to take down non-consensual nude/synthetic media within 24 hours of notification.',
    keyActs: [
      'IT Act 2000 (Section 66E, 66D, 67A)',
      'IT (Intermediary Guidelines) Rules 2021 (24-hr Takedown Rule)',
      'Bharatiya Nyaya Sanhita (BNS) 2023'
    ],
    agencyName: 'National Cyber Crime Reporting Portal (MHA)',
    agencyHotline: '1930',
    agencyEmail: 'complaint-cybercrime@gov.in',
    officialPortalUrl: 'https://cybercrime.gov.in',
    notes: 'Allows completely anonymous reporting for women and children under the "Report Anonymously" tab.'
  },
  {
    id: 'us',
    country: 'United States',
    flag: '🇺🇸',
    code: 'US',
    hasDeepfakeLaws: true,
    legalSummary: 'The DEEPER Act and TAKE IT DOWN Act (federal/state legislation like VAWA Section 2237) criminalize the creation or distribution of non-consensual intimate deepfakes. Civil remedies exist under copyright, right of publicity, and false endorsement laws.',
    keyActs: [
      'Federal TAKE IT DOWN Act / Violence Against Women Act (VAWA)',
      'NIST & FTC Unfair Competition Guidelines',
      'State-level NCI (Non-Consensual Intimate Imagery) statutes'
    ],
    agencyName: 'FBI Cyber Crime Division & StopNCII / NCMEC',
    agencyHotline: '1-800-CALL-FBI (225-5324)',
    agencyEmail: 'ic3@fbi.gov',
    officialPortalUrl: 'https://ic3.gov',
    notes: 'StopNCII.org partners directly with Meta, TikTok, OnlyFans, and Reddit to hash and block non-consensual content.'
  },
  {
    id: 'uk',
    country: 'United Kingdom',
    flag: '🇬🇧',
    code: 'UK',
    hasDeepfakeLaws: true,
    legalSummary: 'Under the UK Online Safety Act 2023 and Sexual Offences Act 2003 (amended 2024), creating explicit deepfakes without consent is a criminal offense regardless of whether the image is shared publicly or privately.',
    keyActs: [
      'Online Safety Act 2023',
      'Criminal Justice Act (Deepfake Amendments 2024)',
      'Communications Act 2003 (Section 127)'
    ],
    agencyName: 'Action Fraud UK & Revenge Porn Helpline',
    agencyHotline: '0300 123 2040',
    agencyEmail: 'help@revengepornhelpline.org.uk',
    officialPortalUrl: 'https://revengepornhelpline.org.uk',
    notes: 'Revenge Porn Helpline operates StopNCII hashing and provides free legal support and platform removal assistance.'
  },
  {
    id: 'au',
    country: 'Australia',
    flag: '🇦🇺',
    code: 'AU',
    hasDeepfakeLaws: true,
    legalSummary: 'The eSafety Commissioner has statutory powers under the Online Safety Act 2021 to issue legally binding removal notices to social media platforms, websites, and search engines for adult cyber abuse and non-consensual deepfakes.',
    keyActs: [
      'Online Safety Act 2021',
      'Criminal Code Act 1995 (Cth) Section 474.17'
    ],
    agencyName: 'eSafety Commissioner Australia',
    agencyHotline: '1800 880 176',
    agencyEmail: 'enquiries@esafety.gov.au',
    officialPortalUrl: 'https://esafety.gov.au/report',
    notes: 'Platforms face fines up to $550,000 AUD if they fail to remove reported content within 24 hours of an eSafety order.'
  },
  {
    id: 'sg',
    country: 'Singapore',
    flag: '🇸🇬',
    code: 'SG',
    hasDeepfakeLaws: true,
    legalSummary: 'The Protection from Online Falsehoods and Manipulation Act (POFMA) and Penal Code Section 377BD make it an offense to generate or distribute non-consensual voyeuristic or intimate deepfakes.',
    keyActs: [
      'Penal Code Section 377BD (Intimate Deepfakes)',
      'Protection from Online Falsehoods and Manipulation Act (POFMA)',
      'Online Safety (Miscellaneous Amendments) Act'
    ],
    agencyName: 'Singapore Cybercrime Command (SPF)',
    agencyHotline: '1800 255 0000',
    agencyEmail: 'SPF_Cybercrime@spf.gov.sg',
    officialPortalUrl: 'https://www.police.gov.sg/iwitness',
    notes: 'Victims can obtain expedited Protection Orders via the Protection from Harassment Court.'
  },
  {
    id: 'bd',
    country: 'Bangladesh',
    flag: '🇧🇩',
    code: 'BD',
    hasDeepfakeLaws: true,
    legalSummary: 'Under the Cyber Security Act 2023 (formerly Digital Security Act), altering photos/audio or creating synthetic media to defame or harass individuals carries criminal penalties.',
    keyActs: [
      'Cyber Security Act 2023 (Section 24 - Impersonation)',
      'Penal Code 1860 (Section 509)'
    ],
    agencyName: 'Bangladesh Police Cyber Crime Investigation Division',
    agencyHotline: '01769691522',
    agencyEmail: 'cyberhelp@police.gov.bd',
    officialPortalUrl: 'https://police.gov.bd',
    notes: 'Cyber Helpline operates 24/7 via WhatsApp and phone for urgent takedown requests.'
  },
  {
    id: 'ke',
    country: 'Kenya',
    flag: '🇰🇪',
    code: 'KE',
    hasDeepfakeLaws: true,
    legalSummary: 'The Computer Misuse and Cybercrimes Act 2018 (Section 27) criminalizes cyberharassment, false publication, and non-consensual distribution of intimate synthetic media.',
    keyActs: [
      'Computer Misuse and Cybercrimes Act 2018',
      'Data Protection Act 2019'
    ],
    agencyName: 'DCI National Cybercrime Centre Kenya',
    agencyHotline: '+254 020 3000300',
    agencyEmail: 'cybercrime@police.go.ke',
    officialPortalUrl: 'https://www.cid.go.ke',
    notes: 'Victims can report to NC4 (National Cyber Command Center) for immediate ISP coordination.'
  },
  {
    id: 'ca',
    country: 'Canada',
    flag: '🇨🇦',
    code: 'CA',
    hasDeepfakeLaws: true,
    legalSummary: 'Criminal Code Section 162.1 prohibits the non-consensual distribution of intimate images (including AI-altered or synthetic intimate media). Proposed Online Harms Bill enforces platform accountability.',
    keyActs: [
      'Criminal Code Section 162.1',
      'Online Harms Bill / Personal Information Protection Act'
    ],
    agencyName: 'Canadian Anti-Fraud Centre & Cybertip.ca',
    agencyHotline: '1-888-495-8501',
    agencyEmail: 'info@cybertip.ca',
    officialPortalUrl: 'https://cybertip.ca',
    notes: 'Cybertip.ca collaborates with global clearinghouses to remove non-consensual media.'
  },
  {
    id: 'de',
    country: 'Germany',
    flag: '🇩🇪',
    code: 'DE',
    hasDeepfakeLaws: true,
    legalSummary: 'The Network Enforcement Act (NetzDG) and Criminal Code Section 201a (violating personal privacy through photography/AI) mandate rapid deletion of unlawful synthetic media within 24 hours.',
    keyActs: [
      'NetzDG (Netzwerkdurchsetzungsgesetz)',
      'Criminal Code Section 201a StGB (Privacy & Image Violations)',
      'EU Digital Services Act (DSA)'
    ],
    agencyName: 'BKA Cybercrime Office & Internet-Beschwerdestelle',
    agencyHotline: '+49 611 55-0',
    agencyEmail: 'kontakt@beschwerdestelle.de',
    officialPortalUrl: 'https://www.internet-beschwerdestelle.de',
    notes: 'Complainants can enforce EU Digital Services Act rights for mandatory platform statement of reasons.'
  }
];
