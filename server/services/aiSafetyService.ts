import { AISafetyCheckResult } from '../types/aiTypes';

export class AISafetyService {
  // Psychological diagnostic query triggers
  private readonly psychKeywords = [
    'diagnose me',
    'do i have adhd',
    'am i bipolar',
    'clinical depression',
    'autism test',
    'schizophrenia',
    'personality disorder',
    'mental illness test',
    'prescribe medication',
    'am i crazy',
    'am i depressed'
  ];

  // Permanent negative labeling triggers
  private readonly permanentLabels = [
    'you are bad at math',
    'you are not smart enough',
    'you have low iq',
    'you will fail at university',
    'you are unfit for engineering',
    'you lack talent',
    'you cannot succeed',
    'hopeless student'
  ];

  // Coercive / absolute command triggers
  private readonly coercivePhrases = [
    'you must become a',
    'you have to study',
    'there is only one option',
    'you are obligated to choose',
    'never consider anything else',
    'you are forced to'
  ];

  // PII regexes (Cambodian phone numbers with optional spaces/hyphens, general emails)
  private readonly phoneRegex = /(\+?855|0)[\s-]?[1-9]\d[\s-]?\d{3}[\s-]?\d{3,4}/g;
  private readonly emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  /**
   * Pre-execution safety check on the student's incoming prompt
   */
  public inspectInput(userPrompt: string): AISafetyCheckResult {
    const lower = userPrompt.toLowerCase();

    // 1. Check for psychological diagnosis inquiries
    for (const kw of this.psychKeywords) {
      if (lower.includes(kw)) {
        return {
          isSafe: false,
          violationType: 'psychological_diagnosis',
          safetyReason: 'Inquiry requests psychological diagnosis or clinical mental health assessment.',
          guidanceNote: `CDES AI is strictly an educational and career intelligence agent. It is neither qualified nor ethically permitted to provide psychiatric or psychological diagnoses. If you are experiencing distress, anxiety, or emotional difficulties, please speak with your school guidance counselor, a licensed doctor, or a trusted family member. Here are supportive ways we can help you structure your study schedule and reduce exam stress.`
        };
      }
    }

    return { isSafe: true };
  }

  /**
   * Post-generation safety sanitization and guardrail filter on AI output
   */
  public sanitizeOutput(agentText: string): { sanitizedText: string; flags: string[] } {
    let sanitized = agentText;
    const flags: string[] = [];
    let piiRedacted = false;

    // 1. PII Redaction for minor safety
    const phoneRedacted = sanitized.replace(this.phoneRegex, '[PHONE REDACTED FOR MINOR SAFETY]');
    if (phoneRedacted !== sanitized) {
      sanitized = phoneRedacted;
      piiRedacted = true;
    }

    // Allow official institutional contact emails, redact personal student/guardian emails
    const emailRedacted = sanitized.replace(this.emailRegex, (match) => {
      const lowerMatch = match.toLowerCase();
      if (
        lowerMatch.endsWith('@cadt.edu.kh') ||
        lowerMatch.endsWith('@itc.edu.kh') ||
        lowerMatch.endsWith('@cdes.edu.kh') ||
        lowerMatch.endsWith('@paragoniu.edu.kh')
      ) {
        return match;
      }
      return '[EMAIL REDACTED]';
    });
    if (emailRedacted !== sanitized) {
      sanitized = emailRedacted;
      piiRedacted = true;
    }

    if (piiRedacted) {
      flags.push('minor_privacy_pii_masked');
    }

    // 2. Filter permanent negative labels
    for (const label of this.permanentLabels) {
      if (sanitized.toLowerCase().includes(label)) {
        sanitized = sanitized.replace(new RegExp(label, 'gi'), 'you are currently strengthening your foundational understanding in this area');
        flags.push('growth_mindset_reframing_applied');
      }
    }

    // 3. Reframe coercive commands into options & reflection
    for (const phrase of this.coercivePhrases) {
      if (sanitized.toLowerCase().includes(phrase)) {
        sanitized = sanitized.replace(new RegExp(phrase, 'gi'), 'one valuable pathway to consider exploring is');
        flags.push('coercion_reframed_to_guidance');
      }
    }

    return { sanitizedText: sanitized, flags };
  }

  /**
   * Returns system prompt safety instructions to be prepended to the LLM system prompt
   */
  public getPedagogicalSafetySystemPrompt(): string {
    return `
==================================================
CDES EDUCATIONAL AGENT ETHICAL & SAFETY MANDATES:
1. TARGET AUDIENCE: High school students and undergraduate candidates in Cambodia (may include minors ages 14-18).
2. NO PSYCHOLOGICAL DIAGNOSIS: Never diagnose conditions (e.g., ADHD, clinical depression, anxiety disorders). If raised, validate feelings empathetically and direct them to certified school counselors, parents, or medical professionals.
3. NO PERMANENT LABELS: Never label a student as "bad at math", "unqualified", or "hopeless". Always practice Growth Mindset language (procedural effort, strategy, persistence, incremental mastery).
4. NO ABSOLUTE CAREER DECISIONS: Never dictate "you must become X". Always provide structured options, objective pros/cons, exploratory next steps, and reflection prompts. Empower student autonomy and agency.
5. PRIVACY PROTECTION: Never request or expose personal private phone numbers, home addresses, or unverified contact information.
6. TONE & STYLE: Warm, encouraging, intellectually stimulating, structured with markdown lists and bold headers. Ground advice in Cambodian education reality (ITC, CADT, RUPP, MoEYS Bac II, MPTC, regional scholarships).
==================================================
`;
  }
}

export const aiSafetyService = new AISafetyService();
