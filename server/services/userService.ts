import { UserRepository, StudentProfileRecord, EducationHistoryRecord } from '../repositories/userRepository';

export interface ProfileUpdateInput {
  name?: string;
  date_of_birth?: string | null;
  education_level?: string;
  school?: string | null;
  university?: string | null;
  major?: string | null;
  graduation_year?: number | null;
  language?: string;
  location?: string | null;
  target_career?: string | null;
  interests?: string | string[];
  favorite_subjects?: string | string[];
  goals?: string | null;
}

export class UserService {
  private userRepo: UserRepository;

  constructor(userRepo?: UserRepository) {
    this.userRepo = userRepo || new UserRepository();
  }

  public getProfile(userId: string): { profile: StudentProfileRecord | null; education: EducationHistoryRecord[] } {
    const profile = this.userRepo.getProfileByUserId(userId);
    const education = profile ? this.userRepo.getEducationHistory(profile.id) : [];
    return { profile, education };
  }

  public updateProfile(userId: string, data: ProfileUpdateInput): StudentProfileRecord {
    const existing = this.userRepo.getProfileByUserId(userId);
    const name = data.name?.trim() || existing?.name || 'Student';
    const education_level = data.education_level?.trim() || existing?.education_level || 'Grade 12';

    return this.userRepo.createOrUpdateProfile({
      name,
      education_level,
      date_of_birth: data.date_of_birth,
      school: data.school,
      university: data.university,
      major: data.major,
      graduation_year: data.graduation_year,
      language: data.language,
      location: data.location,
      target_career: data.target_career,
      interests: data.interests,
      favorite_subjects: data.favorite_subjects,
      goals: data.goals,
      user_id: userId,
    });
  }

  public addEducation(userId: string, entry: Omit<EducationHistoryRecord, 'id' | 'student_id'>): EducationHistoryRecord {
    const profile = this.userRepo.getProfileByUserId(userId);
    if (!profile) {
      throw new Error('Student profile not found. Please create a profile first.');
    }
    return this.userRepo.addEducationHistory({
      student_id: profile.id,
      institution: entry.institution,
      degree: entry.degree,
      start_date: entry.start_date,
      end_date: entry.end_date,
      achievements: entry.achievements,
    });
  }

  public deleteEducation(userId: string, educationId: string): boolean {
    const profile = this.userRepo.getProfileByUserId(userId);
    if (!profile) {
      return false;
    }
    return this.userRepo.deleteEducationHistory(educationId, profile.id);
  }
}
