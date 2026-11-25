import type { DecisionAssessmentInput } from '../../types';

export const QUIZ_INTEREST_OPTIONS = [
  { label: 'Technology & Software', value: 'Technology', desc: 'Coding, apps, AI, digital products' },
  { label: 'Business & Finance', value: 'Business', desc: 'Accounting, corporate management, audit' },
  { label: 'Healthcare & Medicine', value: 'Healthcare', desc: 'Patient care, biology, pharmaceuticals' },
  { label: 'Engineering & Hardware', value: 'Engineering', desc: 'Robotics, electronics, telecom, civil' },
  { label: 'Design & Visual Media', value: 'Design', desc: 'UI/UX, digital animation, creative media' },
] as const;

export const QUIZ_STRENGTH_OPTIONS = [
  { label: 'Logical & Algorithmic Problem Solving', value: 'Logic' },
  { label: 'Visual Creativity & User Empathy', value: 'Creativity' },
  { label: 'Attention to Fine Detail', value: 'Detail' },
  { label: 'Communication & Languages', value: 'Communication' },
  { label: 'Science Curiosity (Biology / Chemistry)', value: 'Science' },
] as const;

export const QUIZ_MATH_OPTIONS: ReadonlyArray<{
  id: DecisionAssessmentInput['mathAbility'];
  title: string;
  desc: string;
  tag: string;
}> = [
  {
    id: 'loves_math',
    title: 'High Math Confidence (Calculus & Proofs)',
    desc: 'Comfortable with abstract equations and Tronc Commun engineering math.',
    tag: 'Great for: AI, Data Science, Civil / Telecom Engineering',
  },
  {
    id: 'moderate_math',
    title: 'Moderate Math (Practical Logic & Stats)',
    desc: 'Manage high-school math with practice and prefer hands-on building.',
    tag: 'Great for: Software Engineering, Web Apps, Cyber Defense',
  },
  {
    id: 'hates_math',
    title: 'Prefer Minimal Advanced Calculus',
    desc: 'Stronger in design, communication, visual media, or business workflows.',
    tag: 'Great for: UX/UI Design, Info Systems, Finance & Management',
  },
];

export const QUIZ_STYLE_OPTIONS: ReadonlyArray<{
  id: DecisionAssessmentInput['workStyle'];
  title: string;
  desc: string;
  match: string;
}> = [
  { id: 'hands_on_coder', title: 'Practical Builder (Projects & Labs)', desc: 'Learn by building real apps, demos, and team sprints.', match: 'CADT, Paragon' },
  { id: 'theory_researcher', title: 'Deep Engineering & Science Theory', desc: 'Enjoy strong math foundations and classic research.', match: 'ITC, RUPP' },
  { id: 'entrepreneur_creative', title: 'Discussions, Case Studies & Pitching', desc: 'Thrive in English seminars, presentations, and leadership.', match: 'AUPP, CamEd' },
  { id: 'caring_service', title: 'Clinical & Patient Care', desc: 'Dedicated to hospital training and public health.', match: 'UHS' },
];

export const QUIZ_BUDGET_OPTIONS: ReadonlyArray<{
  id: DecisionAssessmentInput['budgetTier'];
  title: string;
  desc: string;
  tag: string;
}> = [
  { id: 'scholarship_dependent', title: 'Need Full Scholarship Support', desc: 'Target national/government scholarships or full university tuition waivers.', tag: '$0 tuition target' },
  { id: 'low_under_1000', title: 'Low Tuition (<$1,000 / year)', desc: 'Accessible public university fee tracks.', tag: 'ITC / RUPP range' },
  { id: 'mid_1000_3500', title: 'Moderate ($1,200 – $3,500 / year)', desc: 'Specialized academies and applied institutes.', tag: 'CADT / CamEd / Paragon range' },
  { id: 'international_5000_plus', title: 'International Dual-Degree ($5,000+ / year)', desc: 'US/international degree partnerships in Phnom Penh.', tag: 'AUPP range' },
];

export const QUIZ_CAREER_OPTIONS: ReadonlyArray<{
  id: DecisionAssessmentInput['careerGoal'];
  title: string;
  desc: string;
}> = [
  { id: 'local_tech', title: 'Software or Data Specialist in Cambodia', desc: 'Join growing engineering, banking, or telecom teams.' },
  { id: 'startup_founder', title: 'Startup Builder / Product Creator', desc: 'Design apps, digital services, or new community products.' },
  { id: 'international_remote', title: 'Global Remote or Audit Advisory', desc: 'Prepare for regional firms, Big Four audit, or study abroad.' },
  { id: 'healthcare_public', title: 'Hospital & Public Health Service', desc: 'Serve communities in medicine, pharmacy, or public health.' },
];
