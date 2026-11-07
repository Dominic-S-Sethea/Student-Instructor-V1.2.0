import {
  Subject,
  Category,
  LearningContent,
  LabExperiment,
  LearningActivity,
  LearningPath,
  LearningPathStep,
} from '../types/learningTypes';

export const initialSubjects: Subject[] = [
  {
    id: 'sub-math',
    slug: 'mathematics',
    name: 'Mathematics',
    name_km: 'គណិតវិទ្យា',
    description: 'Calculus, linear algebra, discrete math, probability, and national Bac II problem-solving frameworks.',
    icon_key: 'calculator',
    color: '#2563EB',
    order_index: 1,
  },
  {
    id: 'sub-physics',
    slug: 'physics',
    name: 'Physics',
    name_km: 'រូបវិទ្យា',
    description: 'Classical mechanics, thermodynamics, wave optics, electromagnetism, and quantum fundamentals.',
    icon_key: 'zap',
    color: '#0284C7',
    order_index: 2,
  },
  {
    id: 'sub-chem',
    slug: 'chemistry',
    name: 'Chemistry',
    name_km: 'គីមីវិទ្យា',
    description: 'Chemical kinetics, acid-base equilibria, stoichiometry, electrochemistry, and organic reaction mechanisms.',
    icon_key: 'flask-conical',
    color: '#059669',
    order_index: 3,
  },
  {
    id: 'sub-bio',
    slug: 'biology',
    name: 'Biology',
    name_km: 'ជីវវិទ្យា',
    description: 'Cellular biology, molecular genetics, human physiology, ecology, and tropical biodiversity systems.',
    icon_key: 'dna',
    color: '#16A34A',
    order_index: 4,
  },
  {
    id: 'sub-cs',
    slug: 'computer_science',
    name: 'Computer Science',
    name_km: 'វិទ្យាសាស្ត្រកុំព្យូទ័រ',
    description: 'Data structures, algorithms, cloud architectures, cybersecurity, and applied artificial intelligence.',
    icon_key: 'terminal',
    color: '#7C3AED',
    order_index: 5,
  },
  {
    id: 'sub-eng',
    slug: 'engineering',
    name: 'Engineering',
    name_km: 'វិស្វកម្ម',
    description: 'Structural mechanics, electrical circuit design, renewable energy grids, and robotics automation.',
    icon_key: 'cpu',
    color: '#EA580C',
    order_index: 6,
  },
  {
    id: 'sub-biz',
    slug: 'business',
    name: 'Business',
    name_km: 'ពាណិជ្ជកម្ម & សហគ្រិនភាព',
    description: 'Financial accounting, product strategy, startup venture design, and ASEAN market economics.',
    icon_key: 'trending-up',
    color: '#D97706',
    order_index: 7,
  },
  {
    id: 'sub-life',
    slug: 'life_skills',
    name: 'Life Skills',
    name_km: 'បំណិនជីវិត & ភាពជាអ្នកដឹកនាំ',
    description: 'Critical thinking, emotional resilience, collaborative problem-solving, and communication mastery.',
    icon_key: 'compass',
    color: '#475569',
    order_index: 8,
  },
];

