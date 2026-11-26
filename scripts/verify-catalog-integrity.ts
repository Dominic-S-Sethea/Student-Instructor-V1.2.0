import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeDatabase, getDatabase } from '../server/db/connection';
import { runMigrations } from '../server/db/migrate';
import { ScholarshipService } from '../server/services/scholarshipService';
import { UniversityService } from '../server/services/universityService';

function isSafeUrlOrEmpty(raw: string | null | undefined): boolean {
  if (!raw || raw.trim() === '' || raw.trim() === '#') return true;
  try {
    const u = new URL(raw.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function main(): void {
  const workDir = mkdtempSync(join(tmpdir(), 'cdes-catalog-audit-'));
  process.env.DATABASE_PATH = join(workDir, 'catalog.db');
  process.env.NODE_ENV = 'production';
  process.env.GEMINI_API_KEY = '';

  const errors: string[] = [];
  try {
    const mig = runMigrations({ seedCatalog: true, seedDemo: false });
    const db = getDatabase();

    const integrity = db.prepare('PRAGMA integrity_check').get() as { integrity_check?: string };
    if (integrity?.integrity_check !== 'ok') {
      errors.push(`DB integrity_check failed: ${integrity?.integrity_check}`);
    }
    const fkViolations = db.prepare('PRAGMA foreign_key_check').all();
    if (fkViolations.length > 0) {
      errors.push(`DB foreign_key_check found ${fkViolations.length} violations`);
    }

    const schService = new ScholarshipService();
    const { scholarships } = schService.getScholarships({});
    if (scholarships.length < 10) {
      errors.push(`Expected >= 10 seeded scholarships, got ${scholarships.length}`);
    }

    const seenSchIds = new Set<string>();
    for (const s of scholarships) {
      if (seenSchIds.has(s.id)) errors.push(`Duplicate scholarship ID: ${s.id}`);
      seenSchIds.add(s.id);
      if (!s.name?.trim() || !s.nameKm?.trim()) errors.push(`Scholarship ${s.id} missing bilingual EN/KM name`);
      if (!s.provider?.trim() || !s.providerKm?.trim()) errors.push(`Scholarship ${s.id} missing bilingual EN/KM provider`);
      if (!isSafeUrlOrEmpty(s.applicationLink)) errors.push(`Scholarship ${s.id} unsafe applicationLink: ${s.applicationLink}`);
      if (!isSafeUrlOrEmpty(s.officialSourceUrl)) errors.push(`Scholarship ${s.id} unsafe officialSourceUrl: ${s.officialSourceUrl}`);
      if (/100%\s*verified/i.test(`${s.verificationStatus || ''} ${s.overview || ''}`)) {
        errors.push(`Scholarship ${s.id} contains prohibited "100% verified" claim`);
      }
      if (!s.benefitStates.monthlyAllowanceKnown && s.monthlyAllowance !== 'Not specified') {
        errors.push(`Scholarship ${s.id} unknown stipend must render "Not specified"`);
      }
      if (!s.benefitStates.monthlyAllowanceKnown && s.monthlyAllowanceKm !== 'មិនបានបញ្ជាក់') {
        errors.push(`Scholarship ${s.id} unknown Khmer stipend must render "មិនបានបញ្ជាក់"`);
      }
    }

    const uniService = new UniversityService();
    const universities = uniService.getUniversities();
    if (universities.length < 5) {
      errors.push(`Expected >= 5 seeded universities, got ${universities.length}`);
    }
    const seenUniIds = new Set<string>();
    for (const u of universities) {
      if (seenUniIds.has(u.id)) errors.push(`Duplicate university ID: ${u.id}`);
      seenUniIds.add(u.id);
      if (!u.name?.trim() || !u.khmerName?.trim()) errors.push(`University ${u.id} missing bilingual EN/KM name`);
      if (!isSafeUrlOrEmpty(u.website)) errors.push(`University ${u.id} unsafe website: ${u.website}`);
      if (!u.accreditation?.isKnown && u.accreditation?.status !== 'Not specified') {
        errors.push(`University ${u.id} unknown accreditation must report "Not specified"`);
      }
    }

    if (errors.length > 0) {
      console.error('CATALOG INTEGRITY AUDIT FAILED:');
      for (const e of errors) console.error(`  - ${e}`);
      process.exitCode = 1;
      return;
    }

    console.log(
      JSON.stringify(
        {
          status: 'PASS',
          schemaVersion: mig.schemaVersion,
          scholarshipsAudited: scholarships.length,
          universitiesAudited: universities.length,
          foreignKeyViolations: 0,
          integrity: 'ok',
        },
        null,
        2
      )
    );
  } finally {
    closeDatabase();
    rmSync(workDir, { recursive: true, force: true });
  }
}

main();
