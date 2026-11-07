# KGN-001 — Kanban Board Definition (columns & card fields)

Version: 1.0 — initial board definition.
Owner: DELIVERY_PM (owner of backlog / board hygiene).
Source: 07-23 issue-type split adapted for Hermes Kanban.
Acceptance test: T01-01 (the document must produce the initial board state visible in Hermes Kanban).

## 1. Board layout

### Columns (status flow)
| Order | Status | Meaning |
|---|---|---|
| 1 | Backlog | Not yet picked up |
| 2 | Ready | Ready for work; assigned; pre-checks done |
| 3 | In Progress | Bot is actively working; read-before-act applies |
| 4 | In Review | Work done; awaiting review/approval |
| 5 | Verified | Evidence/QA complete; awaiting sign-off |
| 6 | Done | Closed; eligible for archive |
| — | Blocked | Off-flow; reason + owner recorded |

- A card may move to Blocked from In Progress / In Review / Verified.
- Blocked cards carry `blocked_reason` and `blocked_by` (owner of the block).
- A card is never moved back to Ready while it is In Progress / In Review / Verified.

### Lists (per 07-23 issue-type split)
| List | 07-23 anchor | Card types allowed |
|---|---|---|
| Governance | strategy / roadmap / board decisions | governance |
| Foundation | infrastructure / setup | foundation |
| Features | shipped product features | feature |
| Bugs | defect reporting | bug |
| Research | evidence / analysis / assessment | research |

## 2. Card schema
| Field | Required | Type | Description |
|---|---|---|---|
| project_key | yes | string | e.g. ENV-, SEC-, KGN-, SLK-, DEV- |
| title | yes | string | concise card title |
| goal | yes | text | what this card delivers |
| acceptance_criteria | yes | list | checkable conditions |
| owner | yes | enum | bot profile that owns the card (see role matrix) |
| dependencies | no | list | linked card IDs / PRs |
| linked_pr | no | string | GitHub PR reference |
| evidence | yes | text | observation / log / proof |
| blocked_reason | no | string | set when status = Blocked |
| blocked_by | no | string | who opened the block |
| status | yes | enum | one of the statuses above |
| list | yes | enum | Governance / Foundation / Features / Bugs / Research |
| type | yes | enum | bug / feature / research / foundation / governance |
| actor_profile | yes | enum | bot profile performing the work |

## 3. Initial board state (acceptance test T01-01)
The table below is the initial board state produced by this definition
(visible in Hermes Kanban at the time of acceptance).

| # | card id | title | status | owner |
|---|---|---|---|---|
| 1 | t_41c20902 | ENV-001 + SEC-001 + KGN-001/KGN-002 (kickoff) | ready | delivery_pm |
| 2 | t_231ccac7 | KGN-001 Kanban board definition and task template | running | delivery_pm |
| 3 | t_65d6fe11 | KGN-002 7-bot profile instructions and shared contract | blocked | cto |
| 4 | t_869b31f4 | SLK-001 Slack notifications for Kanban events | ready | cto |
| 5 | t_4806f6f4 | SEC-001 Database remediation proposal (pending owner approval) | blocked | cto |
| 6 | t_41e113c0 | ENV-001 Environment recovery: Bash repair route + toolchain policy | blocked | delivery_pm |
| 7 | t_61e892bc | DEV-001 UI/UX Preview feature | blocked | engineer |
| 8 | t_63adfcf4 | CDES Reconstruction Plan v1 | running | ceo |
| 9 | t_2267b3b4 | Recon Phase 0 — Blueprint | blocked | cpo |
| 10 | t_67c5a5c3 | Recon Phase 1 — Toolchain & dependency hardening | ready | cto |
| 11 | t_aa553ba5 | Recon Phase 2 — Data layer, privacy & UX baseline | ready | delivery_pm |
| 12 | t_be5fc68e | Recon Phase 3 — Security, observability & UX hardening | running | qa_security |
| 13 | t_5b133c39 | Recon Phase 4 — Cost, performance & scaling | done | db_arch |
| 14 | t_c07da75b | Recon Phase 5 — Deployment & monitoring | done | devops |
| 15 | t_3f3f84f4 | Recon Phase 0 — Blueprint [DISPATCHED] | done | cpo |
| 16 | t_c6c3d8f9 | Recon Phase 4 — Performance budgets + dashboard | running | performance |
| 17 | t_8fc1f24a | Recon Phase 4 — AI cost/active-user + caching | running | performance |
| 18 | t_83c74e8f | Recon Phase 4 — Load assumptions for 100k users | ready | engineer |
| 19 | t_b2f16627 | Recon Phase 4 — Final readiness gate | running | qa_security |
| 20 | t_d8babeab | Recon 2 — DB schema review + index/migration strategy | todo | database architect |
| 21 | t_2fc46ef0 | Recon 2 — Migration safety + rollback | todo | engineer |
| 22 | t_05485fc8 | Recon 2 — Backup/restore automation + test | todo | devops |
| 23 | t_750aaf20 | Recon 2 — Soft-delete + retention + consent endpoints | todo | cto bot |
| 24 | t_d402fe53 | Recon 2 — Design system + WCAG-a11y baseline | todo | ux/ui |
| 25 | t_32ed40b2 | Recon 2 — Security review of data layer | todo | qa_security |
| 26 | t_1aab1709 | Phase 0 — Onboarding + 4-Document Blueprint | todo | cpo |
| 27 | t_691f0540 | Phase 1 — Toolchain & dependency hardening | todo | cto |
| 28 | t_50a857e3 | Phase 2 — Data layer, privacy & UX baseline | todo | db_arch |
| 29 | t_47e3f31a | Phase 3 — Security, observability & UX hardening | todo | qa_security |
| 30 | t_bf398f30 | Phase 4 — Cost, performance & scaling | todo | performance |
| 31 | t_3908d080 | Phase 5 — Deployment & monitoring | todo | devops |
| 32 | t_39e916c2 | Scaling path decision — stay SQLite vs upgrade | todo | ceo |
| 33 | t_0a854aa7 | UX/UI phase placement decision | todo | cpo |

Total: 33 cards.

## 4. Conventions
- GitHub is the code truth; Hermes Kanban is the task layer (OWNER decision 2026-10-27).
- No item is marked Ready while work is In Progress / In Review / Verified.
- DELIVERY_PM performs board hygiene (archive of Done cards); archive is not a
  card status change visible to bots.
- The role-permission matrix that governs who may create / update / approve /
  archive lives in `KGN-001-ROLE_PERMISSION_MATRIX.md`.
- The per-type template (required checks) lives in `KGN-001-TASK_TEMPLATE.md`.
