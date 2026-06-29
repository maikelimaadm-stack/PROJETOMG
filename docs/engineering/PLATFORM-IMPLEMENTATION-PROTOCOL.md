# PLATFORM IMPLEMENTATION PROTOCOL (PIP)

**Status:** Official — Mandatory implementation process  
**Version:** 1.2.0  
**Effective date:** 2026-06-29  
**Program:** 0.7  
**Decision:** D-018, D-019 (RHP), **D-028 (Long-term impact gate)**  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md) and [Permanent Governance Directive](../constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md); operational companion to [README_AI.md](../../README_AI.md)

---

## 1. Purpose

This document is the **single official protocol** for every MAK Gestão implementation mission — human or AI.

Structural documentation (Programs 0–0.6) is complete. All future work that touches code, schema, gates, or platform behavior **must** follow the 10-phase lifecycle defined here.

**Binding rule:** No mission is valid without completing all applicable phases. Skipping a phase requires explicit written exception in ENGINEERING-JOURNAL with D-register reference if architectural.

**Repository Health Protocol (RHP):** Every mission **start** and **end** must execute [§10 RHP](#10-repository-health-protocol-rhp) (D-019). The repository must never finish a mission in worse health than at start.

---

## 2. Relationship to Other Documents

| Document | Role |
|----------|------|
| **Constitution 00–11** | Rules — *what* is allowed |
| **Master Architecture** | Layer map — *where* it fits |
| **Language Standard** | Vocabulary — *how* to name it |
| **PMI** | Maturity dashboard — *how mature* the area is |
| **This protocol (PIP)** | Process — *how* to execute a mission |
| **README_AI** | Entry point — pre-flight checklist |
| **Doc 11** | Certification template — 10 mandatory questions at mission end |

PIP **does not replace** Constitution or Doc 11 — it **operationalizes** them into a sequential workflow.

---

## 3. Official Lifecycle — 10 Phases

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. Pre-Implementation Review (PIR)  ← includes RHP Start (§10.1)       │
│  2. Planejamento                                                        │
│  3. Implementação                                                       │
│  4. Testes                                                              │
│  5. Auditoria                                                           │
│  6. Certificação                                                        │
│  7. Atualização da documentação                                         │
│  8. Atualização do Platform Maturity Index                              │
│  9. Atualização do Engineering Journal                                  │
│ 10. Congelamento da missão  ← includes RHP End + Post-Merge (§10.2–10.3)│
└─────────────────────────────────────────────────────────────────────────┘
```

**Stop rule:** If any phase fails its exit criteria, **do not advance**. Fix or abort; record in TECH-DEBT or ENGINEERING-JOURNAL.

---

### Phase 1 — Pre-Implementation Review (PIR)

**Goal:** Confirm the mission is authorized, scoped, and architecturally aligned **before** any file change.

| Step | Action | Evidence |
|------|--------|----------|
| 1.1 | Read [README_AI.md](../../README_AI.md) pre-flight checklist | All 10 docs current |
| 1.2 | Confirm mission scope in [ROADMAP.md](./ROADMAP.md) / [NEXT-SPRINT.md](./NEXT-SPRINT.md) | Roadmap ref or explicit user authorization |
| 1.3 | Verify no conflict with [DECISIONS.md](./DECISIONS.md) | No contradicting D-entry |
| 1.4 | Map changes to [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) layers | Layer L0–L7 identified |
| 1.5 | Use [Language Standard](../architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md) terms in mission plan | No conflicting vocabulary |
| 1.6 | Check [TECH-DEBT.md](./TECH-DEBT.md) and [PMI](./PLATFORM-MATURITY-INDEX.md) for blockers | Blockers acknowledged or deferred with D-entry |
| 1.7 | Classify mission type (§5) | Doc-only / Implementation / Foundation / etc. |
| 1.8 | **Execute D-028 long-term impact gate** ([DECISIONS D-028](./DECISIONS.md#d-028--engineering-governance-evolution)) — answer all 10 enterprise questions; stop if uncertain | Recorded in PR or JOURNAL |
| 1.9 | **Execute RHP Start** ([§10.1](#101-rhp--before-mission-start)) | Baseline recorded in JOURNAL or PR |

**PIR exit criteria:** Written mission statement with scope, layer map, out-of-scope list, roadmap alignment, **D-028 long-term impact assessment**, and **RHP Start baseline**. For code missions: branch name `cursor/<descriptive-name>-579b`, synced with `main`.

**Doc-only missions:** PIR still required; Phases 3–4 may be minimal (verify no accidental code).

---

### Phase 2 — Planejamento

**Goal:** Define deliverables, artifacts to create, gates to run, and rollback plan.

| Step | Action |
|------|--------|
| 2.1 | List files/modules affected (estimate from PIR) |
| 2.2 | Identify artifacts required (§6 — capability, gate, migration, ADR, etc.) |
| 2.3 | Select verification commands (scope-appropriate): |
| | `npm run build` · `npm run lint` · `npm run typecheck` |
| | `npm run verify:governance` · scoped `gate:*` · E2E specs |
| 2.4 | Define acceptance criteria (objective, testable) |
| 2.5 | Identify PMI areas that will change (§8) |
| 2.6 | Plan doc updates (§7) |

**Planning exit criteria:** Task list with acceptance criteria; artifact checklist from §6; no undefined scope.

---

### Phase 3 — Implementação

**Goal:** Execute the plan under the four perspectives ([Doc 11 §3](../constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md)).

| Perspective | Rule |
|-------------|------|
| **Architecture** | No parallel solutions; layer boundaries; Metadata First |
| **Quality** | Continuous build/lint; stop on regression |
| **Evolution** | Answer 8 evolution questions; justify NO |
| **Governance** | Track artifacts per §6 as they arise |

**Implementation rules:**

- **Minimal diff** — only what the mission requires
- **Foundation / ModeloBase1** — require Amendment Process + gates if touched
- **Generator templates** — update gates when template changes
- **Commit incrementally** — logical commits with clear messages; push before heavy testing
- **No chat-only decisions** — durable choices → DECISIONS.md

**Implementation exit criteria:** All planned code/config changes complete; no known regressions in scope.

---

### Phase 4 — Testes

**Goal:** Prove the change works and does not break certified behavior.

| Mission scope | Minimum tests |
|---------------|---------------|
| Any code change | `npm run build` + `npm run lint` |
| Foundation / ModeloBase1 / module | `npm run verify:governance` |
| Config engine (V13–V20) | Scoped `verify:*-cert-*` for affected engine |
| UI-affected | Relevant E2E or mock E2E + visual gate if certified UI |
| Backend / Prisma | Migration applies clean; `/api/health` passes |
| Security / tenant | Isolation E2E or gate where applicable |

**Test exit criteria:** All selected commands pass; failures fixed or mission aborted with TECH-DEBT entry.

---

### Phase 5 — Auditoria

**Goal:** Independent verification against architecture and documentation — not only "tests pass."

| Check | Question |
|-------|----------|
| Layer integrity | Does code respect Master Architecture boundaries? |
| Language compliance | Do new names match Language Standard? |
| SSOT | Any duplicated structural UI or metadata? |
| Registry sync | Frontend/backend registries aligned if modules touched? |
| Gate coverage | New behavior protected by gate or TECH-DEBT filed? |
| Doc drift | Does CURRENT-STATE still match code? |

**Audit types:**

| Type | When |
|------|------|
| **Self-audit** | Every implementation mission — agent/developer checklist above |
| **Read-only audit mission** | Periodic or pre-release — no code changes; report only |
| **Gate audit** | Automated via `verify:governance` and scoped gates |

**Audit exit criteria:** No unresolved P0/P1 findings; P2+ documented in TECH-DEBT.

---

### Phase 6 — Certificação

**Goal:** Formal mission sign-off.

**Mandatory:** All **10 certification questions** from [Doc 11 §4](../constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md) answered **SIM** or **NÃO** with technical justification.

Include certification in:

- PR description
- ENGINEERING-JOURNAL entry (Phase 9)
- User-facing mission report

**Special missions:** Documentation-only missions use the same 10 questions; justify N/A items (e.g. "no code touched" for Q3 debt from code).

**Certification exit criteria:** All 10 items answered; no unexplained NÃO on architecture/constitution integrity (Q1–Q2).

---

### Phase 7 — Atualização da Documentação

**Goal:** Repository remains the single source of truth.

| Document | Update when |
|----------|-------------|
| [CURRENT-STATE.md](./CURRENT-STATE.md) | **Always** |
| [CAPABILITIES-REGISTRY.md](./CAPABILITIES-REGISTRY.md) | Capability / engine status change |
| [TECH-DEBT.md](./TECH-DEBT.md) | New or resolved debt |
| [DECISIONS.md](./DECISIONS.md) | Architectural decision (D-entry) |
| [ROADMAP.md](./ROADMAP.md) | Phase/priority shift |
| [NEXT-SPRINT.md](./NEXT-SPRINT.md) | Sprint boundary change |
| [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md) | MDP spec change |
| Constitution / Master Architecture | Only via Amendment Process |
| [Language Standard](../architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md) | New official term (D-entry) |

**Doc exit criteria:** All applicable rows updated; `Last verified` dates set.

---

### Phase 8 — Atualização do Platform Maturity Index

**Goal:** Strategic dashboard reflects new maturity.

| Rule | Detail |
|------|--------|
| **When** | Any mission that significantly changes a PMI area (§4 or §5 of PMI) |
| **How** | Re-run evidence commands; adjust scores with criteria justification |
| **Skip** | Pure typo/doc fix with zero maturity impact — note in JOURNAL |
| **Version** | PMI patch version bump if scoring methodology unchanged; minor doc sync only |

**PMI exit criteria:** Affected area scores updated or explicit "no PMI impact" in JOURNAL.

---

### Phase 9 — Atualização do Engineering Journal

**Goal:** Permanent mission log.

Every mission **appends** an entry to [ENGINEERING-JOURNAL.md](./ENGINEERING-JOURNAL.md) with:

- Mission ID, date, scope
- Summary of changes
- PIR reference / roadmap alignment
- Full certification block (10 items)
- PR link
- PMI areas touched

**Journal exit criteria:** Entry appended; never delete history.

---

### Phase 10 — Congelamento da Missão

**Goal:** Mission is closed; no loose ends.

| Step | Action |
|------|--------|
| 10.1 | **Execute RHP End** ([§10.2](#102-rhp--before-mission-end)) — merge readiness |
| 10.2 | Merge PR (or document abandon reason in JOURNAL) |
| 10.3 | **Execute RHP Post-Merge** ([§10.3](#103-rhp--after-merge)) when merge occurs |
| 10.4 | Branch merged or explicitly closed |
| 10.5 | NEXT-SPRINT updated for follow-up work |
| 10.6 | No open P0 in scope without TECH-DEBT |
| 10.7 | Tag mission **CLOSED** in JOURNAL entry |

**Freeze definition:** The mission scope is immutable post-close. Follow-up work = **new mission** with new PIR + RHP Start.

**RHP exit rule (D-019):** Repository health at close **≥** health at start — never worse.

---

## 4. Mission Types

| Type | Phases emphasis | Examples |
|------|-----------------|----------|
| **Doc-only** | PIR, Planning, Audit (doc), Cert, Docs, Journal, Freeze | Programs 0.x |
| **Implementation** | All 10 phases full | IFM 1A, Platform Core |
| **Foundation** | All 10 + Amendment Process + `verify:governance:cycles` | Foundation evolution |
| **Read-only audit** | PIR, Audit, Cert (partial), Journal | Enterprise Audit |
| **Hotfix** | Compressed 1–6; docs within 48h | Production incident |

---

## 5. Phase Applicability Matrix

| Phase | Doc-only | Implementation | Foundation | Hotfix |
|-------|----------|----------------|------------|--------|
| 1 PIR | ✅ | ✅ | ✅ | ✅ |
| 2 Planning | ✅ | ✅ | ✅ | ⚡ brief |
| 3 Implementation | ⏭ skip | ✅ | ✅ | ✅ |
| 4 Testes | ⏭ skip | ✅ | ✅ full cycles | ✅ minimal |
| 5 Auditoria | ✅ doc | ✅ | ✅ | ⚡ |
| 6 Certificação | ✅ | ✅ | ✅ | ✅ |
| 7 Docs | ✅ | ✅ | ✅ | ✅ within 48h |
| 8 PMI | if impact | if impact | if impact | if impact |
| 9 Journal | ✅ | ✅ | ✅ | ✅ |
| 10 Freeze | ✅ | ✅ | ✅ | ✅ |

---

## 6. Artifact Creation Rules

When to create each artifact — **if unsure, create and link in DECISIONS or TECH-DEBT**.

### 6.1 Capability

| Create when | Artifact |
|-------------|----------|
| New user-facing or platform behavior that maps to a Config Engine or L6 service | Register in [CAPABILITIES-REGISTRY.md](./CAPABILITIES-REGISTRY.md) |
| New engine V21+ | Engine code + registry + bootstrap + gate suite + CAPABILITIES entry |
| Extends existing engine | Update CAPABILITIES % and catalog doc |

**Do not create** a parallel capability outside engine/registry pattern ([D-004](./DECISIONS.md)).

---

### 6.2 Foundation Promotion

| Create when | Process |
|-------------|---------|
| Code in `src/modules/*` is reused by 2+ modules structurally | Promotion proposal per [07-PRINCIPLES-OF-PROMOTION.md](../constitution/07-PRINCIPLES-OF-PROMOTION.md) |
| Legacy `framework/cadastro/` extraction | IFM 1B A1 mission; gates updated |
| New primitive engine in cadastro-engine | Foundation mission + backward compatibility proof |

**Requires:** `verify:governance` pass; no breaking certified modules.

---

### 6.3 Base Template

| Create when | Process |
|-------------|---------|
| New UI/operational shell distinct from ModeloBase1 cadastro pattern | D-entry + MDP Template Registry entry (future) + gates |
| Today | Only **ModeloBase1** is certified — new templates are **future** (D-017) |

**Prohibited:** New template that bypasses Foundation Runtime or duplicates engines.

---

### 6.4 Metadata

| Create when | Where |
|-------------|-------|
| Field/entity/layout definition (today) | Module `*Form.constants.js`, `*ModuleMetadata.js` until MDP migration |
| Persisted platform definition (2035) | MDP dictionaries — [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md) |
| Custom field | CADCPS / Data Dictionary path — no parallel tables |
| Runtime cache | `*ConfigRegistry.js` — boot cache only, not SSOT |

---

### 6.5 Migration (database)

| Create when | Process |
|-------------|---------|
| New/changed Prisma model | `prisma migrate dev` → committed SQL in `backend/prisma/migrations/` |
| Data seed change | `backend/scripts/seed*` or documented seed mission |
| Tenant data migration | Migration Platform mission (future) — not ad-hoc scripts in production |

**Prohibited:** Relying only on `ensureSchema.js` for new tables ([Constitution D25](../constitution/08-DO-NOT-DO-LIST.md)).

---

### 6.6 Gate

| Create when | Process |
|-------------|---------|
| New architectural invariant that must never regress | New `scripts/gate-*.mjs` + register in governance baseline if Foundation-level |
| New Config Engine V21+ | Gate range following V13–V20 pattern |
| Bug that escaped CI | Regression gate or extend existing gate |

**Requires:** Gate documented in [06-GOVERNANCE-AND-GATES.md](../constitution/06-GOVERNANCE-AND-GATES.md); CI inclusion per IFM 1D policy.

---

### 6.7 Auditoria

| Create when | Output |
|-------------|--------|
| Pre-release or periodic health check | Read-only report in `docs/engineering/` or `docs/auditoria/` — subordinate to Constitution |
| Mission 0.2-style doc certification | [DOCUMENTATION-CERTIFICATION.md](./DOCUMENTATION-CERTIFICATION.md) pattern |
| Security / tenant isolation review | Report + TECH-DEBT entries |

**Auditoria is not a substitute for gates** — it informs gaps.

---

### 6.8 ADR (Architectural Decision Record)

| Create when | Where |
|-------------|-------|
| Any durable architectural choice | [DECISIONS.md](./DECISIONS.md) — D-numbered entry |
| Layer topology change | D-entry + Master Architecture amendment |
| New official term | D-entry + Language Standard update |
| Supersedes prior decision | New D-entry; mark old as Superseded — never edit accepted D in place |

**Format:** Date, Status, Decision, Evidence, Consequences (existing DECISIONS template).

---

### 6.9 Documentação

| Create when | Where |
|-------------|-------|
| New official platform concept | Appropriate tier: Constitution > Master Architecture > Engineering |
| Mission completes | JOURNAL + applicable living docs (§Phase 7) |
| Historical evidence | `docs/auditoria/`, `docs/ENTERPRISE_*` — marked historical |

**Prohibited:** Chat-only documentation; docs outside hierarchy without D-entry.

---

### 6.10 Breaking Change

| Create when | Process |
|-------------|---------|
| Any change breaking certified module contracts | Constitution Amendment Process |
| Foundation API removal/rename | Amendment + migration shim + gate update |
| MDP schema breaking | Version bump + migration path in MDP-5 |

**Requires:** D-entry, TECH-DEBT if temporary shim, `verify:governance:cycles` for Foundation.

---

### 6.11 Roadmap Update

| Create when | Where |
|-------------|-------|
| Official program priority shift | [ROADMAP.md](./ROADMAP.md) + D-entry if strategic |
| Sprint scope change | [NEXT-SPRINT.md](./NEXT-SPRINT.md) |
| Phase completion | ROADMAP checkbox + JOURNAL |

**Do not update** roadmap for every small task — only strategic shifts.

---

### 6.12 Tech Debt

| Create when | Where |
|-------------|-------|
| Known gap deferred from mission | [TECH-DEBT.md](./TECH-DEBT.md) — TD-numbered |
| Resolved debt | Move to Resolved section with date + PR |

**Requires:** Evidence from code; priority P0–P3; roadmap ref if planned.

---

### 6.13 Release Note

| Create when | Where |
|-------------|-------|
| User-visible production deploy | PR description + optional `CHANGELOG.md` if established |
| Foundation version bump | `governance-baseline.json` version + Constitution header |
| Marketplace package publish (future) | Package manifest + tenant notification |

**Minimum for merge:** PR title + description with scope, certification, and breaking changes flagged.

---

## 7. Quick Reference — Mission Checklist

Copy for every implementation mission:

```markdown
## Mission [ID] — PIP Checklist

- [ ] **D-028 long-term impact gate** — 10 enterprise questions answered (PIR step 1.8)
- [ ] **RHP Start (§10.1)** — PRs, branch sync, build/lint/gates baseline
- [ ] **1 PIR** — README_AI + roadmap + layer map + language check
- [ ] **2 Planning** — acceptance criteria + artifact list + gates selected
- [ ] **3 Implementation** — four perspectives; minimal diff
- [ ] **4 Testes** — build/lint/governance/E2E as scoped
- [ ] **5 Auditoria** — layer + SSOT + registry + doc drift
- [ ] **6 Certificação** — 10 questions SIM/NÃO
- [ ] **7 Docs** — CURRENT-STATE + applicable engineering docs
- [ ] **8 PMI** — scores updated or N/A documented
- [ ] **9 Journal** — entry appended with certification
- [ ] **RHP End (§10.2)** — merge readiness; docs/journal updated
- [ ] **10 Freeze** — PR merged; RHP Post-Merge (§10.3); mission CLOSED
```

---

## 10. Repository Health Protocol (RHP)

**Decision:** D-019  
**Status:** Official — integrated into PIP  
**Permanent directive:** The repository **must never** finish a mission in a state **inferior** to that found at mission start. Whenever possible: reduce tech debt, resolve pending conflicts, and improve overall project health.

RHP runs at **three checkpoints**: mission start, mission end (pre-merge), and post-merge.

---

### 10.1 RHP — Before Mission Start

Execute during **PIR (Phase 1)** before altering any project file. Record baseline in PR description or ENGINEERING-JOURNAL entry header.

| # | Check | How to verify | Action if fail |
|---|-------|---------------|----------------|
| 1 | **Open Pull Requests** | `gh pr list --state open` | Merge, close, or rebase stale PRs; do not start if blocking conflicts exist |
| 2 | **PRs ready for merge** | `gh pr list --label "ready"` or review CI status | Merge ready PRs first or document deferral in JOURNAL |
| 3 | **Branch conflicts** | `git fetch origin main && git merge-base --is-ancestor origin/main HEAD` (on work branch) | Rebase/merge `main` into work branch before coding |
| 4 | **Work branch synced with main** | `git pull origin main` on base; feature branch rebased | Sync before first commit |
| 5 | **Documentation vs code divergence** | [CURRENT-STATE.md](./CURRENT-STATE.md) vs code spot-check; README_AI pre-flight | Update docs first or file TECH-DEBT with PIR note |
| 6 | **Build** | `npm run build` | Fix on `main` or branch before mission scope work |
| 7 | **Lint** | `npm run lint` | Fix before proceeding |
| 8 | **Gates** | `npm run verify:governance` (or scoped gates per mission) | Pass or document known baseline failure + TECH-DEBT |
| 9 | **Known vulnerabilities** | `npm audit` (frontend); `npm audit` in `backend/` | Record count in baseline; address if mission scope includes S3 |
| 10 | **Critical dependencies** | `package.json` / `backend/package.json` — broken lockfile, deprecated Node | `npm ci` succeeds; Node version matches CI (22) |

**RHP Start exit criteria:** Baseline table recorded (pass/fail per row). No **new** P0 blockers introduced by ignoring failed checks.

---

### 10.2 RHP — Before Mission End

Execute during **Phase 10 (Congelamento)** before merge. All must pass for the mission scope (or be documented as pre-existing with no regression).

| # | Check | How to verify |
|---|-------|---------------|
| 1 | **Build approved** | `npm run build` ✅ |
| 2 | **Lint approved** | `npm run lint` ✅ |
| 3 | **Gates approved** | `npm run verify:governance` and scoped gates ✅ |
| 4 | **Applicable tests approved** | E2E / smoke / backend health per Phase 4 scope ✅ |
| 5 | **Self-review of PR** | Author reviewed diff; certification block in PR body |
| 6 | **No conflicts with main** | `gh pr view` — mergeable; or local `git merge origin/main` clean |
| 7 | **Merge readiness** | CI green; approvals if required; no draft unless intentional |
| 8 | **Documentation updated** | Phase 7 docs complete |
| 9 | **CURRENT-STATE updated** | `Last verified` date + accurate counts |
| 10 | **ENGINEERING-JOURNAL updated** | Entry with certification appended |
| 11 | **CHANGELOG updated** | When user-visible release — PR body minimum; `CHANGELOG.md` if established |

**RHP End exit criteria:** All applicable rows ✅. Repository health **≥** RHP Start baseline.

---

### 10.3 RHP — After Merge

Execute after PR merge to `main` (or document N/A for abandoned missions).

| # | Check | How to verify |
|---|-------|---------------|
| 1 | **Merge executed correctly** | `gh pr view --json state` = MERGED; commit on `main` |
| 2 | **Branch synchronized** | `git checkout main && git pull origin main` — contains merge commit |
| 3 | **Deploy completed** | Vercel/Railway deploy triggered (when applicable) — check provider dashboard or CI |
| 4 | **Environment health check** | `npm run check:api` or `/api/health` on deployed backend |
| 5 | **No regression detected** | Smoke: `npm run build` on `main`; optional E2E smoke |

**RHP Post-Merge exit criteria:** `main` is healthy; no regression vs RHP End state. If deploy fails — hotfix mission under PIP with RHP Start from failed state.

---

### 10.4 RHP Health Comparison Rule

| Rule | Detail |
|------|--------|
| **Never worse** | Open PR count, failing gates, audit vulns, doc drift — must not increase due to mission without TECH-DEBT justification |
| **Improve when possible** | Merge ready PRs, fix P1 debt in scope, resolve conflicts, sync registries |
| **Record delta** | JOURNAL entry notes: "RHP: start baseline → end state" |
| **Exception** | Strategic deferral requires TECH-DEBT + explicit user/agent acknowledgment in JOURNAL |

---

## 8. Implementation Era Declaration

**Program 0.7 closes the documentation-only era.**

| Era | Programs | Status |
|-----|----------|--------|
| Structural documentation | 0 – 0.7 | ✅ Complete |
| **Implementation** | 1+ (IFM, Platform Core, …) | **Starts now** — under this protocol |

All implementation missions **must** follow PIP Phases 1–10.

---

## 9. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.1.0 | 2026-06-28 | RHP integrated — D-019; mission start/end/post-merge health audits |
| 1.0.0 | 2026-06-28 | Initial protocol — Program 0.7, D-018 |

---

*Execute every mission through this protocol. No exceptions without D-register entry.*
