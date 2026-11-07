/**
 * CDES DATA PLATFORM SEED REPOSITORY (Phase 14)
 * Enterprise Data Architecture & Education Intelligence Foundation
 */

export interface UniversityLakeItem {
  id: string;
  abbr: string;
  name_en: string;
  name_km: string;
  established_year: number;
  accreditation_body: string;
  moeys_recognition: string;
  campus_city: string;
  province: string;
  institution_type: 'Public Autonomous' | 'Public State' | 'Private Higher Ed' | 'Polytechnic Institute';
  student_count: number;
  faculty_ratio: string;
  tuition_usd_annual: number;
  tronc_commun_mandatory: number;
  bac_ii_min_grade: string;
  entrance_exam_req: number;
  avg_employment_rate: number;
  top_sectors_json: string;
  programs_count: number;
  accreditation_status: string;
  data_confidence: string;
}

export const initialUniversitiesLake: UniversityLakeItem[] = [
  {
    id: 'univ-lake-cadt',
    abbr: 'CADT',
    name_en: 'Cambodia Academy of Digital Technology',
    name_km: 'បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា',
    established_year: 2014,
    accreditation_body: 'Accreditation Committee of Cambodia (ACC) / MPTC',
    moeys_recognition: 'National Center of Digital Excellence',
    campus_city: 'Phnom Penh',
    province: 'Phnom Penh',
    institution_type: 'Public Autonomous',
    student_count: 1450,
    faculty_ratio: '1:14',
    tuition_usd_annual: 1500,
    tronc_commun_mandatory: 1,
    bac_ii_min_grade: 'Grade B (STEM Preferred)',
    entrance_exam_req: 1,
    avg_employment_rate: 98.4,
    top_sectors_json: JSON.stringify(['Cloud Infrastructure', 'Artificial Intelligence', 'Cybersecurity', 'Software Engineering', 'FinTech']),
    programs_count: 6,
    accreditation_status: 'ACC Level 1 National Flagship',
    data_confidence: 'official',
  },
  {
    id: 'univ-lake-itc',
    abbr: 'ITC',
    name_en: 'Institute of Technology of Cambodia',
    name_km: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា',
    established_year: 1964,
    accreditation_body: 'ACC / CTI (Commission des Titres d\'Ingénieur France)',
    moeys_recognition: 'Premier National Engineering Institution',
    campus_city: 'Phnom Penh',
    province: 'Phnom Penh',
    institution_type: 'Public State',
    student_count: 5800,
    faculty_ratio: '1:18',
    tuition_usd_annual: 850,
    tronc_commun_mandatory: 1,
    bac_ii_min_grade: 'Grade B (Science Track)',
    entrance_exam_req: 1,
    avg_employment_rate: 96.2,
    top_sectors_json: JSON.stringify(['Civil & Infrastructure Engineering', 'Electrical & Energy', 'Chemical & Food Tech', 'Robotics & Automation', 'Computer Science']),
    programs_count: 14,
    accreditation_status: 'International CTI Accredited & ACC Level 1',
    data_confidence: 'official',
  },
  {
    id: 'univ-lake-rupp',
    abbr: 'RUPP',
    name_en: 'Royal University of Phnom Penh',
    name_km: 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ',
    established_year: 1960,
    accreditation_body: 'Accreditation Committee of Cambodia (ACC) / MoEYS',
    moeys_recognition: 'Cambodia Oldest and Largest Public University',
    campus_city: 'Phnom Penh',
    province: 'Phnom Penh',
    institution_type: 'Public State',
    student_count: 22000,
    faculty_ratio: '1:24',
    tuition_usd_annual: 650,
    tronc_commun_mandatory: 1,
    bac_ii_min_grade: 'Grade C',
    entrance_exam_req: 1,
    avg_employment_rate: 91.5,
    top_sectors_json: JSON.stringify(['Data Science', 'Information Technology', 'Telecommunications', 'Biotechnology', 'Environmental Science']),
    programs_count: 42,
    accreditation_status: 'AUN-QA Certified & ACC Level 1',
    data_confidence: 'official',
  },
  {
    id: 'univ-lake-uhs',
    abbr: 'UHS',
    name_en: 'University of Health Sciences',
    name_km: 'សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល',
    established_year: 1946,
    accreditation_body: 'Ministry of Health / ACC',
    moeys_recognition: 'National Medical and Healthcare Authority',
    campus_city: 'Phnom Penh',
    province: 'Phnom Penh',
    institution_type: 'Public State',
    student_count: 6200,
    faculty_ratio: '1:12',
    tuition_usd_annual: 2200,
    tronc_commun_mandatory: 1,
    bac_ii_min_grade: 'Grade A or B (Science Track Only)',
    entrance_exam_req: 1,
    avg_employment_rate: 99.1,
    top_sectors_json: JSON.stringify(['General Medicine', 'Pharmacy', 'Dentistry', 'Nursing & Midwifery', 'Public Health Epidemiological Research']),
    programs_count: 9,
    accreditation_status: 'National Medical Board Certified',
    data_confidence: 'official',
  },
  {
    id: 'univ-lake-paragon',
    abbr: 'ParagonU',
    name_en: 'Paragon International University',
    name_km: 'សាកលវិទ្យាល័យអន្តរជាតិផារ៉ាហ្គន',
    established_year: 2010,
    accreditation_body: 'ACC / MoEYS',
    moeys_recognition: 'Accredited International Private University',
    campus_city: 'Phnom Penh',
    province: 'Phnom Penh',
    institution_type: 'Private Higher Ed',
    student_count: 1850,
    faculty_ratio: '1:16',
    tuition_usd_annual: 3200,
    tronc_commun_mandatory: 0,
    bac_ii_min_grade: 'Grade C (English Proficiency Test Required)',
    entrance_exam_req: 1,
    avg_employment_rate: 94.8,
    top_sectors_json: JSON.stringify(['Computer Science', 'Management Information Systems', 'Civil Engineering', 'International Relations', 'Digital Banking']),
    programs_count: 11,
    accreditation_status: 'ACC Level 1',
    data_confidence: 'verified',
  },
  {
    id: 'univ-lake-aupp',
    abbr: 'AUPP',
    name_en: 'American University of Phnom Penh',
    name_km: 'សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ',
    established_year: 2013,
    accreditation_body: 'ACC / NECHE US Dual Degree Partner (Fort Hays / Arizona)',
    moeys_recognition: 'US Dual-Accreditation Center',
    campus_city: 'Phnom Penh',
    province: 'Phnom Penh',
    institution_type: 'Private Higher Ed',
    student_count: 1200,
    faculty_ratio: '1:11',
    tuition_usd_annual: 9000,
    tronc_commun_mandatory: 0,
    bac_ii_min_grade: 'Grade B (TOEFL / IELTS 6.5+)',
    entrance_exam_req: 1,
    avg_employment_rate: 97.5,
    top_sectors_json: JSON.stringify(['Software Engineering', 'Cybersecurity', 'FinTech', 'Business Administration', 'Global Affairs']),
    programs_count: 8,
    accreditation_status: 'US Regional Accreditation Partnered',
    data_confidence: 'official',
  },
];

