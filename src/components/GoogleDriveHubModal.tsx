import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Folder,
  Search,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  initAuth,
  listDriveFiles,
  exportDossierToGoogleDrive,
  DriveFile,
} from '../services/googleDriveService';
import { ComprehensiveUniversityProfile } from '../types';

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'images' | 'docs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(
    null
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (authedUser, authedToken) => {
        setUser(authedUser);
        setToken(authedToken);
        loadFiles(authedToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setFiles([]);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isOpen]);

  const loadFiles = async (authToken?: string) => {
    const activeToken = authToken || token;
    if (!activeToken) return;

    setIsLoading(true);
    try {
      let q = '';
      if (filterType === 'images') {
        q = "mimeType contains 'image/'";
      } else if (filterType === 'docs') {
        q = "mimeType contains 'text/' or mimeType contains 'document' or mimeType contains 'markdown'";
      }

      if (searchQuery.trim()) {
        const searchPart = `name contains '${searchQuery.trim().replace(/'/g, "\\'")}'`;
        q = q ? `${q} and ${searchPart}` : searchPart;
      }

      const driveFiles = await listDriveFiles(q, 30);
      setFiles(driveFiles);
    } catch (err: unknown) {
      console.error('Failed to load drive files:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load files from Google Drive';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Signed in as ${result.user.displayName || result.user.email}. Google Drive connected!`,
        });
        await loadFiles(result.accessToken);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Drive sign in failed';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
      setToken(null);
      setFiles([]);
      setStatusMessage({ type: 'success', text: 'Disconnected from Google Drive.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign out';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDossier = async () => {
    if (!currentUniversity) return;
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const exportedFile = await exportDossierToGoogleDrive(currentUniversity);
      setStatusMessage({
        type: 'success',
        text: `Successfully exported "${currentUniversity.name}" dossier to your Google Drive!`,
        link: exportedFile.webViewLink,
      });
      await loadFiles();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export to Google Drive failed';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Google Drive Workspace Hub</h2>
              <p className="text-xs text-blue-100">
                Sync university dossiers, audit checklists, and campus media with your Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-9 h-9 rounded-full border border-indigo-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>{user.displayName || 'Connected Account'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    Drive Active
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">{user.email}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              Sign in with your Google account to browse Drive files or export dossiers.
            </div>
          )}

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {currentUniversity && (
                  <button
                    onClick={handleExportDossier}
                    disabled={isExporting}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Exporting...' : 'Save Dossier to Drive'}</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="gsi-material-button px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 rounded-xl shadow-xs text-xs font-semibold text-gray-800 flex items-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            {statusMessage.link && (
              <a
                href={statusMessage.link}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline flex items-center gap-1 hover:text-emerald-900"
              >
                <span>Open in Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {user ? (
            <>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setFilterType('all');
                      loadFiles();
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      filterType === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Files
                  </button>
                  <button
                    onClick={() => {
                      setFilterType('images');
                      loadFiles();
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterType === 'images' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Photos & Images</span>
                  </button>
                  <button
                    onClick={() => {
                      setFilterType('docs');
                      loadFiles();
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterType === 'docs' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Dossiers & Docs</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Drive..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => loadFiles()}
                    disabled={isLoading}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors cursor-pointer"
                    title="Refresh files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Files Grid */}
              {isLoading ? (
                <div className="py-16 text-center text-xs text-gray-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                  <div>Loading your Google Drive files...</div>
                </div>
              ) : files.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-500 space-y-2 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Folder className="w-8 h-8 mx-auto text-gray-300" />
                  <div className="font-semibold text-gray-700">No files found matching criteria</div>
                  <p className="text-[11px] text-gray-400">
                    Use &ldquo;Save Dossier to Drive&rdquo; above to export university profiles to your Google Drive.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file) => {
                    const isImage = file.mimeType.includes('image/');
                    return (
                      <div
                        key={file.id}
                        className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all shadow-2xs flex flex-col justify-between text-xs group"
                      >
                        <div className="flex items-start gap-3">
                          {isImage && file.thumbnailLink ? (
                            <img
                              src={file.thumbnailLink}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded-xl border border-gray-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                          )}

                          <div className="overflow-hidden flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate" title={file.name}>
                              {file.name}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate mt-0.5">
                              {file.mimeType.split('/').pop()}
                              {file.createdTime && ` • ${new Date(file.createdTime).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          {file.webViewLink ? (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                            >
                              <span>View in Drive</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span />
                          )}

                          {isImage && onSelectPhotoForUniversity && (
                            <button
                              type="button"
                              onClick={() => {
                                if (file.thumbnailLink || file.webContentLink) {
                                  onSelectPhotoForUniversity(file.webContentLink || file.thumbnailLink!);
                                  setStatusMessage({
                                    type: 'success',
                                    text: `Selected "${file.name}" as university photo!`,
                                  });
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors cursor-pointer"
                            >
                              Use as University Photo
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 px-6 text-center space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <HardDrive className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Connect Google Drive to Cambodia Explorer</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Export complete university data infrastructures, admission checklists, and fee structures directly to
                  your Google Drive as docs, or import real campus photography from your Drive storage.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Connect Google Drive</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Google Workspace Drive API v3</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-700 font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
