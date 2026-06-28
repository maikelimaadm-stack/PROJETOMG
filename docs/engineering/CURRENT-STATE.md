# CURRENT-STATE — MAK Gestão Platform

**Status:** Living document — update every mission  
**Last verified:** 2026-06-28  
**Verified by:** Mission 0.2 Documentation Certification (`DOCUMENTATION-CERTIFICATION.md`)  
**Next review:** Start of every mission (mandatory per README_AI.md)

---

## Platform Summary

| Attribute | Value |
|-----------|-------|
| Product | MAK Gestão ERP — metadata-driven multi-tenant SaaS |
| Frontend | React 18 + Vite 6 + React Query + Tailwind/shadcn |
| Backend | Fastify 5 + Prisma 6 + PostgreSQL |
| Foundation | Enterprise V10.1.0 — **frozen** 2026-06-27 |
| Constitution | v1.0.0 — `docs/constitution/` |
| Global technical score | ~7.0/10 (audit 2026-06-28) |

---

## Architecture Layers (Current)

```
Domain modules (4 runtime) → ModeloBase1 → framework/mak → cadastro-engine → API/Prisma
                                    ↘ framework/cadastro (legacy, transitional)
```

| Layer | Path | LOC (approx) | Status |
|-------|------|--------------|--------|
| ModeloBase1 | `src/ModeloBase1/` | ~4.400 | Complete, certified |
| framework/mak | `src/framework/mak/` | ~18.900 | Complete, frozen |
| cadastro-engine | `src/framework/cadastro-engine/` | ~2.000 | Complete, frozen |
| framework/cadastro | `src/framework/cadastro/` | ~11.100 | Legacy — promotion in progress |
| Domain modules | `src/modules/` | ~7.200 | 12 folders: 4 runtime + 6 cert + 2 infra |
| Backend | `backend/src/` | ~8.000 | 14 modules |

---

## Certified Runtime Modules

| moduleId | Page | Pattern | Files |
|----------|------|---------|-------|
| empresas | PAGEMP | Reference — factory overrides | 42 |
| marcas | PAGMAR | Minimal factory | 12 |
| produtos | PAGPRO | Minimal factory | 12 |
| cadcps | PAGCPS | Thin page + domain runtime | 18 |

Registry SSOT: `config/cadastro-modules.registry.json` (4 entries)  
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
| Models (Prisma) | 19 |
| Migrations | 10 |
| Indexes | ~60 |
| Multi-tenant | `cliente_id` on all operational models |
| Multi-empresa | `PermissaoEmpresa` + `X-Empresa-Id` header |
| CADCPS | Partial data dictionary (field metadata) |

---

## Not Implemented (Code-Verified)

| Capability | Status |
|------------|--------|
| MAK Studio | Not started |
| Marketplace | Not started (`ClienteModulo` = feature flags only) |
| Knowledge Platform | Not started |
| AI Platform | Not started |
| Offline-first / Sync Engine | Preferences cache only |
| Full entity Data Dictionary | CADCPS fields only |
| Backend domain event bus | Not started |

---

## Known Inconsistencies (Doc = Code Verified)

See [TECH-DEBT.md](./TECH-DEBT.md) for full register. Critical:

1. **P0:** `Produto` Prisma model exists — no SQL migration
2. **P1:** `backend/config/cadastro-modules.registry.json` lists only empresas (frontend: 4)
3. **P1:** Nomenclature Empresas in generic ModeloBase1 layer (props, CSS scopes)
4. **P2:** Dual-path DDL (Prisma migrate + `ensureSchema.js`)
5. **P1:** V13–V20 capability gates not in CI pipeline (TD-013)
6. **P1:** 82 files import `@/framework/cadastro/` legacy layer

---

## Plataforma Atual × Alvo (Summary)

Full GAP analysis: [DOCUMENTATION-CERTIFICATION.md §3](./DOCUMENTATION-CERTIFICATION.md#3-plataforma-atual--plataforma-alvo-mak-2035)

**Official next program:** Programa 1 — Integridade e Fundação de Metadados (IFM) — see [ROADMAP.md](./ROADMAP.md) and DECISIONS D-011.

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