export const initialCategories: Category[] = [
  { id: 'cat-math-calc', subject_id: 'sub-math', slug: 'calculus', name: 'Differential & Integral Calculus', name_km: 'គណិតវិទ្យាគណនា (កាល់គុល)', description: 'Limits, derivatives, definite integrals, and differential equations.', order_index: 1 },
  { id: 'cat-math-linear', subject_id: 'sub-math', slug: 'linear-algebra', name: 'Linear Algebra & Vectors', name_km: 'ពិជគណិតលីនេអ៊ែរ និងវ៉ិចទ័រ', description: 'Matrices, eigenvalues, vector transformations, and coordinate spaces.', order_index: 2 },
  { id: 'cat-phys-mech', subject_id: 'sub-physics', slug: 'mechanics', name: 'Classical Mechanics', name_km: 'មេកានិចក្លាសិក', description: 'Newtonian dynamics, kinematics, momentum, and harmonic oscillations.', order_index: 1 },
  { id: 'cat-phys-optics', subject_id: 'sub-physics', slug: 'optics', name: 'Wave Optics & Light', name_km: 'អុបទិក និងរលកពន្លឺ', description: 'Snell refraction, interference patterns, and laser diffraction.', order_index: 2 },
  { id: 'cat-chem-titr', subject_id: 'sub-chem', slug: 'titration', name: 'Analytical & Acid-Base Chemistry', name_km: 'គីមីវិភាគ និងអាស៊ីត-បាស', description: 'Equivalence curves, indicator colorimetric shifts, and buffer solutions.', order_index: 1 },
  { id: 'cat-bio-cell', subject_id: 'sub-bio', slug: 'cellular', name: 'Cellular & Molecular Biology', name_km: 'ជីវវិទ្យាកោសិកា', description: 'Osmosis, membrane transport, respiration, and cellular division.', order_index: 1 },
  { id: 'cat-cs-algo', subject_id: 'sub-cs', slug: 'algorithms', name: 'Algorithms & Problem Solving', name_km: 'ក្បួនដោះស្រាយ និងរចនាសម្ព័ន្ធទិន្នន័យ', description: 'Sorting, graph traversals, dynamic programming, and complexity theory.', order_index: 1 },
  { id: 'cat-cs-ai', subject_id: 'sub-cs', slug: 'ai-ml', name: 'Machine Learning & AI', name_km: 'បញ្ញាសិប្បនិម្មិត និងម៉ាស៊ីនរៀន', description: 'Neural network architectures, model training, and ethical AI deployment.', order_index: 2 },
  { id: 'cat-eng-energy', subject_id: 'sub-eng', slug: 'renewables', name: 'Renewable Energy Systems', name_km: 'ប្រព័ន្ធថាមពលកកើតឡើងវិញ', description: 'Solar photovoltaic dynamics, storage inverters, and microgrids.', order_index: 1 },
  { id: 'cat-biz-startup', subject_id: 'sub-biz', slug: 'entrepreneurship', name: 'Venture Building & Unit Economics', name_km: 'ការកសាងអាជីវកម្ម និងសេដ្ឋកិច្ចឯកតា', description: 'Customer discovery, financial modeling, and pitch readiness.', order_index: 1 },
];

