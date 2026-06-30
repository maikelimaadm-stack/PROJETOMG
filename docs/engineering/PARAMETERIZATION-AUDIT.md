# Parameterization Audit — Program 3.8.6

**Date:** 2026-06-30  
**Scope:** Audit 8 — All configuration, env, catalog, and metadata parameters  
**Evidence:** `.env*`, `backend/.env.example`, `vite.config.js`, Studio catalogs, MDP config, gate scripts

---

## 1. Parameter Domains

| Domain | Location | Count (approx) | SSOT |
|--------|----------|----------------|------|
| Frontend env | `.env.local.example`, `import.meta.env` | 5+ | `LOCAL_DEV.md` |
| Backend env | `backend/.env.example` | 25+ | `backend/README` |
| Studio domainId | `createComputationEngine({ domainId })` | 4 instances | AD-P2-05 |
| Derivation kinds | `extensionPoints.js`, `capabilityCatalog.js` | 2 impl / 8 stub | D-067 |
| Gate IDs | `GATE-REGISTRY.md` | G262–G306, G401/402 | D-062 |
| MDP compiled bundle | `config/mdp-compiled-bundle.cache.json` | CRB snapshot | D-025 |
| Cadastro modules | `config/cadastro-modules.registry.json` | 2 modules | TD-002 resolved |
| Seed bootstrap | `seedBootstrap.js` env | 5 vars | E2E mismatch noted |

---

## 2. Duplicate Parameters

| ID | Parameter A | Parameter B | Conflict | Severity | Class |
|----|-------------|-------------|----------|----------|-------|
| PARAM-01 | `VITE_API_URL` | `VITE_API_PROXY_TARGET` | Two API routing modes; docs differ by environment | P1 | Parametrização |
| PARAM-02 | `DATABASE_URL` | `DIRECT_URL` | Prisma dual URL — required but easy to misconfigure | P2 | Parametrização |
| PARAM-03 | `domainId: "field-studio"` | `domainId: "formula-builder"` | Dual Computation Engine instances (same engine, separate caches) | P2 | Arquitetura |
| PARAM-04 | `domainId: "intent-resolver"` | above | Third Computation Engine instance | P2 | Arquitetura |
| PARAM-05 | `derivationKind: "compute.formula"` | `derivationKind: "compute.computed_field"` | Catalog vs implementation kind mismatch risk | P1 | Governança |
| PARAM-06 | `BOOT_SKIP_MIGRATIONS` | Prisma migrate deploy | Dual DDL path (TD-005) | P2 | Parametrização |
| PARAM-07 | `ensureSchema.js` | Prisma schema | Schema can diverge | P2 | Parametrização |
| PARAM-08 | `FRONTEND_ORIGINS` + `FRONTEND_URL` + `VITE_FRONTEND_URL` | CORS config | 3 origin sources in `server.js` | P2 | Parametrização |
| PARAM-09 | G303 deploy vs G303A/B Studio | Gate namespace | Resolved G401/402 but docs may reference old IDs | P3 | Documentação |
| PARAM-10 | `SEED_CLIENTE_CODIGO=maike` | E2E uses `kaiman` | Test/env default mismatch | P1 | Governança |

---

## 3. Unused Parameters

| ID | Parameter | Evidence | Severity |
|----|-----------|----------|----------|
| PARAM-U01 | `VITE_LOCAL_PERSONALIZACOES` | Only in `userLayoutPreferencesSync.js`; dev-only | P3 |
| PARAM-U02 | `BOOT_RESET_MAIKE` | Production boot script only; rarely documented | P3 |
| PARAM-U03 | 7× `registerMak*ConfigEngine` configs | Gate-only, not runtime-imported | P1 |
| PARAM-U04 | Intelligence metadata params on Computed Field | No consumer | P1 |

---

## 4. Conflicting Parameters

| ID | Conflict | Impact | Severity | Class |
|----|----------|--------|----------|-------|
| PARAM-C01 | `VITE_DEV_AUTO_LOGIN=true` vs Playwright E2E | Blank page in mock E2E | P1 | UX |
| PARAM-C02 | Production API proxy vs local backend | Different behavior without code change | P1 | Implementação |
| PARAM-C03 | `compute.formula` in capabilityCatalog vs `compute.computed_field` in resolver | Capability compatibility checks may fail silently | P1 | Implementação |
| PARAM-C04 | CRB compiled bundle vs live MDP publish | Runtime may use stale metadata | P1 | Runtime |

---

## 5. Missing Required Parameters

| ID | Missing | Where needed | Severity |
|----|---------|--------------|----------|
| PARAM-M01 | Unified `RUNTIME_FORMULA_STRATEGY` env | Formula unification program | P1 |
| PARAM-M02 | Event bus connection (REDIS_URL exists but unused for events) | TD-010 automation | P2 |
| PARAM-M03 | Business Language locale/config | D-065 product shell | P1 |
| PARAM-M04 | Tenant-scoped asset registry config | Multi-asset future | P2 |
| PARAM-M05 | Official catalog schema doc for Intent kinds | AD-P2-13 | P2 |

---

## 6. Inconsistent Parameters

| ID | Issue | Evidence | Severity |
|----|-------|----------|----------|
| PARAM-I01 | Seed defaults ≠ E2E credentials | AGENTS.md gotcha | P1 |
| PARAM-I02 | Rate limit defaults differ prod vs dev | `RATE_LIMIT_MAX` optional | P3 |
| PARAM-I03 | `NODE_ENV` checks scattered vs central config | Multiple files | P2 |
| PARAM-I04 | Module registry FE vs BE | Was TD-002; now synced but no single schema doc | P2 |

---

## 7. Misplaced Parameters

| ID | Parameter | Should belong to | Severity |
|----|-----------|------------------|----------|
| PARAM-W01 | Formula expression in PAG field config | Business Computed Field asset | P0 |
| PARAM-W02 | Layout preferences in localStorage flag | Studio Sync / MDP | P2 |
| PARAM-W03 | RBAC module guard in frontend | Enterprise policy layer | P2 |
| PARAM-W04 | CRB in frontend cache JSON | Runtime Bridge service | P1 |

---

## 8. Evolution-Blocking Parameters

| ID | Parameter pattern | Risk | Severity |
|----|-------------------|------|----------|
| PARAM-E01 | Hardcoded `empresas` in Runtime Bridge pilot | Blocks multi-module CRB | P0 |
| PARAM-E02 | `domainId` per designer without registry | Cannot unify computation telemetry | P1 |
| PARAM-E03 | Extension points as code array, not catalog | Adding kinds requires code change | P1 |
| PARAM-E04 | Compiled MDP bundle committed to repo | Stale metadata in CI/prod | P1 |

---

## 9. Recommendations (Documentation Only — No Implementation)

1. **P0:** Document official derivation kind SSOT (`compute.computed_field` vs `compute.formula`) in GATE-REGISTRY or Intent catalog doc.
2. **P1:** Assign Program ID for Runtime Formula Unification parameters before 3.9 production wiring.
3. **P1:** Align seed/E2E env in `.env.example` comments.
4. **P2:** Publish unified env var catalog (FE + BE) derived from SSOT-REGISTRY.

---

## 10. Summary

| Category | Count |
|----------|-------|
| Duplicates | 10 |
| Unused | 4 |
| Conflicting | 4 |
| Missing | 5 |
| Inconsistent | 4 |
| Misplaced | 4 |
| Evolution-blocking | 4 |

**Verdict:** Parameterization is **adequate for current ERP+Studio scope** but **not EOS-ready** — dual paths (API, DDL, formula, metadata) create drift risk at scale.
