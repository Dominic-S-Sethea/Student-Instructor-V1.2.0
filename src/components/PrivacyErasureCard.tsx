import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { profileClient, type PrivacyConsentState } from '../services/profileClient';

interface PrivacyErasureCardProps {
  isKhmer: boolean;
  disabled?: boolean;
  onErased: (nextConsent: PrivacyConsentState, summaryMessage: string) => void;
  onError: (message: string) => void;
}

/**
 * Bilingual two-step Right-to-Erasure control backed by POST /api/privacy/erasure.
 */
export const PrivacyErasureCard: React.FC<PrivacyErasureCardProps> = ({
  isKhmer,
  disabled = false,
  onErased,
  onError,
}) => {
  const [confirming, setConfirming] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [doneCount, setDoneCount] = useState<number | null>(null);

  const handleConfirmErase = async (): Promise<void> => {
    setErasing(true);
    setDoneCount(null);
    try {
      const result = await profileClient.requestErasure();
      setDoneCount(result.totalRowsErased);
      setConfirming(false);
      const summary = isKhmer
        ? `បានលុបទិន្នន័យសកម្មភាព និងការចងចាំ AI ចំនួន ${result.totalRowsErased} កំណត់ត្រាដោយជោគជ័យ។`
        : `Erased ${result.totalRowsErased} optional activity, AI memory, and research records.`;
      onErased(result.consent, summary);
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : isKhmer
            ? 'មិនអាចលុបទិន្នន័យបានទេ។ សូមព្យាយាមម្តងទៀត។'
            : 'Failed to erase stored records. Please try again.'
      );
    } finally {
      setErasing(false);
    }
  };

  return (
    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {isKhmer ? 'សិទ្ធិលុបទិន្នន័យ (Right to Erasure)' : 'Right to Erasure (Delete Activity & AI Data)'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {isKhmer
              ? 'លុបទិន្នន័យវិភាគ ការចងចាំ AI ការស្រាវជ្រាវ និងកំណត់ត្រាសកម្មភាពទាំងអស់ចេញពីមូលដ្ឋានទិន្នន័យជាអចិន្ត្រៃយ៍ និងដកការយល់ព្រមទាំងអស់។'
              : 'Permanently delete your stored telemetry, AI memory, feature store, and research records across all pipelines and withdraw optional consent.'}
          </p>
        </div>

        {!confirming ? (
          <button
            type="button"
            disabled={disabled || erasing}
            onClick={() => setConfirming(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-950/80 disabled:opacity-60 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isKhmer ? 'លុបទិន្នន័យសកម្មភាពរបស់ខ្ញុំ' : 'Erase My Activity Data'}
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0" role="group" aria-label="Confirm data erasure">
            <button
              type="button"
              disabled={erasing}
              onClick={() => void handleConfirmErase()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-60 cursor-pointer"
            >
              {erasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {isKhmer ? 'បញ្ជាក់ការលុបជាអចិន្ត្រៃយ៍' : 'Confirm Permanent Erasure'}
            </button>
            <button
              type="button"
              disabled={erasing}
              onClick={() => setConfirming(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              {isKhmer ? 'បោះបង់' : 'Cancel'}
            </button>
          </div>
        )}
      </div>

      {doneCount !== null && (
        <div
          role="status"
          aria-live="polite"
          className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2 flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isKhmer
              ? `បានលុបកំណត់ត្រា ${doneCount} ដោយជោគជ័យ។`
              : `Erasure completed (${doneCount} records removed across student pipelines).`}
          </span>
        </div>
      )}
    </div>
  );
};
