# CURRENT-STATE — MAK Gestão Platform

**Status:** Living document — update every mission  
**Last verified:** 2026-06-28  
**Verified by:** IFM Phase 1 Replanning  
**Next review:** Start of every mission (mandatory per README_AI.md)

---

## Platform Summary

| Attribute | Value |
|-----------|-------|
| Product | MAK Gestão ERP — metadata-driven multi-tenant SaaS |
| Frontend | React 18 + Vite 6 + React Query + Tailwind/shadcn |
| Backend | Fastify 5 + Prisma 6 + PostgreSQL |
| Foundation | Enterprise V10.2.0 — **frozen** 2026-06-28 |
| Constitution | v1.0.0 — `docs/constitution/` |
| Master Architecture | v1.0.0 — `docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md` |
| Platform Language Standard | v1.0.0 — `docs/architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md` |
| Platform Maturity Index | v1.1.0 — `docs/engineering/PLATFORM-MATURITY-INDEX.md` |
| Implementation Protocol | v1.1.0 — `docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md` (RHP D-019) |
| Global technical score | Foundation track **6.8/10** · Full platform **3.6/10** — [PMI v1.1](./PLATFORM-MATURITY-INDEX.md) |

---

## Architecture Layers (Current)

**Target map:** [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) (L0–L7)

```
Domain modules (2 runtime) → ModeloBase1 → framework/mak → cadastro-engine → API/Prisma
                                    ↘ framework/cadastro (legacy, transitional)

Planned (IFM 1C — not implemented):
MAK DATA PLATFORM (L4) → Entity · Data · Relationship Dictionaries + Metadata Registry
Platform Core (L3) → partial today (auth, tenant, RBAC); event bus not started
```

| Layer | Path | LOC (approx) | Status |
|-------|------|--------------|--------|
| ModeloBase1 | `src/ModeloBase1/` | ~4.400 | Complete, certified |
| framework/mak | `src/framework/mak/` | ~18.900 | Complete, frozen |
| cadastro-engine | `src/framework/cadastro-engine/` | ~2.000 | Complete, frozen |
| framework/cadastro | `src/framework/cadastro/` | ~11.100 | Legacy — promotion in progress |
| Domain modules | `src/modules/` | ~5.5K | 11 folders: 2 runtime + 6 cert + 2 infra + template |
| Backend | `backend/src/` | ~8.000 | 14 modules |

---

## Certified Runtime Modules

| moduleId | Page | Pattern | Files |
|----------|------|---------|-------|
| empresas | PAGEMP | Reference — factory overrides | 42 |
| cadcps | PAGCPS | Thin page + domain runtime | 18 |

Registry SSOT: `config/cadastro-modules.registry.json` (2 entries)  
Backend registry: `backend/config/cadastro-modules.registry.json` (2 entries — **synced**)  
Routes: `src/modules/generatedModules.json`

---

## Config Engines (Capabilities V13–V20)

All gate-certified as of 2026-06-28:

| Engine | Version | Status |
|--------|---------|--------|
| Layout Config | V13 | Complete |
| Field Config | V14 | Complete |
| Validation Config | V16 | Complete |
| Formula Config | V17 | Complete |
| Events Config | V18 | Complete |
| Actions Config | V19 | Complete |
| Workflow Config | V20 | Complete |
| Import / History / Preferences | — | Complete |
| Grouping / Pivot | — | **Disabled** (`disabled_certified`) |

Detail: [CAPABILITIES-REGISTRY.md](./CAPABILITIES-REGISTRY.md)

---

## Governance Status

| Check | Status (2026-06-28) |
|-------|----------------------|
| `npm run build` | ✅ Pass |
| `npm run lint` | ✅ Pass (0 errors) |
| `npm run typecheck` | ⚠️ Known noise in `src/shared/ui/*` |
| `npm run verify:governance` | ✅ Pass — G31–G136 (build + lint + certification + governance) |
| CI workflow | `.github/workflows/foundation-governance.yml` — G31–G136 only |
| Gates V13–V20 (G156–G261) | ✅ Pass when run manually — **not in default CI** (see TD-013) |
| Supplementary gates | `gate:functional-completion`, `gate:foundation-completion`, V15/V15.1/V15.2 — manual |
| E2E specs | 12 files in `e2e/*.spec.js` |
| Frontend npm audit | ⚠️ 15 vulnerabilities (1 low, 5 moderate, 9 high) |
| Backend npm audit | ✅ 0 vulnerabilities |

---

## Database

| Aspect | State |
|--------|-------|
| Models (Prisma) | 17 |
| Migrations | 11 |
| Indexes | ~60 |
| Multi-tenant | `cliente_id` on all operational models |
| Multi-empresa | `PermissaoEmpresa` + `X-Empresa-Id` header |
| CADCPS | Partial data dictionary (field metadata) |

---

## MAK DATA PLATFORM (MDP) — Status

| Component | Status | Seed in code |
|-----------|--------|--------------|
| Entity Dictionary | **Not implemented** | `cadastro-modules.registry.json`, `CadCpsTela` |
| Data Dictionary | **Partial** (~45%) | CADCPS `CadCpsCampo` (custom fields only) |
| Relationship Dictionary | **Not implemented** | `relation_entity` field hints only |
| Metadata Registry | **Partial** (~30%) | Engine registries (runtime), module metadata JS |

**Spec:** [MAK-DATA-PLATFORM.md](./MAK-DATA-PLATFORM.md) · **Decision:** D-012

---

## Not Implemented (Code-Verified)

| Capability | Status |
|------------|--------|
| MAK Studio | Not started |
| Marketplace | Not started (`ClienteModulo` = feature flags only) |
| Knowledge Platform | Not started |
| AI Platform | Not started |
| Offline-first / Sync Engine | Preferences cache only |
| Full entity Data Dictionary | MDP spec only — CADCPS partial today |
| Backend domain event bus | Not started |

---

## Known Inconsistencies (Doc = Code Verified)

See [TECH-DEBT.md](./TECH-DEBT.md) for full register. Active P1 items:

1. **P1:** Frontend npm audit — 15 vulns, 9 high (TD-008) → **IFM 1A-S3 next**
2. **P1:** V13–V20 capability gates not in CI (TD-013) → IFM 1D-1
3. **P1:** 78 files import legacy `framework/cadastro/` (TD-003) → IFM 1B A1
4. **P1:** Empresas nomenclature in ModeloBase1 generic layer (TD-004) → IFM 1B A2
5. **P2:** Dual-path DDL — Prisma + `ensureSchema.js` (TD-005) → S4 after MDP-1
6. **P2:** UI monoliths — MakCadastroTable 2,407 LOC (TD-006) → defer post-MDP-4

---

## Plataforma Atual × Alvo (Summary)

Full GAP analysis: [DOCUMENTATION-CERTIFICATION.md §3](./DOCUMENTATION-CERTIFICATION.md#3-plataforma-atual--plataforma-alvo-mak-2035)

**Maturity dashboard:** [PLATFORM-MATURITY-INDEX.md](./PLATFORM-MATURITY-INDEX.md)

---

## Bundle / Performance (Build 2026-06-28)

| Asset | Size (gzip) |
|-------|-------------|
| Main chunk | 492 KB (142 KB gzip) |
| MG prototype CSS | 281 KB (32 KB gzip) |
| Virtualization | `@tanstack/react-virtual` — table + cards |

---

## Update Protocol

After every mission, update sections affected by the change. Set `Last verified` to current date. Cross-check against code — do not copy from chat or old reports.

---

*Authoritative rules: [Constitution](../constitution/00-MAK-CONSTITUTION.md)*
