import { UserRepository, StudentProfileRecord, EducationHistoryRecord } from '../repositories/userRepository';

export class UserService {
  private userRepo: UserRepository;

  constructor(userRepo?: UserRepository) {
    this.userRepo = userRepo || new UserRepository();
  }

  public getProfile(userId: string): { profile: StudentProfileRecord | null; education: EducationHistoryRecord[] } {
    const profile = this.userRepo.getProfileByUserId(userId);
    let education: EducationHistoryRecord[] = [];
    if (profile) {
      education = this.userRepo.getEducationHistory(profile.id);
    }
    return { profile, education };
  }

  public updateProfile(userId: string, data: Partial<StudentProfileRecord> & { name?: string; education_level?: string }): StudentProfileRecord {
    const existing = this.userRepo.getProfileByUserId(userId);
    const name = data.name || existing?.name || 'Student';
    const education_level = data.education_level || existing?.education_level || 'Grade 12';

    return this.userRepo.createOrUpdateProfile({
      ...data,
      user_id: userId,
      name,
      education_level
    });
  }

  public addEducation(userId: string, entry: Omit<EducationHistoryRecord, 'id' | 'student_id'>): EducationHistoryRecord {
    const profile = this.userRepo.getProfileByUserId(userId);
    if (!profile) {
      throw new Error('Student profile not found. Please create a profile first.');
    }
    return this.userRepo.addEducationHistory({
      student_id: profile.id,
      ...entry
    });
  }
}
