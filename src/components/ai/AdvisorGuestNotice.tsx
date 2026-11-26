import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

interface AdvisorGuestNoticeProps {
  variant?: 'recommendations' | 'memory';
  isKhmer: boolean;
  onOpenAuthModal?: () => void;
  onBackToChat?: () => void;
}

export const AdvisorGuestNotice: React.FC<AdvisorGuestNoticeProps> = ({
  variant = 'recommendations',
  isKhmer,
  onOpenAuthModal,
  onBackToChat,
}) => {
  const isMemory = variant === 'memory';
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
      <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
        {isMemory ? <Lock className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          {isMemory
            ? isKhmer ? 'សូមចូលគណនីដើម្បីបើកការចងចាំការសិក្សា' : 'Sign in to enable My Growth Memory'
            : isKhmer ? 'ការណែនាំផ្ទាល់ខ្លួនសម្រាប់ការសិក្សា' : 'Personalized Study Recommendations'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {isMemory
            ? isKhmer
              ? 'ទីប្រឹក្សាសិក្សានឹងចងចាំវិធីសិក្សា សាកលវិទ្យាល័យគោលដៅ និងគោលដៅ Bac II របស់អ្នកនៅពេលអ្នកចូលគណនី និងបើកការយល់ព្រម។'
              : 'Study Advisor remembers your study style, target universities, and Bac II milestones across sessions once you sign in and enable AI memory consent.'
            : isKhmer
              ? 'សូមចូលគណនីដើម្បីទទួលបានការណែនាំមុខជំនាញ អាហារូបករណ៍ និងផែនការសិក្សាផ្ទាល់ខ្លួន។'
              : 'Sign in or create a free student account to unlock personalized major, career, and scholarship recommendations.'}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2.5 flex-wrap pt-1">
        {onOpenAuthModal && (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
          >
            {isKhmer ? 'ចូលឬបង្កើតគណនី' : 'Sign In / Create Free Account'}
          </button>
        )}
        {onBackToChat && (
          <button
            type="button"
            onClick={onBackToChat}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold cursor-pointer"
          >
            {isKhmer ? 'ត្រឡប់ទៅជជែកសិក្សា' : 'Back to Study Chat'}
          </button>
        )}
      </div>
    </div>
  );
};
