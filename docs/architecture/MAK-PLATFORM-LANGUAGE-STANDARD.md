# MAK Platform Language Standard

**Status:** Official — Platform nomenclature reference  
**Version:** 1.0.0  
**Effective date:** 2026-06-28  
**Program:** 0.5  
**Decision:** D-015  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md) and [MAK-2035-MASTER-ARCHITECTURE.md](./MAK-2035-MASTER-ARCHITECTURE.md)

---

## 1. Purpose

This document is the **official vocabulary** of MAK Gestão. It eliminates conceptual ambiguity by defining:

- Which terms are **official** for all future documentation, Studio UI, APIs, and modules
- Which terms remain **only for historical/code compatibility**
- Which terms are **deprecated** and must not appear in new documentation

**Binding rule:** No new documentation, capability, or Studio surface may introduce conflicting terms without a formal Decision register entry (D-0XX).

This mission does **not** rename code, files, APIs, or database objects.

---

## 2. Language Policy

| Context | Rule |
|---------|------|
| **Platform architecture docs** | English official terms (this document) |
| **Product name** | **MAK Gestão** (Portuguese brand — unchanged) |
| **Code identifiers** | Existing names preserved (`moduleId`, `ModeloBase1`, `cadastro-engine`, `Cliente`, `Empresa`) |
| **User-facing UI copy** | Portuguese allowed; map to official English terms in technical docs |
| **API paths (today)** | Legacy paths preserved until explicit migration mission |
| **New API design** | English nouns aligned with this standard (`/api/mdp/entities`, not `/api/mdp/entidades`) |

### Identifier conventions (official — new work)

| Identifier | Format | Example |
|------------|--------|---------|
| Platform layer | `L{n}` + official name | L4 MAK DATA PLATFORM |
| Entity | `entityId` | `EmpresaCadastro` |
| Business Module | `moduleId` | `empresas` |
| Field | `fieldId` | `empresa.razao_social` |
| Relationship | `relationshipId` | `empresa.marca` |
| Registry entry | `{type}Id` | `layout.main-form` |
| Package | `packageId` + semver | `com.mak.crm-core@1.2.0` |

---

## 3. Core Term Hierarchy

```
MAK Gestão (product)
└── Platform (technical)
    ├── L7 Experience Layer
    ├── L6 Platform Services (Marketplace · Knowledge · AI · Sync)
    ├── L5 MAK Studio
    ├── L4 MAK DATA PLATFORM (MDP)
    │     ├── Entity Dictionary
    │     ├── Data Dictionary
    │     ├── Relationship Dictionary
    │     └── Metadata Registry
    ├── L3 Platform Core
    ├── L2 Foundation Runtime
    │     ├── ModeloBase1 (Cadastro UI Motor)
    │     ├── MAK Runtime Framework (framework/mak)
    │     ├── Foundation Engine Primitives (cadastro-engine)
    │     └── Config Engines V13–V20
    ├── L1 Business Modules
    └── L0 Data & Infrastructure
          ├── Business Data (tenant records)
          └── Platform Metadata (MDP definitions — persisted)
```

### Resolved ambiguities

| Ambiguous term | Resolution |
|----------------|------------|
| **Platform Runtime** | Use **Compiled Runtime** (output of MDP compile + boot hydration) or **Foundation Runtime** (L2 layer). Do not use "Platform Runtime" alone — it has no official layer assignment. |
| **Platform Metadata** | Umbrella term for all MDP-persisted definitions (dictionaries + registry). Not the same as **Runtime Registry** (boot cache). |
| **Metadata** (alone) | Always qualify: **Platform Metadata** (definitions) or **Module Metadata** (JS config files until migrated) or **Business Data** (records). |
| **Domain module** | Deprecated in new docs → **Business Module** |
| **Cadastro module** | Acceptable when CRUD-specific → prefer **Cadastro Business Module** in architecture docs |
| **Offline Platform** | Deprecated → **Offline Capability** (L7 client feature consuming Sync Platform) |
| **IA / AI** | Official platform name: **AI Platform**. **IA** allowed in Portuguese UX only. |
| **Low-Code** | Not a layer — **Low-Code Capability** (outcome of MAK Studio + MDP, not a separate system) |

