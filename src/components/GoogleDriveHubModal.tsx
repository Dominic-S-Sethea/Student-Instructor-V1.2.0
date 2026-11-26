import React, { useMemo, useRef, useState } from 'react';
import {
  X,
  FileText,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import {
  buildUniversityDossierMarkdown,
  copyUniversityDossier,
  downloadUniversityDossier,
} from '../services/googleDriveService';
import { getSafeHttpUrl } from '../utils/safeUrl';
import { useAccessibleDialog } from '../hooks/useModalAccessibility';
import type { ComprehensiveUniversityProfile } from '../types';

interface GoogleDriveHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUniversity?: ComprehensiveUniversityProfile;
  onSelectPhotoForUniversity?: (photoUrl: string) => void;
}

export const GoogleDriveHubModal: React.FC<GoogleDriveHubModalProps> = ({
  isOpen,
  onClose,
  currentUniversity,
  onSelectPhotoForUniversity,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef);

  const previewMarkdown = useMemo(
    () => (currentUniversity ? buildUniversityDossierMarkdown(currentUniversity) : ''),
    [currentUniversity]
  );

  if (!isOpen) return null;

  const handleDownload = (): void => {
    if (!currentUniversity) return;
    try {
      const exported = downloadUniversityDossier(currentUniversity);
      setStatusMessage({
        type: 'success',
        text: `Downloaded "${exported.name}" (${exported.sizeBytes.toLocaleString()} bytes). Upload to Google Drive, Notion, or Docs anytime.`,
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to generate dossier download.',
      });
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!currentUniversity) return;
    try {
      const exported = await copyUniversityDossier(currentUniversity);
      setStatusMessage({
        type: 'success',
        text: `Copied "${exported.name}" Markdown dossier to your clipboard.`,
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not copy dossier to clipboard.',
      });
    }
  };

  const handleAddPhotoUrl = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!onSelectPhotoForUniversity) return;
    const safeUrl = getSafeHttpUrl(photoUrlInput);
    if (!safeUrl) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide a valid https:// or http:// image URL.',
      });
      return;
    }
    onSelectPhotoForUniversity(safeUrl);
    setPhotoUrlInput('');
    setStatusMessage({
      type: 'success',
      text: 'Added verified campus photo URL to this university session view.',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-export-modal-title"
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <FileText className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 id="dossier-export-modal-title" className="text-lg font-bold">
                University Dossier Export Hub
              </h2>
              <p className="text-xs text-blue-100">
                Export portable Markdown dossiers locally or copy straight to Google Docs / Notion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dossier export modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {statusMessage && (
          <div
            role={statusMessage.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`px-6 py-2.5 text-xs flex items-center gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-900'
                : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {currentUniversity ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download Markdown Dossier (.md)</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copy Markdown to Clipboard</span>
                </button>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Dossier Preview
                </div>
                <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                  {previewMarkdown}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Select a university dossier to generate a portable Markdown export.
            </p>
          )}

          {onSelectPhotoForUniversity && (
            <form onSubmit={handleAddPhotoUrl} className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <label
                htmlFor="custom-campus-photo-url"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Attach Campus Photo URL (https://)</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-campus-photo-url"
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://example.edu.kh/campus.jpg"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Attach
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-3.5 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>Zero third-party credentials • Local offline-first export</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-700 dark:text-slate-200 font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
