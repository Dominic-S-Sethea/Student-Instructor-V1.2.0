import { TrackedDatabase } from './metrics';
import { initialScholarships } from '../../shared/data/scholarshipData';
import { topCambodianUniversities } from '../../shared/data/universityIntelligenceData';
import { parseUsdMonthlyStipend } from '../services/scholarshipFormatter';
import {
  initialSubjects,
  initialCategories,
  initialLearningContent,
  initialLabExperiments,
  initialLearningActivities,
  initialLearningPaths,
  initialLearningPathSteps,
} from '../data/learningWorldSeed';
import { initialKnowledgeDocuments } from '../data/knowledgeBaseSeed';
import { embeddingService } from '../services/embeddingService';
import {
  initialCommunities,
  initialCommunityPosts,
  initialCommunityComments,
  initialMentors,
  initialStudentProjects,
  initialCampusEvents,
  initialPartnerOrgs,
} from '../data/communitySeed';
import {
  initialResearchExperiments,
  initialTeachingMethodBenchmarks,
  initialTeacherClassAnalytics,
  initialEducationKnowledgeAggregates,
} from '../data/researchSeed';
import {
  initialUniversitiesLake,
  initialScholarshipsLake,
  initialCareersLake,
  initialIndustriesLake,
  initialPsychometricsLake,
  initialLearningScienceLake,
  initialMLModelsRegistry,
} from '../data/dataPlatformSeed';

function safeVal<T>(val: T | undefined | null, fallback: T | null = null): T | null {
  return val === undefined ? fallback : val;
}

