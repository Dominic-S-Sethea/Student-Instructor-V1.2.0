import { apiGet } from './apiClient';
import type { MajorProgramDetail, UniversityProfileScore } from '../types';

export interface LiveUniversityRecord {
  id: string;
  abbr: string;
  name: string;
  khmerName?: string;
  location: string;
  type: 'Public' | 'Private' | 'Semi-Autonomous';
  foundedYear: number;
  website?: string;
  logo?: string;
  coverImage?: string;
  profileScore: UniversityProfileScore;
  annualTuitionUSD: number;
  totalDegreeCostUSD: number;
  accreditation?: {
    status?: string;
    statusKm?: string;
    isKnown?: boolean;
    agency?: string | null;
  };
  majors?: Array<Partial<MajorProgramDetail> & { id: string; name: string }>;
}

export const universityClient = {
  async list(): Promise<LiveUniversityRecord[]> {
    return apiGet<LiveUniversityRecord[]>('/api/universities');
  },

  async getById(id: string): Promise<LiveUniversityRecord> {
    return apiGet<LiveUniversityRecord>(`/api/universities/${encodeURIComponent(id)}`);
  },
};