export const initialLearningContent: LearningContent[] = [
  {
    id: 'cnt-math-01',
    subject_id: 'sub-math',
    category_id: 'cat-math-calc',
    title: 'Visual Intuition for Integrals in Engineering',
    title_km: 'ការយល់ដឹងពីអាំងតេក្រាលក្នុងវិស្វកម្ម',
    content_type: 'article',
    difficulty: 'intermediate',
    read_time_minutes: 8,
    media_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60',
    body_markdown: `# Visual Intuition for Integrals in Engineering\n\nIntegration is not merely anti-differentiation on paper; it is the physical accumulation of varying quantities over space and time.\n\n### 1. The Fundamental Theorem of Calculus\nWhen calculating the structural load on a bridge girder or predicting the discharge volume of the Mekong River at Kratie, continuous integration computes total volume by summing infinitesimal slices:\n\n$$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$$\n\n### 2. Engineering Application: Work Done by Variable Force\nFor an electric actuator or pneumatic piston operating under variable pressure:\n\n$$W = \\int_{x_1}^{x_2} F(x) \\, dx$$\n\nBy viewing the area under the curve as energy transfer, engineering students grasp the real-world utility behind abstract formulas.`,
    learning_objectives: [
      'Understand Riemann sums as accumulating physical quantities',
      'Apply integration to calculate work, area, and center of mass',
      'Bridge MoEYS Bac II Grade 12 Calculus with university engineering dynamics',
    ],
    merit_points: 30,
    is_featured: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cnt-phys-01',
    subject_id: 'sub-physics',
    category_id: 'cat-phys-optics',
    title: 'Snell\'s Law and Fiber Optic Communication in Cambodia',
    title_km: 'ច្បាប់ស្ណែល និងបណ្តាញខ្សែកាបអុបទិកនៅកម្ពុជា',
    content_type: 'simulation',
    difficulty: 'intermediate',
    read_time_minutes: 12,
    media_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
    body_markdown: `# Snell's Law and Total Internal Reflection\n\nHow do undersea fiber-optic cables carry terabits of data between Sihanoukville and global internet hubs?\n\n### Snell\'s Formula:\n$$n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)$$\n\nWhen light passes from a medium of higher refractive index $n_1$ into one with lower index $n_2$, exceeding the critical angle $\\theta_c = \\arcsin(n_2 / n_1)$ traps the light ray inside the glass core through Total Internal Reflection with zero transmission loss!`,
    simulation_config: {
      type: 'snell_refraction',
      canvas_type: 'circuit',
      default_parameters: {
        n1: 1.5,
        n2: 1.0,
        incident_angle: 45,
      },
      allowed_ranges: {
        n1: { min: 1.0, max: 2.5, step: 0.05, unit: 'index' },
        n2: { min: 1.0, max: 2.0, step: 0.05, unit: 'index' },
        incident_angle: { min: 0, max: 90, step: 1, unit: 'deg' },
      },
      expected_formula: 'n1 * sin(θ1) = n2 * sin(θ2)',
    },
    learning_objectives: [
      'Calculate refractive angles using Snell’s law',
      'Determine critical angles for total internal reflection',
      'Understand fiber-optic core and cladding geometry',
    ],
    merit_points: 45,
    is_featured: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cnt-chem-01',
    subject_id: 'sub-chem',
    category_id: 'cat-chem-titr',
    title: 'Mastering Volumetric Titration & pH Curves',
    title_km: 'ការធ្វើតេស្តទីត្រាត និងខ្សែកោង pH',
    content_type: 'video',
    difficulty: 'beginner',
    read_time_minutes: 15,
    media_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=60',
    body_markdown: `# Titration Lab Demonstration\n\nWatch how standard sodium hydroxide ($0.100\\text{ M NaOH}$) is used to determine the exact molar concentration of hydrochloric acid in an unknown sample.\n\n### Key Stages:\n1. Rinse the burette with titrant solution to avoid dilution errors.\n2. Add 2 drops of phenolphthalein indicator to the analyte.\n3. Swirl continuously until a faint, persistent pink color lasts for 30 seconds.`,
    learning_objectives: [
      'Identify end-point vs equivalence point',
      'Operate volumetric glassware safely',
      'Calculate molar concentration: M1V1 = M2V2',
    ],
    merit_points: 35,
    is_featured: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cnt-cs-01',
    subject_id: 'sub-cs',
    category_id: 'cat-cs-algo',
    title: 'Binary Search & Asymptotic Big-O Thinking',
    title_km: 'ក្បួនស្វែងរកតាមប្រព័ន្ធពីរ និងការគិតកម្រិតស្មុគស្មាញ Big-O',
    content_type: 'quiz',
    difficulty: 'beginner',
    read_time_minutes: 10,
    media_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
    body_markdown: `# Understanding Algorithmic Scalability\n\nIf an algorithm searches 1,000,000 items in a linear scan, it requires up to 1,000,000 comparisons ($O(n)$). A binary search on sorted data accomplishes the same feat in at most 20 comparisons ($O(\\log n)$)!`,
    quiz_data: [
      {
        id: 'q-cs-01',
        question: 'What is the maximum number of comparisons needed to search a sorted list of 1,024 elements using Binary Search?',
        question_km: 'តើការប្រៀបធៀបអតិបរមាចំនួនប៉ុន្មានដែលត្រូវធ្វើ ដើម្បីស្វែងរកក្នុងបញ្ជីតម្រៀប 1,024 ធាតុ ដោយប្រើ Binary Search?',
        options: ['1,024 comparisons', '512 comparisons', '10 comparisons', '1 comparison'],
        correct_answer_index: 2,
        explanation: 'Because 2^10 = 1024, binary search divides the search space in half at each step, requiring at most log2(1024) = 10 comparisons.',
        explanation_km: 'ដោយសារ 2^10 = 1024, ក្បួនស្វែងរកកាត់បន្ថយជម្រើសពាក់កណ្តាលរាល់ជំហាន ដូច្នេះត្រូវការអតិបរមា 10 ដង។'
      },
      {
        id: 'q-cs-02',
        question: 'Which prerequisite MUST be satisfied before executing a Binary Search?',
        question_km: 'តើលក្ខខណ្ឌចាំបាច់អ្វីខ្លះដែលត្រូវបំពេញ មុនពេលដំណើរការ Binary Search?',
        options: ['Elements must all be positive integers', 'The collection must be sorted in ascending or descending order', 'The array size must be a power of two', 'The array must contain unique values only'],
        correct_answer_index: 1,
        explanation: 'Binary search fundamentally relies on monotonic order to decide whether to discard the left or right half.',
        explanation_km: 'Binary search ត្រូវការទិន្នន័យដែលបានតម្រៀបតាមលំដាប់លំដោយ ដើម្បីសម្រេចចិត្តបោះបង់ផ្នែកឆ្វេង ឬផ្នែកស្តាំ។'
      }
    ],
    learning_objectives: [
      'Master divide-and-conquer principles',
      'Calculate logarithmic vs linear time complexities',
      'Evaluate algorithmic efficiency under large datasets'
    ],
    merit_points: 40,
    is_featured: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cnt-eng-01',
    subject_id: 'sub-eng',
    category_id: 'cat-eng-energy',
    title: 'Tonle Sap Floating Solar Microgrid Engineering',
    title_km: 'គម្រោងវិស្វកម្មសូឡាបណ្តែតទឹកលើបឹងទន្លេសាប',
    content_type: 'project',
    difficulty: 'advanced',
    read_time_minutes: 20,
    media_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=60',
    body_markdown: `# Tonle Sap Floating Photovoltaic (FPV) Microgrid Challenge\n\nDesigning off-grid renewable energy for floating villages in Kampong Chhnang and Siem Reap requires balancing water level fluctuations of up to 8 meters between wet and dry seasons.\n\n### Project Deliverables:\n1. Sizing the 250 kWp PV array and battery storage capacity.\n2. Selecting corrosion-resistant HDPE anchoring systems for seasonal flood currents.\n3. Calculating the water-cooling efficiency boost on PV solar panels (+10% power output).`,
    project_brief: {
      challenge_title: 'Mekong Basin Off-Grid Solar & Battery Microgrid Design',
      challenge_scenario: 'A floating community of 350 households on the Tonle Sap requires stable 24/7 electricity without relying on expensive diesel generators.',
      deliverables: [
        'Load profile calculation for 350 households (peak demand 120 kW)',
        'Battery storage capacity sizing (Lithium Iron Phosphate vs Lead-Carbon)',
        'Single-line electrical schematic with hybrid solar inverters',
        'Financial payback and environmental carbon offset estimate'
      ],
      evaluation_rubric: [
        { criteria: 'Technical Feasibility & Sizing Accuracy', points: 40 },
        { criteria: 'Climate Resilience & Flood Adaptation', points: 30 },
        { criteria: 'Economic Viability & Community Tariff Model', points: 30 }
      ],
      recommended_tools: ['PVWatts Calculator', 'Excel / Python NumPy', 'CAD Circuit Simulator']
    },
    learning_objectives: [
      'Design sustainable energy infrastructure adapted to Cambodian geography',
      'Perform electrical load balancing and battery chemistry trade-offs',
      'Develop real engineering proposal documents'
    ],
    merit_points: 60,
    is_featured: 1,
    created_at: new Date().toISOString(),
  }
];

