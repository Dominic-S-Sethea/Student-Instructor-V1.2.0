import { UniversityRepository, UniversityRow, MajorRow } from '../repositories/universityRepository';

export class UniversityService {
  private repo: UniversityRepository;

  constructor(repo?: UniversityRepository) {
    this.repo = repo || new UniversityRepository();
  }

  public getUniversities() {
    const raw = this.repo.getAll();
    return raw.map(u => this.formatUniversity(u));
  }

  public getUniversityById(id: string) {
    const raw = this.repo.getById(id);
    if (!raw) return null;
    return this.formatUniversity(raw);
  }

  private formatUniversity(u: UniversityRow & { majors: MajorRow[] }) {
    return {
      id: u.id,
      abbr: u.abbr,
      name: u.name,
      khmerName: u.khmer_name || '',
      location: u.location,
      type: u.type,
      foundedYear: u.founded_year,
      website: u.website || '',
      logo: u.logo || '',
      coverImage: u.cover_image || '',
      profileScore: {
        overall: u.profile_score_overall,
        academicReputation: u.academic_reputation_score,
        industryConnection: u.industry_connection_score,
        facilities: u.facilities_score,
        graduateOutcome: u.graduate_outcome_score
      },
      annualTuitionUSD: u.annual_tuition_usd,
      totalDegreeCostUSD: u.total_degree_cost_usd,
      accreditation: {
        status: u.accreditation_status || 'Fully Accredited',
        agency: 'Accreditation Committee of Cambodia (ACC)'
      },
      majors: u.majors.map(m => {
        let courseStructure = [];
        let technicalSkills = [];
        let softSkills = [];
        try { courseStructure = JSON.parse(m.course_structure || '[]'); } catch { courseStructure = []; }
        try { technicalSkills = JSON.parse(m.technical_skills || '[]'); } catch { technicalSkills = []; }
        try { softSkills = JSON.parse(m.soft_skills || '[]'); } catch { softSkills = []; }

        return {
          id: m.slug,
          name: m.name,
          faculty: m.faculty,
          degreeType: m.degree_type,
          durationYears: m.duration_years,
          difficultyRating: m.difficulty_rating,
          difficultyReason: m.difficulty_reason,
          jobMarketDemand: m.job_market_demand,
          averageStartingSalary: m.average_starting_salary,
          courseStructure,
          technicalSkillsGained: technicalSkills,
          softSkillsGained: softSkills
        };
      })
    };
  }
}
