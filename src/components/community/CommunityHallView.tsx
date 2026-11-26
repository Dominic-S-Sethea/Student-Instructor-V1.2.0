import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Sparkles,
  Search,
  Plus,
  ThumbsUp,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Pin,
  Cpu,
  GraduationCap,
  Leaf,
  Dna,
  Code,
  Award,
  Send,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ClientCommunity, ClientCommunityPost, ClientCommunityComment } from '../../types';
import { communityClient } from '../../services/communityClient';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onOpenReportModal: (itemType: string, itemId: string) => void;
}

export const CommunityHallView: React.FC<Props> = ({ onOpenReportModal }) => {
  const { authenticated, user, profile } = useAuth();
  const [communities, setCommunities] = useState<ClientCommunity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCommunity, setSelectedCommunity] = useState<ClientCommunity | null>(null);
  const [posts, setPosts] = useState<ClientCommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ClientCommunityPost | null>(null);
  const [comments, setComments] = useState<ClientCommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create post modal state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPostType, setNewPostType] = useState('question');
  const [newTags, setNewTags] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [safetyNotice, setSafetyNotice] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  // New comment state
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const currentUserId = user?.id || '';
  const currentUserName = profile?.name || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    void loadCommunitiesAndPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, filterType, authenticated, currentUserId]);

  const loadCommunitiesAndPosts = async (): Promise<void> => {
    try {
      setLoading(true);
      const [commsData, aiRecs, postsData] = await Promise.all([
        communityClient.getCommunities(selectedCategory),
        authenticated && currentUserId
          ? communityClient.getAIMRecommendations(currentUserId).catch(() => ({ communities: [], mentors: [] }))
          : Promise.resolve({ communities: [], mentors: [] }),
        communityClient.getPosts({
          communityId: selectedCommunity?.id,
          postType: filterType !== 'ALL' ? filterType : undefined,
        }),
      ]);

      const commMap = new Map<string, ClientCommunity>();
      commsData.forEach((c) => commMap.set(c.id, c));
      aiRecs.communities.forEach((c) => {
        const cid = c.community_id || c.id;
        if (cid && commMap.has(cid)) {
          commMap.set(cid, {
            ...commMap.get(cid)!,
            matchScore: c.matchScore || 0,
            matchReason: c.matchReason || 'Suggested for you',
          });
        }
      });

      const mergedComms = Array.from(commMap.values()).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setCommunities(mergedComms);
      setPosts(postsData);
    } catch (err) {
      console.error('Error loading community hall data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommunity = async (comm: ClientCommunity | null): Promise<void> => {
    setSelectedCommunity(comm);
    setSelectedPost(null);
    try {
      const fetchedPosts = await communityClient.getPosts({
        communityId: comm?.id,
        postType: filterType !== 'ALL' ? filterType : undefined,
        limit: 50,
      });
      setPosts(fetchedPosts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPost = async (post: ClientCommunityPost): Promise<void> => {
    setSelectedPost(post);
    try {
      const cmts = await communityClient.getPostComments(post.id);
      setComments(cmts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpvotePost = async (postId: string, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    try {
      const newCount = await communityClient.upvotePost(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, upvotes_count: newCount || p.upvotes_count + 1 } : p)));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost((prev) => (prev ? { ...prev, upvotes_count: newCount || prev.upvotes_count + 1 } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvoteComment = async (commentId: string): Promise<void> => {
    try {
      const newCount = await communityClient.upvoteComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, upvotes_count: newCount || c.upvotes_count + 1 } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAccepted = async (commentId: string): Promise<void> => {
    if (!selectedPost) return;
    try {
      await communityClient.acceptAnswer(selectedPost.id, commentId);
      setComments((prev) =>
        prev.map((c) => ({
          ...c,
          is_accepted_answer: c.id === commentId ? 1 : 0,
        }))
      );
      setSelectedPost((prev) => (prev ? { ...prev, is_solved: 1, solved_comment_id: commentId } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePostSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!authenticated) {
      setPostError('Please sign in to post in the student community.');
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      setPostError('Please enter both a title and details.');
      return;
    }

    const targetCommunityId = selectedCommunity?.id || communities[0]?.id || 'comm-bacii-stem';
    try {
      setSubmittingPost(true);
      setPostError(null);
      setSafetyNotice(null);

      const tagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      const result = await communityClient.createPost({
        community_id: targetCommunityId,
        author_id: currentUserId,
        author_name: currentUserName,
        author_role: profile?.education_level || 'Student',
        post_type: newPostType,
        title: newTitle,
        content: newContent,
        tags: tagsArray,
      });

      if (result.notice) {
        setSafetyNotice(result.notice);
      }

      if (result.post) {
        setPosts((prev) => [result.post, ...prev]);
      }
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setTimeout(() => {
        setShowCreatePost(false);
        setSafetyNotice(null);
      }, 1500);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to submit post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleAddCommentSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPost) return;

    try {
      setSubmittingComment(true);
      const result = await communityClient.addComment(selectedPost.id, {
        author_id: currentUserId,
        author_name: currentUserName,
        author_role: 'Student Collaborator',
        content: newCommentText,
      });

      if (result.comment) {
        setComments((prev) => [...prev, result.comment]);
      }
      setNewCommentText('');
      setSelectedPost((prev) => (prev ? { ...prev, comments_count: prev.comments_count + 1 } : null));
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Could not post reply');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai_robotics': return <Cpu className="w-4 h-4" />;
      case 'stem_prep': return <GraduationCap className="w-4 h-4" />;
      case 'scholarships': return <Award className="w-4 h-4" />;
      case 'clean_energy': return <Leaf className="w-4 h-4" />;
      case 'biotech_health': return <Dna className="w-4 h-4" />;
      case 'software_dev': return <Code className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Academic Communities Carousel / Directory */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Academic Circles & Study Clubs</h3>
            <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-200">
              {communities.length} Active Hubs
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedCommunity && (
              <button
                onClick={() => handleSelectCommunity(null)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition"
              >
                View All Communities
              </button>
            )}
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {communities.slice(0, 4).map((comm) => {
            const isSelected = selectedCommunity?.id === comm.id;
            return (
              <div
                key={comm.id}
                onClick={() => handleSelectCommunity(isSelected ? null : comm)}
                className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: comm.color || '#2563eb' }}
                  >
                    {getCategoryIcon(comm.category)}
                  </div>
                  {comm.matchScore && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> {comm.matchScore}% Match
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{comm.name}</h4>
                  {comm.name_km && <p className="text-xs text-slate-500 line-clamp-1">{comm.name_km}</p>}
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{comm.description}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{comm.member_count} scholars</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{comm.post_count} discussions</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Forum Interaction Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Discussions Feed (or Single Post Details) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type:</span>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'question', 'discussion', 'resource', 'project_showcase'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      communityClient.getPosts({ category: type !== 'ALL' ? type : undefined }).then(setPosts);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                      filterType === type
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'ALL' ? 'All Feed' : type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCreatePost(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition self-stretch sm:self-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Start Discussion / Ask
            </button>
          </div>

          {/* If a Post is Selected: Show Detailed Thread */}
          {selectedPost ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  ← Back to Discussion Feed
                </button>
                <button
                  onClick={() => onOpenReportModal('post', selectedPost.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Flag for Review
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {selectedPost.post_type}
                  </span>
                  {selectedPost.is_solved === 1 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Solved by Peer
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 leading-snug">{selectedPost.title}</h2>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                  <img
                    src={selectedPost.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={selectedPost.author_name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{selectedPost.author_name}</h5>
                    <p className="text-[11px] text-slate-500">{selectedPost.author_role}</p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {selectedPost.content}
                </div>

                {selectedPost.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(typeof selectedPost.tags === 'string' ? JSON.parse(selectedPost.tags) : selectedPost.tags).map((tag: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={(e) => handleUpvotePost(selectedPost.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> {selectedPost.upvotes_count} Upvotes
                  </button>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> {comments.length} Academic Peer Responses
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Peer Solutions & Discussion</span>
                  <span className="text-xs font-normal text-slate-500">({comments.length})</span>
                </h4>

                {comments.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No replies yet. Be the first scholar to share a solution or perspective!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl border transition-all ${
                        comment.is_accepted_answer === 1
                          ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={comment.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={comment.author_name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">{comment.author_name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">({comment.author_role})</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {comment.is_accepted_answer === 1 ? (
                          <span className="text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Accepted Solution
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkAccepted(comment.id)}
                            className="text-[11px] text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition flex items-center gap-1"
                          >
                            Mark as Solution
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-slate-800 mt-2.5 leading-relaxed whitespace-pre-line pl-9">
                        {comment.content}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 pl-9 text-xs">
                        <button
                          onClick={() => handleUpvoteComment(comment.id)}
                          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition font-medium"
                        >
                          <ThumbsUp className="w-3 h-3" /> {comment.upvotes_count} helpful
                        </button>
                        <button
                          onClick={() => onOpenReportModal('comment', comment.id)}
                          className="text-[11px] text-slate-400 hover:text-rose-600"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Add Reply Form */}
                <form onSubmit={handleAddCommentSubmit} className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Write an Academic Response</span>
                    <span className="text-[10px] text-slate-400">(All responses are screened for academic integrity)</span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Explain your approach, cite formulas or textbooks, and guide fellow scholars..."
                      rows={3}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !newCommentText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Post Solution
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Post Feed List */
            <div className="space-y-3">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                  Loading academic discussions...
                </div>
              ) : posts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">No discussions in this category yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Be the first scholar to ask a question or start a topic!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handleSelectPost(post)}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {post.is_pinned === 1 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                          {post.post_type}
                        </span>
                        {post.is_solved === 1 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Solved
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mt-2 hover:text-blue-600 transition">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={post.author_name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-slate-800">{post.author_name}</span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">({post.author_role})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleUpvotePost(post.id, e)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-slate-50"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> {post.upvotes_count}
                        </button>
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <MessageSquare className="w-3.5 h-3.5" /> {post.comments_count} answers
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: AI Community Affinity & Safety Guidelines */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Community Recommendation Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-800/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">AI Community Intelligence</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Based on your top aptitude in STEM logic and AI Systems engineering goals, CDES AI connects you with peer study circles with highest academic alignment.
            </p>

            <div className="mt-4 space-y-2">
              {communities.filter(c => c.matchScore && c.matchScore >= 90).map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCommunity(c)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white line-clamp-1">{c.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300">
                      {c.matchScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{c.matchReason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Integrity & Safety Rules */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-sm text-slate-900">Community Honor Code</h4>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Explain the concepts</strong>: Guide peers towards answers; do not paste straight homework answers without steps.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>No contact solicitation</strong>: Direct phone numbers or private telegram links are blocked for student privacy.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Academic honesty</strong>: Promoting exam cheating or fraudulent test keys triggers immediate platform suspension.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Create Post */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Start an Academic Topic or Ask</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {safetyNotice && (
              <div className="my-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{safetyNotice}</span>
              </div>
            )}

            {postError && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {postError}
              </div>
            )}

            <form onSubmit={handleCreatePostSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Post Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {['question', 'discussion', 'resource', 'project_showcase'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewPostType(type)}
                      className={`py-1.5 text-xs font-medium rounded-lg capitalize border ${
                        newPostType === type
                          ? 'bg-blue-50 text-blue-600 border-blue-300 font-semibold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Question</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to solve Bac II 2024 calculus integration by parts?"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Problem Context</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Provide context, formulas you attempted, and where you are stuck..."
                  rows={4}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. BacII, Calculus, MoEYS"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submittingPost ? 'Verifying & Posting...' : 'Publish to Scholars'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
