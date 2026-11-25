export interface DemoStudentSeed {
  id: string;
  name: string;
  educationLevel: string;
  school: string;
  location: string;
  targetMajor: string;
  targetCareer: string;
  interests: string[];
  favoriteSubjects: string[];
  goals: string;
}

export const demoStudentSeed: DemoStudentSeed = {
  id: 'stu-001',
  name: 'Vannak Sam',
  educationLevel: 'Grade 12',
  school: 'Bak Touk High School, Phnom Penh',
  location: 'Phnom Penh, Cambodia',
  targetMajor: 'Data Science & Artificial Intelligence',
  targetCareer: 'AI Engineer & Tech Founder',
  interests: ['Calculus', 'Python Coding', 'Web Development', 'Machine Learning', 'Scholarships'],
  favoriteSubjects: ['Advanced Mathematics', 'Physics', 'English', 'Computer Logic'],
  goals: 'Secure a full scholarship at ITC or CADT and prepare for Foundation Year calculus with honors.',
};
