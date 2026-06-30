# Deployment Platform Hardening — Program 2.3.X.2

**Mission:** Deployment Platform Hardening  
**Date:** 2026-06-30  
**Status:** ✅ Audit complete — **manual platform actions required before merge**  
**Related:** [DEPLOYMENT-PIPELINE-AUDIT.md](./DEPLOYMENT-PIPELINE-AUDIT.md) · [RULE-DEPLOY-002.md](./RULE-DEPLOY-002.md) · [RAILWAY-ROOT-CAUSE-REPORT.md](./RAILWAY-ROOT-CAUSE-REPORT.md)  
**PR:** #332

---

## 1. Executive summary

This audit validated **GitHub**, **GitHub Actions**, and **Railway** platform configuration. **No business code was changed.** One legacy workflow was **removed** from the repository.

The Cloud Agent **does not have permission** to modify GitHub branch protection or Railway dashboard settings (`403 Unauthorized` / `RAILWAY_TOKEN` absent). All platform hardening steps that require admin access are documented below as **exact manual runbooks**.

**Verdict:** Pipeline **code** is ready (G303, G304). Platform **controls** must be applied by the repository owner **before or immediately after** merge of PR #332.

---

## 2. Audit methodology

| Source | Result |
|--------|--------|
| `gh repo view` | Repo settings read ✅ |
| `gh api …/branches/main/protection` | **403** — cannot read/write |
| `gh api …/rulesets` | Empty `[]` |
| `gh pr checks 332` | Status check names captured ✅ |
| `gh api …/actions/workflows` | 2 workflows found (1 removed in this mission) |
| `railway whoami` | **Unauthorized** |
| Production probe | `projetomg-production.up.railway.app` → HTTP 200 ✅ |
| GitHub commit statuses (historical) | Railway context: `mak - PROJETOMG` |

---

## 3. GitHub — current state (audited)

| Setting | Current value | Recommended | Status |
|---------|---------------|-------------|--------|
| Default branch | `main` | `main` | ✅ |
| Visibility | Private | Private | ✅ |
| Branch protection on `main` | **Not readable / likely OFF** | ON | ❌ **Action required** |
| Rulesets | **None** (`[]`) | Optional ruleset | ❌ **Action required** |
| Required status checks | **Not configured** | See §3.2 | ❌ **Action required** |
| Required pull request reviews | **Not configured** | ≥ 1 approval | ❌ **Action required** |
| Require linear history | Unknown | Optional (squash-only) | ⚠️ Owner choice |
| Allow merge commits | **true** | true (per D-052 audit trail) | ✅ |
| Allow squash merge | **true** | true | ✅ |
| Allow rebase merge | **true** | false (optional tighten) | ⚠️ Owner choice |
| Allow auto-merge | **false** | false (manual per RULE-DEPLOY-002) | ✅ |
| Delete branch on merge | **false** | **true** | ❌ **Action required** |
| Allow update branch | **false** | true (optional) | ⚠️ Optional |
| Force push to `main` | Not blocked (no protection) | Blocked | ❌ **Action required** |
| Web commit signoff | false | false | ✅ |

### 3.1 Insecure configurations identified

| ID | Issue | Severity |
|----|-------|----------|
| **PLAT-GH-001** | No branch protection on `main` — direct push / merge without checks possible | **P0** |
| **PLAT-GH-002** | `delete_branch_on_merge: false` — stale branches accumulate | **P1** |
| **PLAT-GH-003** | ~~`sync-main-deploy.yml` could push to `main` outside PR flow~~ | **P0** → **✅ Fixed** (workflow deleted) |
| **PLAT-GH-004** | All three merge methods enabled — no linear-history enforcement | **P2** |

### 3.2 Required status checks (exact names from PR #332 CI)

Configure these in GitHub → **Settings → Branches → Branch protection rules → `main`**:

**Minimum (recommended start):**

```
Build · Lint · Typecheck · Governance
```

**Full parity with current CI (recommended for Enterprise):**

```
Build · Lint · Typecheck · Governance
Capability gates (layout-config-engine-v13)
Capability gates (field-config-engine-v14)
Capability gates (validation-config-engine-v16)
Capability gates (formula-config-engine-v17)
Capability gates (event-config-engine-v18)
Capability gates (action-config-engine-v19)
Capability gates (workflow-config-engine-v20)
```

