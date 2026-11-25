import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Briefcase,
  Award,
  CheckCircle2,
  ExternalLink,
  Star,
  ThumbsUp,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  Filter
} from 'lucide-react';
import { ClientAIRecommendation } from '../../types';
import { apiFetchRaw } from '../../services/apiClient';

interface AIRecommendationsViewProps {
  studentId: string;
  onNavigateTab?: (tab: string) => void;
}

export const AIRecommendationsView: React.FC<AIRecommendationsViewProps> = ({
  studentId,
  onNavigateTab
}) => {
  const [recommendations, setRecommendations] = useState<ClientAIRecommendation[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'learning' | 'career' | 'scholarship'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSuccessToast, setFeedbackSuccessToast] = useState<string | null>(null);

  const fetchRecommendations = async (forceRefresh = false): Promise<void> => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiFetchRaw<{ recommendations?: ClientAIRecommendation[] }>('/api/ai/recommend', {
        method: 'POST',
        body: JSON.stringify({ studentId, forceRefresh })
      });
      if (data && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleActionClick = async (rec: ClientAIRecommendation): Promise<void> => {
    try {
      await apiFetchRaw('/api/ai/feedback', {
        method: 'POST',
        body: JSON.stringify({ recommendationId: rec.id, action: 'clicked' })
      });
      setRecommendations(prev =>
        prev.map(r => (r.id === rec.id ? { ...r, status: 'clicked' } : r))
      );
    } catch {
      // Non-blocking telemetry click feedback
    }

    if (rec.action_link && onNavigateTab) {
      if (rec.action_link.includes('stem-lab') || rec.action_link.includes('learning')) {
        onNavigateTab('stem-discovery');
      } else if (rec.action_link.includes('scholarship')) {
        onNavigateTab('scholarships');
      } else if (rec.action_link.includes('opportunities')) {
        onNavigateTab('opportunities');
      }
    }
  };

  const handleCompleteClick = async (recId: string): Promise<void> => {
    try {
      const data = await apiFetchRaw<{ success?: boolean; recommendation?: ClientAIRecommendation }>('/api/ai/feedback', {
        method: 'POST',
        body: JSON.stringify({ recommendationId: recId, action: 'completed' })
      });
      if (data.success && data.recommendation) {
        const updated = data.recommendation;
        setRecommendations(prev =>
          prev.map(r => (r.id === recId ? updated : r))
        );
        setFeedbackSuccessToast('Recommendation marked as Completed! AI priority re-weighted.');
        setTimeout(() => setFeedbackSuccessToast(null), 3500);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to complete recommendation.');
    }
  };

  const submitRatingFeedback = async (recId: string): Promise<void> => {
    try {
      const data = await apiFetchRaw<{ success?: boolean; recommendation?: ClientAIRecommendation }>('/api/ai/feedback', {
        method: 'POST',
        body: JSON.stringify({
          recommendationId: recId,
          action: 'clicked',
          rating: feedbackRating,
          comments: feedbackComment
        })
      });
      if (data.success && data.recommendation) {
        const updated = data.recommendation;
        setRecommendations(prev =>
          prev.map(r => (r.id === recId ? updated : r))
        );
        setActiveFeedbackId(null);
        setFeedbackComment('');
        setFeedbackSuccessToast('Thank you! Your feedback helps the AI personalize future guidance.');
        setTimeout(() => setFeedbackSuccessToast(null), 3500);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit rating feedback.');
    }
  };

  const filteredRecs = recommendations.filter(r => {
    if (filterType === 'all') return true;
    return r.recommendation_type === filterType;
  });

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-medium">
          {errorMsg}
        </div>
      )}
      {/* Toast */}
      {feedbackSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Personalized Intelligence Recommendations</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Synthesized dynamically from your learning logs, STEM virtual lab performance, and national scholarship eligibility.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({recommendations.length})
            </button>
            <button
              onClick={() => setFilterType('learning')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'learning' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Learning
            </button>
            <button
              onClick={() => setFilterType('career')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'career' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Career
            </button>
            <button
              onClick={() => setFilterType('scholarship')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'scholarship' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Scholarship
            </button>
          </div>

          <button
            onClick={() => fetchRecommendations(true)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-stone-200"
            title="Re-run AI recommendation engine"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-sm">Synthesizing personalized education recommendations...</p>
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="p-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
          <Filter className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="font-semibold text-sm">No recommendations in this category</p>
          <p className="text-xs text-stone-400 mt-1">Switch filter back to "All" to view learning and career paths.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
            const isLearning = rec.recommendation_type === 'learning';
            const isCareer = rec.recommendation_type === 'career';
            const isScholarship = rec.recommendation_type === 'scholarship';

            const typeColor = isLearning
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : isCareer
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            const TypeIcon = isLearning ? BookOpen : isCareer ? Briefcase : Award;

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${typeColor}`}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      <span className="capitalize">{rec.recommendation_type}</span>
                    </span>

                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-stone-600 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{Math.round(rec.priority_score)}% Match</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm mb-1 leading-snug">{rec.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">{rec.description}</p>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 mb-4">
                    <p className="text-[11px] text-amber-900">
                      <strong className="font-semibold text-amber-950">AI Match Context:</strong> {rec.match_reason}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-col space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleActionClick(rec)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <span>{rec.action_label || 'Explore Now'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center space-x-1.5">
                      {rec.status === 'completed' ? (
                        <span className="text-[11px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteClick(rec.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium flex items-center space-x-1 transition-colors"
                          title="Mark this activity as completed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
                          <span className="hidden sm:inline">Mark Complete</span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveFeedbackId(activeFeedbackId === rec.id ? null : rec.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium flex items-center space-x-1 transition-colors"
                        title="Provide AI feedback"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                        <span className="hidden sm:inline">Feedback</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback Form Accordion */}
                  {activeFeedbackId === rec.id && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2.5 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-700">How helpful is this recommendation?</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="focus:outline-hidden"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= feedbackRating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-stone-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Optional comment: Why was this helpful or not helpful?"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setActiveFeedbackId(null)}
                          className="px-2 py-1 text-stone-500 hover:text-stone-800 text-[11px]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitRatingFeedback(rec.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
