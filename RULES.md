# RULES.md — AI Agent Behaviour, File Limits & Type Safety Standards

> **Governing document for AI-assisted development** on the **CDES Student-Instructor
> V1.2.0** platform (TypeScript/Node + React + Express, plus Python helper scripts).
> Owner: **CTO**. Reviewed by: **QA_SECURITY**, **ENGINEER**, **EDU_RESEARCH**.

This repository is the CDES Student-Instructor platform. `RULES.md` defines how AI
agents behave when authoring, editing, reviewing, and handing off code; the
file-size/line limits that apply per module; the type-safety requirements (strict
TypeScript and Python typing, no `any`, generics usage); the linting/formatting
rules; and the CI gate thresholds that every change must pass.

**Conventions note.** The canonical source of truth for the **TypeScript side** is
`server/` (Express backend, tests, types, seeds) and `src/` (React frontend). The
**Python side** is used for CI helper scripts and maintenance tooling; Python rules
in §4.2 therefore apply to `.py` files, and §6.4 adds the Python CI steps.

---

## 1. Baseline change & reactivity policy

1. **Clock the baseline first.** Before starting work, the responsible agent records
   the baseline state: `git status`, uncommitted diff, open cards, and any blocking
   reviews. No edit is started until the baseline is captured.
2. **Never emit a past wave as if it were complete.** When an agent's prior output
   was interrupted or failed, the agent must re-derive state from the repository and
   the task record — never trust the truncated output to be finished.
3. **Write small, verify small.** Prefer a chain of small, verified commits over a
   single large, unverifiable one. Each commit must compile/typecheck and, where
   relevant, keep a green gate locally before the next commit.
4. **No guessed credentials.** Never read, print, log, or commit secrets.
   Credentials must come only from environment variables or GitHub Secrets. See
   `docs/SECRETS.md`.
5. **Respect the branch contract.** Work on feature branches; merge only via PR to
   `main` and only when all gates are green.

---

## 2. AI agent behaviour guidelines

### 2.1 Prompt templates

When an AI agent is handed a card, it must use the following **card brief template**
and must not begin implementation without it:

```markdown
## Card brief (pre-implementation)
- project_key: <e.g. KGN-/SEC-/ENV->
- title / goal (from card): <quote verbatim>
- acceptance_criteria: <list, each item testable>
- owner / actor_profile: <from card>
- dependencies: <cards or PRs>
- linked_pr: <none until PR exists>
- evidence: <fill after verification>
- constraints_from_RULES: <file limits / typing / lint thresholds applicable>
- environment: <repo root, branch, node version, DB path>
- open_questions: <list> (must be empty before coding)
```

When the brief is missing fields, the agent must ask for them rather than inventing
them. If a field is ambiguous, the agent must **pick the option a senior engineer
would choose** and record the choice in the card's context for later review.

### 2.2 Review gates

Every change goes through the following mandatory gates, in order. A card may leave
a list only when **all** gates pass:

| Gate | Who | What must be true |
|---|---|---|
| `self-review` | ENGINEER (agent) | Agent re-reads its own diff; no TODOs left; tests added for new behaviour |
| `peer-review` | QA_SECURITY | Independent review; no self-approval; comments resolved |
| `foundation-gate` | CTO (or DB_ARCH / DEVOPS) | Only for `foundation` cards (infra/tooling/security); CTO decides |
| `merge-gate` | GitHub PR rules | ≥1 approved review, up-to-date with `main`, all CI green, DCO signed |

No bot may approve its own change (see `KGN-001-ROLE_PERMISSION_MATRIX.md`).
`ENGINEER` cannot merge its own PR; `QA_SECURITY` review is mandatory before merge.
`EDU_RESEARCH` provides evidence only and may not approve implementation cards.

### 2.3 Handoff protocols

When a card is handed off between agents (or from agent to human), it must carry a
handoff record:

```markdown
## Handoff record
- from / to
- work completed (commits, tests run, local evidence)
- what remains (unfinished acceptance items, blockers)
- evidence links (local logs, screenshots, terminal output)
- rollback plan (how to revert)
- open questions for the next agent
```

Handoff artifacts live in the card's `evidence` field (pointer, not content) and in
committed test output. **No raw PII, student data, or credentials** may be attached
or committed. Secrets are redacted to `[REDACTED]` and escalated per the security
threshold in the operating model.

### 2.4 Reactivity: restart & interruption

- If a long-running agent is interrupted, the agent records its in-progress state
  and any local artifacts (tests, coverage, typecheck logs) to the card's
  `evidence`.
- On restart, the agent **re-reads** the task, the card, and the repository state —
  it does not re-write files it no longer owns.
- The agent must never silently drop a verified change; if a change is removed, the
  card records what was reverted and why.

---

