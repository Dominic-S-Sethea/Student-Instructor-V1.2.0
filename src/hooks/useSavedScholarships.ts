import { useEffect } from 'react';
import type { ScholarshipItem } from '../types/scholarship';
import { useSavedScholarshipsContext } from '../context/SavedScholarshipsContext';

/**
 * Convenience hook consuming the single app-wide SavedScholarshipsContext.
 * Optionally notifies callers when hydrated scholarship records arrive.
 */
export function useSavedScholarships(
  _authenticated?: boolean,
  _userId?: string | null,
  onHydrateItems?: (items: ScholarshipItem[]) => void
) {
  const ctx = useSavedScholarshipsContext();

  useEffect(() => {
    if (onHydrateItems && ctx.hydratedItems.length > 0) {
      onHydrateItems(ctx.hydratedItems);
    }
  }, [ctx.hydratedItems, onHydrateItems]);

  return ctx;
}