> **Note:** Vercel and Railway (`mak - PROJETOMG`) post statuses separately. **Do not require Railway deploy check on PR** — Railway deploys `main` after merge. Require **GitHub Actions only** on PR.

**Optional third-party checks (enable only if always green):**

```
Vercel
Vercel Preview Comments
```

---

## 4. GitHub — manual configuration runbook

### 4.1 Enable branch protection on `main`

1. Open: `https://github.com/maikelimaadm-stack/PROJETOMG/settings/branches`
2. Click **Add branch protection rule** (or edit existing rule for `main`)
3. **Branch name pattern:** `main`
4. Enable:
   - ☑ **Require a pull request before merging**
     - ☑ Require approvals: **1** (or 0 if solo owner — still require PR)
     - ☑ Dismiss stale pull request approvals when new commits are pushed
   - ☑ **Require status checks to pass before merging**
     - ☑ **Require branches to be up to date before merging**
     - Add status checks from §3.2 (start with `Build · Lint · Typecheck · Governance`)
   - ☑ **Require conversation resolution before merging**
   - ☑ **Do not allow bypassing the above settings** (include administrators if solo)
   - ☑ **Restrict force pushes**
   - ☑ **Restrict deletions**
5. Click **Create** / **Save changes**

### 4.2 Enable delete branch after merge

1. Open: `https://github.com/maikelimaadm-stack/PROJETOMG/settings`
2. Under **Pull Requests** → ☑ **Automatically delete head branches**
3. Save

### 4.3 Merge method policy (RULE-DEPLOY-002 aligned)

1. Same settings page → **Pull Requests**
2. Recommended for audit trail (per Program 2.3.X):
   - ☑ Allow merge commits
   - ☐ Allow squash merging (optional — owner choice)
   - ☐ Allow rebase merging (optional — disable for linear history)
3. ☐ **Allow auto-merge** — keep **disabled** (manual merge after Railway + Smoke)

### 4.4 Verify GitHub Actions permissions

1. Open: `https://github.com/maikelimaadm-stack/PROJETOMG/settings/actions`
2. **Workflow permissions:** Read and write (for future automation) or Read-only if preferred
3. **Allow GitHub Actions to create and approve pull requests:** Off (unless needed)

### 4.5 Verify Railway GitHub App permissions (for Wait for CI)

1. Open: `https://github.com/settings/installations` (or org settings)
2. Find **Railway** → **Configure**
3. Repository access: **PROJETOMG** included
4. Accept any **updated permissions** prompts (required for Wait for CI per Railway docs)

---

## 5. GitHub Actions — workflow audit

### 5.1 Workflows inventory (after this mission)

| Workflow | File | Status | Role |
|----------|------|--------|------|
| **Foundation Governance** | `.github/workflows/foundation-governance.yml` | ✅ **Official** | CI + G303/G304 + capability matrix |
| ~~Sync main for deploy~~ | ~~`.github/workflows/sync-main-deploy.yml`~~ | **🗑 Removed** | Deprecated bypass (RULE-DEPLOY-002) |

**Official flow:** Single workflow — **`Foundation Governance`** — on `pull_request` and `push` to `main` / `cursor/**`.

### 5.2 Foundation Governance job map

| Job | Check name on GitHub | Includes |
|-----|---------------------|----------|
| `foundation` | `Build · Lint · Typecheck · Governance` | build, lint, typecheck:governance, G31-G136, **G303+G304** |
| `capability-gates` (matrix ×7) | `Capability gates (…)` | G156-G261 config engines |

### 5.3 Gap vs local `verify:ci`

| Check | In CI workflow | In `verify:ci` local |
|-------|----------------|----------------------|
| Studio gates G285-G301 | ❌ | ✅ |
| Full `gate:capabilities` | ❌ | ✅ |

**Mitigation (until CI expanded):** Run `npm run verify:ci` locally before approving merge (RULE-DEPLOY-002).

---

## 6. Railway — current state (audited)

