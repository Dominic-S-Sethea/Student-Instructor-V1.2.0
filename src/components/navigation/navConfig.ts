import type { TabView } from '../../types';

export interface NavItemConfig {
  id: TabView;
  labelEn: string;
  labelKm: string;
  descEn: string;
  descKm: string;
}

export type SubNavAction =
  | { type: 'tab'; tab: TabView }
  | { type: 'scholarship-view'; view: 'flagship' | 'top_universities' | 'saved' }
  | { type: 'university-view'; subTab: 'profiles' | 'compare' | 'roi' }
  | { type: 'advisor-view'; subTab: 'chat' | 'growth-memory' | 'recommendations' }
  | { type: 'scroll'; tab: TabView; elementId: string };

export interface SubNavItemConfig {
  id: string;
  labelEn: string;
  labelKm: string;
  descEn: string;
  descKm: string;
  targetTab: TabView;
  action: SubNavAction;
}

export interface MasterNavGroupConfig {
  id: string;
  labelEn: string;
  labelKm: string;
  defaultTab: TabView;
  matchTabs: readonly TabView[];
  accent: 'blue' | 'emerald' | 'indigo' | 'amber' | 'slate';
  subItems: readonly SubNavItemConfig[];
}

export const ADMIN_ONLY_TABS: readonly TabView[] = [
  'research-lab',
  'platform-architecture',
  'data-strategy',
];

export const PRIMARY_NAV_ITEMS: readonly NavItemConfig[] = [
  {
    id: 'dashboard',
    labelEn: 'Home',
    labelKm: 'ទំព័រដើម',
    descEn: 'Your goals and upcoming scholarship deadlines',
    descKm: 'គោលដៅសិក្សា និងកាលបរិច្ឆេទអាហារូបករណ៍',
  },
  {
    id: 'scholarships',
    labelEn: 'Scholarships',
    labelKm: 'អាហារូបករណ៍',
    descEn: 'Verified grants and top global university aid',
    descKm: 'អាហារូបករណ៍ និងជំនួយសាកលវិទ្យាល័យឈានមុខ',
  },
  {
    id: 'university-intelligence',
    labelEn: 'Universities',
    labelKm: 'សាកលវិទ្យាល័យ',
    descEn: 'Compare Cambodian universities, tuition, and majors',
    descKm: 'ប្រៀបធៀបសាកលវិទ្យាល័យ ថ្លៃសិក្សា និងជំនាញ',
  },
  {
    id: 'advisor',
    labelEn: 'Study Advisor',
    labelKm: 'ទីប្រឹក្សាសិក្សា',
    descEn: 'Ask questions about majors, exams, and applications',
    descKm: 'សួរសំណួរអំពីជំនាញ ការប្រឡង និងអាហារូបករណ៍',
  },
  {
    id: 'profile',
    labelEn: 'My Profile',
    labelKm: 'ប្រវត្តិរូបខ្ញុំ',
    descEn: 'Education timeline, saved scholarships, and privacy',
    descKm: 'ប្រវត្តិសិក្សា អាហារូបករណ៍រក្សាទុក និងឯកជនភាព',
  },
];