---

## 4. Term Inventory — Full Classification

Each entry: **current name → context → problem → official name → compatibility → impact**.

### 4.1 Platform & layers

| Nome atual | Contexto | Problema | Nome oficial | Compatibilidade | Impacto |
|------------|----------|----------|--------------|-----------------|---------|
| MAK Gestão | Product brand | — | **MAK Gestão** | Permanente | Nenhum |
| Platform | Technical system | Confundido com Marketplace | **Platform** (escopo MAK Gestão) | Permanente | Docs |
| Foundation | Usado para L2 e ocasionalmente todo o core | Ambíguo | **Foundation Runtime** (L2) | **Foundation** permanece em gates, `governance-baseline.json`, paths | Docs novos usam Foundation Runtime; código inalterado |
| Platform Runtime | Docs antigos, conversas informais | Sem camada definida | **Compiled Runtime** ou **Foundation Runtime** (conforme contexto) | Evitar em docs novos | Clarifica boot vs execução |
| Platform Core | Master Architecture L3 | — | **Platform Core** | Permanente | Nenhum |
| Domain module | Constitution, paths `src/modules/` | "Domain" vs "Business" inconsistente | **Business Module** | `domain module`, `src/modules/{moduleId}/` — código legado | Docs e Studio |
| Cadastro module | Gates, generator, registry | OK mas impreciso fora CRUD | **Cadastro Business Module** | `cadastro module`, `cadastro-modules.registry.json` | Docs; registry filename legado |
| Certified module | Governance | OK | **Certified Business Module** | `certified module` em gates | Docs |
| Runtime module | CURRENT-STATE | Redundante | **Certified Business Module** (em runtime) | Histórico | Docs |
| Backend module | `backend/src/modules/` | Paralelo ao frontend | **Backend Service Module** | Path legado | Docs/API specs |
| Experience Layer | L7 | — | **Experience Layer** | Permanente | Nenhum |
| Platform Services | L6 | — | **Platform Services** | Permanente | Nenhum |

### 4.2 MAK DATA PLATFORM (MDP)

| Nome atual | Contexto | Problema | Nome oficial | Compatibilidade | Impacto |
|------------|----------|----------|--------------|-----------------|---------|
| MAK DATA PLATFORM / MDP | IFM 1C, Master Architecture | — | **MAK DATA PLATFORM (MDP)** | Permanente | Nenhum |
| Entity | Vários — Prisma model, registry, UI | Confunde registro de negócio com definição | **Entity** (definição MDP); **Business Record** (instância Prisma) | `entityName`, `entity_name`, modelos Prisma | Docs, MDP schema, Studio |
| Entity Dictionary | MDP-1 | — | **Entity Dictionary** | Permanente | Nenhum |
| entidade | Docs PT, conversas | Duplica Entity | **Entity** (docs técnicos EN) | PT em copy de usuário | Docs |
| entityName | Registry JSON | Diferente de entityId alvo | **entityId** (oficial MDP); **entityName** (legado registry) | Campo registry até MDP-1 | MDP-1 migration |
| Entity catalog | ROADMAP informal | Duplica Entity Dictionary | **Entity Dictionary** | Descontinuar "entity catalog" em docs novos | Docs |
| Data Dictionary | MDP-2 | — | **Data Dictionary** | Permanente | Nenhum |
| Field Dictionary | MAK-DATA-PLATFORM §3.2 informal | Sinônimo não oficial | **Data Dictionary** | Descontinuar "Field Dictionary" | Docs |
| Relationship Dictionary | MDP-3 | — | **Relationship Dictionary** | Permanente | Nenhum |
| Metadata Registry | MDP-4 | — | **Metadata Registry** | Permanente | Nenhum |
| Platform Metadata | Termo genérico | — | **Platform Metadata** (todas definições MDP persistidas) | Permanente | Docs |
| metadata (genérico) | JS files, conversas | Sobrecarga | Qualificar sempre (§3) | Arquivos `*Metadata.js` legado | Docs |
| Module metadata | `*ModuleMetadata.js` | Não é MDP ainda | **Module Metadata** (transitório, pré-MDP) | Paths legado até migração MDP | IFM 1C |
| Runtime Registry / engine registry | `*ConfigRegistry.js` | Confundido com Metadata Registry | **Runtime Registry** | Paths `*ConfigRegistry.js` legado | Docs, MDP compile docs |
| Config registry | Informal | Ambíguo | **Runtime Registry** (execução) ou **Metadata Registry** (persistência) | — | Docs |
| CADCPS | Módulo + padrão custom fields | Nome legado forte | **CADCPS** (módulo legado); destino = **Data Dictionary** | Código, Prisma `CadCps*`, moduleId `cadcps` | Evolução IFM 1C |
| Custom fields / campos personalizados | UI, engine | Informal | **Custom Field** (entrada Data Dictionary, `source=custom`) | API `/api/cadastro/:entity/campos` legado | MDP-2 |
| Native field | `*Form.constants.js` | Informal | **Native Field** (`source=native` no Data Dictionary) | Constants legado | MDP-2 |
| Computed field | Formula engine | Informal | **Computed Field** (`source=computed`) | — | MDP-2 |
| Introspection API | MDP-4 | — | **MDP Introspection API** | Permanente | Studio, AI Platform |
| Compile pipeline | MDP boot | — | **MDP Compile Pipeline** | Permanente | Docs |
| Definition Publication | Master Architecture | vs Deploy confundido | **Definition Publication** (MDP version publish) | — | Docs |
| Deploy | Runtime activation | vs Publication confundido | **Runtime Deploy** (ativar versão compilada) | — | Docs |