export interface ScholarshipLakeItem {
  id: string;
  code: string;
  title: string;
  provider: string;
  scholarship_type: 'Government Merit' | 'Techo Digital Talent' | 'International Bilateral' | 'University Equity' | 'Private Corporate';
  coverage_percentage: number;
  coverage_details: string;
  stipend_monthly_usd: number;
  target_education_tier: string;
  provincial_quota_flag: number;
  priority_fields_json: string;
  min_gpa_or_grade: string;
  deadline: string;
  annual_recipient_quota: number;
  application_url: string;
  verified_by: string;
}

export const initialScholarshipsLake: ScholarshipLakeItem[] = [
  {
    id: 'sch-lake-techo-talent',
    code: 'MPTC-TECHO-2026',
    title: 'Techo Digital Talent National Scholarship',
    provider: 'Ministry of Post and Telecommunications (MPTC)',
    scholarship_type: 'Techo Digital Talent',
    coverage_percentage: 100,
    coverage_details: 'Full tuition (4 years) + $150/month living stipend + personal laptop + dormitory at CADT',
    stipend_monthly_usd: 150,
    target_education_tier: 'Grade 12 Bac II High School Graduates',
    provincial_quota_flag: 1,
    priority_fields_json: JSON.stringify(['Artificial Intelligence', 'Data Science', 'Cybersecurity', 'Cloud Engineering', 'Software Engineering']),
    min_gpa_or_grade: 'Grade A or B in National Bac II Exam (Math/Science priority)',
    deadline: '2026-10-15',
    annual_recipient_quota: 250,
    application_url: 'https://cadt.edu.kh/scholarship/techo-digital-talent',
    verified_by: 'MPTC & CDES Secretariat',
  },
  {
    id: 'sch-lake-moeys-merit',
    code: 'MOEYS-BAC2-MERIT-2026',
    title: 'MoEYS State Excellence Higher Education Scholarship',
    provider: 'Ministry of Education, Youth and Sport (MoEYS)',
    scholarship_type: 'Government Merit',
    coverage_percentage: 100,
    coverage_details: '100% tuition waiver across all Cambodian public state universities (ITC, RUPP, UHS, NUM, RUA)',
    stipend_monthly_usd: 60,
    target_education_tier: 'Grade 12 Bac II Candidates',
    provincial_quota_flag: 1,
    priority_fields_json: JSON.stringify(['STEM Engineering', 'Medicine & Healthcare', 'Agricultural Technology', 'Mathematics', 'Pedagogical Sciences']),
    min_gpa_or_grade: 'Grade A or B in Bac II Exam',
    deadline: '2026-11-01',
    annual_recipient_quota: 3500,
    application_url: 'https://moeys.gov.kh/scholarships',
    verified_by: 'MoEYS Higher Education Department',
  },
  {
    id: 'sch-lake-mext-japan',
    code: 'MEXT-UNDERGRAD-2027',
    title: 'Japan MEXT Undergraduate Government Scholarship',
    provider: 'Japanese Ministry of Education (Monbukagakusho)',
    scholarship_type: 'International Bilateral',
    coverage_percentage: 100,
    coverage_details: 'Full tuition, roundtrip international airfare, 1-year intensive Japanese language preparatory course, 117,000 JPY monthly living allowance',
    stipend_monthly_usd: 800,
    target_education_tier: 'High School Graduates (Age 17-24)',
    provincial_quota_flag: 0,
    priority_fields_json: JSON.stringify(['Robotics & Mechatronics', 'Computer Science', 'Materials Science', 'Civil Engineering', 'Economics']),
    min_gpa_or_grade: 'Bac II Grade A or B, high scores on MEXT Math & English written exam',
    deadline: '2026-06-15',
    annual_recipient_quota: 35,
    application_url: 'https://www.kh.emb-japan.go.jp/itpr_en/mext.html',
    verified_by: 'Embassy of Japan in Cambodia',
  },
  {
    id: 'sch-lake-aus-awards',
    code: 'AUS-AWARDS-KH-2026',
    title: 'Australia Awards Cambodia Bilateral Fellowship',
    provider: 'Australian Department of Foreign Affairs and Trade (DFAT)',
    scholarship_type: 'International Bilateral',
    coverage_percentage: 100,
    coverage_details: 'Full international tuition at Australian Group of Eight universities, health insurance (OSHC), return airfare, living allowance',
    stipend_monthly_usd: 1600,
    target_education_tier: 'Bachelor Graduates and Public Sector Scholars',
    provincial_quota_flag: 1,
    priority_fields_json: JSON.stringify(['Digital Economy Infrastructure', 'Renewable Energy Systems', 'Water Governance', 'Public Health', 'Data Analytics']),
    min_gpa_or_grade: 'Bachelor GPA 3.2+ and IELTS 6.5 minimum',
    deadline: '2026-04-30',
    annual_recipient_quota: 45,
    application_url: 'https://australiaawardscambodia.org',
    verified_by: 'Australian Embassy Cambodia & DFAT',
  },
];

