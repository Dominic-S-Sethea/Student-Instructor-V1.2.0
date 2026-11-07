import { getDatabase } from '../db/connection';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: 'student' | 'admin' | 'organization' | 'mentor';
  status: 'active' | 'pending_verification' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface StudentProfileRecord {
  id: string;
  user_id: string;
  name: string;
  date_of_birth?: string | null;
  education_level: string;
  school?: string | null;
  university?: string | null;
  major?: string | null;
  graduation_year?: number | null;
  language: string;
  location?: string | null;
  target_career?: string | null;
  interests?: string; // JSON array
  favorite_subjects?: string; // JSON array
  goals?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EducationHistoryRecord {
  id: string;
  student_id: string;
  institution: string;
  degree: string;
  start_date?: string | null;
  end_date?: string | null;
  achievements?: string | null;
}

export class UserRepository {
  private db = getDatabase();

  public findByEmail(email: string): UserRecord | null {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim().toLowerCase()) as unknown as UserRecord | undefined;
    return row || null;
  }

  public findById(id: string): UserRecord | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRecord | undefined;
    return row || null;
  }

  public createUser(userData: {
    id?: string;
    email: string;
    password_hash: string;
    role: 'student' | 'admin' | 'organization' | 'mentor';
    status?: 'active' | 'pending_verification' | 'suspended';
  }): UserRecord {
    const now = new Date().toISOString();
    const id = userData.id || `usr-${crypto.randomUUID()}`;
    const status = userData.status || 'active';

    this.db.prepare(`
      INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userData.email.toLowerCase().trim(), userData.password_hash, userData.role, status, now, now);

    return this.findById(id)!;
  }

  public updateLastLogin(userId: string): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?').run(now, now, userId);
  }

  public getProfileByUserId(userId: string): StudentProfileRecord | null {
    const row = this.db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(userId) as unknown as StudentProfileRecord | undefined;
    return row || null;
  }

  public createOrUpdateProfile(profileData: Partial<StudentProfileRecord> & { user_id: string; name: string; education_level: string }): StudentProfileRecord {
    const now = new Date().toISOString();
    const existing = this.getProfileByUserId(profileData.user_id);

    if (existing) {
      this.db.prepare(`
        UPDATE student_profiles SET
          name = ?, date_of_birth = ?, education_level = ?, school = ?, university = ?,
          major = ?, graduation_year = ?, language = ?, location = ?, target_career = ?,
          interests = ?, favorite_subjects = ?, goals = ?, updated_at = ?
        WHERE user_id = ?
      `).run(
        profileData.name || existing.name,
        profileData.date_of_birth !== undefined ? profileData.date_of_birth : existing.date_of_birth,
        profileData.education_level || existing.education_level,
        profileData.school !== undefined ? profileData.school : existing.school,
        profileData.university !== undefined ? profileData.university : existing.university,
        profileData.major !== undefined ? profileData.major : existing.major,
        profileData.graduation_year !== undefined ? profileData.graduation_year : existing.graduation_year,
        profileData.language || existing.language,
        profileData.location !== undefined ? profileData.location : existing.location,
        profileData.target_career !== undefined ? profileData.target_career : existing.target_career,
        typeof profileData.interests === 'string' ? profileData.interests : JSON.stringify(profileData.interests || []),
        typeof profileData.favorite_subjects === 'string' ? profileData.favorite_subjects : JSON.stringify(profileData.favorite_subjects || []),
        profileData.goals !== undefined ? profileData.goals : existing.goals,
        now,
        profileData.user_id
      );
      return this.getProfileByUserId(profileData.user_id)!;
    } else {
      const id = profileData.id || `stu-${crypto.randomUUID()}`;
      this.db.prepare(`
        INSERT INTO student_profiles (
          id, user_id, name, date_of_birth, education_level, school, university, major,
          graduation_year, language, location, target_career, interests, favorite_subjects, goals, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        profileData.user_id,
        profileData.name,
        profileData.date_of_birth || null,
        profileData.education_level,
        profileData.school || null,
        profileData.university || null,
        profileData.major || null,
        profileData.graduation_year || null,
        profileData.language || 'km',
        profileData.location || null,
        profileData.target_career || null,
        typeof profileData.interests === 'string' ? profileData.interests : JSON.stringify(profileData.interests || []),
        typeof profileData.favorite_subjects === 'string' ? profileData.favorite_subjects : JSON.stringify(profileData.favorite_subjects || []),
        profileData.goals || null,
        now,
        now
      );
      return this.getProfileByUserId(profileData.user_id)!;
    }
  }

  public getEducationHistory(studentId: string): EducationHistoryRecord[] {
    return this.db.prepare('SELECT * FROM education_history WHERE student_id = ? ORDER BY start_date DESC').all(studentId) as unknown as EducationHistoryRecord[];
  }

  public addEducationHistory(history: Omit<EducationHistoryRecord, 'id'>): EducationHistoryRecord {
    const id = `edu-${crypto.randomUUID()}`;
    this.db.prepare(`
      INSERT INTO education_history (id, student_id, institution, degree, start_date, end_date, achievements)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, history.student_id, history.institution, history.degree, history.start_date || null, history.end_date || null, history.achievements || null);
    return { id, ...history };
  }
}