function seedScholarships(db: TrackedDatabase, now: string): void {
  const schCount = (db.prepare('SELECT COUNT(*) as count FROM scholarships').get() as { count: number }).count;
  if (schCount > 0) return;

  const insertScholarship = db.prepare(`
    INSERT INTO scholarships (
      id, legacy_code, name, name_km, provider, provider_km, country, country_km, region,
      degree_levels, field_of_study, funding_type, funding_details, funding_details_km,
      eligibility_summary, eligibility_summary_km, overview, overview_km, target_demographic,
      application_link, official_source_url, deadline, is_deadline_rolling, is_verified,
      verification_tier, tags, monthly_allowance_text, monthly_allowance_text_km,
      accommodation_text, accommodation_text_km, insurance_text, insurance_text_km,
      flight_support_text, flight_support_text_km, verified_at, verified_by,
      estimated_value_usd, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertReqs = db.prepare(`
    INSERT INTO scholarship_requirements (
      id, scholarship_id, gpa_minimum, ielts_minimum, toefl_minimum, age_limit, nationalities,
      work_experience_years, required_documents, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertFunding = db.prepare(`
    INSERT INTO scholarship_funding (
      id, scholarship_id, covers_tuition, tuition_coverage_percentage, monthly_stipend_usd,
      covers_flights, covers_visa, covers_health_insurance, funding_currency
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of initialScholarships) {
    const isFull = s.fundingType.toLowerCase().includes('full');
    const gpaReq = typeof s.minGpa === 'number' ? s.minGpa : null;
    const ageLimit = typeof s.maxAge === 'number' ? s.maxAge : null;
    const workExp = typeof s.workExpYears === 'number' ? s.workExpYears : 0;
    let englishMin: number | null = null;
    if (s.englishRequirement?.minScore) {
      const match = s.englishRequirement.minScore.match(/IELTS\s*([0-9]+(?:\.[0-9]+)?)/i)
        || s.englishRequirement.minScore.match(/^([0-9]+(?:\.[0-9]+)?)/);
      if (match) englishMin = parseFloat(match[1]) || null;
    }
    const tagsList = Array.from(new Set([...(s.fieldOfStudy || []), s.region, s.country, s.fundingType, ...(s.eligibleStudentCategories || [])]));
    const verifiedAt = s.lastVerifiedDate || null;
    const updatedAt = s.lastUpdatedDate ? `${s.lastUpdatedDate}T00:00:00.000Z` : now;

    insertScholarship.run(
      s.id, s.id, s.name, safeVal(s.nameKm, ''), s.provider, safeVal(s.providerKm, ''),
      s.country, safeVal(s.countryKm, ''), s.region, JSON.stringify(s.degreeLevel || []),
      JSON.stringify(s.fieldOfStudy || []), s.fundingType,
      safeVal(s.tuitionCoverage || s.monthlyAllowance, ''), safeVal(s.tuitionCoverageKm || s.monthlyAllowanceKm, ''),
      safeVal(s.nationalityRequirement, ''), safeVal(s.nationalityRequirementKm, ''),
      safeVal(s.overview, ''), safeVal(s.overviewKm, ''), JSON.stringify(s.eligibleStudentCategories || []),
      safeVal(s.applicationLink, ''), safeVal(s.officialSourceUrl, ''), safeVal(s.deadline, ''),
      s.deadlineType === 'Rolling' ? 1 : 0, s.verifiedBadge ? 1 : 0, safeVal(s.verificationStatus, 'official'),
      JSON.stringify(tagsList), safeVal(s.monthlyAllowance, null), safeVal(s.monthlyAllowanceKm, null),
      safeVal(s.accommodation, null), safeVal(s.accommodationKm, null),
      safeVal(s.insurance, null), safeVal(s.insuranceKm, null),
      safeVal(s.flightSupport, null), safeVal(s.flightSupportKm, null),
      verifiedAt, safeVal(s.verifierName, null),
      typeof s.totalEstimatedValueUSD === 'number' ? s.totalEstimatedValueUSD : null,
      now, updatedAt
    );

    insertReqs.run(
      `req-${s.id}`, s.id, gpaReq, englishMin, null, ageLimit, JSON.stringify(['Cambodian']),
      workExp, JSON.stringify(s.requiredDocuments || []), safeVal(s.englishRequirement?.details, '')
    );

    const flightText = (s.flightSupport || '').trim().toLowerCase();
    const insText = (s.insurance || '').trim().toLowerCase();
    const coversFlights = flightText
      ? (flightText.includes('not included') || flightText.includes('not applicable') || /^none\b/.test(flightText) ? 0 : 1)
      : null;
    const coversInsurance = insText
      ? (insText.includes('not included') || insText.includes('not applicable') || /^none\b/.test(insText) ? 0 : 1)
      : null;
    const stipendUsd = parseUsdMonthlyStipend(s.monthlyAllowance);

    insertFunding.run(
      `fnd-${s.id}`, s.id, isFull || s.fundingType === 'Tuition only' ? 1 : 0,
      isFull || s.fundingType === 'Tuition only' ? 100 : null,
      stipendUsd, coversFlights, isFull ? 1 : null, coversInsurance, 'USD'
    );
  }
}

function seedUniversities(db: TrackedDatabase, now: string): void {
  const univCount = (db.prepare('SELECT COUNT(*) as count FROM universities').get() as { count: number }).count;
  if (univCount > 0) return;

  const insertUniv = db.prepare(`
    INSERT INTO universities (
      id, abbr, name, khmer_name, location, type, founded_year, website, logo, cover_image,
      profile_score_overall, academic_reputation_score, industry_connection_score, facilities_score,
      graduate_outcome_score, annual_tuition_usd, total_degree_cost_usd, accreditation_status,
      verification_confidence, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMajor = db.prepare(`
    INSERT INTO majors (
      id, university_id, slug, name, faculty, degree_type, duration_years, difficulty_rating,
      difficulty_reason, job_market_demand, average_starting_salary, course_structure,
      technical_skills, soft_skills, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of topCambodianUniversities) {
    insertUniv.run(
      u.id, u.abbr, u.name, safeVal(u.khmerName, ''), safeVal(u.location, 'Phnom Penh'),
      safeVal(u.type, 'Public'), safeVal(u.foundedYear, null), safeVal(u.website, ''),
      safeVal(u.logo, ''), safeVal(u.coverImage, ''), safeVal(u.profileScore?.overall, 90),
      safeVal(u.profileScore?.academicReputation, 90), safeVal(u.profileScore?.industryConnection, 85),
      safeVal(u.profileScore?.facilities, 85), safeVal(u.profileScore?.graduateOutcome, 90),
      safeVal(u.annualTuitionUSD, 0), safeVal(u.totalDegreeCostUSD, 0),
      safeVal(u.accreditation?.status, null), 'official', now, now
    );
    if (Array.isArray(u.majors)) {
      for (const m of u.majors) {
        const slug = m.id || m.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        insertMajor.run(
          `${u.id}-${slug}`, u.id, slug, safeVal(m.name, 'Major Program'),
          safeVal(m.faculty, 'General'), safeVal(m.degreeType, 'Bachelor of Science'),
          safeVal(m.durationYears, 4.0), safeVal(m.difficultyRating, 4.0),
          safeVal(m.difficultyReason, ''), safeVal(m.jobMarketDemand, 'High'),
          safeVal(m.averageStartingSalary, ''), JSON.stringify(m.courseStructure || []),
          JSON.stringify(m.technicalSkillsGained || []), JSON.stringify(m.softSkillsGained || []), now
        );
      }
    }
  }
}

function seedLearningAndAvatarCatalog(db: TrackedDatabase, now: string): void {
  if ((db.prepare('SELECT COUNT(*) as count FROM avatar_items').get() as { count: number }).count === 0) {
    const insItem = db.prepare(`
      INSERT INTO avatar_items (id, name, category, description, icon_key, default_slot, educational_value, subject_tag, unlock_condition_type, unlock_condition_val, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const items: Array<[string, string, string, string, string, string, string, string, string, string | null]> = [
      ['itm-desk', 'Smart Study Desk', 'Furniture', 'Solid oak ergonomic desk for focused study.', 'desk', 'floor', 'Promotes 50-minute focus intervals.', 'General', 'free', null],
      ['itm-chair', 'Ergonomic Study Chair', 'Furniture', 'High-lumbar chair for exam prep.', 'chair', 'floor', 'Reduces fatigue during calculus sets.', 'General', 'free', null],
      ['itm-bookshelf', 'Cambodian STEM Library Shelf', 'Furniture', 'Bookshelf stocked with MoEYS Bac II texts.', 'bookshelf', 'floor', 'Boosts reference speed.', 'Computer Science', 'learning_milestone', 'Complete 3 STEM lessons'],
      ['itm-computer', 'High-Performance Terminal', 'Learning Object', 'Developer station with Python and simulation runtimes.', 'computer', 'desk', 'Enables code compilation.', 'Computer Science', 'free', null],
      ['itm-microscope', 'Digital STEM Microscope', 'Learning Object', 'Digital microscope for cellular histology.', 'microscope', 'desk', 'Connects biology to cell structures.', 'STEM', 'achievement', 'ACH_STEM_SIM'],
      ['itm-chem-kit', 'Molecular Chemistry Kit', 'Learning Object', 'Titration and 3D molecular modeling kit.', 'chemistry_kit', 'desk', 'Reinforces stoichiometry principles.', 'Chemistry', 'quiz_score', 'Score 80%+ on Chemistry diagnostic'],
      ['itm-telescope', 'Celestial Refractor Telescope', 'Learning Object', '90mm refractor for orbital kinematics.', 'telescope', 'floor', 'Verifies gravitational laws.', 'Physics', 'achievement', 'ACH_PHYSICS_ACE'],
      ['itm-cert-frame', 'Gold Bac II Honor Certificate Frame', 'Achievement', 'Display frame for Olympiad medals.', 'certificate_frame', 'wall', 'Visual reinforcement of effort.', 'MoEYS Bac II', 'achievement', 'ACH_BAC2_SCHOLAR'],
      ['itm-whiteboard', 'Algorithmic Whiteboard', 'Furniture', 'Glass dry-erase board for system diagrams.', 'whiteboard', 'wall', 'Facilitates spatial decomposition.', 'Mathematics', 'free', null],
      ['itm-plant', 'Bonsai Oxygen Plant', 'Decoration', 'Calming study workspace plant.', 'plant', 'desk', 'Biophilic study focus enhancement.', 'General', 'free', null],
      ['itm-lamp', 'Dual-Spectrum Study Lamp', 'Decoration', 'Circadian eye-care LED lamp.', 'lamp', 'desk', 'Supports comfortable study habits.', 'General', 'free', null],
      ['itm-poster-solar', 'Astrophysics Deep Space Chart', 'Decoration', 'Solar system and trajectory chart.', 'poster', 'wall', 'Visual mnemonic for astrophysics.', 'Physics', 'free', null],
    ];
    for (const item of items) insItem.run(...item, now);

    const insLoc = db.prepare(`INSERT OR IGNORE INTO world_locations (id, slug, name, name_km, description, icon_key, access_level, is_unlocked, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    insLoc.run('loc-room', 'room', 'Student Study Sanctuary', 'បន្ទប់សិក្សាផ្ទាល់ខ្លួន', 'Private study sanctuary.', 'home', 'student', 1, 1);
    insLoc.run('loc-hallway', 'hallway', 'Central Academic Hallway', 'សាលកណ្ដាល', 'Central campus connector.', 'compass', 'student', 1, 2);
    insLoc.run('loc-library', 'library', 'National Digital Library', 'បណ្ណាល័យឌីជីថលជាតិ', 'MoEYS Bac II archive.', 'book-open', 'student', 1, 3);
    insLoc.run('loc-lab', 'laboratory', 'STEM Simulation Lab', 'បន្ទប់ពិសោធន៍ STEM', 'Interactive STEM simulations.', 'flask', 'student', 1, 4);
    insLoc.run('loc-career', 'career_center', 'Career & University Center', 'មជ្ឈមណ្ឌលការងារ និងសាកលវិទ្យាល័យ', 'Scholarship and career guidance.', 'briefcase', 'student', 1, 5);
    insLoc.run('loc-community', 'community', 'Student Peer Commons', 'សហគមន៍សិស្សានុសិស្ស', 'Study circles and AMAs.', 'users', 'student', 1, 6);

    const insAch = db.prepare(`INSERT OR IGNORE INTO achievements (id, code, title, title_km, description, category, badge_icon, item_reward_id, merit_points, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    insAch.run('ach-01', 'ACH_BAC2_SCHOLAR', 'Bac II STEM Pioneer', 'អ្នកត្រួសត្រាយ STEM បាក់ឌុប', 'Completed Grade 12 STEM modules.', 'Learning completion', 'award', 'itm-cert-frame', 100, now);
    insAch.run('ach-02', 'ACH_PHYSICS_ACE', 'Newton Mechanics Master', 'ជើងឯកមេកានិចញូតុន', '90%+ on kinematics simulations.', 'Quiz scores', 'zap', 'itm-telescope', 80, now);
    insAch.run('ach-03', 'ACH_STEM_SIM', 'Virtual Circuit Architect', 'ស្ថាបត្យករសៀគ្វីនិម្មិត', 'Completed binary logic sync.', 'STEM activities', 'flask', 'itm-microscope', 75, now);
    insAch.run('ach-04', 'ACH_SCHOLAR_SEARCH', 'Global Opportunity Scout', 'អ្នករុករកអាហារូបករណ៍', 'Researched 3 scholarships.', 'Scholarship activities', 'compass', 'itm-computer', 50, now);
    insAch.run('ach-05', 'ACH_PEER_CONTRIB', 'Knowledge Contributor', 'អ្នកចែករំលែកចំណេះដឹង', 'Joined peer study circle.', 'Community contribution', 'star', 'itm-bookshelf', 60, now);
    insAch.run('ach-lab-chem', 'ach-lab-chem', 'Chemistry Explorer Badge', 'អ្នករុករកគីមីវិទ្យា', 'Mastered volumetric titration.', 'STEM activities', 'flask', 'itm-chem-kit', 80, now);
    insAch.run('ach-lab-phys', 'ach-lab-phys', 'Newtonian Mechanics Master', 'រូបវិទូញូតុន', 'Determined g via pendulum.', 'STEM activities', 'zap', 'itm-telescope', 75, now);
    insAch.run('ach-lab-bio', 'ach-lab-bio', 'Biosphere Cell Investigator', 'អ្នកស្រាវជ្រាវជីវវិទ្យា', 'Conducted cellular osmosis lab.', 'STEM activities', 'microscope', 'itm-microscope', 75, now);
    insAch.run('ach-path-ai', 'ach-path-ai', 'AI Pathway Pioneer', 'សិក្ខាកាមបញ្ញាសិប្បនិម្មិត', 'Mastered AI Engineer roadmap stages.', 'Learning completion', 'star', 'itm-computer', 100, now);
    insAch.run('ach-stem-circuit', 'ach-stem-circuit', 'Digital Logic Architect', 'ស្ថាបត្យករសៀគ្វីឌីជីថល', 'Built boolean logic synchronizers.', 'STEM activities', 'shield-check', 'itm-whiteboard', 60, now);
  }

  if ((db.prepare('SELECT COUNT(*) as count FROM subjects').get() as { count: number }).count === 0) {
    const insSub = db.prepare(`INSERT OR IGNORE INTO subjects (id, slug, name, name_km, description, icon_key, color, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const s of initialSubjects) insSub.run(s.id, s.slug, s.name, s.name_km, s.description, s.icon_key, s.color, s.order_index);
    const insCat = db.prepare(`INSERT OR IGNORE INTO categories (id, subject_id, slug, name, name_km, description, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const c of initialCategories) insCat.run(c.id, c.subject_id, c.slug, c.name, c.name_km, c.description, c.order_index);
    const insCnt = db.prepare(`INSERT OR IGNORE INTO learning_content (id, subject_id, category_id, title, title_km, content_type, difficulty, read_time_minutes, media_url, body_markdown, simulation_config, quiz_data, project_brief, learning_objectives, merit_points, is_featured, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const cnt of initialLearningContent) {
      insCnt.run(cnt.id, cnt.subject_id, cnt.category_id, cnt.title, cnt.title_km, cnt.content_type, cnt.difficulty, cnt.read_time_minutes, cnt.media_url || null, cnt.body_markdown, JSON.stringify(cnt.simulation_config || {}), JSON.stringify(cnt.quiz_data || []), JSON.stringify(cnt.project_brief || {}), JSON.stringify(cnt.learning_objectives || []), cnt.merit_points, cnt.is_featured, cnt.created_at);
    }
    const insExp = db.prepare(`INSERT OR IGNORE INTO lab_experiments (id, subject_id, title, title_km, category, description, learning_objectives, apparatus_list, instructions, parameters_schema, initial_state, expected_outcome, safety_notes, merit_points, difficulty, badge_reward_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const exp of initialLabExperiments) {
      insExp.run(exp.id, exp.subject_id, exp.title, exp.title_km, exp.category, exp.description, JSON.stringify(exp.learning_objectives || []), JSON.stringify(exp.apparatus_list || []), JSON.stringify(exp.instructions || []), JSON.stringify(exp.parameters_schema || {}), JSON.stringify(exp.initial_state || {}), JSON.stringify(exp.expected_outcome || {}), exp.safety_notes || null, exp.merit_points, exp.difficulty, exp.badge_reward_code || null, exp.created_at);
    }
    const insAct = db.prepare(`INSERT OR IGNORE INTO learning_activities (id, title, title_km, activity_type, subject_id, difficulty, learning_objective, instructions, activity_data, hint, reward_points, item_reward_id, badge_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const act of initialLearningActivities) {
      insAct.run(act.id, act.title, act.title_km, act.activity_type, act.subject_id, act.difficulty, act.learning_objective, act.instructions, JSON.stringify(act.activity_data || {}), act.hint || null, act.reward_points, act.item_reward_id || null, act.badge_code || null, act.created_at);
    }
    const insPath = db.prepare(`INSERT OR IGNORE INTO learning_paths (id, code, title, title_km, target_career, description, difficulty, estimated_weeks, icon_key, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const p of initialLearningPaths) insPath.run(p.id, p.code, p.title, p.title_km, p.target_career, p.description, p.difficulty, p.estimated_weeks, p.icon_key, p.color, p.created_at);
    const insStep = db.prepare(`INSERT OR IGNORE INTO learning_path_steps (id, path_id, step_order, title, title_km, subject, step_type, reference_id, description, is_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const s of initialLearningPathSteps) insStep.run(s.id, s.path_id, s.step_order, s.title, s.title_km, s.subject, s.step_type, s.reference_id || null, s.description, s.is_required);
  }
}

function seedKnowledgeCommunityAndLakes(db: TrackedDatabase, now: string): void {
  if ((db.prepare('SELECT COUNT(*) as c FROM knowledge_documents').get() as { c: number }).c === 0) {
    const insDoc = db.prepare(`INSERT OR IGNORE INTO knowledge_documents (id, title, category, content, source, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
    const insEmb = db.prepare(`INSERT OR IGNORE INTO knowledge_embeddings (id, document_id, vector, metadata, created_at) VALUES (?, ?, ?, ?, ?)`);
    for (const doc of initialKnowledgeDocuments) {
      insDoc.run(doc.id, doc.title, doc.category, doc.content, doc.source, now);
      const vector = embeddingService.generateEmbedding(`${doc.title} ${doc.category} ${doc.content} ${doc.keywords.join(' ')}`);
      insEmb.run(`emb-${doc.id}`, doc.id, JSON.stringify(vector), JSON.stringify({ title: doc.title, category: doc.category, source: doc.source, keywords: doc.keywords }), now);
    }
  }

  if ((db.prepare('SELECT COUNT(*) as c FROM communities').get() as { c: number }).c === 0) {
    const insComm = db.prepare(`INSERT OR IGNORE INTO communities (id, slug, name, name_km, description, category, icon_key, color, created_by, is_verified, member_count, post_count, safety_level, rules, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const c of initialCommunities) insComm.run(c.id, c.slug, c.name, c.name_km, c.description, c.category, c.icon_key, c.color, c.created_by, c.is_verified, c.member_count, c.post_count, c.safety_level, c.rules, now);
    const insPost = db.prepare(`INSERT OR IGNORE INTO community_posts (id, community_id, author_id, author_name, author_role, author_avatar, post_type, title, content, tags, upvotes_count, comments_count, is_pinned, is_solved, solved_comment_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const p of initialCommunityPosts) insPost.run(p.id, p.community_id, p.author_id, p.author_name, p.author_role, p.author_avatar, p.post_type, p.title, p.content, p.tags, p.upvotes_count, p.comments_count, p.is_pinned, p.is_solved, (p as { solved_comment_id?: string }).solved_comment_id || null, p.status, p.created_at, p.updated_at);
    const insCmt = db.prepare(`INSERT OR IGNORE INTO community_comments (id, post_id, author_id, author_name, author_role, author_avatar, parent_comment_id, content, upvotes_count, is_accepted_answer, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const c of initialCommunityComments) insCmt.run(c.id, c.post_id, c.author_id, c.author_name, c.author_role, c.author_avatar, c.parent_comment_id, c.content, c.upvotes_count, c.is_accepted_answer, c.status, c.created_at);
    const insMentor = db.prepare(`INSERT OR IGNORE INTO mentor_profiles (id, user_id, full_name, full_name_km, title, organization, bio, expertise_areas, university_id, degree, graduation_year, verified_badge, rating, total_sessions, availability_slots, is_accepting_mentees, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const m of initialMentors) insMentor.run(m.id, m.user_id, m.full_name, m.full_name_km, m.title, m.organization, m.bio, JSON.stringify(m.expertise_areas), m.university_id, m.degree, m.graduation_year, m.verified_badge, m.rating, m.total_sessions, JSON.stringify(m.availability_slots), m.is_accepting_mentees, m.avatar_url, now);
    const insProj = db.prepare(`INSERT OR IGNORE INTO student_projects (id, slug, title, title_km, description, category, creator_id, creator_name, creator_avatar, stage, required_skills, current_team_size, max_team_size, repository_url, live_demo_url, merit_points_reward, upvotes_count, associated_learning_path_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const p of initialStudentProjects) insProj.run(p.id, p.slug, p.title, p.title_km, p.description, p.category, p.creator_id, p.creator_name, p.creator_avatar, p.stage, JSON.stringify(p.required_skills), p.current_team_size, p.max_team_size, p.repository_url, p.live_demo_url, p.merit_points_reward, p.upvotes_count, p.associated_learning_path_id || null, now, now);
    const insEvent = db.prepare(`INSERT OR IGNORE INTO campus_events (id, slug, title, title_km, event_type, description, host_organization, host_university_id, speaker_name, speaker_title, speaker_avatar, event_format, location_or_link, start_time, end_time, registration_deadline, max_participants, current_rsvp_count, tags, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const e of initialCampusEvents) insEvent.run(e.id, e.slug, e.title, e.title_km, e.event_type, e.description, e.host_organization, e.host_university_id, e.speaker_name, e.speaker_title, e.speaker_avatar, e.event_format, e.location_or_link, e.start_time, e.end_time, e.registration_deadline, e.max_participants, e.current_rsvp_count, JSON.stringify(e.tags), e.status, now);
    const insOrg = db.prepare(`INSERT OR IGNORE INTO partner_organizations (id, name, name_km, org_type, description, logo_url, website_url, verified_status, contact_email, focus_domains, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const o of initialPartnerOrgs) insOrg.run(o.id, o.name, o.name_km, o.org_type, o.description, o.logo_url, o.website_url, o.verified_status, o.contact_email, JSON.stringify(o.focus_domains), now);
  }

  if ((db.prepare('SELECT COUNT(*) as c FROM research_experiments').get() as { c: number }).c === 0) {
    const insExp = db.prepare(`INSERT OR IGNORE INTO research_experiments (id, slug, title, hypothesis, research_question, domain, status, primary_metric, secondary_metrics, target_sample_size, current_sample_size, power_analysis, start_date, end_date, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insGrp = db.prepare(`INSERT OR IGNORE INTO experiment_groups (id, experiment_id, group_name, group_type, intervention_type, pedagogy_parameters, target_allocation_ratio, participant_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insRes = db.prepare(`INSERT OR IGNORE INTO research_results_v2 (id, experiment_id, sample_size, group_metrics, comparative_analysis, is_statistically_significant, p_value, effect_size_cohens_d, key_findings, pedagogical_recommendation, target_curriculum_revision, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const e of initialResearchExperiments) {
      insExp.run(e.id, e.slug, e.title, e.hypothesis, e.research_question, e.domain, e.status, e.primary_metric, JSON.stringify(e.secondary_metrics), e.target_sample_size, e.current_sample_size, JSON.stringify(e.power_analysis), e.start_date, e.end_date, 'CDES Education Research Council', now, now);
      for (const g of e.groups) insGrp.run(g.id, e.id, g.group_name, g.group_type, g.intervention_type, JSON.stringify(g.pedagogy_parameters), g.target_allocation_ratio, g.participant_count, now);
      if (e.results) {
        insRes.run(`res-${e.id}`, e.id, e.results.sample_size || 0, JSON.stringify(e.results.group_metrics || {}), JSON.stringify(e.results.comparative_analysis || {}), e.results.comparative_analysis?.is_statistically_significant ? 1 : 0, e.results.comparative_analysis?.p_value ?? 0, e.results.comparative_analysis?.effect_size_cohens_d ?? 0, JSON.stringify(e.results.key_findings || []), e.results.pedagogical_recommendation || '', e.results.target_curriculum_revision || '', now);
      }
    }
    const insBench = db.prepare(`INSERT OR IGNORE INTO teaching_method_benchmarks (id, method_key, method_name, description, avg_engagement_minutes, completion_rate_percentage, normalized_gain_score, retention_rate_30d, persistence_index, cognitive_load_rating, best_fit_domains, sample_students_count, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const b of initialTeachingMethodBenchmarks) insBench.run(`bench-${b.method_key}`, b.method_key, b.method_name, b.description, b.avg_engagement_minutes, b.completion_rate_percentage, b.normalized_gain_score, b.retention_rate_30d, b.persistence_index, b.cognitive_load_rating, JSON.stringify(b.best_fit_domains), b.sample_students_count, now);
    const insTch = db.prepare(`INSERT OR IGNORE INTO teacher_class_analytics (id, class_name, grade_level, subject, school_name, province, student_count, average_mastery_percentage, learning_velocity_index, top_misconceptions, recommended_interventions, students_needing_scaffolding, students_accelerating, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const tc of initialTeacherClassAnalytics) insTch.run(tc.id, tc.class_name, tc.grade_level, tc.subject, tc.school_name, tc.province, tc.student_count, tc.average_mastery_percentage, tc.learning_velocity_index, JSON.stringify(tc.top_misconceptions), JSON.stringify(tc.recommended_interventions), tc.students_needing_scaffolding, tc.students_accelerating, now);
    const insAgg = db.prepare(`INSERT OR IGNORE INTO education_knowledge_aggregates (id, domain, subject, grade_or_level, difficulty_rating, provincial_readiness, top_learning_challenges, career_alignment_score, national_curriculum_notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const a of initialEducationKnowledgeAggregates) insAgg.run(a.id, a.domain, a.subject, a.grade_or_level, a.difficulty_rating, JSON.stringify(a.provincial_readiness), JSON.stringify(a.top_learning_challenges), a.career_alignment_score, a.national_curriculum_notes, now);
  }

  if ((db.prepare('SELECT COUNT(*) as c FROM cdes_universities_lake').get() as { c: number }).c === 0) {
    const insUniv = db.prepare(`INSERT OR IGNORE INTO cdes_universities_lake (id, abbr, name_en, name_km, established_year, accreditation_body, moeys_recognition, campus_city, province, institution_type, student_count, faculty_ratio, tuition_usd_annual, tronc_commun_mandatory, bac_ii_min_grade, entrance_exam_req, avg_employment_rate, top_sectors_json, programs_count, accreditation_status, data_confidence, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const u of initialUniversitiesLake) insUniv.run(u.id, u.abbr, u.name_en, u.name_km, u.established_year, u.accreditation_body, u.moeys_recognition, u.campus_city, u.province, u.institution_type, u.student_count, u.faculty_ratio, u.tuition_usd_annual, u.tronc_commun_mandatory, u.bac_ii_min_grade, u.entrance_exam_req, u.avg_employment_rate, u.top_sectors_json, u.programs_count, u.accreditation_status, u.data_confidence, now, now);
    const insSch = db.prepare(`INSERT OR IGNORE INTO cdes_scholarships_lake (id, code, title, provider, scholarship_type, coverage_percentage, coverage_details, stipend_monthly_usd, target_education_tier, provincial_quota_flag, priority_fields_json, min_gpa_or_grade, deadline, annual_recipient_quota, application_url, verified_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const s of initialScholarshipsLake) insSch.run(s.id, s.code, s.title, s.provider, s.scholarship_type, s.coverage_percentage, s.coverage_details, s.stipend_monthly_usd, s.target_education_tier, s.provincial_quota_flag, s.priority_fields_json, s.min_gpa_or_grade, s.deadline, s.annual_recipient_quota, s.application_url, s.verified_by, now);
    const insCar = db.prepare(`INSERT OR IGNORE INTO cdes_careers_lake (id, soc_code, title_en, title_km, onet_taxonomy_code, industry_domain, entry_salary_usd, median_salary_usd, senior_salary_usd, projected_growth_5yr, automation_risk_pct, top_skills_json, education_requirement, asean_mobility_tier, demand_index, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const c of initialCareersLake) insCar.run(c.id, c.soc_code, c.title_en, c.title_km, c.onet_taxonomy_code, c.industry_domain, c.entry_salary_usd, c.median_salary_usd, c.senior_salary_usd, c.projected_growth_5yr, c.automation_risk_pct, c.top_skills_json, c.education_requirement, c.asean_mobility_tier, c.demand_index, now);
    const insInd = db.prepare(`INSERT OR IGNORE INTO cdes_industries_lake (id, sector_code, name_en, name_km, gdp_contribution_pct, digital_transformation_index, strategic_priority_level, total_formal_workforce, hiring_velocity_index, top_employers_json, key_growth_drivers, partner_institutions_count, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const i of initialIndustriesLake) insInd.run(i.id, i.sector_code, i.name_en, i.name_km, i.gdp_contribution_pct, i.digital_transformation_index, i.strategic_priority_level, i.total_formal_workforce, i.hiring_velocity_index, i.top_employers_json, i.key_growth_drivers, i.partner_institutions_count, now);
    const insPsy = db.prepare(`INSERT OR IGNORE INTO cdes_psychometrics_lake (id, instrument_code, instrument_name, dimension_key, dimension_label, description, educational_application, pedagogical_strategy, scale_range_min, scale_range_max, assessment_items_count, non_clinical_guarantee, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const p of initialPsychometricsLake) insPsy.run(p.id, p.instrument_code, p.instrument_name, p.dimension_key, p.dimension_label, p.description, p.educational_application, p.pedagogical_strategy, p.scale_range_min, p.scale_range_max, p.assessment_items_count, p.non_clinical_guarantee, now);
    const insLs = db.prepare(`INSERT OR IGNORE INTO cdes_learning_science_lake (id, framework_name, level_or_phase, cognitive_domain, definition, action_verbs_json, scaffolding_techniques_json, ebbinghaus_decay_factor, cognitive_load_type, misconception_countermeasures_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const l of initialLearningScienceLake) insLs.run(l.id, l.framework_name, l.level_or_phase, l.cognitive_domain, l.definition, l.action_verbs_json, l.scaffolding_techniques_json, l.ebbinghaus_decay_factor, l.cognitive_load_type, l.misconception_countermeasures_json, now);
    const insML = db.prepare(`INSERT OR IGNORE INTO cdes_ml_models_registry (model_id, model_name, task_type, framework, algorithm, version, accuracy_score, f1_or_rmse, parameters_json, training_dataset_size, deployment_status, registered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const m of initialMLModelsRegistry) insML.run(m.model_id, m.model_name, m.task_type, m.framework, m.algorithm, m.version, m.accuracy_score, m.f1_or_rmse, m.parameters_json, m.training_dataset_size, m.deployment_status, now);
    const insDQ = db.prepare(`INSERT OR IGNORE INTO cdes_data_quality_scorecards (scorecard_id, dataset_name, completeness_pct, freshness_sla_met, accuracy_pct, consistency_pct, uniqueness_pct, overall_health_grade, critical_issues_count, audit_summary_json, audited_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    insDQ.run('dq-01', 'cdes_universities_lake', 99.4, 1, 98.8, 99.2, 100.0, 'A+', 0, JSON.stringify({ verified_institutions: 6 }), now);
    insDQ.run('dq-02', 'cdes_scholarships_lake', 98.2, 1, 99.0, 97.5, 100.0, 'A', 0, JSON.stringify({ verified_scholarships: 4 }), now);
  }
}

/** Seed public reference catalog data only (safe for production, zero user/student PII). */
export function seedCatalogData(db: TrackedDatabase): void {
  const now = new Date().toISOString();
  seedScholarships(db, now);
  seedUniversities(db, now);
  seedLearningAndAvatarCatalog(db, now);
  seedKnowledgeCommunityAndLakes(db, now);
}
