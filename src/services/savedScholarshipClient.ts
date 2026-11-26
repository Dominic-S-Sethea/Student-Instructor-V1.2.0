import { apiFetchRaw } from './apiClient';
import type { ScholarshipItem } from '../types/scholarship';

export type SavedScholarshipStatus = 'saved' | 'preparing' | 'submitted' | 'awarded' | 'archived';

export interface SavedChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface PersistedSavedScholarship {
  id: string;
  userId: string;
  scholarshipId: string;
  status: SavedScholarshipStatus;
  targetNote: string;
  checklist: SavedChecklistItem[];
  createdAt: string;
  updatedAt: string;
  scholarship: ScholarshipItem | null;
}

export const savedScholarshipClient = {
  async list(): Promise<PersistedSavedScholarship[]> {
    const res = await apiFetchRaw<{ success: boolean; saved?: PersistedSavedScholarship[] }>(
      '/api/scholarships/saved'
    );
    return Array.isArray(res.saved) ? res.saved : [];
  },

  async save(
    scholarshipId: string,
    payload?: { status?: SavedScholarshipStatus; targetNote?: string; checklist?: SavedChecklistItem[] }
  ): Promise<PersistedSavedScholarship> {
    const res = await apiFetchRaw<{ success: boolean; data: PersistedSavedScholarship }>(
      '/api/scholarships/saved',
      {
        method: 'POST',
        body: JSON.stringify({ scholarshipId, ...(payload || {}) }),
      }
    );
    return res.data;
  },

  async sync(scholarshipIds: string[]): Promise<PersistedSavedScholarship[]> {
    const res = await apiFetchRaw<{ success: boolean; saved?: PersistedSavedScholarship[] }>(
      '/api/scholarships/saved/sync',
      {
        method: 'POST',
        body: JSON.stringify({ scholarshipIds }),
      }
    );
    return Array.isArray(res.saved) ? res.saved : [];
  },

  async update(
    scholarshipId: string,
    patch: { status?: SavedScholarshipStatus; targetNote?: string; checklist?: SavedChecklistItem[] }
  ): Promise<PersistedSavedScholarship> {
    const res = await apiFetchRaw<{ success: boolean; data: PersistedSavedScholarship }>(
      `/api/scholarships/saved/${encodeURIComponent(scholarshipId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }
    );
    return res.data;
  },

  async remove(scholarshipId: string): Promise<void> {
    await apiFetchRaw<{ success: boolean }>(
      `/api/scholarships/saved/${encodeURIComponent(scholarshipId)}`,
      { method: 'DELETE' }
    );
  },
};
