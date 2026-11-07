export interface SeedCommunity {
  id: string;
  slug: string;
  name: string;
  name_km: string;
  description: string;
  category: 'stem_prep' | 'ai_robotics' | 'biotech_health' | 'software_dev' | 'scholarships' | 'clean_energy' | 'women_in_tech' | 'research_club';
  icon_key: string;
  color: string;
  created_by: string;
  is_verified: number;
  member_count: number;
  post_count: number;
  safety_level: 'high' | 'strict_supervised';
  rules: string;
}

export interface SeedMentor {
  id: string;
  user_id: string;
  full_name: string;
  full_name_km: string;
  title: string;
  organization: string;
  bio: string;
  expertise_areas: string[];
  university_id: string;
  degree: string;
  graduation_year: number;
  verified_badge: 'university_verified' | 'industry_pro' | 'alumni_star';
  rating: number;
  total_sessions: number;
  availability_slots: string[];
  is_accepting_mentees: number;
  avatar_url: string;
}

export interface SeedStudentProject {
  id: string;
  slug: string;
  title: string;
  title_km: string;
  description: string;
  category: 'ai_software' | 'robotics_hardware' | 'biotech_science' | 'clean_energy' | 'civic_tech' | 'edtech';
  creator_id: string;
  creator_name: string;
  creator_avatar: string;
  stage: 'recruiting' | 'in_progress' | 'completed' | 'showcased';
  required_skills: string[];
  current_team_size: number;
  max_team_size: number;
  repository_url: string;
  live_demo_url: string;
  merit_points_reward: number;
  upvotes_count: number;
  associated_learning_path_id?: string;
}

export interface SeedCampusEvent {
  id: string;
  slug: string;
  title: string;
  title_km: string;
  event_type: 'workshop' | 'webinar' | 'hackathon' | 'competition' | 'ama_session';
  description: string;
  host_organization: string;
  host_university_id: string;
  speaker_name: string;
  speaker_title: string;
  speaker_avatar: string;
  event_format: 'virtual' | 'physical' | 'hybrid';
  location_or_link: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  current_rsvp_count: number;
  tags: string[];
  status: 'upcoming' | 'live' | 'completed';
}

export interface SeedPartnerOrg {
  id: string;
  name: string;
  name_km: string;
  org_type: 'university' | 'ngo' | 'industry_partner' | 'student_club' | 'government_body';
  description: string;
  logo_url: string;
  website_url: string;
  verified_status: 'official_partner' | 'verified_org';
  contact_email: string;
  focus_domains: string[];
}

