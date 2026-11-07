import { getDatabase } from '../db/connection';
import crypto from 'crypto';

export interface UniversityRow {
  id: string;
  abbr: string;
  name: string;
  khmer_name?: string | null;
  location: string;
  type: string;
  founded_year?: number | null;
  website?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  profile_score_overall: number;
  academic_reputation_score: number;
  industry_connection_score: number;
  facilities_score: number;
  graduate_outcome_score: number;
  annual_tuition_usd: number;
  total_degree_cost_usd: number;
  accreditation_status?: string | null;
  verification_confidence?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MajorRow {
  id: string;
  university_id: string;
  slug: string;
  name: string;
  faculty?: string | null;
  degree_type: string;
  duration_years: number;
  difficulty_rating: number;
  difficulty_reason?: string | null;
  job_market_demand?: string | null;
  average_starting_salary?: string | null;
  course_structure?: string | null; // JSON
  technical_skills?: string | null; // JSON
  soft_skills?: string | null; // JSON
  created_at: string;
}

export class UniversityRepository {
  private db = getDatabase();

  public getAll(): (UniversityRow & { majors: MajorRow[] })[] {
    const universities = this.db.prepare('SELECT * FROM universities ORDER BY profile_score_overall DESC').all() as unknown as UniversityRow[];
    return universities.map(u => ({
      ...u,
      majors: this.getMajorsByUniversityId(u.id)
    }));
  }

  public getById(id: string): (UniversityRow & { majors: MajorRow[] }) | null {
    const u = this.db.prepare('SELECT * FROM universities WHERE id = ? OR abbr = ? COLLATE NOCASE').get(id, id) as unknown as UniversityRow | undefined;
    if (!u) return null;
    return {
      ...u,
      majors: this.getMajorsByUniversityId(u.id)
    };
  }

  public getMajorsByUniversityId(universityId: string): MajorRow[] {
    return this.db.prepare('SELECT * FROM majors WHERE university_id = ?').all(universityId) as unknown as MajorRow[];
  }

  public createUniversity(data: Partial<UniversityRow> & { abbr: string; name: string; location: string; type: string }): UniversityRow {
    const now = new Date().toISOString();
    const id = data.id || `univ-${data.abbr.toLowerCase()}`;

    this.db.prepare(`
      INSERT INTO universities (
        id, abbr, name, khmer_name, location, type, founded_year, website, logo, cover_image,
        profile_score_overall, academic_reputation_score, industry_connection_score, facilities_score,
        graduate_outcome_score, annual_tuition_usd, total_degree_cost_usd, accreditation_status,
        verification_confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.abbr,
      data.name,
      data.khmer_name || null,
      data.location,
      data.type,
      data.founded_year || null,
      data.website || null,
      data.logo || null,
      data.cover_image || null,
      data.profile_score_overall || 85,
      data.academic_reputation_score || 85,
      data.industry_connection_score || 80,
      data.facilities_score || 80,
      data.graduate_outcome_score || 85,
      data.annual_tuition_usd || 1000,
      data.total_degree_cost_usd || 4000,
      data.accreditation_status || 'Fully Accredited',
      data.verification_confidence || 'official',
      now,
      now
    );

    return this.getById(id)!;
  }
}
