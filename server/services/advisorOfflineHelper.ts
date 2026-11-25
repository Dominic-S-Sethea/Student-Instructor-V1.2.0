export function extractExplicitMemoryRequest(prompt: string): string | null {
  const match = prompt.trim().match(/^(?:please\s+)?(?:remember(?:\s+that)?|save to memory:?|ចងចាំថា)\s+(.+)$/i);
  return match && match[1] ? match[1].trim() : null;
}

export function buildDeterministicOfflineReply(
  prompt: string,
  catalogTitles: string[],
  studentProfile?: { name?: string; educationLevel?: string; favoriteSubjects?: string[]; targetMajor?: string },
  explicitSavedFact?: string | null
) {
  const lower = prompt.toLowerCase();
  const studentName = studentProfile?.name || 'Student';
  const subjects = studentProfile?.favoriteSubjects?.join(', ') || 'Mathematics, Science & Digital Skills';
  const catalogList =
    catalogTitles.length > 0
      ? catalogTitles.slice(0, 3).map((t) => `- **${t}** (see Scholarships directory for verified source & deadline)`).join('\n')
      : '- Check the Scholarships directory for verified listings and official source links.';
  const memoryPrefix = explicitSavedFact
    ? `Saved to your Hermes Growth Memory: **"${explicitSavedFact}"**.\n\n`
    : '';

  if (lower.includes('itc') || lower.includes('cadt') || lower.includes('scholarship') || lower.includes('bac ii') || lower.includes('grade 12')) {
    return {
      reply: `${memoryPrefix}Hello ${studentName}! The external AI language provider is currently offline (**deterministic offline guidance mode**). Based on verified CDES catalog records and academic rules:\n\n### Current Catalog Highlights\n${catalogList}\n\n### Recommended Next Steps\n1. Compare university tuition and accreditation status in the University Directory before applying.\n2. Verify deadlines and required documents directly at each official scholarship source URL.\n3. Update your Education Profile (${studentProfile?.educationLevel || 'Grade level not set'}) to keep scholarship matching accurate.`,
      recommendedMajors: ['Computer Science & Software Engineering', 'Data Science & AI', 'Civil & Industrial Engineering'],
      recommendedSkills: ['Mathematics & Analytical Reasoning', 'Algorithmic Logic', 'Academic English'],
      suggestedMentors: ['Check verified mentors in Community'],
      suggestedQuestions: [
        'Which scholarships cover STEM degrees in Cambodia?',
        'What are the differences between CADT and ITC curricula?',
        'How should I organize my Bac II STEM study timeline?',
      ],
    };
  }

  return {
    reply: `${memoryPrefix}Welcome ${studentName}! The external AI provider is currently offline (**deterministic offline guidance mode**).\n\nBased on your query and subjects (${subjects}), review these verified catalog entries:\n${catalogList}\n\nPlease inspect individual university accreditation and scholarship funding rows before making enrollment decisions.`,
    recommendedMajors: ['Computer Science', 'Business Information Systems', 'Engineering'],
    recommendedSkills: ['Analytical Thinking', 'English Communication', 'Problem Solving'],
    suggestedMentors: ['Check verified mentors in Community'],
    suggestedQuestions: [
      'Compare Computer Science vs Data Science in Cambodia',
      'Show scholarships with upcoming deadlines',
      'What documents do national scholarships require?',
    ],
  };
}
