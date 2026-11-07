import { getDatabase } from '../db/connection';

export class CommunityRepository {
  // ==========================================
  // 1. COMMUNITIES
  // ==========================================

  public getAllCommunities(category?: string) {
    const db = getDatabase();
    if (category && category !== 'ALL') {
      return db.prepare('SELECT * FROM communities WHERE category = ? ORDER BY member_count DESC').all(category);
    }
    return db.prepare('SELECT * FROM communities ORDER BY member_count DESC').all();
  }

  public getCommunityBySlug(slug: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM communities WHERE slug = ?').get(slug);
  }

  public getCommunityById(id: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM communities WHERE id = ?').get(id);
  }

  public getCommunityMembers(communityId: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM community_members WHERE community_id = ? ORDER BY joined_at DESC LIMIT 50').all(communityId);
  }

  public getStudentJoinedCommunities(userId: string) {
    const db = getDatabase();
    return db.prepare(`
      SELECT c.*, cm.role as member_role, cm.reputation_points, cm.joined_at as member_joined_at
      FROM community_members cm
      JOIN communities c ON c.id = cm.community_id
      WHERE cm.user_id = ?
      ORDER BY cm.joined_at DESC
    `).all(userId);
  }

  public joinCommunity(communityId: string, userId: string, role: string = 'member') {
    const db = getDatabase();
    const id = `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT OR IGNORE INTO community_members (id, community_id, user_id, role, reputation_points, is_active, joined_at)
      VALUES (?, ?, ?, ?, 10, 1, ?)
    `).run(id, communityId, userId, role, now);

