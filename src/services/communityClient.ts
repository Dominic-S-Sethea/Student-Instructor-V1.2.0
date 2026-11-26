import { apiFetchRaw, apiGet, apiPost } from './apiClient';
import {
  ClientCommunity,
  ClientCommunityPost,
  ClientCommunityComment,
  ClientMentorProfile,
  ClientMentorshipSession,
  ClientStudentProject,
  ClientCampusEvent,
  ClientPartnerOrg,
  ClientContent,
} from '../types';

export interface CommunityRecommendationItem {
  id?: string;
  community_id?: string;
  matchScore?: number;
  matchReason?: string;
}

class CommunityClient {
  private baseUrl = '/api/community';

  public async getCommunities(category?: string): Promise<ClientCommunity[]> {
    const url = category && category !== 'ALL'
      ? `${this.baseUrl}/communities?category=${encodeURIComponent(category)}`
      : `${this.baseUrl}/communities`;
    return (await apiGet<ClientCommunity[]>(url)) || [];
  }

  public async getCommunityDetails(slug: string): Promise<ClientCommunity & { members: unknown[] }> {
    return apiGet<ClientCommunity & { members: unknown[] }>(`${this.baseUrl}/communities/${encodeURIComponent(slug)}`);
  }

  public async joinCommunity(communityId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/communities/${encodeURIComponent(communityId)}/join`, {});
  }

  public async leaveCommunity(communityId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/communities/${encodeURIComponent(communityId)}/leave`, {});
  }

  public async getStudentCommunities(studentId: string): Promise<ClientCommunity[]> {
    return (await apiGet<ClientCommunity[]>(`${this.baseUrl}/student/${encodeURIComponent(studentId)}/communities`)) || [];
  }

  public async getPosts(params: {
    communityId?: string;
    postType?: string;
    limit?: number;
    offset?: number;
    category?: string;
  }): Promise<ClientCommunityPost[]> {
    const qs = new URLSearchParams();
    if (params.communityId) qs.set('communityId', params.communityId);
    if (params.postType) qs.set('postType', params.postType);
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    const q = qs.toString();
    return (await apiGet<ClientCommunityPost[]>(`${this.baseUrl}/posts${q ? `?${q}` : ''}`)) || [];
  }

  public async createPost(postData: {
    community_id?: string;
    author_id?: string;
    author_name?: string;
    author_role?: string;
    post_type?: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
  }): Promise<{ post: ClientCommunityPost; notice?: string }> {
    const res = await apiFetchRaw<{ success: boolean; data: ClientCommunityPost; notice?: string }>(
      `${this.baseUrl}/posts`,
      { method: 'POST', body: JSON.stringify(postData) }
    );
    return { post: res.data, notice: res.notice };
  }

  public async upvotePost(postId: string): Promise<number> {
    const res = await apiPost<{ upvotes_count?: number; new_count?: number }>(
      `${this.baseUrl}/posts/${encodeURIComponent(postId)}/upvote`,
      {}
    );
    return res?.upvotes_count ?? res?.new_count ?? 0;
  }

  public async getPostComments(postId: string): Promise<ClientCommunityComment[]> {
    return (await apiGet<ClientCommunityComment[]>(`${this.baseUrl}/posts/${encodeURIComponent(postId)}/comments`)) || [];
  }

  public async addComment(
    postId: string,
    commentData: { content: string; parent_id?: string; author_id?: string; author_name?: string; author_role?: string }
  ): Promise<{ comment: ClientCommunityComment; notice?: string }> {
    const payload = {
      content: commentData.content,
      parent_comment_id: commentData.parent_id,
      author_id: commentData.author_id,
      author_name: commentData.author_name,
      author_role: commentData.author_role,
    };
    const res = await apiFetchRaw<{ success: boolean; data: ClientCommunityComment; notice?: string }>(
      `${this.baseUrl}/posts/${encodeURIComponent(postId)}/comments`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
    return { comment: res.data, notice: res.notice };
  }

  public async upvoteComment(commentId: string): Promise<number> {
    const res = await apiPost<{ upvotes_count?: number; new_count?: number }>(
      `${this.baseUrl}/comments/${encodeURIComponent(commentId)}/upvote`,
      {}
    );
    return res?.upvotes_count ?? res?.new_count ?? 0;
  }

  public async acceptAnswer(postId: string, commentId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/posts/${encodeURIComponent(postId)}/accept-answer/${encodeURIComponent(commentId)}`, {});
  }

  public async bookMentor(bookingData: {
    mentor_id: string;
    student_id?: string;
    student_name?: string;
    topic: string;
    session_type?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    student_notes?: string;
  }): Promise<ClientMentorshipSession> {
    return apiPost<ClientMentorshipSession>(`${this.baseUrl}/mentors/book`, bookingData);
  }

  public async getMentorSessions(studentId: string): Promise<ClientMentorshipSession[]> {
    return (await apiGet<ClientMentorshipSession[]>(`${this.baseUrl}/students/${encodeURIComponent(studentId)}/sessions`)) || [];
  }

  public async getProjects(params: { category?: string; stage?: string; limit?: number; offset?: number }): Promise<ClientStudentProject[]> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) qs.set(k, String(v));
    });
    return (await apiGet<ClientStudentProject[]>(`${this.baseUrl}/projects?${qs.toString()}`)) || [];
  }

  public async getProjectBySlug(slug: string): Promise<ClientStudentProject> {
    return apiGet<ClientStudentProject>(`${this.baseUrl}/projects/${encodeURIComponent(slug)}`);
  }

  public async joinProject(
    projectId: string,
    options?: { user_id?: string; user_name?: string; role_in_project?: string }
  ): Promise<void> {
    await apiPost(`${this.baseUrl}/projects/${encodeURIComponent(projectId)}/join`, options || {});
  }

  public async upvoteProject(projectId: string): Promise<number> {
    const res = await apiPost<{ upvotes_count?: number; new_count?: number }>(
      `${this.baseUrl}/projects/${encodeURIComponent(projectId)}/upvote`,
      {}
    );
    return res?.upvotes_count ?? res?.new_count ?? 0;
  }

  public async rsvpEvent(eventId: string, options: { response: 'yes' | 'no' | 'maybe'; notes?: string }): Promise<void> {
    await apiPost(`${this.baseUrl}/events/${encodeURIComponent(eventId)}/rsvp`, options);
  }

  public async getEvents(category?: string): Promise<ClientCampusEvent[]> {
    return (await apiGet<ClientCampusEvent[]>(`${this.baseUrl}/events${category ? `?eventType=${encodeURIComponent(category)}` : ''}`)) || [];
  }

  public async getMentors(category?: string): Promise<ClientMentorProfile[]> {
    return (await apiGet<ClientMentorProfile[]>(`${this.baseUrl}/mentors${category ? `?badge=${encodeURIComponent(category)}` : ''}`)) || [];
  }

  public async getAIMRecommendations(studentId: string): Promise<{
    communities: CommunityRecommendationItem[];
    mentors: Array<{ id: string; matchScore?: number; matchReason?: string }>;
  }> {
    const res = await apiGet<{
      communities?: CommunityRecommendationItem[];
      mentors?: Array<{ id: string; matchScore?: number; matchReason?: string }>;
    }>(`${this.baseUrl}/ai-recommendations?studentId=${encodeURIComponent(studentId)}`);
    return {
      communities: Array.isArray(res?.communities) ? res.communities : [],
      mentors: Array.isArray(res?.mentors) ? res.mentors : [],
    };
  }

  public async getStudentSessions(studentId: string): Promise<ClientMentorshipSession[]> {
    return (await apiGet<ClientMentorshipSession[]>(`${this.baseUrl}/students/${encodeURIComponent(studentId)}/sessions`)) || [];
  }

  public async reportModeration(reportData: { report_type: string; content_id: string; description: string }): Promise<void> {
    await apiPost(`${this.baseUrl}/moderation/report`, {
      reported_item_type: reportData.report_type,
      reported_item_id: reportData.content_id,
      reason: 'inappropriate_content',
      description: reportData.description,
    });
  }

  public async submitReport(reportData: { reporter_id?: string; reported_item_type: string; reported_item_id: string; reason: string; description?: string }): Promise<void> {
    await apiPost(`${this.baseUrl}/moderation/report`, reportData);
  }

  public async getContentCatalog(category?: string): Promise<ClientContent[]> {
    return (await apiGet<ClientContent[]>(`/api/learning/content${category ? `?category_id=${encodeURIComponent(category)}` : ''}`)) || [];
  }

  public async getProjectDetails(projectSlug: string): Promise<ClientStudentProject> {
    return apiGet<ClientStudentProject>(`${this.baseUrl}/projects/${encodeURIComponent(projectSlug)}`);
  }

  public async getOrganizations(category?: string): Promise<ClientPartnerOrg[]> {
    return (await apiGet<ClientPartnerOrg[]>(`${this.baseUrl}/organizations${category ? `?orgType=${encodeURIComponent(category)}` : ''}`)) || [];
  }
}

export const communityClient = new CommunityClient();
