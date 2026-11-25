-- ============================================================
-- CDES PLATFORM MIGRATION 008
-- Additive pilot reconstruction columns for catalog accuracy,
-- idempotent editorial publication tracking, and privacy-first
-- enforceable consent defaults.
-- ============================================================

ALTER TABLE scholarships ADD COLUMN monthly_allowance_text TEXT;
ALTER TABLE scholarships ADD COLUMN monthly_allowance_text_km TEXT;
ALTER TABLE scholarships ADD COLUMN accommodation_text TEXT;
ALTER TABLE scholarships ADD COLUMN accommodation_text_km TEXT;
ALTER TABLE scholarships ADD COLUMN insurance_text TEXT;
ALTER TABLE scholarships ADD COLUMN insurance_text_km TEXT;
ALTER TABLE scholarships ADD COLUMN flight_support_text TEXT;
ALTER TABLE scholarships ADD COLUMN flight_support_text_km TEXT;
ALTER TABLE scholarships ADD COLUMN verified_at TEXT;
ALTER TABLE scholarships ADD COLUMN verified_by TEXT;
ALTER TABLE scholarships ADD COLUMN estimated_value_usd REAL;

ALTER TABLE organization_submissions ADD COLUMN published_scholarship_id TEXT;
ALTER TABLE organization_submissions ADD COLUMN reviewed_by_user_id TEXT;

ALTER TABLE student_privacy_consents ADD COLUMN consent_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE student_privacy_consents ADD COLUMN allow_ai_memory INTEGER NOT NULL DEFAULT 0;
ALTER TABLE student_privacy_consents ADD COLUMN parent_verification_status TEXT NOT NULL DEFAULT 'unverified';
ALTER TABLE student_privacy_consents ADD COLUMN withdrawn_at TEXT;
