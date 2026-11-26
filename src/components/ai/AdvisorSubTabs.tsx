import React from 'react';
import { Award, Bot, Brain, Database, Sparkles } from 'lucide-react';

export type AIAdvisorSubTab =
  | 'chat'
  | 'growth-memory'
  | 'recommendations'
  | 'education-os'
  | 'knowledge'
  | 'memory';

interface AdvisorSubTabsProps {
  activeSubTab: AIAdvisorSubTab;
  onSelectSubTab: (tab: AIAdvisorSubTab) => void;
  showAdvancedTools: boolean;
  isKhmer: boolean;
  isAdmin: boolean;
  authenticated: boolean;
}

const inactiveClass =
  'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800';

export const AdvisorSubTabs: React.FC<AdvisorSubTabsProps> = ({
  activeSubTab,
  onSelectSubTab,
  showAdvancedTools,
  isKhmer,
  isAdmin,
  authenticated,
}) => (
  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
    <button
      type="button"
      onClick={() => onSelectSubTab('chat')}
      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
        activeSubTab === 'chat' ? 'bg-blue-600 text-white border-blue-600' : inactiveClass
      }`}
    >
      <Bot className="w-4 h-4" />
      <span>{isKhmer ? 'ជជែកសិក្សា' : 'Study Chat'}</span>
    </button>

    <button
      type="button"
      onClick={() => onSelectSubTab('growth-memory')}
      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
        activeSubTab === 'growth-memory' ? 'bg-emerald-600 text-white border-emerald-600' : inactiveClass
      }`}
    >
      <Brain className="w-4 h-4" />
      <span>{isKhmer ? 'ការចងចាំការសិក្សា' : 'My Growth Memory'}</span>
    </button>

    <button
      type="button"
      onClick={() => onSelectSubTab('recommendations')}
      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
        activeSubTab === 'recommendations' ? 'bg-blue-600 text-white border-blue-600' : inactiveClass
      }`}
    >
      <Award className="w-4 h-4" />
      <span>{isKhmer ? 'ការណែនាំ' : 'Recommendations'}</span>
    </button>

    {showAdvancedTools && (
      <>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onSelectSubTab('education-os')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
              activeSubTab === 'education-os' ? 'bg-blue-600 text-white border-blue-600' : inactiveClass
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Personal Education OS</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelectSubTab('knowledge')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
            activeSubTab === 'knowledge' ? 'bg-blue-600 text-white border-blue-600' : inactiveClass
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{isKhmer ? 'ស្វែងរកចំណេះដឹង' : 'Knowledge Search'}</span>
        </button>
        {authenticated && (
          <button
            type="button"
            onClick={() => onSelectSubTab('memory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
              activeSubTab === 'memory' ? 'bg-blue-600 text-white border-blue-600' : inactiveClass
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Memory</span>
          </button>
        )}
      </>
    )}
  </div>
);
