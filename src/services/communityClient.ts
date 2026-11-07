import { apiGet, apiPost } from "./apiClient";
import {
  ClientCommunity,
  ClientCommunityPost,
  ClientCommunityComment,
  ClientMentorProfile,
  ClientMentorshipSession,
  ClientStudentProject,
  ClientCampusEvent,
  ClientPartnerOrg,
  ClientModerationReport,
  ClientMentor,
  ClientStudentSession,
  ClientContent,
  ClientCommunityProject,
} from "../types";

class CommunityClient {
  private baseUrl = "/api/community";

  public async getCommunities(category?: string): Promise<ClientCommunity[]> {
    const url = category && category !== "ALL"
      ? `${this.baseUrl}/communities?category=${encodeURIComponent(category)}`
      : `${this.baseUrl}/communities`;
    const res = await apiGet(url);
    if (!res.ok) throw new Error("Failed to fetch communities");
    const json = await res.json();
    return json.data || [];
  }

  public async getCommunityDetails(slug: string): Promise<ClientCommunity & { members: any[] }> {
    const res = await apiGet(`${this.baseUrl}/communities/${slug}`);
    if (!res.ok) throw new Error("Failed to fetch community details");
    const json = await res.json();
    return json.data;
  }

  public async joinCommunity(communityId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/communities/${communityId}/join`);
  }

  public async leaveCommunity(communityId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/communities/${communityId}/leave`);
  }

  public async getStudentCommunities(studentId: string): Promise<ClientCommunity[]> {
    const res = await apiGet(`${this.baseUrl}/student/${studentId}/communities`);
    if (!res.ok) throw new Error("Failed to fetch student communities");
    const json = await res.json();
    return json.data || [];
  }

  public async getPosts(params: { limit?: number; offset?: number; category?: string }): Promise<ClientCommunityPost[]> {
    const url = `${this.baseUrl}/posts?${new URLSearchParams(params as Record<string, string>).toString()}`;
    const res = await apiGet(url);
    if (!res.ok) throw new Error("Failed to fetch posts");
    const json = await res.json();
    return json.data || [];
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
  }): Promise<ClientCommunityPost> {
    const res = await apiPost(`${this.baseUrl}/posts`, postData);
    if (!res.ok) throw new Error("Failed to create post");
    const json = await res.json();
    return json.data;
  }

  public async upvotePost(postId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/posts/${postId}/upvote`);
  }

  public async getPostComments(postId: string): Promise<ClientCommunityComment[]> {
    const res = await apiGet(`${this.baseUrl}/posts/${postId}/comments`);
    if (!res.ok) throw new Error("Failed to fetch post comments");
    const json = await res.json();
    return json.data || [];
  }

  public async addComment(postId: string, commentData: { content: string; parent_id?: string; author_id?: string; author_name?: string; author_role?: string }): Promise<ClientCommunityComment> {
    const res = await apiPost(`${this.baseUrl}/posts/${postId}/comments`, commentData);
    if (!res.ok) throw new Error("Failed to add comment");
    const json = await res.json();
    return json.data;
  }

  public async upvoteComment(commentId: string): Promise<number> {
    const res = await apiPost(`${this.baseUrl}/comments/${commentId}/upvote`);
    const json = await res.json();
    return json.data?.new_count ?? 0;
  }

  public async acceptAnswer(postId: string, commentId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/posts/${postId}/accept-answer/${commentId}`);
  }

  public async bookMentor(bookingData: { mentor_id: string; student_id: string; student_name?: string; topic: string; session_type?: string; scheduled_date?: string; scheduled_time?: string; student_notes?: string }): Promise<ClientMentorshipSession> {
    const res = await apiPost(`${this.baseUrl}/mentors/book`, bookingData);
    if (!res.ok) throw new Error("Failed to book mentorship session");
    const json = await res.json();
    return json.data;
  }

  public async getMentorSessions(studentId: string): Promise<ClientMentorshipSession[]> {
    const res = await apiGet(`${this.baseUrl}/students/${studentId}/sessions`);
    if (!res.ok) throw new Error("Failed to fetch mentor sessions");
    const json = await res.json();
    return json.data || [];
  }

  public async getProjects(params: { category?: string; stage?: string; limit?: number; offset?: number }): Promise<ClientStudentProject[]> {
    const url = `${this.baseUrl}/projects?${new URLSearchParams(params as Record<string, string>).toString()}`;
    const res = await apiGet(url);
    if (!res.ok) throw new Error("Failed to fetch projects");
    const json = await res.json();
    return json.data || [];
  }

  public async getProjectBySlug(slug: string): Promise<ClientStudentProject> {
    const res = await apiGet(`${this.baseUrl}/projects/${slug}`);
    if (!res.ok) throw new Error("Failed to fetch project");
    const json = await res.json();
    return json.data;
  }

  public async joinProject(
    projectId: string,
    options?: { user_id: string; user_name: string; role_in_project: string }
  ): Promise<void> {
    const payload = options
      ? { user_id: options.user_id, user_name: options.user_name, role_in_project: options.role_in_project }
      : undefined;
    await apiPost(`${this.baseUrl}/projects/${projectId}/join`, payload);
  }

  public async upvoteProject(projectId: string, memberId?: string): Promise<number> {
    const userId = memberId || 'usr-anonymous';
    const res = await apiPost(`${this.baseUrl}/projects/${projectId}/upvote`, { member_id: userId });
    if (!res.ok) throw new Error("Failed to upvote project");
    const json = await res.json();
    return json.data?.new_count ?? 0;
  }

  public async rsvpEvent(eventId: string, options: { response: "yes" | "no" | "maybe"; notes?: string }): Promise<void> {
    await apiPost(`${this.baseUrl}/events/${eventId}/rsvp`, options);
  }

  public async getEvents(category?: string): Promise<ClientCampusEvent[]> {
    const res = await apiGet(`${this.baseUrl}/events${category ? `?category=${category}` : ''}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    const json = await res.json();
    return json.data || [];
  }

  public async getMentors(category?: string): Promise<ClientMentorProfile[]> {
    const res = await apiGet(`${this.baseUrl}/mentors${category ? `?category=${category}` : ''}`);
    if (!res.ok) throw new Error("Failed to fetch mentors");
    const json = await res.json();
    return json.data || [];
  }

  public async getAIMRecommendations(studentId: string): Promise<{ mentors: { id: string; matchScore?: number; matchReason?: string }[] }> {
    const res = await apiGet(`${this.baseUrl}/ai-recommendations?studentId=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch AI recommendations");
    const json = await res.json();
    return json.data || { mentors: [] };
  }

  public async getStudentSessions(studentId: string): Promise<ClientMentorshipSession[]> {
    const res = await apiGet(`${this.baseUrl}/student-sessions?studentId=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch student sessions");
    const json = await res.json();
    return json.data || [];
  }

  public async reportModeration(reportData: { report_type: string; content_id: string; description: string }): Promise<void> {
    await apiPost(`${this.baseUrl}/moderation/report`, reportData);
  }

  public async submitReport(reportData: { reporter_id: string; reported_item_type: string; reported_item_id: string; reason: string; description?: string }): Promise<void> {
    await apiPost(`${this.baseUrl}/moderation/report`, reportData);
  }

  public async getContentCatalog(category?: string): Promise<ClientContent[]> {
    const res = await apiGet(`${this.baseUrl}/content/catalog${category ? `?category=${category}` : ''}`);
    if (!res.ok) throw new Error("Failed to fetch content catalog");
    const json = await res.json();
    return json.data || [];
  }

  public async getProjectDetails(projectSlug: string): Promise<ClientStudentProject> {
    const res = await apiGet(`${this.baseUrl}/projects/${projectSlug}`);
    if (!res.ok) throw new Error("Failed to fetch project details");
    const json = await res.json();
    return json.data;
  }

  public async getOrganizations(category?: string): Promise<ClientPartnerOrg[]> {
    const res = await apiGet(`${this.baseUrl}/organizations${category ? `?category=${category}` : ''}`);
    if (!res.ok) throw new Error("Failed to fetch organizations");
    const json = await res.json();
    return json.data || [];
  }
}

export const communityClient = new CommunityClient();
