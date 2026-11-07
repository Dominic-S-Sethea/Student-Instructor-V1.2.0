-- ==========================================================
-- CDES PLATFORM PRODUCTION DATABASE SCHEMA (Phase 2)
-- Architecture: Multi-Tenant Education Decision Intelligence
-- ==========================================================

-- ----------------------------------------------------------
-- A. USER IDENTITY SYSTEM
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'organization', 'mentor')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_verification', 'suspended')),
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    deleted_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth TEXT,
    education_level TEXT NOT NULL,
    school TEXT,
    university TEXT,
    major TEXT,
    graduation_year INTEGER,
    language TEXT NOT NULL DEFAULT 'km',
    location TEXT,
    target_career TEXT,
    interests TEXT DEFAULT '[]', -- JSON array of strings
    favorite_subjects TEXT DEFAULT '[]', -- JSON array of strings
    goals TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    deleted_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS education_history (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    achievements TEXT
);

-- ----------------------------------------------------------
-- B. SCHOLARSHIP SYSTEM
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS scholarships (
    id TEXT PRIMARY KEY,
    legacy_code TEXT,
    name TEXT NOT NULL,
    name_km TEXT,
    provider TEXT NOT NULL,
    provider_km TEXT,
    country TEXT NOT NULL,
    country_km TEXT,
    region TEXT NOT NULL,
    degree_levels TEXT NOT NULL, -- JSON array of string levels
    field_of_study TEXT NOT NULL, -- JSON array of fields
    funding_type TEXT NOT NULL,
    funding_details TEXT,
    funding_details_km TEXT,
    eligibility_summary TEXT,
    eligibility_summary_km TEXT,
    overview TEXT,
    overview_km TEXT,
    target_demographic TEXT DEFAULT '[]', -- JSON array
    application_link TEXT NOT NULL,
    official_source_url TEXT NOT NULL,
    deadline TEXT NOT NULL,
    is_deadline_rolling INTEGER NOT NULL DEFAULT 0,
    is_verified INTEGER NOT NULL DEFAULT 1,
    verification_tier TEXT NOT NULL DEFAULT 'official',
    tags TEXT DEFAULT '[]', -- JSON array
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    deleted_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scholarship_requirements (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT UNIQUE NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    gpa_minimum REAL,
    ielts_minimum REAL,
    toefl_minimum REAL,
    age_limit INTEGER,
    nationalities TEXT DEFAULT '["Cambodian"]', -- JSON array
    work_experience_years INTEGER DEFAULT 0,
    required_documents TEXT DEFAULT '[]', -- JSON array
    notes TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS scholarship_funding (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT UNIQUE NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    covers_tuition INTEGER NOT NULL DEFAULT 1,
    tuition_coverage_percentage REAL DEFAULT 100,
    monthly_stipend_usd REAL DEFAULT 0,
    covers_flights INTEGER DEFAULT 0,
    covers_visa INTEGER DEFAULT 0,
    covers_health_insurance INTEGER DEFAULT 0,
    funding_currency TEXT DEFAULT 'USD',
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS scholarship_sources (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- 'government_portal', 'university_bulletin', 'embassy_announcement'
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    verified_by TEXT,
    verified_at TEXT,
    is_official INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS verification_records (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    verified_by_user_id TEXT REFERENCES users(id),
    verifier_name TEXT NOT NULL,
    verification_method TEXT NOT NULL,
    confidence_stars INTEGER NOT NULL DEFAULT 5,
    source_url TEXT,
    verification_notes TEXT,
    verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS change_history (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL, -- 'scholarship', 'university', 'profile'
    entity_id TEXT NOT NULL,
    changed_by_user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VERIFY'
    previous_state TEXT, -- JSON
    new_state TEXT, -- JSON
    change_summary TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organization_submissions (
    id TEXT PRIMARY KEY,
    organization_name TEXT NOT NULL,
    contact_person TEXT,
    contact_email TEXT NOT NULL,
    official_website TEXT,
    scholarship_name TEXT NOT NULL,
    scholarship_name_km TEXT,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    degree_level TEXT NOT NULL, -- JSON array
    field_of_study TEXT NOT NULL, -- JSON array
    funding_type TEXT NOT NULL,
    funding_details TEXT,
    eligibility_summary TEXT,
    deadline TEXT,
    application_link TEXT,
    official_source_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending Admin Review' CHECK (status IN ('Pending Admin Review', 'Approved', 'Approved & Published', 'Rejected')),
    submitted_by_user_id TEXT REFERENCES users(id),
    submitted_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT,
    review_notes TEXT
);

CREATE TABLE IF NOT EXISTS user_error_reports (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    scholarship_name TEXT NOT NULL,
    reported_field TEXT NOT NULL,
    description TEXT NOT NULL,
    suggested_correction TEXT,
    official_source_url TEXT,
    reporter_email TEXT,
    status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Pending Review', 'Resolved', 'Verified & Fixed', 'Dismissed')),
    submitted_at TEXT NOT NULL,
    resolved_at TEXT,
    resolved_by TEXT,
    resolution_notes TEXT
);

CREATE TABLE IF NOT EXISTS search_keywords_log (
    query TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    last_searched TEXT NOT NULL
);

-- ----------------------------------------------------------
-- C. UNIVERSITY INTELLIGENCE
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS universities (
    id TEXT PRIMARY KEY,
    abbr TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    khmer_name TEXT,
    location TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Public', 'Private', 'Semi-Autonomous', 'International')),
    founded_year INTEGER,
    website TEXT,
    logo TEXT,
    cover_image TEXT,
    profile_score_overall INTEGER NOT NULL DEFAULT 85,
    academic_reputation_score INTEGER NOT NULL DEFAULT 85,
    industry_connection_score INTEGER NOT NULL DEFAULT 80,
    facilities_score INTEGER NOT NULL DEFAULT 80,
    graduate_outcome_score INTEGER NOT NULL DEFAULT 85,
    annual_tuition_usd INTEGER NOT NULL DEFAULT 1000,
    total_degree_cost_usd INTEGER NOT NULL DEFAULT 4000,
    accreditation_status TEXT DEFAULT 'Fully Accredited',
    verification_confidence TEXT DEFAULT 'official',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS university_programs (
    id TEXT PRIMARY KEY,
    university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    duration TEXT NOT NULL,
    language TEXT NOT NULL,
    degree_awarded TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS majors (
    id TEXT PRIMARY KEY,
    university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    faculty TEXT,
    degree_type TEXT NOT NULL,
    duration_years REAL NOT NULL DEFAULT 4.0,
    difficulty_rating REAL NOT NULL DEFAULT 4.0,
    difficulty_reason TEXT,
    job_market_demand TEXT DEFAULT 'High',
    average_starting_salary TEXT,
    course_structure TEXT DEFAULT '[]', -- JSON array of course year structures
    technical_skills TEXT DEFAULT '[]', -- JSON array of skills
    soft_skills TEXT DEFAULT '[]', -- JSON array of skills
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS career_paths (
    id TEXT PRIMARY KEY,
    major_id TEXT REFERENCES majors(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    industry TEXT NOT NULL,
    average_salary_usd INTEGER NOT NULL,
    demand_level TEXT NOT NULL DEFAULT 'High',
    description TEXT
);

-- ----------------------------------------------------------
-- D. AI FOUNDATION
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_title TEXT,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    suggested_majors TEXT DEFAULT '[]', -- JSON array
    suggested_skills TEXT DEFAULT '[]', -- JSON array
    suggested_mentors TEXT DEFAULT '[]', -- JSON array
    source_attribution TEXT DEFAULT 'gemini',
    latency_ms INTEGER,
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_memory (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    preference_data TEXT DEFAULT '{}', -- JSON object
    learning_history TEXT DEFAULT '[]', -- JSON array
    career_interest TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Education Science', 'Psychology', 'Career Intelligence', 'University Knowledge', 'Scholarship Knowledge', 'Teaching Methodology', 'Child Development'
    content TEXT NOT NULL,
    source TEXT,
    embedding_reference TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_embeddings (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    vector TEXT NOT NULL, -- JSON array of floats (128-dim dense embedding)
    metadata TEXT NOT NULL DEFAULT '{}', -- JSON object (category, title, source, keywords)
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_ai_memory (
    student_id TEXT PRIMARY KEY,
    learning_summary TEXT NOT NULL DEFAULT '',
    interest_summary TEXT NOT NULL DEFAULT '',
    career_summary TEXT NOT NULL DEFAULT '',
    behavior_summary TEXT NOT NULL DEFAULT '',
    conversation_summary TEXT NOT NULL DEFAULT '',
    last_interaction_at TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_recommendation_events (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('learning', 'career', 'scholarship')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    match_reason TEXT NOT NULL,
    target_entity_id TEXT,
    priority_score REAL NOT NULL DEFAULT 85.0,
    status TEXT NOT NULL DEFAULT 'given' CHECK (status IN ('given', 'clicked', 'completed', 'dismissed')),
    feedback_rating INTEGER,
    feedback_comments TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_category ON knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_doc ON knowledge_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_student ON ai_recommendation_events(student_id, status);

-- ----------------------------------------------------------
-- E. FUTURE LEARNING FOUNDATION
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,
    name_km TEXT NOT NULL,
    description TEXT,
    domain TEXT,
    icon_key TEXT NOT NULL DEFAULT 'book-open',
    color TEXT NOT NULL DEFAULT '#2563EB',
    color_hex TEXT DEFAULT '#059669',
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_km TEXT NOT NULL,
    difficulty_level TEXT NOT NULL,
    estimated_hours INTEGER NOT NULL DEFAULT 10,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_km TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'interactive_lecture', 'virtual_lab', 'stem_game', 'quiz'
    xp_value INTEGER NOT NULL DEFAULT 50,
    lesson_order INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_contents (
    id TEXT PRIMARY KEY,
    lesson_id TEXT UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    markdown_body_en TEXT,
    markdown_body_km TEXT,
    interactive_config TEXT DEFAULT '{}', -- JSON object for lab/game params
    video_url TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_progress (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    score INTEGER,
    time_spent_seconds INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL,
    UNIQUE (student_id, lesson_id)
);

-- ----------------------------------------------------------
-- F. STUDENT INTELLIGENCE & UNIVERSAL EVENT ANALYTICS FOUNDATION
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS activity_events (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    event_type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}' -- JSON
);

CREATE TABLE IF NOT EXISTS learning_events (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    content_id TEXT NOT NULL,
    action TEXT NOT NULL,
    score REAL,
    time_spent INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT DEFAULT 'intermediate',
    performance TEXT,
    metadata TEXT DEFAULT '{}', -- JSON
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS game_events (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    game_id TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    attempt INTEGER NOT NULL DEFAULT 1,
    success INTEGER NOT NULL DEFAULT 0,
    failure_reason TEXT,
    time_taken INTEGER NOT NULL DEFAULT 0,
    action TEXT,
    duration INTEGER,
    result TEXT,
    score INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}', -- JSON
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_intelligence_profile (
    student_id TEXT PRIMARY KEY,
    learning_preferences TEXT NOT NULL DEFAULT '{}', -- JSON (visual, textual, pacing, peak_hours)
    subject_strengths TEXT NOT NULL DEFAULT '[]',     -- JSON Array of subjects / skill domains
    subject_weaknesses TEXT NOT NULL DEFAULT '[]',    -- JSON Array of subjects needing remediation
    interest_patterns TEXT NOT NULL DEFAULT '[]',     -- JSON Array of interest topics from search/exploration
    engagement_score REAL NOT NULL DEFAULT 0.0,       -- 0 to 100
    persistence_score REAL NOT NULL DEFAULT 0.0,      -- 0 to 100
    problem_solving_score REAL NOT NULL DEFAULT 0.0,  -- 0 to 100
    updated_at TEXT NOT NULL
);

-- ----------------------------------------------------------
-- G. EDUCATION RESEARCH PLATFORM (A/B TESTING & PEDAGOGY)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- draft, active, concluded
    description TEXT,
    metrics TEXT DEFAULT '["quiz_score", "retention", "engagement"]', -- JSON Array
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS experiment_participants (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL, -- e.g. 'Group A', 'Group B'
    assigned_at TEXT NOT NULL,
    UNIQUE (student_id, experiment_id)
);

CREATE TABLE IF NOT EXISTS experiment_results (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    metrics TEXT NOT NULL DEFAULT '{}',   -- JSON
    outcomes TEXT NOT NULL DEFAULT '{}',  -- JSON
    analysis TEXT,
    updated_at TEXT NOT NULL
);

-- ----------------------------------------------------------
-- H. PRIVACY & CHILD SAFETY CONSENTS
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS student_privacy_consents (
    student_id TEXT PRIMARY KEY,
    is_minor INTEGER NOT NULL DEFAULT 0,
    parental_consent_verified INTEGER NOT NULL DEFAULT 0,
    parent_email TEXT,
    allow_analytics_tracking INTEGER NOT NULL DEFAULT 1,
    allow_research_inclusion INTEGER NOT NULL DEFAULT 1,
    anonymized_research_id TEXT UNIQUE NOT NULL,
    consent_date TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- ----------------------------------------------------------
-- I. AVATAR WORLD MVP (EDUCATIONAL IDENTITY & VIRTUAL ENVIRONMENT)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS avatar_profiles (
    student_id TEXT PRIMARY KEY,
    avatar_name TEXT NOT NULL DEFAULT 'Cadet Scholar',
    gender_presentation TEXT NOT NULL DEFAULT 'neutral', -- neutral, male, female
    skin_tone TEXT NOT NULL DEFAULT '#E0AC69',           -- hex code or preset key
    hair_style TEXT NOT NULL DEFAULT 'short_wavy',       -- short_wavy, parted_smooth, curly_bun, long_straight, braids
    hair_color TEXT NOT NULL DEFAULT '#2A2421',          -- dark, chestnut, amber, silver
    eye_color TEXT NOT NULL DEFAULT '#3B2F2F',           -- brown, amber, hazel, deep_black
    clothing_outfit TEXT NOT NULL DEFAULT 'cdes_uniform',-- cdes_uniform, lab_coat, scholar_casual, tech_hoodie, traditional_krama
    accessory TEXT NOT NULL DEFAULT 'glasses_round',     -- none, glasses_round, graduation_cap, cdes_badge, tech_headset, backpack
    expression TEXT NOT NULL DEFAULT 'smiling',          -- smiling, curious, confident, thoughtful
    level INTEGER NOT NULL DEFAULT 1,
    merit_points INTEGER NOT NULL DEFAULT 150,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS avatar_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,                             -- Furniture, Decoration, Achievement, Learning Object
    description TEXT,
    icon_key TEXT NOT NULL,                             -- bookshelf, computer, microscope, chemistry_kit, certificate_frame, telescope, lamp, plant, whiteboard
    default_slot TEXT NOT NULL DEFAULT 'floor',         -- floor, wall, desk, shelf
    educational_value TEXT,                             -- Pedagogical/STEM connection description
    subject_tag TEXT DEFAULT 'General',                 -- STEM, Physics, Chemistry, Computer Science, MoEYS Bac II
    unlock_condition_type TEXT NOT NULL DEFAULT 'free', -- free, achievement, learning_milestone, quiz_score
    unlock_condition_val TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_inventory (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    item_id TEXT NOT NULL REFERENCES avatar_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    acquired_at TEXT NOT NULL,
    is_equipped INTEGER NOT NULL DEFAULT 0,
    UNIQUE(student_id, item_id)
);

CREATE TABLE IF NOT EXISTS virtual_rooms (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    room_name TEXT NOT NULL DEFAULT 'Study Sanctuary',
    background_theme TEXT NOT NULL DEFAULT 'daylight_study', -- daylight_study, sunset_warm, cozy_evening, cyber_lab, khmer_heritage
    wall_color TEXT NOT NULL DEFAULT '#E8EEF5',
    floor_style TEXT NOT NULL DEFAULT 'warm_wood',           -- warm_wood, stone_tile, tech_mat, bamboo
    layout_grid_size INTEGER NOT NULL DEFAULT 12,
    study_streak_days INTEGER NOT NULL DEFAULT 3,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS room_objects (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES virtual_rooms(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES avatar_items(id) ON DELETE CASCADE,
    position_x REAL NOT NULL,                               -- percentage 0 to 100 or grid column
    position_y REAL NOT NULL,                               -- percentage 0 to 100 or grid row
    layer TEXT NOT NULL DEFAULT 'floor',                    -- floor, wall, desk, shelf
    rotation INTEGER NOT NULL DEFAULT 0,
    is_interactive INTEGER NOT NULL DEFAULT 1,
    placed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_km TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,                                 -- Learning completion, Quiz scores, STEM activities, Scholarship activities, Community contribution
    badge_icon TEXT NOT NULL,                               -- award, star, zap, flask, book-open, compass, shield-check
    item_reward_id TEXT REFERENCES avatar_items(id),
    merit_points INTEGER NOT NULL DEFAULT 50,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_achievements (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TEXT NOT NULL,
    is_displayed_on_wall INTEGER NOT NULL DEFAULT 0,
    wall_slot_index INTEGER,                                -- 1, 2, 3, 4
    progress_percentage REAL NOT NULL DEFAULT 100.0,
    UNIQUE(student_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS world_locations (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,                              -- room, hallway, library, laboratory, career_center, community
    name TEXT NOT NULL,
    name_km TEXT,
    description TEXT NOT NULL,
    icon_key TEXT NOT NULL,
    access_level TEXT NOT NULL DEFAULT 'student',
    is_unlocked INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 1
);

-- ----------------------------------------------------------
-- PERFORMANCE INDEXES
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_scholarships_region ON scholarships(region);
CREATE INDEX IF NOT EXISTS idx_scholarships_funding ON scholarships(funding_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_universities_abbr ON universities(abbr);
CREATE INDEX IF NOT EXISTS idx_majors_university_id ON majors(university_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_time ON activity_events(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_events_student_time ON activity_events(student_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_learning_events_student ON learning_events(student_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_game_events_student ON game_events(student_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_exp_participants_student ON experiment_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_exp_participants_exp ON experiment_participants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_privacy_anon_id ON student_privacy_consents(anonymized_research_id);
CREATE INDEX IF NOT EXISTS idx_avatar_profiles_student ON avatar_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_inventory_student ON student_inventory(student_id);
CREATE INDEX IF NOT EXISTS idx_virtual_rooms_student ON virtual_rooms(student_id);
CREATE INDEX IF NOT EXISTS idx_room_objects_room ON room_objects(room_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_wall ON student_achievements(student_id, is_displayed_on_wall);

-- ----------------------------------------------------------
-- J. DIGITAL LEARNING WORLD FOUNDATION (Phase 5)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    name_km TEXT,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    UNIQUE(subject_id, slug)
);

CREATE TABLE IF NOT EXISTS learning_content (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    title_km TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'simulation', 'quiz', 'project')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    read_time_minutes INTEGER NOT NULL DEFAULT 10,
    media_url TEXT,
    body_markdown TEXT,
    simulation_config TEXT DEFAULT '{}',                   -- JSON
    quiz_data TEXT DEFAULT '[]',                            -- JSON array of questions
    project_brief TEXT DEFAULT '{}',                        -- JSON
    learning_objectives TEXT DEFAULT '[]',                  -- JSON array of strings
    merit_points INTEGER NOT NULL DEFAULT 30,
    is_featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_experiments (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_km TEXT,
    category TEXT NOT NULL,                                 -- Mechanics, Optics, Titration, Genetics, etc.
    description TEXT NOT NULL,
    learning_objectives TEXT NOT NULL DEFAULT '[]',         -- JSON array
    apparatus_list TEXT NOT NULL DEFAULT '[]',              -- JSON array of apparatus objects
    instructions TEXT NOT NULL DEFAULT '[]',                -- JSON array of step instructions
    parameters_schema TEXT NOT NULL DEFAULT '{}',           -- JSON schema for slider/knob controls
    initial_state TEXT NOT NULL DEFAULT '{}',               -- JSON initial experiment bench state
    expected_outcome TEXT NOT NULL DEFAULT '{}',            -- JSON success criteria
    safety_notes TEXT,
    merit_points INTEGER NOT NULL DEFAULT 50,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    badge_reward_code TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_experiment_results (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    experiment_id TEXT NOT NULL REFERENCES lab_experiments(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    attempts_count INTEGER NOT NULL DEFAULT 1,
    actions_log TEXT NOT NULL DEFAULT '[]',                 -- JSON array of timestamps + actions
    parameters_used TEXT NOT NULL DEFAULT '{}',             -- JSON
    observation_notes TEXT,
    outcome_data TEXT NOT NULL DEFAULT '{}',                -- JSON measured results
    score REAL NOT NULL DEFAULT 0.0,
    completed_at TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_km TEXT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('puzzle', 'quiz', 'simulation', 'challenge', 'project')),
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    learning_objective TEXT NOT NULL,
    instructions TEXT NOT NULL,
    activity_data TEXT NOT NULL DEFAULT '{}',               -- JSON configuration & logic
    hint TEXT,
    reward_points INTEGER NOT NULL DEFAULT 25,
    item_reward_id TEXT REFERENCES avatar_items(id),
    badge_code TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_activity_progress (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    activity_id TEXT NOT NULL REFERENCES learning_activities(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'needs_review')),
    score REAL NOT NULL DEFAULT 0.0,
    attempts INTEGER NOT NULL DEFAULT 1,
    hint_used_count INTEGER NOT NULL DEFAULT 0,
    response_data TEXT NOT NULL DEFAULT '{}',               -- JSON
    completed_at TEXT,
    updated_at TEXT NOT NULL,
    UNIQUE(student_id, activity_id)
);

CREATE TABLE IF NOT EXISTS learning_paths (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,                              -- ai_engineer, clean_energy, biotech_researcher, fullstack_dev
    title TEXT NOT NULL,
    title_km TEXT,
    target_career TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    estimated_weeks INTEGER NOT NULL DEFAULT 8,
    icon_key TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4F46E5',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_path_steps (
    id TEXT PRIMARY KEY,
    path_id TEXT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    title_km TEXT,
    subject TEXT NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN ('content', 'experiment', 'activity', 'project', 'milestone')),
    reference_id TEXT,
    description TEXT,
    is_required INTEGER NOT NULL DEFAULT 1,
    UNIQUE(path_id, step_order)
);

CREATE TABLE IF NOT EXISTS student_learning_paths (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    path_id TEXT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    current_step_order INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    progress_percentage REAL NOT NULL DEFAULT 0.0,
    enrolled_at TEXT NOT NULL,
    last_active_at TEXT NOT NULL,
    UNIQUE(student_id, path_id)
);

CREATE TABLE IF NOT EXISTS student_learning_history (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,                              -- content, experiment, activity, quiz, path
    entity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    action TEXT NOT NULL,                                   -- opened, started, completed, hint_used, quiz_attempt
    score REAL,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    performance_rating TEXT,                                -- excellent, good, needs_remediation
    strengths_observed TEXT DEFAULT '[]',                   -- JSON array
    weaknesses_observed TEXT DEFAULT '[]',                  -- JSON array
    timestamp TEXT NOT NULL
);

-- Learning World Indexes
CREATE INDEX IF NOT EXISTS idx_learning_content_subject ON learning_content(subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_type ON learning_content(content_type);
CREATE INDEX IF NOT EXISTS idx_lab_experiments_subject ON lab_experiments(subject_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_student ON lab_experiment_results(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_subject ON learning_activities(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_student ON student_activity_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_path ON learning_path_steps(path_id, step_order);
CREATE INDEX IF NOT EXISTS idx_student_learning_paths_student ON student_learning_paths(student_id);
CREATE INDEX IF NOT EXISTS idx_student_learning_history_student ON student_learning_history(student_id, timestamp);

-- ==========================================
-- PHASE 7: COMMUNITY ECOSYSTEM & DIGITAL CAMPUS FOUNDATION
-- ==========================================

-- 1. Student Communities (Purpose-Driven Education Circles)
CREATE TABLE IF NOT EXISTS communities (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_km TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('stem_prep', 'ai_robotics', 'biotech_health', 'software_dev', 'scholarships', 'clean_energy', 'women_in_tech', 'research_club')),
    icon_key TEXT NOT NULL DEFAULT 'users',
    color TEXT NOT NULL DEFAULT '#3B82F6',
    banner_url TEXT,
    created_by TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 1,
    member_count INTEGER NOT NULL DEFAULT 1,
    post_count INTEGER NOT NULL DEFAULT 0,
    safety_level TEXT NOT NULL DEFAULT 'high' CHECK (safety_level IN ('high', 'strict_supervised')),
    rules TEXT NOT NULL DEFAULT '["Be respectful and constructive","Educational discussions only","No private external contact sharing for minors","Help peers understand concepts, do not just copy solutions"]',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS community_members (
    id TEXT PRIMARY KEY,
    community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'mentor', 'lead')),
    reputation_points INTEGER NOT NULL DEFAULT 10,
    is_active INTEGER NOT NULL DEFAULT 1,
    joined_at TEXT NOT NULL,
    UNIQUE(community_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_posts (
    id TEXT PRIMARY KEY,
    community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL DEFAULT 'student',
    author_avatar TEXT,
    post_type TEXT NOT NULL CHECK (post_type IN ('question', 'discussion', 'project_showcase', 'resource', 'announcement')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',                      -- JSON array
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    is_solved INTEGER NOT NULL DEFAULT 0,
    solved_comment_id TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'flagged', 'removed')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS community_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL DEFAULT 'student',
    author_avatar TEXT,
    parent_comment_id TEXT,
    content TEXT NOT NULL,
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    is_accepted_answer INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'flagged', 'removed')),
    created_at TEXT NOT NULL
);

-- 2. Mentor Network
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    full_name_km TEXT,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    bio TEXT NOT NULL,
    expertise_areas TEXT NOT NULL DEFAULT '[]',            -- JSON array of strings
    university_id TEXT,
    degree TEXT NOT NULL,
    graduation_year INTEGER,
    verified_badge TEXT NOT NULL CHECK (verified_badge IN ('university_verified', 'industry_pro', 'alumni_star')),
    rating REAL NOT NULL DEFAULT 5.0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    availability_slots TEXT NOT NULL DEFAULT '[]',          -- JSON array of available time windows
    is_accepting_mentees INTEGER NOT NULL DEFAULT 1,
    avatar_url TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    topic TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('academic_guidance', 'curriculum_review', 'scholarship_prep', 'project_feedback')),
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    meeting_link TEXT NOT NULL DEFAULT 'https://meet.cdes.edu.kh/session-room',
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
    student_notes TEXT,
    mentor_feedback TEXT,
    rating INTEGER,
    safety_logged INTEGER NOT NULL DEFAULT 1,              -- All sessions logged for child safety
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 3. Project Collaboration (Student STEM & Digital Inventions)
CREATE TABLE IF NOT EXISTS student_projects (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_km TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ai_software', 'robotics_hardware', 'biotech_science', 'clean_energy', 'civic_tech', 'edtech')),
    creator_id TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    creator_avatar TEXT,
    stage TEXT NOT NULL DEFAULT 'recruiting' CHECK (stage IN ('recruiting', 'in_progress', 'completed', 'showcased')),
    required_skills TEXT NOT NULL DEFAULT '[]',            -- JSON array
    current_team_size INTEGER NOT NULL DEFAULT 1,
    max_team_size INTEGER NOT NULL DEFAULT 4,
    repository_url TEXT,
    live_demo_url TEXT,
    merit_points_reward INTEGER NOT NULL DEFAULT 100,
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    associated_learning_path_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES student_projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    role_in_project TEXT NOT NULL,                        -- e.g., 'Lead Architect', 'Frontend Developer', 'Hardware Circuit Designer'
    status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('applied', 'accepted', 'completed')),
    joined_at TEXT NOT NULL,
    UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES student_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    merit_points INTEGER NOT NULL DEFAULT 30,
    completed_at TEXT
);

-- 4. Events System (Workshops, Webinars, Competitions)
CREATE TABLE IF NOT EXISTS campus_events (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_km TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'webinar', 'hackathon', 'competition', 'ama_session')),
    description TEXT NOT NULL,
    host_organization TEXT NOT NULL,
    host_university_id TEXT,
    speaker_name TEXT NOT NULL,
    speaker_title TEXT NOT NULL,
    speaker_avatar TEXT,
    event_format TEXT NOT NULL CHECK (event_format IN ('virtual', 'physical', 'hybrid')),
    location_or_link TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    registration_deadline TEXT NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 100,
    current_rsvp_count INTEGER NOT NULL DEFAULT 0,
    tags TEXT NOT NULL DEFAULT '[]',                       -- JSON array
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES campus_events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rsvp_status TEXT NOT NULL DEFAULT 'registered' CHECK (rsvp_status IN ('registered', 'attended', 'cancelled')),
    checked_in_at TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(event_id, user_id)
);

-- 5. Partner Organizations & Universities
CREATE TABLE IF NOT EXISTS partner_organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_km TEXT,
    org_type TEXT NOT NULL CHECK (org_type IN ('university', 'ngo', 'industry_partner', 'student_club', 'government_body')),
    description TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    verified_status TEXT NOT NULL DEFAULT 'official_partner' CHECK (verified_status IN ('official_partner', 'verified_org')),
    contact_email TEXT NOT NULL,
    focus_domains TEXT NOT NULL DEFAULT '[]',              -- JSON array
    created_at TEXT NOT NULL
);

-- 6. Safety & Moderation System
CREATE TABLE IF NOT EXISTS moderation_reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    reported_item_type TEXT NOT NULL CHECK (reported_item_type IN ('post', 'comment', 'mentor', 'project', 'message')),
    reported_item_id TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('inappropriate_content', 'harassment', 'spam', 'unsafe_contact_request', 'false_information')),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    moderator_notes TEXT,
    created_at TEXT NOT NULL,
    resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS content_filter_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    matched_rule TEXT NOT NULL,
    raw_snippet TEXT NOT NULL,
    action_taken TEXT NOT NULL CHECK (action_taken IN ('blocked', 'flagged_for_review', 'sanitized')),
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS community_safety_audits (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    checked_by TEXT NOT NULL DEFAULT 'automated_safety_engine',
    check_result TEXT NOT NULL CHECK (check_result IN ('pass', 'warning', 'violation')),
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

-- Phase 7 Indexes
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);
CREATE INDEX IF NOT EXISTS idx_community_members_comm ON community_members(community_id, user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_comm ON community_posts(community_id, created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_mentors_badge ON mentor_profiles(verified_badge);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentor ON mentorship_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_student ON mentorship_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_stage ON student_projects(stage);
CREATE INDEX IF NOT EXISTS idx_project_members_proj ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_proj ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_campus_events_time ON campus_events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_regs_event ON event_registrations(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);

-- ----------------------------------------------------------
-- J. PHASE 8: EDUCATION RESEARCH LABORATORY & LEARNING SCIENCE ENGINE
-- ----------------------------------------------------------

-- 1. Comprehensive Research Experiments
CREATE TABLE IF NOT EXISTS research_experiments (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    research_question TEXT NOT NULL,
    domain TEXT NOT NULL CHECK (domain IN ('stem_foundations', 'moeys_bac_ii', 'computer_science', 'ai_pedagogy', 'retention_science')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'analyzing', 'concluded')),
    primary_metric TEXT NOT NULL DEFAULT 'normalized_learning_gain',
    secondary_metrics TEXT NOT NULL DEFAULT '["time_on_task", "7d_retention", "persistence_rate"]', -- JSON array
    target_sample_size INTEGER NOT NULL DEFAULT 100,
    current_sample_size INTEGER NOT NULL DEFAULT 0,
    power_analysis TEXT NOT NULL DEFAULT '{"alpha": 0.05, "power": 0.80, "target_effect_size": 0.5}', -- JSON
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_by TEXT NOT NULL DEFAULT 'CDES Education Research Council',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Multi-Arm Experiment Cohort Groups (Control vs Interventions)
CREATE TABLE IF NOT EXISTS experiment_groups (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL REFERENCES research_experiments(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    group_type TEXT NOT NULL CHECK (group_type IN ('control', 'experimental')),
    intervention_type TEXT NOT NULL CHECK (intervention_type IN ('traditional', 'interactive', 'ai_assisted', 'game_based')),
    pedagogy_parameters TEXT NOT NULL DEFAULT '{}', -- JSON: scaffolding, pacing, feedback_type
    target_allocation_ratio REAL NOT NULL DEFAULT 0.5,
    participant_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

-- 3. Detailed Experiment Participants with Pre/Post & Retention Metrics
CREATE TABLE IF NOT EXISTS experiment_participants_v2 (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL REFERENCES research_experiments(id) ON DELETE CASCADE,
    group_id TEXT NOT NULL REFERENCES experiment_groups(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    anonymized_id TEXT NOT NULL,
    consent_verified INTEGER NOT NULL DEFAULT 1,
    enrollment_date TEXT NOT NULL,
    completion_status TEXT NOT NULL DEFAULT 'enrolled' CHECK (completion_status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
    pre_test_score REAL,
    post_test_score REAL,
    normalized_gain REAL,
    time_on_task_minutes REAL DEFAULT 0,
    active_interactions_count INTEGER DEFAULT 0,
    retention_score_7d REAL,
    retention_score_30d REAL,
    persistence_rating REAL DEFAULT 80.0,
    updated_at TEXT NOT NULL,
    UNIQUE(experiment_id, student_id)
);

-- 4. Experiment Metrics Definition
CREATE TABLE IF NOT EXISTS experiment_metrics (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL REFERENCES research_experiments(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    measurement_method TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 5. Empirical Results, Statistical Tests & Pedagogical Recommendations
CREATE TABLE IF NOT EXISTS research_results_v2 (
    id TEXT PRIMARY KEY,
    experiment_id TEXT UNIQUE NOT NULL REFERENCES research_experiments(id) ON DELETE CASCADE,
    sample_size INTEGER NOT NULL,
    group_metrics TEXT NOT NULL DEFAULT '{}', -- JSON: mean, std_dev, median for each group
    comparative_analysis TEXT NOT NULL DEFAULT '{}', -- JSON: p_value, t_stat, effect_size_cohens_d, ci_95
    is_statistically_significant INTEGER NOT NULL DEFAULT 1,
    p_value REAL NOT NULL DEFAULT 0.005,
    effect_size_cohens_d REAL NOT NULL DEFAULT 0.68,
    key_findings TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
    pedagogical_recommendation TEXT NOT NULL,
    target_curriculum_revision TEXT,
    published_at TEXT NOT NULL
);

-- 6. Bayesian Knowledge Tracing (BKT) & Mastery States
CREATE TABLE IF NOT EXISTS student_mastery_states (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    concept_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    prior_mastery_p_l0 REAL NOT NULL DEFAULT 0.15,
    transition_prob_p_t REAL NOT NULL DEFAULT 0.18,
    guess_prob_p_g REAL NOT NULL DEFAULT 0.20,
    slip_prob_p_s REAL NOT NULL DEFAULT 0.10,
    current_mastery_prob REAL NOT NULL DEFAULT 0.45,
    mastery_status TEXT NOT NULL DEFAULT 'developing' CHECK (mastery_status IN ('emerging', 'developing', 'mastered', 'retained')),
    total_opportunities INTEGER NOT NULL DEFAULT 1,
    correct_streak INTEGER NOT NULL DEFAULT 0,
    last_practiced_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(student_id, concept_id)
);

-- 7. Diagnostic Misconception & Mistake Taxonomy Logs
CREATE TABLE IF NOT EXISTS misconception_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    misconception_code TEXT NOT NULL,
    misconception_title TEXT NOT NULL,
    error_taxonomy TEXT NOT NULL CHECK (error_taxonomy IN ('conceptual_flaw', 'calculation_slip', 'careless_oversight', 'missing_prerequisite', 'language_comprehension')),
    context_details TEXT NOT NULL,
    suggested_intervention TEXT NOT NULL,
    resolved INTEGER NOT NULL DEFAULT 0,
    logged_at TEXT NOT NULL
);

-- 8. Teaching Method Comparative Benchmarks
CREATE TABLE IF NOT EXISTS teaching_method_benchmarks (
    id TEXT PRIMARY KEY,
    method_key TEXT UNIQUE NOT NULL CHECK (method_key IN ('traditional', 'interactive', 'ai_assisted', 'game_based')),
    method_name TEXT NOT NULL,
    description TEXT NOT NULL,
    avg_engagement_minutes REAL NOT NULL,
    completion_rate_percentage REAL NOT NULL,
    normalized_gain_score REAL NOT NULL,
    retention_rate_30d REAL NOT NULL,
    persistence_index REAL NOT NULL,
    cognitive_load_rating TEXT NOT NULL,
    best_fit_domains TEXT NOT NULL DEFAULT '[]', -- JSON
    sample_students_count INTEGER NOT NULL DEFAULT 500,
    updated_at TEXT NOT NULL
);

-- 9. Teacher Intelligence Class Cohort Analytics
CREATE TABLE IF NOT EXISTS teacher_class_analytics (
    id TEXT PRIMARY KEY,
    class_name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    subject TEXT NOT NULL,
    school_name TEXT NOT NULL,
    province TEXT NOT NULL,
    student_count INTEGER NOT NULL DEFAULT 35,
    average_mastery_percentage REAL NOT NULL DEFAULT 74.5,
    learning_velocity_index REAL NOT NULL DEFAULT 1.15,
    top_misconceptions TEXT NOT NULL DEFAULT '[]', -- JSON array
    recommended_interventions TEXT NOT NULL DEFAULT '[]', -- JSON array
    students_needing_scaffolding INTEGER NOT NULL DEFAULT 5,
    students_accelerating INTEGER NOT NULL DEFAULT 8,
    updated_at TEXT NOT NULL
);

-- 10. Cambodia Education Knowledge Aggregates
CREATE TABLE IF NOT EXISTS education_knowledge_aggregates (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_or_level TEXT NOT NULL,
    difficulty_rating REAL NOT NULL, -- 1 to 5
    provincial_readiness TEXT NOT NULL DEFAULT '{}', -- JSON: province -> readiness %
    top_learning_challenges TEXT NOT NULL DEFAULT '[]', -- JSON array
    career_alignment_score REAL NOT NULL,
    national_curriculum_notes TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 11. Dedicated Research Telemetry Tracking
CREATE TABLE IF NOT EXISTS research_telemetry_events (
    id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL CHECK (event_name IN ('experiment_started', 'experiment_completed', 'learning_improvement', 'teaching_method_effectiveness', 'student_progress_change')),
    student_id TEXT NOT NULL,
    anonymized_id TEXT NOT NULL,
    experiment_id TEXT,
    teaching_method TEXT,
    metric_value REAL,
    metadata TEXT NOT NULL DEFAULT '{}',
    timestamp TEXT NOT NULL
);

-- Phase 8 Indexes
CREATE INDEX IF NOT EXISTS idx_research_exp_status ON research_experiments(status);
CREATE INDEX IF NOT EXISTS idx_exp_groups_exp ON experiment_groups(experiment_id);
CREATE INDEX IF NOT EXISTS idx_exp_parts_exp ON experiment_participants_v2(experiment_id);
CREATE INDEX IF NOT EXISTS idx_exp_parts_stud ON experiment_participants_v2(student_id);
CREATE INDEX IF NOT EXISTS idx_mastery_stud ON student_mastery_states(student_id);
CREATE INDEX IF NOT EXISTS idx_mastery_subj ON student_mastery_states(subject);
CREATE INDEX IF NOT EXISTS idx_misconception_stud ON misconception_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_research_telem_event ON research_telemetry_events(event_name);

-- ==========================================================
-- PHASE 10: CDES KNOWLEDGE SUPPLY CHAIN & CONTENT ECOSYSTEM
-- ==========================================================

-- 1. Content Categories
CREATE TABLE IF NOT EXISTS content_categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_km TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    parent_id TEXT REFERENCES content_categories(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 2. Content Authors & Verified Contributors
CREATE TABLE IF NOT EXISTS content_authors (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT NOT NULL,
    name_km TEXT,
    role_type TEXT NOT NULL CHECK (role_type IN (
        'university_faculty',
        'high_school_teacher',
        'industry_expert',
        'researcher',
        'educational_psychologist',
        'curriculum_specialist'
    )),
    affiliation TEXT NOT NULL,
    verified_credentials TEXT NOT NULL DEFAULT '[]', -- JSON array of credentials
    reputation_score REAL NOT NULL DEFAULT 85.0, -- 0 to 100
    total_contributions INTEGER NOT NULL DEFAULT 0,
    bio TEXT,
    contact_email TEXT,
    created_at TEXT NOT NULL
);

-- 3. Content Sources & Institutional Provenance
CREATE TABLE IF NOT EXISTS content_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN (
        'moeys_official',
        'accredited_university',
        'peer_reviewed_journal',
        'industry_association',
        'curriculum_board'
    )),
    website_url TEXT,
    reliability_tier TEXT NOT NULL CHECK (reliability_tier IN (
        'tier_1_official',
        'tier_2_peer_reviewed',
        'tier_3_verified_expert',
        'tier_4_community_draft'
    )),
    audit_date TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 4. Core Knowledge Contents
CREATE TABLE IF NOT EXISTS knowledge_contents (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES content_categories(id),
    author_id TEXT NOT NULL REFERENCES content_authors(id),
    source_id TEXT NOT NULL REFERENCES content_sources(id),
    title_en TEXT NOT NULL,
    title_km TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'decision_guide',
        'interactive_stem_module',
        'cognitive_psychology',
        'career_pathway',
        'professional_competency'
    )),
    summary TEXT NOT NULL,
    body_markdown TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'km' CHECK (language IN ('km', 'en', 'bilingual')),
    target_grades TEXT NOT NULL DEFAULT '[]', -- JSON array: e.g. ["grade_10","grade_11","grade_12"]
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',
        'submitted',
        'under_review',
        'verified',
        'published',
        'archived'
    )),
    trust_score REAL NOT NULL DEFAULT 80.0, -- 0 to 100 calculated score
    view_count INTEGER NOT NULL DEFAULT 0,
    helpful_votes INTEGER NOT NULL DEFAULT 0,
    unhelpful_votes INTEGER NOT NULL DEFAULT 0,
    embedding_id TEXT,
    vector_indexed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 5. Content Verifications & Multi-Tier Audits
CREATE TABLE IF NOT EXISTS content_verifications (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL REFERENCES knowledge_contents(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL REFERENCES users(id),
    reviewer_role TEXT NOT NULL CHECK (reviewer_role IN (
        'curriculum_auditor',
        'faculty_dean',
        'child_safety_officer',
        'psychologist_reviewer'
    )),
    review_decision TEXT NOT NULL CHECK (review_decision IN (
        'approved',
        'rejected',
        'revision_requested'
    )),
    pedagogical_score REAL NOT NULL, -- 0 to 100
    factual_accuracy_score REAL NOT NULL, -- 0 to 100
    safety_compliance_score REAL NOT NULL, -- 0 to 100
    comments TEXT NOT NULL,
    audit_hash TEXT NOT NULL,
    verified_at TEXT NOT NULL
);

-- 6. Learning Objectives (Bloom's Taxonomy & BKT mapping)
CREATE TABLE IF NOT EXISTS learning_objectives (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL REFERENCES knowledge_contents(id) ON DELETE CASCADE,
    objective_code TEXT NOT NULL,
    bloom_taxonomy_level TEXT NOT NULL CHECK (bloom_taxonomy_level IN (
        'remember',
        'understand',
        'apply',
        'analyze',
        'evaluate',
        'create'
    )),
    description_en TEXT NOT NULL,
    description_km TEXT NOT NULL,
    bkt_skill_id TEXT,
    target_mastery_probability REAL NOT NULL DEFAULT 0.85
);

-- 7. Content Feedback & Student Learning Analytics Loop
CREATE TABLE IF NOT EXISTS content_feedback (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL REFERENCES knowledge_contents(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    clarity_rating INTEGER CHECK (clarity_rating BETWEEN 1 AND 5),
    relevance_rating INTEGER CHECK (relevance_rating BETWEEN 1 AND 5),
    qualitative_comment TEXT,
    reported_issue TEXT,
    is_resolved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

-- Phase 10 Knowledge Indexes
CREATE INDEX IF NOT EXISTS idx_kc_category ON knowledge_contents(category_id);
CREATE INDEX IF NOT EXISTS idx_kc_author ON knowledge_contents(author_id);
CREATE INDEX IF NOT EXISTS idx_kc_source ON knowledge_contents(source_id);
CREATE INDEX IF NOT EXISTS idx_kc_status ON knowledge_contents(status);
CREATE INDEX IF NOT EXISTS idx_kc_trust_score ON knowledge_contents(trust_score);
CREATE INDEX IF NOT EXISTS idx_kc_vector ON knowledge_contents(vector_indexed_at);
CREATE INDEX IF NOT EXISTS idx_cv_content ON content_verifications(content_id);
CREATE INDEX IF NOT EXISTS idx_lo_content ON learning_objectives(content_id);
CREATE INDEX IF NOT EXISTS idx_cf_content ON content_feedback(content_id);
CREATE INDEX IF NOT EXISTS idx_cf_student ON content_feedback(student_id);

-- ==========================================================
-- PHASE 12: DIGITAL CAMPUS WORLD & GAME LIFE SIMULATION
-- ==========================================================

-- 1. Digital World Real Estate & Server Shards
CREATE TABLE IF NOT EXISTS campus_worlds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    realm_type TEXT NOT NULL CHECK (realm_type IN ('sandbox', 'academic_term', 'national_championship', 'research_commons')),
    season_id TEXT NOT NULL DEFAULT 'season_2026_bac2',
    weather_state TEXT NOT NULL DEFAULT 'sunny' CHECK (weather_state IN ('sunny', 'tropical_breeze', 'monsoon_rain', 'twilight_glow', 'night_nebula')),
    day_night_cycle_minutes INTEGER NOT NULL DEFAULT 60,
    active_population INTEGER NOT NULL DEFAULT 0,
    max_capacity INTEGER NOT NULL DEFAULT 50000,
    created_at TEXT NOT NULL
);

-- 2. Campus World Zones & Specific Locations
CREATE TABLE IF NOT EXISTS campus_world_locations (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL REFERENCES campus_worlds(id) ON DELETE CASCADE,
    zone_key TEXT NOT NULL CHECK (zone_key IN (
        'student_home', 'campus_plaza', 'grand_library', 'stem_laboratory',
        'career_center', 'innovation_workshop', 'community_commons'
    )),
    name_en TEXT NOT NULL,
    name_km TEXT NOT NULL,
    description TEXT NOT NULL,
    coordinates_3d TEXT NOT NULL DEFAULT '{"x":0,"y":0,"z":0}',
    bounding_radius REAL NOT NULL DEFAULT 50.0,
    ambient_audio_track TEXT,
    lighting_preset TEXT NOT NULL DEFAULT 'golden_hour',
    pedagogical_focus TEXT NOT NULL,
    interactive_hotspots TEXT NOT NULL DEFAULT '[]', -- JSON array of interactive objects/NPCs
    created_at TEXT NOT NULL
);

-- 3. Advanced Avatar Entities & Growth Progression
CREATE TABLE IF NOT EXISTS campus_avatar_entities (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_name TEXT NOT NULL,
    growth_stage TEXT NOT NULL DEFAULT 'explorer' CHECK (growth_stage IN (
        'novice_scholar', 'curious_explorer', 'stem_apprentice',
        'innovation_fellow', 'society_architect'
    )),
    visual_customization TEXT NOT NULL DEFAULT '{}', -- JSON: hair, skin, outfit, aura, accessory
    room_customization TEXT NOT NULL DEFAULT '{}',   -- JSON: wallpaper, flooring, desk_tier, window_view
    academic_level INTEGER NOT NULL DEFAULT 1,
    experience_points INTEGER NOT NULL DEFAULT 0,
    merit_coins INTEGER NOT NULL DEFAULT 150,
    scholar_crystals INTEGER NOT NULL DEFAULT 10,
    grit_persistence_rating REAL NOT NULL DEFAULT 82.5,
    curiosity_index REAL NOT NULL DEFAULT 78.0,
    last_zone_id TEXT REFERENCES campus_world_locations(id),
    current_mood TEXT NOT NULL DEFAULT 'focused' CHECK (current_mood IN (
        'focused', 'inspired', 'determined', 'reflective', 'celebrating'
    )),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 4. Digital Items, Furniture, Lab Equipment & Attire
CREATE TABLE IF NOT EXISTS campus_digital_items (
    id TEXT PRIMARY KEY,
    item_code TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_km TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN (
        'furniture', 'trophy', 'attire', 'stem_tool', 'research_manuscript', 'companion_skin'
    )),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'national_master')),
    unlock_criteria_type TEXT NOT NULL CHECK (unlock_criteria_type IN (
        'merit_store', 'bac2_milestone', 'stem_lab_completion', 'scholarship_quest', 'research_peer_review'
    )),
    unlock_cost_coins INTEGER NOT NULL DEFAULT 0,
    stat_modifiers TEXT NOT NULL DEFAULT '{}', -- e.g. {"focus_boost": +5, "bkt_learning_rate": +0.03}
    model_asset_uri TEXT NOT NULL,
    preview_icon TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 5. Student Inventory & Placed Sanctuary Objects
CREATE TABLE IF NOT EXISTS student_inventory_items (
    id TEXT PRIMARY KEY,
    avatar_id TEXT NOT NULL REFERENCES campus_avatar_entities(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES campus_digital_items(id) ON DELETE CASCADE,
    is_equipped INTEGER NOT NULL DEFAULT 0,
    is_placed_in_room INTEGER NOT NULL DEFAULT 0,
    room_placement_coords TEXT, -- JSON: {x, y, z, rotation}
    acquired_at TEXT NOT NULL
);

-- 6. Learning Missions & Gamification Progression
CREATE TABLE IF NOT EXISTS campus_learning_missions (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_km TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('daily_habit', 'stem_challenge', 'career_inquiry', 'capstone_project')),
    xp_reward INTEGER NOT NULL DEFAULT 50,
    coin_reward INTEGER NOT NULL DEFAULT 25,
    required_learning_activity_id TEXT,
    prerequisite_mission_id TEXT REFERENCES campus_learning_missions(id),
    completion_criteria TEXT NOT NULL, -- JSON
    created_at TEXT NOT NULL
);

-- 7. Educational Games & Simulation Scenarios
CREATE TABLE IF NOT EXISTS campus_educational_games (
    id TEXT PRIMARY KEY,
    game_key TEXT UNIQUE NOT NULL CHECK (game_key IN (
        'animal_racing_physics', 'angkor_adventure_hydraulics',
        'phnom_penh_smart_city', 'quantum_stem_lab'
    )),
    title_en TEXT NOT NULL,
    title_km TEXT NOT NULL,
    genre TEXT NOT NULL,
    stem_learning_objective TEXT NOT NULL,
    target_competencies TEXT NOT NULL DEFAULT '[]', -- JSON array of MoEYS/BKT skills
    game_engine_target TEXT NOT NULL DEFAULT 'threejs_webgl' CHECK (game_engine_target IN (
        'threejs_webgl', 'webgpu', 'unity_wasm', 'unreal_pixel_streaming'
    )),
    is_live INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 8. Game Telemetry Events & Student Intelligence Feedback
CREATE TABLE IF NOT EXISTS game_telemetry_events (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL REFERENCES campus_educational_games(id),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'scenario_started', 'hypothesis_tested', 'variable_adjusted',
        'puzzle_solved', 'failure_recovery', 'solution_optimized'
    )),
    trial_count INTEGER NOT NULL DEFAULT 1,
    error_recovery_time_seconds REAL,
    bkt_inferred_skill TEXT NOT NULL,
    prior_probability REAL NOT NULL,
    posterior_probability REAL NOT NULL,
    game_state_payload TEXT NOT NULL DEFAULT '{}',
    timestamp TEXT NOT NULL
);

-- 9. AI Companion "Mith" (មិត្ត) Persona & Cognitive Memory
CREATE TABLE IF NOT EXISTS ai_companion_states (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    companion_name TEXT NOT NULL DEFAULT 'Mith (មិត្ត)',
    current_archetype TEXT NOT NULL DEFAULT 'socratic_mentor' CHECK (current_archetype IN (
        'socratic_mentor', 'supportive_peer', 'curious_explorer', 'strict_evaluator'
    )),
    affinity_level INTEGER NOT NULL DEFAULT 1,
    bond_experience INTEGER NOT NULL DEFAULT 0,
    emotional_state TEXT NOT NULL DEFAULT 'attentive',
    memory_context TEXT NOT NULL DEFAULT '[]', -- JSON: key student struggle points & aspirations
    last_interaction_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Phase 12 Digital World Indexes
CREATE INDEX IF NOT EXISTS idx_world_loc ON campus_world_locations(world_id);
CREATE INDEX IF NOT EXISTS idx_avatar_student ON campus_avatar_entities(student_id);
CREATE INDEX IF NOT EXISTS idx_inv_avatar ON student_inventory_items(avatar_id);
CREATE INDEX IF NOT EXISTS idx_inv_item ON student_inventory_items(item_id);
CREATE INDEX IF NOT EXISTS idx_game_telem_student ON game_telemetry_events(student_id);
CREATE INDEX IF NOT EXISTS idx_game_telem_game ON game_telemetry_events(game_id);
CREATE INDEX IF NOT EXISTS idx_companion_student ON ai_companion_states(student_id);

-- ==========================================
-- PHASE 13: CDES PERSONAL EDUCATION INTELLIGENCE AGENT 2.0 & MULTI-AGENT OS
-- ==========================================

-- 1. Multi-Agent Registry (6 Specialized Agents + Meta-Orchestrator)
CREATE TABLE IF NOT EXISTS ai_orchestrator_agents (
    id TEXT PRIMARY KEY,
    agent_key TEXT UNIQUE NOT NULL CHECK (agent_key IN (
        'education_advisor', 'career_intelligence', 'learning_coach',
        'research_agent', 'parent_assistant', 'teacher_assistant'
    )),
    name_en TEXT NOT NULL,
    name_km TEXT NOT NULL,
    role_description TEXT NOT NULL,
    specialization_domain TEXT NOT NULL,
    reasoning_archetype TEXT NOT NULL,
    primary_color TEXT NOT NULL DEFAULT '#4F46E5',
    icon_key TEXT NOT NULL DEFAULT 'bot',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 2. 7-Pillar Long-Term Student Memory
CREATE TABLE IF NOT EXISTS student_longterm_memory_profiles (
    student_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    identity_context TEXT NOT NULL DEFAULT '{}',       -- JSON: name, grade, school, language, background
    goals_context TEXT NOT NULL DEFAULT '{}',           -- JSON: short-term (Bac II), long-term (university, career)
    interests_context TEXT NOT NULL DEFAULT '[]',       -- JSON array of verified interest vectors with weights
    strengths_context TEXT NOT NULL DEFAULT '[]',       -- JSON array: cognitive competencies, verified high BKT skills
    weaknesses_context TEXT NOT NULL DEFAULT '[]',      -- JSON array: misconception patterns, persistent struggle areas
    learning_patterns TEXT NOT NULL DEFAULT '{}',      -- JSON: pacing velocity, peak focus hours, preferred explanation mode
    achievements_context TEXT NOT NULL DEFAULT '[]',   -- JSON array: verified certificates, contest wins, lab mastery
    memory_confidence_score REAL NOT NULL DEFAULT 85.0,
    last_reflection_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 3. Episodic Memory Mutation Audit Logs
CREATE TABLE IF NOT EXISTS student_memory_audit_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_layer TEXT NOT NULL CHECK (source_layer IN ('conversation', 'lab_simulation', 'assessment', 'game_telemetry', 'teacher_note')),
    pillar_mutated TEXT NOT NULL CHECK (pillar_mutated IN ('identity', 'goals', 'interests', 'strengths', 'weaknesses', 'patterns', 'achievements')),
    prior_state TEXT,
    new_state TEXT NOT NULL,
    confidence_delta REAL NOT NULL DEFAULT 0.0,
    observation_context TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

-- 4. AI Action Plans & Career Roadmaps
CREATE TABLE IF NOT EXISTS ai_action_plans (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('learning_plan', 'career_roadmap', 'scholarship_sprint', 'stem_mastery')),
    title TEXT NOT NULL,
    target_objective TEXT NOT NULL,
    timeframe_weeks INTEGER NOT NULL DEFAULT 12,
    progress_percentage REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'recalibrating')),
    metadata_payload TEXT NOT NULL DEFAULT '{}',       -- JSON: target university, career role, MoEYS grade
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 5. AI Action Milestones
CREATE TABLE IF NOT EXISTS ai_action_milestones (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL REFERENCES ai_action_plans(id) ON DELETE CASCADE,
    milestone_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_date TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    linked_entity_type TEXT,                            -- 'course', 'lab', 'scholarship', 'quiz', 'community_event'
    linked_entity_id TEXT,
    completed_at TEXT
);

-- 6. Adaptive Learning Tutor Sessions
CREATE TABLE IF NOT EXISTS adaptive_tutor_sessions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    current_explanation_mode TEXT NOT NULL DEFAULT 'intuitive' CHECK (current_explanation_mode IN (
        'intuitive', 'rigorous', 'visual', 'socratic'
    )),
    zpd_difficulty_level TEXT NOT NULL DEFAULT 'intermediate' CHECK (zpd_difficulty_level IN (
        'foundation', 'beginner', 'intermediate', 'advanced', 'olympiad'
    )),
    error_recovery_count INTEGER NOT NULL DEFAULT 0,
    scaffolding_history TEXT NOT NULL DEFAULT '[]',     -- JSON array of hints and stepped explanations
    last_drill_recommended TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 7. AI Safety & Ethical Guardrail Audits
CREATE TABLE IF NOT EXISTS ai_safety_guardrail_audits (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    agent_key TEXT NOT NULL,
    user_prompt_snippet TEXT NOT NULL,
    flagged_policy TEXT NOT NULL CHECK (flagged_policy IN (
        'no_psychological_diagnosis', 'no_absolute_career_decision',
        'no_harmful_profiling', 'child_protection_safeguard', 'pii_leakage_prevented', 'none_safe'
    )),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
    action_taken TEXT NOT NULL CHECK (action_taken IN ('passed', 'refused_and_referred', 'neutralized', 'escalated_to_educator')),
    intervention_explanation TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

-- 8. Knowledge Ingestion, Verification & RAG Pipeline
CREATE TABLE IF NOT EXISTS knowledge_pipeline_documents (
    id TEXT PRIMARY KEY,
    document_title TEXT NOT NULL,
    curriculum_domain TEXT NOT NULL,                   -- 'MoEYS Bac II', 'Higher Ed Cambodia', 'STEM Research', 'Scholarship Rules'
    source_agency TEXT NOT NULL,                       -- 'MoEYS', 'ITC', 'CADT', 'MPTC', 'UNESCO'
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('ingested', 'peer_reviewed', 'verified', 'deprecated')),
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-004-dense-128',
    chunk_count INTEGER NOT NULL DEFAULT 1,
    confidence_score REAL NOT NULL DEFAULT 0.98,
    last_verified_at TEXT NOT NULL,
    ingested_at TEXT NOT NULL
);

-- 9. Closed-Loop AI Interaction & Outcome Analytics
CREATE TABLE IF NOT EXISTS ai_interaction_analytics_events (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_stage TEXT NOT NULL CHECK (event_stage IN (
        'conversation_initiated', 'recommendation_delivered',
        'recommendation_accepted', 'plan_milestone_completed', 'academic_outcome_achieved'
    )),
    agent_key TEXT NOT NULL,
    item_reference_id TEXT,
    details TEXT NOT NULL DEFAULT '{}',                -- JSON: metrics, delta scores, feedback
    timestamp TEXT NOT NULL
);

-- Phase 13 Indexes
CREATE INDEX IF NOT EXISTS idx_longterm_memory_student ON student_longterm_memory_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_student ON ai_action_plans(student_id, status);
CREATE INDEX IF NOT EXISTS idx_action_milestones_plan ON ai_action_milestones(plan_id, milestone_order);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_student ON adaptive_tutor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_safety_audits_student ON ai_safety_guardrail_audits(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_student ON ai_interaction_analytics_events(student_id, event_stage);

-- ==========================================================
-- PHASE 14: DATA STRATEGY & EDUCATION INTELLIGENCE FOUNDATION
-- CDES Enterprise Data Architecture, Lakehouse, Vector DB,
-- Feature Store, Closed-Loop Flywheel, Governance & ML
-- ==========================================================

-- ----------------------------------------------------------
-- 1. EDUCATION KNOWLEDGE DATABASE (Task 2)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS cdes_universities_lake (
    id TEXT PRIMARY KEY,
    abbr TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_km TEXT NOT NULL,
    established_year INTEGER NOT NULL,
    accreditation_body TEXT NOT NULL,
    moeys_recognition TEXT NOT NULL DEFAULT 'Accredited',
    campus_city TEXT NOT NULL,
    province TEXT NOT NULL,
    institution_type TEXT NOT NULL CHECK (institution_type IN ('Public Autonomous', 'Public State', 'Private Higher Ed', 'Polytechnic Institute')),
    student_count INTEGER NOT NULL,
    faculty_ratio TEXT NOT NULL,
    tuition_usd_annual INTEGER NOT NULL,
    tronc_commun_mandatory BOOLEAN NOT NULL DEFAULT 1,
    bac_ii_min_grade TEXT NOT NULL,
    entrance_exam_req BOOLEAN NOT NULL DEFAULT 1,
    avg_employment_rate REAL NOT NULL,
    top_sectors_json TEXT NOT NULL DEFAULT '[]',
    programs_count INTEGER NOT NULL,
    accreditation_status TEXT NOT NULL DEFAULT 'ACC Level 1',
    data_confidence TEXT NOT NULL DEFAULT 'official',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_scholarships_lake (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    scholarship_type TEXT NOT NULL CHECK (scholarship_type IN ('Government Merit', 'Techo Digital Talent', 'International Bilateral', 'University Equity', 'Private Corporate')),
    coverage_percentage INTEGER NOT NULL,
    coverage_details TEXT NOT NULL,
    stipend_monthly_usd INTEGER NOT NULL DEFAULT 0,
    target_education_tier TEXT NOT NULL,
    provincial_quota_flag BOOLEAN NOT NULL DEFAULT 0,
    priority_fields_json TEXT NOT NULL DEFAULT '[]',
    min_gpa_or_grade TEXT NOT NULL,
    deadline TEXT NOT NULL,
    annual_recipient_quota INTEGER NOT NULL,
    application_url TEXT NOT NULL,
    verified_by TEXT NOT NULL DEFAULT 'MoEYS / CDES Secretariat',
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_careers_lake (
    id TEXT PRIMARY KEY,
    soc_code TEXT NOT NULL UNIQUE,
    title_en TEXT NOT NULL,
    title_km TEXT NOT NULL,
    onet_taxonomy_code TEXT NOT NULL,
    industry_domain TEXT NOT NULL,
    entry_salary_usd INTEGER NOT NULL,
    median_salary_usd INTEGER NOT NULL,
    senior_salary_usd INTEGER NOT NULL,
    projected_growth_5yr REAL NOT NULL,
    automation_risk_pct REAL NOT NULL,
    top_skills_json TEXT NOT NULL DEFAULT '[]',
    education_requirement TEXT NOT NULL,
    asean_mobility_tier TEXT NOT NULL,
    demand_index REAL NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_industries_lake (
    id TEXT PRIMARY KEY,
    sector_code TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_km TEXT NOT NULL,
    gdp_contribution_pct REAL NOT NULL,
    digital_transformation_index REAL NOT NULL,
    strategic_priority_level TEXT NOT NULL,
    total_formal_workforce INTEGER NOT NULL,
    hiring_velocity_index REAL NOT NULL,
    top_employers_json TEXT NOT NULL DEFAULT '[]',
    key_growth_drivers TEXT NOT NULL,
    partner_institutions_count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_psychometrics_lake (
    id TEXT PRIMARY KEY,
    instrument_code TEXT NOT NULL,
    instrument_name TEXT NOT NULL,
    dimension_key TEXT NOT NULL,
    dimension_label TEXT NOT NULL,
    description TEXT NOT NULL,
    educational_application TEXT NOT NULL,
    pedagogical_strategy TEXT NOT NULL,
    scale_range_min REAL NOT NULL DEFAULT 1.0,
    scale_range_max REAL NOT NULL DEFAULT 5.0,
    assessment_items_count INTEGER NOT NULL,
    non_clinical_guarantee BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_learning_science_lake (
    id TEXT PRIMARY KEY,
    framework_name TEXT NOT NULL,
    level_or_phase TEXT NOT NULL,
    cognitive_domain TEXT NOT NULL,
    definition TEXT NOT NULL,
    action_verbs_json TEXT NOT NULL DEFAULT '[]',
    scaffolding_techniques_json TEXT NOT NULL DEFAULT '[]',
    ebbinghaus_decay_factor REAL NOT NULL DEFAULT 0.25,
    cognitive_load_type TEXT NOT NULL CHECK (cognitive_load_type IN ('intrinsic', 'extraneous', 'germane')),
    misconception_countermeasures_json TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL
);

-- ----------------------------------------------------------
-- 2. STUDENT INTELLIGENCE DATABASE (Task 3)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS cdes_student_identities (
    student_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sovereign_pseudonym TEXT NOT NULL,
    academic_grade TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    province_origin TEXT NOT NULL,
    geographic_tier TEXT NOT NULL CHECK (geographic_tier IN ('Tier 1 Capital', 'Tier 2 Provincial Hub', 'Tier 3 Remote Provincial')),
    socioeconomic_access_bracket TEXT NOT NULL,
    primary_language TEXT NOT NULL DEFAULT 'km',
    consent_status TEXT NOT NULL DEFAULT 'fully_consented',
    encryption_key_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_student_goals (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_category TEXT NOT NULL CHECK (goal_category IN ('bac_ii_exam', 'university_admission', 'scholarship_award', 'career_aspiration', 'stem_mastery')),
    target_title TEXT NOT NULL,
    target_deadline TEXT NOT NULL,
    priority_level TEXT NOT NULL CHECK (priority_level IN ('critical', 'high', 'medium', 'exploratory')),
    progress_pct INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved', 'paused', 'realigned')),
    verification_criteria TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_student_interest_vectors (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain_key TEXT NOT NULL,
    explicit_weight REAL NOT NULL DEFAULT 0.5,
    inferred_weight REAL NOT NULL DEFAULT 0.5,
    composite_score REAL NOT NULL DEFAULT 0.5,
    last_interaction_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_student_behavioral_telemetry (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    dwell_time_sec INTEGER NOT NULL,
    hesitation_latency_sec INTEGER NOT NULL,
    hint_requests_count INTEGER NOT NULL DEFAULT 0,
    error_attempts_count INTEGER NOT NULL DEFAULT 0,
    completion_status TEXT NOT NULL CHECK (completion_status IN ('completed', 'abandoned', 'mastered_first_try', 'mastered_with_hints')),
    persistence_score REAL NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_student_learning_patterns (
    student_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    chronotype_peak TEXT NOT NULL,
    avg_session_duration_min INTEGER NOT NULL,
    cognitive_stamina_half_life_min INTEGER NOT NULL,
    preferred_modality TEXT NOT NULL,
    error_recovery_velocity REAL NOT NULL,
    consistency_streak_days INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_student_achievements (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    issuing_body TEXT NOT NULL,
    date_earned TEXT NOT NULL,
    verified_proof_hash TEXT NOT NULL,
    credential_tier TEXT NOT NULL,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_student_projects (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    repository_url TEXT,
    live_demo_url TEXT,
    rubric_score REAL NOT NULL,
    skills_demonstrated_json TEXT NOT NULL DEFAULT '[]',
    verified_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- ----------------------------------------------------------
-- 3. ANALYTICS EVENTS & CLOSED-LOOP FLYWHEEL (Tasks 4, 5, 6)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS cdes_analytics_events_stream (
    id TEXT PRIMARY KEY,
    event_uuid TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_category TEXT NOT NULL,
    properties_json TEXT NOT NULL DEFAULT '{}',
    user_agent TEXT,
    client_timestamp TEXT NOT NULL,
    server_timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_recommendation_improvement_loop (
    loop_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('university_program', 'scholarship_application', 'learning_drill', 'career_pathway', 'mentor_pairing')),
    candidate_id TEXT NOT NULL,
    candidate_title TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    impression_at TEXT NOT NULL,
    action_taken TEXT NOT NULL CHECK (action_taken IN ('viewed', 'saved', 'applied', 'drilled', 'completed', 'dismissed')),
    action_at TEXT NOT NULL,
    time_to_action_sec INTEGER NOT NULL,
    outcome_metric_name TEXT NOT NULL,
    baseline_metric_value REAL NOT NULL,
    post_outcome_metric_value REAL NOT NULL,
    outcome_delta REAL NOT NULL,
    attribution_weight REAL NOT NULL DEFAULT 1.0,
    algorithm_version TEXT NOT NULL DEFAULT 'v2.4-bandit-hybrid',
    feedback_status TEXT NOT NULL DEFAULT 'incorporated'
);

-- ----------------------------------------------------------
-- 4. FEATURE STORE & FUTURE MACHINE LEARNING (Tasks 1, 8, 9)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS cdes_feature_store_online (
    entity_id TEXT NOT NULL,
    feature_group TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    feature_value_json TEXT NOT NULL,
    ttl_seconds INTEGER NOT NULL DEFAULT 86400,
    last_updated_at TEXT NOT NULL,
    PRIMARY KEY (entity_id, feature_group, feature_key)
);

CREATE TABLE IF NOT EXISTS cdes_feature_store_offline_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    feature_group TEXT NOT NULL,
    snapshot_timestamp TEXT NOT NULL,
    feature_vector_json TEXT NOT NULL,
    partition_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_ml_models_registry (
    model_id TEXT PRIMARY KEY,
    model_name TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('grade_prediction', 'university_recommendation', 'spaced_repetition_optimization', 'career_competency_gap', 'dropout_risk_early_warning')),
    framework TEXT NOT NULL,
    algorithm TEXT NOT NULL,
    version TEXT NOT NULL,
    accuracy_score REAL NOT NULL,
    f1_or_rmse REAL NOT NULL,
    parameters_json TEXT NOT NULL DEFAULT '{}',
    training_dataset_size INTEGER NOT NULL,
    deployment_status TEXT NOT NULL CHECK (deployment_status IN ('champion_production', 'challenger_canary', 'shadow_evaluation', 'retired')),
    registered_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cdes_ml_prediction_logs (
    prediction_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    model_id TEXT NOT NULL REFERENCES cdes_ml_models_registry(model_id),
    model_version TEXT NOT NULL,
    input_features_json TEXT NOT NULL,
    prediction_result_json TEXT NOT NULL,
    calibrated_confidence REAL NOT NULL,
    ground_truth_json TEXT,
    latency_ms INTEGER NOT NULL,
    predicted_at TEXT NOT NULL
);

-- ----------------------------------------------------------
-- 5. DATA GOVERNANCE & SOVEREIGN PRIVACY (Task 7)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS cdes_data_governance_consents (
    consent_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_scope TEXT NOT NULL,
    is_minor BOOLEAN NOT NULL DEFAULT 1,
    parent_guardian_approved BOOLEAN NOT NULL DEFAULT 1,
    school_administrator_approved BOOLEAN NOT NULL DEFAULT 1,
    allowed_for_personalization BOOLEAN NOT NULL DEFAULT 1,
    allowed_for_research_aggregates BOOLEAN NOT NULL DEFAULT 1,
    granted_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS cdes_data_quality_scorecards (
    scorecard_id TEXT PRIMARY KEY,
    dataset_name TEXT NOT NULL,
    completeness_pct REAL NOT NULL,
    freshness_sla_met BOOLEAN NOT NULL DEFAULT 1,
    accuracy_pct REAL NOT NULL,
    consistency_pct REAL NOT NULL,
    uniqueness_pct REAL NOT NULL,
    overall_health_grade TEXT NOT NULL CHECK (overall_health_grade IN ('A+', 'A', 'B', 'C', 'Action Required')),
    critical_issues_count INTEGER NOT NULL DEFAULT 0,
    audit_summary_json TEXT NOT NULL DEFAULT '{}',
    audited_at TEXT NOT NULL
);

-- Phase 14 Indexes for High-Velocity Query Routing
CREATE INDEX IF NOT EXISTS idx_cdes_univ_type ON cdes_universities_lake(institution_type, province);
CREATE INDEX IF NOT EXISTS idx_cdes_scholarship_type ON cdes_scholarships_lake(scholarship_type, deadline);
CREATE INDEX IF NOT EXISTS idx_cdes_career_industry ON cdes_careers_lake(industry_domain, demand_index);
CREATE INDEX IF NOT EXISTS idx_cdes_student_behavior ON cdes_student_behavioral_telemetry(student_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_cdes_stream_student ON cdes_analytics_events_stream(student_id, event_category);
CREATE INDEX IF NOT EXISTS idx_cdes_rec_loop ON cdes_recommendation_improvement_loop(student_id, recommendation_type, action_taken);
CREATE INDEX IF NOT EXISTS idx_cdes_fs_online ON cdes_feature_store_online(entity_id, feature_group);
CREATE INDEX IF NOT EXISTS idx_cdes_ml_logs ON cdes_ml_prediction_logs(student_id, model_id);
CREATE INDEX IF NOT EXISTS idx_cdes_governance ON cdes_data_governance_consents(student_id, consent_scope);
CREATE INDEX IF NOT EXISTS idx_cdes_dq ON cdes_data_quality_scorecards(dataset_name, overall_health_grade);