### 4.3 Foundation Runtime (L2)

| Nome atual | Contexto | Problema | Nome oficial | Compatibilidade | Impacto |
|------------|----------|----------|--------------|-----------------|---------|
| ModeloBase1 | Path, componentes | Nome de código congelado | **ModeloBase1** (nome oficial congelado); alias descritivo: **Cadastro UI Motor** | Paths, classes, gates — inalterados | Docs podem usar ambos |
| framework/mak | Path | Não descritivo | **MAK Runtime Framework** (docs); **framework/mak** (código) | Path legado permanente | Docs |
| cadastro-engine | Path | PT/EN mix | **Foundation Engine Primitives** (docs); **cadastro-engine** (código) | Path legado permanente | Docs |
| framework/cadastro | Legacy Emp* | Expansão proibida | **Legacy Cadastro Layer** (docs); **framework/cadastro** (código) | Transitional — descontinuar em 2035 | IFM 1B |
| Config Engine | V13–V20 individual | — | **Config Engine** + versão: e.g. **Layout Config Engine (V13)** | Nomes de pasta legado | Docs, Studio |
| Capability Pack | D-004, grouping/pivot | Grupo vs engine | **Capability Pack** = conjunto certificado de Config Engines; **Config Engine** = unidade | Gates V13–V20 | Docs |
| Layout Config Engine V13 | etc. | — | **Layout Config Engine (V13)** | Paths legado | Studio: **Layout Studio** edita este engine |
| Thin page | ~10 LOC rule | Informal | **Thin Cadastro Page** | `PAG*.jsx` legado | Docs, generator |
| cadastroConfig | Module config object | Informal | **Cadastro Configuration** | Identificador legado | Docs |
| Structural UI | Constitution | — | **Structural UI** | Permanente | Nenhum |
| Visual SSOT | ModeloBase1 tokens | — | **Visual SSOT** | Permanente | Nenhum |
| makBootstrap | Boot side-effects | — | **MAK Bootstrap** | Path legado | Docs |
| Generator | `generate-cadastro-module.mjs` | — | **Cadastro Module Generator** | Script path legado | Docs |

### 4.4 Platform Core (L3)

