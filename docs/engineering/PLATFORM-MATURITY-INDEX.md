# PLATFORM MATURITY INDEX (PMI)

**Status:** Official — Strategic platform dashboard  
**Version:** 1.3.0  
**Effective date:** 2026-06-29  
**Program:** 0.6 + post-MDP reassessment + D-028 ERI  
**Decision:** D-016 (v1.0), D-017, D-027, **D-028 (ERI + Enterprise Readiness)**

**Last verified:** 2026-06-29  
**Verified by:** D-028 Engineering Governance Evolution  
**Evidence commands:** `npm run build`, `npm run verify:governance`, `npm audit`, registry file counts, Prisma schema

---

## 1. Purpose

The PMI is the **permanent strategic dashboard** for MAK Gestão maturity. It measures how close each major platform area is to the **2035 target** defined in [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md).

Scores are **0–10**, derived from **objective criteria only** — never from chat estimates or unverified assumptions.

---

## 2. Scoring Methodology

| Score | Meaning |
|-------|---------|
| **0** | Not started — zero code (spec may exist) |
| **1–2** | Seeds / partial prototype / documentation only |
| **3–4** | Significant partial implementation; not production-ready for area scope |
| **5–6** | Core production path works; major 2035 gaps remain |
| **7–8** | Production-grade; bounded debt documented |
| **9** | Near-complete vs 2035 target; minor gaps only |
| **10** | 2035 target fully achieved in code |

Each area uses the **standard assessment block** (§2.1). Scores are **0–10**, derived from **objective criteria only**.

### 2.1 Standard assessment fields

Every area in §4 and §5 includes:

| Field | Description |
|-------|-------------|
| **Score** | 0–10 from weighted criteria or evidence checklist |
| **2035 target** | MAK 2035 Master Architecture goal |
| **Current state** | Evidence from code, gates, audits |
| **Thousands-of-clients readiness** | **Baixa** (<100 tenants) · **Média** (100–1K with gaps) · **Alta** (1K+ architected) |
| **Main risks** | Top technical/business risks |
| **Next technical investments** | Prioritized engineering actions |

---

**Primary evidence sources:**

| Source | Role |
|--------|------|
| Codebase (`main`) | Implementation truth |
| [CURRENT-STATE.md](./CURRENT-STATE.md) | Living snapshot |
| [CAPABILITIES-REGISTRY.md](./CAPABILITIES-REGISTRY.md) | Engine % estimates |
| [TECH-DEBT.md](./TECH-DEBT.md) | Blockers |
| [DOCUMENTATION-CERTIFICATION.md](./DOCUMENTATION-CERTIFICATION.md) | Mission 0.2 GAP table |
| Enterprise Audit 2026-06-28 | Historical score ~7.0/10 cadastro |

---

## 3. Executive Dashboard

### 3.1 Platform capabilities (L2–L7)

| Area | Score | 1K+ readiness | Blocker |
|------|-------|---------------|---------|
| Foundation | **7.2** | Média | Legacy layer; CI V13–V20 protected (TD-013 resolved) |
| ModeloBase1 (Base Template 1) | **7.0** | Média | Monoliths + G38; single template only |
| Platform Core | **6.5** | Média | Event bus not started |
| MAK Data Platform | **8.5** | Média | CRB hydration pending (Program 1E) |
| MAK Studio | **0.5** | Baixa | Zero code — **Program 2 next** |
| AI Platform | **0.0** | Baixa | Zero code |
| Knowledge Platform | **0.0** | Baixa | Zero code |
| Marketplace | **1.0** | Baixa | Feature flags only |
| SDK | **0.0** | Baixa | Zero code |
| Extensions | **0.5** | Baixa | Spec only |
| Migration Platform | **0.5** | Baixa | Spec only |
| Offline Capability | **1.5** | Baixa | Prefs cache only |
| Mobile | **1.0** | Baixa | Web responsive only |
| Desktop | **0.0** | Baixa | Zero code |
| Governança | **9.0** | Alta | V13–V20 in CI (IFM 1D-1) |

### 3.2 Infrastructure & operations

| Area | Score | 1K+ readiness | Blocker |
|------|-------|---------------|---------|
| Frontend | **6.5** | Média | Monoliths + dual CSS |
| Backend | **6.5** | Média | No event bus; registry desync |
| Banco de Dados | **6.0** | Média | Dual DDL; no replicas |
| APIs | **5.5** | Média | No public API / OpenAPI |
| Segurança | **6.5** | Média | npm audit + no MFA |
| Performance | **6.0** | Média | Monolith components |
| Escalabilidade | **5.0** | Baixa | Single-instance; no Redis required |
| Observabilidade | **4.5** | Baixa | No APM/tracing |
| CI/CD | **7.0** | Média | V13–V20 parallel matrix in CI |
| Testes | **5.5** | Média | E2E only; no unit suite |
| Migração de Dados | **4.5** | Baixa | Dual DDL path |
| Multi-tenant | **7.5** | Média–Alta | Proven in schema + E2E |
| Multiempresa | **7.0** | Média–Alta | PermissaoEmpresa + header |
| Backup e Recuperação | **2.5** | Baixa | Host-dependent only |
| Versionamento | **7.5** | Média | MDP-5 complete; runtime pin activation pending |
| Publicação | **7.0** | Média | Publish engine ✅; Foundation hydration pending |
| Deploy | **5.0** | Média | Git-trigger deploy only |

**Full platform average (32 areas):** **4.2 / 10**  
**Foundation + infra track (Foundation, ModeloBase1, Frontend, Backend, DB, Governança):** **6.8 / 10**  
**Enterprise Readiness Index (ERI):** **3.8 / 10** — see §3.3

---

### 3.3 Enterprise Readiness Index (ERI)

**Added:** D-028 — measures readiness for **global enterprise operation** (10K+ clients, multi-country, 20-year horizon).

