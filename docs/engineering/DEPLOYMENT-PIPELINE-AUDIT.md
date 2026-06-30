# Deployment Pipeline Audit — Program 2.3.X.1

**Mission:** Deployment Pipeline Hardening  
**Date:** 2026-06-30  
**Status:** ✅ Certified for production deploy (with documented P1 platform actions)  
**Related:** [RAILWAY-ROOT-CAUSE-REPORT.md](./RAILWAY-ROOT-CAUSE-REPORT.md) · [RULE-DEPLOY-002.md](./RULE-DEPLOY-002.md)  
**PR:** #332 (Hotfix 0 + G401 + G402)

---

## 1. Executive summary

This audit reviewed the full path from developer commit to Railway production. The **RC-001** import failure exposed a gap: **governance CI did not validate backend runtime bootstrap**. That gap is now closed with **G303** and **G304**.

The pipeline is **production-ready** for MAK Gestão at current scale, with **Enterprise-grade governance gates** on the code path. Full **Enterprise platform maturity** (staging, automated post-deploy smoke, branch protection enforced in GitHub settings, Railway wait-for-CI) requires **P1 platform actions** documented below — these cannot be completed solely in repository code.

---

## 2. Pipeline map

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────────────────────────┐
│   Branch    │───▶│  PR + Review │───▶│  GitHub Actions (foundation-gov.yml) │
└─────────────┘    └──────────────┘    │  build · lint · typecheck:governance │
                                        │  G31-G108 · G109-G136               │
                                        │  G401 + G402 (deploy-pipeline)       │
                                        │  + capability matrix G156-G261       │
                                        └──────────────┬──────────────────────┘
                                                       │ green
                                                       ▼
                                        ┌──────────────────────────────────────┐
                                        │  Merge (manual — RULE-DEPLOY-002)     │
                                        └──────────────┬───────────────────────┘
                                                       │ push main
                                                       ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────────────────────────────┐
│  Vercel     │◀───│  Railway     │───▶│  Docker build (Dockerfile.railway)   │
│  (frontend) │    │  auto-deploy │    │  npm ci → prisma generate → COPY     │
└─────────────┘    └──────┬───────┘    │  CMD node src/server.js              │
                          │             └──────────────┬──────────────────────┘
                          │                            │ runtime
                          │                            ▼
                          │             ┌─────────────────────────────────────┐
                          │             │  Boot: runBlockingDatabaseBoot       │
                          │             │  migrate deploy · ensure* · listen   │
                          │             │  Healthcheck GET / (300s timeout)    │
                          │             └──────────────┬──────────────────────┘
                          │                            │ green
                          ▼                            ▼
                   ┌──────────────┐            ┌─────────────────┐
                   │ Smoke tests  │            │ Tag / Release   │
                   │ (manual)     │            │ (optional)      │
                   └──────────────┘            └─────────────────┘