export const initialCommunities: SeedCommunity[] = [
  {
    id: 'comm-ai-robotics',
    slug: 'ai-robotics-circle',
    name: 'Cambodia AI & Robotics Circle',
    name_km: 'សហគមន៍បញ្ញាសិប្បនិម្មិត និងមនុស្សយន្តកម្ពុជា',
    description: 'Academic community for high school and university students designing neural networks, embedded robotics, and computer vision systems across Cambodia.',
    category: 'ai_robotics',
    icon_key: 'bot',
    color: '#4F46E5',
    created_by: 'usr-mentor-sophal',
    is_verified: 1,
    member_count: 342,
    post_count: 86,
    safety_level: 'high',
    rules: JSON.stringify([
      'All code examples must include educational explanations',
      'Encourage peer code reviews and positive technical critique',
      'No sharing of unvetted executable links',
      'Academic integrity: cite open-source libraries and datasets'
    ])
  },
  {
    id: 'comm-bacii-stem',
    slug: 'bacii-stem-club',
    name: 'National Bac II STEM Excellence Club',
    name_km: 'ក្លឹបត្រៀមប្រឡងបាក់ឌុប វិទ្យាសាស្ត្រ និងគណិតវិទ្យា',
    description: 'Daily past exam problem walkthroughs, calculus derivations, physics mechanics, and chemistry stoichiometry guided by MoEYS Grade A alumni.',
    category: 'stem_prep',
    icon_key: 'graduation-cap',
    color: '#059669',
    created_by: 'usr-mentor-vicheka',
    is_verified: 1,
    member_count: 512,
    post_count: 142,
    safety_level: 'strict_supervised',
    rules: JSON.stringify([
      'Post full problem prompts with your attempt before asking for hints',
      'Mentors guide students with conceptual steps rather than solving homework directly',
      'Strict minor safety: all communications visible to community moderators',
      'Respectful, supportive tone for all learners from all 25 provinces'
    ])
  },
  {
    id: 'comm-biotech-health',
    slug: 'biotech-health-innovators',
    name: 'Biomedical & Healthcare Innovators',
    name_km: 'អ្នកច្នៃប្រឌិតជីវវេជ្ជសាស្ត្រ និងសុខាភិបាល',
    description: 'Collaborative hub exploring cellular biology, epidemiology data analysis, laboratory experiments, and medical school entrance strategies for UHS and international scholarships.',
    category: 'biotech_health',
    icon_key: 'activity',
    color: '#E11D48',
    created_by: 'usr-mentor-sreymom',
    is_verified: 1,
    member_count: 218,
    post_count: 47,
    safety_level: 'high',
    rules: JSON.stringify([
      'Ground scientific claims in verified peer-reviewed or MoEYS health curricula',
      'Medical disclaimer: educational discussions only, no personal health prescriptions',
      'Maintain rigorous scientific inquiry and ethical research principles'
    ])
  },
  {
    id: 'comm-clean-energy',
    slug: 'green-tech-clean-energy',
    name: 'Green Tech & Renewable Energy Lab',
    name_km: 'បច្ចេកវិទ្យាបៃតង និងមន្ទីរពិសោធន៍ថាមពលកកើតឡើងវិញ',
    description: 'Designing solar microgrids, battery storage management, and rural water telemetry systems for Cambodia\'s sustainable development goals.',
    category: 'clean_energy',
    icon_key: 'sun',
    color: '#D97706',
    created_by: 'usr-mentor-sovannara',
    is_verified: 1,
    member_count: 164,
    post_count: 31,
    safety_level: 'high',
    rules: JSON.stringify([
      'Safety first in all physical circuit schematics',
      'Open-source hardware principles encouraged',
      'Constructive collaboration on environmental sustainability'
    ])
  },
  {
    id: 'comm-women-stem',
    slug: 'women-in-stem-cambodia',
    name: 'Cambodian Women in STEM & Tech',
    name_km: 'ស្ត្រីកម្ពុជាក្នុងវិស័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា',
    description: 'Empowering Cambodian female students to excel in computer science, robotics, mathematics, and engineering through peer mentorship and senior sister circles.',
    category: 'women_in_tech',
    icon_key: 'sparkles',
    color: '#9333EA',
    created_by: 'usr-mentor-bopha',
    is_verified: 1,
    member_count: 288,
    post_count: 65,
    safety_level: 'strict_supervised',
    rules: JSON.stringify([
      'Safe, welcoming, and empowering environment for all female STEM learners',
      'Zero tolerance for harassment, discrimination, or gatekeeping',
      'Focus on confidence building, scholarship navigation, and career mentorship'
    ])
  },
  {
    id: 'comm-scholarship-guild',
    slug: 'cambodia-scholarship-guild',
    name: 'Cambodia Global Scholarship Guild',
    name_km: 'សមាគមអាហារូបករណ៍ជាតិ និងអន្តរជាតិកម្ពុជា',
    description: 'Peer essay reviews, interview simulations, and portfolio workshops for MPTC 100%, CADT Merit, ITC State Quota, Chevening, Fulbright, and Australia Awards.',
    category: 'scholarships',
    icon_key: 'award',
    color: '#2563EB',
    created_by: 'usr-mentor-sophal',
    is_verified: 1,
    member_count: 420,
    post_count: 98,
    safety_level: 'high',
    rules: JSON.stringify([
      'All scholarship advice must cite official ministry or embassy application portals',
      'No charging of fees for mentorship or essay feedback — free and open for all Cambodian youth',
      'Encourage genuine student voice in personal statements'
    ])
  }
];

