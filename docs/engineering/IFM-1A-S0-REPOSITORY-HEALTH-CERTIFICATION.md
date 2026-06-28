# IFM 1A — S0 Repository Health Certification

**Mission:** IFM 1A — S0 — Repository Health Certification  
**Program:** Programa 1 — Integridade e Fundação de Metadados (IFM)  
**Date:** 2026-06-28  
**Method:** Repository Health Protocol (RHP) §10 — full audit per `PLATFORM-IMPLEMENTATION-PROTOCOL.md` (pending merge, PR #289)  
**Scope:** Git, GitHub PRs, deploy, engineering gates, database/registries, documentation  
**Code changes:** None — audit and certification only

---

## Executive Summary

| Area | Verdict |
|------|---------|
| Git / branches | **Healthy** — `main` synced; no local conflicts; 2 open doc PRs |
| CI / governance | **FAILING** — G38 + G118 block `Foundation Governance` on `main` |
| Deploy / production | **Healthy** — Railway API + Vercel frontend respond 200 |
| Build / lint | **Pass** |
| Gates V13–V20 | **Pass** (manual run) |
| Registries | **Desync** — FE 2 modules, BE 1 module |
| Documentation | **Drift** — several docs stale after PR #285 (Marcas/Produtos removal) |
| IFM readiness | **Not certified** — blockers must be resolved before implementation era |

**Merges performed this mission:** None (open PRs are draft + CI red; not safe to merge).

**Corrections performed this mission:** None (S0 is read-only certification; fixes deferred to IFM 1A S2+).

---

## 1. Git Audit

### 1.1 Branch state

| Item | Evidence |
|------|----------|
| Current branch | `main` @ `6ed9eb75` — *Merge branch 'cursor/mak-platform-language-579b' into main* |
| Local vs remote | `0 0` divergence (`git rev-list --left-right --count origin/main...HEAD`) |
| Working tree | Clean |
| Pending merge conflicts | None |

### 1.2 Remote branches

| Metric | Count |
|--------|-------|
| Remote branches merged into `main` | 154 |
| Remote branches not merged into `main` | ~20+ (historical feature branches) |

**Notable unmerged branches (intentional — open work):**

- `cursor/platform-maturity-index-579b` → PR #288
- `cursor/platform-implementation-protocol-579b` → PR #289

**Orphan / stale branches:** Many historical `cursor/*-7d24` and `cursor/*-7ea5` branches remain on remote but do not block `main`. No action required in S0.

### 1.3 Recent merges on `main`

| PR | Title | Merged |
|----|-------|--------|
| #287 | Program 0.5 — Platform Language Standard (D-015) | 2026-06-28 |
| #286 | MAK Platform Constitution (Mission 0.1) | 2026-06-28 |
| #285 | Remove cadastros Marcas e Produtos | 2026-06-28 |
| #284 | Workflow Configuration Engine (V20) | 2026-06-28 |

---

## 2. Pull Request Analysis

### 2.1 Open PRs

#### PR #288 — Platform Maturity Index (D-017)

| Field | Value |
|-------|-------|
| Branch | `cursor/platform-maturity-index-579b` → `main` |
| Status | **Draft**, MERGEABLE, UNSTABLE |
| Conflicts | **None** |
| Checks | governance **FAILURE**; Vercel **SUCCESS**; Supabase SKIPPED |
| Dependencies | Should merge **before** PR #289 (foundational PMI doc) |
| Recommendation | **Merge after gate blockers fixed** — doc-only; resolves CURRENT-STATE/ROADMAP/TECH-DEBT drift for post-#285 world |

**Files:** 12 doc files including new `PLATFORM-MATURITY-INDEX.md`, sync fixes to CURRENT-STATE, ROADMAP, TECH-DEBT (marks TD-001 obsolete, removes S1 Produto migration).

#### PR #289 — Platform Implementation Protocol (D-018/D-019)

| Field | Value |
|-------|-------|
| Branch | `cursor/platform-implementation-protocol-579b` → `main` |
| Status | **Draft**, MERGEABLE, UNSTABLE |
| Conflicts | **None** |
| Checks | governance **FAILURE**; Vercel **SUCCESS**; Supabase SKIPPED |
| Dependencies | Merge **after** PR #288 (may touch overlapping doc files) |
| Recommendation | **Merge after #288 + gate blockers fixed** — establishes PIP/RHP for all IFM missions |

### 2.2 PRs ready for merge

**None.** Both open PRs fail `Foundation Governance` CI. Root cause is pre-existing gate failures on `main` (G38, G118), not PR-specific regressions.

### 2.3 Merges executed

None.

---

## 3. Deploy Validation

### 3.1 Railway (backend production)

```
GET https://projetomg-production.up.railway.app/api/health → HTTP 200

{
  "ok": true,
  "alive": true,
  "ready": true,
  "service": "erp-backend",
  "db": { "configured": true, "connected": true, "error": null },
  "supabase": { "authConfigured": true, "storageConfigured": true, "storageConnected": true }
}
```

### 3.2 Vercel (frontend production)

```
GET https://projetomg.vercel.app/ → HTTP 200
```

### 3.3 GitHub Actions

| Workflow | Last `main` run | Result |
|----------|-----------------|--------|
| Sync main for deploy | push `6ed9eb75` | **SUCCESS** |
| Foundation Governance | push `6ed9eb75` | **FAILURE** |

**Conclusion:** Deploy pipelines succeed; governance gate is the quality blocker, not deploy.

---

## 4. Engineering Validation

### 4.1 Core commands (`main` @ 2026-06-28)

| Command | Result | Notes |
|---------|--------|-------|
| `npm run build` | ✅ Pass | Vite production build ~3.6s |
| `npm run lint` | ✅ Pass | 0 ESLint errors |
| `npm run typecheck` | ⚠️ Exit 0 | Known JSX/shadcn noise in `src/shared/ui/*` (~40 TS errors) |
| `npm run verify:governance` | ❌ Exit 1 | Stops at `gate:certification` (G38) |
| `npm run gate:certification` | ❌ Exit 1 | G31–G45: **8/9** |
| `npm run gate:governance` | ❌ Exit 1 | G109–G136: **18/19** |

### 4.2 Failing gates (blockers)

#### G38 — CADCPS sem componentes duplicados

| Field | Value |
|-------|-------|
| Script | `scripts/gate-modelo-base1-cert.mjs` L108–123 |
| Violation | 1 file matches forbidden pattern `useCadcps` |
| File | `src/modules/cadcps/runtime/useCadcpsFormResources.js` |
| Root cause | Gate scans filename for `useCadcps`; domain hook is legitimate but triggers false-positive structural duplication check |
| IFM fix | IFM 1A — rename or allowlist in gate baseline (structural hygiene mission) |

#### G118 — Registry cadastro-modules é fonte oficial

| Field | Value |
|-------|-------|
| Script | `scripts/gate-foundation-governance.mjs` L270–274 |
| Condition | `certifiedModuleIds.length >= 3` |
| Current count | **2** (`empresas`, `cadcps`) |
| Root cause | Gate baseline not updated after PR #285 removed `marcas`/`produtos` |
| IFM fix | Update gate threshold to `>= 2` + sync backend registry (S2) |

### 4.3 Config engine gates (V13–V20) — manual run

| Gate | Result |
|------|--------|
| V13 Layout (G156–G165) | ✅ 10/10 |
| V14 Field (G166–G175) | ✅ 10/10 |
| V16 Validation (G207–G217) | ✅ 11/11 |
| V17 Formula (G218–G228) | ✅ 11/11 |
| V18 Events (G229–G239) | ✅ 11/11 |
| V19 Actions (G240–G250) | ✅ 11/11 |
| V20 Workflow (G251–G261) | ✅ 11/11 |

**Note:** V13–V20 gates are **not in default CI** (TD-013).

### 4.4 Supply chain

| Package | Vulnerabilities |
|---------|-----------------|
| Frontend (`npm audit`) | 15 total — 1 low, 5 moderate, 9 high |
| Backend (`npm audit`) | 0 |

### 4.5 Smoke / E2E

Not executed — requires Playwright + backend `.php or mock setup. Deferred to IFM 1A stability sprint (not blocking S0 certification conclusion).

---

## 5. Database & Registry Validation

### 5.1 Prisma schema (`main`)

| Metric | Value |
|--------|-------|
| Models | **17** (no `Produto`, no `Marca`) |
| Migrations | **11** files |
| Latest | `20260628120000_remove_marcas_produtos` |

**Schema ↔ migrations:** Consistent — removal migration exists; no orphan Produto/Marca models.

**Live DB migrate status:** Not verified locally (no `backend/.env`). Production health endpoint reports DB connected.

### 5.2 Registry sync

| Registry | Path | Modules |
|----------|------|---------|
| Frontend SSOT | `config/cadastro-modules.registry.json` | **2** — empresas, cadcps |
| Backend | `backend/config/cadastro-modules.registry.json` | **1** — empresas only |
| Generated routes | `src/modules/generatedModules.json` | **2** — matches frontend |

**Verdict:** Backend registry missing `cadcps` (TD-002). Frontend/backend **not synchronized**.

### 5.3 Runtime modules

| moduleId | Folder exists | In registry |
|----------|---------------|-------------|
| empresas | ✅ | FE + BE |
| cadcps | ✅ | FE only |
| marcas | ❌ removed | — |
| produtos | ❌ removed | — |

---

## 6. Documentation Validation

### 6.1 Documents on `main`

| Document | Status | Drift |
|----------|--------|-------|
| CURRENT-STATE.md | Present | ❌ Claims 4 runtime modules (marcas, produtos); 19 models; 10 migrations; verify:governance ✅ |
| ROADMAP.md | Present | ❌ S1 Produto migration still P0; references marcas/produtos pattern |
| NEXT-SPRINT.md | Present | ❌ P0 Produto migration; backend sync "4 modules" |
| TECH-DEBT.md | Present | ❌ TD-001 open (Produto migration); TD-002 cites "4 modules" |
| DECISIONS.md | Present | ✅ D-001–D-015 on main |
| ENGINEERING-JOURNAL.md | Present | ⚠️ Last entry Program 0.5; missing 0.6/0.7/IFM S0 |
| PLATFORM-MATURITY-INDEX.md | **Missing** | On PR #288 only |
| PLATFORM-IMPLEMENTATION-PROTOCOL.md | **Missing** | On PR #289 only |

### 6.2 Documentation vs code — key divergences

| Doc claim | Code reality |
|-----------|--------------|
| 4 runtime modules | **2** (empresas, cadcps) |
| 19 Prisma models | **17** |
| 10 migrations | **11** |
| `verify:governance` passes | **Fails** (G38) |
| TD-001 Produto migration P0 | **Obsolete** — Produto removed PR #285 |
| Backend registry 4 modules | **1** module |

**Remediation:** PR #288 contains doc sync fixes; merge after gate blockers resolved.

---

## 7. Inconsistencies Found

| ID | Severity | Area | Description |
|----|----------|------|-------------|
| I-01 | **P0** | Gates | G38 fails — `useCadcpsFormResources.js` triggers duplication check |
| I-02 | **P0** | Gates | G118 fails — threshold `>= 3` modules after marcas/produtos removal |
| I-03 | **P0** | CI | `Foundation Governance` red on every `main` push since PR #285 |
| I-04 | **P1** | Registry | Backend missing `cadcps` entry (TD-002) |
| I-05 | **P1** | Docs | CURRENT-STATE, ROADMAP, NEXT-SPRINT, TECH-DEBT stale post-#285 |
| I-06 | **P1** | Docs | PMI + PIP not on `main` (PRs #288, #289 draft) |
| I-07 | **P2** | Security | 15 frontend npm audit vulnerabilities (TD-008) |
| I-08 | **P2** | CI | V13–V20 gates not in default CI (TD-013) |

---

## 8. Corrections Performed (S0)

| Action | Status |
|--------|--------|
| Code fixes | **None** — S0 scope is certification only |
| PR merges | **None** — blockers prevent safe merge |
| Doc updates on `main` | **None** — fixes pending in PR #288/#289 |

---

## 9. Recommended Next Actions (IFM 1A)

Priority order before new feature work:

1. **IFM 1A — S0.1 Gate baseline repair** — Fix G118 threshold (`>= 2`); resolve G38 (rename hook or gate allowlist)
2. **Merge PR #288** — PMI + doc sync (mark draft ready after CI green)
3. **Merge PR #289** — PIP/RHP official protocol
4. **IFM 1A — S2 Backend registry sync** — Add `cadcps` to `backend/config/cadastro-modules.registry.json`
5. **IFM 1A — S3 npm audit** — Frontend supply chain
6. **Update NEXT-SPRINT** — Remove obsolete S1 Produto migration; set S2 as next P0

**Obsolete mission:** IFM 1A S1 "Migration Produto" — Produto model and modules removed in PR #285.

---

## 10. Certification Answers

### 1. O repositório está íntegro?

**NÃO (parcial).** Build, lint, deploy, and production health are sound. Governance CI fails on `main` (G38, G118). Registries desynced. Documentation on `main` drifts from code post-PR #285.

### 2. Existe alguma PR bloqueando evolução?

**SIM.** PRs #288 (PMI) and #289 (PIP/RHP) are unmerged. While doc-only, they carry governance artifacts required before IFM implementation (PMI dashboard, PIP/RHP lifecycle). Both are draft with failing CI.

### 3. Existe conflito de merge?

**NÃO** nos PRs abertos — ambos MERGEABLE, sem conflitos com `main`.

### 4. Existe divergência entre documentação e código?

**SIM.** CURRENT-STATE, ROADMAP, NEXT-SPRINT, TECH-DEBT on `main` still describe 4 modules, Produto P0 migration, and passing `verify:governance`. Code has 2 modules, no Produto, failing gates. PMI/PIP absent from `main`.

### 5. Existe risco para iniciar o IFM?

**SIM.** Starting implementation without fixing G38/G118 means every mission will fail CI. Registry desync (TD-002) risks backend bootstrap missing CADCPS. Stale docs may misdirect missions (e.g., S1 Produto).

### 6. O deploy está saudável?

**SIM.** Railway `/api/health` returns 200 with DB connected. Vercel frontend returns 200. "Sync main for deploy" workflow succeeds on latest `main` push.

### 7. Todos os registries estão sincronizados?

**NÃO.** Frontend registry: 2 modules. Backend registry: 1 module. `generatedModules.json` matches frontend (2/2 per G125).

### 8. O banco está consistente?

**SIM (evidência indireta).** Schema has 17 models aligned with 11 migrations including `remove_marcas_produtos`. Production health reports DB connected. Local `prisma migrate status` not run (no env). TD-001 (Produto migration) is obsolete.

### 9. O projeto está oficialmente pronto para iniciar o IFM?

**NÃO.** Gate baseline must be repaired, doc PRs merged, and registries synchronized before the implementation era begins under PIP/RHP.

### 10. Recomenda iniciar imediatamente a Missão IFM 1A S1?

**NÃO.** IFM 1A S1 ("Migration Produto") is **obsolete** — Produto/Marca removed in PR #285. Immediate next mission should be:

- **IFM 1A — S0.1** Gate baseline repair (G38 + G118) — unblock CI
- **IFM 1A — S2** Backend registry sync — TD-002

Only after S0.1 + doc PR merges should IFM implementation missions proceed under PIP §10.

---

## 11. Final Repository State

| Attribute | Value |
|-----------|-------|
| `main` tip | `6ed9eb75` |
| Open PRs | 2 (#288, #289) — draft, CI red |
| CI governance | **FAILING** |
| Production | **HEALTHY** |
| Certified runtime modules | 2 (empresas, cadcps) |
| Gate blockers | G38, G118 |
| IFM certification | **NOT GRANTED** |

---

*Mission IFM 1A S0 complete. Next: IFM 1A S0.1 (Gate Baseline Repair) or S2 (Registry Sync) per priority above.*
