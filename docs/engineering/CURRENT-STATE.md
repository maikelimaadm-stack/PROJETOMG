# CURRENT-STATE — MAK Gestão Platform

**Status:** Living document — update every mission  
**Last verified:** 2026-06-29  
**Verified by:** Program 1E Runtime Bridge Phase 1 (D-030)  
**Next review:** Start of every mission (mandatory per README_AI.md)

---

## Platform Summary

| Attribute | Value |
|-----------|-------|
| Product | MAK Gestão ERP — metadata-driven multi-tenant SaaS |
| Frontend | React 18 + Vite 6 + React Query + Tailwind/shadcn |
| Backend | Fastify 5 + Prisma 6 + PostgreSQL |
| Foundation | Enterprise V10.2.0 — **frozen** 2026-06-28 |
| Constitution | v1.0.0 — `docs/constitution/` |
| Master Architecture | v1.0.0 — `docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md` |
| **Engineering Principles** | v1.0.0 — `docs/architecture/MAK-ENGINEERING-PRINCIPLES.md` (**D-029**) |
| Platform Language Standard | v1.0.0 — `docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md` |
| Platform Maturity Index | v1.3.0 — `docs/engineering/PLATFORM-MATURITY-INDEX.md` (**ERI 3.8/10**) |
| Implementation Protocol | v1.2.0 — `docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md` (RHP D-019, **D-028 gate**) |
| MDP Architecture Spec | v1.0.0 — `docs/architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md` (D-020) |
| Global technical score | Foundation track **6.8/10** · Full platform **4.2/10** · **ERI 3.8/10** — [PMI v1.3](./PLATFORM-MATURITY-INDEX.md) |

---

## Governance Evolution (D-028 + D-029)

