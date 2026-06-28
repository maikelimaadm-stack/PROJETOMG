# 10 — Platform Boundaries

**Constitution document:** 10 of 11  
**Status:** Official  
**Version:** 1.0.0

---

## 1. Purpose

Define hard boundaries between platform layers, runtime environments, and future products — so implementations do not leak concerns across layers.

---

## 2. Frontend ↔ Backend Boundary

```
Browser (React)
  └── src/apis/*          HTTP clients only
        └── /api/*        Fastify routes
              └── services → repositories → Prisma → PostgreSQL
```

| Rule | Detail |
|------|--------|
| No direct DB from frontend | Never import Prisma in `src/` |
| API contracts in `src/apis/` | One folder per domain |
| Auth token | Bearer + cookie; `tokenStore.js` |
| Tenant scope header | `X-Empresa-Id` from localStorage |
| Error shape | Backend global handler; frontend surfaces via toast/MakErrorState |

Backend module auto-discovery: `backend/src/routes/index.js` scans `modules/` for `registerModuleRoutes`.

---

## 3. Foundation ↔ Domain Boundary

See [03-FOUNDATION-RULES.md](./03-FOUNDATION-RULES.md) and [07-PRINCIPLES-OF-PROMOTION.md](./07-PRINCIPLES-OF-PROMOTION.md).

**Litmus test:** If removing a module would not require deleting this code from Foundation, the code belongs in the module.

| Side | Contains |
|------|----------|
| Foundation | How cadastro works |
| Domain | What Empresa/Marca/Produto/Campo means |

---

## 4. ModeloBase1 ↔ framework/mak Boundary

| Layer | Owns |
|-------|------|
| **ModeloBase1** | Page orchestration, config factory, visual SSOT, module-facing hooks |
| **framework/mak** | Runtime (`defineMakModule`), metadata builders, config engines, table/form implementations, preferences motor |

ModeloBase1 **consumes** framework/mak — it does not duplicate MakCadastroTable/MakCadastroForm logic.

Re-exports: ModeloBase1 `*Config/` folders re-export mak config engines for stable module import paths.

---

## 5. cadastro-engine ↔ framework/cadastro Boundary

| Layer | Status | Owns |
|-------|--------|------|
| **cadastro-engine** | Foundation — active | LayoutEngine, FieldEngine, ValidationEngine, RenderEngine, CustomFieldEngine |
| **framework/cadastro** | Legacy — transitional | Emp* configurators, layout V3 stores, export utils |

**Rule:** New engine primitives go to cadastro-engine. framework/cadastro is read-only except promotion extractions.

---

## 6. Multi-Tenant Boundaries

### Tenant (`Cliente`)

- Root isolation key: `cliente_id` on all operational tables
- Module licensing: `ClienteModulo` — backend `moduleGuard.js`
- Counters: optional denormalized `Cliente.total_*`

### Multi-empresa (`Empresa`)

- User ↔ company ACL: `PermissaoEmpresa`
- Global access flag: `Usuario.acesso_global`
- Header validation: `loadAccessScope` rejects unauthorized `X-Empresa-Id`
- Company-scoped resources: Empresa, Anexos, CADCPS per-empresa application

### Scoping differences

| Entity | Scope |
|--------|-------|
| Empresa, Anexo | cliente + empresa |
| Marca, Produto | cliente only (no empresa_id) |
| CADCPS campos | cliente + optional empresa applicability |

New modules must declare scoping in Prisma schema and enforce in repository queries.

---

## 7. CADCPS → MAK DATA PLATFORM Evolution

CADCPS is the **seed** of the Data Dictionary — not the final architecture.

| Today (CADCPS) | Target (MDP Data Dictionary) |
|----------------|------------------------------|
| Custom fields only | All fields (native + custom + computed) |
| `CadCpsCampo` model | Data Dictionary entry |
| Admin module (cadcps) | Field Dictionary management UI |
| `/api/cadastro/:entity/campos` | `/api/mdp/fields` (evolved) |

**Relationship Dictionary** and **Entity Dictionary** are new — no full implementation exists yet.

**Rule:** Extend CADCPS into MDP — do not create parallel field metadata systems (Constitution D-010, D-012).

Full specification: `docs/engineering/MAK-DATA-PLATFORM.md`

---

