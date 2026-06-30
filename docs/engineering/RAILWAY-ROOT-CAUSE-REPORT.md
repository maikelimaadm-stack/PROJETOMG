# Railway Root Cause Report

**Mission:** Railway Root Cause Validation  
**Date:** 2026-06-30  
**Status:** Complete — evidence-based, no code changes applied  
**Production URL:** `https://projetomg-production.up.railway.app`  
**Railway project:** `acb8cbcf-3026-44ea-9ec1-d7f64fa13443`  
**Service:** `bfa589fc-2a2e-4115-b6e6-b00cc9d16ba1`

---

## Executive summary

| Question | Answer |
|----------|--------|
| Is the ESM import error the **first** cause of deploy failure? | **YES — confirmed with reproducible evidence** |
| Which pipeline stage fails first? | **Runtime → Import ESM** (before Boot, Migration, Healthcheck) |
| First breaking commit | `0ae9e367` — PR #298 (MDP-2 Data Dictionary) |
| Last successful Railway deploy | `2754b4d7` — PR #297 (MDP-1 Entity Dictionary) |
| Are Dockerfile / railway.json / Node version involved? | **NO — unchanged between success and failure** |
| Railway dashboard logs obtained? | **NO — `RAILWAY_TOKEN` unavailable; runtime error reconstructed from local reproduction matching `CMD`** |

Machine-readable evidence: [`docs/auditoria/evidence/railway-root-cause-validation.json`](../auditoria/evidence/railway-root-cause-validation.json)

---

## 1. Methodology

### 1.1 Evidence sources

