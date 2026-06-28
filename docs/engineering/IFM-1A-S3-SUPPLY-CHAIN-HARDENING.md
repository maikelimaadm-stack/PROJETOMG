# IFM 1A-S3 — Frontend Supply Chain Hardening

**Mission ID:** IFM 1A-S3  
**Program:** IFM Phase 1 — Wave 1 (Estabilidade)  
**Priority:** P1  
**Tech Debt:** TD-008  
**Status:** **Prepared — ready to execute**  
**PIP phase:** 1 (PIR) → 2 (Planning) complete via [IFM-PHASE-1-TECHNICAL-ROADMAP.md](./IFM-PHASE-1-TECHNICAL-ROADMAP.md)

---

## Objective

Reduce frontend npm audit vulnerabilities from **15 total (9 high)** to **0 high/critical**, without changing application architecture or adding features.

---

## Evidence (Baseline @ 2026-06-28)

```
npm audit — frontend root:
  total: 15 (1 low, 5 moderate, 9 high, 0 critical)

backend npm audit: 0 vulnerabilities
```

Source: `npm audit` on `main` post PR #291.

---

## Scope

### In scope

- Run `npm audit` and `npm audit fix` where safe
- Manual dependency upgrades for remaining high vulns (transitive deps)
- Verify `npm run build`, `npm run lint`, `npm run verify:governance`
- Update `TECH-DEBT.md` TD-008 status
- Update `CURRENT-STATE.md` governance section
- ENGINEERING-JOURNAL entry

### Out of scope

- Architecture changes
- New features or capabilities
- Backend dependencies (already clean)
- shadcn/typecheck noise (TD-009)
- CI expansion (IFM 1D-1 — next mission)

---

## Dependencies

| Dependency | Status |
|------------|--------|
| Baseline recovery (PR #291) | ✅ |
| CI green on main | ✅ |
| Replanning doc approved | ✅ (this brief) |

**Blocks:** None  
**Blocks downstream:** Enterprise security review; clean baseline for MDP-1

---

## Execution Plan (PIP Phases 3–10)

1. **Planning** — Capture full `npm audit` JSON; categorize direct vs transitive vulns
2. **Implementation** — Apply fixes in minimal commits (lockfile + package.json only)
3. **Tests** — build + lint + verify:governance + smoke dev server
4. **Audit** — Re-run npm audit; document any accepted residual risks in DECISIONS if unavoidable
5. **Docs** — TD-008, CURRENT-STATE, JOURNAL
6. **RHP post-merge** — Confirm main CI green + production health

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking change from major dep bump | Run build + manual smoke on empresas/cadcps routes |
| Unfixable transitive vuln | Document in DECISIONS with upstream issue link; target moderate-only residual |
| Lockfile conflict | Single focused PR; rebase on main before merge |

---

## Effort

**S (small)** — dependency-only changes; no source architecture edits expected.

---

## Impact

| Area | Impact |
|------|--------|
| Segurança | PMI 6.5 → target +0.5 |
| Compliance | Unblocks enterprise security questionnaires |
| Program 1 | Clears Wave 1 first gate; enables 1D-1 and MDP-1 |

---

## Exit Criteria (Definition of Done)

- [ ] `npm audit` — 0 high, 0 critical (or ADR for each exception)
- [ ] `npm run verify:governance` exit 0
- [ ] `npm run build` exit 0
- [ ] TD-008 updated in TECH-DEBT.md
- [ ] CURRENT-STATE + ENGINEERING-JOURNAL updated
- [ ] PR merged; RHP post-merge health check pass

---

## Next Mission After S3

**IFM 1D-1** — Add V13–V20 capability gates to CI (TD-013).

---

*Prepared automatically by IFM Phase 1 Replanning mission. Execute under [PLATFORM-IMPLEMENTATION-PROTOCOL.md](./PLATFORM-IMPLEMENTATION-PROTOCOL.md).*
