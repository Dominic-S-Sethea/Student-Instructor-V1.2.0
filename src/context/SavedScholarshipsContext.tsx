import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
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

export interface SavedScholarshipsContextValue {
  savedIds: string[];
  savedMetadataById: Record<string, PersistedSavedScholarship>;
  hydratedItems: ScholarshipItem[];
  isAccountSynced: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  toggleSaveScholarship: (id: string) => void;
  updateSavedStatus: (scholarshipId: string, status: SavedScholarshipStatus) => void;
  toggleChecklistItem: (scholarshipId: string, itemId: string) => void;
}

const SavedScholarshipsContext = createContext<SavedScholarshipsContextValue | null>(null);

export const SavedScholarshipsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated, user } = useAuth();
  const scopeId = authenticated && user?.id ? user.id : null;

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    clearLegacyUnscopedSavedScholarships();
    return readSavedScholarshipIds(scopeId);
  });
  const [savedMetadataById, setSavedMetadataById] = useState<Record<string, PersistedSavedScholarship>>({});
  const [hydratedItems, setHydratedItems] = useState<ScholarshipItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedIdsRef = useRef(savedIds);
  savedIdsRef.current = savedIds;
  const savedMetadataRef = useRef(savedMetadataById);
  savedMetadataRef.current = savedMetadataById;

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!scopeId) {
      setSavedIds(readSavedScholarshipIds(null));
      setSavedMetadataById({});
      setHydratedItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const guestIds = readSavedScholarshipIds(null);
    const request =
      guestIds.length > 0 ? savedScholarshipClient.sync(guestIds) : savedScholarshipClient.list();

    request
      .then((rows) => {
        if (!active) return;
        const ids = rows.map((r) => r.scholarshipId);
        setSavedIds(ids);
        writeSavedScholarshipIds(scopeId, ids);
        if (guestIds.length > 0) writeSavedScholarshipIds(null, []);
        setSavedMetadataById(Object.fromEntries(rows.map((r) => [r.scholarshipId, r])));
        setHydratedItems(
          rows.map((r) => r.scholarship).filter((s): s is ScholarshipItem => Boolean(s))
        );
      })
      .catch((err) => {
        if (!active) return;
        setSavedIds(readSavedScholarshipIds(scopeId));
        setError(
          err instanceof Error ? err.message : 'Unable to sync saved scholarships right now.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [scopeId]);

  const toggleSaveScholarship = useCallback(
    (id: string) => {
      setError(null);
      const prevIds = savedIdsRef.current;
      const prevMeta = savedMetadataRef.current;
      const currentlySaved = prevIds.includes(id);
      const nextIds = currentlySaved ? prevIds.filter((item) => item !== id) : [...prevIds, id];

      setSavedIds(nextIds);
      writeSavedScholarshipIds(scopeId, nextIds);

      if (!scopeId) return;

      if (currentlySaved) {
        const previousEntry = prevMeta[id];
        setSavedMetadataById((cur) => {
          const copy = { ...cur };
          delete copy[id];
          return copy;
        });
        void savedScholarshipClient.remove(id).catch((err) => {
          setSavedIds(prevIds);
          writeSavedScholarshipIds(scopeId, prevIds);
          if (previousEntry) {
            setSavedMetadataById((cur) => ({ ...cur, [id]: previousEntry }));
          }
          setError(
            err instanceof Error
              ? err.message
              : 'Could not remove saved scholarship. Reverted changes.'
          );
        });
      } else {
        void savedScholarshipClient
          .save(id)
          .then((record) => {
            setSavedMetadataById((cur) => ({ ...cur, [id]: record }));
            if (record.scholarship) {
              const hydrated = record.scholarship;
              setHydratedItems((prev) =>
                prev.some((item) => item.id === hydrated.id) ? prev : [...prev, hydrated]
              );
            }
          })
          .catch((err) => {
            setSavedIds(prevIds);
            writeSavedScholarshipIds(scopeId, prevIds);
            setError(
              err instanceof Error
                ? err.message
                : 'Could not save scholarship to your account. Reverted changes.'
            );
          });
      }
    },
    [scopeId]
  );

  const updateSavedStatus = useCallback(
    (scholarshipId: string, status: SavedScholarshipStatus) => {
      if (!scopeId) return;
      setError(null);
      const previousEntry = savedMetadataRef.current[scholarshipId];
      if (!previousEntry) return;

      setSavedMetadataById((prev) => ({
        ...prev,
        [scholarshipId]: { ...previousEntry, status },
      }));

      void savedScholarshipClient
        .update(scholarshipId, { status })
        .then((updated) => setSavedMetadataById((prev) => ({ ...prev, [scholarshipId]: updated })))
        .catch((err) => {
          setSavedMetadataById((prev) => ({ ...prev, [scholarshipId]: previousEntry }));
          setError(
            err instanceof Error
              ? err.message
              : 'Could not update application status. Reverted changes.'
          );
        });
    },
    [scopeId]
  );

  const toggleChecklistItem = useCallback(
    (scholarshipId: string, itemId: string) => {
      if (!scopeId) return;
      setError(null);
      const previousEntry = savedMetadataRef.current[scholarshipId];
      if (!previousEntry) return;

      const nextChecklist = previousEntry.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      );

      setSavedMetadataById((prev) => ({
        ...prev,
        [scholarshipId]: { ...previousEntry, checklist: nextChecklist },
      }));

      void savedScholarshipClient
        .update(scholarshipId, { checklist: nextChecklist })
        .then((updated) => setSavedMetadataById((prev) => ({ ...prev, [scholarshipId]: updated })))
        .catch((err) => {
          setSavedMetadataById((prev) => ({ ...prev, [scholarshipId]: previousEntry }));
          setError(
            err instanceof Error
              ? err.message
              : 'Could not update checklist item. Reverted changes.'
          );
        });
    },
    [scopeId]
  );

  const value = useMemo<SavedScholarshipsContextValue>(
    () => ({
      savedIds,
      savedMetadataById,
      hydratedItems,
      isAccountSynced: Boolean(scopeId),
      loading,
      error,
      clearError,
      toggleSaveScholarship,
      updateSavedStatus,
      toggleChecklistItem,
    }),
    [
      savedIds,
      savedMetadataById,
      hydratedItems,
      scopeId,
      loading,
      error,
      clearError,
      toggleSaveScholarship,
      updateSavedStatus,
      toggleChecklistItem,
    ]
  );

  return (
    <SavedScholarshipsContext.Provider value={value}>
      {children}
    </SavedScholarshipsContext.Provider>
  );
};

export function useSavedScholarshipsContext(): SavedScholarshipsContextValue {
  const ctx = useContext(SavedScholarshipsContext);
  if (!ctx) {
    throw new Error('useSavedScholarshipsContext must be used inside SavedScholarshipsProvider');
  }
  return ctx;
}
