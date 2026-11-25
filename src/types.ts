import type {
  DataConfidenceBadge,
  UniversityProfileScore,
  MajorProgramDetail,
  UniversityRankingInfo,
  ComprehensiveUniversityProfile,
} from '../shared/types/university';
export * from '../shared/types/university';

export type TabView =
  | 'dashboard'
  | 'avatar-world'
  | 'decision-engine'
  | 'university-intelligence'
  | 'scholarships'
  | 'advisor'
  | 'ai-advisor'
  | 'alumni'
  | 'meetups'
  | 'mentors'
  | 'opportunities'
  | 'profile'
  | 'stem-discovery'
  | 'events'
  | 'community'
  | 'research-lab'
  | 'platform-architecture'
  | 'data-strategy'
  | 'messages'
  | 'become-mentor';

export interface TelemetryEvent {
  id: string;
  eventName:
    | 'view_university'
    | 'compare_major'
    | 'compare_university'
    | 'calculate_roi'
    | 'click_scholarship'
    | 'search_university'
    | 'start_decision_assessment'
    | 'complete_decision_assessment'
    | 'filter_universities'
    | 'change_language';
  data: Record<string, any>;
  timestamp: string;
  userId: string;
}

export interface DecisionAssessmentInput {
  interests: string[];
  mathAbility: 'loves_math' | 'moderate_math' | 'hates_math';
  strengths: string[];
  workStyle: 'hands_on_coder' | 'theory_researcher' | 'entrepreneur_creative' | 'caring_service';
  budgetTier: 'scholarship_dependent' | 'low_under_1000' | 'mid_1000_3500' | 'international_5000_plus';
  careerGoal: 'local_tech' | 'startup_founder' | 'international_remote' | 'healthcare_public';
}

export interface DecisionResultDossier {
  recommendedMajors: Array<{
    majorName: string;
    fitScore: number;
    matchReason: string;
    difficultyStars: number;
    salaryRange: string;
    careerPathways: string[];
    alternativeIfMathIssue?: string;
  }>;
  recommendedUniversities: Array<{
    univId: string;
    univName: string;
    univAbbr: string;
    profileScore: number;
    annualTuitionUSD: number;
    scholarshipMatch: string;
    curriculumStyle: string;
    whyFit: string;
  }>;
  roiAnalysis: {
    estimatedDegreeCostUSD: number;
    projectedMonthlySalaryUSD: number;
    paybackMonths: number;
    financialVerdict: string;
  };
  actionChecklist: Array<{
    stepNumber: number;
    title: string;
    deadline: string;
    instructions: string;
    completed: boolean;
  }>;
}

export type EducationLevel =
  | 'Grade 10'
  | 'Grade 11'
  | 'Grade 12'
  | 'University Freshman'
  | 'University Sophomore'
  | 'University Junior'
  | 'University Senior';

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  educationLevel: EducationLevel;
  school: string;
  location: string;
  targetMajor: string;
  targetCareer: string;
  interests: string[];
  favoriteSubjects: string[];
  careerInterests: string[];
  goals: string;
  savedMentorIds: string[];
  savedOpportunityIds: string[];
  registeredEventIds: string[];
  followedMentorIds: string[];
  badges: BadgeItem[];
  scheduledSessions: SessionBooking[];
  explorationProgress: {
    profileCompleted: number;
    interestsExplored: number;
    totalInterestsCount?: number;
    mentorsContacted: number;
    eventsAttended?: number;
    meetupsJoined: number;
  };
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  earned?: boolean;
}

export type MentorType = 'senior' | 'graduate' | 'professional' | 'researcher' | 'expert';

export interface EducationEntry {
  institution: string;
  degree: string;
  year: string;
  honors?: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  highlight: string;
}

export interface StudentReview {
  id: string;
  studentName: string;
  avatar?: string;
  date: string;
  rating: number;
  comment: string;
  topic: string;
}

export interface MentorAvailabilitySlot {
  day: string;
  date: string;
  times: string[];
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  companyOrOrg: string;
  university: string;
  major: string;
  experienceYears: number;
  location: string;
  rating: number;
  reviewsCount: number;
  studentsHelped: number;
  isVerified: boolean;
  mentorType: MentorType;
  availabilityStatus: 'Available This Week' | 'Few Slots Left' | 'Next Week';
  bio: string;
  expertiseTags: string[];
  mentoringTopics: string[];
  educationList: EducationEntry[];
  experienceList: ExperienceEntry[];
  studentReviews: StudentReview[];
  availableSlots: MentorAvailabilitySlot[];
}

export interface MeetupParticipant {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface MeetupChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: string;
  text: string;
  isHost?: boolean;
}