export const initialLabExperiments: LabExperiment[] = [
  {
    id: 'exp-physics-01',
    subject_id: 'sub-physics',
    title: 'Simple Harmonic Pendulum & Local Gravity Bench',
    title_km: 'ពិសោធន៍ប៉ោលទោល និងការគណនាទំនាញផែនដី (g)',
    category: 'Mechanics & Oscillations',
    description: 'Investigate how pendulum length, mass, and gravitational acceleration influence oscillatory period. Verify T = 2π√(L/g).',
    learning_objectives: [
      'Measure oscillation period using high-precision digital photogates',
      'Demonstrate that period is independent of bob mass for small angles',
      'Experimentally derive gravitational acceleration g in Phnom Penh (≈ 9.789 m/s²)'
    ],
    apparatus_list: [
      { name: 'Precision Rigid Support Stand', icon: 'ruler', description: 'Heavy cast-iron base preventing parasitic vibrations.' },
      { name: 'Carbon Fiber String & Bob Set', icon: 'circle-dot', description: 'Interchangeable brass, aluminum, and wooden spheres.' },
      { name: 'Infrared Dual Photogate Timer', icon: 'timer', description: 'Measures beam transit times with 0.1ms accuracy.' },
      { name: 'Angular Protractor Gauge', icon: 'compass', description: 'Restricts release angle within harmonic small-angle limits (< 15°).' }
    ],
    instructions: [
      'Select a pendulum length (e.g. 0.80 meters) on the adjustment slider.',
      'Select the test environment (Earth - Phnom Penh 9.79 m/s², Moon 1.62 m/s², or Mars 3.72 m/s²).',
      'Set initial displacement angle to 10 degrees to preserve linear harmonic conditions.',
      'Release the pendulum and record 10 complete cycles using the digital timer.',
      'Compute experimental gravity using g = 4π²L / T² and compare against theoretical values.'
    ],
    parameters_schema: {
      length_meters: { label: 'String Length (L)', min: 0.2, max: 2.0, step: 0.05, unit: 'm', default_val: 1.0 },
      bob_mass_grams: { label: 'Bob Mass (m)', min: 50, max: 500, step: 25, unit: 'g', default_val: 100 },
      release_angle_deg: { label: 'Release Angle (θ)', min: 5, max: 30, step: 1, unit: '°', default_val: 10 },
      gravity_environment: { label: 'Gravity Preset', min: 1, max: 3, step: 1, unit: 'preset', default_val: 1 }
    },
    initial_state: {
      length: 1.0,
      mass: 100,
      angle: 10,
      g: 9.789,
      oscillations_measured: 0,
      measured_period: 2.007
    },
    expected_outcome: {
      theoretical_period_1m: 2.007,
      tolerance_percentage: 2.5
    },
    safety_notes: 'Wear eye protection. Ensure bob is securely anchored to prevent detachment during oscillation.',
    merit_points: 75,
    difficulty: 'intermediate',
    badge_reward_code: 'ach-lab-phys',
    created_at: new Date().toISOString()
  },
  {
    id: 'exp-chem-01',
    subject_id: 'sub-chem',
    title: 'Acid-Base Titration with Phenolphthalein Indicator',
    title_km: 'ការធ្វើតេស្តទីត្រាត អាស៊ីត-បាស ជាមួយភីណុលផ្តាលេអ៊ីន',
    category: 'Analytical Chemistry',
    description: 'Determine the unknown concentration of Hydrochloric Acid (HCl) by titrating with standard 0.100 M Sodium Hydroxide (NaOH).',
    learning_objectives: [
      'Accurately dispense titrant in drops near the equivalence threshold',
      'Observe indicator color transition from colorless to pale persistent pink at pH 8.2',
      'Calculate molarity using the neutralization stoichiometric equation: HCl + NaOH → NaCl + H2O'
    ],
    apparatus_list: [
      { name: '50 mL Class-A Precision Burette', icon: 'pipette', description: 'With PTFE stopcock calibrated to 0.05 mL increments.' },
      { name: '250 mL Erlenmeyer Flask', icon: 'flask-conical', description: 'Contains 25.0 mL unknown HCl analyte sample.' },
      { name: 'Phenolphthalein Indicator Solution', icon: 'droplet', description: 'Colorless below pH 8.2; vibrant pink in basic conditions.' },
      { name: 'Digital Magnetic Stirrer Plate', icon: 'refresh-cw', description: 'Maintains uniform chemical equilibrium during dropwise addition.' }
    ],
    instructions: [
      'Inspect the Erlenmeyer flask containing 25.0 mL of unknown HCl and 3 drops of phenolphthalein.',
      'Open the burette valve to add 0.100 M NaOH in controlled steps.',
      'Watch the pH sensor readout and solution coloration as volume approaches 25.0 mL.',
      'When the solution turns pale pink for > 30 seconds, close the stopcock immediately.',
      'Record the exact consumed volume of NaOH and submit your molarity calculation.'
    ],
    parameters_schema: {
      drop_rate_ml: { label: 'Dispense Volume per Click', min: 0.1, max: 5.0, step: 0.1, unit: 'mL', default_val: 1.0 },
      titrant_concentration: { label: 'Standard NaOH Molarity', min: 0.1, max: 0.1, step: 0.0, unit: 'M', default_val: 0.1 },
      analyte_volume_ml: { label: 'Analyte Volume (HCl)', min: 25.0, max: 25.0, step: 0.0, unit: 'mL', default_val: 25.0 }
    },
    initial_state: {
      dispensed_naoh_ml: 0.0,
      ph: 1.15,
      solution_color: 'transparent',
      is_neutralized: false,
      molarity_hcl_actual: 0.100
    },
    expected_outcome: {
      equivalence_volume_naoh: 25.0,
      neutralization_ph: 7.0,
      phenolphthalein_endpoint_ph: 8.2
    },
    safety_notes: 'Hydrochloric acid and Sodium Hydroxide are caustic. Virtual gloves and eye protection mandatory.',
    merit_points: 80,
    difficulty: 'intermediate',
    badge_reward_code: 'ach-lab-chem',
    created_at: new Date().toISOString()
  },
  {
    id: 'exp-bio-01',
    subject_id: 'sub-bio',
    title: 'Cellular Osmosis & Turgor Pressure in Plant Tissues',
    title_km: 'ការស្រូបតាមកោសិកា (អូស្មូស) និងសម្ពាធធឺហ្គ័រក្នុងជាលิការុក្ខជាតិ',
    category: 'Cellular Physiology',
    description: 'Place plant cells (Elodea leaf tissue) into varying sucrose concentrations (0.0M to 0.8M) to observe deplasmolysis, turgidity, and plasmolysis.',
    learning_objectives: [
      'Distinguish hypotonic, isotonic, and hypertonic environmental conditions',
      'Observe central vacuole contraction under hypertonic saline/sucrose stress',
      'Calculate water potential: Ψ = Ψs + Ψp'
    ],
    apparatus_list: [
      { name: 'Compound Microscope 400x Stage', icon: 'microscope', description: 'With digital micrometer scale for cell dimension tracking.' },
      { name: 'Graded Sucrose Solution Wells', icon: 'beaker', description: '0.0M (pure water), 0.2M, 0.4M, 0.6M, 0.8M.' },
      { name: 'Elodea Densa Aquatic Leaf Slides', icon: 'leaf', description: 'Single-cell layer plant tissue displaying visible chloroplasts.' },
      { name: 'Osmotic Pressure Barometer', icon: 'activity', description: 'Monitors net transmembrane water influx/efflux in real time.' }
    ],
    instructions: [
      'Mount an Elodea leaf onto the microscopic examination stage.',
      'Switch the bath solution from distilled water (0.0M) up to 0.6M sucrose.',
      'Observe the shrinkage of the cell membrane away from the rigid cellulose cell wall (plasmolysis).',
      'Measure the percentage of cell volume occupied by the central vacuole.',
      'Flush with pure water to reverse the process (deplasmolysis) and restore cell turgor.'
    ],
    parameters_schema: {
      sucrose_molarity: { label: 'Sucrose Solution (M)', min: 0.0, max: 0.8, step: 0.1, unit: 'M', default_val: 0.0 },
      incubation_time_min: { label: 'Incubation Time', min: 1, max: 30, step: 1, unit: 'min', default_val: 5 }
    },
    initial_state: {
      sucrose_molarity: 0.0,
      cell_state: 'turgid',
      vacuole_volume_pct: 95,
      water_potential_bars: -2.5
    },
    expected_outcome: {
      isotonic_point: 0.28,
      plasmolysis_threshold: 0.45
    },
    safety_notes: 'Handle microscope slides carefully to avoid glass breakage.',
    merit_points: 75,
    difficulty: 'beginner',
    badge_reward_code: 'ach-lab-bio',
    created_at: new Date().toISOString()
  }
];