| Nome atual | Contexto | Problema | Nome oficial | Compatibilidade | Impacto |
|------------|----------|----------|--------------|-----------------|---------|
| Platform Core | L3 | — | **Platform Core** | Permanente | Nenhum |
| Auth / Authentication | JWT custom | — | **Platform Authentication** | Paths `auth/` legado | Docs |
| Tenant | Multi-tenant | Confunde com Cliente | **Tenant** (conceito); **Cliente** (modelo Prisma) | `cliente_id`, model `Cliente` legado | Docs |
| Company | Multi-empresa | Confunde com Empresa | **Company** (conceito); **Empresa** (modelo Prisma) | `empresa_id`, model `Empresa` legado | Docs |
| RBAC | cadastroRbac.js | — | **Platform RBAC** | Hardcoded → Metadata Registry (futuro) | Docs |
| Event bus | Não implementado | — | **Platform Event Bus** | — | L3 future |
| Module licensing | ClienteModulo | — | **Module Entitlement** | `ClienteModulo` legado | Marketplace |
| Audit | AuditLog | — | **Platform Audit** | Paths legado | Docs |

### 4.5 MAK Studio (L5)

| Nome atual | Contexto | Problema | Nome oficial | Compatibilidade | Impacto |
|------------|----------|----------|--------------|-----------------|---------|
| MAK Studio | L5 | — | **MAK Studio** | Permanente | Nenhum |
| Layout Studio | Designer | — | **Layout Studio** | Permanente | Studio UI |
| Field Studio | Designer | — | **Field Studio** | Permanente | Studio UI |
| Table Studio | Designer | — | **Table Studio** | Permanente | Studio UI |
| Cards Studio | Designer | — | **Cards Studio** | Permanente | Studio UI |
| Formula Studio | Designer | — | **Formula Studio** | Permanente | Studio UI |
| Validation Studio | Designer | — | **Validation Studio** | Permanente | Studio UI |
| Events Studio | Designer | — | **Events Studio** | Permanente | Studio UI |
| Actions Studio | Designer | — | **Actions Studio** | Permanente | Studio UI |
| Workflow Studio | Designer | — | **Workflow Studio** | Permanente | Studio UI |
| Dashboard Studio | Designer | — | **Dashboard Studio** | Permanente | Studio UI |
| Permission Studio | Designer | — | **Permission Studio** | Permanente | Studio UI |
| Integration Studio | Designer | — | **Integration Studio** | Permanente | Studio UI |
| Theme Studio | Designer | — | **Theme Studio** | Permanente | Studio UI |
| Visual designer | Genérico | Impreciso | **MAK Studio** ou **{Name} Studio** | — | Docs |
| Low-Code / Low-Code Platform | Vision docs | Parece camada separada | **Low-Code Capability** (resultado Studio+MDP) | Descontinuar "Low-Code Platform" como layer | Docs |

**Studio rule:** A **{Name} Studio** edits **Platform Metadata** in MDP. It never edits Foundation code or module JS in production.

### 4.6 Platform Services (L6)

| Nome atual | Contexto | Problema | Nome oficial | Compatibilidade | Impacto |
|------------|----------|----------|--------------|-----------------|---------|
| Marketplace | L6.1 | — | **Marketplace** | Permanente | Nenhum |
| Knowledge Platform | L6.2 | — | **Knowledge Platform** | Permanente | Nenhum |
| AI Platform / IA Platform | L6.3 | IA vs AI | **AI Platform** (oficial EN); **IA** (UX PT) | Descontinuar "IA Platform" em docs EN | Docs |
| Sync Platform | L6.4 | — | **Sync Platform** | Permanente | Nenhum |
| Offline Platform | Docs antigos | Camada incorreta | **Offline Capability** (L7) | Descontinuar "Offline Platform" | Docs |
| Agent / Agents | AI context | — | **AI Agent** | Permanente | AI Platform |
| makpkg | Package format | — | **MAK Package** (`.makpkg`) | Extensão legado | Marketplace |
| Plugin | Informal | Implica injeção de código | **MAK Package** ou **Extension** | Descontinuar "plugin" (implica code injection) | Docs |
| SDK | Future npm packages | — | **MAK SDK** (`@mak/sdk-*`) | Permanente | Partner docs |
| Extension | npm/SDK | — | **Platform Extension** (MDP-only ou SDK aprovado) | — | Docs |

### 4.7 Data & business terms

