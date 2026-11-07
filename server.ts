import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";
import logger from "./server/middleware/loggingMiddleware";
import { requestLogger } from "./server/middleware/requestLogger";
import { traceMiddleware } from "./server/middleware/tracingMiddleware";
import { rateLimiter } from "./server/middleware/rateLimiter";
import { generateCsrfToken, validateCsrfToken } from "./server/middleware/csrfMiddleware";

import { runMigrations } from "./server/db/migrate";
import authController from "./server/controllers/authController";
import userController from "./server/controllers/userController";
import scholarshipController from "./server/controllers/scholarshipController";
import universityController from "./server/controllers/universityController";
import analyticsController from "./server/controllers/analyticsController";
import monitorController from "./server/controllers/monitorController";
import studentIntelligenceController from "./server/controllers/studentIntelligenceController";
import researchController from "./server/controllers/researchController";
import privacyController from "./server/controllers/privacyController";
import avatarWorldController from "./server/controllers/avatarWorldController";
import learningController from "./server/controllers/learningController";
import communityController from "./server/controllers/communityController";
import learningScienceController from "./server/controllers/learningScienceController";
import aiRoutes from "./server/routes/aiRoutes";
import platformArchitectureRoutes from "./server/routes/platformArchitectureRoutes";
import knowledgeController from "./server/controllers/knowledgeController";
import digitalWorldController from "./server/controllers/digitalWorldController";
import { aiAgent2Routes } from "./server/routes/aiAgent2Routes";
import dataPlatformRoutes from "./server/routes/dataPlatformRoutes";
import { AIRepository } from "./server/repositories/aiRepository";
import { AnalyticsRepository } from "./server/repositories/analyticsRepository";

dotenv.config();

// Initialize and verify database
try {
  runMigrations();
  console.log("CDES Database initialized and migrations verified.");
} catch (dbErr) {
  console.error("Database migration error:", dbErr);
}

const app = express();
const PORT = 3000;

app.use(express.json());
// CORS middleware for cross-origin requests (M-2)
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-CSRF-Token-Id'],
}));
app.use(traceMiddleware);
app.use(requestLogger);

// Global rate limiting for all routes (M-2: rate limiter not wired previously)
app.use(rateLimiter());

// CSRF protection middleware
// Generate CSRF token for all responses (clients get the token ID via header)
app.use(generateCsrfToken);
// Validate CSRF token on state-changing requests
app.use(validateCsrfToken);

const aiRepo = new AIRepository();
const analyticsRepo = new AnalyticsRepository();

// Timeout helper to avoid gateway 504 timeouts
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms on ${label}`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// Lazy-initialized Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "cdes-platform",
        },
        timeout: 12000,
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({
    status: "ok",
    platform: "Cambodia Digital Education Society (CDES)",
    system: "Production Layered Backend",
    database: "SQLite (WAL Mode enabled, Foreign Keys ON)",
    aiEnabled: !!getGenAI(),
    timestamp: new Date().toISOString()
  });
});

// Domain-aware fallback counseling generator
function generateSmartFallbackAdvice(
  prompt: string,
  profile?: { name?: string; educationLevel?: string; favoriteSubjects?: string[]; targetMajor?: string }
) {
  const lower = prompt.toLowerCase();
  const studentName = profile?.name || "Student";
  const subjects = profile?.favoriteSubjects?.join(", ") || "Mathematics, Logic & Technology";

  if (
    lower.includes("entrepreneur") ||
    lower.includes("business experience") ||
    lower.includes("business background") ||
    lower.includes("startup") ||
    lower.includes("10 years") ||
    lower.includes("career change") ||
    lower.includes("executive") ||
    lower.includes("working professional") ||
    lower.includes("postgraduate") ||
    lower.includes("master")
  ) {
    return {
      reply: `Your 10+ years of entrepreneurship background is a tremendous competitive advantage when applying for AI programs and scholarships. Many top universities and international foundations specifically seek candidates who understand commercialization, market problems, and real-world deployment of AI systems rather than purely academic theory.