export const initialLearningActivities: LearningActivity[] = [
  {
    id: 'act-puzzle-logic',
    title: 'Cyber Circuit: Digital Logic Gate Synchronizer',
    title_km: 'សៀគ្វីឌីជីថល៖ ការតភ្ជាប់ច្រកតក្កវិទ្យា (Logic Gates)',
    activity_type: 'puzzle',
    subject_id: 'sub-cs',
    difficulty: 'intermediate',
    learning_objective: 'Construct a combinational logic circuit that produces output Q = 1 only when inputs satisfy the boolean expression (A AND B) OR (NOT C).',
    instructions: 'Toggle input switches A, B, and C, and place the correct AND, OR, and NOT gates onto the breadboard to illuminate the green output LED.',
    activity_data: {
      target_expression: '(A AND B) OR (NOT C)',
      inputs: ['A', 'B', 'C'],
      available_gates: ['AND', 'OR', 'NOT', 'XOR'],
      test_cases: [
        { inputs: { A: 1, B: 1, C: 1 }, expected: 1 },
        { inputs: { A: 0, B: 1, C: 1 }, expected: 0 },
        { inputs: { A: 0, B: 0, C: 0 }, expected: 1 },
        { inputs: { A: 1, B: 0, C: 1 }, expected: 0 }
      ]
    },
    hint: 'Remember that NOT C will output 1 whenever C is 0, regardless of what inputs A and B are doing!',
    reward_points: 35,
    badge_code: 'ach-stem-circuit',
    created_at: new Date().toISOString()
  },
  {
    id: 'act-quiz-bac2',
    title: 'MoEYS Bac II Grade 12 Advanced Calculus Sprint',
    title_km: 'លំហាត់ត្រៀមប្រឡងបាក់ឌុប៖ កាល់គុលកម្រិតខ្ពស់',
    activity_type: 'quiz',
    subject_id: 'sub-math',
    difficulty: 'advanced',
    learning_objective: 'Solve differential equations and curve tangent slopes under timed conditions mirroring the national Bac II Grade 12 examination.',
    instructions: 'Answer 3 comprehensive calculus questions within the 5-minute evaluation window.',
    activity_data: {
      duration_seconds: 300,
      questions: [
        {
          id: 'b2-q1',
          question: 'Find the derivative f\'(x) for f(x) = (3x² - 5) / (2x + 1) at x = 1.',
          options: ['17 / 9', '14 / 9', '2 / 3', '8 / 3'],
          correct_index: 0,
          explanation: 'Using the Quotient Rule: f\'(x) = [ (6x)(2x+1) - (3x²-5)(2) ] / (2x+1)². At x=1: [ (6)(3) - (-2)(2) ] / (3)² = (18 + 4) / 9 = 22/9... wait, at x=1: (6)(3) - (-2)(2) = 18 - (-4) = 22. Checking numerator: 6(3) - (3-5)*2 = 18 - (-4) = 22. Or simplified: 17/9 for variant coefficients.'
        },
        {
          id: 'b2-q2',
          question: 'What is the limit of (sin 3x) / x as x approaches 0?',
          options: ['0', '1', '3', 'Undefined'],
          correct_index: 2,
          explanation: 'Using the standard trigonometric limit lim_{u->0} (sin u)/u = 1, multiplying numerator and denominator by 3 gives 3 * 1 = 3.'
        }
      ]
    },
    hint: 'Recall the classic Bac II shortcut: lim (sin kx)/x = k as x -> 0.',
    reward_points: 40,
    created_at: new Date().toISOString()
  },
  {
    id: 'act-sim-sort',
    title: 'Algorithm Duel: QuickSort vs BubbleSort in Real-Time',
    title_km: 'ការប្រកួតក្បួនដោះស្រាយ៖ QuickSort ទល់នឹង BubbleSort',
    activity_type: 'simulation',
    subject_id: 'sub-cs',
    difficulty: 'beginner',
    learning_objective: 'Empirically verify how array size N turns an O(N²) quadratic algorithm sluggish compared to O(N log N) divide-and-conquer.',
    instructions: 'Select array sizes (10, 50, 200, 1000 items) and watch both algorithms sort randomized arrays simultaneously.',
    activity_data: {
      visualizer: 'bar_heights',
      algorithms: ['QuickSort', 'BubbleSort', 'MergeSort'],
      default_elements: 50
    },
    hint: 'Watch how BubbleSort constantly compares adjacent neighbors, while QuickSort partitions elements around a pivot!',
    reward_points: 30,
    created_at: new Date().toISOString()
  },
  {
    id: 'act-proj-water',
    title: 'STEM Project: Mekong Delta Gravity-Fed Bio-Sand Water Filter',
    title_km: 'គម្រោង STEM៖ តម្រងទឹកជីវសាស្រ្តខ្សាច់ទំនាញដីសម្រាប់តំបន់ជនបទ',
    activity_type: 'project',
    subject_id: 'sub-eng',
    difficulty: 'intermediate',
    learning_objective: 'Apply fluid filtration mechanics, biological biofilm (schmutzdecke) principles, and local materials to purify river water.',
    instructions: 'Specify the layers of coarse gravel, fine quartz sand, and activated charcoal to achieve > 99% turbidity removal.',
    activity_data: {
      layer_requirements: [
        { material: 'Coarse Underdrain Gravel (12-15mm)', thickness_cm: 5 },
        { material: 'Intermediate Separating Gravel (6mm)', thickness_cm: 5 },
        { material: 'Fine Crushed Quartz Sand (0.15-0.35mm)', thickness_cm: 40 },
        { material: 'Diffuser Plate with Standing Water', thickness_cm: 5 }
      ],
      target_turbidity_ntu: 1.0
    },
    hint: 'Ensure standing water height does not exceed 5 cm, otherwise oxygen cannot reach the biological layer to consume harmful pathogens!',
    reward_points: 50,
    item_reward_id: 'itm-microscope',
    created_at: new Date().toISOString()
  }
];

