import type { AuthUser, StudentProfile as AuthStudentProfile } from '../services/authClient';
import type { EducationLevel, StudentProfile } from '../types';

const VALID_EDUCATION_LEVELS: readonly EducationLevel[] = [
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'University Freshman',
  'University Sophomore',
  'University Junior',
  'University Senior',
];

function toEducationLevel(raw?: string | null): EducationLevel {
  if (raw && (VALID_EDUCATION_LEVELS as readonly string[]).includes(raw)) {
    return raw as EducationLevel;
  }
  if (raw && raw.toLowerCase().includes('university')) {
    return 'University Freshman';
  }
  return 'Grade 12';
}

/**
 * Builds a clean, non-fabricated StudentProfile scoped to the current authenticated user
 * or guest session, never leaking another user's or demo persona's sessions/PII.
 */
export function buildSessionStudentProfile(
  authenticated: boolean,
  user: AuthUser | null,
  authProfile: AuthStudentProfile | null
): StudentProfile {
  const displayName = authenticated
    ? authProfile?.name || user?.email?.split('@')[0] || 'Student'
    : 'Guest Student';

  return {
    id: authenticated && user?.id ? user.id : 'guest',
    name: displayName,
    avatar: '',
    email: authenticated && user?.email ? user.email : '',
    educationLevel: toEducationLevel(authProfile?.education_level),
    school: authProfile?.school || '',
    location: authProfile?.location || '',
    targetMajor: authProfile?.major || '',
    targetCareer: authProfile?.target_career || '',
    interests: [],
    favoriteSubjects: [],
    careerInterests: [],
    goals: '',
    savedMentorIds: [],
    savedOpportunityIds: [],
    registeredEventIds: [],
    followedMentorIds: [],
    badges: [],
    scheduledSessions: [],
    explorationProgress: {
      profileCompleted: authenticated ? 40 : 0,
      interestsExplored: 0,
      mentorsContacted: 0,
      meetupsJoined: 0,
    },
  };
}