## 8. Preferences Boundary

| Concern | Owner |
|---------|-------|
| Preference motor | framework/mak/preferences |
| Layout sync engine | cadastro-engine/preferences/LayoutPreferencesEngine |
| Storage keys | Module preference adapter (`keyPrefix`) |
| Persistence | Backend `UsuarioPreferencia` |
| Schema version | `versao_schema` column |
| Cross-tab sync | `makPreferencesCrossTab.js` |

Preferences are **user-scoped**, not tenant-global. Never store tenant-wide UI state in user preferences without explicit design.

---

## 9. Config Engine Boundary

Each V13–V20 engine:

- Registers per `moduleId` at bootstrap
- Exposes metadata to ModeloBase1 factory
- Does **not** call backend directly (except via module repository hooks)

Workflow/Actions/Events operate **client-side** today — no backend orchestration boundary yet. Future Automation Studio must define server boundary before implementation.

---

## 10. Deployment Boundaries

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Local dev | Vite `:5173` | Optional `:3001` or proxy to Railway |
| Production | Vercel (static) | Railway (Fastify) |

Default local dev proxies `/api` to production Railway when `VITE_API_PROXY_TARGET` is set (see `AGENTS.md`).

Environment secrets:

- Frontend: `.env.local` (never committed)
- Backend: `backend/.env` — DATABASE_URL, JWT_SECRET, SUPABASE_*

---

## 11. External Services Boundaries

| Service | Role | Not used for |
|---------|------|--------------|
| **Supabase** | Storage admin client, env validation | Primary auth (custom JWT used) |
| **Redis** | Optional rate limit + tiered cache | Required for core CRUD |
| **PostgreSQL** | Primary data store | — |

Do not introduce external service as source of truth for module metadata without Constitution amendment.

---

## 12. Future Platform Boundaries (Planned)

These products **do not exist in code** yet. Boundaries are declared now to prevent ad-hoc implementations.

### MAK Studio

- **Consumes:** config engine metadata APIs, CADCPS, registries
- **Does not:** duplicate LayoutEngine/FieldEngine implementations
- **Persists to:** same metadata stores modules use today (extended)

### Marketplace

- **Builds on:** `ClienteModulo` licensing concept
- **Requires:** package registry, version pinning, sandbox — none exist today
- **Does not:** allow arbitrary code injection into Foundation

### Knowledge Platform

- Separate content layer — no coupling to cadastro runtime

### AI Platform

- Separate inference layer — calls module APIs, never bypasses RBAC
- No training on tenant data without explicit contract

### Sync / Offline

- **Target (D-014):** Sync Platform = L6 service (outbox, replication); Offline = L7 client capability consuming Sync
- **Today:** Preferences localStorage cache only — not full offline
- Detail: [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) §L6.4, §L7

---

## 13. Registry Synchronization Boundary

These files must describe the **same certified modules**:

| File | Location |
|------|----------|
| Frontend registry | `config/cadastro-modules.registry.json` |
| Generated routes | `src/modules/generatedModules.json` |
| Backend registry | `backend/config/cadastro-modules.registry.json` |

**Known inconsistency (2026-06-28):** Backend registry lists only `empresas`; frontend lists 4 modules. Must be reconciled in a future stability mission — not by bypassing registry.

Bootstrap files (`registerMak*ConfigEngine.js`) read frontend registry.

---

## 14. Testing Boundaries

| Test type | Boundary tested |
|-----------|-----------------|
| Unit scripts | Pure functions, validators |
| Gate scripts | Architecture contracts |
| Mock E2E | Frontend with mocked API |
| Full E2E | Frontend + backend + DB |
| Security probe | Multi-tenant isolation |

E2E tests must not become the only documentation of architecture — Constitution and gates are primary.

---

## 15. Boundary Violation Signals

| Signal | Likely violation |
|--------|------------------|
| Import `modules/empresas` from framework/mak | Foundation → domain leak |
| Prisma import in frontend | Frontend → DB leak |
| Structural JSX in `modules/*/pages` | Domain → UI leak |
| New Emp* component outside framework/cadastro | Legacy layer expansion |
| Studio code in ModeloBase1 | Future product → Foundation leak |

---

*Return to: [00-MAK-CONSTITUTION.md](./00-MAK-CONSTITUTION.md)*