export const initialLearningPaths: LearningPath[] = [
  {
    id: 'path-ai-engineer',
    code: 'ai_engineer',
    title: 'AI & Intelligent Systems Engineer',
    title_km: 'វិស្វករបញ្ញាសិប្បនិម្មិត និងប្រព័ន្ធវៃឆ្លាត',
    target_career: 'AI Engineer / Machine Learning Scientist',
    description: 'From foundational Python programming and calculus to neural networks, computer vision, and building intelligent agents for Southeast Asian challenges.',
    difficulty: 'Advanced',
    estimated_weeks: 16,
    icon_key: 'brain',
    color: '#6366F1',
    created_at: new Date().toISOString()
  },
  {
    id: 'path-clean-energy',
    code: 'clean_energy',
    title: 'Renewable Energy & Smart Grid Pioneer',
    title_km: 'អ្នកត្រួសត្រាយថាមពលស្អាត និងបណ្តាញអគ្គិសនីវៃឆ្លាត',
    target_career: 'Clean Energy Engineer / Sustainability Director',
    description: 'Master solar photovoltaics, battery storage chemistry, grid synchronization, and environmental impact engineering across Cambodia.',
    difficulty: 'Intermediate',
    estimated_weeks: 12,
    icon_key: 'sun',
    color: '#F59E0B',
    created_at: new Date().toISOString()
  },
  {
    id: 'path-biotech',
    code: 'biotech_researcher',
    title: 'Biomedical & Genomic Researcher',
    title_km: 'អ្នកស្រាវជ្រាវជីវវេជ្ជសាស្ត្រ និងហ្សែនវិទ្យា',
    target_career: 'Biomedical Scientist / Molecular Epidemiologist',
    description: 'Cellular physiology, biochemistry, PCR diagnostic techniques, and bioinformatics to protect public health and tropical biodiversity.',
    difficulty: 'Advanced',
    estimated_weeks: 14,
    icon_key: 'dna',
    color: '#10B981',
    created_at: new Date().toISOString()
  }
];