| Item | Repository config | Production evidence | Status |
|------|-------------------|---------------------|--------|
| Project ID | `acb8cbcf-3026-44ea-9ec1-d7f64fa13443` | GitHub statuses | ✅ |
| Service ID | `bfa589fc-2a2e-4115-b6e6-b00cc9d16ba1` | GitHub statuses | ✅ |
| Production URL | `projetomg-production.up.railway.app` | HTTP 200 | ✅ |
| Deploy trigger | GitHub push → `main` | Historical statuses | ✅ |
| Builder | `Dockerfile.railway` (root `railway.json`) | Repo | ✅ |
| Healthcheck path | `/` | `railway.json` | ✅ |
| Healthcheck timeout | 300s | `railway.json` | ✅ |
| Restart policy | ON_FAILURE, max 3 retries | `railway.json` | ✅ |
| Start command | `node src/server.js` (Docker CMD) | Dockerfile.railway | ✅ |
| **Wait for CI** | **Unknown — likely OFF** | Deploys failed while CI existed | ❌ **Action required** |
| Environment variables | Not auditable without token | Prod health OK | ⚠️ Manual verify |
| Rollback strategy | Not in repo | Manual via Railway UI | ⚠️ Documented below |
| Staging service | None | — | **P2** gap |

### 6.1 Railway insecure / missing configurations

| ID | Issue | Severity |
|----|-------|----------|
| **PLAT-RW-001** | Wait for CI likely **disabled** — deploy triggered on push regardless of GitHub Actions | **P0** |
| **PLAT-RW-002** | No staging environment — prod-only validation | **P1** |
| **PLAT-RW-003** | Rollback not automated — manual redeploy only | **P2** |
| **PLAT-RW-004** | `backend/railway.json` drift (points to `Dockerfile` not `Dockerfile.railway`) | **P2** |
| **PLAT-RW-005** | Env vars not auditable from agent | **Info** |

---

## 7. Railway — manual configuration runbook

### 7.1 Enable Wait for CI

