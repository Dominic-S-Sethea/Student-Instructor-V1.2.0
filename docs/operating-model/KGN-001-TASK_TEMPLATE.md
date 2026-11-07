# KGN-001 — Task Template (card fields + required checks per type)

Every card, regardless of list, carries the card schema from `KGN-001-KANBAN_BOARD_DEFINITION.md`:
project_key, title, goal, acceptance_criteria, owner, dependencies, linked_pr,
evidence, status, list, type, actor_profile (plus optional blocked_reason/blocked_by).

Required checks are evaluated per type. A card leaves a list only when ALL checks for
that type are green.

## bug
- [ ] reproduction steps present in acceptance_criteria
- [ ] expected vs actual behavior stated
- [ ] severity + impact recorded
- [ ] evidence = failing log / screenshot / thread (pointer or content)
- [ ] owner is QA_SECURITY (reporting) or ENGINEER (fix); both act
- [ ] linked_pr on the fix PR

## feature
- [ ] goal is unambiguous
- [ ] acceptance_criteria each item is testable
- [ ] owner is ENGINEER
- [ ] dependencies listed (if any)
- [ ] linked_pr on the PR implementing it
- [ ] evidence = build/run output or screenshot

## research
- [ ] research question(s) stated
- [ ] method explained
- [ ] evidence = findings / data / report
- [ ] owner is EDU_RESEARCH (or CTO where architecture)
- [ ] no side-effect changes unless owner is also engineer

## foundation
- [ ] scope is infra/tooling/security (no product feature)
- [ ] acceptance_criteria measurable
- [ ] owner is CTO / DB_ARCH / DEVOPS as applicable
- [ ] evidence = setup report, build pass, scan scorecard

## governance
- [ ] decision or policy stated
- [ ] rationale recorded
- [ ] owner is CEO / CPO (decision outcome)
- [ ] evidence = decision-log entry
