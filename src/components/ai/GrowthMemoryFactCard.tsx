import React from 'react';
import { CheckCircle2, Edit3, RotateCcw, XCircle } from 'lucide-react';
import type { HermesMemoryFact } from '../../services/memoryClient';

interface GrowthMemoryFactCardProps {
  fact: HermesMemoryFact;
  isEditing: boolean;
  editingText: string;
  onChangeEditingText: (val: string) => void;
  onStartEdit: () => void;
  onFeedback: (fact: HermesMemoryFact, action: 'confirm' | 'correct' | 'end' | 'revert') => void;
}

export const GrowthMemoryFactCard: React.FC<GrowthMemoryFactCardProps> = ({
  fact,
  isEditing,
  editingText,
  onChangeEditingText,
  onStartEdit,
  onFeedback,
}) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="space-y-1 flex-1">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
          {fact.category}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
          Trust {Math.round(fact.trustScore * 100)}%
        </span>
        {fact.entities.map((ent) => (
          <span
            key={ent}
            className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            {ent}
          </span>
        ))}
      </div>
      {isEditing ? (
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={editingText}
            onChange={(e) => onChangeEditingText(e.target.value)}
            className="flex-1 px-2.5 py-1 rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-xs"
          />
          <button
            type="button"
            onClick={() => onFeedback(fact, 'correct')}
            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
          >
            Save
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-800 dark:text-slate-100 font-medium">{fact.factText}</p>
      )}
    </div>

    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onFeedback(fact, 'confirm')}
        title="Confirm (+trust)"
        className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-400 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onStartEdit}
        title="Correct fact"
        className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-400 cursor-pointer"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      {fact.previousFactText && (
        <button
          type="button"
          onClick={() => onFeedback(fact, 'revert')}
          title="Revert to previous version"
          className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-400 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onFeedback(fact, 'end')}
        title="Archive / end fact"
        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-400 cursor-pointer"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  </div>
);