export interface CareerLakeItem {
  id: string;
  soc_code: string;
  title_en: string;
  title_km: string;
  onet_taxonomy_code: string;
  industry_domain: string;
  entry_salary_usd: number;
  median_salary_usd: number;
  senior_salary_usd: number;
  projected_growth_5yr: number;
  automation_risk_pct: number;
  top_skills_json: string;
  education_requirement: string;
  asean_mobility_tier: string;
  demand_index: number;
}

export const initialCareersLake: CareerLakeItem[] = [
  {
    id: 'car-lake-ai-systems',
    soc_code: '15-1251.00',
    title_en: 'AI Systems & Cloud Architect',
    title_km: 'ស្ថាបត្យករប្រព័ន្ធបញ្ញាសិប្បនិម្មិត និងក្លោដ',
    onet_taxonomy_code: '15-1251.00',
    industry_domain: 'Digital Economy & ICT',
    entry_salary_usd: 900,
    median_salary_usd: 1850,
    senior_salary_usd: 3500,
    projected_growth_5yr: 38.5,
    automation_risk_pct: 4.2,
    top_skills_json: JSON.stringify(['PyTorch / TensorFlow', 'Distributed Cloud Architecture (GCP / AWS)', 'Vector Databases & RAG', 'Kubernetes Orchestration', 'Khmer NLP Processing']),
    education_requirement: 'Bachelor in Computer Science, Software Engineering, or Applied Mathematics',
    asean_mobility_tier: 'Tier 1 (ASEAN Mutual Recognition Arrangement Approved)',
    demand_index: 0.98,
  },
  {
    id: 'car-lake-data-engineer',
    soc_code: '15-1256.00',
    title_en: 'Big Data & Pipeline Platform Engineer',
    title_km: 'វិស្វករវេទិកាទិន្នន័យធំ និងបំពង់ទិន្នន័យ',
    onet_taxonomy_code: '15-1256.00',
    industry_domain: 'FinTech & Digital Banking',
    entry_salary_usd: 800,
    median_salary_usd: 1600,
    senior_salary_usd: 2900,
    projected_growth_5yr: 31.0,
    automation_risk_pct: 7.5,
    top_skills_json: JSON.stringify(['Apache Spark & Kafka', 'PostgreSQL & Cloud Spanner', 'dbt Data Modeling', 'Feature Stores', 'Data Governance & Audit']),
    education_requirement: 'Bachelor in Computer Science or Information Technology',
    asean_mobility_tier: 'Tier 1 (High Regional Demand in SG/MY/TH)',
    demand_index: 0.94,
  },
  {
    id: 'car-lake-cybersecurity',
    soc_code: '15-1212.00',
    title_en: 'Cybersecurity Threat Intelligence Specialist',
    title_km: 'អ្នកឯកទេសសន្តិសុខសាយប័រ និងការស៊ើបការណ៍គំរាមកំហែង',
    onet_taxonomy_code: '15-1212.00',
    industry_domain: 'National Infrastructure & FinTech',
    entry_salary_usd: 850,
    median_salary_usd: 1700,
    senior_salary_usd: 3200,
    projected_growth_5yr: 34.2,
    automation_risk_pct: 3.1,
    top_skills_json: JSON.stringify(['SIEM & SOC Telemetry', 'Zero Trust Architecture', 'Penetration Testing (OSCP)', 'National Data Privacy Law Compliance', 'Incident Response Playbooks']),
    education_requirement: 'Bachelor in Cybersecurity or Computer Networking',
    asean_mobility_tier: 'Tier 1 (Critical Infrastructure Exemption)',
    demand_index: 0.96,
  },
  {
    id: 'car-lake-agritech-engineer',
    soc_code: '17-2199.00',
    title_en: 'AgriTech & Smart Irrigation Systems Engineer',
    title_km: 'វិស្វករបច្ចេកវិទ្យាកសិកម្ម និងប្រព័ន្ធធារាសាស្ត្រឆ្លាតវៃ',
    onet_taxonomy_code: '17-2199.00',
    industry_domain: 'High-Tech Agriculture & Food Security',
    entry_salary_usd: 650,
    median_salary_usd: 1350,
    senior_salary_usd: 2400,
    projected_growth_5yr: 26.8,
    automation_risk_pct: 9.8,
    top_skills_json: JSON.stringify(['IoT Sensor Networks (LoRaWAN)', 'Drone Multispectral Imagery', 'Hydrological Modeling (Baray Systems)', 'Soil Chemistry Analytics', 'Automated Fertigation Controllers']),
    education_requirement: 'Bachelor in Agricultural Engineering or Mechatronics',
    asean_mobility_tier: 'Tier 2 (Mekong Regional Priority)',
    demand_index: 0.88,
  },
  {
    id: 'car-lake-renewable-energy',
    soc_code: '17-2071.00',
    title_en: 'Solar & Renewable Microgrid Engineer',
    title_km: 'វិស្វករថាមពលពន្លឺព្រះអាទិត្យ និងបណ្តាញអគ្គិសនីកកើតឡើងវិញ',
    onet_taxonomy_code: '17-2071.00',
    industry_domain: 'Green Energy & Solar Power',
    entry_salary_usd: 700,
    median_salary_usd: 1450,
    senior_salary_usd: 2600,
    projected_growth_5yr: 29.5,
    automation_risk_pct: 6.4,
    top_skills_json: JSON.stringify(['Photovoltaic Grid Integration', 'Battery Energy Storage Systems (BESS)', 'SCADA Industrial Networks', 'Power Flow Simulation (ETAP)', 'Cambodia EDC Grid Code Compliance']),
    education_requirement: 'Bachelor in Electrical & Energy Engineering (ITC / RUPP)',
    asean_mobility_tier: 'Tier 1 (ASEAN Green Transition Taskforce)',
    demand_index: 0.91,
  },
];

