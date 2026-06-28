# 01 — Vision and Scope

**Constitution document:** 01 of 11  
**Status:** Official  
**Version:** 1.0.0

---

## 1. Vision

MAK Gestão evolves from a traditional ERP into a **metadata-driven enterprise platform** capable of:

1. **Scaling cadastro modules** — hundreds of CRUD modules from configuration, not bespoke UI code.
2. **Certified structural consistency** — every cadastro screen shares the same UX, performance, and preference model.
3. **Future Low-Code / MAK Studio** — visual design surfaces built on existing config engines (V13–V20), not parallel implementations.
4. **Multi-tenant SaaS at scale** — many clients (`Cliente`), each with multiple companies (`Empresa`), RBAC, and module licensing.

The north star: **a developer or AI generates a module; the platform renders it; governance guarantees it never breaks the Foundation.**

---

## 2. What MAK Is Today (Evidence-Based)

As of Constitution v1.0.0, the platform **is**:

| Capability | State |
|------------|-------|
| Multi-tenant ERP API | Production architecture (Fastify + Prisma + PostgreSQL) |
| Certified cadastro Foundation | Frozen V10 — ModeloBase1 + framework/mak |
| Config engines V13–V20 | Layout, Field, Validation, Formula, Events, Actions, Workflow |
| Full-stack module generator | Frontend + backend scaffold |
| Governance CI | 20+ gate scripts, GitHub Actions workflow |
| Custom fields (CADCPS) | Partial data dictionary for field metadata |
| User preferences sync | Cross-device, optimistic concurrency, E2E coverage |

The platform **is not yet**:

| Capability | State |
|------------|-------|
| MAK Studio (visual designers) | Not started in code |
| Marketplace / plugins | Not started — only `ClienteModulo` feature flags |
| Knowledge Platform | Not started |
| AI Platform | Not started |
| Offline-first / sync engine | Preferences local cache only |
| Full entity data dictionary | CADCPS covers fields, not complete entity catalog |

These gaps are **in scope for the long-term vision** but **out of scope for current Foundation work** unless a formal mission declares otherwise.

---

## 3. Product Scope

### In scope (current development)

- Cadastro modules (CRUD list + form + search + preferences)
- Domain business rules per module
- Backend CRUD, RBAC, multi-empresa scoping
- Custom fields administration (CADCPS)
- Attachments (`RegistroAnexo`), audit log, metrics counters
- User/screen preferences persistence
- Foundation evolution (backward-compatible only)
- Config engine certification and metadata catalogs

### Out of scope (unless explicit mission)

- Rewriting Foundation or ModeloBase1 without formal exception
- Imperative cadastro pages (FORM/TBL/Sankhya patterns)
- Parallel UI frameworks per module
- MAK Studio UI implementation (future mission)
- Third-party marketplace runtime
- General-purpose workflow BPM outside config engine hooks
- Mobile native apps

### Explicitly deferred

- Column grouping / pivot in certified table (removed; requires future Capability Pack)
- `framework/cadastro/` legacy layer — coexistence tolerated; promotion to Foundation ongoing

---

## 4. Strategic Pillars

### Pillar 1 — Single Source of Truth (SSOT)

ModeloBase1 owns all **structural UI**. Modules own **domain only**. See [02-ARCHITECTURE-PRINCIPLES.md](./02-ARCHITECTURE-PRINCIPLES.md).

### Pillar 2 — Metadata over Code

Table columns, form fields, layouts, validations, formulas, events, actions, and workflows are declared in metadata and processed by config engines — not hardcoded per module page.

### Pillar 3 — Governance over Memory

Architectural rules are enforced by automated gates (`npm run gate:*`), not by recall. See [06-GOVERNANCE-AND-GATES.md](./06-GOVERNANCE-AND-GATES.md).

### Pillar 4 — Generator over Copy-Paste

New modules start from `scripts/generate-cadastro-module.mjs` templates. Manual scaffolding is prohibited for certified modules.

### Pillar 5 — Promotion over Duplication

Reusable infrastructure discovered in domain modules is **promoted** to Foundation (cadastro-engine, framework/mak, ModeloBase1) — never copied. See [07-PRINCIPLES-OF-PROMOTION.md](./07-PRINCIPLES-OF-PROMOTION.md).

---

## 5. Target Personas

| Persona | Primary interaction |
|---------|---------------------|
| **Platform engineer** | Foundation, gates, generator, config engines |
| **Module developer** | Domain config, metadata, backend service/repo, schemas |
| **Tenant admin** | CADCPS, preferences, module activation (`ClienteModulo`) |
| **End user** | Certified cadastro UX (Empresas-style) |
| **AI agent** | Reads Constitution first; generates modules via generator; never breaks gates |

---

## 6. Long-Term Platform Layers (Vision)

```
┌─────────────────────────────────────────────────────────────┐
│  FUTURE: MAK Studio, Marketplace, Knowledge, AI           │
│  (Not implemented — built ON config engines + metadata)    │
├─────────────────────────────────────────────────────────────┤
│  TODAY: Domain modules (config + business rules)           │
├─────────────────────────────────────────────────────────────┤
│  TODAY: ModeloBase1 + framework/mak + Config Engines V13–V20 │
├─────────────────────────────────────────────────────────────┤
│  TODAY: cadastro-engine (Layout, Field, Validation, Render)  │
├─────────────────────────────────────────────────────────────┤
│  TODAY: Backend API + Prisma + PostgreSQL                    │
└─────────────────────────────────────────────────────────────┘
```

Future surfaces **must reuse** existing engines and metadata builders. Creating parallel implementations is a constitutional violation. See [08-DO-NOT-DO-LIST.md](./08-DO-NOT-DO-LIST.md).

---

## 7. Success Criteria

A change aligns with MAK vision when:

1. New cadastro modules are thin (~10 LOC page) and pass governance.
2. Structural improvements propagate to all certified modules automatically.
3. Domain code contains zero structural UI duplication.
4. Gates pass without widening legacy allowlists.
5. Documentation in `/docs/constitution/` remains accurate after the change.

---

## 8. Scope Boundaries vs. Other Products

| Product | Relationship to MAK Gestão ERP |
|---------|-------------------------------|
| MAK Studio | Future design layer; consumes same metadata |
| CADCPS | In-product partial data dictionary |
| Supabase | Storage/admin client; auth is custom JWT |
| Vercel / Railway | Deployment targets; not architectural dependencies |

---

*Next: [02-ARCHITECTURE-PRINCIPLES.md](./02-ARCHITECTURE-PRINCIPLES.md)*