export const MASTER_NAV_GROUPS: readonly MasterNavGroupConfig[] = [
  {
    id: 'home',
    labelEn: 'Home',
    labelKm: 'ទំព័រដើម',
    defaultTab: 'dashboard',
    matchTabs: ['dashboard', 'decision-engine'],
    accent: 'blue',
    subItems: [
      {
        id: 'home-overview',
        labelEn: 'Home Overview',
        labelKm: 'ទំព័រដើមសង្ខេប',
        descEn: 'Calm study welcome & readiness steps',
        descKm: 'ផ្ទាំងស្វាគមន៍ និងជំហានរៀបចំការសិក្សា',
        targetTab: 'dashboard',
        action: { type: 'tab', tab: 'dashboard' },
      },
      {
        id: 'home-verified-scholarships',
        labelEn: 'Explore Verified Scholarships',
        labelKm: 'ស្វែងរកអាហារូបករណ៍',
        descEn: 'Browse verified local & global grants',
        descKm: 'មើលអាហារូបករណ៍ក្នុងស្រុក និងអន្តរជាតិ',
        targetTab: 'scholarships',
        action: { type: 'scholarship-view', view: 'flagship' },
      },
      {
        id: 'home-major-quiz',
        labelEn: '2-Minute Major Fit Quiz',
        labelKm: 'តេស្តស្វែងរកជំនាញ ២ នាទី',
        descEn: 'Match interests & budget in 5 steps',
        descKm: 'ផ្គូផ្គងចំណុចខ្លាំង និងថវិកាក្នុង ៥ ជំហាន',
        targetTab: 'decision-engine',
        action: { type: 'tab', tab: 'decision-engine' },
      },
      {
        id: 'home-deadlines',
        labelEn: 'Upcoming Deadlines',
        labelKm: 'កាលបរិច្ឆេទជិតផុតកំណត់',
        descEn: 'Jump straight to closing grant dates',
        descKm: 'មើលកាលបរិច្ឆេទអាហារូបករណ៍ជិតផុតកំណត់',
        targetTab: 'dashboard',
        action: { type: 'scroll', tab: 'dashboard', elementId: 'upcoming-deadlines-section' },
      },
    ],
  },
  {
    id: 'scholarships',
    labelEn: 'Scholarships',
    labelKm: 'អាហារូបករណ៍',
    defaultTab: 'scholarships',
    matchTabs: ['scholarships'],
    accent: 'emerald',
    subItems: [
      {
        id: 'sch-flagship',
        labelEn: 'Flagship Grants',
        labelKm: 'អាហារូបករណ៍ជាតិ និងទ្វេភាគី',
        descEn: 'National & bilateral verified grants',
        descKm: 'អាហារូបករណ៍ជាតិ និងអន្តរជាតិដែលបានផ្ទៀងផ្ទាត់',
        targetTab: 'scholarships',
        action: { type: 'scholarship-view', view: 'flagship' },
      },
      {
        id: 'sch-top-global',
        labelEn: 'Top 100 Global Aid',
        labelKm: 'សាកលវិទ្យាល័យឈានមុខ ១០០',
        descEn: '100 elite university fellowships worldwide',
        descKm: 'កម្មវិធីជំនួយសាកលវិទ្យាល័យឈានមុខ ១០០',
        targetTab: 'scholarships',
        action: { type: 'scholarship-view', view: 'top_universities' },
      },
      {
        id: 'sch-saved',
        labelEn: 'Saved & Deadlines',
        labelKm: 'អាហារូបករណ៍រក្សាទុក',
        descEn: 'Bookmarked grants & checklist drawer',
        descKm: 'តាមដានអាហារូបករណ៍ និងបញ្ជីត្រួតពិនិត្យ',
        targetTab: 'scholarships',
        action: { type: 'scholarship-view', view: 'saved' },
      },
    ],
  },
  {
    id: 'universities',
    labelEn: 'Universities',
    labelKm: 'សាកលវិទ្យាល័យ',
    defaultTab: 'university-intelligence',
    matchTabs: ['university-intelligence', 'opportunities'],
    accent: 'blue',
    subItems: [
      {
        id: 'uni-profiles',
        labelEn: 'University Profiles',
        labelKm: 'ព័ត៌មានសាកលវិទ្យាល័យ',
        descEn: 'Explore Cambodian campuses & curricula',
        descKm: 'ស្វែងយល់ពីសាកលវិទ្យាល័យ និងកម្មវិធីសិក្សា',
        targetTab: 'university-intelligence',
        action: { type: 'university-view', subTab: 'profiles' },
      },
      {
        id: 'uni-compare',
        labelEn: 'Compare Matrix',
        labelKm: 'តារាងប្រៀបធៀប',
        descEn: 'Side-by-side tuition & major comparison',
        descKm: 'ប្រៀបធៀបថ្លៃសិក្សា និងជំនាញទន្ទឹមគ្នា',
        targetTab: 'university-intelligence',
        action: { type: 'university-view', subTab: 'compare' },
      },
      {
        id: 'uni-roi',
        labelEn: 'Tuition ROI Calculator',
        labelKm: 'គណនាថ្លៃសិក្សា និង ROI',
        descEn: 'Estimate 4-year tuition & salary payback',
        descKm: 'ប៉ាន់ស្មានថ្លៃសិក្សា ៤ ឆ្នាំ និងផលចំណេញ',
        targetTab: 'university-intelligence',
        action: { type: 'university-view', subTab: 'roi' },
      },
      {
        id: 'uni-majors',
        labelEn: 'Majors & Careers',
        labelKm: 'មុខជំនាញ និងអាជីព',
        descEn: 'Degree roadmaps & local job outlook',
        descKm: 'ផែនទីមុខជំនាញ និងទីផ្សារការងារ',
        targetTab: 'opportunities',
        action: { type: 'tab', tab: 'opportunities' },
      },
    ],
  },
  {
    id: 'advisor',
    labelEn: 'Study Advisor',
    labelKm: 'ទីប្រឹក្សាសិក្សា',
    defaultTab: 'advisor',
    matchTabs: ['advisor', 'ai-advisor', 'stem-discovery'],
    accent: 'indigo',
    subItems: [
      {
        id: 'adv-chat',
        labelEn: 'Study Chat',
        labelKm: 'ជជែកសិក្សា',
        descEn: 'Ask about majors, Bac II, and grants',
        descKm: 'សួរអំពីជំនាញ ការប្រឡង និងអាហារូបករណ៍',
        targetTab: 'advisor',
        action: { type: 'advisor-view', subTab: 'chat' },
      },
      {
        id: 'adv-memory',
        labelEn: 'My Growth Memory',
        labelKm: 'ការចងចាំការសិក្សា',
        descEn: 'Manage your private study context',
        descKm: 'គ្រប់គ្រងព័ត៌មានសិក្សាដែលបានចងចាំ',
        targetTab: 'advisor',
        action: { type: 'advisor-view', subTab: 'growth-memory' },
      },
      {
        id: 'adv-recs',
        labelEn: 'Recommendations',
        labelKm: 'ការណែនាំផ្ទាល់ខ្លួន',
        descEn: 'Tailored majors & scholarship matches',
        descKm: 'ការណែនាំជំនាញ និងអាហារូបករណ៍សមស្រប',
        targetTab: 'advisor',
        action: { type: 'advisor-view', subTab: 'recommendations' },
      },
      {
        id: 'adv-stem',
        labelEn: 'STEM Discovery Lab',
        labelKm: 'បន្ទប់ពិសោធន៍ STEM',
        descEn: 'Interactive logic & science challenges',
        descKm: 'ល្បែងសិក្សាគិតវិទ្យាសាស្ត្រ និងឡូហ្ស៊ីក',
        targetTab: 'stem-discovery',
        action: { type: 'tab', tab: 'stem-discovery' },
      },
    ],
  },
  {
    id: 'community',
    labelEn: 'Community',
    labelKm: 'សហគមន៍',
    defaultTab: 'mentors',
    matchTabs: ['mentors', 'become-mentor', 'meetups', 'alumni', 'events', 'community'],
    accent: 'emerald',
    subItems: [
      {
        id: 'comm-mentors',
        labelEn: 'Find Mentors',
        labelKm: 'រៀមច្បងណែនាំ',
        descEn: '1-on-1 guidance with seniors & grads',
        descKm: 'ការណែនាំផ្ទាល់ជាមួយរៀមច្បង',
        targetTab: 'mentors',
        action: { type: 'tab', tab: 'mentors' },
      },
      {
        id: 'comm-meetups',
        labelEn: 'Study Circles',
        labelKm: 'ក្រុមសិក្សា',
        descEn: 'Peer Bac II prep & subject groups',
        descKm: 'ក្រុមត្រៀមប្រឡងបាក់ឌុប និងរំលឹកមេរៀន',
        targetTab: 'meetups',
        action: { type: 'tab', tab: 'meetups' },
      },
      {
        id: 'comm-alumni',
        labelEn: 'Alumni Hub',
        labelKm: 'បណ្តាញអតីតនិស្សិត',
        descEn: 'Insights from ITC, CADT & RUPP grads',
        descKm: 'បទពិសោធន៍និស្សិត ITC, CADT និង RUPP',
        targetTab: 'alumni',
        action: { type: 'tab', tab: 'alumni' },
      },
      {
        id: 'comm-events',
        labelEn: 'Conferences & AMAs',
        labelKm: 'សិក្ខាសាលា និងព្រឹត្តិការណ៍',
        descEn: 'Free workshops & live Q&A sessions',
        descKm: 'សិក្ខាសាលាឥតគិតថ្លៃ និងជំនួបសំណួរចម្លើយ',
        targetTab: 'events',
        action: { type: 'tab', tab: 'events' },
      },
      {
        id: 'comm-hall',
        labelEn: 'Community Hall',
        labelKm: 'វេទិកាសហគមន៍',
        descEn: 'Moderated Q&A discussions with peers',
        descKm: 'សំណួរ និងការពិភាក្សាក្នុងសហគមន៍សិស្ស',
        targetTab: 'community',
        action: { type: 'tab', tab: 'community' },
      },
    ],
  },
  {
    id: 'profile',
    labelEn: 'My Profile',
    labelKm: 'ប្រវត្តិរូបខ្ញុំ',
    defaultTab: 'profile',
    matchTabs: ['profile'],
    accent: 'slate',
    subItems: [
      {
        id: 'prof-account',
        labelEn: 'Account & Saved',
        labelKm: 'គណនី និងអាហារូបករណ៍រក្សាទុក',
        descEn: 'Saved scholarships & mentor sessions',
        descKm: 'អាហារូបករណ៍រក្សាទុក និងការណាត់ជួប',
        targetTab: 'profile',
        action: { type: 'tab', tab: 'profile' },
      },
      {
        id: 'prof-privacy',
        labelEn: 'Education & Privacy',
        labelKm: 'ប្រវត្តិសិក្សា និងឯកជនភាព',
        descEn: 'Timeline, consent toggles & erasure',
        descKm: 'ប្រវត្តិសិក្សា ការយល់ព្រម និងឯកជនភាព',
        targetTab: 'profile',
        action: { type: 'scroll', tab: 'profile', elementId: 'profile-education-privacy' },
      },
    ],
  },
];