**Program map:** [ROADMAP.md](./ROADMAP.md) Program 1F (documentation-only until scheduled).

| ERI Dimension | Score | Program 1F | Evidence |
|---------------|-------|------------|----------|
| **Segurança** | **4.5** | 1F.2 | JWT auth ✅; npm audit ✅; **no MFA, no GDPR tooling, no key rotation** |
| **Escalabilidade** | **3.5** | 1F.4 | Multi-tenant schema ✅; **single-instance, no Redis, no auto-scale** (PMI Escalabilidade 5.0) |
| **Observabilidade** | **3.0** | 1F.3 | `/api/metrics/*` partial; **no APM, no structured logs, no tracing** (PMI 4.5) |
| **Recuperação** | **2.5** | 1F.5 | MDP snapshots ✅; **host-dependent backup, no runbooks, no failover tests** (PMI Backup 2.5) |
| **Globalização** | **2.0** | 1F.1 | MDP label tables ✅ (`mdp_*_label`); **zero i18n runtime, no locale/TZ/currency** |
| **Migração** | **3.0** | 1F.6 | MDP-5 versioning ✅; **DB migration only today; no artifact/bundle migration platform** |
| **Operação** | **5.5** | 1F.3 + 1F.5 | CI/CD 7.0 ✅; Deploy 5.0; health checks ✅; **no tenant/publish health dashboards** |

**ERI composite:** **(4.5 + 3.5 + 3.0 + 2.5 + 2.0 + 3.0 + 5.5) / 7 = 3.8 / 10**

| ERI readiness tier | Meaning |
|--------------------|---------|
| **0–3** | Not enterprise-ready — current: globalization, DR, observability |
| **4–6** | Mid-market SaaS — current overall ERI |
| **7–8** | Enterprise-grade — target post-Program 1F implementation |
| **9–10** | Global platform — MAK 2035 full maturity |

**Update protocol:** Recompute ERI when any Program 1F subprogram ships code or when security/scale/ops posture changes materially.

---

## 4. Area Assessments

### 4.1 Foundation

| Field | Value |
|-------|-------|
| **Score** | **7.0 / 10** |
| **2035 target** | Frozen L2 — ModeloBase1 + framework/mak + cadastro-engine + Config Engines V13–V20 + generator; **zero** legacy `framework/cadastro/`; all capability gates in CI |
| **Current state** | Enterprise **V10.2.0 frozen** (`scripts/governance-baseline.json`). Seven Config Engines (V13–V20) implemented, gate-certified, **protected in CI** (IFM 1D-1). Generator + G31–G136 + G156–G261 in CI. Legacy layer **61 files / ~11,127 LOC** remains. |

**Criteria (objective):**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Frozen governance baseline certified | 2.0 | 2.0 | `governance-baseline.json` v10.1.0 |
| Config Engines V13–V20 complete | 3.0 | 2.5 | [CAPABILITIES-REGISTRY](./CAPABILITIES-REGISTRY.md) — all 7 Complete; V18–V20 client-side only |
| Generator + certification CI (G31–G108) | 2.0 | 2.0 | `.github/workflows/foundation-governance.yml`; `npm run verify:governance` ✅ |
| Legacy cadastro layer eliminated | 1.5 | 0.0 | TD-003 — 61 imports `@/framework/cadastro/` |
| V13–V20 gates in CI | 1.0 | 1.0 | IFM 1D-1 — parallel matrix |
| Foundation completion gates automated | 0.5 | 0.5 | Scripts exist; manual only — partial credit |

| **Dependencies** | ModeloBase1, cadastro-engine, makBootstrap |
| **Blockers** | TD-003 (legacy layer) |
| **Next level (+1.0)** | Reduce legacy imports below 20 files (IFM 1B A1); MDP-1 Entity Dictionary |
| **Next steps** | IFM 1B A1 promotion; IFM 1D CI hardening |

---

### 4.2 ModeloBase1 (Official Base Template 1)

| Field | Value |
|-------|-------|
| **Score** | **7.0 / 10** |
| **2035 target** | **First Official Base Template** — Cadastro list+form+search pattern; pluggable via future **Template Registry**; additional Base Templates (dashboard, workflow, mobile) without breaking Foundation |
| **Current state** | Certified motor (`src/ModeloBase1/` ~4.4K LOC). **Only Base Template in code** (D-017). **2 runtime modules**: `empresas`, `cadcps`. G31–G45: **8/9** (G38 fails). Monoliths: **1,518 + 2,407 LOC** (TD-006). Empresas nomenclature coupling (TD-004). |
| **Thousands-of-clients readiness** | **Média** — proven pattern for cadastro CRUD; monoliths and single-template hardcoding limit horizontal feature expansion |
| **Main risks** | Treating ModeloBase1 as the only possible UI blocks future templates; monolith decomposition deferred |
| **Next technical investments** | IFM 1B A2 generic naming; G38 fix; Template Registry spec in MDP Metadata Registry (post-MDP-4) |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Structural SSOT gates G127–G136 | 2.0 | 2.0 | `gate:governance` in CI |
| Thin Cadastro Page pattern enforced | 2.0 | 2.0 | `PAGEMP.jsx`, `PAGCPS.jsx` ~10 LOC |
| ModeloBase1 cert G31–G45 | 2.0 | 1.5 | 8/9 — G38 failure |
| Visual certification v152 | 1.0 | 1.0 | `gate:modelobase1-visual-cert-v152.mjs` exists |
| Generic naming (no domain coupling) | 1.5 | 0.5 | TD-004 |
| Component decomposition | 1.5 | 0.0 | TD-006 |

