import type { TabView } from '../types';
import { ADMIN_ONLY_TABS } from '../components/navigation/navConfig';

export const VALID_TABS: ReadonlySet<TabView> = new Set<TabView>([
  'dashboard',
  'avatar-world',
  'decision-engine',
  'university-intelligence',
  'scholarships',
  'advisor',
  'ai-advisor',
  'alumni',
  'meetups',
  'mentors',
  'opportunities',
  'profile',
  'stem-discovery',
  'events',
  'community',
  'research-lab',
  'platform-architecture',
  'data-strategy',
  'become-mentor',
]);

export function readTabFromHash(isAdmin: boolean): TabView {
  if (typeof window === 'undefined') return 'dashboard';
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim() as TabView;
  if (!raw || !VALID_TABS.has(raw)) return 'dashboard';
  if (!isAdmin && ADMIN_ONLY_TABS.includes(raw)) return 'dashboard';
  return raw;
}

export function writeTabHash(tab: TabView): void {
  if (typeof window === 'undefined') return;
  const targetHash = `#${tab}`;
  if (window.location.hash !== targetHash) {
    window.history.pushState(null, '', targetHash);
  }
}
