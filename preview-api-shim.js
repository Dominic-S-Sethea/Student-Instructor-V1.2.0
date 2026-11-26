(function () {
  'use strict';
  const origFetch = window.fetch.bind(window);
  const STORE_KEY = 'cdes_gh_pages_preview_state_v1';
  const DATA = window.__CDES_PREVIEW_DATA__ || { scholarships: [], universities: [] };
  const CSRF = 'preview-csrf-token-static';

  function defaultChecklist() {
    return [
      { id: 'chk-1', label: 'Verify official eligibility & deadline', done: false },
      { id: 'chk-2', label: 'Prepare Bac II / university transcripts', done: false },
      { id: 'chk-3', label: 'Draft personal statement & study plan', done: false },
      { id: 'chk-4', label: 'Request 2 academic recommendation letters', done: false },
    ];
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      session: null,
      users: {},
      saved: {},
      notifications: {},
      education: {},
      consent: {},
    };
  }

  function saveState(st) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); } catch {}
  }

  function jsonRes(body, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF },
    });
  }

  function defaultConsent(userId) {
    return {
      studentId: userId,
      isMinor: false,
      parentalConsentVerified: false,
      parentVerificationStatus: 'unverified',
      parentEmail: null,
      allowAnalyticsTracking: false,
      allowResearchInclusion: false,
      allowAiMemory: false,
      consentStatus: 'pending',
      anonymizedResearchId: 'anon-' + userId.slice(-6),
      consentDate: new Date().toISOString(),
      withdrawnAt: null,
      blockedReasons: [],
    };
  }

  function hydrateSaved(st, userId) {
    const map = st.saved[userId] || {};
    return Object.values(map).map((entry) => ({
      ...entry,
      scholarship: DATA.scholarships.find((s) => s.id === entry.scholarshipId) || null,
    }));
  }

  async function handleApi(urlStr, init) {
    const parsed = new URL(urlStr, window.location.origin);
    const path = parsed.pathname;
    const method = ((init && init.method) || 'GET').toUpperCase();
    let body = {};
    if (init && typeof init.body === 'string' && init.body.trim()) {
      try { body = JSON.parse(init.body); } catch {}
    }

    const st = loadState();
    const uid = st.session && st.session.user ? st.session.user.id : null;

    if (path === '/api/health' || path === '/api/health/ready') {
      return jsonRes({ status: 'ok', ready: true, aiEnabled: false, database: { engine: 'StaticPreview', schemaVersion: 12, integrity: 'ok' } });
    }
    if (path === '/api/auth/csrf') {
      return jsonRes({ success: true, data: { csrfToken: CSRF } });
    }
    if (path === '/api/auth/session') {
      if (!uid || !st.users[uid]) {
        return jsonRes({ success: true, data: { authenticated: false, user: null, profile: null, education: [], csrfToken: CSRF } });
      }
      const u = st.users[uid];
      return jsonRes({ success: true, data: { authenticated: true, user: u.user, profile: u.profile, education: st.education[uid] || [], csrfToken: CSRF } });
    }
    if (path === '/api/auth/register' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || 'Student').trim();
      if (!email || !body.password || String(body.password).length < 8) {
        return jsonRes({ success: false, error: 'Please provide a valid email and an 8+ character password.' }, 400);
      }
      const id = 'usr-preview-' + Date.now();
      const user = { id, email, role: body.role === 'organization' ? 'organization' : 'student', status: 'active', created_at: new Date().toISOString() };
      const profile = { id: 'prof-' + id, user_id: id, name, education_level: body.education_level || 'Grade 12', language: 'en', updated_at: new Date().toISOString() };
      st.users[id] = { user, profile, password: String(body.password) };
      st.session = { user };
      st.education[id] = st.education[id] || [];
      st.saved[id] = st.saved[id] || {};
      st.consent[id] = defaultConsent(id);
      st.notifications[id] = [
        {
          id: 'notif-' + Date.now(),
          userId: id,
          category: 'system',
          title: 'Welcome to CDES Student Instructor',
          body: `Your preview account (${email}) is ready. Explore verified scholarships, bookmark deadlines, and control your privacy settings.`,
          actionTab: 'scholarships',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ];
      saveState(st);
      return jsonRes({ success: true, data: { user, profile, education: st.education[id], csrfToken: CSRF } }, 201);
    }
    if (path === '/api/auth/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const found = Object.values(st.users).find((entry) => entry.user.email === email);
      if (!found) {
        return jsonRes({ success: false, error: 'No preview account found for that email yet — switch to Register to create one instantly.' }, 401);
      }
      st.session = { user: found.user };
      saveState(st);
      const fid = found.user.id;
      return jsonRes({ success: true, data: { user: found.user, profile: found.profile, education: st.education[fid] || [], csrfToken: CSRF } });
    }
    if ((path === '/api/auth/logout' || path === '/api/auth/logout-all') && method === 'POST') {
      st.session = null;
      saveState(st);
      return jsonRes({ success: true });
    }

    // Universities
    if (path === '/api/universities' && method === 'GET') {
      return jsonRes({ success: true, data: DATA.universities });
    }
    if (path.startsWith('/api/universities/') && method === 'GET') {
      const id = decodeURIComponent(path.slice('/api/universities/'.length));
      const found = DATA.universities.find((u) => u.id === id);
      return found ? jsonRes({ success: true, data: found }) : jsonRes({ success: false, error: 'Not found' }, 404);
    }

    // Saved Scholarships
    if (path === '/api/scholarships/saved' && method === 'GET') {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      return jsonRes({ success: true, saved: hydrateSaved(st, uid) });
    }
    if (path === '/api/scholarships/saved' && method === 'POST') {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      const schId = String(body.scholarshipId || '');
      st.saved[uid] = st.saved[uid] || {};
      const now = new Date().toISOString();
      const entry = {
        id: 'sav-' + schId,
        userId: uid,
        scholarshipId: schId,
        status: body.status || 'saved',
        targetNote: body.targetNote || '',
        checklist: Array.isArray(body.checklist) ? body.checklist : defaultChecklist(),
        createdAt: now,
        updatedAt: now,
      };
      st.saved[uid][schId] = entry;
      saveState(st);
      return jsonRes({ success: true, data: { ...entry, scholarship: DATA.scholarships.find((s) => s.id === schId) || null } }, 201);
    }
    if (path === '/api/scholarships/saved/sync' && method === 'POST') {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      st.saved[uid] = st.saved[uid] || {};
      const ids = Array.isArray(body.scholarshipIds) ? body.scholarshipIds : [];
      const now = new Date().toISOString();
      for (const schId of ids) {
        if (!st.saved[uid][schId] && DATA.scholarships.some((s) => s.id === schId)) {
          st.saved[uid][schId] = { id: 'sav-' + schId, userId: uid, scholarshipId: schId, status: 'saved', targetNote: '', checklist: defaultChecklist(), createdAt: now, updatedAt: now };
        }
      }
      saveState(st);
      return jsonRes({ success: true, saved: hydrateSaved(st, uid) });
    }
    if (path.startsWith('/api/scholarships/saved/')) {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      const schId = decodeURIComponent(path.slice('/api/scholarships/saved/'.length));
      st.saved[uid] = st.saved[uid] || {};
      if (method === 'DELETE') {
        delete st.saved[uid][schId];
        saveState(st);
        return jsonRes({ success: true });
      }
      if (method === 'PATCH') {
        const cur = st.saved[uid][schId] || { id: 'sav-' + schId, userId: uid, scholarshipId: schId, status: 'saved', targetNote: '', checklist: defaultChecklist(), createdAt: new Date().toISOString() };
        const updated = { ...cur, ...(body.status ? { status: body.status } : {}), ...(body.targetNote !== undefined ? { targetNote: body.targetNote } : {}), ...(Array.isArray(body.checklist) ? { checklist: body.checklist } : {}), updatedAt: new Date().toISOString() };
        st.saved[uid][schId] = updated;
        saveState(st);
        return jsonRes({ success: true, data: { ...updated, scholarship: DATA.scholarships.find((s) => s.id === schId) || null } });
      }
    }

    // Scholarships Catalog
    if (path === '/api/scholarships' && method === 'GET') {
      const q = (parsed.searchParams.get('q') || '').trim().toLowerCase();
      const region = parsed.searchParams.get('region');
      const degree = parsed.searchParams.get('degree');
      const field = parsed.searchParams.get('field');
      const funding = parsed.searchParams.get('funding');
      const cat = parsed.searchParams.get('studentCategory');
      const onlyVerified = parsed.searchParams.get('onlyVerified') === 'true';
      const sortBy = parsed.searchParams.get('sortBy') || 'latest_updated';

      let list = DATA.scholarships.slice();
      if (q) {
        list = list.filter((s) => `${s.name} ${s.nameKm || ''} ${s.provider} ${s.country} ${s.overview} ${(s.tags || []).join(' ')}`.toLowerCase().includes(q));
      }
      if (region && region !== 'all') list = list.filter((s) => s.region === region || s.country === region);
      if (degree && degree !== 'all') list = list.filter((s) => Array.isArray(s.degreeLevel) && s.degreeLevel.includes(degree));
      if (field && field !== 'all') list = list.filter((s) => Array.isArray(s.fieldsOfStudy) && s.fieldsOfStudy.includes(field));
      if (funding && funding !== 'all') list = list.filter((s) => s.fundingType === funding);
      if (cat && cat !== 'all') list = list.filter((s) => Array.isArray(s.eligibleCategories) && s.eligibleCategories.includes(cat));
      if (onlyVerified) list = list.filter((s) => s.verificationStatus === 'Verified Official');
      if (sortBy === 'fully_funded') list.sort((a, b) => (b.fundingType === 'Fully funded' ? 1 : 0) - (a.fundingType === 'Fully funded' ? 1 : 0));
      if (sortBy === 'deadline_approaching') list.sort((a, b) => String(a.deadline || '9999').localeCompare(String(b.deadline || '9999')));

      return jsonRes({
        success: true,
        totalCount: list.length,
        scholarships: list,
        metrics: {
          totalScholarships: DATA.scholarships.length,
          verifiedScholarships: DATA.scholarships.filter((s) => s.verificationStatus === 'Verified Official').length,
          pendingSubmissions: 0,
          pendingReports: 0,
        },
      });
    }
    if (path.startsWith('/api/scholarships/') && method === 'GET') {
      const id = decodeURIComponent(path.slice('/api/scholarships/'.length));
      const found = DATA.scholarships.find((s) => s.id === id);
      return found ? jsonRes({ success: true, scholarship: found }) : jsonRes({ success: false, error: 'Not found' }, 404);
    }

    // Notifications
    if (path === '/api/users/notifications' && method === 'GET') {
      if (!uid) return jsonRes({ success: true, data: { notifications: [], unreadCount: 0 } });
      const list = st.notifications[uid] || [];
      return jsonRes({ success: true, data: { notifications: list, unreadCount: list.filter((n) => !n.isRead).length } });
    }
    if (path === '/api/users/notifications/read-all' && method === 'POST') {
      if (uid && st.notifications[uid]) {
        st.notifications[uid].forEach((n) => { n.isRead = true; });
        saveState(st);
      }
      return jsonRes({ success: true });
    }
    if (path.startsWith('/api/users/notifications/') && path.endsWith('/read')) {
      const nid = decodeURIComponent(path.slice('/api/users/notifications/'.length, -'/read'.length));
      if (uid && st.notifications[uid]) {
        const item = st.notifications[uid].find((n) => n.id === nid);
        if (item) item.isRead = true;
        saveState(st);
      }
      return jsonRes({ success: true });
    }

    // Profile & Education
    if (path === '/api/users/profile') {
      if (!uid || !st.users[uid]) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      if (method === 'PUT') {
        st.users[uid].profile = { ...st.users[uid].profile, ...body, updated_at: new Date().toISOString() };
        saveState(st);
      }
      return jsonRes({ success: true, data: { profile: st.users[uid].profile, education: st.education[uid] || [] } });
    }
    if (path === '/api/users/education' && method === 'POST') {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      const entry = { id: 'edu-' + Date.now(), student_id: uid, institution: body.institution || '', degree: body.degree || '', start_date: body.start_date || null, end_date: body.end_date || null, achievements: body.achievements || null };
      st.education[uid] = [entry, ...(st.education[uid] || [])];
      saveState(st);
      return jsonRes({ success: true, data: entry }, 201);
    }
    if (path.startsWith('/api/users/education/') && method === 'DELETE') {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      const eid = decodeURIComponent(path.slice('/api/users/education/'.length));
      st.education[uid] = (st.education[uid] || []).filter((e) => e.id !== eid);
      saveState(st);
      return jsonRes({ success: true, data: { id: eid } });
    }

    // Privacy Consent & Erasure
    if (path === '/api/privacy/consent') {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      let c = st.consent[uid] || defaultConsent(uid);
      if (method === 'POST') {
        if (body.withdrawAll) {
          c = { ...c, allowAnalyticsTracking: false, allowResearchInclusion: false, allowAiMemory: false, consentStatus: 'withdrawn', withdrawnAt: new Date().toISOString() };
        } else {
          const isMinor = typeof body.isMinor === 'boolean' ? body.isMinor : c.isMinor;
          const blocked = isMinor && c.parentVerificationStatus !== 'verified';
          c = {
            ...c,
            isMinor,
            allowAnalyticsTracking: blocked ? false : (typeof body.allowAnalyticsTracking === 'boolean' ? body.allowAnalyticsTracking : c.allowAnalyticsTracking),
            allowResearchInclusion: blocked ? false : (typeof body.allowResearchInclusion === 'boolean' ? body.allowResearchInclusion : c.allowResearchInclusion),
            allowAiMemory: blocked ? false : (typeof body.allowAiMemory === 'boolean' ? body.allowAiMemory : c.allowAiMemory),
            blockedReasons: blocked ? ['Minor optional collection disabled pending owner guardian verification.'] : [],
          };
          const anyOn = c.allowAnalyticsTracking || c.allowResearchInclusion || c.allowAiMemory;
          c.consentStatus = anyOn ? 'granted' : 'pending';
        }
        st.consent[uid] = c;
        saveState(st);
      }
      return jsonRes({ success: true, data: c });
    }
    if (path === '/api/privacy/parent-verify' && method === 'POST') {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      const c = { ...(st.consent[uid] || defaultConsent(uid)), isMinor: true, parentEmail: body.parentEmail || null, parentVerificationStatus: 'pending_owner_verification', allowAnalyticsTracking: false, allowResearchInclusion: false, allowAiMemory: false };
      st.consent[uid] = c;
      saveState(st);
      return jsonRes({ success: true, data: c });
    }
    if (path === '/api/privacy/erasure' && method === 'POST') {
      if (!uid) return jsonRes({ success: false, error: 'Unauthorized' }, 401);
      const count = Object.keys(st.saved[uid] || {}).length + (st.notifications[uid] || []).length;
      st.saved[uid] = {};
      st.notifications[uid] = [];
      const c = { ...(st.consent[uid] || defaultConsent(uid)), allowAnalyticsTracking: false, allowResearchInclusion: false, allowAiMemory: false, consentStatus: 'withdrawn', withdrawnAt: new Date().toISOString() };
      st.consent[uid] = c;
      saveState(st);
      return jsonRes({ success: true, message: 'All optional telemetry, AI memory, and research records erased.', erased: { saved: count }, totalRowsErased: count, data: c });
    }

    // Decision Engine Quiz
    if (path === '/api/decision/evaluate' && method === 'POST') {
      const interests = Array.isArray(body.interests) ? body.interests.join(', ') : '';
      const topUnivs = DATA.universities.slice(0, 3).map((u, idx) => ({
        univId: u.id,
        univName: u.name,
        univAbbr: u.abbr,
        profileScore: 92 - idx * 4,
        annualTuitionUSD: u.annualTuitionUSD || 800,
        scholarshipMatch: u.abbr === 'CADT' ? 'CADT MPTC Digital Technology Scholarship' : u.abbr === 'ITC' ? 'ITC State Quota (Bourse d’État)' : 'Merit & Partner Grants',
        curriculumStyle: u.type === 'Public' ? 'Public STEM / National Track' : 'International English Track',
        whyFit: `Strong alignment with your interests (${interests || 'STEM & Digital'}) and ${body.budgetTier || 'balanced'} budget tier.`,
      }));
      return jsonRes({
        success: true,
        mode: 'rule_based',
        isEstimate: true,
        persisted: false,
        sources: ['CDES Cambodia University Catalog (Static Preview)'],
        unavailableData: [],
        recommendations: {
          topMajor: 'Computer Science & Artificial Intelligence',
          alternativeMajor: 'Data Science & Digital Engineering',
          fitReason: `Based on your selected interests (${interests || 'Technology & Engineering'}), math strength (${body.mathAbility || 'Solid'}), work style (${body.workStyle || 'Collaborative'}), and goal (${body.careerGoal || 'Tech Leadership'}), CADT and ITC offer strong curriculum-to-career alignment in Cambodia.`,
          recommendedUniversities: topUnivs,
          roiAnalysis: {
            isEstimate: true,
            estimateNote: 'Illustrative estimate based on published Cambodian public/private tuition ranges; verify current fees directly with each admissions office.',
            estimatedDegreeCostUSD: 3200,
            projectedMonthlySalaryUSD: 850,
            paybackMonths: 14,
            financialVerdict: 'High ROI — especially when paired with MPTC or State Quota scholarship support.',
          },
          actionChecklist: [
            { stepNumber: 1, title: 'Compare CADT vs ITC Entrance Exam Dates', deadline: 'Before Bac II Results', instructions: 'Review Math, Logic, and English exam syllabi on official university portals.', completed: false },
            { stepNumber: 2, title: 'Bookmark Scholarship Deadlines', deadline: 'This Week', instructions: 'Save CADT MPTC, ITC State Quota, and MEXT/GKS targets in the Scholarships tab.', completed: false },
          ],
        },
      });
    }

    // Study Advisor deterministic offline chat
    if (path === '/api/advisor/chat' && method === 'POST') {
      const prompt = String(body.userPrompt || '');
      const lower = prompt.toLowerCase();
      let reply = '### Study Planning Guide (Static Preview Offline Mode)\n\n';
      if (lower.includes('cadt') || lower.includes('itc')) {
        reply += '**CADT vs ITC Comparison:**\n- **CADT**: Project-driven Software Engineering, Data Science & AI tracks; flagship **MPTC National Digital Technology Scholarship** covers full tuition for top Bac II Grade A/B graduates.\n- **ITC**: 5-year engineering model (**2-year Tronc Commun + 3-year Engineering Cycle**) with State Quota (*Bourse d’État*) and French double-degree exchanges.\n\nAlways confirm current entrance exam windows directly on [CADT](https://www.cadt.edu.kh) and [ITC](https://itc.edu.kh).';
      } else if (lower.includes('scholarship') || lower.includes('chevening') || lower.includes('mext') || lower.includes('fulbright')) {
        reply += '**Verified Scholarship Options for Cambodian Students:**\n- **Domestic Bachelor**: CADT MPTC Digital Technology Scholarship, ITC French Engineering & State Quota Grant, AUPP Academic Merit.\n- **International Bachelor**: MEXT Japan, GKS South Korea, Singapore ASEAN Undergraduate, Chinese Government CSC.\n- **Postgraduate**: Chevening UK, Fulbright USA, Australia Awards, Erasmus Mundus, DAAD EPOS.';
      } else {
        reply += `You asked: *"${prompt.slice(0, 160)}"*\n\n- Use the **Universities** tab to compare CADT, ITC, RUPP, UHS, AUPP, CamEd, and Paragon.U.\n- Use the **Scholarships** tab to filter all **12 verified programs** and save checklists.\n- Run the **2-Minute Major Fit Quiz** under **Explore** for personalized comparisons.`;
      }
      return jsonRes({
        success: true,
        mode: 'deterministic_offline',
        providerStatus: 'disabled',
        isEstimate: false,
        persisted: false,
        sources: ['CDES Verified Catalog'],
        retrievedSources: [
          { id: 'cadt', title: 'CADT Academic & MPTC Scholarship Guide', category: 'University', source: 'CDES Catalog', url: 'https://www.cadt.edu.kh/scholarship/' },
          { id: 'itc', title: 'ITC Engineering & Tronc Commun Guide', category: 'University', source: 'CDES Catalog', url: 'https://itc.edu.kh/admissions/' },
        ],
        unavailableData: [],
        reply,
        source: 'CDES Deterministic Local Knowledge',
        recommendedMajors: ['Computer Science', 'Data Science & AI', 'Telecommunications Engineering'],
        recommendedSkills: ['Python', 'Discrete Math', 'Academic English'],
        suggestedMentors: [],
        suggestedQuestions: [
          'Compare Computer Science at CADT vs ITC',
          'Which scholarships are fully funded for Cambodian students?',
          'What should Grade 12 students prepare before Bac II?',
        ],
      });
    }

    // Growth Memory fallback
    if (path.startsWith('/api/memory')) {
      return jsonRes({ success: true, data: { enabled: false, turnCounter: 0, nudgeInterval: 10, userDoc: '', memoryDoc: '', facts: [] } });
    }

    // Analytics, Community, Learning, Avatar graceful preview responses
    if (path.startsWith('/api/analytics')) return jsonRes({ success: true });
    if (path.startsWith('/api/community') || path.startsWith('/api/learning') || path.startsWith('/api/avatar')) {
      return jsonRes({ success: true, data: [], items: [], posts: [], communities: [], mentors: [], events: [], projects: [], subjects: [], contents: [] });
    }

    return jsonRes({ success: true, data: null });
  }

  window.fetch = function (input, init) {
    const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
    if (urlStr.startsWith('/api/') || urlStr === '/api') {
      return handleApi(urlStr, init);
    }
    return origFetch(input, init);
  };
})();