From 2026-06-29: all implementations require **long-term enterprise impact analysis** (10 questions) before coding — [D-028](./DECISIONS.md#d-028--engineering-governance-evolution).  
All implementations must comply with **[MAK Engineering Principles](../architecture/MAK-ENGINEERING-PRINCIPLES.md)** (18 principles) — [D-029](./DECISIONS.md#d-029--engineering-principles).  
Enterprise evolution map: **Program 1F — Enterprise Readiness** (documentation-only).  
Audits: [IFM-D028-ENTERPRISE-READINESS-AUDIT-REPORT.md](./IFM-D028-ENTERPRISE-READINESS-AUDIT-REPORT.md) · [IFM-D029-ENGINEERING-PRINCIPLES-AUDIT-REPORT.md](./IFM-D029-ENGINEERING-PRINCIPLES-AUDIT-REPORT.md)

---

## Next Official Programs (D-027 + D-028)

| Program | Priority | Brief |
|---------|----------|-------|
| **Program 1E — Runtime Bridge** | ✅ Phase 1 complete | [IFM-PHASE-1E-CERTIFICATION-REPORT.md](./IFM-PHASE-1E-CERTIFICATION-REPORT.md) |
| **Program 2 — MAK Studio** | P1 primary — **ready to start** | [IFM-PHASE-2-MAK-STUDIO-BRIEF.md](./IFM-PHASE-2-MAK-STUDIO-BRIEF.md) |
| **Program 1F — Enterprise Readiness** | Doc only | [ROADMAP.md § Program 1F](./ROADMAP.md#program-1f--enterprise-readiness-documentation-only) |

Reassessment report: [IFM-PLATFORM-ARCHITECTURE-REASSESSMENT-REPORT.md](./IFM-PLATFORM-ARCHITECTURE-REASSESSMENT-REPORT.md)

---

## Architecture Layers (Current)

**Target map:** [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) (L0–L7)

```
Domain modules (2 runtime) → ModeloBase1 → framework/mak → cadastro-engine → API/Prisma
                                    ↘ framework/cadastro (legacy, transitional)

Planned (IFM 1C — partial):
MAK DATA PLATFORM (L4) → Entity ✅ · Data ✅ · Relationship ✅ · Registry ✅ · **Publish Engine ✅ (MDP-5 complete)**
Runtime Bridge (L2 bootstrap) → **CRB hydration ✅ (Program 1E Phase 1)**
Platform Core (L3) → partial today (auth, tenant, RBAC); event bus not started
```

| Layer | Path | LOC (approx) | Status |
|-------|------|--------------|--------|
| ModeloBase1 | `src/ModeloBase1/` | ~4.400 | Complete, certified |
| framework/mak | `src/framework/mak/` | ~18.900 | Complete, frozen |
| cadastro-engine | `src/framework/cadastro-engine/` | ~2.000 | Complete, frozen |
| framework/cadastro | `src/framework/cadastro/` | ~11.100 | Legacy — promotion in progress |
| Domain modules | `src/modules/` | ~5.5K | 11 folders: 2 runtime + 6 cert + 2 infra + template |
| Backend | `backend/src/` | ~8.5K | 15 modules (+ MDP) |

---

## Certified Runtime Modules

| moduleId | Page | Pattern | Files |
|----------|------|---------|-------|
| empresas | PAGEMP | Reference — factory overrides | 42 |
| cadcps | PAGCPS | Thin page + domain runtime | 18 |

Registry SSOT: `mdp_entity` (MDP-1) → export `config/mdp-entities.export.json` → `config/cadastro-modules.registry.json` (parallel cache)  
Routes: `src/modules/generatedModules.json`

---

## Config Engines (Capabilities V13–V20)

All gate-certified as of 2026-06-28:

| Engine | Version | Status |
|--------|---------|--------|
| Layout Config | V13 | Complete |
| Field Config | V14 | Complete |
| Validation Config | V16 | Complete |
| Formula Config | V17 | Complete |
| Events Config | V18 | Complete |
| Actions Config | V19 | Complete |
| Workflow Config | V20 | Complete |
| Import / History / Preferences | — | Complete |
| Grouping / Pivot | — | **Disabled** (`disabled_certified`) |

Detail: [CAPABILITIES-REGISTRY.md](./CAPABILITIES-REGISTRY.md)

---

## Governance Status

| Check | Status (2026-06-28) |
|-------|----------------------|
| `npm run build` | ✅ Pass |
| `npm run lint` | ✅ Pass (0 errors) |
| `npm run typecheck` | ⚠️ Known noise in `src/shared/ui/*` (TD-009) |
| `npm run typecheck:governance` | ✅ Runs in CI — records TD-009 baseline without blocking |
| `npm run verify:governance` | ✅ Pass — G31–G142 + G156–G261 |
| `npm run verify:ci` | ✅ Pass — full PR mirror (build + lint + typecheck:governance + all gates) |
| CI workflow | `.github/workflows/foundation-governance.yml` — foundation job + parallel capability-gates matrix |
| Gates V13–V20 (G156–G261) | ✅ **In CI** — TD-013 resolved (IFM 1D-1) |
| Supplementary gates | `gate:functional-completion`, `gate:foundation-completion`, V15/V15.1/V15.2 — manual |
| E2E specs | 12 files in `e2e/*.spec.js` |
| Frontend npm audit | ✅ 0 vulnerabilities (IFM 1A-S3) |
| Backend npm audit | ✅ 0 vulnerabilities |

---

## Database

| Aspect | State |
|--------|-------|
| Models (Prisma) | 43 (+4 MDP-5) |
| Migrations | 16 (+ MDP-5) |
| Indexes | ~60 |
| Multi-tenant | `cliente_id` on all operational models |
| Multi-empresa | `PermissaoEmpresa` + `X-Empresa-Id` header |
| CADCPS | Partial data dictionary (field metadata) |

---

## MAK DATA PLATFORM (MDP) — Status

| Component | Status | Spec |
|-----------|--------|------|
| **Architecture (MDP-0)** | **✅ Complete** | [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) |
| Entity Dictionary (MDP-1) | **✅ Complete** | [IFM-1C-MDP-1-CERTIFICATION-REPORT.md](./IFM-1C-MDP-1-CERTIFICATION-REPORT.md) |
| Data Dictionary (MDP-2) | **✅ Complete** | [IFM-1C-MDP-2-CERTIFICATION-REPORT.md](./IFM-1C-MDP-2-CERTIFICATION-REPORT.md) |
| Relationship Dictionary (MDP-3) | **✅ Complete** | [IFM-1C-MDP-3-CERTIFICATION-REPORT.md](./IFM-1C-MDP-3-CERTIFICATION-REPORT.md) |
| Metadata Registry (MDP-4) | **✅ Complete — frozen** | [IFM-1C-MDP-4-CERTIFICATION-REPORT.md](./IFM-1C-MDP-4-CERTIFICATION-REPORT.md) |
| Architecture Review (MDP-4.5) | **✅ Complete — freeze certified** | [IFM-1C-MDP-4.5-ARCHITECTURE-REVIEW-REPORT.md](./IFM-1C-MDP-4.5-ARCHITECTURE-REVIEW-REPORT.md) |
| Versioning & Publication (MDP-5) | **✅ Complete — IFM 1C done** | [IFM-1C-MDP-5-CERTIFICATION-REPORT.md](./IFM-1C-MDP-5-CERTIFICATION-REPORT.md) |

**Engineering summary:** [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md) v2.0.0  
**Decision:** D-012 (layer), D-020 (spec), D-025 (MDP-1..4 freeze), **D-026 (MDP-5 complete)**

---

## Not Implemented (Code-Verified)

| Capability | Status |
|------------|--------|
| MAK Studio | Not started |
| Marketplace | Not started (`ClienteModulo` = feature flags only) |
| Knowledge Platform | Not started |
| AI Platform | Not started |
| Offline-first / Sync Engine | Preferences cache only |
| Full entity Data Dictionary | MDP spec only — CADCPS partial today |
| Backend domain event bus | Not started — **deferred post Studio Layout MVP** (D-027) |

---

## Known Inconsistencies (Doc = Code Verified)

See [TECH-DEBT.md](./TECH-DEBT.md) for full register. Active P1 items:

1. **P1:** 78 files import legacy `framework/cadastro/` (TD-003) → IFM 1B A1
2. **P1:** Empresas nomenclature in ModeloBase1 generic layer (TD-004) → IFM 1B A2
3. **P2:** Dual-path DDL — Prisma + `ensureSchema.js` (TD-005) → S4 after MDP-1
4. **P2:** UI monoliths — MakCadastroTable 2,407 LOC (TD-006) → defer post-MDP-4

---

## Plataforma Atual × Alvo (Summary)

Full GAP analysis: [DOCUMENTATION-CERTIFICATION.md §3](./DOCUMENTATION-CERTIFICATION.md#3-plataforma-atual--plataforma-alvo-mak-2035)

**Maturity dashboard:** [PLATFORM-MATURITY-INDEX.md](./PLATFORM-MATURITY-INDEX.md)

---

## Bundle / Performance (Build 2026-06-28)

| Asset | Size (gzip) |
|-------|-------------|
| Main chunk | 492 KB (142 KB gzip) |
| MG prototype CSS | 281 KB (32 KB gzip) |
| Virtualization | `@tanstack/react-virtual` — table + cards |

---

## Update Protocol

After every mission, update sections affected by the change. Set `Last verified` to current date. Cross-check against code — do not copy from chat or old reports.

---

*Authoritative rules: [Constitution](../constitution/00-MAK-CONSTITUTION.md)*