    if (insert.changes > 0) {
      db.prepare('UPDATE communities SET member_count = member_count + 1 WHERE id = ?').run(communityId);
    }
    return { success: true, memberId: id };
  }

  public leaveCommunity(communityId: string, userId: string) {
    const db = getDatabase();
    const deleted = db.prepare('DELETE FROM community_members WHERE community_id = ? AND user_id = ?').run(communityId, userId);
    if (deleted.changes > 0) {
      db.prepare('UPDATE communities SET member_count = MAX(1, member_count - 1) WHERE id = ?').run(communityId);
    }
    return { success: true };
  }

  // ==========================================
  // 2. POSTS & DISCUSSIONS
  // ==========================================

  public getCommunityPosts(communityId?: string, postType?: string) {
    const db = getDatabase();
    let query = 'SELECT * FROM community_posts WHERE status = "published"';
    const params: any[] = [];

    if (communityId) {
      query += ' AND community_id = ?';
      params.push(communityId);
    }
    if (postType && postType !== 'ALL') {
      query += ' AND post_type = ?';
      params.push(postType);
    }

    query += ' ORDER BY is_pinned DESC, created_at DESC LIMIT 60';
    return db.prepare(query).all(...params);
  }

  public getPostById(postId: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM community_posts WHERE id = ?').get(postId);
  }

  public createPost(data: {
    community_id: string;
    author_id: string;
    author_name: string;
    author_role?: string;
    author_avatar?: string;
    post_type: string;
    title: string;
    content: string;
    tags?: string[];
  }) {
    const db = getDatabase();
    const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO community_posts (
        id, community_id, author_id, author_name, author_role, author_avatar,
        post_type, title, content, tags, upvotes_count, comments_count,
        is_pinned, is_solved, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 'published', ?, ?)
    `).run(
      id,
      data.community_id,
      data.author_id,
      data.author_name,
      data.author_role || 'student',
      data.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      data.post_type,
      data.title,
      data.content,
      JSON.stringify(data.tags || []),
      now,
      now
    );

    db.prepare('UPDATE communities SET post_count = post_count + 1 WHERE id = ?').run(data.community_id);
    return this.getPostById(id);
  }

  public upvotePost(postId: string) {
    const db = getDatabase();
    db.prepare('UPDATE community_posts SET upvotes_count = upvotes_count + 1 WHERE id = ?').run(postId);
    return db.prepare('SELECT upvotes_count FROM community_posts WHERE id = ?').get(postId);
  }

  // ==========================================
  // 3. COMMENTS & PEER ANSWERS
  // ==========================================

  public getPostComments(postId: string) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM community_comments
      WHERE post_id = ? AND status = 'published'
      ORDER BY is_accepted_answer DESC, upvotes_count DESC, created_at ASC
    `).all(postId);
  }

  public createComment(data: {
    post_id: string;
    author_id: string;
    author_name: string;
    author_role?: string;
    author_avatar?: string;
    parent_comment_id?: string | null;
    content: string;
  }) {
    const db = getDatabase();
    const id = `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO community_comments (
        id, post_id, author_id, author_name, author_role, author_avatar,
        parent_comment_id, content, upvotes_count, is_accepted_answer, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'published', ?)
    `).run(
      id,
      data.post_id,
      data.author_id,
      data.author_name,
      data.author_role || 'student',
      data.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      data.parent_comment_id || null,
      data.content,
      now
    );

    db.prepare('UPDATE community_posts SET comments_count = comments_count + 1, updated_at = ? WHERE id = ?').run(now, data.post_id);
    return db.prepare('SELECT * FROM community_comments WHERE id = ?').get(id);
  }

  public upvoteComment(commentId: string) {
    const db = getDatabase();
    db.prepare('UPDATE community_comments SET upvotes_count = upvotes_count + 1 WHERE id = ?').run(commentId);
    return db.prepare('SELECT upvotes_count FROM community_comments WHERE id = ?').get(commentId);
  }

  public markAcceptedAnswer(postId: string, commentId: string) {
    const db = getDatabase();
    // Reset previous accepted
    db.prepare('UPDATE community_comments SET is_accepted_answer = 0 WHERE post_id = ?').run(postId);
    // Set this one
    db.prepare('UPDATE community_comments SET is_accepted_answer = 1 WHERE id = ?').run(commentId);
    // Mark post solved
    db.prepare('UPDATE community_posts SET is_solved = 1, solved_comment_id = ? WHERE id = ?').run(commentId, postId);
    return { success: true };
  }

  // ==========================================
  // 4. MENTOR NETWORK
  // ==========================================

  public getAllMentors(badge?: string) {
    const db = getDatabase();
    if (badge && badge !== 'ALL') {
      return db.prepare('SELECT * FROM mentor_profiles WHERE verified_badge = ? ORDER BY rating DESC').all(badge);
    }
    return db.prepare('SELECT * FROM mentor_profiles ORDER BY rating DESC').all();
  }

  public getMentorById(mentorId: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM mentor_profiles WHERE id = ?').get(mentorId);
  }

  public bookMentorshipSession(data: {
    mentor_id: string;
    student_id: string;
    student_name: string;
    topic: string;
    session_type: string;
    scheduled_date: string;
    scheduled_time: string;
    student_notes?: string;
  }) {
    const db = getDatabase();
    const id = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO mentorship_sessions (
        id, mentor_id, student_id, student_name, topic, session_type,
        scheduled_date, scheduled_time, duration_minutes, meeting_link,
        status, student_notes, safety_logged, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 30, 'https://meet.cdes.edu.kh/session-' || ?, 'confirmed', ?, 1, ?, ?)
    `).run(
      id,
      data.mentor_id,
      data.student_id,
      data.student_name,
      data.topic,
      data.session_type,
      data.scheduled_date,
      data.scheduled_time,
      id,
      data.student_notes || null,
      now,
      now
    );

    db.prepare('UPDATE mentor_profiles SET total_sessions = total_sessions + 1 WHERE id = ?').run(data.mentor_id);
    return db.prepare('SELECT * FROM mentorship_sessions WHERE id = ?').get(id);
  }

  public getStudentSessions(studentId: string) {
    const db = getDatabase();
    return db.prepare(`
      SELECT ms.*, m.full_name as mentor_name, m.full_name_km as mentor_name_km,
             m.title as mentor_title, m.organization as mentor_org, m.avatar_url as mentor_avatar,
             m.verified_badge as mentor_badge
      FROM mentorship_sessions ms
      JOIN mentor_profiles m ON m.id = ms.mentor_id
      WHERE ms.student_id = ?
      ORDER BY ms.scheduled_date DESC, ms.scheduled_time DESC
    `).all(studentId);
  }

  // ==========================================
  // 5. STUDENT PROJECTS
  // ==========================================

  public getAllProjects(category?: string, stage?: string) {
    const db = getDatabase();
    let query = 'SELECT * FROM student_projects WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'ALL') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (stage && stage !== 'ALL') {
      query += ' AND stage = ?';
      params.push(stage);
    }

    query += ' ORDER BY upvotes_count DESC, created_at DESC';
    return db.prepare(query).all(...params);
  }

  public getProjectBySlug(slug: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM student_projects WHERE slug = ?').get(slug);
  }

  public getProjectById(id: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM student_projects WHERE id = ?').get(id);
  }

  public getProjectMembers(projectId: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM project_members WHERE project_id = ? ORDER BY joined_at ASC').all(projectId);
  }

  public getProjectMilestones(projectId: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM project_milestones WHERE project_id = ? ORDER BY due_date ASC').all(projectId);
  }

  public joinProject(projectId: string, data: {
    user_id: string;
    user_name: string;
    user_avatar?: string;
    role_in_project: string;
  }) {
    const db = getDatabase();
    const id = `pm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT OR IGNORE INTO project_members (id, project_id, user_id, user_name, user_avatar, role_in_project, status, joined_at)
      VALUES (?, ?, ?, ?, ?, ?, 'accepted', ?)
    `).run(
      id,
      projectId,
      data.user_id,
      data.user_name,
      data.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      data.role_in_project,
      now
    );

    if (insert.changes > 0) {
      db.prepare('UPDATE student_projects SET current_team_size = current_team_size + 1 WHERE id = ?').run(projectId);
    }
    return { success: true, memberId: id };
  }

  public upvoteProject(projectId: string) {
    const db = getDatabase();
    db.prepare('UPDATE student_projects SET upvotes_count = upvotes_count + 1 WHERE id = ?').run(projectId);
    return db.prepare('SELECT upvotes_count FROM student_projects WHERE id = ?').get(projectId);
  }

  // ==========================================
  // 6. CAMPUS EVENTS
  // ==========================================

  public getAllEvents(eventType?: string, status?: string) {
    const db = getDatabase();
    let query = 'SELECT * FROM campus_events WHERE 1=1';
    const params: any[] = [];

    if (eventType && eventType !== 'ALL') {
      query += ' AND event_type = ?';
      params.push(eventType);
    }
    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_time ASC';
    return db.prepare(query).all(...params);
  }

  public getEventBySlug(slug: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM campus_events WHERE slug = ?').get(slug);
  }

  public rsvpEvent(eventId: string, data: { user_id: string; user_name: string; user_email: string }) {
    const db = getDatabase();
    const id = `er-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT OR IGNORE INTO event_registrations (id, event_id, user_id, user_name, user_email, rsvp_status, created_at)
      VALUES (?, ?, ?, ?, ?, 'registered', ?)
    `).run(id, eventId, data.user_id, data.user_name, data.user_email, now);

    if (insert.changes > 0) {
      db.prepare('UPDATE campus_events SET current_rsvp_count = current_rsvp_count + 1 WHERE id = ?').run(eventId);
    }
    return { success: true, registrationId: id };
  }

  public getStudentEventRegistrations(userId: string) {
    const db = getDatabase();
    return db.prepare(`
      SELECT er.*, ce.title, ce.title_km, ce.event_type, ce.event_format, ce.location_or_link,
             ce.start_time, ce.end_time, ce.speaker_name, ce.speaker_title
      FROM event_registrations er
      JOIN campus_events ce ON ce.id = er.event_id
      WHERE er.user_id = ?
      ORDER BY ce.start_time ASC
    `).all(userId);
  }

  // ==========================================
  // 7. PARTNER ORGANIZATIONS
  // ==========================================

  public getAllOrganizations(orgType?: string) {
    const db = getDatabase();
    if (orgType && orgType !== 'ALL') {
      return db.prepare('SELECT * FROM partner_organizations WHERE org_type = ? ORDER BY name ASC').all(orgType);
    }
    return db.prepare('SELECT * FROM partner_organizations ORDER BY name ASC').all();
  }

  // ==========================================
  // 8. AI COMMUNITY INTELLIGENCE (TASK 6)
  // ==========================================

  public getCommunityRecommendationsForStudent(studentId: string) {
    const db = getDatabase();
    // Retrieve student memory/profile
    const memory = db.prepare('SELECT * FROM student_ai_memory WHERE student_id = ?').get(studentId) as any;
    const communities = db.prepare('SELECT * FROM communities ORDER BY member_count DESC').all() as any[];

    // Calculate match score based on student target career and learning focus
    const careerFocus = memory?.career_summary?.toLowerCase() || 'software engineering ai';
    const learningFocus = memory?.learning_summary?.toLowerCase() || 'mathematics logic physics';

    return communities.map((comm) => {
      let matchScore = 75;
      let matchReason = 'Active student community recommended for Cambodian STEM learners.';

      if (comm.category === 'ai_robotics' && (careerFocus.includes('ai') || careerFocus.includes('software'))) {
        matchScore = 96;
        matchReason = 'High cognitive affinity: Direct match with your AI Systems Engineer target career and logic circuits lab performance.';
      } else if (comm.category === 'stem_prep' && learningFocus.includes('bac ii')) {
        matchScore = 94;
        matchReason = 'Academic priority: Recommended for Grade 12 Bac II physics & calculus exam problem walkthroughs.';
      } else if (comm.category === 'scholarships' && (careerFocus.includes('mptc') || careerFocus.includes('scholarship'))) {
        matchScore = 92;
        matchReason = 'Target funding alignment: Essential guidelines for MPTC 100% full scholarship essays and interviews.';
      } else if (comm.category === 'clean_energy' && learningFocus.includes('energy')) {
        matchScore = 88;
        matchReason = 'STEM curiosity match: Direct synergy with solar microgrid simulation projects.';
      }

      return {
        ...comm,
        rules: typeof comm.rules === 'string' ? JSON.parse(comm.rules) : comm.rules,
        matchScore,
        matchReason
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  public getMentorRecommendationsForStudent(studentId: string) {
    const db = getDatabase();
    const memory = db.prepare('SELECT * FROM student_ai_memory WHERE student_id = ?').get(studentId) as any;
    const mentors = db.prepare('SELECT * FROM mentor_profiles WHERE is_accepting_mentees = 1 ORDER BY rating DESC').all() as any[];

    const careerFocus = memory?.career_summary?.toLowerCase() || 'cadt software ai';

    return mentors.map((m) => {
      let matchScore = 80;
      let matchReason = 'Verified senior mentor with proven academic counseling experience.';

      if (m.expertise_areas.toLowerCase().includes('ai') && careerFocus.includes('ai')) {
        matchScore = 98;
        matchReason = `Highest domain alignment: ${m.full_name} leads CADT AI research and advises Grade 12 students entering software engineering.`;
      } else if (m.university_id === 'univ-itc' && careerFocus.includes('itc')) {
        matchScore = 95;
        matchReason = `Institutional prestige match: Expert guidance on conquering the 2-Year Tronc Commun entrance exam.`;
      } else if (m.verified_badge === 'alumni_star') {
        matchScore = 90;
        matchReason = 'Alumni star mentor with high feedback ratings from provincial scholarship candidates.';
      }

      return {
        ...m,
        expertise_areas: typeof m.expertise_areas === 'string' ? JSON.parse(m.expertise_areas) : m.expertise_areas,
        availability_slots: typeof m.availability_slots === 'string' ? JSON.parse(m.availability_slots) : m.availability_slots,
        matchScore,
        matchReason
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const communityRepository = new CommunityRepository();