export interface IndustryLakeItem {
  id: string;
  sector_code: string;
  name_en: string;
  name_km: string;
  gdp_contribution_pct: number;
  digital_transformation_index: number;
  strategic_priority_level: string;
  total_formal_workforce: number;
  hiring_velocity_index: number;
  top_employers_json: string;
  key_growth_drivers: string;
  partner_institutions_count: number;
}

export const initialIndustriesLake: IndustryLakeItem[] = [
  {
    id: 'ind-lake-ict',
    sector_code: 'SEC-ICT-01',
    name_en: 'Digital Economy, Software & Telecommunications',
    name_km: 'សេដ្ឋកិច្ចឌីជីថល កម្មវិធីកុំព្យូទ័រ និងទូរគមនាគមន៍',
    gdp_contribution_pct: 6.8,
    digital_transformation_index: 0.92,
    strategic_priority_level: 'Priority 1 - National Pentagonal Strategy Phase 1',
    total_formal_workforce: 52000,
    hiring_velocity_index: 0.95,
    top_employers_json: JSON.stringify(['Smart Axiata', 'Cellcard / CamGSM', 'Viettel Cambodia (Metfone)', 'Sabay Digital', 'CADT Research Hub', 'Morodok Techno Park']),
    key_growth_drivers: 'National 5G deployment, E-Government modernization portal, cross-border cloud corridors with ASEAN neighbors.',
    partner_institutions_count: 18,
  },
  {
    id: 'ind-lake-fintech',
    sector_code: 'SEC-FIN-02',
    name_en: 'Digital Banking, Bakong & Financial Technologies',
    name_km: 'ធនាគារឌីជីថល បាគង និងបច្ចេកវិទ្យាហិរញ្ញវត្ថុ',
    gdp_contribution_pct: 11.2,
    digital_transformation_index: 0.96,
    strategic_priority_level: 'Priority 1 - National Payment System Flagship',
    total_formal_workforce: 78000,
    hiring_velocity_index: 0.93,
    top_employers_json: JSON.stringify(['National Bank of Cambodia (NBC)', 'ABA Bank', 'Wing Bank', 'Canadia Bank', 'Acleda Bank Plc', 'Pi Pay']),
    key_growth_drivers: 'Project Bakong QR international cross-border settlement (KHQR with Thailand, Vietnam, Malaysia, China, Japan).',
    partner_institutions_count: 24,
  },
  {
    id: 'ind-lake-agritech',
    sector_code: 'SEC-AGR-03',
    name_en: 'Modern AgriTech, Food Processing & Cold Chain Logistics',
    name_km: 'កសិបច្ចេកវិទ្យាទំនើប កែច្នៃចំណីអាហារ និងភស្តុភារខ្សែសង្វាក់ត្រជាក់',
    gdp_contribution_pct: 22.4,
    digital_transformation_index: 0.64,
    strategic_priority_level: 'Priority 2 - Food Sovereignty & Rural Industrialization',
    total_formal_workforce: 280000,
    hiring_velocity_index: 0.81,
    top_employers_json: JSON.stringify(['Mong Reththy Group', 'AMRU Rice Cambodia', 'Khmer Fresh Milk (Kirirom Dairy)', 'Confirel', 'Kasekam Khmer Agro']),
    key_growth_drivers: 'Precision agriculture drone mapping, direct agricultural export contracts under RCEP, climate-resilient water infrastructure.',
    partner_institutions_count: 14,
  },
  {
    id: 'ind-lake-green-energy',
    sector_code: 'SEC-ENE-04',
    name_en: 'Renewable Solar, Hydropower & Clean Energy Grid',
    name_km: 'ថាមពលពន្លឺព្រះអាទិត្យ វារីអគ្គិសនី និងបណ្តាញថាមពលស្អាត',
    gdp_contribution_pct: 4.6,
    digital_transformation_index: 0.78,
    strategic_priority_level: 'Priority 1 - National Clean Energy Masterplan 2040',
    total_formal_workforce: 26000,
    hiring_velocity_index: 0.87,
    top_employers_json: JSON.stringify(['Electricite du Cambodge (EDC)', 'SchneiTec Group', 'TotalEnergies Cambodia', 'Blue Circle Wind', 'Total Solar Solutions']),
    key_growth_drivers: 'Targeting 70% clean renewable energy mix by 2030, commercial rooftop solar parity, smart microgrid rural electrification.',
    partner_institutions_count: 12,
  },
];