| Nome atual | Contexto | Problema | Nome oficial | Compatibilidade | Impacto |
|------------|----------|----------|--------------|-----------------|---------|
| Business Data | Prisma records | vs Platform Metadata | **Business Data** | Permanente | Docs |
| Business Record | Single row | — | **Business Record** | — | Docs |
| Persistence model | Prisma | vs Entity definition | **Persistence Model** (Prisma); **Entity** (MDP definition) | Nomes Prisma legado | MDP Entity Dictionary |
| moduleId | Registry, routes | — | **moduleId** | Permanente (código) | Nenhum |
| Preferences | User/screen layout | — | **User Preferences** (overlay on published definitions) | Paths legado | Docs |
| SSOT | Vários | Sobrecarga | Qualificar: **Structural SSOT** (ModeloBase1), **Definition SSOT** (MDP), **Registry SSOT** (module list) | — | Docs |

---

## 5. Official Glossary (Quick Reference)

| Term | Definition |
|------|------------|
| **AI Platform** | L6 service — RBAC-bound agents, tools, MDP introspection |
| **Business Data** | Tenant-scoped record instances in PostgreSQL (not definitions) |
| **Business Module** | L1 deployable unit — config, metadata, domain rules, repository |
| **Cadastro Business Module** | Business Module using ModeloBase1 CRUD pattern |
| **Compiled Runtime** | Output of MDP compile + makBootstrap hydration — what executes in browser |
| **Config Engine** | Foundation Runtime component (V13–V20) consuming Runtime Registry |
| **Custom Field** | Data Dictionary entry with `source=custom` |
| **Data Dictionary** | MDP catalog of all fields (native, custom, computed) |
| **Entity** | MDP definition of a business object type (not a single record) |
| **Entity Dictionary** | MDP catalog of all entities and module bindings |
| **Experience Layer** | L7 — Web, Desktop, Mobile, Embedded widgets |
| **Foundation Runtime** | L2 — frozen execution layer (ModeloBase1, framework/mak, engines) |
| **Knowledge Platform** | L6 content layer linked to entities via MDP anchors |
| **Low-Code Capability** | Platform ability to design via Studio without code — not a separate layer |
| **MAK DATA PLATFORM (MDP)** | L4 — persisted definition SSOT (four dictionaries + registry) |
| **MAK Package** | Versioned `.makpkg` bundle for Marketplace |
| **MAK Studio** | L5 — visual designers writing Platform Metadata to MDP |
| **Metadata Registry** | MDP store of layouts, events, actions, workflows, permissions, etc. |
| **ModeloBase1** | Cadastro UI Motor — L2 structural page orchestrator (frozen name) |
| **Offline Capability** | L7 client feature — local cache + mutation queue via Sync Platform |
| **Platform Core** | L3 — auth, tenant, RBAC, events, deploy, APIs |
| **Platform Metadata** | All MDP-persisted definitions (umbrella term) |
| **Platform Services** | L6 — Marketplace, Knowledge, AI, Sync |
| **Relationship Dictionary** | MDP catalog of entity relationships |
| **Runtime Deploy** | Activating a compiled runtime version in an environment |
| **Runtime Registry** | In-memory boot cache (`*ConfigRegistry.js`) — not SSOT |
| **Sync Platform** | L6 replication service — outbox, conflict resolution |
| **Thin Cadastro Page** | Module page delegating 100% structure to ModeloBase1 (~10 LOC) |

---

## 6. Legacy Terms — Compatibility & Discontinuation

### 6.1 Permanente por compatibilidade de código (não usar em docs novos como termo primário)

| Legado | Usar em docs novos | Código |
|--------|-------------------|--------|
| domain module | Business Module | `src/modules/` inalterado |
| cadastro module | Cadastro Business Module | registry filename inalterado |
| entityName (registry) | entityId | campo JSON até MDP-1 |
| Foundation (alone) | Foundation Runtime | gates inalterados |
| framework/cadastro | Legacy Cadastro Layer | path inalterado até IFM 1B |
| CADCPS (as architecture) | Data Dictionary (target) | moduleId `cadcps` inalterado |
| Cliente / Empresa (concept) | Tenant / Company | models Prisma inalterados |
| IA Platform | AI Platform | — |
| Offline Platform | Offline Capability | — |
| Low-Code Platform | Low-Code Capability | — |
| entity catalog | Entity Dictionary | — |
| Field Dictionary | Data Dictionary | — |
| plugin | MAK Package / Platform Extension | — |
| Platform Runtime (alone) | Compiled Runtime or Foundation Runtime | — |