1. Open: [Railway Dashboard](https://railway.app/dashboard)
2. Project → service **PROJETOMG** (production backend)
3. **Settings** → **Deploy** section
4. Enable ☑ **Wait for CI**
5. Confirm GitHub repo connected: `maikelimaadm-stack/PROJETOMG`
6. Production branch: **`main`**

**Expected behavior after enable:**

```
push to main → GitHub Actions run → Railway WAITING
  → all checks pass → Railway builds & deploys
  → any check fails → Railway SKIPS deploy
```

**Troubleshooting:** Railway waits for **all** GitHub check suites. Remove stale failing checks from old Railway projects or unused GitHub Apps (see Railway docs).

### 7.2 Verify deploy trigger

1. **Settings → Source**
   - Repository: `maikelimaadm-stack/PROJETOMG`
   - Branch: **`main`**
   - Root directory: **empty** (repo root — uses `Dockerfile.railway`)
2. **Disable** deploy on PR branches for production service (if option exists)

### 7.3 Verify healthcheck

1. **Settings → Deploy**
   - Healthcheck path: **`/`**
   - Timeout: **300** seconds (matches `railway.json`)
2. Confirm restart policy: **ON_FAILURE**

### 7.4 Verify environment variables (production)

In Railway → service → **Variables**, confirm all required:

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | ✅ | `production` |
| `DATABASE_URL` | ✅ | Supabase pooler |
| `DIRECT_URL` | ✅ | Supabase direct |
| `JWT_SECRET` | ✅ | Strong secret |
| `SUPABASE_URL` | ✅ | |
| `SUPABASE_ANON_KEY` | ✅ | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | |
| `SUPABASE_STORAGE_BUCKET` | ✅ | e.g. `erp-anexos` |
| `FRONTEND_ORIGINS` | ✅ | Vercel URLs |
| `BACKEND_HOST` | ✅ | `0.0.0.0` |
| `BACKEND_PORT` | ✅ | `3001` |

Reference: [`backend/DEPLOY_BACKEND.md`](../../backend/DEPLOY_BACKEND.md)

### 7.5 Rollback strategy (manual — platform standard)

Railway does not auto-rollback on health failure beyond restart policy.

**Official rollback procedure:**

1. Railway Dashboard → **Deployments**
2. Find last **Successful** deployment (e.g. PR #297 era if needed)
3. Click **⋯** → **Redeploy** / **Rollback to this deployment**
4. Run smoke tests (RULE-DEPLOY-002)
5. If schema migration issue: coordinate DB rollback separately (high risk)

**After Hotfix 0 merge:** first successful deploy becomes new rollback baseline — tag commit in GitHub.

---

## 8. Official deployment flow (confirmed)

Per [RULE-DEPLOY-002.md](./RULE-DEPLOY-002.md):

```
Branch → PR → CI (Foundation Governance) → [Owner review]
  → Merge to main (manual, after CI green)
  → Railway (Wait for CI → build → healthcheck)
  → Smoke tests (manual)
  → Tag release (optional)
  → Delete branch
```

**Single CI workflow:** `foundation-governance.yml` only.

---

## 9. Pre-merge checklist (owner)

Execute before merging PR #332:

| # | Action | Platform |
|---|--------|----------|
| 1 | Enable branch protection on `main` with required checks | GitHub |
| 2 | Enable **Automatically delete head branches** | GitHub |
| 3 | Enable **Wait for CI** on production Railway service | Railway |
| 4 | Verify Railway env vars (§7.4) | Railway |
| 5 | Verify Railway GitHub App permissions | GitHub |
| 6 | Confirm PR #332 CI green | GitHub |
| 7 | After merge: confirm Railway deploy **Success** | Railway |
| 8 | Run smoke tests (RULE-DEPLOY-002) | Production |
| 9 | Rollback plan acknowledged (§7.5) | Railway |

---

## 10. Mandatory certification answers

### 1. Existe alguma configuração insegura?

**Sim.**

| Item | Severity |
|------|----------|
| Branch protection ausente em `main` | **P0** |
| Wait for CI provavelmente desligado no Railway | **P0** |
| ~~Workflow `sync-main-deploy` bypass~~ | **P0 — corrigido** (removido) |
| Force push não bloqueado em `main` | **P0** (consequência de PLAT-GH-001) |
| Delete branch on merge desligado | **P1** |

### 2. Existe alguma configuração faltando?

**Sim.**

| Missing | Platform |
|---------|----------|
| Required status checks | GitHub |
| Required PR reviews (≥1) | GitHub |
| Wait for CI | Railway |
| Automatically delete head branches | GitHub |
| Staging environment | Railway (P2 — future) |
| Automated post-deploy smoke | CI (P1 — future G305) |

### 3. O GitHub está protegido?

**Não — ainda não.** O código e CI estão corretos, mas **branch protection não está configurada** (API retornou 403; settings audit shows no rulesets). **Proteção depende de ações manuais §4.**

### 4. O Railway está protegido?

**Parcialmente.**

| Layer | Status |
|-------|--------|
| Healthcheck + restart | ✅ Configurado no repo |
| G303/G304 pre-merge | ✅ |
| Wait for CI | ❌ Deve ser habilitado manualmente |
| Env vars | ⚠️ Verificar manualmente |
| Rollback | ⚠️ Manual only |

### 5. Existe alguma configuração manual que eu preciso fazer?

**Sim — checklist §9 (9 itens).** Críticos antes do merge:

1. GitHub branch protection + required checks  
2. GitHub auto-delete branches  
3. Railway Wait for CI  
4. Railway env vars verification  

### 6. Quais configurações não podem ser automatizadas e deverão ser feitas por mim?

| Configuration | Why manual |
|---------------|------------|
| Branch protection rules | Requires GitHub admin; agent token lacks `admin:repo_hook` / admin scope |
| Delete branch on merge | Repository setting — admin only |
| Required reviewers | Organization/repo policy |
| Railway Wait for CI | Railway dashboard; no `RAILWAY_TOKEN` in agent |
| Railway environment variables / secrets | Security — never in git |
| Railway rollback | Operational decision |
| GitHub Railway App permission updates | User OAuth consent |
| Branch protection bypass list | Admin policy |
| Enabling auto-merge | Owner choice (recommend keep off) |
| Staging Railway service creation | Infrastructure provisioning |

---

## 11. Changes in repository (this mission)

| Change | Type |
|--------|------|
| Deleted `.github/workflows/sync-main-deploy.yml` | Platform hardening |
| Created `docs/engineering/DEPLOYMENT-PLATFORM-HARDENING.md` | Documentation |

**No business code changed.**

---

## 12. Production readiness

| Criterion | Status |
|-----------|--------|
| RC-001 fix in PR #332 | ✅ |
| G303 + G304 in CI | ✅ |
| Single official workflow | ✅ |
| Legacy bypass workflow removed | ✅ |
| Platform hardening documented | ✅ |
| Owner manual steps defined | ✅ |
| **Ready for merge after owner completes §9** | ✅ |

---

*Program 2.3.X.2 complete. Proceed with PR #332 merge after §9 checklist.*
