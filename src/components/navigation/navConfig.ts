import type { TabView } from '../../types';

export interface NavItemConfig {
  id: TabView;
  labelEn: string;
  labelKm: string;
  descEn: string;
  descKm: string;
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

export const EXPLORE_NAV_ITEMS: readonly NavItemConfig[] = [
  {
    id: 'decision-engine',
    labelEn: '2-Min Major Fit Quiz',
    labelKm: 'តេស្តស្វែងរកជំនាញ ២ នាទី',
    descEn: 'Match your strengths and budget to top majors',
    descKm: 'ផ្គូផ្គងចំណុចខ្លាំង និងថវិកាទៅនឹងមុខជំនាញ',
  },
  {
    id: 'opportunities',
    labelEn: 'Majors & Careers',
    labelKm: 'មុខជំនាញ និងអាជីព',
    descEn: 'Explore degree pathways and local programs',
    descKm: 'ស្វែងយល់ពីមុខជំនាញសិក្សា និងឱកាសការងារ',
  },
  {
    id: 'mentors',
    labelEn: 'Find Mentors',
    labelKm: 'រៀមច្បងណែនាំ',
    descEn: '1-on-1 guidance with seniors and graduates',
    descKm: 'ការណែនាំផ្ទាល់ជាមួយរៀមច្បង និងនិស្សិតច្បង',
  },
  {
    id: 'meetups',
    labelEn: 'Study Circles',
    labelKm: 'ក្រុមសិក្សា',
    descEn: 'Peer Bac II prep and subject groups',
    descKm: 'ក្រុមត្រៀមប្រឡងបាក់ឌុប និងរំលឹកមេរៀន',
  },
  {
    id: 'stem-discovery',
    labelEn: 'STEM Lab',
    labelKm: 'បន្ទប់ STEM',
    descEn: 'Interactive logic and science mini-challenges',
    descKm: 'ល្បែងសិក្សាគិតវិទ្យាសាស្ត្រ និងឡូហ្ស៊ីក',
  },
  {
    id: 'events',
    labelEn: 'Conferences & AMAs',
    labelKm: 'សិក្ខាសាលា និងព្រឹត្តិការណ៍',
    descEn: 'Free student workshops and live Q&A talks',
    descKm: 'សិក្ខាសាលាឥតគិតថ្លៃ និងជំនួបសំណួរចម្លើយ',
  },
  {
    id: 'alumni',
    labelEn: 'Alumni Hub',
    labelKm: 'បណ្តាញអតីតនិស្សិត',
    descEn: 'Ask seniors from ITC, CADT, and RUPP',
    descKm: 'ស្វែងយល់ពីបទពិសោធន៍និស្សិត ITC, CADT និង RUPP',
  },
  {
    id: 'community',
    labelEn: 'Community Hall',
    labelKm: 'វេទិកាសហគមន៍',
    descEn: 'Moderated Q&A threads with peers',
    descKm: 'សំណួរ និងការពិភាក្សាក្នុងសហគមន៍សិស្ស',
  },
];

export const ADMIN_NAV_ITEMS: readonly NavItemConfig[] = [
  {
    id: 'research-lab',
    labelEn: 'Research Lab',
    labelKm: 'Research Lab',
    descEn: 'Internal research cohorts and governance exports',
    descKm: 'Internal research cohorts and governance exports',
  },
  {
    id: 'platform-architecture',
    labelEn: 'Platform Architecture',
    labelKm: 'Platform Architecture',
    descEn: 'System architecture and module diagnostics',
    descKm: 'System architecture and module diagnostics',
  },
  {
    id: 'data-strategy',
    labelEn: 'Education Data Platform',
    labelKm: 'Education Data Platform',
    descEn: 'Admin-only education data inventory',
    descKm: 'Admin-only education data inventory',
  },
];