| **Dependencies** | framework/mak, cadastro-engine |
| **Blockers** | TD-004, TD-006, G38 |
| **Architecture note** | ModeloBase1 ≠ only template forever — see [D-017](./DECISIONS.md#d-017--modelobase1-as-first-official-base-template) |

---

### 4.3 Platform Core

| Field | Value |
|-------|-------|
| **Score** | **6.5 / 10** |
| **2035 target** | L3 — Auth, Tenant, RBAC, Module Entitlements, Platform Event Bus, full Audit, Public API, unified Deploy, APM-ready metrics |
| **Current state** | Custom JWT auth (`backend/src/modules/auth/`). Multi-tenant `cliente_id`. RBAC CONSULTA/OPERADOR/ADMIN (`cadastroRbac.js`). Multi-empresa `PermissaoEmpresa` + `X-Empresa-Id`. `ClienteModulo` licensing. `AuditLog` model. Metrics routes `/api/metrics/*` + HTTP latency (`observability/httpLatencyMetrics.js`). `/api/health`. **No** Platform Event Bus (TD-010). **No** public API / webhooks. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Authentication + session | 1.5 | 1.5 | JWT Fastify auth |
| Tenant isolation | 1.5 | 1.5 | `cliente_id` all operational models |
| RBAC + multi-empresa | 2.0 | 2.0 | `cadastroRbac.js`, `PermissaoEmpresa` |
| Module entitlements | 1.0 | 1.0 | `ClienteModulo` |
| Platform Event Bus | 1.5 | 0.0 | TD-010 — client-side events only |
| Audit trail | 1.0 | 0.5 | `AuditLog` — partial coverage |
| Public API / webhooks | 1.0 | 0.0 | Not implemented |
| Deploy + health ops | 0.5 | 0.5 | `/api/health`, Railway/Vercel deploy |

| **Dependencies** | PostgreSQL, Fastify |
| **Blockers** | TD-010 (event bus) — blocks AI automation, server workflows |
| **Next level (+1.0)** | Implement Platform Event Bus MVP (IFM 1B A5) |
| **Next steps** | **Program 1 → Platform Core implementation** begins post-PMI; A5 event bus design |

---

### 4.4 MAK Data Platform (MDP)

| Field | Value |
|-------|-------|
| **Score** | **8.5 / 10** |
| **2035 target** | L4 — Entity · Data · Relationship Dictionaries + Metadata Registry persisted, versioned, API-accessible; compile + publish pipeline |
| **Current state** | **IFM 1C complete** (D-012, D-022–D-026). Entity ✅ Field ✅ Relationship ✅ Registry ✅ Publish Engine ✅. Transitional boot caches until Program 1E. **MAK Studio (Program 2) next.** |
| **Thousands-of-clients readiness** | **Média** — metadata SSOT proven; runtime hydration + native field migration remain |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Entity Dictionary (API + schema) | 2.5 | 2.5 | MDP-1 `mdp_entity`, G137 |
| Data Dictionary (native + custom) | 2.5 | 2.0 | MDP-2 `mdp_field`; native field debt in `*Form.constants.js` |
| Relationship Dictionary | 2.0 | 2.0 | MDP-3 complete — Empresas pilot |
| Metadata Registry (persisted) | 2.0 | 2.0 | MDP-4 `mdp_registry*` + introspect API, G140 |
| Compile + publish pipeline | 1.0 | 1.0 | MDP-5 CRB, G142, D-026 |

| **Dependencies** | Platform Core RBAC, Foundation hydration (Program 1E) |
| **Blockers** | Program 1E CRB hydration; TD-002 backend registry (1 vs 2 modules) |
| **Next level (+1.0)** | Program 1E Runtime Bridge; native field promotion to MDP-2 |
| **Next steps** | Program 2 MAK Studio + Program 1E parallel |

---

### 4.5 MAK Studio

| Field | Value |
|-------|-------|
| **Score** | **0.5 / 10** |
| **2035 target** | L5 — All `{Name} Studio` designers writing Platform Metadata to MDP; preview via compile + Foundation Runtime |
| **Current state** | **Zero implementation code.** Architecture + Studio list defined in Master Architecture §L5. Config engines edited via legacy `framework/cadastro/` configurators and module JS files. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Studio shell / auth integration | 2.0 | 0.0 | No code |
| Layout + Field Studio (MDP-4 min) | 3.0 | 0.0 | No code |
| Remaining Studio surfaces | 3.0 | 0.0 | No code |
| Publish + preview pipeline | 2.0 | 0.0 | No code |
| Architecture spec complete | — | +0.5 | Master Architecture + Language Standard |

| **Dependencies** | MDP-4 (Metadata Registry + introspection API) |
| **Blockers** | MDP not implemented — D-011 gates Studio to Program 2 |
| **Next level (+1.0)** | MDP-5 publish pipeline; compiled bundle hydrates runtime registries |
| **Next steps** | Complete IFM 1C before Studio (Program 2) |

---

### 4.6 AI Platform

| Field | Value |
|-------|-------|
| **Score** | **0.0 / 10** |
| **2035 target** | L6 — RBAC-bound agents, MDP introspection tools, audit, no direct DB access |
| **Current state** | Zero code. D-009 auth boundaries documented. |

**Criteria:** All implementation criteria 0/10 — no `src/` or `backend/` AI module.

| **Dependencies** | MDP introspection API, Platform Event Bus, Platform Core RBAC |
| **Blockers** | MDP + event bus |
| **Next level (+1.0)** | Agent runtime scaffold + MDP read tool (post-MDP-4) |
| **Next steps** | Program 4 (after MDP + Studio) |

---

### 4.7 Knowledge Platform

| Field | Value |
|-------|-------|
| **Score** | **0.0 / 10** |
| **2035 target** | L6 — Content store + entity/field anchors to MDP |
| **Current state** | Zero code. |

| **Dependencies** | MDP Entity Dictionary, AI Platform (optional) |
| **Blockers** | Not scheduled — Program 5 |
| **Next level (+1.0)** | Content model + `entityId` linking schema |
| **Next steps** | Program 5 |

---

### 4.8 Marketplace

| Field | Value |
|-------|-------|
| **Score** | **1.0 / 10** |
| **2035 target** | L6 — `.makpkg` packages, publisher, sandbox, entitlements, compatibility matrix |
| **Current state** | `ClienteModulo` feature flags only. No package format, registry, or sandbox in code. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Package format + registry | 3.0 | 0.0 | Not implemented |
| Publisher + review flow | 2.0 | 0.0 | Not implemented |
| Sandbox compile | 2.0 | 0.0 | Not implemented |
| Entitlements integration | 2.0 | 0.5 | `ClienteModulo` partial |
| Architecture spec | 1.0 | 0.5 | Master Architecture §L6.1 |

| **Dependencies** | MDP versioning (MDP-5), Platform Core entitlements |
| **Blockers** | MDP publish pipeline |
| **Next steps** | Program 3 (after MDP-5) |

---

### 4.9 Offline Capability

| Field | Value |
|-------|-------|
| **Score** | **1.5 / 10** |
| **2035 target** | L7 — Definition cache, local data store, mutation queue → Sync Platform |
| **Current state** | User preferences localStorage cache + optimistic sync (`syncStatus` pattern). No outbox, no MDP definition snapshots, no IndexedDB/SQLite data cache. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Preferences offline cache | 2.0 | 1.5 | LayoutPreferencesEngine + localStorage |
| Mutation outbox | 3.0 | 0.0 | Not implemented |
| Definition snapshot cache | 3.0 | 0.0 | Not implemented |
| Sync Platform integration | 2.0 | 0.0 | Not implemented |

| **Dependencies** | Sync Platform (L6), MDP compile bundles |
| **Blockers** | Sync Platform not started |
| **Next steps** | Program 6 Omnichannel |

---

### 4.10 Mobile Platform

| Field | Value |
|-------|-------|
| **Score** | **1.0 / 10** |
| **2035 target** | L7 — React Native or PWA + adaptive shell; same MDP compile; mobile layout variants |
| **Current state** | Web-only React app. Responsive CSS exists; no dedicated mobile shell, no app store deployment, no mobile layout variants in MDP. |

**Criteria:** Mobile shell 0/4; adaptive MDP layouts 0/3; shared compile 0/2; responsive web +1.0 partial.

| **Dependencies** | MDP mobile layout types, Compiled Runtime bundle |
| **Next steps** | Program 6 — after Web runtime stable |

---

### 4.11 Desktop Platform

| Field | Value |
|-------|-------|
| **Score** | **0.0 / 10** |
| **2035 target** | L7 — Tauri/Electron + shared runtime bundle |
| **Current state** | Zero desktop shell code. |

| **Dependencies** | Compiled Runtime export, Sync Platform |
| **Next steps** | Program 6; Tauri vs Electron decision (D-014 pending) |

---

### 4.12 SDK

| Field | Value |
|-------|-------|
| **Score** | **0.0 / 10** |
| **2035 target** | `@mak/sdk-core`, `@mak/sdk-studio`, `@mak/sdk-agent`, `@mak/cli` |
| **Current state** | Zero npm packages. Architecture defines SDK surface in Master Architecture §5. |

| **Dependencies** | MDP public API, Marketplace package format |
| **Next steps** | Program 3 Ecosystem |

---

### 4.13 Extensions

| Field | Value |
|-------|-------|
| **Score** | **0.5 / 10** |
| **2035 target** | Platform Extensions via MAK Package or approved SDK — **MDP-only**, no Foundation code injection |
| **Current state** | Spec only (`.makpkg` format in Master Architecture). No extension loader in runtime. |

| **Dependencies** | Marketplace, MDP versioning |
| **Next steps** | Program 3 |

---

### 4.14 Versionamento

| Field | Value |
|-------|-------|
| **Score** | **2.0 / 10** |
| **2035 target** | MDP semantic versioning + revision; pinned compiled runtime per tenant/environment; `makpkg` version matrix |
| **Current state** | `versao_schema` in user preferences only. Static module JS configs. No MDP draft/publish/version API. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| MDP definition versioning | 4.0 | 0.0 | Not implemented |
| Runtime version pinning | 3.0 | 0.0 | Not implemented |
| User prefs schema version | 2.0 | 2.0 | `versao_schema` in preferences |
| Package compatibility matrix | 1.0 | 0.0 | Not implemented |

| **Dependencies** | MDP-5 |
| **Next steps** | IFM 1C MDP-5 |

---

### 4.15 Deploy Platform

| Field | Value |
|-------|-------|
| **Score** | **5.0 / 10** |
| **2035 target** | Unified deploy pipeline — MDP publish → compile → tenant activation → runtime hydration; rollback by version |
| **Current state** | Vercel (frontend) + Railway (backend) production deploy. `/api/health` diagnostics. Prisma migrate (11 migrations). Dual DDL path `ensureSchema.js` (TD-005). **No** module definition deploy pipeline. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Production hosting (web + API) | 2.0 | 2.0 | Vercel + Railway |
| Health + boot diagnostics | 1.5 | 1.5 | `/api/health` |
| Schema migration primary path | 2.0 | 1.0 | Prisma migrate + TD-005 dual path |
| MDP publish → deploy pipeline | 3.0 | 0.0 | Not implemented |
| Environment rollback | 1.5 | 0.5 | Git/deploy rollback only |

| **Dependencies** | MDP-5, Platform Core |
| **Blockers** | TD-005 |
| **Next steps** | IFM 1A S4; MDP-5 publish pipeline |

---

### 4.16 Observabilidade

| Field | Value |
|-------|-------|
| **Score** | **4.5 / 10** |
| **2035 target** | Full APM — latency, counters, tracing, tenant-scoped dashboards, alert hooks |
| **Current state** | HTTP latency snapshot (`backend/src/observability/httpLatencyMetrics.js`). Register counters (`metricsService.js`, `counterService.js`). Debug latency routes. `/api/metrics/contadores`, `/api/metrics/http-latency`. **No** distributed tracing, **no** APM integration, **no** structured log aggregation. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| HTTP latency metrics | 2.0 | 2.0 | `httpLatencyMetrics.js` |
| Business counters | 2.0 | 1.5 | `counterService.js` — partial entity coverage |
| Health diagnostics | 1.5 | 1.0 | `/api/health` |
| Distributed tracing / APM | 2.5 | 0.0 | Not implemented |
| Tenant-scoped observability dashboards | 2.0 | 0.0 | Not implemented |

| **Dependencies** | Platform Core |
| **Next steps** | Platform Core implementation — structured logging + APM adapter |

---

### 4.17 Segurança

| Field | Value |
|-------|-------|
| **Score** | **6.5 / 10** |
| **2035 target** | JWT + SSO/MFA, RBAC everywhere (incl. AI/Marketplace), audit all mutations, zero critical vulns, tenant isolation proven |
| **Current state** | Custom JWT + bcrypt. RBAC 3 roles. Tenant `cliente_id` isolation. Module guard. E2E isolation tests exist. **npm audit: 15 vulnerabilities** (1 low, 5 moderate, 9 high) — TD-008. No MFA/SSO. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Auth (JWT + password hash) | 2.0 | 2.0 | `authService.js` |
| RBAC + tenant isolation | 2.5 | 2.5 | `cadastroRbac.js`, E2E isolation specs |
| Audit on sensitive ops | 1.5 | 1.0 | `AuditLog` partial |
| Dependency security | 2.0 | 0.5 | TD-008 — 15 vulns |
| MFA / SSO | 1.0 | 0.0 | Not implemented |
| AI/Marketplace security model | 1.0 | 0.5 | Documented only (Master Architecture rules) |

| **Dependencies** | Platform Core |
| **Blockers** | TD-008 |
| **Next steps** | IFM 1A S3 npm audit; MFA in Platform Core roadmap |

---

### 4.18 Performance

| Field | Value |
|-------|-------|
| **Score** | **6.0 / 10** |
| **2035 target** | Sub-second cadastro interactions at scale; decomposed components; optimized bundles; DB indexes for all tenant queries |
| **Current state** | `@tanstack/react-virtual` table + cards. ~60 DB indexes. Main chunk **485 KB** (141 KB gzip). MG prototype CSS **281 KB**. Monolith components TD-006. Stress E2E exists (`empresas-render-stress.spec.js`). |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| List virtualization | 2.0 | 2.0 | react-virtual in table/cards |
| DB indexing (multi-tenant) | 2.0 | 2.0 | ~60 indexes in schema |
| Bundle size (main gzip) | 2.0 | 1.0 | 141 KB gzip — acceptable but CSS heavy |
| Component decomposition | 2.0 | 0.0 | TD-006 monoliths |
| Load/stress validation | 2.0 | 1.0 | Stress E2E — empresas only |

| **Dependencies** | IFM 1B A3 decomposition |
| **Blockers** | TD-006, TD-007 dual CSS |
| **Next steps** | A3 table decomposition; CSS consolidation (A4 partial) |

---

### 4.19 Governança

| Field | Value |
|-------|-------|
| **Score** | **8.5 / 10** |
| **2035 target** | Constitution + Master Architecture + Language Standard + PMI + full gate automation G31–G261 in CI + amendment process enforced |
| **Current state** | Constitution v1.0.0 (11 docs). Master Architecture v1.0.0. Language Standard v1.0.0. Engineering OS complete. **21 gate scripts**. CI runs G31–G136 + G156–G261 (IFM 1D-1). `verify:governance:cycles` (5 cycles). Documentation certified Mission 0.2. |

**Criteria:**

| Criterion | Pts | Earned | Evidence |
|-----------|-----|--------|----------|
| Constitution + hierarchy | 2.0 | 2.0 | `docs/constitution/` |
| Master Architecture + Language + PMI | 2.0 | 2.0 | Programs 0.5–0.6 complete |
| Gate scripts G31–G261 exist | 2.0 | 2.0 | 21 scripts in `scripts/` |
| CI automation (default path) | 2.0 | 2.0 | G31–G136 + G156–G261 parallel matrix |
| Engineering OS + certification | 1.5 | 1.5 | Mission 0.2 certified |
| 5-cycle release verification | 0.5 | 0.5 | `verify:governance:cycles` |

| **Dependencies** | None — meta-layer |
| **Blockers** | — |
| **Next level (+1.0)** | Staging workflow; E2E in CI |
| **Next steps** | IFM 1D; update PMI each mission |

---

---

## 5. Infrastructure & Operations Assessments

### 5.1 Frontend

| Field | Value |
|-------|-------|
| **Score** | **6.5 / 10** |
| **2035 target** | Compiled Runtime shell — optimized bundles, unified design tokens, adaptive layouts (web/mobile/desktop), Template Registry integration |
| **Current state** | React 18 + Vite 6 + React Query + Tailwind/shadcn. Build ✅. Main chunk **485 KB** (141 KB gzip). Dual CSS: shadcn + MG prototype **281 KB** (TD-007). `@tanstack/react-virtual`. **0** unit test files (`*.test.*`). |
| **Thousands-of-clients readiness** | **Média** — CDN-static deploy scales; bundle weight and monoliths limit per-client customization at scale |
| **Main risks** | Bundle growth; dual design system; UI monolith change risk (TD-006) |
| **Next technical investments** | A3/A4 decomposition + CSS consolidation; Template Registry consumer hook (post-MDP) |

**Criteria:** Build+lint CI (2/2) · Virtualization (2/2) · Bundle size (1/2) · Design system unity (0/2) · Test coverage (0/2) · Template pluggability (0.5/2 partial — ModeloBase1 only)

---

### 5.2 Backend

| Field | Value |
|-------|-------|
| **Score** | **6.5 / 10** |
| **2035 target** | Platform Core services — event bus, public API, webhooks, horizontal scale, full audit |
| **Current state** | Fastify 5 (`backend/src/` ~8K LOC). **14 module folders**. JWT auth. Prisma 6. Dynamic route registration. `/api/health` with DB/storage checks. Metrics module. **No** event bus (TD-010). Backend registry **1 module** vs frontend **2** (TD-002). |
| **Thousands-of-clients readiness** | **Média** — tenant isolation in queries; single-process Railway deploy; no queue/worker tier |
| **Main risks** | Registry desync; no server-side automation; schema boot dual path |
| **Next technical investments** | S2 registry sync; A5 Platform Event Bus; structured logging |

**Criteria:** Auth+CRUD (2/2) · Health (1/1) · Metrics partial (1/1.5) · Event bus (0/2) · Public API (0/1.5) · Registry SSOT (0/1) · Horizontal scale design (0/1)

---

### 5.3 Banco de Dados

| Field | Value |
|-------|-------|
| **Score** | **6.0 / 10** |
| **2035 target** | PostgreSQL — MDP definitions + business data; read replicas; tenant sharding strategy; Prisma-only migrations |
| **Current state** | **17** Prisma models. **11** migrations. **~60** indexes. All operational models scoped by `cliente_id`. Dual DDL: Prisma migrate + `ensureSchema.js` (TD-005). **No** read replicas or connection pooling config in repo. |
| **Thousands-of-clients readiness** | **Média** — indexes and tenant column present; no proven sharding/partitioning; connection limits unknown at 1K tenants |
| **Main risks** | TD-005 schema drift; connection pool exhaustion; backup not codified |
| **Next technical investments** | S4 Prisma-only primary path; index review per tenant query; replica strategy doc + POC |

**Criteria:** Multi-tenant schema (2.5/2.5) · Migrations (1.5/2) · Indexes (2/2) · Single DDL path (0/1.5) · Replicas/sharding (0/1) · MDP tables (0/1)

---

### 5.4 APIs

| Field | Value |
|-------|-------|
| **Score** | **5.5 / 10** |
| **2035 target** | `/api/*` business + `/api/mdp/*` metadata + `/api/public/v1/*` partner + webhooks + OpenAPI catalog |
| **Current state** | Internal REST under `/api/*` — auth, empresas, cadcps, cadastro fields, preferences, anexos, metrics, clienteModulo. JWT + tenant scope. **No** OpenAPI spec. **No** public/partner API. **No** MDP API. **No** webhooks. |
| **Thousands-of-clients readiness** | **Média** — REST CRUD proven; rate limiting and API keys not implemented |
| **Main risks** | Ad-hoc endpoint growth without catalog; no versioning on public surface |
| **Next technical investments** | MDP-1 `/api/mdp/entities`; OpenAPI generation from routes; rate limit middleware |

**Criteria:** Core CRUD API (2.5/3) · Auth boundary (2/2) · Health/metrics (1/1.5) · MDP API (0/2) · Public API (0/1.5) · OpenAPI (0/1)

---

### 5.5 Escalabilidade

| Field | Value |
|-------|-------|
| **Score** | **5.0 / 10** |
| **2035 target** | Horizontal API tier, Redis cache, read replicas, CDN edge, Sync relay nodes, tenant-aware autoscaling |
| **Current state** | Vercel CDN for static frontend. Single Railway API instance pattern. Redis **optional** (documented in Master Architecture, not required in code). DB indexes ~60. Virtualized lists. **No** load tests in CI. **No** autoscaling config in repo. |
| **Thousands-of-clients readiness** | **Baixa** — architecture allows scale; implementation is single-tenant-instance pattern |
| **Main risks** | DB becomes bottleneck first; no cache layer enforced; monolith frontend/backend deploy units |
| **Next technical investments** | Redis for rate limit + session denylist; DB read replica; load test gate in CI |

**Criteria:** CDN static (1.5/2) · DB indexes (2/2) · List virtualization (1.5/2) · Cache layer (0/2) · Horizontal API (0/1.5) · Load testing (0/1.5)

---

### 5.6 CI/CD

| Field | Value |
|-------|-------|
| **Score** | **7.0 / 10** |
| **2035 target** | Full gate suite G31–G261 in CI; staging → production; MDP publish pipeline gates; rollback automation |
| **Current state** | `.github/workflows/foundation-governance.yml` — build + lint + typecheck:governance + G31–G136 + parallel G156–G261 matrix on push/PR. `sync-main-deploy.yml` branch sync. **21** gate scripts exist. **No** staging environment in workflow. Deploy = git push → Vercel/Railway. |
| **Thousands-of-clients readiness** | **Média-Alta** — CI catches Foundation + capability regressions |
| **Main risks** | No canary/staging gate before prod; TD-009 typecheck noise |
| **Next technical investments** | Staging workflow; npm audit in CI; MDP deploy gates |

**Criteria:** Build+lint CI (2/2) · G31–G136 (2/2) · V13–V20 CI (2/2) · E2E in CI (0.5/1) · Staging pipeline (0/1.5) · MDP deploy gates (0/1.5)

---

### 5.7 Testes

| Field | Value |
|-------|-------|
| **Score** | **5.5 / 10** |
| **2035 target** | Unit + integration + E2E + gate architecture tests; tenant isolation proven; CI blocks on failure |
| **Current state** | **12** Playwright E2E specs (`e2e/*.spec.js`) — empresas-heavy. **21** gate scripts as architecture tests. **0** `*.test.*` unit files. E2E **not in default CI** workflow. Isolation tests: `empresas-preferences-isolation-*.spec.js`. |
| **Thousands-of-clients readiness** | **Média** — preferences isolation tested; no systematic multi-tenant load/security test suite |
| **Main risks** | Regression in engines undetected without manual verify; low unit coverage |
| **Next technical investments** | Add E2E smoke to CI; unit tests for cadastro-engine pure functions; tenant isolation gate expansion |

**Criteria:** E2E exists (2/3) · Architecture gates (2.5/3) · Unit tests (0/2) · CI integration (0.5/1.5) · Security/isolation tests (0.5/1.5)

---

### 5.8 Migração de Dados

| Field | Value |
|-------|-------|
| **Score** | **4.5 / 10** |
| **2035 target** | Prisma-only migrations; tenant data export/import; MDP definition migration between versions; zero-downtime deploy |
| **Current state** | **11** Prisma migrations. `ensureSchema.js` boot-time DDL supplement (TD-005). `resetAndSeedMaike.sql` seed script. **No** tenant export/import tooling. **No** MDP version migration tooling. |
| **Thousands-of-clients readiness** | **Baixa** — schema migrations work for single DB; no per-tenant migration platform |
| **Main risks** | Dual DDL drift; no rollback playbook for failed migration at scale |
| **Next technical investments** | S4 consolidate DDL; Migration Platform spec (§5.17); Prisma migrate deploy in CI smoke |

**Criteria:** Prisma migrate (2/3) · Single DDL path (0/2) · Seed/bootstrap (1.5/2) · Tenant export/import (0/2) · Zero-downtime (0/1)

---

### 5.9 Multi-tenant

| Field | Value |
|-------|-------|
| **Score** | **7.5 / 10** |
| **2035 target** | Hard tenant isolation on all L0–L4 operations; usage metering; tenant-scoped observability |
| **Current state** | `cliente_id` on all operational Prisma models. JWT embeds tenant context. Backend queries scoped. Module guard (`moduleGuard.js`). E2E isolation specs. **No** usage metering. |
| **Thousands-of-clients readiness** | **Média–Alta** — data model and auth proven; metering and noisy-neighbor controls missing |
| **Main risks** | Missing query audit for cross-tenant leaks; no automated penetration test |
| **Next technical investments** | Tenant isolation security gate; query middleware audit; usage counters per tenant |

**Criteria:** Schema isolation (3/3) · Auth scope (2.5/2.5) · Module guard (1.5/1.5) · E2E proof (0.5/1) · Metering (0/1.5) · Observability per tenant (0/1)

---

### 5.10 Multiempresa

| Field | Value |
|-------|-------|
| **Score** | **7.0 / 10** |
| **2035 target** | Company scope within tenant — RBAC, header propagation, CADCPS per-empresa, audit per company |
| **Current state** | `Empresa` model. `PermissaoEmpresa` RBAC. `X-Empresa-Id` header. CADCPS `CadCpsCampoEmpresa` applicability. Empresas module reference implementation. |
| **Thousands-of-clients readiness** | **Média–Alta** — pattern works for current modules; not all modules exercise multi-empresa |
| **Main risks** | Header omission bugs; CADCPS empresa scope complexity |
| **Next technical investments** | Gate for empresa header on scoped routes; document multi-empresa contract in MDP Entity Dictionary |

**Criteria:** Model + RBAC (3/3) · Header contract (2/2) · CADCPS scope (1.5/2) · Cross-module consistency (0.5/2) · Audit per empresa (0/1)

---

### 5.11 Backup e Recuperação

| Field | Value |
|-------|-------|
| **Score** | **2.5 / 10** |
| **2035 target** | Automated DB backups, point-in-time recovery, tenant restore, disaster recovery runbook, RPO/RTO defined |
| **Current state** | **No backup automation in repository.** Relies on Railway PostgreSQL / Supabase host capabilities. No DR runbook in official docs. No tenant-level restore tooling. |
| **Thousands-of-clients readiness** | **Baixa** — operational risk at any scale; critical gap for enterprise SLA |
| **Main risks** | Data loss on provider failure; no tested restore procedure |
| **Next technical investments** | Document RPO/RTO; automated pg_dump schedule; restore drill runbook; Platform Core backup service spec |

**Criteria:** Host backup assumed (1/4) · Codified runbook (0/2) · Tenant restore (0/2) · DR testing (0/1) · PITR (0/1)

---

### 5.12 Versionamento

| Field | Value |
|-------|-------|
| **Score** | **2.0 / 10** |
| **2035 target** | MDP semantic versioning; pinned compiled runtime per environment; `makpkg` compatibility matrix |
| **Current state** | `versao_schema` in user preferences. Static module JS configs. Foundation `governance-baseline.json` v10.1.0. **No** MDP version API. |
| **Thousands-of-clients readiness** | **Baixa** — cannot roll back module definitions per tenant at scale |
| **Main risks** | Breaking config change affects all users simultaneously |
| **Next technical investments** | IFM 1C MDP-5; preference overlay on published version |

*(See also §4.14 in v1.0 — merged here as canonical infrastructure entry.)*

---

### 5.13 Publicação

| Field | Value |
|-------|-------|
| **Score** | **1.5 / 10** |
| **2035 target** | Studio → validate → MDP publish → compile → tenant activation pipeline with rollback |
| **Current state** | Git-based deploy only. Module configs are static JS in repo. **No** definition publish API. **No** draft/published states for module metadata. |
| **Thousands-of-clients readiness** | **Baixa** — every config change requires code deploy |
| **Main risks** | Cannot offer low-code publish to tenants; deployment coupling slows iteration |
| **Next technical investments** | MDP-5 publish pipeline; draft/published in Metadata Registry |

---

### 5.14 Deploy

| Field | Value |
|-------|-------|
| **Score** | **5.0 / 10** |
| **2035 target** | Unified Runtime Deploy — environment promotion, health gates, MDP version activation, rollback |
| **Current state** | Vercel (frontend) + Railway (backend). `/api/health`. Prisma migrate on deploy. Git-triggered. **No** MDP-aware deploy. **No** formal staging. |
| **Thousands-of-clients readiness** | **Média** — works for current SaaS; not tenant-definition-aware |
| **Main risks** | Dual DDL (TD-005); no blue/green |
| **Next technical investments** | S4 DDL consolidation; staging environment; health gate before traffic shift |

*(Consolidates former §4.15 Deploy Platform.)*

---

### 5.15 Segurança

*(Canonical infrastructure entry — same score as platform layer.)*

| Field | Value |
|-------|-------|
| **Score** | **6.5 / 10** |
| **2035 target** | JWT + SSO/MFA, RBAC everywhere, zero critical vulns, tenant isolation proven, AI/Marketplace guardrails |
| **Current state** | JWT + bcrypt. RBAC 3 roles. Tenant isolation. **npm audit: 15 vulns** (TD-008). No MFA/SSO. |
| **Thousands-of-clients readiness** | **Média** — core auth solid; supply chain and MFA gaps block enterprise tier |
| **Main risks** | TD-008 high-severity npm packages; no security gate in CI |
| **Next technical investments** | S3 npm audit; MFA roadmap; dependency scan in CI |

---

### 5.16 Performance

| Field | Value |
|-------|-------|
| **Score** | **6.0 / 10** |
| **2035 target** | Sub-second cadastro at scale; optimized bundles; decomposed components |
| **Current state** | react-virtual lists. ~60 DB indexes. Main 141 KB gzip. Stress E2E. Monoliths TD-006. |
| **Thousands-of-clients readiness** | **Média** — virtualization helps; monoliths and CSS weight cap headroom |
| **Main risks** | Table re-render cost at large datasets; bundle growth |
| **Next technical investments** | A3 decomposition; bundle budget gate; query profiling |

---

### 5.17 Observabilidade

| Field | Value |
|-------|-------|
| **Score** | **4.5 / 10** |
| **2035 target** | Full APM, tracing, tenant dashboards, alert hooks |
| **Current state** | HTTP latency metrics. Business counters. `/api/health`. No tracing/APM. |
| **Thousands-of-clients readiness** | **Baixa** — cannot diagnose per-tenant issues at scale |
| **Main risks** | Blind spots in production incidents |
| **Next technical investments** | Structured JSON logging; OpenTelemetry adapter; tenant-scoped metrics dashboard |

---

### 5.18 Migration Platform

| Field | Value |
|-------|-------|
| **Score** | **0.5 / 10** |
| **2035 target** | **Migration Platform** — tenant data import/export, schema version upgrades, module definition migration, rollback, validation sandbox |
| **Current state** | **Not implemented.** Prisma migrations cover schema only. No tenant export/import. No cross-version module migration tooling. Architecture slot: Platform Core + MDP integration (future). |
| **Thousands-of-clients readiness** | **Baixa** — onboarding/migration at scale requires manual work |
| **Main risks** | Enterprise deals blocked without migration story |
| **Next technical investments** | Spec Migration Platform API; pilot tenant export for empresas; integrate with MDP-5 versioning |

**Criteria:** Architecture defined (0.5/1) · All implementation criteria (0/9)

---

## 6. Cross-Area Dependency Graph

```
Governança (8.5) ──enables──► Foundation (7.0) ──► ModeloBase1 (7.0)
                                    │
Platform Core (6.5) ◄── IFM 1A–1B ─┤
        │                            │
        ▼                            ▼
MAK DATA PLATFORM (2.0) ◄── IFM 1C ──┘
        │
        ├──► MAK Studio (0.5)
        ├──► Versionamento (2.0)
        ├──► Deploy Platform (5.0)
        │
        ▼
Marketplace (1.0) · SDK (0) · Extensions (0.5)
        │
        ▼
AI Platform (0) · Knowledge Platform (0)
        │
        ▼
Sync Platform ──► Offline (1.5) · Mobile (1.0) · Desktop (0)
```

---

## 7. Update Protocol

1. **When to update:** Any mission touching Foundation, Platform Core, MDP, Studio, security, deploy, or governance.
2. **How:** Re-run evidence commands; adjust criteria earned points; update Executive Dashboard; set `Last verified` date.
3. **Where else to sync:** [CURRENT-STATE.md](./CURRENT-STATE.md), [CAPABILITIES-REGISTRY.md](./CAPABILITIES-REGISTRY.md), [TECH-DEBT.md](./TECH-DEBT.md) as applicable.
4. **Amendment:** Scoring methodology changes require D-register entry.

---

## 8. Structural Documentation Phase

**IFM 1C (MDP) complete.** Next missions (D-027):

1. **Program 2 — MAK Studio** — Layout Studio empresas pilot (primary)
2. **Program 1E — Runtime Bridge** — CRB hydration (parallel co-requisite)
3. **IFM 1B A5** — Event Bus MVP (after Studio Layout MVP)
4. **IFM 1B A1/A2** — legacy promotion (background)

Documentation updates continue per [11-PERMANENT-GOVERNANCE-DIRECTIVE.md](../constitution/11-PERMANENT-GOVERNANCE-DIRECTIVE.md).

---

## 9. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.2.0 | 2026-06-29 | Post-MDP reassessment — MDP 8.5, Versionamento 7.5, Publicação 7.0; D-027 next programs |
| 1.3.0 | 2026-06-29 | **ERI (Enterprise Readiness Index)** — D-028; Program 1F map; 7 dimensions |
| 1.1.0 | 2026-06-28 | Strategic expansion — 32 areas; infra/ops section; standard assessment fields; Base Template 1 (D-017) |
| 1.0.0 | 2026-06-28 | Initial PMI — Program 0.6, D-016 |

---

*This index is the official maturity dashboard. Justify scores with evidence, not opinion.*