export interface StudentMeetup {
  id: string;
  title: string;
  topic: string;
  objective: string;
  date: string;
  time: string;
  duration: string;
  format: 'online' | 'in-person' | 'hybrid';
  location: string;
  meetingLink: string;
  hostStudentId: string;
  hostName: string;
  hostAvatar: string;
  hostGradeLevel: string;
  maxParticipants: number;
  currentParticipantsCount: number;
  participants: MeetupParticipant[];
  isJoined: boolean;
  category: 'Exam Review' | 'University Prep' | 'Coding & Tech' | 'Language / IELTS' | 'General STEM';
  tags: string[];
  materialsOrPrep: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  chatMessages: MeetupChatMessage[];
}

export interface SeniorReview {
  reviewerName: string;
  reviewerYear: string;
  avatar: string;
  quote: string;
  pros: string[];
  challenges: string[];
  tipsForFreshmen: string;
}

export interface UniversityMajorInsight {
  id: string;
  universityName: string;
  universityAbbr: 'ITC' | 'CADT' | 'RUPP' | 'AUPP' | 'UHS';
  majorName: string;
  faculty: string;
  degreeType: string;
  durationYears: string;
  entranceExamRequirements: string[];
  troncCommunOrFoundationYearInfo: string;
  keySubjects: string[];
  careerOutcomes: string[];
  seniorStudentReview: SeniorReview;
  seniorMentorIds: string[];
}

export interface SessionBooking {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  mentorTitle: string;
  studentName: string;
  date: string;
  time: string;
  durationMinutes: number;
  topic: string;
  meetingLink: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  provider: string;
  type: 'Scholarship' | 'Internship' | 'Bootcamp' | 'Competition';
  badgeColor: string;
  coverageOrStipend: string;
  deadline: string;
  location: string;
  eligibility: string[];
  description: string;
  tags: string[];
  isSaved: boolean;
  link: string;
  matchScore: number;
}

export interface RetrievedSourceRef {
  id: string;
  title: string;
  category: string;
  source: string;
  snippet?: string;
  url?: string;
  relevanceScore?: number;
}

export interface WebSourceCitation {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendedMajors?: string[];
  recommendedSkills?: string[];
  suggestedMentors?: string[];
  suggestedQuestions?: string[];
  retrievedSources?: RetrievedSourceRef[];
  webSources?: WebSourceCitation[];
  toolsUsed?: string[];
  memoryUpdates?: string[];
  providerLabel?: string;
  studentMemoryApplied?: {
    learningSummarySnippet?: string;
    interestSummarySnippet?: string;
    careerSummarySnippet?: string;
  };
  safetyFlags?: string[];
}