export interface PsychometricsLakeItem {
  id: string;
  instrument_code: string;
  instrument_name: string;
  dimension_key: string;
  dimension_label: string;
  description: string;
  educational_application: string;
  pedagogical_strategy: string;
  scale_range_min: number;
  scale_range_max: number;
  assessment_items_count: number;
  non_clinical_guarantee: number;
}

export const initialPsychometricsLake: PsychometricsLakeItem[] = [
  {
    id: 'psy-lake-ocean-openness',
    instrument_code: 'OCEAN-BIG5-EDU',
    instrument_name: 'Big Five Educational Disposition Inventory',
    dimension_key: 'openness_to_experience',
    dimension_label: 'Intellectual Curiosity & Conceptual Exploration',
    description: 'Measures intrinsic interest in novel abstractions, interdisciplinary synthesis, and artistic or philosophical depth.',
    educational_application: 'Directs curriculum branching toward advanced theoretical research, exploratory hackathons, and multi-paradigm coding.',
    pedagogical_strategy: 'Provide open-ended project briefs with multiple viable solutions rather than rote closed-form exercises.',
    scale_range_min: 1.0,
    scale_range_max: 5.0,
    assessment_items_count: 10,
    non_clinical_guarantee: 1,
  },
  {
    id: 'psy-lake-ocean-conscientiousness',
    instrument_code: 'OCEAN-BIG5-EDU',
    instrument_name: 'Big Five Educational Disposition Inventory',
    dimension_key: 'conscientiousness',
    dimension_label: 'Methodical Execution & Study Habit Discipline',
    description: 'Quantifies self-regulation, diligence in completing long-term milestones, and resistance to impulsive distractions.',
    educational_application: 'Calibrates the granularity of automated AI study schedules, countdown notifications, and checklist milestones.',
    pedagogical_strategy: 'For lower conscientiousness students, implement micro-milestones (15-minute bursts) with immediate celebratory telemetry feedback.',
    scale_range_min: 1.0,
    scale_range_max: 5.0,
    assessment_items_count: 10,
    non_clinical_guarantee: 1,
  },
  {
    id: 'psy-lake-riasec-investigative',
    instrument_code: 'HOLLAND-RIASEC-KH',
    instrument_name: 'Holland RIASEC Vocational Career Matcher (Khmer Calibrated)',
    dimension_key: 'investigative_type',
    dimension_label: 'Investigative & Scientific Inquiry (Type I)',
    description: 'Preference for intellectual problem-solving, mathematical proofs, experimental observation, and root-cause analysis.',
    educational_application: 'Primary predictor for high alignment with Computer Science, Applied Mathematics, Biotech, and Engineering R&D.',
    pedagogical_strategy: 'Anchor learning modules around the scientific method: formulate hypothesis, collect simulated laboratory data, deduce governing laws.',
    scale_range_min: 1.0,
    scale_range_max: 5.0,
    assessment_items_count: 12,
    non_clinical_guarantee: 1,
  },
  {
    id: 'psy-lake-grit-duckworth',
    instrument_code: 'DUCKWORTH-GRIT-8',
    instrument_name: 'Academic Grit & Perseverance Scale',
    dimension_key: 'grit_perseverance',
    dimension_label: 'Grit: Long-Term Passion & Perseverance of Effort',
    description: 'Assesses the student capacity to sustain effort and interest toward multi-year academic goals despite setbacks and plateaus.',
    educational_application: 'Identifies candidates who will thrive in rigorous 5-year engineering diplomas (ITC) or competitive scholarship exams.',
    pedagogical_strategy: 'Reflect historical error recovery trajectory: show students graphs proving that prior difficulties preceded conceptual breakthroughs.',
    scale_range_min: 1.0,
    scale_range_max: 5.0,
    assessment_items_count: 8,
    non_clinical_guarantee: 1,
  },
  {
    id: 'psy-lake-growth-mindset',
    instrument_code: 'DWECK-MINDSET-EDU',
    instrument_name: 'Dweck Growth vs. Fixed Mindset Index',
    dimension_key: 'growth_mindset',
    dimension_label: 'Belief in Neuroplasticity & Malleable Intelligence',
    description: 'Measures whether the student attributes academic mastery to innate genetic talent vs. deliberate practice and strategic effort.',
    educational_application: 'Intervenes when students encounter difficult Bac II topics (e.g. 3D vectors or organic reaction mechanisms).',
    pedagogical_strategy: 'Praise effort, strategy selection, and recovery from incorrect answers rather than raw speed or effortless correctness.',
    scale_range_min: 1.0,
    scale_range_max: 5.0,
    assessment_items_count: 6,
    non_clinical_guarantee: 1,
  },
];