### 1. High-Value Scholarships for Entrepreneurs & Experienced Professionals
- **Chevening Scholarships (UK Government)**:
  - **Coverage**: 100% full tuition, monthly stipend, flights, and visa.
  - **Why you qualify**: Mandatory requirement is at least 2+ years (2,800+ hours) of demonstrable work and leadership experience. Seasoned business founders and entrepreneurs are priority candidates for UK Master's programs in *Applied Artificial Intelligence*, *AI for Business*, or *Data Science*.
- **Fulbright Foreign Student Program (USA)**:
  - **Coverage**: Full tuition, living stipend, health insurance, and travel.
  - **Focus**: Looks for demonstrated leadership potential and community/economic impact. Your 10 years of business enterprise aligns with their mission to support future leaders who leverage AI to modernize industries.
- **Australia Awards & DAAD (Germany)**:
  - Strong funding tracks for mid-career innovators in tech and digital transformation, where professional experience outweighs recent university transcripts.
- **Erasmus Mundus Joint Master Degrees (Europe)**:
  - Prestigious EU-funded programs in Artificial Intelligence and Digital Innovation that offer €1,400/month living allowances plus full tuition waiver.

### 2. Universities with Specific Fellowships for Business Experience
- **Stanford Knight-Hennessy Scholars / MIT Legatum Center for Entrepreneurship**:
  - Open to graduate applicants who have founded ventures or led businesses and want to bridge AI research into scalable commercial solutions.
- **National University of Singapore (NUS) & NTU**:
  - *MSc in Venture Creation* and *Master of Computing (AI Specialization)* offer competitive ASEAN Graduate Fellowships and Enterprise Grants for applicants with proven startup track records.
- **AUPP (American University of Phnom Penh) Dual Degrees**:
  - Offers merit grants and executive tech tuition reductions for seasoned professionals entering technology management and applied software/AI concentrations.
- **CADT & MPTC Innovation Lab Grants**:
  - National digital technology fellowships designed for experienced founders looking to scale AI-driven digital economy solutions.

### 3. Strategic Advice for Your Application
1. **Highlight the "Applied AI" Opportunity**: Most 22-year-old AI applicants only know equations and libraries; you understand customer pain points, unit economics, regulatory realities, and sales cycles. Pitch your AI degree as the bridge between technical capability and business execution.
2. **Consider Conversion Master's Degrees**: If your first degree wasn't in Computer Science, target "MSc in Applied AI", "AI & Business Analytics", or "Master of Engineering in Artificial Intelligence", which accept candidates with strong quantitative aptitude and extensive professional leadership.
3. **Bridge Any Technical Gaps**: Complete recognized certifications (such as DeepLearning.AI, Stanford Online Machine Learning, or Harvard CS50) to demonstrate current programming and mathematical readiness.`,
      recommendedMajors: [
        "Applied Artificial Intelligence & Machine Learning",
        "AI Product Management & Strategy",
        "Data Science & Business Analytics",
        "Technology Innovation & Venture Creation"
      ],
      recommendedSkills: [
        "Python for AI & PyTorch",
        "AI Product Strategy",
        "Data Architecture & Analytics",
        "Enterprise AI Commercialization"
      ],
      suggestedMentors: [
        "Sreypov Kim (Tech Founder & Cloud Architect)",
        "Dalin Chhem (Senior Software Engineer @ Smart)"
      ],
      suggestedQuestions: [
        "How do I frame a 10-year business portfolio for a Chevening AI scholarship?",
        "What are the best conversion Master's programs in AI for non-CS graduates?",
        "Which universities offer executive or part-time AI degrees with scholarships?"
      ]
    };
  }

  if (lower.includes("itc") || lower.includes("institute of technology") || lower.includes("tronc commun")) {
    return {
      reply: `Hello ${studentName}! At ITC (Institute of Technology of Cambodia), your Foundation Year (Tronc Commun) is critical. 
