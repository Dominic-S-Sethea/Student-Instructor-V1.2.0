-- Migration 012: Persisted JWT Revocation, Token Versioning, Community Vote Deduplication,
-- Mentorship Slot Uniqueness, ON DELETE SET NULL Audit FKs, Missing FK/Sort Indexes, and Dead Table Cleanup

-- 1. Persisted JWT revocation store & user token_version for restart-safe logout & logout-all
CREATE TABLE IF NOT EXISTS revoked_jwt_tokens (
    jti TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    revoked_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_revoked_jwt_expires ON revoked_jwt_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_revoked_jwt_user ON revoked_jwt_tokens(user_id);

ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 1;

-- 2. Per-user community upvote deduplication
CREATE TABLE IF NOT EXISTS community_votes (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment', 'project')),
    entity_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    UNIQUE(entity_type, entity_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_votes_user ON community_votes(user_id);

-- 3. Prevent double-booking the same mentor slot for active mentorship sessions
CREATE UNIQUE INDEX IF NOT EXISTS idx_mentorship_mentor_slot
    ON mentorship_sessions(mentor_id, scheduled_date, scheduled_time)
    WHERE status IN ('pending', 'confirmed');

-- 4. Rebuild user-attributed audit/submission tables with ON DELETE SET NULL so hard user deletion never fails FK checks
CREATE TABLE IF NOT EXISTS verification_records_v12 (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    verified_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    verifier_name TEXT NOT NULL,
    verification_method TEXT NOT NULL,
    confidence_stars INTEGER NOT NULL DEFAULT 5,
    source_url TEXT,
    verification_notes TEXT,
    verified_at TEXT NOT NULL
);
INSERT OR IGNORE INTO verification_records_v12 (
    id, scholarship_id, verified_by_user_id, verifier_name, verification_method,
    confidence_stars, source_url, verification_notes, verified_at
)
SELECT
    vr.id, vr.scholarship_id,
    CASE WHEN EXISTS (SELECT 1 FROM users u WHERE u.id = vr.verified_by_user_id) THEN vr.verified_by_user_id ELSE NULL END,
    vr.verifier_name, vr.verification_method, vr.confidence_stars, vr.source_url, vr.verification_notes, vr.verified_at
FROM verification_records vr
WHERE EXISTS (SELECT 1 FROM scholarships s WHERE s.id = vr.scholarship_id);
DROP TABLE verification_records;
ALTER TABLE verification_records_v12 RENAME TO verification_records;
CREATE INDEX IF NOT EXISTS idx_verification_records_scholarship ON verification_records(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_verification_records_user ON verification_records(verified_by_user_id);

CREATE TABLE IF NOT EXISTS change_history_v12 (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    changed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    change_summary TEXT,
    created_at TEXT NOT NULL
);
INSERT OR IGNORE INTO change_history_v12 (
    id, entity_type, entity_id, changed_by_user_id, action,
    previous_state, new_state, change_summary, created_at
)
SELECT
    ch.id, ch.entity_type, ch.entity_id,
    CASE WHEN EXISTS (SELECT 1 FROM users u WHERE u.id = ch.changed_by_user_id) THEN ch.changed_by_user_id ELSE NULL END,
    ch.action, ch.previous_state, ch.new_state, ch.change_summary, ch.created_at
FROM change_history ch;
DROP TABLE change_history;
ALTER TABLE change_history_v12 RENAME TO change_history;
CREATE INDEX IF NOT EXISTS idx_change_history_entity_time ON change_history(entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_history_user ON change_history(changed_by_user_id);

CREATE TABLE IF NOT EXISTS organization_submissions_v12 (
    id TEXT PRIMARY KEY,
    organization_name TEXT NOT NULL,
    contact_person TEXT,
    contact_email TEXT NOT NULL,
    official_website TEXT,
    scholarship_name TEXT NOT NULL,
    scholarship_name_km TEXT,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    degree_level TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    funding_type TEXT NOT NULL,
    funding_details TEXT,
    eligibility_summary TEXT,
    deadline TEXT,
    application_link TEXT,
    official_source_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending Admin Review' CHECK (status IN ('Pending Admin Review', 'Approved', 'Approved & Published', 'Rejected')),
    submitted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    published_scholarship_id TEXT,
    reviewed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT,
    review_notes TEXT
);
INSERT OR IGNORE INTO organization_submissions_v12 (
    id, organization_name, contact_person, contact_email, official_website, scholarship_name,
    scholarship_name_km, country, region, degree_level, field_of_study, funding_type,
    funding_details, eligibility_summary, deadline, application_link, official_source_url,
    status, submitted_by_user_id, published_scholarship_id, reviewed_by_user_id,
    submitted_at, reviewed_at, reviewed_by, review_notes
)
SELECT
    os.id, os.organization_name, os.contact_person, os.contact_email, os.official_website, os.scholarship_name,
    os.scholarship_name_km, os.country, os.region, os.degree_level, os.field_of_study, os.funding_type,
    os.funding_details, os.eligibility_summary, os.deadline, os.application_link, os.official_source_url,
    os.status,
    CASE WHEN EXISTS (SELECT 1 FROM users u WHERE u.id = os.submitted_by_user_id) THEN os.submitted_by_user_id ELSE NULL END,
    os.published_scholarship_id,
    CASE WHEN EXISTS (SELECT 1 FROM users u WHERE u.id = os.reviewed_by_user_id) THEN os.reviewed_by_user_id ELSE NULL END,
    os.submitted_at, os.reviewed_at, os.reviewed_by, os.review_notes
FROM organization_submissions os;
DROP TABLE organization_submissions;
ALTER TABLE organization_submissions_v12 RENAME TO organization_submissions;
CREATE INDEX IF NOT EXISTS idx_org_submissions_status_time ON organization_submissions(status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_submissions_user ON organization_submissions(submitted_by_user_id);

-- 5. Missing FK and composite sort indexes on active tables
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_room_objects_item ON room_objects(item_id);
CREATE INDEX IF NOT EXISTS idx_hermes_fact_history_user ON hermes_fact_history(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_scholarships_scholarship ON user_saved_scholarships(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_progress_activity ON student_activity_progress(activity_id);
CREATE INDEX IF NOT EXISTS idx_student_learning_paths_path ON student_learning_paths(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_user ON learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_game_events_user ON game_events(user_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_ach ON student_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_student_inventory_item ON student_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_lab_experiment_results_exp ON lab_experiment_results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_exp_participants_v2_group ON experiment_participants_v2(group_id);
CREATE INDEX IF NOT EXISTS idx_cdes_student_achievements_stud ON cdes_student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_cdes_student_goals_stud ON cdes_student_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_cdes_student_interest_vec_stud ON cdes_student_interest_vectors(student_id);
CREATE INDEX IF NOT EXISTS idx_cdes_student_projects_stud ON cdes_student_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_category ON learning_content(category_id);
CREATE INDEX IF NOT EXISTS idx_achievements_item_reward ON achievements(item_reward_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_item_reward ON learning_activities(item_reward_id);
CREATE INDEX IF NOT EXISTS idx_universities_abbr_nocase ON universities(abbr COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_time ON community_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_student_date ON mentorship_sessions(student_id, scheduled_date DESC, scheduled_time DESC);
CREATE INDEX IF NOT EXISTS idx_ai_action_plans_student_time ON ai_action_plans(student_id, created_at DESC);

-- 6. Drop completely unreferenced dead tables (strict child-first order to satisfy PRAGMA foreign_keys = ON)
DROP TABLE IF EXISTS learning_objectives;
DROP TABLE IF EXISTS content_verifications;
DROP TABLE IF EXISTS content_feedback;
DROP TABLE IF EXISTS knowledge_contents;
DROP TABLE IF EXISTS content_authors;
DROP TABLE IF EXISTS content_sources;
DROP TABLE IF EXISTS content_categories;
DROP TABLE IF EXISTS adaptive_tutor_sessions;
DROP TABLE IF EXISTS ai_companion_states;
DROP TABLE IF EXISTS ai_orchestrator_agents;
DROP TABLE IF EXISTS student_inventory_items;
DROP TABLE IF EXISTS campus_avatar_entities;
DROP TABLE IF EXISTS campus_learning_missions;
DROP TABLE IF EXISTS campus_world_locations;
DROP TABLE IF EXISTS campus_digital_items;
DROP TABLE IF EXISTS campus_worlds;
DROP TABLE IF EXISTS career_paths;
DROP TABLE IF EXISTS cdes_ml_prediction_logs;
DROP TABLE IF EXISTS experiment_metrics;
DROP TABLE IF EXISTS experiment_results;
DROP TABLE IF EXISTS learning_contents;
DROP TABLE IF EXISTS learning_progress;
DROP TABLE IF EXISTS scholarship_sources;
DROP TABLE IF EXISTS student_memory_audit_logs;
DROP TABLE IF EXISTS university_programs;
