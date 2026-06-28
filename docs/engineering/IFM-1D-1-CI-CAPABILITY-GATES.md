# IFM 1D-1 — CI Capability Gates (V13–V20)

**Mission ID:** IFM 1D-1  
**Program:** IFM Phase 1 — Wave 2 (Governança CI)  
**Priority:** P1  
**Tech Debt:** TD-013  
**Status:** **Prepared — ready to execute**  
**Prerequisites:** IFM 1A-S3 ✅

---

## Objective

Add Config Engine certification gates **V13–V20 (G156–G261)** to GitHub Actions CI so capability regressions cannot merge undetected during MDP implementation.

---

## Evidence (Baseline @ 2026-06-28)

| Check | CI today | Manual |
|-------|----------|--------|
| G31–G136 | ✅ `.github/workflows/foundation-governance.yml` | — |
| G156–G261 (V13–V20) | ❌ Not in CI | ✅ Pass individually |

Source: TD-013, `PLATFORM-MATURITY-INDEX.md` §4.1 Foundation.

---

## Scope

### In scope

- Extend `foundation-governance.yml` OR add parallel job running:
  - `npm run gate:layout-config-engine-v13`
  - `npm run gate:field-config-engine-v14`
  - `npm run gate:validation-config-engine-v16`
  - `npm run gate:formula-config-engine-v17`
  - `npm run gate:event-config-engine-v18`
  - `npm run gate:action-config-engine-v19`
  - `npm run gate:workflow-config-engine-v20`
- Alternatively: single aggregate script `npm run gate:capabilities` (if created — minimal wrapper)
- Verify CI runtime acceptable (<15 min total workflow)
- Update TECH-DEBT TD-013, CURRENT-STATE, CAPABILITIES-REGISTRY

### Out of scope

- Foundation code changes
- MDP implementation
- New capability engines
- Changing gate logic (only CI wiring)

---

## Acceptance criteria

- [ ] All V13–V20 gate scripts pass locally
- [ ] GitHub Actions `Foundation Governance` workflow runs capability gates on PR/push to `main` and `cursor/**`
- [ ] CI green on branch with only workflow change
- [ ] `npm run verify:governance` still passes
- [ ] ENGINEERING-JOURNAL + CURRENT-STATE updated

---

## Risks

| Risk | Mitigation |
|------|------------|
| CI time increase | Run capability gates in parallel job after build+lint |
| Flaky gates | Use same 5-cycle pattern locally before merge |
| Duplicate build | Share build artifact or run gates sequentially post-build in one job |

---

## Effort

**S (small)** — workflow YAML + optional npm script wrapper; no application code.

---

## Next mission after 1D-1

**IFM 1C-MDP-1** — Entity Dictionary ([IFM-1C-MDP-1-ENTITY-DICTIONARY.md](./IFM-1C-MDP-1-ENTITY-DICTIONARY.md))

---

*Prepared by IFM 1A-S3 mission. Execute under [PLATFORM-IMPLEMENTATION-PROTOCOL.md](./PLATFORM-IMPLEMENTATION-PROTOCOL.md).*
