# HANDOFF COMPLETO — MAK Gestão · TUDO sobre o projeto

**Gerado:** 2026-07-08  
**Repo:** `maikelimaadm-stack/PROJETOMG`  
**Versão:** `0.4.0-rc.2`  
**Branch `main`:** `66e172cf` (Foundation C.4 mergeado)  
**Branch handoff:** `cursor/foundation-c-handoff-doc-0b52` (este doc)

> **Este é o arquivo definitivo.** Copie inteiro para ChatGPT/Cursor/qualquer agente novo.  
> Contém: visão, arquitetura, frontend, backend, banco, runtime, studio, BOS, governança, débito, roadmap, onde paramos, ideias futuras — **tudo**.

---

# ÍNDICE GERAL

**PARTE I — ONDE ESTAMOS HOJE**
1. [Snapshot executivo](#1-snapshot-executivo-onde-estamos-hoje)
2. [O que funciona em produção/dev hoje](#2-o-que-funciona-em-produçãodev-hoje)
3. [O que NÃO existe ainda](#3-o-que-não-existe-ainda)
4. [Inconsistências doc vs código](#4-inconsistências-doc-vs-código)

**PARTE II — VISÃO E FUTURO**
5. [Visão EOS 2035](#5-visão-eos-2035)
6. [Foundations A → L (roadmap oficial)](#6-foundations-a--l-roadmap-oficial)
7. [Programs 3.x Intelligence (documentados)](#7-programs-3x-intelligence-documentados)
8. [Ideias e horizontes futuros](#8-ideias-e-horizontes-futuros)

**PARTE III — ARQUITETURA DA PLATAFORMA**
9. [Camadas e fluxo de dados](#9-camadas-e-fluxo-de-dados)
10. [Seis blocos SSOT](#10-seis-blocos-ssot)
11. [Decisões e governança](#11-decisões-e-governança)

**PARTE IV — FRONTEND**
12. [Estrutura `src/` completa](#12-estrutura-src-completa)
13. [ModeloBase1](#13-modelobase1)
14. [framework/mak (congelado)](#14-frameworkmak-congelado)
15. [cadastro-engine vs framework/cadastro](#15-cadastro-engine-vs-frameworkcadastro)
16. [Módulos de domínio](#16-módulos-de-domínio)
17. [makBootstrap + Runtime Bridge legado (1E)](#17-makbootstrap--runtime-bridge-legado-1e)
18. [BOS — Business Operating Shell](#18-bos--business-operating-shell)
19. [Studio MAK](#19-studio-mak)
20. [shared/ — shell ERP](#20-shared--shell-erp)
21. [Rotas e App.jsx](#21-rotas-e-appjsx)

**PARTE V — BACKEND**
22. [Estrutura backend](#22-estrutura-backend)
23. [Módulos backend (15)](#23-módulos-backend-15)
24. [Auth, tenant, multi-empresa](#24-auth-tenant-multi-empresa)

**PARTE VI — DADOS E METADATA**
25. [Prisma — 59 models](#25-prisma--59-models)
26. [MDP (MAK Data Platform)](#26-mdp-mak-data-platform)
27. [MMM (Meta Model)](#27-mmm-meta-model)
28. [Config e registries JSON](#28-config-e-registries-json)
29. [Config Engines V13–V20](#29-config-engines-v13v20)

**PARTE VII — FOUNDATION C RUNTIME (onde paramos)**
30. [Programa Foundation C](#30-programa-foundation-c)
31. [Slices C.0 → C.4 (feito)](#31-slices-c0--c4-feito)
32. [Pipeline atual e RT-0→RT-8](#32-pipeline-atual-e-rt-0rt-8)
33. [Código `src/runtime/`](#33-código-srcruntime)
34. [M01–M24 backlog](#34-m01m24-backlog)
35. [Próximo: C.5 detalhado](#35-próximo-c5-detalhado)
36. [Roadmap C.5 → C.24](#36-roadmap-c5--c24)

**PARTE VIII — QUALIDADE E OPERAÇÃO**
37. [Testes (runtime, unit, E2E)](#37-testes-runtime-unit-e2e)
38. [Gates e CI](#38-gates-e-ci)
39. [Débito técnico completo](#39-débito-técnico-completo)
40. [Riscos Foundation C](#40-riscos-foundation-c)

**PARTE IX — COMO TRABALHAR**
41. [Dev setup e env](#41-dev-setup-e-env)
42. [Comandos npm essenciais](#42-comandos-npm-essenciais)
43. [Processo de entrega (slice/PR)](#43-processo-de-entrega-slicepr)
44. [Prompt para novo chat](#44-prompt-para-novo-chat)
45. [Git history e PRs](#45-git-history-e-prs)
46. [Mapa de documentos](#46-mapa-de-documentos)
47. [Glossário](#47-glossário)

---

# PARTE I — ONDE ESTAMOS HOJE

## 1. Snapshot executivo (onde estamos HOJE)

| Dimensão | Estado |
|----------|--------|
| **Produto** | MAK Gestão ERP metadata-driven → evoluindo para **EOS** (Enterprise Operating System) |
| **Versão** | `0.4.0-rc.2` / release candidate `v0.4.0-RC2` |
| **Programa ativo** | **Foundation C — Runtime Bridge** (Program 4.05) |
| **Último código mergeado** | Foundation **C.4** — Dependency Resolver + Router (PR #391) |
| **Próximo passo código** | Foundation **C.5** — Service Locator + Permission Engine |
| **Runtime tests** | **66/66 PASS** |
| **Runtime gates** | G423-01 até G423-08 PASS |
| **Módulos ERP runtime** | 2 certificados: `empresas`, `cadcps` |
| **Superfície principal UI** | BOS home `/` + rotas cadastro |
| **Foundation congelada** | Enterprise V10.2.0 + Studio D-052 + MDP D-025/D-026 |
| **ERI (maturidade)** | 3.8/10 plataforma · 6.8/10 foundation track |
| **P0 débito arquitetural** | 0 (resolvido D-062) |
| **Backend models** | **59** (Prisma) |
| **Docs oficiais desatualizados** | PROJECT-STATUS diz "C.1 next" — **código está em C.5** |

### Linha do tempo recente (código)

```
Foundation B.5–B.7 (docs) → C.0 plan → C.0.2 SSOT cert
  → C.1 Context+Bootstrap → C.2 Session+Registry
  → C.3 Loader+CRB → C.4 Dependency+Router
  → [AGORA] C.5 Service Locator+Permission
```

---

## 2. O que funciona em produção/dev hoje

### ERP operacional
- Login JWT multi-tenant (cliente + usuário + senha)
- Cadastro **Empresas** (`/CadastroEmpresas`) — módulo referência completo
- Cadastro **Campos Personalizados** (`/CadastroCamposPersonalizados`)
- Preferências de layout/colunas por usuário
- Anexos via Supabase Storage
- Multi-empresa via `PermissaoEmpresa` + header `X-Empresa-Id`
- Exportação, filtros, tabela virtualizada, formulários ModeloBase1

### BOS (home)
- `/` — BosHomePage (Business Operating Shell)
- `/business-first`, `/expert-mode`, `/workflow-inbox` — páginas BOS

### Studio (foundation frozen)
- `/studio` — Studio produção
- `/studio/prototype` — protótipo
- `/studio/empresas/layout`, `/field`, `/formula` — designers empresas
- Computation Engine G302 ✅
- Intent Resolver G305 ✅
- Business Computed Field G306 ✅

### Metadata / Backend
- MDP completo (Entity, Field, Relationship, Registry, Publish)
- MMM persistence + publish engine v2 (G422)
- Lifecycle sync/approval
- CRB publish pipeline
- 18 migrations Prisma aplicáveis

### Runtime novo (`src/runtime/`) — em testes, não em UI prod ainda
- Pipeline até **Runtime Ready** (sem render de tela)
- 66 testes automatizados
- Fixture CRB empresas hidrata registries V13–V20

### Runtime legado (ainda usado pela UI)
- `makBootstrap/runtimeBridge/` — Phase 1E CRB hydration no boot da app
- `framework/mak/runtime/createMakRuntime.js` — runtime v1 transicional

### Governança
- `npm run verify:governance` — G31–G261
- `npm run verify:ci` — mirror CI completo
- Gates V13–V20 em CI
- Build + lint passando

---

## 3. O que NÃO existe ainda

### Runtime (Foundation C)
| Item | Slice |
|------|-------|
| Service Locator real | C.5 |
| Permission Engine real | C.5 |
| Action Engine | C.6 |
| Workflow host | C.7 |
| Render table/form CRB | C.8, C.17 |
| Expression/Formula runtime adapters | C.9 |
| Validation/Execution pipeline | C.10–C.11 |
| State, Plugin, Connector | C.12–C.14 |
| Cache + Event Bus | C.15 |
| RT-0→RT-8 completo + G423 master | C.17 |
| 7 view modes extras | C.18–C.24 |

### Plataforma inteira
| Item | Status |
|------|--------|
| Enterprise Intent/Knowledge UI | Só docs (Programs 3.5A+) |
| Marketplace | Não iniciado |
| AI Platform | Não iniciado |
| Backend domain event bus | Adiado pós Studio MVP |
| Offline-first / Sync Engine | Só cache preferences |
| Full Data Dictionary UI | CADCPS parcial |
| Generic Repository | Foundation G |
| Eliminar boot cache | Foundation E |
| Studios MMM-native full | Foundation D |
| ERP packages (Financeiro, Vendas) | Foundation L |

---

## 4. Inconsistências doc vs código

| Documento diz | Realidade no código |
|---------------|---------------------|
| `PROJECT-STATUS.md`: próximo C.1 | C.1–C.4 mergeados; próximo **C.5** |
| `README_AI.md`: "C.1 next" | Idem — desatualizado |
| `CURRENT-STATE.md`: 43 models Prisma | **59 models** em `schema.prisma` |
| `CURRENT-STATE.md`: last verified 2026-06-30 | C.4 mergeado 2026-07-02 |
| `CURRENT-STATE.md`: 78 imports legacy cadastro | **82 imports** (TECH-DEBT TD-003) |

**Fonte operacional mais atual para Foundation C:** este arquivo + `src/runtime/` + evidências `docs/evidence/foundation-c*`.

---

# PARTE II — VISÃO E FUTURO

## 5. Visão EOS 2035

**Decisão D-057** — MAK deixa de ser só "ERP" e vira **Enterprise Operating System**:

- **Capabilities** em vez de módulos com features
- **Business Objects** em vez de telas como produto
- **Negócio autora** intent em vez de TI configurar
- **Intelligence nativa** em vez de relatórios add-on
- **Integrações como assets** reutilizáveis
- **IA acelera authoring** — nunca mutação silenciosa em produção

**Princípio Business Asset (D-068):** tudo que o usuário cria (fórmula, workflow, validação, etc.) é asset da empresa — não pertence a uma tela.

**Autonomia progressiva (horizonte):** Self Documentation → Self Optimization → Autonomous Business (só ações pré-certificadas, sempre com RBAC humano).

**Doc:** `docs/vision/MAK-2035-PLATFORM-VISION.md`

---

## 6. Foundations A → L (roadmap oficial)

```
A Identity → B MMM → B.5 Behavior → B.6 Protocol → B.7 Authoring
  → C.0 Plan → C Runtime CODE ← ESTAMOS AQUI (slice C.5)
  → D Studio MMM → E Legacy Elim → F Event Bus → G Generic Repo
  → H Low-Code → I Marketplace → J AI Gateway → K Intelligence L10 → L ERP Apps
```

| ID | Nome | Gate | Status |
|----|------|------|--------|
| A | Identity & Constitution | G-identity | ✅ |
| B | Universal Meta Model 4.01–4.04 | G421, G422 | ✅ |
| B.5 | Platform Behavior | G420B | ✅ docs |
| B.6 | Universal Execution Protocol | G420C | ✅ docs |
| B.7 | Universal Authoring | G420D | ✅ docs |
| C.0 | Runtime Implementation Plan | G420E | ✅ docs |
| **C** | **Universal Runtime RT-0→RT-8** | **G423** | ⏳ **C.4/17 done parcial** |
| D | Studio MMM-native (17 designers) | G424 | Bloqueado G423 |
| E | Legacy Elimination (boot cache) | G425 | Bloqueado G423 |
| F | Event Bus L1 DB-backed | G426 | Bloqueado G423 |
| G | Generic Repository EAV | G427 | Bloqueado C |
| H | Low-Code zero-code module | G428 | Bloqueado D,G |
| I | Marketplace .makpkg | G429 | Bloqueado B,C |
| J | AI Gateway | G430 | Bloqueado F,D |
| K | Intelligence L10 | G431 | Bloqueado F |
| L | ERP Applications | G432 | Bloqueado H |

**Regra:** Nada full em D/E/F/Marketplace/ERP até **G423 PASS**.

---

## 7. Programs 3.x Intelligence (documentados)

Programs 3.3–3.27 documentam a visão de intelligence enterprise:

| Program | Tema | Status |
|---------|------|--------|
| 3.7 | Business Intent Resolver impl | ✅ G305 `src/studio/intent/` |
| 3.8 | Business Computed Fields | ✅ G306 `src/studio/business/` |
| 3.9 | Workflow | ⏳ próximo Studio (código parcial em `studio/business/workflow/`) |
| 3.10 | Business Workflow Report | ✅ docs |
| 3.11–3.27 | Intelligence, Memory, KG, Consulting, Decision, Evolution, DNA, Segmentation, Recommendation, Adoption, Improvement, Portfolio, Governance, Compliance, Data Lifecycle, Persistence, Sync | ✅ docs frozen |
| 3.5A | Enterprise Intelligence Vision | ✅ D-060 |

**Nenhum** desses programs 3.10+ tem implementação de UI — são arquitetura/visão para horizonte 2035.

---

## 8. Ideias e horizontes futuros

### Future Studios (visão)
Dashboard Studio, Workflow Studio, Automation Studio, Integration Studio, AI Studio — todos consumindo Computation + BOM.

### Future Runtime (visão)
CRB + capability dispatch + twin feedback loop.

### Future AI (visão)
RBAC-bound; propõe Intent; nunca mutação silenciosa.

### Future Marketplace (visão)
Business Object packages com capability manifests (.makpkg).

### Multi-agent (visão, não implementado)
Agentes especializados coordenam via event bus + knowledge graph + human approval.

### Parallel tracks pós-C.5 (runtime)
| Track A (execução) | Track B (render) |
|--------------------|------------------|
| C.6 → C.11 | C.8 → C.9 |
| C.7 workflow | C.12 state |
| C.13→C.14 plugins | C.15 cache/events |

Integração final em **C.17**.

### Critical path G423
```
C.3 CRB → C.5 Permission → C.8 Render table → C.11 Execution → C.17 G423 master
```

---

# PARTE III — ARQUITETURA DA PLATAFORMA

## 9. Camadas e fluxo de dados

```
┌─────────────────────────────────────────────────────────────┐
│  UI: BOS / ERP Shell / Studio                               │
├─────────────────────────────────────────────────────────────┤
│  Domain modules: empresas, cadcps (+ cert modules)          │
├─────────────────────────────────────────────────────────────┤
│  ModeloBase1 (generic page engine)                          │
├─────────────────────────────────────────────────────────────┤
│  framework/mak (frozen V10.2.0) + cadastro-engine           │
│  framework/cadastro (LEGACY transitional)                   │
├─────────────────────────────────────────────────────────────┤
│  src/runtime/ (NEW Universal Runtime v2 — Foundation C)     │
│  makBootstrap/runtimeBridge (Phase 1E — LEGACY bridge)      │
├─────────────────────────────────────────────────────────────┤
│  API Fastify → Prisma → PostgreSQL                          │
├─────────────────────────────────────────────────────────────┤
│  MDP (metadata) + MMM (meta model) + Supabase (auth/storage)│
└─────────────────────────────────────────────────────────────┘
```

### Fluxo metadata → runtime
```
Prisma Mdp* / Mmm* tables
  → backend publish pipeline (MDP-5 / MMM publish v2)
  → config/mdp-compiled-bundle.export.json (CRB mmm-crb-v1)
  → src/runtime/core/crb/crbLoader.js (verify + hydrate V13–V20)
  → loadRuntimeBundle() → Runtime Ready
```

### Fluxo módulo cadastro (produção hoje)
```
generatedModules.json → App.jsx lazy routes
  → PAGEMP.jsx / PAGCPS.jsx
  → ModeloBase1CadastroPage
  → framework/mak (MakCadastroTable, MakCadastroForm, engines V13–V20)
  → API /api/empresas, /api/cadcps
```

---

## 10. Seis blocos SSOT

| # | Bloco | Path | Pode alterar? |
|---|-------|------|---------------|
| 1 | Meta Model | `docs/meta-model/` | ❌ sem autorização |
| 2 | Platform Architecture | `docs/platform-architecture/` | ❌ |
| 3 | Platform Behavior | `docs/platform-behavior/` | ❌ |
| 4 | Platform Protocol (UEP) | `docs/platform-protocol/` | ❌ |
| 5 | Platform Authoring (UAS) | `docs/platform-authoring/` | ❌ |
| 6 | Runtime Implementation | `docs/runtime-implementation/` | ❌ (só evidence) |

**Evidências permitidas:** `docs/evidence/foundation-cN/`

---

## 11. Decisões e governança

### Decisões-chave
| ID | Decisão |
|----|---------|
| D-052 | Studio Foundation frozen |
| D-057 | EOS vision |
| D-062 | Governance registry obrigatório |
| D-068 | Business Asset principle |
| D-PA-19 | Global freeze; só Foundation C autorizado |
| D-RI-16 | Global Architecture Certificate — C code authorized |
| D-RI-02 | Novo runtime em `src/runtime/` |
| D-RI-04 | CRB-only; boot cache transicional |
| D-RI-09 | Slices C.1–C.24, não Program IDs |
| D-RI-10 | Reutilizar G302 para Expression/Formula |
| D-RI-11 | Table+form primeiro; 9 views depois |
| D-RI-13 | Runtime nunca query MMM DB direto |

### Regras permanentes de implementação
1. **1 slice = 1 PR** (desde C.4)
2. **Diagrama Mermaid** por módulo novo
3. **Fail-closed** permissions (deny > allow > default deny)
4. **PIP 10 fases** + RHP (Repository Health Protocol)
5. **D-028:** 10 perguntas impacto enterprise antes de codar
6. **D-029:** 18 Engineering Principles obrigatórios
7. **Sem features novas em Studios** — só Business Assets

### Prioridade de trabalho (ROADMAP)
1. Estabilidade → 2. Arquitetura → 3. Correções → 4. Plataforma → 5. Studio → 6. Novos módulos

---

# PARTE IV — FRONTEND

## 12. Estrutura `src/` completa

```
src/
├── App.jsx, main.jsx           # Rotas, providers, auth
├── ModeloBase1/                # ~62 arquivos — motor genérico cadastro
├── bos/                        # ~35 — Business Operating Shell
├── framework/
│   ├── mak/                    # ~185 — enterprise frozen
│   ├── cadastro-engine/        # ~35 — abstração moderna
│   └── cadastro/               # ~61 — LEGACY empresas-specific
├── modules/                    # 10 pastas — domínio + cert + bootstrap
├── runtime/                    # ~82 — Foundation C NEW
├── studio/                     # ~200+ — MAK Studio
├── shared/                     # ~126 — shell ERP, auth, shadcn UI
├── database/, storage/         # README stubs
└── styles/
```

---

## 13. ModeloBase1

**Path:** `src/ModeloBase1/` (~62 arquivos, ~4.400 LOC)

**Papel:** Motor genérico certificado de páginas cadastro. Módulos só fornecem config declarativa.

**Entry:** `ModeloBase1CadastroPage.jsx` (~1.518 LOC)

**Subpastas:** actions, actionsConfig, cards, components, config, contextmenu, dialogs, eventsConfig, export, fieldConfig, filters, form, formulaConfig, grouping, hooks, import, layout, layoutConfig, metadata, pagination, permissions, preferences, render, search, selection, services, sorting, table, toolbar, utils, validators, validationConfig, workflowConfig

**Certificação:** `gate:modelo-base1`, visual cert v152, paridade empresas

**Débito TD-004:** nomenclatura "empresas" no layer genérico

---

## 14. framework/mak (congelado)

**Path:** `src/framework/mak/` (~185 arquivos, ~18.900 LOC)  
**Status:** Frozen V10.2.0 (2026-06-28)

**Subpastas:** actions, data, dock, events, fieldConfig, filters, form, formula, grouping, history, import, layout, layoutConfig, listing, metadata, module, page, permissions, preferences, records, routes, **runtime**, search, styles, table, toolbar, ux, validation, workflow

**Exports principais:** `MakCadastroTable` (~2.407 LOC — TD-006), `MakCadastroForm`, engines V13–V20, componentes `Mg*`

**Runtime legado:** `framework/mak/runtime/createMakRuntime.js` — será substituído por `src/runtime/` (Foundation E)

---

## 15. cadastro-engine vs framework/cadastro

| | cadastro-engine | framework/cadastro |
|--|-----------------|---------------------|
| Status | Complete, frozen, preferido | Legacy transitional |
| Files | ~35 | ~61 (~11K LOC) |
| Scope | Engines genéricos (layout, field, validation, render) | Empresas-specific (`Emp*`) |
| Imports ativos | Preferido para novos | **82 imports** (TD-003) |
| Key exports | CadastroEngine, LayoutEngine, FieldEngine | Layout configurators, Emp dialogs |

**Meta IFM 1B A1:** promover e eliminar imports de `framework/cadastro/`.

---

## 16. Módulos de domínio

### `src/modules/` — 10 pastas

| Pasta | Tipo | Descrição |
|-------|------|-----------|
| **empresas** | Runtime certificado | Referência PAGEMP, 42 arquivos, factory overrides |
| **cadcps** | Runtime certificado | Campos personalizados PAGCPS, 18 arquivos |
| **makBootstrap** | Infra boot | Registra engines V13–V20 + runtime bridge 1E |
| **template** | Generator | `npm run generate:module` scaffold |
| **actionscert** | Cert engine | Actions V19 certification |
| **eventscert** | Cert engine | Events V18 |
| **fieldcert** | Cert engine | Field V14 |
| **formulacert** | Cert engine | Formula V17 |
| **validationcert** | Cert engine | Validation V16 |
| **workflowcert** | Cert engine | Workflow V20 |

### Rotas ativas (`generatedModules.json`)
```json
[
  { "moduleId": "empresas", "routePath": "/CadastroEmpresas", "pageFile": "modules/empresas/pages/PAGEMP.jsx" },
  { "moduleId": "cadcps", "routePath": "/CadastroCamposPersonalizados", "pageFile": "modules/cadcps/pages/PAGCPS.jsx" }
]
```

---

## 17. makBootstrap + Runtime Bridge legado (1E)

**Path:** `src/modules/makBootstrap/`

**Papel:** Boot da aplicação — registra todos config engines e bridge CRB legado.

**Arquivos-chave:**
- `registerMakFoundationEngines.js` — orquestra registro
- `registerMakLayoutConfigEngine.js` … `registerMakWorkflowConfigEngine.js` — V13–V20
- `registerRuntimeBridge.js` — liga Phase 1E
- `runtimeBridge/` — CRB hydration no boot (legado, paralelo ao novo `src/runtime/`)
  - `crbHydrationAdapter.js`
  - `runtimeLoader.js`
  - `runtimeCacheManager.js`
  - `registerLegacyBootCacheEngines.js`
- `useAppPreferencesBootstrap.js` — prefetch preferences no login
- `prefetchMakPreferencesAtLogin.js`

**Importante:** A UI de produção ainda usa este bridge — **não** o novo `src/runtime/` diretamente. Foundation C.17 fará a ponte empresas → CRB novo runtime.

---

## 18. BOS — Business Operating Shell

**Path:** `src/bos/` (~35 arquivos)  
**Superfície primária:** `/` (D-PA primary user surface)

**Páginas:**
- `BosHomePage` — home
- `BusinessFirstPage` — modo business-first
- `ExpertModePage` — modo expert
- `WorkflowInboxPage` — inbox workflow (stub/placeholder)

**Componentes:** intelligence section placeholders (visão futura)

**Guards:** `StudioTechnicalGuard` — protege rotas studio

**Doc:** `docs/architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md`

---

## 19. Studio MAK

**Path:** `src/studio/` (~200+ arquivos)  
**Status:** Foundation frozen D-052

### Áreas
| Pasta | Conteúdo | Gate |
|-------|----------|------|
| `computation/` | Computation Engine | G302 ✅ |
| `intent/` | Intent Resolver | G305 ✅ |
| `business/` | Computed Fields, workflow assets | G306 ✅ |
| `designers/formula/`, `designers/field/` | Designers | G303A ✅ |
| `expression/`, `evaluation/`, `typeSystem/`, `dependency/` | Intelligence stack | G298–G301 ✅ |
| `shell/` | Production + prototype shells | — |
| `pages/` | StudioProductionPage, StudioPrototypePage | — |
| `sdk/`, `registry/`, `events/`, `domain/`, `som/`, `core/` | Foundation | — |

### Rotas Studio
- `/studio` — produção
- `/studio/prototype` — protótipo
- `/studio/empresas/layout` — layout designer
- `/studio/empresas/field` — field designer
- `/studio/empresas/formula` — formula builder

### Regra D-068
**Não criar features novas em Studios** — Studios editam Business Assets apenas.

---

## 20. shared/ — shell ERP

**Path:** `src/shared/` (~126 arquivos)

| Pasta | Conteúdo |
|-------|----------|
| `contexts/` | AuthContext, ErpThemeContext, QueryClient |
| `layouts/` | ErpShell, sidebar, navigation |
| `ui/` | ~40 componentes shadcn (typecheck noise TD-009) |
| `filters/`, `listing/`, `hooks/` | Filtros, listagem |
| `feedback/` | Toaster, Confirm, GlobalErrorBoundary |
| `preferences/` | Helpers preferências |
| `navigation/` | Menu ERP |
| `constants/`, `utils/` | Utilitários |

---

## 21. Rotas e App.jsx

**Providers chain:** QueryClient → Auth → MakPreferencesBootstrap → ErpTheme → Router

**Rotas principais:**
| Path | Componente |
|------|------------|
| `/` | BosHomePage (BOS layout) |
| `/business-first` | BusinessFirstPage |
| `/expert-mode` | ExpertModePage |
| `/workflow-inbox` | WorkflowInboxPage |
| `/CadastroEmpresas` | PAGEMP (empresas — hardcoded lazy) |
| `/CadastroCamposPersonalizados` | PAGCPS (generated) |
| `/studio` | StudioProductionPage (guard) |
| `/studio/prototype` | StudioPrototypePage (guard) |
| Login | LoginScreen (se não auto-login) |

**Auto-login dev:** `VITE_DEV_AUTO_LOGIN=true` → pula login (maike/maike/123)

---

# PARTE V — BACKEND

## 22. Estrutura backend

```
backend/
├── src/
│   ├── server.js
│   ├── routes/index.js
│   ├── config/env.js
│   ├── database/          # prismaClient, transactionRetry
│   ├── integrations/supabase/
│   ├── observability/
│   └── modules/           # 15 módulos
├── prisma/
│   ├── schema.prisma      # 59 models
│   └── migrations/        # 18 folders
├── scripts/               # ~75 (seed, smoke, validate)
└── config/cadastro-modules.registry.json
```

**Porta dev:** 3001  
**Start:** `cd backend && npm run dev` (node --watch)

---

## 23. Módulos backend (15)

| Módulo | Routes | Papel |
|--------|--------|-------|
| **auth** | ✅ | JWT login, RBAC, AccessScope |
| **empresas** | ✅ | CRUD empresas + export |
| **cadcps** | ✅ | Campos personalizados |
| **cadastro** | ✅ | Registry genérico cadastro |
| **preferences** | ✅ | Preferências layout/colunas |
| **anexos** | ✅ | Attachments Supabase Storage |
| **clienteModulo** | ✅ | Feature flags por tenant |
| **metrics** | ✅ | Contadores observability |
| **mdp** | ✅ | MDP entities/fields/relationships/registry/publish |
| **mmm** | ✅ | MMM persistence + publish v2 |
| **lifecycle** | ✅ | Data lifecycle sync/approval |
| **audit** | — | Audit logging service |
| **idGlobal** | — | ID corporativo |
| **sequencias** | — | Sequências código entidade |
| **debug** | ✅ | Latency debug |

---

## 24. Auth, tenant, multi-empresa

- **Login:** POST `/api/auth/login` — cliente + usuario + senha → JWT
- **Multi-tenant:** `cliente_id` em todos models operacionais
- **Multi-empresa:** `PermissaoEmpresa` + header `X-Empresa-Id`
- **AccessScope:** payload L1 com tenant, user, permissions, companies
- **Seed default:** cliente `maike`, usuario `maike`, senha `123`
- **E2E usa:** cliente `kaiman` — alinhar `SEED_CLIENTE_CODIGO=kaiman` no seed

---

# PARTE VI — DADOS E METADATA

## 25. Prisma — 59 models

**Grupos:**
- **Core ERP:** Cliente, Usuario, Empresa, CadCps*, CadastroRegistro, PermissaoEmpresa, UsuarioPreferencia, AuditLog, Anexo, etc.
- **MDP (MDP-1..5):** MdpEntity, MdpField, MdpRelationship, MdpRegistryEntry, MdpCompiledBundle, MdpPublishLog, etc.
- **MMM:** MmmObject, MmmCompiledBundle, MmmPublishLog, etc.
- **Lifecycle:** LifecycleApprovalRequest, LifecycleSyncState, etc.

**Migrations:** 18 folders  
**Indexes:** ~60  
**Débito TD-005:** dual-path DDL (Prisma + `ensureSchema.js`)

---

## 26. MDP (MAK Data Platform)

**Status:** Complete & frozen (D-025, D-026)

| Componente | Status | Spec |
|------------|--------|------|
| MDP-0 Architecture | ✅ | MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md |
| MDP-1 Entity Dictionary | ✅ | mdp_entity |
| MDP-2 Data Dictionary | ✅ | mdp_field |
| MDP-3 Relationship Dictionary | ✅ | mdp_relationship |
| MDP-4 Metadata Registry | ✅ frozen | mdp_registry_entry |
| MDP-5 Publish Engine | ✅ | CRB compile + publish |

**SSOT chain:**
```
mdp_entity (DB) → config/mdp-*.export.json → cadastro-modules.registry.json → generatedModules.json
```

---

## 27. MMM (Meta Model)

**Programs 4.01–4.04:** Complete  
**Backend:** `backend/src/modules/mmm/` — persistence + publish pipeline v2  
**Gate:** G422 (Publish Engine v2)  
**Doc SSOT:** `docs/meta-model/`

**Runtime consome:** CRB `mmm-crb-v1` via Internal API — **nunca** query MMM DB direto (D-RI-13).

---

## 28. Config e registries JSON

### Root `config/`
| Arquivo | Papel |
|---------|-------|
| `cadastro-modules.registry.json` | Cache módulos ativos (2: empresas, cadcps) |
| `mdp-entities.export.json` | MDP-1 export |
| `mdp-fields.export.json` | MDP-2 export |
| `mdp-relationships.export.json` | MDP-3 export |
| `mdp-metadata-registry.export.json` | MDP-4 export |
| `mdp-compiled-bundle.export.json` | MDP-5 CRB export |
| `mdp-compiled-bundle.cache.json` | Cache local CRB |

### Sync obrigatório
- `config/cadastro-modules.registry.json` ↔ `backend/config/cadastro-modules.registry.json` (G118)
- `src/modules/generatedModules.json` — rotas frontend

---

## 29. Config Engines V13–V20

Todos gate-certified (G156–G261 em CI):

| Engine | Version | Registrado em |
|--------|---------|---------------|
| Layout Config | V13 | makBootstrap |
| Field Config | V14 | makBootstrap |
| Validation Config | V16 | makBootstrap |
| Formula Config | V17 | makBootstrap |
| Events Config | V18 | makBootstrap |
| Actions Config | V19 | makBootstrap |
| Workflow Config | V20 | makBootstrap |

**CRB hydrate (novo runtime):** M06 hidrata V13–V20 no Registry em RT-3.

**Grouping/Pivot:** disabled (`disabled_certified`)

---

# PARTE VII — FOUNDATION C RUNTIME (onde paramos)

## 30. Programa Foundation C

**Program 4.05 — Runtime Bridge**  
**Objetivo:** Universal Runtime v2 em `src/runtime/` implementando UEP + consumindo CRB  
**Autorização:** D-RI-16 Global Architecture Certificate  
**Meta:** Gate **G423** — empresas roda via CRB sem boot cache SSOT

### Duas runtimes coexistindo HOJE

| Runtime | Path | Usado por |
|---------|------|-----------|
| **v1 legado** | `framework/mak/runtime/` + `makBootstrap/runtimeBridge/` | UI produção atual |
| **v2 novo** | `src/runtime/` | Testes + Foundation C pipeline |

**Eliminação v1:** Foundation E (após G423)

---

## 31. Slices C.0 → C.4 (feito)

| Slice | Módulos | PR | Arquivos | Linhas ~ | Testes | Gates |
|-------|---------|-----|----------|----------|--------|-------|
| C.0 | Docs plan | #386 | 16 docs | — | — | G420E |
| C.0.2 | SSOT cert | #387 | — | — | — | D-RI-16 |
| C.1 | M02 Context, M01 RT-0 | #388 | 18 | 520 | 11 | 01, 02 |
| C.2 | M03 Session, M04 Registry | #389 | 32 | 1.050 | 30 | 03, 04 |
| C.3 | M05 Loader, M06 CRB | #390 | 37 | 1.568 | 47 | 05, 06 |
| C.4 | M07 Dep, M08 Router | #391 | 35 | 1.450 | 66 | 07, 08 |

### Fixes importantes no caminho
- **C.3 CI ESLint:** RegistryError import, Buffer→TextDecoder, eslint node globals override
- **Merge order:** C.2 antes de C.3; C.3 rebased após C.2

---

## 32. Pipeline atual e RT-0→RT-8

### Pipeline testado (`loadRuntimeBundle`)
```
Context → Session(mock L1) → Registry → Loader → CRB(verify+hydrate)
  → DependencyResolver(DAG) → RuntimeRouter(routes) → Runtime Ready
```

### Status por estágio RT

| RT | Nome | Status | Módulo |
|----|------|--------|--------|
| RT-0 | Bootstrap shell | ✅ | M01 |
| RT-1 | Load Pin | ✅ parcial | M03, M05 |
| RT-2 | Verify CRB | ✅ | M05, M06 |
| RT-3 | Hydrate | ✅ | M06, M04, M07, M08 |
| RT-4 | Session bind | ⏳ parcial | M03 |
| RT-5 | Authorize | ⏳ **C.5** | M09 |
| RT-6 | Route match | ✅ sem guard | M08 |
| RT-7 | Render | ❌ C.8+ | M12 |
| RT-8 | Execute | ❌ C.11+ | M16 |

### Métricas baseline (fixture empresas)
| Indicador | Valor |
|-----------|-------|
| bootstrapMs | ~4ms |
| crbLoadMs | ~1ms |
| hydrationMs | ~1ms |
| dependencyResolveMs | ~0.1ms |
| registryObjectCount | 16 |
| routeCount | 1 |
| memory heap | ~12MB |
| testCount | 66 |

---

## 33. Código `src/runtime/`

```
src/runtime/
├── index.js
├── types/                    # context, session, registry, loader, crb, dependency, router, uec, metrics
├── core/
│   ├── bootstrap/            # M01: bootstrap.js, loadRuntimeBundle.js
│   ├── context/              # M02: RuntimeContext imutável
│   ├── session/              # M03: WebSessionManager, mockL1Auth
│   ├── registry/             # M04: 12 tipos, freeze
│   ├── loader/               # M05: cache in-memory
│   ├── crb/                  # M06: verify, hydrate V13–V20
│   ├── dependency/           # M07: DAG, cycles, topo sort
│   └── router/               # M08: URL match, navigation table
├── infra/
│   ├── service-locator/      # M20 STUB ← C.5
│   └── observability/        # tracer stub, runtimeMetrics.js
└── __tests__/
    ├── fixtures/empresas-crb.fixture.js
    └── integration/runtime-bundle.test.js
```

### API pública exportada
`bootstrap`, `hydrate`, `loadRuntimeBundle`, `destroy`, `createContext`, `createRegistry`, `createSessionManager`, `createLoader`, `createCrbLoader`, `createDependencyResolver`, `createRuntimeRouter`, `captureRuntimeMetrics`

### Débito runtime atual
- Service Locator vazio
- `canActivate()` sempre `true`
- Mock L1 in-memory
- Loader cache só in-memory
- Sem React host navigation
- Sem render

---

## 34. M01–M24 backlog

| ID | Módulo | Status | Slice |
|----|--------|--------|-------|
| M01 | Bootstrap | ⏳ partial | C.1/C.17 |
| M02 | Context | ✅ | C.1 |
| M03 | Session | ✅ | C.2 |
| M04 | Registry | ✅ | C.2 |
| M05 | Loader | ✅ | C.3 |
| M06 | CRB Loader | ✅ | C.3 |
| M07 | Dependency | ✅ | C.4 |
| M08 | Router | ✅ | C.4 |
| M09 | Permission | ❌ | **C.5** |
| M10 | Action | ❌ | C.6 |
| M11 | Workflow | ❌ | C.7 |
| M12 | Render | ❌ | C.8/C.17 |
| M13 | Expression | ❌ | C.9 |
| M14 | Formula | ❌ | C.9 |
| M15 | Validation | ❌ | C.10 |
| M16 | Execution | ❌ | C.11 |
| M17 | State | ❌ | C.12 |
| M18 | Plugin | ❌ | C.13 |
| M19 | Connector | ❌ | C.14 |
| M20 | Service Locator | ⏳ stub | **C.5** |
| M21 | Cache | ❌ | C.15 |
| M22 | Event Bus | ❌ | C.15 |
| M23 | Transaction | ❌ | C.16 |
| M24 | Observability | ⏳ stub | C.17 |

---

## 35. Próximo: C.5 detalhado

### Missão
Implementar **exclusivamente** C.5 — sem antecipar C.6+.

### M20 Service Locator
- DI container singleton/scoped
- Wire todos serviços core M01–M08
- Substituir stub RT-0
- Gate G423-20

### M09 Permission Engine
- Matriz CRB: deny > allow > default deny
- `can(action, resource, context)`
- `filterVisible` para UI
- Wire `router.canActivate()` — hoje stub `true`
- Gate G423-09

### Exit C.5
- RT-5 bloqueia rotas não autorizadas
- Regressão G423-01..08 PASS
- 66+ testes PASS
- CERTIFICATION-REPORT + MODULE-DIAGRAMS (M09, M20)

### Branch
`cursor/foundation-c5-locator-permission-0b52`

### Padrão código (seguir C.1–C.4)
```
core/<module>/<Module>Manager.js
core/<module>/errors.js          # MAK-L3-RUNTIME-NNN
types/<module>.js
__tests__/<module>/<module>.test.js
scripts/gates/g423-NN-*.mjs
```

---

## 36. Roadmap C.5 → C.24

| Slice | Entrega |
|-------|---------|
| **C.5** | DI + Permission |
| C.6 | Action + UEC |
| C.7 | Workflow host |
| C.8 | Table render empresas |
| C.9 | Expression + Formula G302 |
| C.10 | Validation |
| C.11 | Execution UP-09 |
| C.12 | State + USM |
| C.13 | Plugins |
| C.14 | Connector HTTP |
| C.15 | Cache + Event Bus stub |
| C.16 | Transaction BE |
| **C.17** | RT-8 + form + **G423 master** |
| C.18–C.24 | kanban, calendar, chart, map, timeline, card, widget |

---

# PARTE VIII — QUALIDADE E OPERAÇÃO

## 37. Testes (runtime, unit, E2E)

### Runtime (Foundation C)
```bash
npm run test:runtime        # 66 tests
npm run test:runtime:c1     # 11
npm run test:runtime:c2     # session + registry
npm run test:runtime:c3     # loader + crb + integration
npm run test:runtime:c4     # dependency + router
```

### E2E Playwright (12 specs)
| Spec | Foco |
|------|------|
| `erp.spec.js` | Login full ERP |
| `empresas-novo-mock.spec.js` | Novo registro mock |
| `empresas-view-record-mock.spec.js` | Ver registro |
| `empresas-render-stress.spec.js` | Stress render |
| `empresas-preferences-*` | 6 specs preferences |
| `p0-preferences-stability.spec.js` | P0 stability |
| `instant-preferences-real.spec.js` | Prefs real API |

**Configs:** playwright.config.js + 7 variantes (mock, real, stress, forensic, etc.)

**Gotchas E2E:**
- `npx playwright install chromium` na primeira vez
- Desabilitar `VITE_DEV_AUTO_LOGIN` para mocks
- Credencial `kaiman` vs seed `maike`

### Scripts unit (`scripts/tests/`) — 20 runners
Filtros, preferences, layout, empresas, etc.

---

## 38. Gates e CI

### Foundation C Runtime
`gate:g423-01` … `gate:g423-08` (implementados)  
`gate:g423-09`, `gate:g423-20` (C.5)  
`gate:g423` master (C.17)

### Config engines
`gate:layout-config-engine-v13` … `gate:workflow-config-engine-v20`

### Studio (~25 gates)
`gate:studio-computation`, `gate:studio-intent-resolver`, `gate:studio-formula-builder`, etc.

### Enterprise intelligence (Programs 3.10–3.27)
`gate:business-operating-shell`, `gate:enterprise-intelligence-foundation`, … (18 gates)

### Composites
```bash
npm run verify:governance     # build + lint + cert + governance + deploy + capabilities
npm run verify:ci             # full PR mirror
npm run gate:capabilities     # all V13–V20 + studio + enterprise chain
```

### CI workflow
`.github/workflows/foundation-governance.yml`

---

## 39. Débito técnico completo

### P1 ativo
| ID | Item | Evidência |
|----|------|-----------|
| TD-003 | framework/cadastro legacy | 82 imports, ~61 files |
| TD-004 | Empresas nomenclature ModeloBase1 | 44 files framework/mak |
| TD-009 | Typecheck noise shadcn | src/shared/ui/* (non-blocking CI) |
| Arch | Formula runtime unification | Plan approved, impl pending |

### P2
| ID | Item |
|----|------|
| TD-005 | Dual-path DDL Prisma + ensureSchema.js |
| TD-006 | MakCadastroTable 2.407 LOC monolith |
| TD-006b | ModeloBase1CadastroPage 1.518 LOC |

### Resolvidos
TD-001 (Produto obsolete), TD-002 (registry sync), P0 arch debt (D-062)

### Runtime-specific (resolve por slice)
Ver seção 33 — Service Locator, canActivate, mock L1, in-memory cache

---

## 40. Riscos Foundation C

| ID | Risco | Mitigação |
|----|-------|-----------|
| R-01 | Boot cache conflict | Legacy adapter; eliminar em E |
| R-02 | CRB só empresas | Escopo G423 = empresas + cadcps |
| R-05 | Permission gaps CRB | Fail-closed default deny |
| R-08 | 11 view modes delay | Só table+form para G423 |
| R-09 | Import cycles | ESLint + G423-07 |
| R-11 | Multi-company bugs | RT-5 test matrix |
| R-14 | Parallel slice conflicts | C.17 integration |
| R-15 | Runtime query MMM DB | Lint D-RI-13 |

---

# PARTE IX — COMO TRABALHAR

## 41. Dev setup e env

### Padrão (sem secrets)
```bash
cp .env.local.example .env.local
npm install
npm run dev    # http://127.0.0.1:5173
```
- Auto-login: `VITE_DEV_AUTO_LOGIN=true`
- API proxy: `VITE_API_PROXY_TARGET=https://projetomg-production.up.railway.app`

### Stack local completa
```bash
cd backend && cp .env.example .env
# Preencher: DATABASE_URL, DIRECT_URL, SUPABASE_*, JWT_SECRET
npm run prisma:generate && npm run seed && npm run dev
```
Remover `VITE_API_PROXY_TARGET` do `.env.local` → proxy localhost:3001

### Arquivos env
| Arquivo | Uso |
|---------|-----|
| `.env.local.example` | Dev padrão frontend |
| `.env.example` | Frontend direto API |
| `backend/.env.example` | Backend completo |

---

## 42. Comandos npm essenciais

### Dev
`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck`

### Runtime
`npm run test:runtime` · `npm run gate:g423-01` … `08`

### MDP sync
`npm run sync:mdp-registry` · `sync:mdp-fields` · `sync:mdp-relationships` · `export:mdp-crb-cache`

### Module gen
`npm run generate:module`

### Governança
`npm run verify:governance` · `npm run verify:ci`

### Backend
`cd backend && npm run seed` · `npm run smoke:empresas` · `npm run smoke:mmm-publish`

---

## 43. Processo de entrega (slice/PR)

1. Branch `cursor/foundation-cN-<nome>-0b52`
2. Escopo **somente** do slice
3. Testes + gates + regressão
4. `CERTIFICATION-REPORT.md` + `MODULE-DIAGRAMS.md`
5. PR → CI verde → merge
6. Zero alteração SSOT

---

## 44. Prompt para novo chat

```
Você assume o projeto MAK Gestão ERP (maikelimaadm-stack/PROJETOMG).

LEIA O HANDOFF COMPLETO ABAIXO — contém TUDO sobre o projeto.

ONDE ESTAMOS:
- Versão 0.4.0-rc.2, Foundation C Runtime Bridge ativo
- C.1–C.4 mergeados (66 testes runtime PASS)
- UI produção usa runtime LEGADO (makBootstrap/runtimeBridge)
- Runtime NOVO (src/runtime/) chega até Runtime Ready — sem render
- Próximo: C.5 M20 Service Locator + M09 Permission

REGRAS:
- 1 slice por PR, não alterar SSOT, seguir padrão C.1–C.4
- Ler README_AI.md antes de codar

[cole PROJECT-COMPLETE-HANDOFF.md inteiro]
```

---

## 45. Git history e PRs

### main HEAD
`66e172cf` Merge PR #391 C.4

### PRs Foundation C
| PR | Slice |
|----|-------|
| #386 | C.0 plan |
| #387 | C.0.2 SSOT |
| #388 | C.1 |
| #389 | C.2 |
| #390 | C.3 |
| #391 | C.4 |
| #392 | Handoff docs |

### Commits recentes
```
66e172cf Merge C.4
bac7ffa6 feat C.4 M07+M08
2860092d Merge C.3
0bc532d9 fix ESLint C.3
74463401 feat C.3 M05+M06
e630d9f9 Merge C.2
74dfb388 feat C.2 M03+M04
608fce84 Merge C.1
38a3abf3 feat C.1 M02+M01
ddac7627 C.0.2 SSOT remediation
5328df98 C.0 plan
```

---

## 46. Mapa de documentos

### Leitura obrigatória (ordem)
1. **Este arquivo** — `docs/evidence/PROJECT-COMPLETE-HANDOFF.md`
2. `README_AI.md`
3. `docs/engineering/AI-STARTUP-GUIDE.md`
4. `docs/constitution/00-MAK-CONSTITUTION.md`
5. `docs/runtime-implementation/README.md` (se trabalhar runtime)
6. `docs/evidence/foundation-c4/CERTIFICATION-REPORT.md` (último slice)

### Status (atualizar após missões)
- `docs/engineering/PROJECT-STATUS.md`
- `docs/engineering/CURRENT-STATE.md`

### Runtime SSOT
- `10-DELIVERY-PLANNING.md` · `08-DONE-CRITERIA.md` · `03-INTERFACES.md`
- `06-BOOTSTRAP-SEQUENCE.md` · `09-GATES.md` · `11-RISKS.md`

### Visão
- `docs/vision/MAK-2035-PLATFORM-VISION.md`
- `docs/platform-architecture/18-FOUNDATION-ROADMAP.md`

---

## 47. Glossário

| Termo | Significado |
|-------|-------------|
| **EOS** | Enterprise Operating System |
| **BOS** | Business Operating Shell — home `/` |
| **CRB** | Canonical Runtime Bundle `mmm-crb-v1` |
| **UEP** | Universal Execution Protocol — pipeline 5 estágios |
| **UAS** | Universal Authoring Specification |
| **MDP** | MAK Data Platform — metadata persistence |
| **MMM** | Universal Meta Model |
| **RT-N** | Estágio N do runtime lifecycle (0–8) |
| **G423-NN** | Sub-gate módulo NN |
| **G423** | Gate master Foundation C completa |
| **AccessScope** | Payload auth L1 (tenant, permissions, companies) |
| **EnvironmentPin** | Pin → bundleId + definitionVersionId |
| **USM** | Universal State Machine |
| **ModeloBase1** | Motor genérico páginas cadastro |
| **Business Asset** | Artefato reutilizável da empresa (D-068) |
| **Fail-closed** | Default deny sem permissão explícita |
| **Slice** | Unidade de entrega C.N (1 PR) |
| **SSOT** | Single Source of Truth |
| **ERI** | Enterprise Readiness Index (3.8/10) |

---

*Fim do handoff completo — MAK Gestão · PROJETOMG*  
*~2.000 linhas · Tudo sobre o projeto · 2026-07-08*  
*Próximo passo código: Foundation C.5*