| Source | Result |
|--------|--------|
| GitHub Commit Status API (`mak - PROJETOMG`) | Last success @ `2754b4d7`; failures from `3a6b1c63` onward |
| Git bisection | Failure introduced in `0ae9e367`, merged via `3a6b1c63` |
| Per-commit isolation (`git archive`) | Build vs runtime stages tested independently |
| Docker stage simulation | Replicates `Dockerfile.railway` steps without Docker daemon |
| ESM import chain tracing | Pinpoints first module that throws |
| Production API probe | Confirms stale deploy (PR #297 code still serving) |

### 1.2 Railway logs — access limitation

| Attempt | Outcome |
|---------|---------|
| `npx @railway/cli whoami` | `Unauthorized` |
| `RAILWAY_TOKEN` / `RAILWAY_API_TOKEN` in environment | **Absent** |
| Railway dashboard URL (deployment `226a5c34…`) | Requires login — no log export |
| GitHub Deployments API | `403 Resource not accessible by integration` |

**Reconstructed runtime log** (local execution of exact container `CMD`, commit `3a6b1c63`):

```
SyntaxError: The requested module '../mdp/mdpFieldConstants.js' does not provide an export named 'buildLabelCreate'
    at ModuleJob._instantiate (node:internal/modules/esm/module_job:…)
    at async ModuleJob.run (node:internal/modules/esm/module_job:…)
```

This matches Node.js ESM behaviour when a named export does not exist. Railway marks the deployment **failed** because the process exits before binding port 3001, so the healthcheck on `/` never succeeds (`healthcheckTimeout: 300` in `railway.json`).

> **Recommendation for 100% log parity:** inject `RAILWAY_TOKEN` and re-run `railway logs --deployment 226a5c34-ca12-45a6-861f-7fa74bb53e75` to attach dashboard screenshots to this report. The inferred log above is sufficient to explain the failure mode but is not a verbatim Railway export.

---

## 2. GitHub deploy timeline (external evidence)

| Commit | Event | Railway status | Deployment ID |
|--------|-------|----------------|---------------|
| `2754b4d7` | Merge PR **#297** MDP-1 | ✅ **Success** | `d3be1290-3509-4856-b3ef-aeb698966a39` |
| `0ae9e367` | MDP-2 feature commit (branch only) | — (no production trigger) | — |
| `3a6b1c63` | Merge PR **#298** MDP-2 | ❌ **Deployment failed** | `226a5c34-ca12-45a6-861f-7fa74bb53e75` |
| `34ee8518` | Merge PR **#329** Studio consolidation | ❌ Failed | `bbcba091-6ea8-471e-9b79-7abdb5cd932d` |
| `455f19c1` | HEAD (PR #331) | ❌ Failed | `ff8385b5-7bf2-49ef-b1f4-29c2e3cbb5a4` |

Railway production deploys **only on `main` pushes**. Feature-branch commits (e.g. `0ae9e367`) do not update production even when Vercel preview succeeds.

---

## 3. Pipeline stage analysis

### 3.1 Stage matrix

| Stage | PR #297 (`2754b4d7`) | PR #298+ (`3a6b1c63`, HEAD) | Evidence |
|-------|---------------------|------------------------------|----------|
| **Build (Docker image)** | ✅ PASS | ✅ PASS | `npm ci` + `prisma generate` succeed in isolated checkout |
| **Install (`npm ci`)** | ✅ PASS | ✅ PASS | Exit 0, 0 vulnerabilities |
| **Docker (image creation)** | ✅ PASS | ✅ PASS | All `Dockerfile.railway` `RUN` steps simulated — PASS |
| **Import ESM** | ✅ PASS | ❌ **FAIL (first)** | See §4 |
| **Environment variables** | ⚠️ Warn only | ⬜ Not reached | `server.js` warns on missing Supabase vars; does not exit |
| **Boot (`runBlockingDatabaseBoot`)** | ✅ Reached | ⬜ Not reached | PR #297 logs show `[boot-blocking]`; PR #298 crashes earlier |
| **Migration (`prisma migrate deploy`)** | ✅ Reached | ⬜ Not reached | Only runs inside boot, after imports |
| **Runtime (`app.listen`)** | ✅ Reached on Railway | ❌ Never reached | PR #297 success; PR #298 crash before `listen()` |
| **Healthcheck (`GET /`)** | ✅ 200 | ❌ Timeout / refused | `railway.json` → `healthcheckPath: "/"` |
| **Database** | ✅ Connected in prod | ⬜ Not consulted | Prod `/api/health` db.connected=true on stale container |

### 3.2 Chronological failure order (PR #298 merge on Railway)

```
1. [BUILD]    Docker build starts                          → PASS
2. [BUILD]    npm ci                                         → PASS
3. [BUILD]    prisma generate                                → PASS
4. [BUILD]    COPY src/scripts/config                        → PASS
5. [DEPLOY]   Container starts, CMD: node src/server.js     → starts
6. [RUNTIME]  Node loads server.js static imports            → FAIL ← FIRST ERROR
              └─ routes/index.js → cadcps/routes.js → svcCps.js → repCps.js
                 └─ SyntaxError: buildLabelCreate not exported from mdpFieldConstants.js
7. [RUNTIME]  Process exit code 1                            → container dies
8. [HEALTH]   GET / never responds                           → FAIL (symptom, not root cause)
9. [RAILWAY]  Status: "Deployment failed"                    → reported to GitHub
```

**Boot, migration, and database are never reached** on failing commits. They are eliminated as primary causes.

---

## 4. Primary root cause — Import ESM

### 4.1 Finding

| Field | Value |
|-------|-------|
| **Evidence** | Local `node src/server.js` on commits `0ae9e367`, `3a6b1c63`, `HEAD` exits immediately with identical `SyntaxError` |
| **File** | `backend/src/modules/cadcps/repCps.js` |
| **Line** | **18** (import block lines 17–22) |
| **Commit responsible** | **`0ae9e367`** — `feat(mdp-2): implement Data Dictionary as field SSOT` |
| **Merged to main** | **`3a6b1c63`** — Merge PR #298 |
| **Impact** | Node process cannot start → no HTTP listener → Railway healthcheck fails → **all deploys since Jun/29 fail**; production frozen on PR #297 container |
| **Severity** | **P0 — Blocker** (complete deploy pipeline failure) |

### 4.2 Broken import (commit `0ae9e367`)

```javascript
// backend/src/modules/cadcps/repCps.js — lines 17-26
import {
  buildLabelCreate,        // ← DOES NOT EXIST in mdpFieldConstants.js
  buildStableFieldId,
  CADCPS_APLICACAO_TO_MDP,
  MDP_PLATFORM_VERSION_ID,
} from "../mdp/mdpFieldConstants.js";
import {
  campoPayloadToMdpFieldData,
  mdpFieldToCampoShape,
} from "../mdp/mdpFieldCadcpsAdapter.js";
```

### 4.3 Export reality (same commit)

| Symbol | Exported from `mdpFieldConstants.js`? | Actual location |
|--------|--------------------------------------|-----------------|
| `buildStableFieldId` | ✅ Yes | `mdpFieldConstants.js` |
| `CADCPS_APLICACAO_TO_MDP` | ✅ Yes | `mdpFieldConstants.js` |
| `MDP_PLATFORM_VERSION_ID` | ✅ Yes (re-export) | `mdpFieldConstants.js` |
| **`buildLabelCreate`** | ❌ **No** | **`mdpFieldCadcpsAdapter.js` line ~122** |

### 4.4 Import chain (load order)

```
server.js:10          import { registerRoutes } from "./routes/index.js"
routes/index.js:8     import { registerCadcpsRoutes } from "../modules/cadcps/routes.js"
cadcps/routes.js:3    import { svcCps } from "./svcCps.js"
svcCps.js:1           import { repCps } from "./repCps.js"
repCps.js:17-22       import { buildLabelCreate, ... } from "../mdp/mdpFieldConstants.js"  ← THROWS
```

Static imports in `server.js` execute **before** `dotenv.config()` (line 16) and **before** `runBlockingDatabaseBoot()` (line 337). No environment variable can prevent this crash.

### 4.5 Usage site (confirms symbol is required at runtime)

| File | Line | Usage |
|------|------|-------|
| `backend/src/modules/cadcps/repCps.js` | ~491 | `create: buildLabelCreate(payload.nome, …)` |

---

## 5. Hypothesis elimination matrix

| Hypothesis | Test performed | Result | Notes |
|------------|----------------|--------|-------|
| **Dockerfile broken** | `git diff 2754b4d7 3a6b1c63 -- Dockerfile.railway` | ❌ Eliminated | Zero diff |
| **railway.json misconfigured** | Same diff on `railway.json`, `backend/railway.json` | ❌ Eliminated | Zero diff; healthcheck `/` correct |
| **Node version mismatch** | Dockerfile `FROM node:22-alpine`; local v22.14.0 | ❌ Eliminated | Same major version |
| **npm install failure** | `npm ci --omit=dev` @ PR #298 | ❌ Eliminated | PASS |
| **Prisma generate failure** | `npm run prisma:generate` @ PR #298 | ❌ Eliminated | PASS |
| **Docker build failure** | Full stage simulation @ PR #298 | ❌ Eliminated | All RUN steps PASS |
| **Migration failure** | Server never reaches boot | ❌ Eliminated as **primary** | Latent risk after hotfix — see §7 |
| **Environment variables missing** | PR #297 warns but deploys; PR #298 dies before env check | ❌ Eliminated as **primary** | Prod has vars (health db.connected=true) |
| **Healthcheck timeout** | Symptom only — server never listens | ❌ Eliminated as **primary** | 300s timeout irrelevant if process exits in <1s |
| **package.json start script** | `CMD ["node", "src/server.js"]` unchanged | ❌ Eliminated | |
| **Case-sensitive paths (Linux)** | Import paths match filesystem exactly | ❌ Eliminated | |
| **Symlinks** | Standard COPY in Docker; no symlinks in import paths | ❌ Eliminated | |
| **Windows vs Linux paths** | Railway runs Linux; repo uses forward slashes | ❌ Eliminated | |
| **Build output / Vite** | Backend-only Docker context; frontend not in image | ❌ Eliminated | |
| **Import ESM** | Reproduced on 3 failing commits | ✅ **CONFIRMED PRIMARY** | |

---

## 6. Production state confirmation

Evidence that production runs **stale PR #297** code (not current `main`):

| Probe | Production response | Expected on `main` |
|-------|--------------------|--------------------|
| `GET /api/health` | ✅ 200 | ✅ |
| Login `maike/maike/123` | ✅ Token issued | ✅ |
| `GET /api/mdp/fields` | ❌ 404 Route not found | Route exists |
| `GET /api/cadcps` | ❌ 404 Route not found | Route exists (post-MDP-2 refactor) |
| `GET /api/mdp/entities` (auth) | ❌ 500 Internal error | Separate latent bug |
| GitHub Railway status @ HEAD | ❌ Deployment failed | — |

---

## 7. Secondary / latent risks (NOT current deploy failure)

These may appear **after** Hotfix 0 fixes the import. They are **not** the reason deploy fails today.

| Risk | Severity | Rationale |
|------|----------|-----------|
| MDP migrations 2–5 on first successful boot | Medium | 5 new migrations since PR #297; boot runs `prisma migrate deploy` |
| Boot blocking preferences schema check | Medium | `runBlockingDatabaseBoot.js:280-288` throws if `UsuarioPreferencia` incomplete |
| Boot duration vs healthcheck 300s | Low | Unlikely unless migrations stall |
| `/api/mdp/entities` 500 on current prod | Low | Pre-existing on stale deploy; separate investigation |

---

## 8. Findings summary table

| ID | Evidence | File | Line | Commit | Impact | Severity | Proposed fix |
|----|----------|------|------|--------|--------|----------|--------------|
| **RC-001** | `SyntaxError: … does not provide an export named 'buildLabelCreate'` on `node src/server.js` | `backend/src/modules/cadcps/repCps.js` | **18** | **`0ae9e367`** | Process exit before listen; all Railway deploys fail since PR #298 | **P0** | Move `buildLabelCreate` import to `mdpFieldCadcpsAdapter.js` |
| RC-002 | GitHub status "Deployment failed" while build stages pass | — | — | `3a6b1c63+` | Misleading symptom — looks like healthcheck/migration issue | Info | Document stage order (this report) |
| RC-003 | Production frozen on PR #297 | — | — | — | Missing MDP-2+, CADCPS refactor, Studio-related backend routes | **P1** | Resolve RC-001 then redeploy |
| RC-004 | Railway logs not in CI/agent | — | — | — | Cannot auto-attach dashboard logs | Info | Inject `RAILWAY_TOKEN` in Cloud Agent secrets |

---

## 9. Proposed correction (Hotfix 0 — NOT applied)

**Scope:** 1 file, 1 import line move.

```javascript
// repCps.js — remove buildLabelCreate from mdpFieldConstants import
import {
  buildStableFieldId,
  CADCPS_APLICACAO_TO_MDP,
  MDP_PLATFORM_VERSION_ID,
} from "../mdp/mdpFieldConstants.js";
import {
  buildLabelCreate,           // ← add here
  campoPayloadToMdpFieldData,
  mdpFieldToCampoShape,
} from "../mdp/mdpFieldCadcpsAdapter.js";
```

**Validation gate before merge:**

1. `node --input-type=module -e "import('./src/routes/index.js')"` → PASS  
2. Docker stage simulation (this report §3) → import PASS, server reaches boot  
3. GitHub Railway status after merge → **Success**  
4. Production smoke: health, login, empresas, cadcps, mdp/fields  

**CI hardening (follow-up, not Hotfix 0):**

- Add backend import smoke to `.github/workflows/foundation-governance.yml`  
- Add optional `docker build -f Dockerfile.railway` job  

---

## 10. Certification

| # | Question | Answer |
|---|----------|--------|
| 1 | ESM import is first failure? | **YES** — proven by stage matrix and import chain |
| 2 | Railway logs fully captured? | **PARTIAL** — reconstructed from CMD; dashboard needs token |
| 3 | All hypotheses eliminated? | **YES** — see §5 |
| 4 | Code modified? | **NO** |
| 5 | Ready for Hotfix 0 approval? | **YES** — pending user sign-off |

---

*Report generated by Railway Root Cause Validation mission. No source files were modified.*