## 3. File-size / line limits per module

Limits below are measured from the current codebase. When the repository grows,
re-measure and update this section. A value of `—` means "not applicable / managed
by tooling".

| Directory / file family | Limit | Rationale |
|---|---|---|
| `server/**/*.ts` (backend modules) | **≤ 400 lines** per file; **≤ 80 lines** per function; no function > 120 | Split by responsibility (controller / service / repository) |
| `src/**/*.tsx` (React components) | **≤ 400 lines** per file; **≤ 80 lines** per component | Keep a component single-purpose |
| `server/tests/**/*.ts` (unit/integration tests) | **≤ 250 lines** per file | One concern per test file |
| Top-level `server/types/**/*.ts` | **≤ 400 lines** | Types stay co-located with consumers |
| `*.py` (Python modules) | **≤ 400 lines** per file; **≤ 100 lines** per function | Matches ruff / mypy conventions |
| JSON / JSON config (`*.json`) | **≤ 300 lines** (e.g. `tsconfig.json`) | Readability & review |
| `.lock` files (`package-lock.json`, `bun.lock`) | **Excluded** (generated/managed by tooling) | Not authored by agents |
| Disk file size | **≤ 256 KB** for authored source; lockfiles excluded | Catch accidentally huge files |
| Seed / fixture data (`server/data`, `src/data`) | **≤ 800 lines** per file | Split by domain |

**Exceptions.** A larger file blocks the gate unless (a) the agent records a
justification in the card, and (b) the CTO or the owning architect approves the
exception in the decision log. Typical splits: by route, by entity, by feature,
by responsibility.

**Enforcement.** `npm run lint` (which runs `tsc --noEmit`) is the typecheck gate;
the lint step also warns on files exceeding the line limits where the linter
covers it. The CI `build` step catches files that cannot compile.

---

## 4. Type-safety requirements

### 4.1 TypeScript / React (server + src)

Configuration is defined in `tsconfig.json` and `tsconfig.server.json`. The
**whole-project** `tsc --noEmit` (run as `npm run lint`) must pass with **zero
errors**.

1. **Strict mode is mandatory.** `strict: true`, `noImplicitAny: true`,
   `noImplicitThis: true`, `noUncheckedIndexedAccess: true`,
   `noFallthroughCasesInSwitch: true`, `exactOptionalPropertyTypes: true`.
2. **No `any`.**
   - Explicit `any` is forbidden. Use `unknown` when the type is genuinely unknown;
     narrow with type guards, literal checks, or `typeof`/`Array.isArray`.
   - `as any` and `as unknown as T` are forbidden unless a **CTO-approved**
     exception is recorded in the decision log. Prefer a precise type or a type
     guard.
3. **No `any[]` for typed containers.** Use `ReadonlyArray<T>` / `Array<T>` and let
   inference work; if a runtime array must be asserted, use `Array<T>` with a
   validation step, not `any[]`.
4. **Interface vs type alias.**
   - `interface` for object shapes, especially those that may be extended
     (e.g. request/response models, entities).
   - `type` for unions, tuples, primitives, and mapped types.
5. **Exported functions** must declare an explicit return type. Declarations
   without implementation (`declare function`, `interface` bodies) must be
   accompanied by an implementation or an `// TODO` with an owner.
6. **No `console.error` for flow control.** Use a logger or throw a typed error;
   errors are caught at boundaries (controllers / `main`).
7. **Tests** (`server/tests/**`) use `tsx` and the same strict settings; imported
   test utilities must be type-safe (no `any` in test factories).
8. **Python** (see §4.2) is separate; `.py` files are not compiled by `tsc`.

### 4.2 Python (CI helpers, maintenance tooling)

1. Enable future annotations: `from __future__ import annotations`.
2. Run with `mypy --strict` in CI (`npm run lint` does not cover Python).
3. **No `Any`** from `typing`. Use `TypedDict` for dicts with fixed keys,
   `dataclasses` for structured data, `Protocol` for duck-typed interfaces.
4. **No `dict[str, Any]` / `list[Any]`** without a documented justification in the
   decision log. Prefer `dict[str, str]` / `list[str]` / a typed model.
5. **Explicit return types** on all public functions; `None` when the function
   intentionally returns nothing.
6. **Type guard functions** for narrowing; never `cast()` as a convenience.
7. Formatting: `ruff format` (line-length 100, target `py312`).

### 4.3 Generics & reusable code

1. **Use generics for containers and transformers.** Example shape:

   ```ts
   function mapValues<K extends string, V, W>(obj: Record<K, V>, fn: (v: V, k: K) => W): Record<K, W>
   ```

2. **Constrain type parameters** with `extends` so callers get useful inference
   and the compiler can prove properties.
3. **Avoid overloads** when a single generic signature covers all cases; prefer
   overload only when inputs genuinely differ in shape.