export interface ClientAIRecommendation {
  id: string;
  student_id: string;
  recommendation_type: 'learning' | 'career' | 'scholarship';
  title: string;
  description: string;
  match_reason: string;
  target_entity_id?: string | null;
  priority_score: number;
  status: 'given' | 'clicked' | 'completed' | 'dismissed';
  feedback_rating?: number | null;
  feedback_comments?: string | null;
  action_label?: string;
  action_link?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientKnowledgeDoc {
  id: string;
  title: string;
  category: 'Education Science' | 'Psychology' | 'Career Intelligence' | 'University Knowledge' | 'Scholarship Knowledge' | 'Teaching Methodology' | 'Child Development';
  content: string;
  source?: string;
  keywords?: string[];
  created_at: string;
}

export interface ClientStudentAIMemory {
  student_id: string;
  learning_summary: string;
  interest_summary: string;
  career_summary: string;
  behavior_summary: string;
  conversation_summary: string;
  last_interaction_at?: string;
  updated_at: string;
}

export interface ClientStudentInsight {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  memory: ClientStudentAIMemory;
  cognitiveProfile: {
    engagementScore: number;
    persistenceScore: number;
    problemSolvingScore: number;
    primaryLearningStyle: string;
    pacingVelocity: string;
    frustrationRisk: string;
  };
  keyStrengths: string[];
  growthAreas: string[];
  activeRecommendationsCount: number;
  generatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'booking' | 'meetup' | 'opportunity' | 'system' | 'session';
  isRead: boolean;
}

// ----------------------------------------------------
// AVATAR WORLD MVP TYPES
// ----------------------------------------------------
export interface ClientAvatarProfile {
  student_id: string;
  avatar_name: string;
  gender_presentation: 'neutral' | 'male' | 'female';
  skin_tone: string;
  hair_style: 'short_wavy' | 'parted_smooth' | 'curly_bun' | 'long_straight' | 'braids' | 'slick_fade';
  hair_color: string;
  eye_color: string;
  clothing_outfit: 'cdes_uniform' | 'lab_coat' | 'scholar_casual' | 'tech_hoodie' | 'traditional_krama' | 'math_olympiad';
  accessory: 'none' | 'glasses_round' | 'graduation_cap' | 'cdes_badge' | 'tech_headset' | 'backpack';
  expression: 'smiling' | 'curious' | 'confident' | 'thoughtful';
  level: number;
  merit_points: number;
  updated_at?: string;
  created_at?: string;
}

export interface ClientAvatarItem {
  id: string;
  name: string;
  category: 'Furniture' | 'Decoration' | 'Achievement' | 'Learning Object';
  description: string;
  icon_key: string;
  default_slot: 'floor' | 'wall' | 'desk' | 'shelf';
  educational_value: string;
  subject_tag: string;
  unlock_condition_type: 'free' | 'achievement' | 'learning_milestone' | 'quiz_score';
  unlock_condition_val: string | null;
  created_at?: string;
}

export interface ClientStudentInventoryItem {
  id: string;
  student_id: string;
  item_id: string;
  quantity: number;
  acquired_at: string;
  is_equipped: number;
  item: ClientAvatarItem;
}

export interface ClientRoomObject {
  id: string;
  room_id: string;
  item_id: string;
  position_x: number;
  position_y: number;
  layer: 'floor' | 'wall' | 'desk' | 'shelf';
  rotation: number;
  is_interactive: number;
  placed_at: string;
  item: ClientAvatarItem;
}

export interface ClientVirtualRoom {
  id: string;
  student_id: string;
  room_name: string;
  background_theme: 'daylight_study' | 'sunset_warm' | 'cozy_evening' | 'cyber_lab' | 'khmer_heritage';
  wall_color: string;
  floor_style: 'warm_wood' | 'stone_tile' | 'tech_mat' | 'bamboo';
  layout_grid_size: number;
  study_streak_days: number;
  updated_at?: string;
  created_at?: string;
  objects: ClientRoomObject[];
  wallAchievements: ClientStudentAchievement[];
}

export interface ClientAchievement {
  id: string;
  code: string;
  title: string;
  title_km?: string;
  description: string;
  category: 'Learning completion' | 'Quiz scores' | 'STEM activities' | 'Scholarship activities' | 'Community contribution';
  badge_icon: string;
  item_reward_id?: string | null;
  merit_points: number;
  created_at?: string;
}

export interface ClientStudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  unlocked_at: string;
  is_displayed_on_wall: number;
  wall_slot_index: number | null;
  progress_percentage: number;
  achievement: ClientAchievement;
}

export interface ClientWorldLocation {
  id: string;
  slug: 'room' | 'hallway' | 'library' | 'laboratory' | 'career_center' | 'community';
  name: string;
  name_km?: string;
  description: string;
  icon_key: string;
  access_level: string;
  is_unlocked: number;
  order_index: number;
}

export interface ClientWorldState {
  avatarProfile: ClientAvatarProfile;
  room: ClientVirtualRoom;
  inventory: ClientStudentInventoryItem[];
  availableItems: ClientAvatarItem[];
  achievements: ClientStudentAchievement[];
  locations: ClientWorldLocation[];
  intelligenceSnippet: {
    gritPersistence: number;
    curiosityBreadth: number;
    primaryStyle: string;
    meritPoints: number;
    streakDays: number;
  };
}

// ==========================================
// PHASE 7: COMMUNITY ECOSYSTEM & DIGITAL CAMPUS TYPES
// ==========================================

export interface ClientCommunity {
  id: string;
  slug: string;
  name: string;
  name_km?: string;
  description: string;
  category: 'stem_prep' | 'ai_robotics' | 'biotech_health' | 'software_dev' | 'scholarships' | 'clean_energy' | 'women_in_tech' | 'research_club';
  icon_key: string;
  color: string;
  banner_url?: string;
  created_by: string;
  is_verified: number;
  member_count: number;
  post_count: number;
  safety_level: 'high' | 'strict_supervised';
  rules: string[] | string;
  created_at: string;
  matchScore?: number;
  matchReason?: string;
  isJoined?: boolean;
}

export interface ClientCommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'mentor' | 'lead';
  reputation_points: number;
  is_active: number;
  joined_at: string;
}

export interface ClientCommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  post_type: 'question' | 'discussion' | 'project_showcase' | 'resource' | 'announcement';
  title: string;
  content: string;
  tags: string[] | string;
  upvotes_count: number;
  comments_count: number;
  is_pinned: number;
  is_solved: number;
  solved_comment_id?: string | null;
  status: 'published' | 'flagged' | 'removed';
  created_at: string;
  updated_at: string;
}

