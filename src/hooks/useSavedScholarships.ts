import { useCallback, useEffect, useState } from 'react';
import type { ScholarshipItem } from '../types/scholarship';
import {
  savedScholarshipClient,
  type PersistedSavedScholarship,
  type SavedScholarshipStatus,
} from '../services/savedScholarshipClient';
import {
  clearLegacyUnscopedSavedScholarships,
  readSavedScholarshipIds,
  writeSavedScholarshipIds,
} from '../utils/savedScholarships';

export function useSavedScholarships(
  authenticated: boolean,
  userId: string | null | undefined,
  onHydrateItems?: (items: ScholarshipItem[]) => void
) {
  const scopeId = authenticated && userId ? userId : null;
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    clearLegacyUnscopedSavedScholarships();
    return readSavedScholarshipIds(scopeId);
  });
  const [savedMetadataById, setSavedMetadataById] = useState<Record<string, PersistedSavedScholarship>>({});

  useEffect(() => {
    if (!scopeId) {
      setSavedIds(readSavedScholarshipIds(null));
      setSavedMetadataById({});
      return;
    }
    let active = true;
    const guestIds = readSavedScholarshipIds(null);
    const request = guestIds.length > 0 ? savedScholarshipClient.sync(guestIds) : savedScholarshipClient.list();
    request
      .then((rows) => {
        if (!active) return;
        const ids = rows.map((r) => r.scholarshipId);
        setSavedIds(ids);
        writeSavedScholarshipIds(scopeId, ids);
        if (guestIds.length > 0) writeSavedScholarshipIds(null, []);
        setSavedMetadataById(Object.fromEntries(rows.map((r) => [r.scholarshipId, r])));
        if (onHydrateItems) {
          const hydrated = rows.map((r) => r.scholarship).filter((s): s is ScholarshipItem => Boolean(s));
          if (hydrated.length > 0) onHydrateItems(hydrated);
        }
      })
      .catch(() => {
        if (active) setSavedIds(readSavedScholarshipIds(scopeId));
      });
    return () => {
      active = false;
    };
  }, [scopeId]);

  const toggleSaveScholarship = useCallback(
    (id: string) => {
      const currentlySaved = savedIds.includes(id);
      const nextIds = currentlySaved ? savedIds.filter((item) => item !== id) : [...savedIds, id];
      setSavedIds(nextIds);
      writeSavedScholarshipIds(scopeId, nextIds);

      if (!scopeId) return;
      if (currentlySaved) {
        setSavedMetadataById((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        void savedScholarshipClient.remove(id).catch(() => {});
      } else {
        void savedScholarshipClient
          .save(id)
          .then((record) => {
            setSavedMetadataById((prev) => ({ ...prev, [id]: record }));
          })
          .catch(() => {});
      }
    },
    [savedIds, scopeId]
  );

  const updateSavedStatus = useCallback(
    (scholarshipId: string, status: SavedScholarshipStatus) => {
      if (!scopeId) return;
      setSavedMetadataById((prev) => {
        const cur = prev[scholarshipId];
        return cur ? { ...prev, [scholarshipId]: { ...cur, status } } : prev;
      });
      void savedScholarshipClient
        .update(scholarshipId, { status })
        .then((updated) => setSavedMetadataById((prev) => ({ ...prev, [scholarshipId]: updated })))
        .catch(() => {});
    },
    [scopeId]
  );

  const toggleChecklistItem = useCallback(
    (scholarshipId: string, itemId: string) => {
      if (!scopeId) return;
      const cur = savedMetadataById[scholarshipId];
      if (!cur) return;
      const nextChecklist = cur.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      );
      setSavedMetadataById((prev) => ({
        ...prev,
        [scholarshipId]: { ...cur, checklist: nextChecklist },
      }));
      void savedScholarshipClient
        .update(scholarshipId, { checklist: nextChecklist })
        .then((updated) => setSavedMetadataById((prev) => ({ ...prev, [scholarshipId]: updated })))
        .catch(() => {});
    },
    [savedMetadataById, scopeId]
  );

  return {
    savedIds,
    savedMetadataById,
    isAccountSynced: Boolean(scopeId),
    toggleSaveScholarship,
    updateSavedStatus,
    toggleChecklistItem,
  };
}