export const initialCommunityPosts = [
  {
    id: 'post-01',
    community_id: 'comm-bacii-stem',
    author_id: 'usr-student-01',
    author_name: 'Dara Chan',
    author_role: 'Grade 12 Student',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    post_type: 'question' as const,
    title: 'How to reliably differentiate between Simple Harmonic Motion vs Damped Oscillation on the Bac II exam?',
    content: 'While preparing for the national exam, I notice questions where air friction is mentioned. When should we neglect damping resistance and when must we write the exponential decay envelope formula? Any mnemonics from past Grade A scholars?',
    tags: JSON.stringify(['Physics', 'BacII-2026', 'HarmonicMotion', 'Calculus']),
    upvotes_count: 24,
    comments_count: 3,
    is_pinned: 1,
    is_solved: 1,
    solved_comment_id: 'comm-cmt-01',
    status: 'published' as const,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'post-02',
    community_id: 'comm-ai-robotics',
    author_id: 'usr-mentor-sophal',
    author_name: 'Sophal Chan',
    author_role: 'CADT AI Researcher & Mentor',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    post_type: 'resource' as const,
    title: 'Open Source Khmer STEM Tokenizer & Vector Embeddings for High School Math',
    content: 'We just open-sourced our localized Khmer mathematical notation tokenizer on HuggingFace and CDES AI. It preserves Khmer subscript vowels while keeping mathematical symbols (dx/dt, ∫, ∑) clean. Check out the playground and let\'s build Khmer educational tools together!',
    tags: JSON.stringify(['AI', 'NLP', 'KhmerSTEM', 'CADT', 'OpenSource']),
    upvotes_count: 58,
    comments_count: 7,
    is_pinned: 1,
    is_solved: 0,
    status: 'published' as const,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'post-03',
    community_id: 'comm-scholarship-guild',
    author_id: 'usr-student-02',
    author_name: 'Sreynet Ly',
    author_role: 'STEM Aspirant',
    author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    post_type: 'discussion' as const,
    title: 'MPTC Digital Skill Scholarship 2026 Interview Experience & Technical Questions',
    content: 'I had my round 2 oral interview last week! The interviewers asked how software architecture could solve provincial supply chain challenges, and asked about a personal project. My advice: build one working prototype in your high school year to stand out!',
    tags: JSON.stringify(['MPTC', 'Scholarships', 'InterviewTips', 'CADT', 'ITC']),
    upvotes_count: 42,
    comments_count: 5,
    is_pinned: 0,
    is_solved: 0,
    status: 'published' as const,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

export const initialCommunityComments = [
  {
    id: 'comm-cmt-01',
    post_id: 'post-01',
    author_id: 'usr-mentor-vicheka',
    author_name: 'Vicheka Oum',
    author_role: 'Senior ITC Alumni & Mentor',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    parent_comment_id: null,
    content: 'Great question Dara! In the MoEYS national Bac II examination, unless the problem statement explicitly specifies a damping constant (b ≠ 0) or terms like "កកិតខ្យល់ត្រូវបានគិតបញ្ចូល" (air friction is accounted for), standard scoring keys assume Ideal Undamped SHM where T = 2π√(l/g) and mechanical energy is conserved E = 1/2 k A². Check the Virtual STEM Lab Simple Harmonic Motion experiment in your Avatar World to verify the phase portrait!',
    upvotes_count: 19,
    is_accepted_answer: 1,
    status: 'published' as const,
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  }
];

export const initialMentors: SeedMentor[] = [
  {
    id: 'mentor-01',
    user_id: 'usr-mentor-sophal',
    full_name: 'Sophal Chan',
    full_name_km: 'ចាន់ សុផល',
    title: 'Lead AI Engineer & CADT Lecturer',
    organization: 'Cambodia Academy of Digital Technology (CADT)',
    bio: 'Former MPTC Full Scholarship recipient with 6+ years specializing in Deep Learning, Computer Vision, and Cloud Native Architectures. Mentored 40+ high school seniors to enter premier STEM programs.',
    expertise_areas: ['Artificial Intelligence', 'Software Engineering', 'CADT Entrance Exam', 'MPTC Scholarship'],
    university_id: 'univ-cadt',
    degree: 'Master of Science in Computer Science (Data & AI)',
    graduation_year: 2021,
    verified_badge: 'university_verified',
    rating: 4.95,
    total_sessions: 62,
    availability_slots: ['Saturday 09:00 - 11:00 AM', 'Sunday 02:00 - 04:00 PM', 'Wednesday 07:00 - 08:30 PM'],
    is_accepting_mentees: 1,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'mentor-02',
    user_id: 'usr-mentor-sreymom',
    full_name: 'Dr. Sreymom Kim',
    full_name_km: 'គីម ស្រីមុំ',
    title: 'Senior Medical Researcher & UHS Fellow',
    organization: 'University of Health Sciences (UHS) / Institut Pasteur du Cambodge',
    bio: 'Doctor of Medicine (MD) graduate with distinction. Passionate about guiding Cambodian youth into medicine, epidemiology, and laboratory sciences with proven Bac II study methodologies.',
    expertise_areas: ['Biomedicine', 'UHS Medical Entrance', 'Organic Chemistry', 'Health Sciences'],
    university_id: 'univ-uhs',
    degree: 'Doctor of Medicine (MD)',
    graduation_year: 2020,
    verified_badge: 'alumni_star',
    rating: 4.98,
    total_sessions: 78,
    availability_slots: ['Tuesday 06:00 - 08:00 PM', 'Thursday 06:00 - 08:00 PM', 'Sunday 10:00 - 12:00 PM'],
    is_accepting_mentees: 1,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'mentor-03',
    user_id: 'usr-mentor-vicheka',
    full_name: 'Vicheka Oum',
    full_name_km: 'អ៊ុំ វិច្ឆិកា',
    title: 'Principal IoT Solutions Architect',
    organization: 'Smart Axiata / ITC Telecommunications Alumni',
    bio: 'ITC Tronc Commun honors graduate. 8 years architecting carrier-grade telecommunications and embedded IoT sensors across Cambodia. Expert in engineering mathematics and circuit design.',
    expertise_areas: ['ITC Tronc Commun Prep', 'Embedded Systems & IoT', 'Electrical Engineering', 'Calculus Rigor'],
    university_id: 'univ-itc',
    degree: 'Ingénieur Diplômé de l\'ITC (Génie Électrique)',
    graduation_year: 2019,
    verified_badge: 'industry_pro',
    rating: 4.92,
    total_sessions: 51,
    availability_slots: ['Friday 07:00 - 09:00 PM', 'Saturday 02:00 - 05:00 PM'],
    is_accepting_mentees: 1,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'mentor-04',
    user_id: 'usr-mentor-sovannara',
    full_name: 'Sovannara Prak',
    full_name_km: 'ប្រាក់ សុវណ្ណារ៉ា',
    title: 'Renewable Microgrid Engineer',
    organization: 'Clean Energy Cambodia / ITC Energy Engineering',
    bio: 'Specialist in solar photovoltaic mini-grids and rural battery storage. Mentors students on applied physics, electrical schematics, and energy transition careers.',
    expertise_areas: ['Renewable Energy', 'Solar Photovoltaics', 'Physics Mechanics', 'Eco-Tech Careers'],
    university_id: 'univ-itc',
    degree: 'Master in Energy Engineering (ITC & France Polytech)',
    graduation_year: 2022,
    verified_badge: 'university_verified',
    rating: 4.88,
    total_sessions: 39,
    availability_slots: ['Monday 06:30 - 08:30 PM', 'Saturday 10:00 - 12:00 PM'],
    is_accepting_mentees: 1,
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'mentor-05',
    user_id: 'usr-mentor-bopha',
    full_name: 'Bopha Heng',
    full_name_km: 'ហេង បុប្ផា',
    title: 'Lead Data Scientist & Fulbright Scholar',
    organization: 'Women in Tech Cambodia / RUPP Data Analytics Fellow',
    bio: 'Fulbright scholar with Master of Science in Data Analytics from University of Washington. Passionate about empowering young Cambodian women in STEM, statistics, and machine learning.',
    expertise_areas: ['Data Science & AI', 'Fulbright & International Scholarships', 'Python & Statistics', 'Women in STEM'],
    university_id: 'univ-rupp',
    degree: 'Master of Science in Information & Data Science (Fulbright)',
    graduation_year: 2021,
    verified_badge: 'alumni_star',
    rating: 4.97,
    total_sessions: 84,
    availability_slots: ['Wednesday 06:00 - 08:00 PM', 'Sunday 04:00 - 06:00 PM'],
    is_accepting_mentees: 1,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  }
];

export const initialStudentProjects: SeedStudentProject[] = [
  {
    id: 'proj-01',
    slug: 'khmer-speech-to-text',
    title: 'Open Khmer Speech Recognition for Rural Classrooms',
    title_km: 'ប្រព័ន្ធបម្លែងសំឡេងខ្មែរទៅជាអត្ថបទសម្រាប់ការអប់រំនៅជនបទ',
    description: 'Developing a lightweight, offline-first Khmer speech-to-text model on mobile devices to assist remote primary school teachers with interactive phonetics and spelling exercises.',
    category: 'ai_software',
    creator_id: 'usr-student-01',
    creator_name: 'Dara Chan',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    stage: 'recruiting',
    required_skills: ['Python / PyTorch', 'Audio DSP', 'Khmer Unicode NLP', 'React Native / Flutter'],
    current_team_size: 2,
    max_team_size: 4,
    repository_url: 'https://github.com/cdes-cambodia/khmer-speech-edu',
    live_demo_url: 'https://khmer-speech-demo.cdes.edu.kh',
    merit_points_reward: 150,
    upvotes_count: 48,
    associated_learning_path_id: 'path-ai-engineer'
  },
  {
    id: 'proj-02',
    slug: 'solar-iot-irrigation',
    title: 'IoT Micro-Solar Automated Drip Irrigation System',
    title_km: 'ប្រព័ន្ធស្រោចស្រពដំណក់ទឹកស្វ័យប្រវត្តដំណើរការដោយថាមពលព្រះអាទិត្យ',
    description: 'Building an ESP32 microcontroller with soil capacitance sensors powered by a 10W mini solar panel to optimize water usage in Battambang vegetable farms during the dry season.',
    category: 'clean_energy',
    creator_id: 'usr-student-03',
    creator_name: 'Visal Seng',
    creator_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    stage: 'in_progress',
    required_skills: ['ESP32 / Arduino C++', 'Circuit Schematic CAD', 'MQTT / Cloud Telemetry', 'Solar Charge Regulators'],
    current_team_size: 3,
    max_team_size: 4,
    repository_url: 'https://github.com/cdes-cambodia/solar-drip-iot',
    live_demo_url: 'https://solar-drip.cdes.edu.kh',
    merit_points_reward: 120,
    upvotes_count: 36,
    associated_learning_path_id: 'path-clean-energy'
  },
  {
    id: 'proj-03',
    slug: 'dengue-early-warning',
    title: 'Epidemiological Dengue Outbreak Spatial Predictor',
    title_km: 'ប្រព័ន្ធព្យាករណ៍ការរាតត្បាតជំងឺគ្រុនឈាមដោយទិន្នន័យអាកាសធាតុ',
    description: 'Aggregating Mekong precipitation, temperature patterns, and provincial historical infection records to provide predictive alerts for rural provincial health centers.',
    category: 'biotech_science',
    creator_id: 'usr-student-02',
    creator_name: 'Sreynet Ly',
    creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    stage: 'in_progress',
    required_skills: ['Pandas / Data Analysis', 'GIS Spatial Mapping', 'Epidemiology Basics', 'Web Dashboard UI'],
    current_team_size: 2,
    max_team_size: 3,
    repository_url: 'https://github.com/cdes-cambodia/dengue-predictor',
    live_demo_url: 'https://dengue-watch.cdes.edu.kh',
    merit_points_reward: 140,
    upvotes_count: 52
  },
  {
    id: 'proj-04',
    slug: 'bacii-gamified-quiz',
    title: 'MoEYS Bac II Interactive Formula Flashcards & Practice Bot',
    title_km: 'កម្មវិធីទន្ទេញរូបមន្ត និងលំហាត់ត្រៀមបាក់ឌុបឆ្លាតវៃ',
    description: 'Spaced repetition flashcard web application featuring 400+ past national examination questions in Mathematics, Physics, Chemistry, and Biology with step-by-step solutions.',
    category: 'edtech',
    creator_id: 'usr-student-04',
    creator_name: 'Panha Meas',
    creator_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    stage: 'showcased',
    required_skills: ['React / TypeScript', 'Tailwind CSS', 'Anki Algorithm', 'Khmer LaTeX Rendering'],
    current_team_size: 3,
    max_team_size: 3,
    repository_url: 'https://github.com/cdes-cambodia/bacii-flashcards',
    live_demo_url: 'https://bacii-flashcards.cdes.edu.kh',
    merit_points_reward: 100,
    upvotes_count: 89
  }
];

export const initialCampusEvents: SeedCampusEvent[] = [
  {
    id: 'event-01',
    slug: 'national-ai-hackathon-2026',
    title: 'National Cambodian Youth AI & Innovation Hackathon 2026',
    title_km: 'ការប្រកួតហែកខាថុនបញ្ញាសិប្បនិម្មិតយុវជនកម្ពុជាថ្នាក់ជាតិ ២០២៦',
    event_type: 'hackathon',
    description: '48-hour challenge open to Cambodian high school and university students to prototype AI applications for education, agriculture, and healthcare. Fully mentored by CADT faculty and Google Developer Groups.',
    host_organization: 'Cambodia Academy of Digital Technology (CADT) & MPTC',
    host_university_id: 'univ-cadt',
    speaker_name: 'Dr. Seng Sopheap & Industry Jury',
    speaker_title: 'President of CADT & MPTC Innovation Fellows',
    speaker_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    event_format: 'hybrid',
    location_or_link: 'CADT Innovation Center, Phnom Penh & Virtual Teams',
    start_time: '2026-10-18T08:30:00.000Z',
    end_time: '2026-10-20T17:00:00.000Z',
    registration_deadline: '2026-10-10T23:59:00.000Z',
    max_participants: 250,
    current_rsvp_count: 184,
    tags: ['AI', 'Hackathon', 'MPTC', 'CADT', 'InnovationGrant'],
    status: 'upcoming'
  },
  {
    id: 'event-02',
    slug: 'itc-tronc-commun-mastery-webinar',
    title: 'Mastering the 2-Year Tronc Commun: Survival Guide from Top ITC Engineers',
    title_km: 'យុទ្ធសាស្ត្រឆ្លងកាត់ថ្នាក់ឆ្នាំសិក្សាមូលដ្ឋាន (Tronc Commun) នៅវិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា',
    event_type: 'webinar',
    description: 'In-depth breakdown of the French polytechnic mathematics and physics syllabus at ITC. Learn how top graduates managed coursework, passed rigorous exam juries, and secured European engineering scholarships.',
    host_organization: 'Institute of Technology of Cambodia (ITC) Alumni Association',
    host_university_id: 'univ-itc',
    speaker_name: 'Vicheka Oum & Sovannara Prak',
    speaker_title: 'ITC Alumni Lead Engineers',
    speaker_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    event_format: 'virtual',
    location_or_link: 'https://meet.cdes.edu.kh/itc-mastery-hall',
    start_time: '2026-09-26T14:00:00.000Z',
    end_time: '2026-09-26T16:00:00.000Z',
    registration_deadline: '2026-09-25T20:00:00.000Z',
    max_participants: 300,
    current_rsvp_count: 228,
    tags: ['ITC', 'Engineering', 'TroncCommun', 'PhysicsCalculus', 'Webinar'],
    status: 'upcoming'
  },
  {
    id: 'event-03',
    slug: 'biotech-health-symposium',
    title: 'Future of Biotechnology & Medical Careers in Cambodia',
    title_km: 'អនាគតនៃជីវបច្ចេកវិទ្យា និងអាជីពវិស័យសុខាភិបាលនៅកម្ពុជា',
    event_type: 'workshop',
    description: 'Hands-on clinical pathology discovery workshop, molecular biology demonstration, and direct counseling with University of Health Sciences faculty and Institut Pasteur researchers.',
    host_organization: 'University of Health Sciences (UHS)',
    host_university_id: 'univ-uhs',
    speaker_name: 'Dr. Sreymom Kim',
    speaker_title: 'Senior Medical Researcher, UHS',
    speaker_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    event_format: 'physical',
    location_or_link: 'UHS Main Campus Auditorium, Monivong Blvd, Phnom Penh',
    start_time: '2026-10-04T09:00:00.000Z',
    end_time: '2026-10-04T12:30:00.000Z',
    registration_deadline: '2026-10-01T17:00:00.000Z',
    max_participants: 120,
    current_rsvp_count: 95,
    tags: ['Medicine', 'Biotech', 'UHS', 'ClinicalScience', 'Workshop'],
    status: 'upcoming'
  },
  {
    id: 'event-04',
    slug: 'ama-scholarship-grade-a-journey',
    title: 'Senior AMA: From Grade 12 in Siem Reap to Full MPTC Scholarship & Silicon Valley Remote',
    title_km: 'កម្មវិធីសំណួរ-ចម្លើយផ្ទាល់ (AMA)៖ ដំណើរពីសិស្សថ្នាក់ទី១២ ខេត្តសៀមរាប ដល់អាហារូបករណ៍ MPTC ១០០%',
    event_type: 'ama_session',
    description: 'Ask anything live about essay writing, balancing exam revision with coding projects, and interview preparation for high school candidates across Cambodia.',
    host_organization: 'Cambodia Digital Education Society (CDES)',
    host_university_id: 'univ-cadt',
    speaker_name: 'Sophal Chan',
    speaker_title: 'CADT AI Lecturer & Lead Mentor',
    speaker_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    event_format: 'virtual',
    location_or_link: 'https://meet.cdes.edu.kh/ama-sophal-chan',
    start_time: '2026-09-29T19:00:00.000Z',
    end_time: '2026-09-29T20:30:00.000Z',
    registration_deadline: '2026-09-29T18:00:00.000Z',
    max_participants: 500,
    current_rsvp_count: 387,
    tags: ['AMA', 'Scholarships', 'MPTC', 'CADT', 'CareerInspiration'],
    status: 'upcoming'
  }
];

export const initialPartnerOrgs: SeedPartnerOrg[] = [
  {
    id: 'org-cadt',
    name: 'Cambodia Academy of Digital Technology (CADT)',
    name_km: 'បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា',
    org_type: 'university',
    description: 'Premier national digital education flagship institution under MPTC, delivering world-class Software Engineering, Computer Science, and Data Science programs.',
    logo_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=160',
    website_url: 'https://www.cadt.edu.kh',
    verified_status: 'official_partner',
    contact_email: 'partnerships@cadt.edu.kh',
    focus_domains: ['AI & Software', 'Cybersecurity', 'FinTech', 'Cloud Architecture']
  },
  {
    id: 'org-itc',
    name: 'Institute of Technology of Cambodia (ITC)',
    name_km: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា',
    org_type: 'university',
    description: 'Foremost polytechnic engineering university in Cambodia since 1964, renowned for French-accredited Tronc Commun engineering rigor.',
    logo_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=160',
    website_url: 'https://www.itc.edu.kh',
    verified_status: 'official_partner',
    contact_email: 'relations@itc.edu.kh',
    focus_domains: ['Civil Engineering', 'Electrical & IoT', 'Energy Systems', 'Industrial Tech']
  },
  {
    id: 'org-rupp',
    name: 'Royal University of Phnom Penh (RUPP)',
    name_km: 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ',
    org_type: 'university',
    description: 'Cambodia\'s largest and oldest national university, hosting the Institute of Foreign Languages (IFL) and premier STEM science faculties.',
    logo_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=160',
    website_url: 'https://www.rupp.edu.kh',
    verified_status: 'official_partner',
    contact_email: 'academic@rupp.edu.kh',
    focus_domains: ['Pure Mathematics', 'Computer Science', 'Bio-Science', 'Data Analytics']
  },
  {
    id: 'org-uhs',
    name: 'University of Health Sciences (UHS)',
    name_km: 'សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល',
    org_type: 'university',
    description: 'The national authority for medical education in Cambodia, training doctors, pharmacists, dentists, and healthcare specialists.',
    logo_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=160',
    website_url: 'https://www.uhs.edu.kh',
    verified_status: 'official_partner',
    contact_email: 'info@uhs.edu.kh',
    focus_domains: ['General Medicine', 'Pharmacy', 'Biomedical Research', 'Dentistry']
  },
  {
    id: 'org-mptc',
    name: 'Ministry of Post and Telecommunications (MPTC)',
    name_km: 'ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍',
    org_type: 'government_body',
    description: 'National government ministry driving Cambodia\'s Digital Economy and Society Policy Framework 2021-2035 and digital human resource scholarships.',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=160',
    website_url: 'https://www.mptc.gov.kh',
    verified_status: 'official_partner',
    contact_email: 'contact@mptc.gov.kh',
    focus_domains: ['Digital Policy', '100% STEM Scholarships', 'Telecom Infrastructure', 'Digital Skills']
  },
  {
    id: 'org-gdg-pp',
    name: 'Google Developer Groups Phnom Penh',
    name_km: 'សហគមន៍អ្នកអភិវឌ្ឍន៍ Google ភ្នំពេញ',
    org_type: 'industry_partner',
    description: 'Community-run developer group dedicated to mentoring Cambodian tech enthusiasts in modern cloud, Android, Flutter, and Gemini AI technologies.',
    logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=160',
    website_url: 'https://gdg.community.dev/gdg-phnom-penh',
    verified_status: 'official_partner',
    contact_email: 'team@gdgphnompenh.org',
    focus_domains: ['Android & Web', 'Google Cloud', 'Machine Learning', 'Youth Hackathons']
  }
];