export interface LearningScienceLakeItem {
  id: string;
  framework_name: string;
  level_or_phase: string;
  cognitive_domain: string;
  definition: string;
  action_verbs_json: string;
  scaffolding_techniques_json: string;
  ebbinghaus_decay_factor: number;
  cognitive_load_type: 'intrinsic' | 'extraneous' | 'germane';
  misconception_countermeasures_json: string;
}

export const initialLearningScienceLake: LearningScienceLakeItem[] = [
  {
    id: 'ls-bloom-remember',
    framework_name: 'Revised Bloom Taxonomy',
    level_or_phase: 'Level 1: Remember',
    cognitive_domain: 'Knowledge Retrieval',
    definition: 'Recognizing or recalling relevant knowledge from long-term memory (formulas, constants, definitions, dates).',
    action_verbs_json: JSON.stringify(['Define', 'List', 'Recall', 'Identify', 'State', 'Recognize']),
    scaffolding_techniques_json: JSON.stringify(['Flashcards with spaced intervals', 'Mnemonic acronyms in Khmer', 'Cloze fill-in-the-blank drills']),
    ebbinghaus_decay_factor: 0.45,
    cognitive_load_type: 'intrinsic',
    misconception_countermeasures_json: JSON.stringify(['Ensure student does not mistake superficial familiarity with deep operational understanding']),
  },
  {
    id: 'ls-bloom-apply',
    framework_name: 'Revised Bloom Taxonomy',
    level_or_phase: 'Level 3: Apply',
    cognitive_domain: 'Procedural Execution',
    definition: 'Carrying out or using a computational procedure or scientific principle in a given unfamiliar problem.',
    action_verbs_json: JSON.stringify(['Calculate', 'Solve', 'Implement', 'Execute', 'Demonstrate', 'Simulate']),
    scaffolding_techniques_json: JSON.stringify(['Faded worked examples (step 1-2 shown, step 3-4 performed by student)', 'Visual vector field diagram overlays', 'Unit-dimension dimensional checks']),
    ebbinghaus_decay_factor: 0.22,
    cognitive_load_type: 'germane',
    misconception_countermeasures_json: JSON.stringify(['Highlight signs (+ vs -) in gravitational acceleration equations', 'Verify coordinate system orientation']),
  },
  {
    id: 'ls-vygotsky-zpd',
    framework_name: 'Vygotskian Zone of Proximal Development',
    level_or_phase: 'ZPD Scaffolding & Dynamic Fading',
    cognitive_domain: 'Guided Developmental Transition',
    definition: 'The distance between the actual developmental level determined by independent problem solving and the level of potential development under adult guidance or with more capable peers.',
    action_verbs_json: JSON.stringify(['Bridge', 'Scaffold', 'Fade', 'Co-construct', 'Prompt', 'Deconstruct']),
    scaffolding_techniques_json: JSON.stringify(['Stepped hints (Level 1: conceptual clue, Level 2: formula reminder, Level 3: partial calculation)', 'Peer explanation synthesis in Campus Commons', 'Interactive Socratic counter-questioning']),
    ebbinghaus_decay_factor: 0.18,
    cognitive_load_type: 'germane',
    misconception_countermeasures_json: JSON.stringify(['Never provide the answer immediately; preserve the productive struggle interval (minimum 45 seconds of cognitive engagement)']),
  },
  {
    id: 'ls-ebbinghaus-dsr',
    framework_name: 'Ebbinghaus & DSR Spaced Repetition Formulation',
    level_or_phase: 'Stability & Retrievability Curve',
    cognitive_domain: 'Long-Term Memory Consolidation',
    definition: 'Retrievability decay formula: R = e^(-t/S), where S represents memory stability conditioned on item difficulty D and review repetition count.',
    action_verbs_json: JSON.stringify(['Review', 'Consolidate', 'Retrieve', 'Reinforce', 'Interleave', 'Test']),
    scaffolding_techniques_json: JSON.stringify(['Optimized review scheduling at R=0.90 threshold', 'Interleaved practice mixing calculus, physics, and chemical equilibrium', 'Active recall free-response prompts without formula sheet']),
    ebbinghaus_decay_factor: 0.12,
    cognitive_load_type: 'germane',
    misconception_countermeasures_json: JSON.stringify(['Prevent massed cramming the night before exam; enforce multi-week consolidation']),
  },
];

