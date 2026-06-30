# RULE-DEPLOY-002 — Official Deployment Flow

**Status:** Permanent — Mandatory for all production changes  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Program:** 2.3.X.1 — Deployment Pipeline Hardening  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); companion to [DEPLOYMENT-PIPELINE-AUDIT.md](./DEPLOYMENT-PIPELINE-AUDIT.md)

---

## Official flow

```
Branch
  ↓
PR
  ↓
CI (verify:ci mirror + G401 + G402)
  ↓
Auditoria (when incident or architectural change requires it)
  ↓
Railway Deploy (triggered by main push — after merge approval only)
  ↓
Smoke Test (production/staging)
  ↓
Merge (manual — owner only after CI + Railway + Smoke green)
  ↓
Tag Release (when applicable)
  ↓
Delete Branch
  ↓
Nova Branch
```

> **Hotfix 0 exception:** PR #332 follows **CI → Railway preview on branch OR post-merge deploy validation → Smoke → Merge** as defined by the owner. After merge, Railway auto-deploys from `main`.

---

## Mandatory rules

| # | Rule |
|---|------|
| 1 | **Never accumulate** multiple PRs awaiting deploy validation |
| 2 | **One PR completes fully** before the next production deploy mission starts |
| 3 | **No merge** without **CI green + Railway green + Smoke green** |
| 4 | Every **critical deploy incident** must produce a **permanent Gate** when applicable (RC-001 → G303, Docker → G304) |
| 5 | Every **incident** must **strengthen the pipeline** to prevent recurrence |
| 6 | **No direct commits to `main`** without PR |
| 7 | **`sync-main-deploy.yml` is deprecated** — do not use for production promotion |

---

## Required CI gates (deploy path)

| Gate | Script | Purpose |
|------|--------|---------|
| **G303** | `npm run gate:backend-bootstrap` | ESM graph + pre-listen bootstrap |
| **G304** | `npm run gate:railway-docker` | Dockerfile.railway build simulation |
| **Bundle** | `npm run gate:deploy-pipeline` | G401 + G402 |

Also required before merge: `npm run verify:ci` (full governance mirror).

---

## Post-deploy smoke (manual until G305 automated)

Run after Railway reports **Success**:

```bash
# Health
curl -sS https://projetomg-production.up.railway.app/api/health

# Backend smokes (requires credentials / DATABASE_URL for local against prod)
SMOKE_BASE_URL=https://projetomg-production.up.railway.app npm run smoke:production
# Or individual:
# node scripts/productionStabilizationSmoke.mjs
# node scripts/postDeployValidation.mjs
```

Checklist: Health · Login · Empresas · CADCPS · MDP · Runtime Bridge.

**One error at a time:** if a second failure appears after the primary fix, open a new audit — do not patch opportunistically in the same PR.

---

*Violations must be caught in PR review or deploy audit.*
