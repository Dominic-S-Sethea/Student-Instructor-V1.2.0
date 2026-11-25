import { TopUniversityAidProgram, TopUniversityRegion } from '../../types/topUniversityScholarships';
import { usTop20AidPrograms } from './usUniversities';
import { ukTop5AidPrograms } from './ukUniversities';
import { canadaTop5AidPrograms } from './canadaUniversities';
import { chinaTop15AidPrograms } from './chinaUniversities';
import { hongKongTop5AidPrograms } from './hongKongUniversities';
import { koreaTop5AidPrograms } from './koreaUniversities';
import { australiaTop10AidPrograms } from './australiaUniversities';
import { europeTop20AidPrograms } from './europeUniversities';
import { indiaTop5AidPrograms } from './indiaUniversities';
import { singaporeTop5AidPrograms, japanTop5AidPrograms } from './singaporeJapanUniversities';

export const allTopUniversityPrograms: TopUniversityAidProgram[] = [
  ...usTop20AidPrograms,
  ...ukTop5AidPrograms,
  ...canadaTop5AidPrograms,
  ...chinaTop15AidPrograms,
  ...hongKongTop5AidPrograms,
  ...koreaTop5AidPrograms,
  ...australiaTop10AidPrograms,
  ...europeTop20AidPrograms,
  ...indiaTop5AidPrograms,
  ...singaporeTop5AidPrograms,
  ...japanTop5AidPrograms
];

export const REGION_COUNTS = {
  ALL: allTopUniversityPrograms.length, // 100
  USA: usTop20AidPrograms.length, // 20
  UK: ukTop5AidPrograms.length, // 5
  Canada: canadaTop5AidPrograms.length, // 5
  China: chinaTop15AidPrograms.length, // 15
  'Hong Kong': hongKongTop5AidPrograms.length, // 5
  'South Korea': koreaTop5AidPrograms.length, // 5
  Australia: australiaTop10AidPrograms.length, // 10
  Europe: europeTop20AidPrograms.length, // 20
  India: indiaTop5AidPrograms.length, // 5
  Singapore: singaporeTop5AidPrograms.length, // 5
  Japan: japanTop5AidPrograms.length // 5
};

export const REGION_LABELS: Record<TopUniversityRegion | 'ALL', { label: string; flag: string; count: number; description: string }> = {
  ALL: {
    label: 'All Global Elite',
    flag: '🌍',
    count: allTopUniversityPrograms.length,
    description: '100 World-Leading Universities with Full Fellowships & Financial Aid'
  },
  USA: {
    label: 'US Top 20',
    flag: '🇺🇸',
    count: usTop20AidPrograms.length,
    description: 'Harvard, Stanford, Wharton, MIT, Chicago Booth, Kellogg, Columbia, Princeton & more'
  },
  UK: {
    label: 'UK Top 5',
    flag: '🇬🇧',
    count: ukTop5AidPrograms.length,
    description: 'Oxford, Cambridge, Imperial College London, UCL & LSE (G5 Super-Elite)'
  },
  Canada: {
    label: 'Canada Top 5',
    flag: '🇨🇦',
    count: canadaTop5AidPrograms.length,
    description: 'Toronto (Pearson), UBC (4YF), McGill (McCall MacBain), Waterloo & Alberta'
  },
  China: {
    label: 'China Top 15',
    flag: '🇨🇳',
    count: chinaTop15AidPrograms.length,
    description: 'Tsinghua, Peking, Fudan, Zhejiang, SJTU, USTC & C9 League elite'
  },
  'Hong Kong': {
    label: 'Hong Kong Top 5',
    flag: '🇭🇰',
    count: hongKongTop5AidPrograms.length,
    description: 'HKU (HKpPS), CUHK, HKUST (RedBird), PolyU (Belt & Road) & CityU'
  },
  'South Korea': {
    label: 'Korea Top 5',
    flag: '🇰🇷',
    count: koreaTop5AidPrograms.length,
    description: 'Seoul National (SNU), KAIST, Yonsei (UIC), Korea University (KU) & POSTECH'
  },
  Australia: {
    label: 'Australia Top 10',
    flag: '🇦🇺',
    count: australiaTop10AidPrograms.length,
    description: 'Melbourne, ANU, Sydney, UNSW, UQ, Monash & Group of Eight (Go8)'
  },
  Europe: {
    label: 'Europe Top 20',
    flag: '🇪🇺',
    count: europeTop20AidPrograms.length,
    description: 'ETH Zurich, EPFL, TUM, PSL Paris, Karolinska, KU Leuven, TU Delft & continental powerhouses'
  },
  India: {
    label: 'India Top 5',
    flag: '🇮🇳',
    count: indiaTop5AidPrograms.length,
    description: 'IIT Bombay, IIT Delhi, IISc Bangalore, IIT Kharagpur & IIT Madras (Apex INIs)'
  },
  Singapore: {
    label: 'Singapore Top 5',
    flag: '🇸🇬',
    count: singaporeTop5AidPrograms.length,
    description: 'NUS, NTU, SMU, SUTD & SUSS'
  },
  Japan: {
    label: 'Japan Top 5',
    flag: '🇯🇵',
    count: japanTop5AidPrograms.length,
    description: 'UTokyo, Kyoto, Science Tokyo (Tokyo Tech), Osaka & Tohoku'
  }
};
