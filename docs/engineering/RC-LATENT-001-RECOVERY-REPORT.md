# RC-LATENT-001 Recovery Report — Program 2.3.X.4

**Date:** 2026-06-30  
**Status:** ✅ **Complete** — production smoke 24/24 CERTIFIED (2026-06-30)  
**Symptom:** `GET /api/mdp/*` and `GET /api/cadcps/campos` → HTTP 500 in production  
**Related:** [DEPLOYMENT-RECOVERY-CERTIFICATION.md](./DEPLOYMENT-RECOVERY-CERTIFICATION.md)

---

## Root cause (confirmed)

| Layer | Finding |
|-------|---------|
| **Railway deploy** | ✅ Success — container boots, health 200 |
| **prisma migrate deploy** | ❌ Failed silently (`allowFailure: true`) |
| **Boot policy** | Server starts if `UsuarioPreferencia` schema OK — **MDP not verified** |
| **Schema state** | Tables `mdp_*` **absent** in production DB |
| **Code state** | CADCPS `repCps.list` queries `prisma.mdpField` → Prisma P2021 → HTTP 500 |

Production remained on PR #297-era DB schema while PR #332+ code requires MDP-1→MDP-5 tables.

**Contributing factors:**

1. Failed deploys (RC-001) blocked MDP migrations for ~48h
2. `runBlockingDatabaseBoot` tolerates `migrate deploy` failure when preferences schema passes
3. `SEED_SKIP=true` + `BOOT_RUN_BACKGROUND_TASKS=false` in Docker — MDP seed never runs in background
4. Missing `DIRECT_URL` on Railway may cause `migrate deploy` to fail against Supabase pooler

---

## Fix (minimal scope)

| Change | Purpose |
|--------|---------|
| `backend/scripts/ensureMdpSchema.js` | Apply MDP-1→MDP-5 migration SQL idempotently + platform seed |
| `runBlockingDatabaseBoot.js` | Invoke `ensureMdpSchema` in **blocking boot**; fail fast if MDP incomplete |
| `productionBootTasks.js` | Redundant MDP ensure when background boot enabled |

No business logic changes. No new API features.

---

## Post-deploy verification

```bash
npm run smoke:recovery-certification
```

Expected: API 24/24, verdict `CERTIFIED`.

---

## Owner checklist (Railway)

Confirm `DIRECT_URL` is set (port **5432**, not pooler 6543) per [DEPLOY_BACKEND.md](../../backend/DEPLOY_BACKEND.md).

After merge + deploy, check logs for:

```
[ensure-mdp] Aplicando SQL 20260628230000_mdp1_entity_dictionary...
[ensure-mdp] OK — entities=N, migrations=5
```

---

*One error at a time — RC-LATENT-001 closes the Program 2.3.X stabilization cycle.*