```

---

## 3. Component audit

### 3.1 GitHub Actions

| Item | Status | Notes |
|------|--------|-------|
| Workflow `foundation-governance.yml` | ✅ | Runs on PR + push to `main` / `cursor/**` |
| Node version | ✅ | `22` — matches `Dockerfile.railway` `node:22-alpine` |
| Frontend `npm ci` | ✅ | Root lockfile |
| Backend `npm ci --omit=dev` | ✅ | Added Program 2.3.X.1 |
| `npm run build` | ✅ | Vite production build |
| `npm run lint` | ✅ | ESLint |
| `npm run typecheck:governance` | ✅ | CI mirror only (`verify:ci`) |
| G303 deploy pipeline | ✅ | Via `gate:deploy-pipeline` |
| G304 Railway Docker | ✅ | Via `gate:deploy-pipeline` |
| Studio gates G285-G301 | ⚠️ | In `verify:ci` locally; **not** in CI matrix (see R-P1-003) |
| Capability matrix G156-G261 | ✅ | Parallel jobs |
| Branch protection required checks | ⚠️ | **GitHub setting** — must enable manually (R-P1-001) |
| `sync-main-deploy.yml` | ⚠️ Deprecated | Bypasses PR flow (R-P1-002) |

### 3.2 verify:governance vs verify:ci

| Step | verify:governance | verify:ci | GitHub CI |
|------|-------------------|-----------|-----------|
| build | ✅ | ✅ | ✅ |
| lint | ✅ | ✅ | ✅ |
| typecheck:governance | ❌ | ✅ | ✅ |
| gate:certification | ✅ | ✅ | ✅ |
| gate:governance | ✅ | ✅ | ✅ |
| gate:deploy-pipeline (G401+G402) | ✅ | ✅ | ✅ |
| gate:capabilities (all) | ✅ | ✅ | ⚠️ partial (V13-V20 only) |

**Recommendation:** Before merge, always run locally: `npm run verify:ci`.

### 3.3 Gate G303 — Backend Bootstrap Validation

| Check | Coverage |
|-------|----------|
| Import `src/routes/index.js` | ✅ |
| Import `src/server.js` (no listen) | ✅ |
| All `src/**/*.js` ESM load | ✅ |
| Missing exports / invalid imports | ✅ |
| `runBlockingBootTasks` + `buildServer()` pre-listen | ✅ |
| `prisma generate` | ✅ |

**Origin:** RC-001 incident (2026-06-30).

### 3.4 Gate G304 — Railway Docker Build Validation

| Check | Coverage |
|-------|----------|
| `railway.json` → `Dockerfile.railway` | ✅ |
| Node 22-alpine | ✅ |
| CMD `node src/server.js` | ✅ |
| `npm ci` + `prisma validate` + `prisma generate` | ✅ |
| Docker build simulation (isolated temp dir) | ✅ |
| Migration folders have `migration.sql` | ✅ |
| Health route `GET /` | ✅ |

**Origin:** Program 2.3.X.1 (2026-06-30).

### 3.5 Railway configuration

| File | Role | Status |
|------|------|--------|
| `railway.json` (root) | **Production** — `Dockerfile.railway` | ✅ Verified |
| `backend/railway.json` | Legacy — points to `Dockerfile` | ⚠️ Drift risk if used (R-P2-001) |
| `Dockerfile.railway` | Production image | ✅ |
| `backend/Dockerfile` | Alternate / local | ✅ Not used by Railway root config |
| Healthcheck `/` | 300s timeout | ✅ |
| Restart policy | ON_FAILURE, 3 retries | ✅ |

### 3.6 Dockerfile.railway stages

| Stage | Validated by |
|-------|--------------|
| `FROM node:22-alpine` | G304 |
| `npm ci` | G304 sim |
| `prisma generate` (build-time fallback DATABASE_URL) | G304 |
| `COPY src/scripts/config` | G304 sim |
| `CMD node src/server.js` | G304 + G303 |

**Not validated in CI:** actual `docker build` (no Docker daemon in default runner) — mitigated by G304 stage simulation.

### 3.7 Bootstrap & runtime

| Component | Pre-merge validation | Production |
|-----------|---------------------|------------|
| ESM imports | G303 | — |
| `validateRuntimeEnv` | Warn-only (by design) | Railway env vars |
| `runBlockingDatabaseBoot` | G303 (BOOT_SKIP_MIGRATIONS) | Full migrate on deploy |
| `prisma migrate deploy` | ❌ not in CI (needs DB) | Railway boot |
| `app.listen()` | G303 stops before | Railway healthcheck |

### 3.8 Required environment variables

From `backend/src/config/env.js` + `DEPLOY_BACKEND.md`:

| Variable | CI | Railway |
|----------|-----|---------|
| `DATABASE_URL` | Stub in G401/G402 | Required |
| `DIRECT_URL` | Stub | Required |
| `JWT_SECRET` | Stub | Required |
| `SUPABASE_URL` | Optional in G303 | Required |
| `SUPABASE_ANON_KEY` | Optional in G303 | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional in G303 | Required |
| `SUPABASE_STORAGE_BUCKET` | Optional in G303 | Required |
| `NODE_ENV=production` | Set in probes | Required |
| `FRONTEND_ORIGINS` | — | Required for CORS |

**Gap:** CI cannot validate Railway dashboard secrets (R-P2-002).

### 3.9 Prisma

| Step | Pre-merge | Deploy runtime |
|------|-----------|----------------|
| `prisma validate` | G304 ✅ | — |
| `prisma generate` | G303, G304 ✅ | Docker build |
| `prisma migrate deploy` | ❌ CI (no prod DB) | Boot blocking |

### 3.10 Post-deploy smoke

| Script | Automated in CI | Manual |
|--------|-----------------|--------|
| `scripts/productionStabilizationSmoke.mjs` | ❌ | ✅ RULE-DEPLOY-002 |
| `scripts/postDeployValidation.mjs` | ❌ | ✅ |
| `backend/scripts/smoke*.js` | ❌ | ✅ against prod URL |

---

## 4. Risk register

### P0 — Blocker (must fix before merge)

| ID | Risk | Status | Mitigation |
|----|------|--------|------------|
| R-P0-001 | Broken ESM import crashes backend before listen (RC-001) | ✅ **Fixed** | PR #332 `repCps.js` + **G303** |

### P1 — High (platform action or next hardening sprint)

| ID | Risk | Status | Mitigation |
|----|------|--------|------------|
| R-P1-001 | GitHub branch protection not enforced in repo config | ⚠️ Open | Enable required checks: `Foundation Governance`, deploy gates |
| R-P1-002 | `sync-main-deploy.yml` can push to `main` outside PR flow | ⚠️ Deprecated | Marked deprecated; remove after confirmation |
| R-P1-003 | CI does not run full `gate:capabilities` (Studio G285-G301) | ⚠️ Open | Run `verify:ci` locally before merge; future: add CI job |
| R-P1-004 | Railway deploy not blocked by CI status in platform config | ⚠️ Open | Railway → Settings → Wait for CI / deploy only on green |
| R-P1-005 | First post-hotfix deploy runs 5 MDP migrations on boot | ⚠️ Latent | Monitor Railway logs during Hotfix 0 deploy; one error at a time |
| R-P1-006 | Post-deploy smoke not automated | ⚠️ Open | RULE-DEPLOY-002 manual checklist; future G305 |

### P2 — Medium

| ID | Risk | Status | Mitigation |
|----|------|--------|------------|
| R-P2-001 | `backend/railway.json` config drift vs root | ⚠️ Open | Document root as SSOT; consider deleting backend copy |
| R-P2-002 | Railway secrets not validated in CI | Accepted | Document in DEPLOY_BACKEND.md |
| R-P2-003 | No staging environment | Open | Future: Railway preview/staging service |
| R-P2-004 | Docker daemon build not executed in CI | Mitigated | G304 stage simulation |
| R-P2-005 | Boot healthcheck 300s may timeout on heavy migration | Low prob | `ensure*` scripts + migrate retry logic exist |

### P3 — Low / accepted

| ID | Risk | Status | Notes |
|----|------|--------|-------|
| R-P3-001 | Prisma major version update available (6→7) | Deferred | Not deploy-blocking |
| R-P3-002 | Frontend bundle size warnings | Accepted | Vite build succeeds |
| R-P3-003 | Dual DDL path (`ensureSchema.js` + migrate) | TD-005 | Documented tech debt |

---

## 5. Improvements implemented (this PR)

| Item | Gate / artifact |
|------|-----------------|
| RC-001 import fix | `repCps.js` |
| Backend bootstrap validation | **G303** |
| Railway Docker build simulation | **G304** |
| Deploy pipeline bundle | `gate:deploy-pipeline` |
| CI integration | `foundation-governance.yml` |
| verify:governance / verify:ci | Includes deploy pipeline |
| Official deploy flow | **RULE-DEPLOY-002** |
| Deprecated legacy sync workflow | Comment in `sync-main-deploy.yml` |

---

## 6. Validation evidence (2026-06-30)

| Command | Result |
|---------|--------|
| `npm run build` | ✅ |
| `npm run lint` | ✅ |
| `npm run gate:deploy-pipeline` | ✅ G401 + G402 |
| `npm run verify:governance` | ✅ |
| `npm run verify:ci` | ✅ |

---

## 7. Mandatory certification answers

### 1. O pipeline está em nível Enterprise?

**Parcialmente — Enterprise-ready no código, Enterprise-complete na plataforma após ações P1.**

O repositório agora possui gates mecânicos (G303, G304) equivalentes às práticas de empresas maduras para **pre-merge runtime validation** e **Docker build integrity**. Falta completar **branch protection**, **Railway wait-for-CI**, **staging**, e **smoke automatizado pós-deploy** para classificação Enterprise **completa**.

### 2. Existe algum ponto fraco?

**Sim — três principais:**

1. **GitHub/Railway platform settings** não exigem CI verde antes de deploy (R-P1-001, R-P1-004).
2. **CI não executa** o `gate:capabilities` completo (Studio G285-G301) — apenas subset V13-V20 (R-P1-003).
3. **Smoke pós-deploy** é manual (R-P1-006).

### 3. Existe algum risco futuro de deploy?

**Sim — controlados:**

| Risco | Probabilidade | Impacto | Controle |
|-------|---------------|---------|----------|
| Novo import ESM quebrado | Média | P0 | G303 |
| Dockerfile/railway.json drift | Baixa | P0 | G304 |
| Migration failure on boot | Média (pós-hotfix) | P1 | Boot logs + one-error-at-a-time rule |
| Secret missing in Railway | Baixa | P1 | DEPLOY_BACKEND.md + health endpoint |

### 4. O Railway está completamente protegido?

**Não 100% — protegido no código, parcialmente na plataforma.**

- **Código:** G401 + G402 impedem merge de builds que falhariam no container.
- **Plataforma:** Railway ainda pode tentar deploy se `main` receber push sem checks GitHub configurados. **Ação:** enable "Wait for CI" / required status checks.

### 5. O GitHub Actions está completamente protegido?

**Quase — falta alinhar CI com `verify:ci` completo.**

Foundation job cobre build, lint, typecheck, certification, governance, **G401+G402**. Capability matrix cobre G156-G261. **Studio gates G285-G301** rodam em `verify:ci` local mas não no workflow paralelo — mitigação: `npm run verify:ci` obrigatório antes de merge (RULE-DEPLOY-002).

### 6. Validações usadas por Stripe, GitHub, Vercel, Linear, Cloudflare que ainda não utilizamos?

| Practice | Used by | Our status |
|----------|---------|------------|
| Required status checks before merge | GitHub | ⚠️ Not configured in repo settings |
| Preview deploy per PR | Vercel, Railway | ⚠️ Vercel yes; Railway staging no |
| Canary / gradual rollout | Cloudflare, Stripe | ❌ Not implemented |
| Automated rollback on health failure | Stripe, Vercel | ⚠️ Railway restart only |
| Contract tests against production | Stripe | ⚠️ Manual smoke only |
| Docker build in CI (native) | GitHub, Vercel | ⚠️ Simulated (G304), not native docker build |
| Secret scanning / dependency review | GitHub | ⚠️ Partial (npm audit not in CI) |
| Load/soak test pre-prod | Large SaaS | ❌ Not in deploy path |
| Immutable deploy artifacts | Vercel | ❌ Git-triggered rebuild |
| Database migration dry-run in CI | Stripe | ❌ No prod DB in CI (accepted) |

**Conclusão:** As práticas **mais críticas para o incidente RC-001** (runtime import validation + Docker path validation) **estão implementadas**. Práticas **Enterprise tier-1** (staging, canary, automated prod smoke, branch protection) são **próximo investimento P1**.

---

## 8. Production readiness certification

| Criterion | Status |
|-----------|--------|
| RC-001 fixed | ✅ |
| G303 permanent | ✅ |
| G304 permanent | ✅ |
| CI runs deploy pipeline | ✅ |
| verify:ci includes deploy pipeline | ✅ |
| RULE-DEPLOY-002 documented | ✅ |
| Ready for Hotfix 0 merge (owner workflow) | ✅ |

**Certified:** Pipeline is **ready for production deploy** after PR #332 merge, subject to owner executing **CI → Railway → Smoke → Merge** per RULE-DEPLOY-002.

---

*Program 2.3.X.1 — Deployment Pipeline Hardening complete. Program 2.3.6 authorized to resume after Hotfix 0 production validation.*