export const ADMIN_MASTER_GROUP: MasterNavGroupConfig = {
  id: 'admin-ops',
  labelEn: 'Admin Ops',
  labelKm: 'Admin Ops',
  defaultTab: 'research-lab',
  matchTabs: ['research-lab', 'platform-architecture', 'data-strategy'],
  accent: 'amber',
  subItems: [
    {
      id: 'admin-research',
      labelEn: 'Research Lab',
      labelKm: 'Research Lab',
      descEn: 'Internal cohorts & governance exports',
      descKm: 'Internal cohorts & governance exports',
      targetTab: 'research-lab',
      action: { type: 'tab', tab: 'research-lab' },
    },
    {
      id: 'admin-arch',
      labelEn: 'Platform Architecture',
      labelKm: 'Platform Architecture',
      descEn: 'System architecture & diagnostics',
      descKm: 'System architecture & diagnostics',
      targetTab: 'platform-architecture',
      action: { type: 'tab', tab: 'platform-architecture' },
    },
    {
      id: 'admin-data',
      labelEn: 'Education Data Platform',
      labelKm: 'Education Data Platform',
      descEn: 'Admin-only education data inventory',
      descKm: 'Admin-only education data inventory',
      targetTab: 'data-strategy',
      action: { type: 'tab', tab: 'data-strategy' },
    },
  ],
};

export function findActiveMasterGroupId(tab: TabView): string {
  for (const group of MASTER_NAV_GROUPS) {
    if (group.matchTabs.includes(tab)) return group.id;
  }
  if (ADMIN_MASTER_GROUP.matchTabs.includes(tab)) return ADMIN_MASTER_GROUP.id;
  return 'home';
}