export interface ClientCommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  parent_comment_id?: string | null;
  content: string;
  upvotes_count: number;
  is_accepted_answer: number;
  status: 'published' | 'flagged' | 'removed';
  created_at: string;
}

export interface ClientMentorProfile {
  id: string;
  user_id: string;
  full_name: string;
  full_name_km?: string;
  title: string;
  organization: string;
  bio: string;
  expertise_areas: string[] | string;
  university_id?: string;
  degree: string;
  graduation_year?: number;
  verified_badge: 'university_verified' | 'industry_pro' | 'alumni_star';
  rating: number;
  total_sessions: number;
  availability_slots: string[] | string;
  is_accepting_mentees: number;
  avatar_url?: string;
  created_at: string;
  matchScore?: number;
  matchReason?: string;
}

export interface ClientMentorshipSession {
  id: string;
  mentor_id: string;
  student_id: string;
  student_name: string;
  topic: string;
  session_type: 'academic_guidance' | 'curriculum_review' | 'scholarship_prep' | 'project_feedback';
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  meeting_link: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  student_notes?: string;
  mentor_feedback?: string;
  rating?: number;
  safety_logged: number;
  created_at: string;
  updated_at: string;
  mentor_name?: string;
  mentor_name_km?: string;
  mentor_title?: string;
  mentor_org?: string;
  mentor_avatar?: string;
  mentor_badge?: string;
}

export interface ClientStudentProject {
  id: string;
  slug: string;
  title: string;
  title_km?: string;
  description: string;
  category: 'ai_software' | 'robotics_hardware' | 'biotech_science' | 'clean_energy' | 'civic_tech' | 'edtech';
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  stage: 'recruiting' | 'in_progress' | 'completed' | 'showcased';
  required_skills: string[] | string;
  current_team_size: number;
  max_team_size: number;
  repository_url?: string;
  live_demo_url?: string;
  merit_points_reward: number;
  upvotes_count: number;
  associated_learning_path_id?: string;
  created_at: string;
  updated_at: string;
  members?: ClientProjectMember[];
  milestones?: ClientProjectMilestone[];
}

export interface ClientProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  role_in_project: string;
  status: 'applied' | 'accepted' | 'completed';
  joined_at: string;
}

export interface ClientProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  merit_points: number;
  completed_at?: string | null;
}

export interface ClientCampusEvent {
  id: string;
  slug: string;
  title: string;
  title_km?: string;
  event_type: 'workshop' | 'webinar' | 'hackathon' | 'competition' | 'ama_session';
  description: string;
  host_organization: string;
  host_university_id?: string;
  speaker_name: string;
  speaker_title: string;
  speaker_avatar?: string;
  event_format: 'virtual' | 'physical' | 'hybrid';
  location_or_link: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  current_rsvp_count: number;
  tags: string[] | string;
  status: 'upcoming' | 'live' | 'completed';
  created_at: string;
  isRegistered?: boolean;
}

export interface ClientPartnerOrg {
  id: string;
  name: string;
  name_km?: string;
  org_type: 'university' | 'ngo' | 'industry_partner' | 'student_club' | 'government_body';
  description: string;
  logo_url?: string;
  website_url?: string;
  verified_status: 'official_partner' | 'verified_org';
  contact_email: string;
  focus_domains: string[] | string;
  created_at: string;
}

export interface ClientModerationReport {
  id: string;
  reporter_id: string;
  reported_item_type: 'post' | 'comment' | 'mentor' | 'project' | 'message';
  reported_item_id: string;
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'unsafe_contact_request' | 'false_information';
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  moderator_notes?: string;
  created_at: string;
  resolved_at?: string;
}


export interface ClientMentor {
  id: string;
  full_name: string;
  full_name_km?: string;
  title: string;
  organization: string;
  verified_badge: 'university_verified' | 'industry_pro' | 'alumni_star';
  rating: number;
  matchScore?: number;
  matchReason?: string;
  avatar_url?: string;
  expertise_areas: string[] | string;
}

export interface ClientStudentSession {
  id: string;
  mentor_id: string;
  mentor_name?: string;
  mentor_title?: string;
  student_id: string;
  student_name: string;
  topic: string;
  session_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  meeting_link: string;
  status: string;
  mentor_feedback?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface ClientContent {
  id: string;
  title: string;
  category: string;
  description: string;
  source?: string;
  created_at: string;
}

export interface ClientCommunityProject {
  id: string;
  title: string;
  description: string;
  category: string;
  creator_id: string;
  creator_name: string;
  stage: 'recruiting' | 'in_progress' | 'completed' | 'showcased';
  required_skills: string[];
  members?: ClientProjectMember[];
  upvotes_count: number;
  created_at: string;
  updated_at: string;
}

