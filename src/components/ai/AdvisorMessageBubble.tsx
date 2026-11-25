import React from 'react';
import Markdown from 'react-markdown';
import {
  ArrowRight,
  Bot,
  Brain,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Globe,
  User,
  Wrench,
} from 'lucide-react';
import type { ChatMessage } from '../../types';
import { getSafeHttpUrl } from '../../utils/safeUrl';

interface AdvisorMessageBubbleProps {
  message: ChatMessage;
  isSourcesExpanded: boolean;
  onToggleSources: () => void;
  onSelectQuestion: (q: string) => void;
}

export const AdvisorMessageBubble: React.FC<AdvisorMessageBubbleProps> = ({
  message,
  isSourcesExpanded,
  onToggleSources,
  onSelectQuestion,
}) => {
  const isUser = message.sender === 'user';
  const totalSources = (message.retrievedSources?.length || 0) + (message.webSources?.length || 0);

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white ${
          isUser ? 'bg-slate-800 dark:bg-slate-700' : 'bg-blue-600'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
          isUser
            ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-tr-none'
            : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none space-y-3'
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.text}</div>
        ) : (
          <div className="space-y-2 leading-relaxed [&_h3]:text-base [&_h3]:font-bold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline">
            <Markdown>{message.text}</Markdown>
          </div>
        )}

        {!isUser && ((message.toolsUsed && message.toolsUsed.length > 0) || (message.memoryUpdates && message.memoryUpdates.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.toolsUsed?.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100/80 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800"
              >
                <Wrench className="w-3 h-3" />
                <span>{tool}</span>
              </span>
            ))}
            {message.memoryUpdates?.map((mem, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800"
              >
                <Brain className="w-3 h-3" />
                <span>Memory updated</span>
              </span>
            ))}
          </div>
        )}

        {totalSources > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button
              type="button"
              onClick={onToggleSources}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{totalSources} Grounded Source(s)</span>
              {isSourcesExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {isSourcesExpanded && (
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {message.retrievedSources?.map((src) => {
                  const safeSrcUrl = getSafeHttpUrl(src.url);
                  return (
                    <div key={`${src.category}-${src.id}`} className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">{src.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {src.category} &middot; {src.source}
                        </div>
                      </div>
                      {safeSrcUrl && (
                        <a
                          href={safeSrcUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${src.title}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
                {message.webSources?.map((web) => {
                  const safeWebUrl = getSafeHttpUrl(web.url);
                  if (!safeWebUrl) return null;
                  return (
                    <a
                      key={safeWebUrl}
                      href={safeWebUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 hover:border-blue-400"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{web.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{safeWebUrl}</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div className="pt-2 space-y-1.5 border-t border-slate-200/70 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Quick Follow-Ups:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectQuestion(q)}
                  className="text-left text-xs bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
