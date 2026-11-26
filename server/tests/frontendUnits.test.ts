import assert from 'node:assert';
import { getSafeHttpUrl } from '../../src/utils/safeUrl';
import { mergeLiveUniversities } from '../../src/utils/mergeUniversities';
import {
  clearLegacyUnscopedSavedScholarships,
  getSavedScholarshipsKey,
  readSavedScholarshipIds,
  writeSavedScholarshipIds,
} from '../../src/utils/savedScholarships';
import {
  ApiClientError,
  apiGet,
  apiPost,
  clearCsrfToken,
  getCsrfToken,
  setCsrfToken,
} from '../../src/services/apiClient';
import type { ComprehensiveUniversityProfile } from '../../src/types';

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
  };
}

async function run(): Promise<void> {
  // 1. safeUrl validation
  assert.strictEqual(getSafeHttpUrl('https://cadt.edu.kh/programs?x=1'), 'https://cadt.edu.kh/programs?x=1');
  assert.strictEqual(getSafeHttpUrl('http://itc.edu.kh'), 'http://itc.edu.kh/');
  assert.strictEqual(getSafeHttpUrl('javascript:alert(1)'), null);
  assert.strictEqual(getSafeHttpUrl('data:text/html,<svg onload=alert(1)>'), null);
  assert.strictEqual(getSafeHttpUrl('ftp://files.example.org'), null);
  assert.strictEqual(getSafeHttpUrl('   '), null);

  // 2. savedScholarships account-scoped storage isolation
  const memStorage = createMemoryStorage();
  Reflect.set(globalThis, 'localStorage', memStorage);
  try {
    memStorage.setItem('csip_saved_scholarships', JSON.stringify(['legacy-leak']));
    clearLegacyUnscopedSavedScholarships();
    assert.strictEqual(memStorage.getItem('csip_saved_scholarships'), null);

    assert.strictEqual(getSavedScholarshipsKey(null), 'csip_saved_scholarships:guest');
    assert.strictEqual(getSavedScholarshipsKey('usr-42'), 'csip_saved_scholarships:usr-42');

    writeSavedScholarshipIds('usr-42', ['sch-1', 'sch-1', 'sch-2', '']);
    assert.deepStrictEqual(readSavedScholarshipIds('usr-42'), ['sch-1', 'sch-2']);
    assert.deepStrictEqual(readSavedScholarshipIds('usr-99'), []);
  } finally {
    Reflect.deleteProperty(globalThis, 'localStorage');
  }

  // 3. mergeLiveUniversities preserves honest unknown accreditation & merges updates
  const baseline = [
    {
      id: 'univ-cadt',
      name: 'CADT',
      abbr: 'CADT',
      location: 'Phnom Penh',
      type: 'Public',
      foundedYear: 2014,
      website: 'https://cadt.edu.kh',
      logo: '',
      coverImage: '',
      profileScore: { overall: 90, academicReputation: 90, industryConnection: 90, facilities: 90, graduateOutcome: 90 },
      accreditation: { governmentRecognition: 'MoEYS', status: 'Fully Accredited', isKnown: true },
      facultyCount: 3,
      majorsCount: 3,
      theoryVsPracticeRatio: '30/70',
      studentToFacultyRatio: '15:1',
      curriculumHighlight: 'Digital',
      majors: [],
      campusDescription: 'Campus',
      facilities: [],
      studentClubs: [],
      environmentHighlight: 'Tech',
      annualTuitionUSD: 600,
      totalDegreeCostUSD: 2400,
      paymentSchedule: 'Annual',
      scholarships: { hasFullScholarship: true, scholarshipNames: [], financialAidAvailable: true, requirements: '', applicationDeadline: '' },
      averageGraduateSalaryMonthlyUSD: 800,
      estimatedROIPaybackMonths: 12,
      employmentRate6Months: 92,
      averageTimeToJobMonths: 2,
      topAlumniCompanies: [],
      industryPartnerships: [],
      hasGuaranteedInternship: true,
      admissionRequirements: { gpaRequirement: '', nationalExamRequirement: '', entranceExamRequired: true, entranceExamDetails: '', englishRequirement: '' },
      applicationDifficulty: 'Competitive / High Stakes',
      importantDates: { applicationOpens: '', applicationDeadline: '', examDate: '', announcementDate: '' },
      studentFit: { bestFor: [], notRecommendedFor: [] },
      dataConfidence: { level: 'official', stars: 5, sourceLabel: 'Official', lastVerifiedDate: '2026-01-01', verificationMethod: 'Audit' },
    } as ComprehensiveUniversityProfile,
  ];
  const merged = mergeLiveUniversities(baseline, [
    {
      id: 'univ-new',
      name: 'New Regional Institute',
      abbr: 'NRI',
      location: 'Kampot',
      type: 'Public',
      foundedYear: 2022,
      website: 'https://nri.edu.kh',
      profileScore: { overall: 75, academicReputation: 75, industryConnection: 70, facilities: 75, graduateOutcome: 80 },
      annualTuitionUSD: 500,
      totalDegreeCostUSD: 2000,
      accreditation: { status: 'Not specified', isKnown: false },
    },
  ]);
  assert.strictEqual(merged.length, 2);
  const created = merged.find((u) => u.id === 'univ-new');
  assert.strictEqual(created?.accreditation.status, 'Not specified', 'Unknown accreditation must not be fabricated');

  // 4. apiClient CSRF auto-fetch, 403 rotation retry, and ApiClientError
  const originalFetch = globalThis.fetch;
  try {
    clearCsrfToken();
    const calls: Array<{ url: string; method: string; csrf: string | null }> = [];
    let postAttempts = 0;

    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = (init?.method || 'GET').toUpperCase();
      const headers = new Headers(init?.headers);
      calls.push({ url, method, csrf: headers.get('X-CSRF-Token') });

      if (url === '/api/auth/csrf') {
        const nextTok = postAttempts === 0 ? 'csrf-initial-tok' : 'csrf-rotated-tok';
        return new Response(JSON.stringify({ success: true, data: { csrfToken: nextTok } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': nextTok },
        });
      }
      if (url === '/api/test/mutate') {
        postAttempts += 1;
        if (postAttempts === 1) {
          return new Response(JSON.stringify({ success: false, code: 'CSRF_INVALID', error: 'Expired CSRF' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: true, data: { ok: true } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'csrf-after-post' },
        });
      }
      if (url === '/api/test/fail') {
        return new Response(JSON.stringify({ success: false, code: 'BAD_INPUT', error: 'Invalid input' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url === '/api/test/slow') {
        return await new Promise<Response>((_resolve, reject) => {
          const onAbort = () => reject(init?.signal?.reason || new Error('Aborted'));
          if (init?.signal?.aborted) return onAbort();
          init?.signal?.addEventListener('abort', onAbort, { once: true });
        });
      }
      return new Response(JSON.stringify({ success: true, data: { ping: 'pong' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    const ping = await apiGet<{ ping: string }>('/api/test/ping');
    assert.strictEqual(ping.ping, 'pong');

    const mutated = await apiPost<{ ok: boolean }>('/api/test/mutate', { hello: 'world' });
    assert.strictEqual(mutated.ok, true);
    assert.strictEqual(postAttempts, 2, 'apiClient must auto-retry once on CSRF_INVALID');
    assert.strictEqual(getCsrfToken(), 'csrf-after-post');

    setCsrfToken('   ');
    assert.strictEqual(getCsrfToken(), null);

    await assert.rejects(
      () => apiGet('/api/test/fail'),
      (err: unknown) => err instanceof ApiClientError && err.status === 400 && err.code === 'BAD_INPUT'
    );

    // 5. apiClient default timeout (408 REQUEST_TIMEOUT) & caller AbortSignal composition
    await assert.rejects(
      () => apiGet('/api/test/slow', { timeoutMs: 25 }),
      (err: unknown) => err instanceof ApiClientError && err.status === 408 && err.code === 'REQUEST_TIMEOUT'
    );

    const callerAbort = new AbortController();
    setTimeout(() => callerAbort.abort(new Error('USER_CANCELLED')), 15);
    await assert.rejects(
      () => apiGet('/api/test/slow', { signal: callerAbort.signal, timeoutMs: 5000 }),
      (err: unknown) => err instanceof Error && err.message === 'USER_CANCELLED'
    );
  } finally {
    globalThis.fetch = originalFetch;
    clearCsrfToken();
  }

  console.log('✓ frontendUnits.test.ts passed');
}

run().catch((err) => {
  console.error('frontendUnits.test.ts failed:', err);
  process.exit(1);
});
