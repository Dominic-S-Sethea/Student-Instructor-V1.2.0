/**
 * Shared SQLite row definitions for scholarships so repositories and formatters
 * do not form circular module imports.
 */

export interface ScholarshipRow {
  id: string;
  legacy_code?: string | null;
  name: string;
  name_km?: string | null;
  provider: string;
  provider_km?: string | null;
  country: string;
  country_km?: string | null;
  region: string;
  degree_levels: string;
  field_of_study: string;
  funding_type: string;
  funding_details?: string | null;
  funding_details_km?: string | null;
  eligibility_summary?: string | null;
  eligibility_summary_km?: string | null;
  overview?: string | null;
  overview_km?: string | null;
  target_demographic?: string | null;
  application_link: string;
  official_source_url: string;
  deadline: string;
  is_deadline_rolling: number;
  is_verified: number;
  verification_tier: string;
  tags?: string | null;
  monthly_allowance_text?: string | null;
  monthly_allowance_text_km?: string | null;
  accommodation_text?: string | null;
  accommodation_text_km?: string | null;
  insurance_text?: string | null;
  insurance_text_km?: string | null;
  flight_support_text?: string | null;
  flight_support_text_km?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  estimated_value_usd?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipRequirementsRow {
  id: string;
  scholarship_id: string;
  gpa_minimum?: number | null;
  ielts_minimum?: number | null;
  toefl_minimum?: number | null;
  age_limit?: number | null;
  nationalities?: string | null;
  work_experience_years?: number | null;
  required_documents?: string | null;
  notes?: string | null;
}

export interface ScholarshipFundingRow {
  id: string;
  scholarship_id: string;
  covers_tuition: number;
  tuition_coverage_percentage: number;
  monthly_stipend_usd: number | null;
  covers_flights: number | null;
  covers_visa: number | null;
  covers_health_insurance: number | null;
  funding_currency: string;
}