4. **Never introduce a new generic parameter to dodge a type error.** If a
   generic is not meaningful, fix the underlying type.
5. **Correctness over `any`.** A type-safe implementation that compiles is always
   preferred to an `any` that "works" today.

---

## 5. Linting & formatting rules

All agents must run the pre-commit checks listed here before handoff. CI enforces
the same checks.

### 5.1 TypeScript / React / Node

| Tool | Run | Purpose |
|---|---|---|
| `eslint` | `npm run lint` (= `tsc --noEmit` in this repo) | `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`; errors → blocking |
| `prettier` | `npx prettier --check .` | Code style: single quote, trailing commas (`all`), print width 100, semi `true`, tab width 2 |
| pre-commit | `husky` + `lint-staged` | Runs ESLint (fix) + Prettier (write) on staged TS/TSX/JS files only |

- `eslint --fix` must be run before handoff; residuals are blocking.
- Warnings from Prettier/ESLint do **not** block on `main`, but they block on
  feature branches **unless** the agent records rationale in the card.

### 5.2 Python

| Tool | Run | Purpose |
|---|---|---|
| `ruff` | `ruff check --fix . && ruff format .` | Lint + format; line-length 100, target `py312` |
| `mypy` | `mypy --strict **/*.py` | Type checking; errors → blocking |

### 5.3 Git hygiene

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`,
  `test:`, `docs:`, `ci:`). The PR title must match the commit subject.
- Generated artifacts (`dist/`, `build/`, `.next/`, `coverage/`) are never committed
  (see `.gitignore`).
- Large blobs, lockfiles are excluded from line limits but must not be hand-edited.

---

## 6. CI gate thresholds

All thresholds are enforced on GitHub Actions (`.github/workflows/ci.yml`) on every
PR and on `main` pushes. A PR may only merge when **every** gate below is green.

### 6.1 Job gates

| Gate | Command / check | Pass threshold |
|---|---|---|
| `install` | `npm ci` | `package-lock.json` present, `node_modules` installed |
| `lint+typecheck` | `npm run lint` → `tsc --noEmit` | **0 errors** across the whole project |
| `build` | `vite build` + `esbuild server.ts` → `dist/server.cjs` | Build succeeds; artifact uploaded |
| `test` | `tsx server/tests/backend.test.ts` + `secretScan.test.ts` | All tests pass |
| `coverage` | `npm run test:coverage` | **≥ 80% lines**, **≥ 80% statements**, **≥ 75% functions**, **≥ 75% branches** (overall); a new file must not reduce overall coverage by more than 5 points |
| `verify-start` | `npm start` → `/api/health` 200 | `status=ok`, `aiEnabled=false`, `database` present, "Database initialized and migrations verified" in log, process stays up ≥ 30 s |
| `staging-deploy` | mirrors prod build | `npm start` on `staging` → `/api/health` 200 with `aiEnabled=false` |
| `dependency-audit` (hard) | `npm audit --omit=dev` | **No high/critical** advisories (`audit-level=high` in `.npmrc`) |
| `dependency-audit` (regression) | `node .github/scripts/check-audit-baseline.cjs` | Current high/critical count **≤** committed `audit-baseline.json` (baseline: 4 high, 0 critical). New findings → fail |
| `secret-scan` | gitleaks | **No secrets** at severity `CRITICAL`, min-confidence `80`, `--no-git-ignore` |

### 6.2 PR / branch gates

1. **At least one approved review** from `QA_SECURITY`; no self-approval.
2. PR is **up-to-date with `main`** (rebase/merge without conflicts).
3. **DCO sign-off** on every commit (`Signed-off-by` trailer).
4. **All gates in §6.1 green** on the PR.
5. **No merge on embargo** — the change may only merge after the board records it
   as `In Review` or `Verified`.
6. `QA_SECURITY` stamp is required on the PR even when the change is tooling-only.

### 6.3 Baseline audit note

The committed `audit-baseline.json` is refreshed **only on `main` pushes**
(`baseline-sync` job). Pull requests are measured against main's committed
snapshot and must **not** rewrite it.

---

## 7. Exceptions, escalations & maintenance

1. **Deviation** — any deviation from §3–§6 must be recorded as a CTO decision in
   the decision log with rationale and expiry (if temporary).
2. **Security threshold** — anything containing actual student data, credentials, or
   tokens is escalated immediately to the security owner and redacted to
   `[REDACTED]` in all records.
3. **Maintenance** — this document is reviewed at every major release and when the
   toolchain changes (TypeScript version, lint runner, CI provider). The owner is
   the **CTO**.

---

*Generated for the CDES Student-Instructor operating team by the ENGINEER profile.
Repo root: `Student-Instructor-V1.2.0`.*
