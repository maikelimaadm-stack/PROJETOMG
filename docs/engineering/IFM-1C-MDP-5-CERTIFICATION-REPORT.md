# IFM 1C-MDP-5 — Versioning & Publication Certification Report

**Mission ID:** IFM 1C-MDP-5  
**Program:** IFM Phase 1C — MAK DATA PLATFORM  
**Date:** 2026-06-29  
**Status:** Complete  
**Architecture spec:** [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) §7  
**Decision:** D-026 — MDP-5 Versioning & Publication Engine

---

## 0. Executive Summary

**MDP-5** is implemented as the **official Versioning, Publication, Compile, Deploy, Rollback, and Snapshot Engine** for the MAK Data Platform. All published platform definitions flow through compile-on-publish → immutable CRB → environment pins → snapshots.

PR #301 (MDP-4.5) merged to `main` before implementation.

---

## 1. Deliverables

### Prisma (D-026)

| Table | Purpose |
|-------|---------|
| `mdp_definition_version` | Extended — base_template, integrity_hash, signature_ref, version chain |
| `mdp_compiled_bundle` | Immutable CRB (Compiled Runtime Bundle) |
| `mdp_snapshot` | Point-in-time exports (offline/marketplace/backup/environment/deployment) |
| `mdp_publish_log` | Publish/rollback/deploy audit |
| `mdp_environment_pin` | DEV / QA / PROD version pins per module + base template |

Migration: `backend/prisma/migrations/20260629190000_mdp5_versioning_publication/migration.sql`

### API

| Route | Methods |
|-------|---------|
| `/api/mdp/versions` | GET |
| `/api/mdp/versions/:id` | GET |
| `/api/mdp/versions/draft` | POST |
| `/api/mdp/publish` | POST |
| `/api/mdp/rollback` | POST |
| `/api/mdp/compile/:moduleId` | POST |
| `/api/mdp/snapshots` | GET, POST |
| `/api/mdp/snapshots/:id` | GET |
| `/api/mdp/environment-pins` | GET, POST |
| `/api/mdp/introspect` | GET (unified — replaces registry-only introspect for Studio/AI) |

### CRB Features

- Compile-on-publish with `contentHash` + `integrityHash`
- `dependencyGraph` (entities, fields, relationships, registry bindings)
- `versionGraph` (parent chain, revision)
- Partial rollback via `partial.entryTypes` / `partial.registryEntryIds`
- Signature-ready fields (`signature_ref` on version + snapshot)

### Governance

| Gate | Check |
|------|-------|
| **G142** | CRB export + publish/compile/rollback/introspect API |

Export: `config/mdp-compiled-bundle.export.json`  
Sync: `npm run sync:mdp-compiled-bundle`

---

## 2. Validation Evidence

| Check | Result |
|-------|--------|
| Build | ✅ |
| Lint | ✅ |
| verify:governance | ✅ (G142) |
| verify:ci | ✅ |
| verify:governance:cycles | ✅ 5/5 |
| validate:mdp-publish | ✅ SKIP without DATABASE_URL |
| smoke:mdp-publish | ✅ SKIP without DATABASE_URL |

---

## 3. Certification Answers

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| 1 | MDP-5 = Engine oficial? | **SIM** | `/api/mdp/publish`, publish_log, mandatory compile-on-publish |
| 2 | Draft, Publish, Rollback, Snapshots? | **SIM** | State machine + APIs + `mdp_snapshot` |
| 3 | CRB implementado corretamente? | **SIM** | `mdp_compiled_bundle`, `mdpCompileService.buildCrb`, integrityHash |
| 4 | Múltiplos ambientes DEV/QA/PROD? | **SIM** | `MdpEnvironment` + `mdp_environment_pin` + seed pins |
| 5 | Múltiplos Base Templates? | **SIM** | `base_template_id` on bundle, pin, version |
| 6 | Marketplace, IA, Offline, Desktop, Mobile? | **SIM** | Snapshot types, signature_ref, CRB meta, introspect API |
| 7 | Build, Lint, CI, Governança verdes? | **SIM** | §2 |
| 8 | Repo saudável após merge PR #301? | **SIM** | main synced @ `4ab5e440` |
| 9 | MAK Data Platform concluída e congelada? | **SIM** | MDP-0..5 complete; D-026 freeze |
| 10 | Briefing próxima fase? | **SIM** | [IFM-PHASE-2-MAK-STUDIO-BRIEF.md](./IFM-PHASE-2-MAK-STUDIO-BRIEF.md) |

---

## 4. Out of Scope (Confirmed)

- MAK Studio UI, Marketplace storefront, AI runtime, Offline client, Knowledge Platform

---

*Certified by IFM 1C-MDP-5 mission.*