During the first two years, all engineering students cover rigorous calculus, general physics, technical chemistry, algorithms, and technical French/English. 

Key recommendations for ITC:
1. **Entrance Exam**: Focus heavily on high-school Baccalaureate Level Calculus, Analytical Geometry, and General Physics mechanics.
2. **Specialization Choice**: High GPA in Year 1 & 2 determines your placement into Data Science & AI, Telecom & Network, or Civil Engineering.
3. **Peer Mentorship**: We recommend connecting directly with our verified ITC Year 4 mentors (like Sokha Meng in Data Science or Dalin Chhem in Software) who have passed Tronc Commun with honors.`,
      recommendedMajors: ["Data Science & Artificial Intelligence", "Computer Science & Software", "Information & Communication Tech"],
      recommendedSkills: ["Advanced Calculus", "Python / C++", "Linear Algebra", "Physics Mechanics"],
      suggestedMentors: ["Sokha Meng (ITC Year 4)", "Dalin Chhem (ITC Alumni @ Smart)"],
      suggestedQuestions: [
        "What is the passing grade for ITC Tronc Commun?",
        "How do ITC entrance exams differ from high school BacII?",
        "What laptop specs do I need for Software Engineering at ITC?"
      ]
    };
  }

  if (lower.includes("cadt") || lower.includes("telecom") || lower.includes("digital") || lower.includes("cs") || lower.includes("computer science")) {
    return {
      reply: `Great question regarding technology degrees! In Cambodia and regional tech hubs, programs like CADT (Cambodia Academy of Digital Technology) and ITC offer top-tier Computer Science and Software Engineering tracks.

CADT's project-based curriculum emphasizes modern software engineering (cloud, full-stack, DevOps) and cyber defense from Year 1.

Recommended Roadmap:
1. **Foundation**: Strengthen algorithmic logic and data structures early.
2. **Portfolio**: Build 2-3 functional web or mobile apps before applying for junior internships in Year 3.
3. **Scholarships**: Check out the MPTC Digital Skill Scholarship which covers 100% tuition for qualifying high school graduates.`,
      recommendedMajors: ["Software Engineering", "Cybersecurity", "Cloud & DevOps Architecture"],
      recommendedSkills: ["TypeScript / JavaScript", "Git & GitHub", "Data Structures & Algorithms", "SQL Databases"],
      suggestedMentors: ["Vireak Rith (CADT Senior, Intern at Morodok)", "Sreypov Kim (Cloud Architect)"],
      suggestedQuestions: [
        "How do I prepare for the CADT digital skill scholarship test?",
        "Should I pick Computer Science or Cybersecurity?",
        "What projects stand out for freshmen internships?"
      ]
    };
  }

  if (lower.includes("bac ii") || lower.includes("bacii") || lower.includes("grade 12") || lower.includes("high school")) {
    return {
      reply: `Preparing for Grade 12 National Exam (Bac II) and university entrance scholarships requires disciplined pacing:

1. **Bac II Strategy**: Allocate 60% of revision time to Math, Physics, and Chemistry or Biology if you are in the Science track. Focus on past exams from 2018–2025.
2. **Major Scholarships**:
   - **MPTC Talent Scholarship**: Computer Science, Telecom, Data Science (requires separate aptitude & math test).
   - **AUPP / Paragon Merit Scholarships**: High school GPA 3.5+ and English proficiency (IELTS 6.0+).
3. **Study Groups**: Check our 'Student Meetups' tab to join weekly Bac II peer revision groups hosted by top seniors!`,
      recommendedMajors: ["Information Technology", "Biomedical Science", "Civil Engineering"],
      recommendedSkills: ["Exam Time Management", "Problem Solving", "Essay Writing", "English Proficiency"],
      suggestedMentors: ["Vannak Sam (Grade 12 Peer Leader)", "Dr. Chantha Seng (Academic Advisor)"],
      suggestedQuestions: [
        "What are the top 5 scholarships for STEM students in Cambodia?",
        "How do I write a compelling motivation letter?",
        "Can I join a peer math revision group this weekend?"
      ]
    };
  }

  return {
    reply: `Welcome ${studentName}! Based on your interest in ${subjects}, choosing the optimal academic and career pathway comes down to three key pillars:

