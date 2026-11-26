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