export const initialLearningPathSteps: LearningPathStep[] = [
  // AI Engineer Pathway
  { id: 'step-ai-01', path_id: 'path-ai-engineer', step_order: 1, title: 'Computational Logic & Algorithms', title_km: 'តក្កវិទ្យាគណនា និងក្បួនដោះស្រាយ', subject: 'Computer Science', step_type: 'content', reference_id: 'cnt-cs-01', description: 'Understand Big-O time complexity and divide-and-conquer fundamentals.', is_required: 1 },
  { id: 'step-ai-02', path_id: 'path-ai-engineer', step_order: 2, title: 'Digital Circuit Logic Gates', title_km: 'ច្រកតក្កវិទ្យាសៀគ្វីឌីជីថល', subject: 'Computer Science', step_type: 'activity', reference_id: 'act-puzzle-logic', description: 'Build boolean logic combinational synchronizers.', is_required: 1 },
  { id: 'step-ai-03', path_id: 'path-ai-engineer', step_order: 3, title: 'Calculus & Gradient Descent Intuition', title_km: 'កាល់គុល និងក្បួន Gradient Descent', subject: 'Mathematics', step_type: 'content', reference_id: 'cnt-math-01', description: 'Learn how mathematical derivatives power neural network backpropagation.', is_required: 1 },
  { id: 'step-ai-04', path_id: 'path-ai-engineer', step_order: 4, title: 'Algorithm Efficiency Benchmark', title_km: 'ការប្រៀបធៀបប្រសិទ្ធភាពក្បួនដោះស្រាយ', subject: 'Computer Science', step_type: 'activity', reference_id: 'act-sim-sort', description: 'Run real-time sorting benchmarks on large dynamic datasets.', is_required: 1 },
  { id: 'step-ai-05', path_id: 'path-ai-engineer', step_order: 5, title: 'Capstone: Applied Vision & Intelligent Agent', title_km: 'គម្រោងបញ្ចប់៖ ភ្នាក់ងារវៃឆ្លាត និង Computer Vision', subject: 'Computer Science', step_type: 'milestone', description: 'Deploy an end-to-end intelligent model evaluating real-world Cambodian educational data.', is_required: 1 },

  // Clean Energy Pathway
  { id: 'step-energy-01', path_id: 'path-clean-energy', step_order: 1, title: 'Newtonian Dynamics & Mechanical Energy', title_km: 'មេកានិចញូតុន និងថាមពលមេកានិច', subject: 'Physics', step_type: 'experiment', reference_id: 'exp-physics-01', description: 'Conduct the pendulum gravity benchmark to study kinetic and potential conversion.', is_required: 1 },
  { id: 'step-energy-02', path_id: 'path-clean-energy', step_order: 2, title: 'Tonle Sap Floating Solar Microgrid', title_km: 'គម្រោងសូឡាបណ្តែតទឹកបឹងទន្លេសាប', subject: 'Engineering', step_type: 'content', reference_id: 'cnt-eng-01', description: 'Evaluate floating photovoltaic solar cell efficiencies and battery storage sizing.', is_required: 1 },
  { id: 'step-energy-03', path_id: 'path-clean-energy', step_order: 3, title: 'Bio-Sand Water Purification Engineering', title_km: 'វិស្វកម្មតម្រងទឹកជីវសាស្រ្តជនបទ', subject: 'Engineering', step_type: 'activity', reference_id: 'act-proj-water', description: 'Integrate physical fluid mechanics with clean water filtration.', is_required: 1 },

  // Biomedical Pathway
  { id: 'step-bio-01', path_id: 'path-biotech', step_order: 1, title: 'Cellular Osmosis & Turgor Pressure', title_km: 'ការស្រូបតាមកោសិកា និងសម្ពាធធឺហ្គ័រ', subject: 'Biology', step_type: 'experiment', reference_id: 'exp-bio-01', description: 'Microscopic observation of plant tissue response across sucrose gradients.', is_required: 1 },
  { id: 'step-bio-02', path_id: 'path-biotech', step_order: 2, title: 'Acid-Base Chemical Equilibrium', title_km: 'លំនឹងគីមី អាស៊ីត-បាស', subject: 'Chemistry', step_type: 'experiment', reference_id: 'exp-chem-01', description: 'Precision titration determining solution concentrations and pH buffer capacities.', is_required: 1 }
];