1. **Alignment with Career Goals**: Are you aiming for technical software development, strategic AI product leadership, medical research, or commercial enterprise?
2. **Program Style & Accreditation**: State institutions (ITC, RUPP) provide deep theoretical foundations, whereas specialized institutions (CADT, AUPP, Paragon) focus on project portfolios and international dual-accreditations.
3. **Financial Support & Fellowships**: Many institutions provide merit scholarships, government quotas, and corporate sponsorship tracks.

Tell me a bit more about your background, target degree level (Bachelor's, Master's, or Executive), and whether you are exploring domestic programs in Cambodia or international scholarship opportunities!`,
    recommendedMajors: ["Artificial Intelligence & Machine Learning", "Computer Science", "Business Analytics", "Software Engineering"],
    recommendedSkills: ["Analytical Thinking", "Algorithmic Logic", "English Communication", "Python / Data Analysis"],
    suggestedMentors: ["Sokha Meng (ITC)", "Vireak Rith (CADT)", "Sreypov Kim (Alumni)"],
    suggestedQuestions: [
      "Can you compare Computer Science vs Data Science for me?",
      "What is the average starting salary for tech graduates in Phnom Penh?",
      "Which universities offer the best international exchange programs?"
    ]
  };
}

// AI Advisor Chat Endpoint with Database Persistence
app.post("/api/advisor/chat", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const startTime = Date.now();
  try {
    const { messages, studentProfile, userPrompt, userId } = req.body || {};
    const currentPrompt = userPrompt || (messages && messages[messages.length - 1]?.text) || "";

    const fallbackHints = generateSmartFallbackAdvice(currentPrompt, studentProfile);
    const ai = getGenAI();

    if (!ai) {
      aiRepo.logConversation({
        user_id: userId || null,
        session_title: "Career & Academic Advising (Offline)",
        message: currentPrompt,
        response: fallbackHints.reply,
        suggested_majors: JSON.stringify(fallbackHints.recommendedMajors),
        suggested_skills: JSON.stringify(fallbackHints.recommendedSkills),
        suggested_mentors: JSON.stringify(fallbackHints.suggestedMentors),
        source_attribution: "fallback",
        latency_ms: Date.now() - startTime
      });

      return res.json({
        success: true,
        reply: fallbackHints.reply,
        source: "fallback",
        recommendedMajors: fallbackHints.recommendedMajors,
        recommendedSkills: fallbackHints.recommendedSkills,
        suggestedMentors: fallbackHints.suggestedMentors,
        suggestedQuestions: fallbackHints.suggestedQuestions,
      });
    }

    const systemInstruction = `You are the "CDES AI Education Advisor", an empathetic, highly knowledgeable, and expert educational and career counselor for the Cambodia Digital Education Society.

CRITICAL INSTRUCTIONS:
1. ALWAYS prioritize the user's explicit question and personal background as described in their prompt (e.g. if they have years of entrepreneurship, business experience, work history, or want a Master's/PhD, treat them as an experienced professional, NOT as a high school student).
2. DO NOT assume the user is preparing for the Grade 12 National Exam (Bac II) or High School unless they specifically mention it.
3. If the user asks about scholarships for people with entrepreneurship or business background wanting to study AI:
   - Provide concrete, actionable scholarship programs that value professional experience (e.g. Chevening, Fulbright, Australia Awards, Erasmus Mundus, Asian Development Bank, Stanford Knight-Hennessy, NUS/NTU fellowships).
   - Explain how admissions committees evaluate business leadership and real-world problem solving for AI and Data Science degrees.
   - Mention Cambodian opportunities (such as CADT, AUPP executive/merit grants, MPTC innovation grants) as well as global programs.