export interface MLModelRegistryItem {
  model_id: string;
  model_name: string;
  task_type: 'grade_prediction' | 'university_recommendation' | 'spaced_repetition_optimization' | 'career_competency_gap' | 'dropout_risk_early_warning';
  framework: string;
  algorithm: string;
  version: string;
  accuracy_score: number;
  f1_or_rmse: number;
  parameters_json: string;
  training_dataset_size: number;
  deployment_status: 'champion_production' | 'challenger_canary' | 'shadow_evaluation' | 'retired';
}

export const initialMLModelsRegistry: MLModelRegistryItem[] = [
  {
    model_id: 'model-bac2-predictor-v2',
    model_name: 'National Bac II Grade & Composite Score Estimator',
    task_type: 'grade_prediction',
    framework: 'LightGBM / Scikit-Learn',
    algorithm: 'Gradient Boosted Decision Trees + Bayesian Prior Regularization',
    version: 'v2.4.1',
    accuracy_score: 0.934,
    f1_or_rmse: 14.2, // RMSE in score points out of 500
    parameters_json: JSON.stringify({ n_estimators: 350, max_depth: 6, learning_rate: 0.03, colsample_bytree: 0.85 }),
    training_dataset_size: 45000,
    deployment_status: 'champion_production',
  },
  {
    model_id: 'model-univ-recommender-v3',
    model_name: 'Two-Tower Neural University & Major Matcher',
    task_type: 'university_recommendation',
    framework: 'PyTorch / ONNX Runtime',
    algorithm: 'Two-Tower Dual Encoder + Contextual LinUCB Exploration Bandit',
    version: 'v3.1.0',
    accuracy_score: 0.912,
    f1_or_rmse: 0.894, // F1-score on accepted enrollments
    parameters_json: JSON.stringify({ embedding_dim: 128, temperature: 0.07, bandit_alpha: 0.25, l2_reg: 1e-4 }),
    training_dataset_size: 78000,
    deployment_status: 'champion_production',
  },
  {
    model_id: 'model-spaced-rep-dsr-v1',
    model_name: 'DSR Dynamic Memory Decay & Interval Optimizer',
    task_type: 'spaced_repetition_optimization',
    framework: 'PyTorch / FSRS-4.5',
    algorithm: 'Free Spaced Repetition Scheduler (DSR Power Law Formulation)',
    version: 'v1.2.0',
    accuracy_score: 0.941,
    f1_or_rmse: 0.082, // Log loss on recall outcome
    parameters_json: JSON.stringify({ target_retrievability: 0.90, max_interval_days: 180, stability_factor: 1.45 }),
    training_dataset_size: 320000,
    deployment_status: 'champion_production',
  },
  {
    model_id: 'model-career-competency-gap-v2',
    model_name: 'ASEAN Labor Market Competency Vector Projector',
    task_type: 'career_competency_gap',
    framework: 'Transformers / HuggingFace',
    algorithm: 'Dense Domain-Adapted Sentence-Transformer (Gecko-Khmer-Align)',
    version: 'v2.0.4',
    accuracy_score: 0.958,
    f1_or_rmse: 0.942, // Cosine similarity alignment accuracy
    parameters_json: JSON.stringify({ vector_dim: 768, similarity_metric: 'cosine', pooling: 'mean' }),
    training_dataset_size: 62000,
    deployment_status: 'champion_production',
  },
];
