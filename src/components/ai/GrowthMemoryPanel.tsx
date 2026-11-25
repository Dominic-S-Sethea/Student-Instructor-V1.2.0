import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Brain, Lock, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  memoryClient,
  type HermesFactCategory,
  type HermesMemoryFact,
  type HermesMemorySnapshotResponse,
} from '../../services/memoryClient';
import { GrowthMemoryFactCard } from './GrowthMemoryFactCard';

const CATEGORIES: Array<{ id: HermesFactCategory; label: string }> = [
  { id: 'preference', label: 'Preference' },
  { id: 'goal', label: 'Goal' },
  { id: 'target_school', label: 'Target University' },
  { id: 'strength', label: 'Strength' },
  { id: 'growth_area', label: 'Growth Area' },
  { id: 'study_habit', label: 'Study Habit' },
  { id: 'milestone', label: 'Milestone' },
];

export const GrowthMemoryPanel: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({
  onNavigateTab,
}) => {
  const { authenticated } = useAuth();
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const [snapshot, setSnapshot] = useState<HermesMemorySnapshotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const [userDraft, setUserDraft] = useState('');
  const [memoryDraft, setMemoryDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFactText, setNewFactText] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<HermesFactCategory>('goal');
  const [newFactEntities, setNewFactEntities] = useState('');
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editingFactText, setEditingFactText] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const loadSnapshot = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await memoryClient.getSnapshot(false);
      setSnapshot(res);
      setUserDraft(res.userDoc?.content || '');
      setMemoryDraft(res.memoryDoc?.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Growth Memory.');
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    void loadSnapshot();
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchAbortRef.current?.abort();
    };
  }, [loadSnapshot]);

  const handleSaveDoc = async (docType: 'USER' | 'MEMORY'): Promise<void> => {
    setError(null);
    setStatusNote(null);
    try {
      const content = docType === 'USER' ? userDraft : memoryDraft;
      const res = await memoryClient.updateDoc(docType, content);
      setStatusNote(
        res.truncated
          ? `${docType} profile saved and pruned automatically to its character budget.`
          : `${docType} memory profile saved.`
      );
      await loadSnapshot();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update ${docType}.`);
    }
  };

  const handleAddFact = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newFactText.trim()) return;
    setError(null);
    setStatusNote(null);
    try {
      const entities = newFactEntities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await memoryClient.addFact({
        factText: newFactText.trim(),
        category: newFactCategory,
        entities,
      });
      setNewFactText('');
      setNewFactEntities('');
      setStatusNote(
        res.deduplicated
          ? 'Matching fact reinforced (+trust score).'
          : 'New fact added to Hermes Growth Memory.'
      );
      await loadSnapshot();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save fact.');
    }
  };

  const handleSearchFacts = (q: string): void => {
    setSearchQuery(q);
    if (!authenticated || !snapshot?.enabled) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      const req = q.trim()
        ? memoryClient.searchFacts(q.trim(), controller.signal)
        : memoryClient.getSnapshot(false, controller.signal);
      void req
        .then((res) => {
          if (!controller.signal.aborted) {
            setSnapshot((prev) => (prev ? { ...prev, facts: res.facts } : prev));
          }
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setError(err instanceof Error ? err.message : 'Fact search failed.');
        });
    }, 220);
  };

  const handleFeedback = async (
    fact: HermesMemoryFact,
    action: 'confirm' | 'correct' | 'end' | 'revert'
  ): Promise<void> => {
    setError(null);
    try {
      await memoryClient.feedbackFact(
        fact.id,
        action,
        action === 'correct' ? editingFactText.trim() || fact.factText : undefined
      );
      setEditingFactId(null);
      setEditingFactText('');
      await loadSnapshot();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update fact.');
    }
  };

  const handleClearAll = async (): Promise<void> => {
    if (!window.confirm('Clear your USER, MEMORY notes, and all saved facts?')) return;
    setError(null);
    try {
      await memoryClient.clearAll();
      setStatusNote('All Hermes Growth Memory cleared.');
      await loadSnapshot();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to clear memory.');
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
        <Lock className="w-8 h-8 text-blue-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {isKhmer ? 'សូមចូលគណនីដើម្បីបើកការចងចាំការសិក្សា' : 'Sign in to enable My Growth Memory'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {isKhmer
            ? 'ទីប្រឹក្សាសិក្សានឹងចងចាំវិធីសិក្សា សាកលវិទ្យាល័យគោលដៅ និងគោលដៅ Bac II របស់អ្នកនៅពេលអ្នកចូលគណនី និងបើកការយល់ព្រម។'
            : 'Study Advisor remembers your study style, target universities, and Bac II milestones across sessions once you sign in and enable AI memory consent.'}
        </p>
      </div>
    );
  }

  if (snapshot && !snapshot.enabled) {
    return (
      <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-3xl border border-amber-200 dark:border-amber-800 p-6 space-y-3">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
          <Lock className="w-5 h-5" />
          <span>AI Memory is Paused by Privacy Preferences</span>
        </div>
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Your student privacy preferences (or guardian verification setting) currently disable persistent AI advising memory. You can still chat normally, or enable AI memory in your Profile.
        </p>
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer"
          >
            Review Privacy Settings
          </button>
        )}
      </div>
    );
  }

  const nextNudgeIn = snapshot
    ? Math.max(1, snapshot.nudgeInterval - (snapshot.turnCounter % snapshot.nudgeInterval))
    : 10;

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hermes Growth Memory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Turn #{snapshot?.turnCounter ?? 0} &middot; Auto-consolidation nudge in {nextNudgeIn} turn(s)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleClearAll()}
          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset My Memory</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}
      {statusNote && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{statusNote}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              USER Profile (How You Learn)
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {userDraft.length} / {snapshot?.userDoc?.charLimit ?? 3000} chars
            </span>
          </div>
          <textarea
            value={userDraft}
            onChange={(e) => setUserDraft(e.target.value)}
            rows={5}
            placeholder="E.g., Grade 12 student in Phnom Penh, prefer concise step-by-step math explanations and bilingual EN/KM key terms."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleSaveDoc('USER')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
          >
            Save USER Profile
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              MEMORY Notes (Long-Term Journey)
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {memoryDraft.length} / {snapshot?.memoryDoc?.charLimit ?? 10000} chars
            </span>
          </div>
          <textarea
            value={memoryDraft}
            onChange={(e) => setMemoryDraft(e.target.value)}
            rows={5}
            placeholder="Advisor consolidated notes on target universities, scholarships, Bac II revision milestones, and recurring patterns."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleSaveDoc('MEMORY')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
          >
            Save MEMORY Notes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Structured Fact Store ({snapshot?.facts.length ?? 0} active)
          </h3>
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => void handleSearchFacts(e.target.value)}
              placeholder="Search facts (EN / ខ្មែរ)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <form onSubmit={(e) => void handleAddFact(e)} className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <input
            type="text"
            value={newFactText}
            onChange={(e) => setNewFactText(e.target.value)}
            placeholder="Teach Study Advisor a preference, goal, or target school..."
            className="md:col-span-6 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
          />
          <select
            value={newFactCategory}
            onChange={(e) => setNewFactCategory(e.target.value as HermesFactCategory)}
            className="md:col-span-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={newFactEntities}
            onChange={(e) => setNewFactEntities(e.target.value)}
            placeholder="Tags (e.g. CADT, MEXT)"
            className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!newFactText.trim()}
            className="md:col-span-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        <div className="space-y-2">
          {(snapshot?.facts || []).length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
              No active facts yet. Chat with Study Advisor or add your first learning goal above.
            </p>
          ) : (
            snapshot!.facts.map((fact) => (
              <GrowthMemoryFactCard
                key={fact.id}
                fact={fact}
                isEditing={editingFactId === fact.id}
                editingText={editingFactText}
                onChangeEditingText={setEditingFactText}
                onStartEdit={() => {
                  setEditingFactId(fact.id);
                  setEditingFactText(fact.factText);
                }}
                onFeedback={(f, action) => void handleFeedback(f, action)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