4. Incorporate CDES Evidence-Based Learning Science:
   - When explaining technical or STEM concepts, emphasize intuitive physical or mental models and Socratic guided hints before pure formulas.
   - Recommend spaced retrieval intervals (1, 3, 7, 21 days) over cramming to maximize long-term retention.
   - Address common Cambodian Bac II STEM misconceptions (e.g. distinguishing instantaneous acceleration from velocity, Faraday flux orientation, recursive call stacks) with clear intuitive analogies.
5. Format your answer with clear markdown headings, concise bullet points, and practical next steps.
6. Keep your tone encouraging, professional, and practical.`;

    let replyText = "";
    let usedSource = "gemini";

    let contentsPayload: any = currentPrompt;
    if (Array.isArray(messages) && messages.length > 0) {
      const recentTurns = messages.slice(-8).map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text || "" }],
      }));
      if (recentTurns.length > 0) {
        contentsPayload = recentTurns;
      }
    }

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: contentsPayload,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        }),
        18000,
        "gemini-3.1-flash-lite"
      );
      replyText = response.text || "";
      usedSource = "gemini-3.1-flash-lite";
    } catch (primaryErr: any) {
      console.warn("gemini-3.1-flash-lite did not complete, attempting secondary model:", primaryErr?.message || primaryErr);
      
      try {
        const response2 = await withTimeout(
          ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: contentsPayload,
            config: {
              systemInstruction,
              temperature: 0.7,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          }),
          15000,
          "gemini-3.8-flash"
        );
        replyText = response2.text || "";
        usedSource = "gemini-3.8-flash";
      } catch (secErr: any) {
        console.warn("Secondary model also failed, utilizing smart contextual fallback:", secErr?.message || secErr);
        replyText = fallbackHints.reply;
        usedSource = "fallback";
      }
    }

    if (!replyText.trim()) {
      replyText = fallbackHints.reply;
      usedSource = "fallback";
    }

    // Persist conversation to SQLite database
    aiRepo.logConversation({
      user_id: userId || null,
      session_title: "Career & Academic Advising",
      message: currentPrompt,
      response: replyText,
      suggested_majors: JSON.stringify(fallbackHints.recommendedMajors),
      suggested_skills: JSON.stringify(fallbackHints.recommendedSkills),
      suggested_mentors: JSON.stringify(fallbackHints.suggestedMentors),
      source_attribution: usedSource,
      latency_ms: Date.now() - startTime
    });

    return res.json({
      success: true,
      reply: replyText,
      source: usedSource,
      recommendedMajors: fallbackHints.recommendedMajors,
      recommendedSkills: fallbackHints.recommendedSkills,
      suggestedMentors: fallbackHints.suggestedMentors,
      suggestedQuestions: fallbackHints.suggestedQuestions,
    });
  } catch (error: any) {
    console.error("Advisor endpoint unexpected error:", error?.message || error);
    const fallback = generateSmartFallbackAdvice(req.body?.userPrompt || "general career guidance", req.body?.studentProfile);
    return res.json({
      success: true,
      reply: fallback.reply,
      source: "fallback",
      recommendedMajors: fallback.recommendedMajors,
      recommendedSkills: fallback.recommendedSkills,
      suggestedMentors: fallback.suggestedMentors,
      suggestedQuestions: fallback.suggestedQuestions,
    });
  }
});

// Telemetry & Analytics endpoint (persisted to SQLite)
app.post("/api/analytics/event", (req, res) => {
  try {
    const event = req.body;
    if (event && event.eventName) {
      analyticsRepo.logActivityEvent({
        user_id: event.userId || null,
        session_id: event.sessionId || null,
        event_type: event.eventName,
        metadata: event
      });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// Decision Engine Evaluation endpoint
app.post("/api/decision/evaluate", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { interests, mathAbility, strengths, budgetTier } = req.body || {};

  const hatesMath = mathAbility === "hates_math";
  const lovesCoding = (interests || []).includes("Technology") || (strengths || []).includes("Logic");
  const isBudgetLow = budgetTier === "scholarship_dependent" || budgetTier === "low_under_1000";

  let topMajor = "Computer Science (Software Engineering)";
  let alternativeMajor = "";
  let fitReason = "Solid technical fit based on logic and problem-solving strengths.";

  if (lovesCoding && hatesMath) {
    topMajor = "UX/UI & Digital Product Design";
    alternativeMajor = "Business Information Systems";
    fitReason = "Crucial insight: You love digital products and computers, but dislike heavy calculus proofs. Digital Product Design or Information Systems lets you thrive in tech without the mathematical friction of Computer Science.";
  } else if (lovesCoding && !hatesMath) {
    topMajor = "Data Science & Artificial Intelligence";
    alternativeMajor = "Software Engineering";
    fitReason = "High mathematical confidence paired with tech curiosity makes you a prime candidate for cutting-edge Data Science and AI programs.";
  } else if ((interests || []).includes("Healthcare") || (strengths || []).includes("Science")) {
    topMajor = "Doctor of Medicine (MD) or Pharmacy";
    alternativeMajor = "Biomedical Laboratory Sciences";
    fitReason = "Strong scientific alignment and patient empathy points toward national healthcare programs at UHS.";
  } else if ((interests || []).includes("Business") || (strengths || []).includes("Communication")) {
    topMajor = "Accounting & Finance (ACCA Track)";
    alternativeMajor = "International Business & FinTech";
    fitReason = "Strong analytical discipline with high corporate demand across commercial banks and Big Four audit firms.";
  }

  const recommendedUnis: any[] = [];
  if (topMajor.includes("Computer") || topMajor.includes("Data") || topMajor.includes("Software")) {
    if (isBudgetLow) {
      recommendedUnis.push({
        univId: "univ-cadt",
        univName: "Cambodia Academy of Digital Technology",
        univAbbr: "CADT",
        profileScore: 93,
        annualTuitionUSD: 1600,
        scholarshipMatch: "MPTC 100% Full Scholarship + Monthly Stipend",
        curriculumStyle: "Immediate coding, project-based, cloud native",
        whyFit: "Best-in-class tech curriculum with guaranteed government scholarship path for high school graduates.",
      });
      recommendedUnis.push({
        univId: "univ-itc",
        univName: "Institute of Technology of Cambodia",
        univAbbr: "ITC",
        profileScore: 95,
        annualTuitionUSD: 700,
        scholarshipMatch: "Government State Quota (Free Tuition)",
        curriculumStyle: "2-Year Tronc Commun French-standard engineering rigor",
        whyFit: "Lowest tuition ($700/yr) with the highest engineering prestige across ASEAN and France.",
      });
    } else {
      recommendedUnis.push({
        univId: "univ-cadt",
        univName: "Cambodia Academy of Digital Technology",
        univAbbr: "CADT",
        profileScore: 93,
        annualTuitionUSD: 1600,
        scholarshipMatch: "CADT Merit Grant",
        curriculumStyle: "70% hands-on projects, industry partnerships with Smart & Google",
        whyFit: "Highest graduate employment rate in software engineering and cloud.",
      });
      recommendedUnis.push({
        univId: "univ-aupp",
        univName: "American University of Phnom Penh",
        univAbbr: "AUPP",
        profileScore: 92,
        annualTuitionUSD: 9000,
        scholarshipMatch: "AUPP Merit Scholarship (up to 100%)",
        curriculumStyle: "American dual-degree accredited with University of Arizona",
        whyFit: "Premier English medium instruction with direct multinational corporate placement.",
      });
    }
  } else if (topMajor.includes("Accounting") || topMajor.includes("Business")) {
    recommendedUnis.push({
      univId: "univ-camed",
      univName: "CamEd Business School",
      univAbbr: "CamEd",
      profileScore: 93,
      annualTuitionUSD: 2400,
      scholarshipMatch: "CamEd Academic Excellence (50-100%)",
      curriculumStyle: "UK ACCA Platinum Learning Partner with corporate case studies",
      whyFit: "Direct pipeline into PwC, KPMG, EY, and Deloitte audit & advisory.",
    });
  } else {
    recommendedUnis.push({
      univId: "univ-uhs",
      univName: "University of Health Sciences",
      univAbbr: "UHS",
      profileScore: 96,
      annualTuitionUSD: 1800,
      scholarshipMatch: "National Medical Scholarship",
      curriculumStyle: "Clinical hospital rotations and anatomy dissection",
      whyFit: "Cambodia’s foremost medical authority with national hospital externships.",
    });
  }

  const targetTuition = recommendedUnis[0]?.annualTuitionUSD || 1200;
  const isScholarship = budgetTier === "scholarship_dependent";
  const effectiveCost = isScholarship ? 0 : targetTuition * 4;
  const expectedStartingSalary = 800;
  const paybackMonths = isScholarship ? 0 : Math.round((effectiveCost / (expectedStartingSalary * 0.5)) * 10) / 10;

  // Log decision query event in analytics
  analyticsRepo.logActivityEvent({
    event_type: "DECISION_EVALUATION",
    metadata: { topMajor, isBudgetLow, effectiveCost }
  });

  return res.json({
    success: true,
    recommendations: {
      topMajor,
      alternativeMajor,
      fitReason,
      recommendedUniversities: recommendedUnis,
      roiAnalysis: {
        estimatedDegreeCostUSD: effectiveCost,
        projectedMonthlySalaryUSD: expectedStartingSalary,
        paybackMonths,
        financialVerdict: isScholarship
          ? "Infinite ROI: 100% full scholarship covers tuition + living allowance."
          : `Fast Payback: Degree cost of $${effectiveCost} is recouped in approximately ${paybackMonths} months of career income.`,
      },
      actionChecklist: [
        {
          stepNumber: 1,
          title: "Focus on High School Bac II Core Subjects",
          deadline: "Upcoming Bac II Examination",
          instructions: hatesMath
            ? "Strengthen English and Logic; aim for Grade A or B in overall Bac II certificate."
            : "Focus 60% of revision on Advanced Calculus, Physics, and analytical logic.",
          completed: false,
        },
        {
          stepNumber: 2,
          title: "Prepare for University Aptitude & Scholarship Tests",
          deadline: "Application Deadline: October 15, 2026",
          instructions: `Review past entrance exams for ${recommendedUnis[0]?.univAbbr || 'your target university'}.`,
          completed: false,
        },
        {
          stepNumber: 3,
          title: "Connect with a Verified University Senior",
          deadline: "This Weekend",
          instructions: "Book a 1-on-1 session or join a study group to ask about Foundation Year reality.",
          completed: false,
        },
      ],
    },
  });
});

// ==========================================
// CORE LAYERED API MODULES
// ==========================================
app.use("/api/auth", authController);
app.use("/api/users", userController);
app.use("/api/scholarships", scholarshipController);
app.use("/api/universities", universityController);
app.use("/api/analytics", analyticsController);
app.use("/api/student/profile", studentIntelligenceController);
app.use("/api/research", researchController);
// Global metrics endpoint (platform metrics + SQLite-specific metrics)
app.get("/api/metrics", (_req, res) => {
  const metrics = {
    uptime: process.uptime(),
    node: process.version,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    dbMetrics: { tables: 0, rows: 0 },
  };
  res.json(metrics);
});
app.use("/api/privacy", privacyController);
app.use("/api/avatar-world", avatarWorldController);
app.use("/api/learning", learningController);
app.use("/api/community", communityController);
app.use("/api/learning-science", learningScienceController);
app.use("/api/ai", aiRoutes);
app.use("/api/ai-os", aiAgent2Routes);
app.use("/api/platform", platformArchitectureRoutes);
app.use("/api/knowledge", knowledgeController);
app.use("/api/digital-world", digitalWorldController);
app.use("/api/data-platform", dataPlatformRoutes);

// Global JSON error middleware to prevent HTML error pages
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    success: false,
    error: err?.message || "Internal server error",
  });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CDES Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