### 6.2 Descontinuar em documentação nova (proibido sem D-register)

| Termo | Motivo | Substituto |
|-------|--------|------------|
| **Parallel UI framework** | Anti-pattern | MAK Studio + Foundation Runtime |
| **Parallel metadata system** | Anti-pattern | MAK DATA PLATFORM |
| **Imperative cadastro page** | Anti-pattern | Thin Cadastro Page |
| **Plugin injection** | Security/model violation | MAK Package (MDP-only) |
| **IA Platform** (EN docs) | Inconsistente com AI Platform | AI Platform |
| **Offline Platform** (as layer) | Conflito D-014 | Offline Capability |

### 6.3 Código — sem renomeação nesta missão

Paths, classes, Prisma models, API routes, and registry filenames listed above **remain unchanged** until explicit migration missions (IFM 1A–1C, IFM 1B).

---

## 7. Studio ↔ MDP ↔ Foundation Mapping

Official naming chain for all Studio surfaces:

```
{Name} Studio (L5)
    → writes Platform Metadata
    → persisted in Metadata Registry / Data Dictionary / Entity Dictionary (L4 MDP)
    → MDP Compile Pipeline
    → Runtime Registry hydration (L2 boot cache)
    → Config Engine (V13–V20)
    → ModeloBase1 Cadastro UI Motor
    → rendered Cadastro Business Module
```

| Studio (official) | MDP target | Config Engine | Runtime Registry (legacy path) |
|-------------------|------------|---------------|----------------------------------|
| Layout Studio | Metadata Registry (layout) | Layout Config Engine (V13) | `layoutConfigRegistry.js` |
| Field Studio | Data Dictionary | Field Config Engine (V14) | `fieldConfigRegistry.js` |
| Validation Studio | Metadata Registry (validation) | Validation Config Engine (V16) | validation registry |
| Formula Studio | Data Dictionary (computed) | Formula Config Engine (V17) | formula registry |
| Events Studio | Metadata Registry (event) | Events Config Engine (V18) | events registry |
| Actions Studio | Metadata Registry (action) | Actions Config Engine (V19) | actions registry |
| Workflow Studio | Metadata Registry (workflow) | Workflow Config Engine (V20) | workflow registry |
| Table Studio | Metadata Registry (table) + prefs | Table metadata builders | module metadata |
| Dashboard Studio | Metadata Registry (dashboard) | Future engine | — |
| Permission Studio | Metadata Registry (permission) | Platform RBAC (future) | `cadastroRbac.js` (legacy) |

---

## 8. Documentation Compliance Rules

1. **New docs** must use official terms from §5 and §4.
2. **Updated docs** must replace deprecated terms (§6.2) when touched.
3. **Code citations** may show legacy identifiers — surround with official term in prose.
4. **Bilingual:** technical term in English; Portuguese only for MAK Gestão brand and end-user copy.
5. **Cross-reference:** link to this document when introducing platform concepts.
6. **Amendment:** new official terms require D-register entry; breaking renames require Constitution amendment.

---

## 9. Related Documents

| Document | Role |
|----------|------|
| [MAK-2035-MASTER-ARCHITECTURE.md](./MAK-2035-MASTER-ARCHITECTURE.md) | Layer topology — uses terms defined here |
| [MAK-DATA-PLATFORM.md](../engineering/MAK-DATA-PLATFORM.md) | MDP detail |
| [DECISIONS.md](../engineering/DECISIONS.md) | D-015 and future language decisions |
| [Constitution 02](../constitution/02-ARCHITECTURE-PRINCIPLES.md) | Architectural principles |

---

## 10. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-28 | Initial platform language standard — Program 0.5, D-015 |

---

*Use this vocabulary. Do not invent parallel language.*
