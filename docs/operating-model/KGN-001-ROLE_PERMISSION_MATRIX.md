# KGN-001 — Role Permission Matrix (7 bots)

## Bot roster
| Profile | Role | Scope |
|---|---|---|
| CEO | strategy/risk | sponsorship, escalation, final approve |
| CPO | requirements/roadmap | acceptance, requirements gate |
| CTO | architecture/technical risk | architecture, foundation, security |
| DELIVERY_PM | backlog | assignment, board hygiene, status |
| ENGINEER | implementation/PR | implementation, fix |
| QA_SECURITY | independent verification | verification, bug findings |
| EDU_RESEARCH | evidence/quality | evidence, research, quality input |

## Cross-cutting rules
- No bot may approve its own change (no self-approval).
- DB/security operations require human (CEO/CPO) approval.
- ENGINEER cannot merge its own PR; QA_SECURITY review is mandatory before merge.
- EDU_RESEARCH provides evidence only; cannot approve implementation cards.
- DELIVERY_PM owns the board and assignment; it cannot self-approve its own
  assignment/board changes.
- A card may not be touched by a bot whose permission matrix cell is «denied».

## Matrix (create / update / approve / archive)
Legend: C=create, U=update, P=approve, A=archive, R=read-only, «-»=denied.

| Bot | Governance | Foundation | Features | Bugs | Research |
|---|---|---|---|---|---|
| CEO | C/U/P/A | C/U/P/A | C/U/P/A | C/U/P/A | C/U/P/A |
| CPO | C/U/P/A | C/U/P/A | C/U/P/A | C/U/P/A | C/U/P/A |
| CTO | C/U/P | C/U/P/A | U/R | U/R | C/U/P/A |
| DELIVERY_PM | C/U/A | C/U/A | C/U/A | C/U/A | C/U/R |
| ENGINEER | U/R | C/U/R | C/U/R | C/U/R | R |
| QA_SECURITY | C/U/R | C/U/R | C/U/R | C/U/P/A | C/U/P/A |
| EDU_RESEARCH | C/U/R | R | R | R | C/U/P/A |
