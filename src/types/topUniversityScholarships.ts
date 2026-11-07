export type TopUniversityRegion =
  | 'USA'
  | 'UK'
  | 'Canada'
  | 'China'
  | 'Hong Kong'
  | 'South Korea'
  | 'Australia'
  | 'Europe'
  | 'India'
  | 'Singapore'
  | 'Japan';

export type FellowshipType =
  | 'Need-Based Full Aid'
  | 'Merit Fellowship'
  | 'Competitive Presidential Fellowship'
  | 'Research/Teaching Assistantship'
  | 'Government-University Partnership';

export type FundingCoverage =
  | '100% Full Tuition + Living Stipend'
  | '100% Demonstrated Need-Met'
  | 'Full Tuition Waiver + Health'
  | 'Substantial Tuition Fellowship';

export type DegreeLevelOption = 'Undergraduate' | 'Master' | 'PhD' | 'MBA';

export type ApplicationMechanism =
  | 'Automatic with Admission'
  | 'CSS Profile / Financial Aid App'
  | 'Separate Fellowship App'
  | 'Direct University Nomination';

export interface TopUniversityAidProgram {
  id: string;
  universityName: string;
  universityAbbr: string;
  region: TopUniversityRegion;
  country: string;
  city: string;
  qsWorldRank: number | string;
  theWorldRank: number | string;
  badge: string; // e.g. 'Ivy League', 'C9 League', 'Go8', 'IIT INI', etc.
  fellowshipName: string;
  fellowshipType: FellowshipType;
  fundingCoverage: FundingCoverage;
  estimatedAnnualValueUSD: number;
  degreeLevels: DegreeLevelOption[];
  applicationMechanism: ApplicationMechanism;
  cambodianEligibilityNotes: string;
  standardizedTests: string;
  applicationDeadline: string;
  officialPortalUrl: string;
  keyHighlights: string[];
  strategicTipsForCambodians: string;
}
