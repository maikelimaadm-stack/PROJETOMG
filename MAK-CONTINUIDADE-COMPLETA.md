# MAK Gestão — Documento Completo de Continuidade

**Propósito:** Handoff total para novos chats de IA ou colaboradores humanos.  
**Status:** Documento vivo — reflete o estado após **Program 3.26** (D-092, G324).  
**Versão da plataforma:** `0.4.0-rc.2` (`v0.4.0-RC2`, tag pendente do owner)  
**Última missão concluída:** Program 3.26 — Data Lifecycle Persistence & Approval Workflow MVP  
**Data de referência:** 2026-06-30  
**Branch ativa (3.26):** `cursor/lifecycle-persistence-approval-0b52` · PR [#378](https://github.com/maikelimaadm-stack/PROJETOMG/pull/378) (draft)

> **Regra de ouro:** O projeto **não depende de memória de chat**. Toda estratégia, arquitetura, estado e decisões vivem no repositório. Este documento é um **mapa completo** para quem entrar do zero.

---

## Índice

1. [O que é o MAK](#1-o-que-é-o-mak)
2. [Identidade congelada (D-074)](#2-identidade-congelada-d-074)
3. [Stack técnica](#3-stack-técnica)
4. [Arquitetura em camadas (L0–L7)](#4-arquitetura-em-camadas-l0l7)
5. [Mapa do repositório](#5-mapa-do-repositório)
6. [Histórico de programas — tudo que foi feito](#6-histórico-de-programas--tudo-que-foi-feito)
7. [Pipeline de inteligência (Program 3.9–3.26)](#7-pipeline-de-inteligência-program-39326)
8. [Business Operating Shell (BOS)](#8-business-operating-shell-bos)
9. [MAK Studio (congelado)](#9-mak-studio-congelado)
10. [Foundation & MDP](#10-foundation--mdp)
11. [Backend & banco de dados](#11-backend--banco-de-dados)
12. [Governança, gates e decisões](#12-governança-gates-e-decisões)
13. [Regras invioláveis (proteção)](#13-regras-invioláveis-proteção)
14. [Multi-empresa / portfólio / tenant](#14-multi-empresa--portfólio--tenant)
15. [O que está em transição / legacy](#15-o-que-está-em-transição--legacy)
16. [O que ainda está pendente](#16-o-que-ainda-está-pendente)
17. [Como iniciar um novo chat / sessão](#17-como-iniciar-um-novo-chat--sessão)
18. [Comandos operacionais](#18-comandos-operacionais)
19. [PRs recentes e branches](#19-prs-recentes-e-branches)
20. [Comparação antes × depois (visão geral)](#20-comparação-antes--depois-visão-geral)
21. [Referências SSOT (links)](#21-referências-ssot-links)

---

## 1. O que é o MAK

**MAK Gestão** é uma plataforma metadata-driven que evolui de ERP tradicional para **Enterprise Operating System (EOS)** / **Business Operating System (BOS)**.

| MAK é | MAK não é (posicionamento) |
|-------|---------------------------|
| Sistema operacional empresarial | ERP module-centric tradicional |
| Plataforma de negócio | Low-code IDE genérico |
| Administração em linguagem de negócio | Ferramenta técnica para desenvolvedores |
| Inteligência pertencente à empresa | Chat de IA genérico |

**Visão 2035:** [docs/vision/MAK-2035-PLATFORM-VISION.md](./docs/vision/MAK-2035-PLATFORM-VISION.md) (D-057)  
**Arquitetura master:** [docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md](./docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md) (D-014)

---

## 2. Identidade congelada (D-074)

**Decisão D-074 — Product Identity Freeze** é a autoridade suprema de identidade do produto.

Documento: [docs/architecture/MAK-PRODUCT-IDENTITY-FREEZE.md](./docs/architecture/MAK-PRODUCT-IDENTITY-FREEZE.md)

### Princípios permanentes

| # | Princípio | Regra |
|---|-----------|-------|
| P-01 | Usuário administra **negócio**, não módulos | Home por capacidades — nunca menu de módulos como identidade |
| P-02 | **Business First** | Autoria padrão em linguagem de negócio |
| P-03 | **Expert Mode** | Exceção controlada — Studio nunca é superfície padrão |
| P-04 | **Technology Transparency** | Usuário nunca vê fórmulas, AST, JSON, SQL, engines |
| P-05 | **Business Asset First** | Artefatos = Business Assets do tenant |
| P-06 | **Intent First** | Business Language → Intent → Resolver → Asset |
| P-07 | **Human approval** | Automação crítica exige aprovação humana |
| P-08 | **Enterprise-owned Memory/Knowledge** | Nunca pertence ao modelo de IA |
| P-09 | **AI acelera, nunca substitui** | Outputs = candidatos a Intent + explainability |
| P-10 | **ModeloBase1** | Template Runtime permanente — nunca face do produto |

### Cadeia de dependência congelada

```
Business Language (D-065)
  → Business Intent (D-059)
    → Intent Resolver (D-064/D-067, G305 ✅)
      → Business Asset (D-068, G306 ✅ Computed Field)
        → Technical Projection (BAAP)
          → Runtime (D-030, parcial)
            → Domain Events (D-074, pendente impl)
              → Enterprise Memory (D-078, G310 ✅ MVP)
                → Knowledge Graph (D-079, G311 ✅ MVP)
                  → Consulting → Decision → Evolution → DNA → ...
                    → Governance → Fortress → Lifecycle → Persistence → BOS
```

**Superfície primária do produto:** BOS Home (`/`) — nunca menu Cadastro/Empresas como identidade.

---

## 3. Stack técnica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18 + Vite 6 + React Query + Tailwind/shadcn |
| **Backend** | Fastify 5 + Prisma 6 + PostgreSQL |
| **Auth** | JWT custom multi-tenant (D-009 — não Supabase Auth) |
| **Deploy** | Vercel (web) + Railway (API) |
| **Storage** | Supabase/S3-compatible (anexos) |
| **Foundation** | Enterprise V10.2.0 — **congelado** 2026-06-28 |
| **Studio Foundation** | D-052 — **congelado** |

### Dev local (padrão — sem secrets Supabase)

```bash
cp .env.local.example .env.local   # se ausente
npm run dev                        # http://127.0.0.1:5173
```

`.env.local.example` habilita auto-login (`VITE_DEV_AUTO_LOGIN=true`) e proxy `/api` para Railway.

### Dev local (stack completo — requer secrets)

1. `backend/.env.example` → `backend/.env` (DATABASE_URL, DIRECT_URL, SUPABASE_*, JWT_SECRET)
2. Remover `VITE_API_PROXY_TARGET` de `.env.local`
3. `cd backend && npm run seed && npm run dev` (porta 3001)

---

## 4. Arquitetura em camadas (L0–L7)

```
┌─────────────────────────────────────────────────────────────────┐
│  L7  EXPERIENCE          Web · Desktop · Mobile                 │
├─────────────────────────────────────────────────────────────────┤
│  L6  PLATFORM SERVICES   Marketplace · Knowledge · AI · Sync    │
├─────────────────────────────────────────────────────────────────┤
│  L5  MAK STUDIO          Designers · simuladores · publish UI   │
├─────────────────────────────────────────────────────────────────┤
│  L4  MAK DATA PLATFORM   Entity · Data · Relationship · Registry│
├─────────────────────────────────────────────────────────────────┤
│  L3  PLATFORM CORE       Auth · Tenant · RBAC · Events · APIs    │
├─────────────────────────────────────────────────────────────────┤
│  L2  FOUNDATION RUNTIME  ModeloBase1 · framework/mak · V13–V20  │
├─────────────────────────────────────────────────────────────────┤
│  L1  DOMAIN MODULES      empresas · cadcps · thin config       │
├─────────────────────────────────────────────────────────────────┤
│  L0  DATA & INFRA        PostgreSQL · Redis · Object storage    │
└─────────────────────────────────────────────────────────────────┘
```

### Estado por camada (hoje)

| Camada | Status |
|--------|--------|
| L0 PostgreSQL | ✅ Produção |
| L1 Domain | 2 módulos runtime certificados (empresas, cadcps) |
| L2 Foundation | ✅ Congelado V10.2.0 |
| L3 Platform Core | Parcial (auth, tenant, RBAC) — **event bus não iniciado** |
| L4 MDP | ✅ Completo e congelado (MDP-0→5, D-025/D-026) |
| L5 Studio | ✅ Foundation congelada (D-052) + Computation/Formula/Resolver/Computed Field |
| L6 Services | Vision documentada — Marketplace, AI, Knowledge, Sync **não iniciados** |
| L7 Experience | Web ✅ — Desktop/Mobile pendente |

### Experiência do produto (camada acima de L7)

```
┌─────────────────────────────────────────────────────────────────┐
│  BOS — Business Operating Shell (superfície primária)           │
│  Home · Objetivos · Capabilities · Assets · Operations · Health│
├─────────────────────────────────────────────────────────────────┤
│  INTELLIGENCE STACK (src/intelligence/)                         │
│  Memory → Knowledge → Consulting → Decision → Evolution →     │
│  DNA → Segmentation → Recommendation → Adoption → Improvement → │
│  Optimization → Portfolio → Governance → Fortress → Lifecycle → │
│  Persistence                                                    │
├─────────────────────────────────────────────────────────────────┤
│  RUNTIME (invisível) — ModeloBase1 · CRB · Engines             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Mapa do repositório

```
/workspace
├── src/
│   ├── bos/                    # Business Operating Shell (UI primária)
│   │   ├── pages/BosHomePage.jsx
│   │   ├── components/         # Seções BOS (lifecycle, governance, etc.)
│   │   └── shell/
│   ├── intelligence/           # Stack de inteligência empresarial (Programs 3.11–3.26)
│   │   ├── memory/engine/
│   │   ├── knowledge/graph/
│   │   ├── consulting/engine/
│   │   ├── decision/engine/
│   │   ├── evolution/engine/
│   │   ├── dna/engine/
│   │   ├── segmentation/engine/
│   │   ├── recommendation/engine/
│   │   ├── adoption/engine/
│   │   ├── improvement/engine/
│   │   ├── optimization/engine/
│   │   ├── portfolio/engine/
│   │   ├── governance/engine/
│   │   ├── fortress/engine/
│   │   ├── lifecycle/
│   │   │   ├── engine/         # Program 3.25 — archive/hold/expunge
│   │   │   └── persistence/    # Program 3.26 — persistência + aprovação
│   │   ├── integration/        # Projeções BOS (bosIntelligenceProjection.js)
│   │   └── index.js            # Exports públicos
│   ├── studio/                 # MAK Studio (congelado D-052 + Programs 3.x)
│   │   ├── intent/             # Intent Resolver (G305)
│   │   ├── business/           # Computed Fields (G306), Workflow
│   │   ├── computation/        # Computation Engine (G302)
│   │   ├── designers/          # Layout, Field, Formula
│   │   └── ...                 # SDK, SOM, Expression, Evaluation, etc.
│   ├── ModeloBase1/            # Template Runtime (~4.400 LOC) — congelado
│   ├── framework/
│   │   ├── mak/                # Foundation (~18.900 LOC) — congelado
│   │   ├── cadastro-engine/    # Engine cadastro — congelado
│   │   └── cadastro/           # Legacy — promoção em progresso (TD-003)
│   └── modules/                # Domain modules (empresas, cadcps, etc.)
├── backend/
│   ├── prisma/schema.prisma    # Modelos DB (+ lifecycle models 3.26)
│   └── src/modules/            # auth, empresas, mdp, lifecycle, etc.
├── docs/
│   ├── constitution/           # 11 docs — autoridade máxima
│   ├── architecture/           # Arquiteturas congeladas
│   ├── engineering/            # SSOT operacional (PROJECT-STATUS, registries)
│   └── vision/                 # Visão 2035
├── scripts/
│   └── gate-*.mjs              # Gates de governança (G31–G324)
├── e2e/                        # Playwright specs
├── README_AI.md                # Pre-flight obrigatório para agentes IA
└── AGENTS.md                   # Instruções Cloud Agent
```

---

## 6. Histórico de programas — tudo que foi feito

### Program 0 — Documentation OS ✅

| ID | Nome | Status |
|----|------|--------|
| 0.1 | Constitution bootstrap | ✅ |
| 0.2 | Documentation certification | ✅ |

### Program 1 — IFM (Metadata Foundation) ✅

| ID | Nome | Decision | Status |
|----|------|----------|--------|
| 1A | Stability | — | ✅ (S4 DDL pendente) |
| 1B | Architecture promotion | — | Background |
| 1C | MAK DATA PLATFORM (MDP-0→5) | D-012, D-025, D-026 | ✅ **congelado** |
| 1D | CI governance (V13–V20) | — | ✅ |
| 1E | Runtime Bridge | D-027, D-030 | ✅ Phase 1 |
| 1F | Enterprise Readiness | D-028 | ✅ docs only |

### Program 2 — MAK Studio ✅ (foundation congelada D-052)

| ID | Nome | Gate | Status |
|----|------|------|--------|
| 2.0 | Studio foundation architecture | — | ✅ docs |
| 2.0.5 | Studio SDK | G262–G266 | ✅ |
| 2.0.6 | Design System | G267–G271 | ✅ |
| 2.0.7 | Event Architecture | G273–G278 | ✅ |
| 2.0.8 | Architecture Governance | G279–G284 | ✅ |
| 2.0.9 | UX Framework | G285 | ✅ docs |
| 2.1A | Shell Prototype | G286 | ✅ |
| 2.1A.5 | Universal Components | G288 | ✅ |
| 2.1A.6 | Domain Engine | G289 | ✅ |
| 2.1A.7 | Contribution Engine | G290 | ✅ |
| 2.1B | Shell Production | G287 | ✅ |
| 2.2 | Layout Studio | G291 | ✅ |
| 2.2.5 | Core Engine | G293 | ✅ |
| 2.2.6 | SOM | G294 | ✅ |
| 2.2.7 | Editor Engine | G295 | ✅ |
| 2.3 | Field Studio | G296 | ✅ |
| 2.3.1 | Smart Authoring | G297 | ✅ |
| 2.3.2 | Expression Engine | G298 | ✅ |
| 2.3.3 | Dependency Engine | G299 | ✅ |
| 2.3.4 | Type System | G300 | ✅ |
| 2.3.5 | Evaluation Engine | G301 | ✅ |
| 2.3.X | Stabilization + freeze | G401/G402 | ✅ |
| 2.3.Y | Transition & continuity | — | ✅ |

**Rotas Studio:** `/studio`, `/studio/prototype`, `/studio/empresas/layout`, `/studio/empresas/field`, `/studio/empresas/formula`

### Program 3 — Studio Intelligence (track atual)

#### Fase arquitetural (docs + audits)

| ID | Nome | Decision | Status |
|----|------|----------|--------|
| 3.0.5 | Studio Computation Architecture | D-054 | ✅ docs |
| 3.1 | Computation Engine | D-055, G302 | ✅ |
| 3.2 | Formula Builder | D-056, G303A | ✅ |
| 3.1.5 | Enterprise Platform Vision | D-057 | ✅ docs |
| 3.3 | Business Computation Layer | D-058 | ✅ docs |
| 3.4 | Business Intent Authoring | D-059 | ✅ docs |
| 3.5A | Enterprise Intelligence Vision | D-060 | ✅ docs |
| 3.5B | Architecture Consolidation Audit | D-061 | ✅ docs |
| 3.5C | Architecture Remediation | D-062 | ✅ docs |
| 3.6 | Business Derivation Architecture | D-063 | ✅ docs |
| 3.6.5 | Intent Resolver Architecture | D-064 | ✅ docs |
| 3.6.8 | Business Language Architecture | D-065 | ✅ docs |
| 3.6.9 | Enterprise Organization Architecture | D-066 | ✅ docs |

#### Fase implementação (código + gates)

| ID | Nome | Decision | Gate | Status | PR |
|----|------|----------|------|--------|-----|
| 3.7 | Business Intent Resolver | D-067 | G305 | ✅ | — |
| 3.8 | Business Computed Fields | D-068 | G306 | ✅ | — |
| 3.8.5 | Enterprise Vision Compliance Audit | D-069 | — | ✅ audit | — |
| 3.8.6 | Enterprise Platform Deep Audit | D-070 | — | ✅ audit | — |
| 3.8.7 | Enterprise Vision Alignment Audit | D-072 | — | ✅ audit | — |
| — | Platform Remediation | D-073 | — | ✅ | — |
| 3.8.8 | Product Identity Freeze | D-074 | — | ✅ **congelado** | — |
| 3.9 | Business Operating Shell MVP | D-075 | G307 | ✅ | — |
| 3.10 | Business Workflow MVP | D-076 | G308 | ✅ | — |
| 3.11 | Enterprise Intelligence Foundation | D-077 | G309 | ✅ | — |
| 3.12 | Enterprise Memory Engine MVP | D-078 | G310 | ✅ | — |
| 3.13 | Enterprise Knowledge Graph MVP | D-079 | G311 | ✅ | — |
| 3.14 | Consulting Engine MVP | D-080 | G312 | ✅ | — |
| 3.15 | Decision Engine MVP | D-081 | G313 | ✅ | — |
| 3.16 | Evolution Engine MVP | D-082 | G314 | ✅ | — |
| 3.17 | Business DNA & Maturity MVP | D-083 | G315 | ✅ | — |
| 3.18 | Segmentation, Templates & Maturity | D-084 | G316 | ✅ | — |
| 3.19 | Recommendation & Replication | D-085 | G317 | ✅ | — |
| 3.20 | Adoption & Corporate Intelligence | D-086 | G318 | ✅ | — |
| 3.21 | Continuous Improvement & Optimization | D-087 | G319 | ✅ | — |
| 3.22 | Portfolio Intelligence & Command Center | D-088 | G320 | ✅ | — |
| 3.23 | Platform Governance & Portfolio Control | D-089 | G321 | ✅ | — |
| 3.24 | Compliance, Retention & Audit Fortress | D-090 | G322 | ✅ | #376 |
| 3.25 | Data Lifecycle, Archive & Expunge | D-091 | G323 | ✅ | #377 |
| 3.26 | Lifecycle Persistence & Approval | D-092 | G324 | ✅ | #378 |

#### Programas futuros (planejados — não iniciados)

| ID | Nome | Pré-requisito |
|----|------|---------------|
| 3.27+ | Próxima camada de inteligência | 3.26 ✅ |
| 3.3-impl | Business Computation impl | G303B (planned) |
| 4 | AI Platform | Event bus, MDP, Intent |
| 5 | Knowledge Platform | MDP, Intent SSOT |
| 6 | Marketplace | MDP bundles |
| 6 | Offline / Sync | MDP snapshots |

---

## 7. Pipeline de inteligência (Program 3.9–3.26)

### Pipeline oficial (consumo em cascata)

```
Governance (3.23)
  ↓ consome Portfolio Intelligence + stack completo
Fortress (3.24)
  ↓ consome Governance + retenção/compliance/audit
Lifecycle (3.25)
  ↓ consome Fortress + archive/hold/expunge
Persistence (3.26)
  ↓ consome Lifecycle + aprovação humana + fila + storage
BOS
  ↓ projeta tudo em vocabulário de negócio
```

### Stack completo (Programs 3.11–3.26)

| Engine | Path | Gate | Decision | Função |
|--------|------|------|----------|--------|
| Intelligence Foundation | `src/intelligence/` (base) | G309 | D-077 | Orquestração base |
| Memory | `memory/engine/` | G310 | D-078 | Memória empresarial tenant-scoped |
| Knowledge Graph | `knowledge/graph/` | G311 | D-079 | Grafo de conhecimento |
| Consulting | `consulting/engine/` | G312 | D-080 | Recomendações consultivas |
| Decision | `decision/engine/` | G313 | D-081 | Decisões explicáveis |
| Evolution | `evolution/engine/` | G314 | D-082 | Evolução organizacional |
| Business DNA | `dna/engine/` | G315 | D-083 | Maturidade/DNA empresarial |
| Segmentation | `segmentation/engine/` | G316 | D-084 | Segmentação e templates |
| Recommendation | `recommendation/engine/` | G317 | D-085 | Recomendação e replicação |
| Adoption | `adoption/engine/` | G318 | D-086 | Adoção e inteligência corporativa |
| Improvement | `improvement/engine/` | G319 | D-087 | Melhoria contínua |
| Optimization | `optimization/engine/` | G320 | D-088 | Loop de otimização |
| Portfolio | `portfolio/engine/` | G320 | D-088 | Inteligência de portfólio |
| Governance | `governance/engine/` | G321 | D-089 | Governança de plataforma |
| Fortress | `fortress/engine/` | G322 | D-090 | Compliance, retenção, audit |
| Lifecycle | `lifecycle/engine/` | G323 | D-091 | Archive, hold, expunge |
| Persistence | `lifecycle/persistence/` | G324 | D-092 | Persistência + aprovação |

### Projeção BOS

Arquivo central: `src/intelligence/integration/bosIntelligenceProjection.js`

Agrega projeções de todos os engines e alimenta `BosHomePage.jsx` com vocabulário administrativo (sem jargão técnico).

### Program 3.26 — detalhe do que foi entregue

**Objetivo:** Sair do MVP local/in-memory para persistência durável com aprovação humana.

| Componente | Arquivo(s) | Descrição |
|------------|-----------|-----------|
| Durable Store | `durableLifecycleStore.js` | localStorage (browser) + memória (Node/gates) |
| Approval Engine | `approvalWorkflowEngine.js` | create/approve/reject/finalize |
| Execution Queue | `lifecycleExecutionQueue.js` | Fila com bloqueio sem aprovação |
| Storage Adapter | `storageIntegrationAdapter.js` | Stub com audit hooks |
| Backup Adapter | `backupIntegrationAdapter.js` | Stub com audit hooks |
| Audit Trail | `durableAuditTrailStore.js` | Trilha durável |
| BOS Actions | `lifecyclePersistenceActions.js` | Aprovar/Rejeitar no BOS |
| BOS Projection | `lifecyclePersistenceToBosProjection.js` | Vocabulário de negócio |
| Backend Prisma | `LifecycleApprovalRequest`, `LifecycleExecutionJob`, `LifecycleAuditEntry` | Modelos DB |
| Backend API | `backend/src/modules/lifecycle/` | GET approvals, POST approve/reject |
| Gate | `scripts/gate-enterprise-lifecycle-persistence-approval.mjs` | G324 — 26/26 checks |

**Princípios D-092:**
- Persistência pertence à plataforma e cliente autorizado — **nunca ao modelo**
- Tenant-scoped, group-scoped com autorização explícita
- Nenhum expurgo sem regra + política + auditoria + aprovação
- Nenhum chat genérico
- Nenhuma execução autônoma

---

## 8. Business Operating Shell (BOS)

**Decisão:** D-075 (Program 3.9) · **Gate:** G307  
**Arquitetura:** [docs/architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md](./docs/architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md)

### Superfície primária

| Região BOS Home | Conteúdo |
|-----------------|----------|
| Objetivos | Metas de negócio declaradas |
| Capabilities | Capacidades habilitadas (não módulos) |
| Assets | Registro de Business Assets |
| Operations | Filas de trabalho do dia a dia |
| Health | Score de saúde empresarial |
| Recommendations | Output consultivo → candidatos Intent |
| Governance | Políticas, permissões, retenção |
| Fortress | Compliance, legal hold, retenção |
| Lifecycle | Archive, hold, expurge |
| Persistence | Aprovações pendentes, fila, auditoria |

### Arquivos principais

```
src/bos/
├── pages/BosHomePage.jsx           # Home principal (/)
├── components/
│   ├── BusinessLifecycleSections.jsx  # Aprovar/Rejeitar lifecycle
│   └── ... (outras seções BOS)
└── shell/                          # Layout BOS
```

### Regra inviolável

- BOS = superfície primária
- ModeloBase1 = infraestrutura invisível
- Studio = exceção Expert Mode
- Menu Cadastro/Empresas = legacy UX, **não identidade do produto**

---

## 9. MAK Studio (congelado)

**Decisão:** D-052 — Foundation Freeze  
**Arquitetura:** [docs/architecture/MAK-STUDIO-ARCHITECTURE.md](./docs/architecture/MAK-STUDIO-ARCHITECTURE.md)

### Status dos designers

| Componente | Gate | Status |
|------------|------|--------|
| Expression → Evaluation | G298–G301 | ✅ |
| Computation Engine | G302 | ✅ |
| Formula Builder | G303A | ✅ |
| Intent Resolver | G305 | ✅ |
| Business Computed Field | G306 | ✅ |
| Business Computation impl | G303B | **planned** |
| Table Designer | — | **não iniciado** |
| Workflow Designer | — | **não iniciado** |
| Permission Designer | — | **não iniciado** |

### Regra D-068 — Business Asset First

| Regra | Status |
|-------|--------|
| Nenhuma feature nova para Studios | Ativo |
| Novas capabilities = Business Assets | Ativo |
| Studios editam assets apenas | Ativo |
| Runtime executa projeções derivadas | Ativo |

**Studio NÃO é a superfície primária do produto.** É infraestrutura de plataforma para engenharia e Expert Mode.

---

## 10. Foundation & MDP

### Foundation (L2) — congelado

| Componente | Path | LOC | Status |
|------------|------|-----|--------|
| ModeloBase1 | `src/ModeloBase1/` | ~4.400 | ✅ Certificado |
| framework/mak | `src/framework/mak/` | ~18.900 | ✅ Congelado |
| cadastro-engine | `src/framework/cadastro-engine/` | ~2.000 | ✅ Congelado |
| framework/cadastro | `src/framework/cadastro/` | ~11.100 | Legacy — promoção |

### MDP (L4) — completo e congelado

| Componente | Status | Decision |
|------------|--------|----------|
| MDP-0 Architecture | ✅ | D-020 |
| MDP-1 Entity Dictionary | ✅ | D-025 |
| MDP-2 Data Dictionary | ✅ | D-025 |
| MDP-3 Relationship Dictionary | ✅ | D-025 |
| MDP-4 Metadata Registry | ✅ | D-025 |
| MDP-5 Versioning & Publication | ✅ | D-026 |

### Módulos runtime certificados

| moduleId | Page | Pattern |
|----------|------|---------|
| empresas | PAGEMP | Reference — factory overrides |
| cadcps | PAGCPS | Thin page + domain runtime |

### Config Engines (V13–V20) — todos certificados

Layout, Field, Validation, Formula, Events, Actions, Workflow, Import/History/Preferences.  
Grouping/Pivot: **disabled** (`disabled_certified`).

---

## 11. Backend & banco de dados

### Stack

- Fastify 5 + Prisma 6 + PostgreSQL
- Multi-tenant: `cliente_id` em todos os modelos operacionais
- Multi-empresa: `PermissaoEmpresa` + header `X-Empresa-Id`

### Módulos backend

```
backend/src/modules/
├── auth/
├── empresas/
├── cadcps/
├── mdp/
├── lifecycle/          # Program 3.26 — NEW
├── preferences/
├── audit/
├── anexos/
├── clienteModulo/
├── sequencias/
├── idGlobal/
├── metrics/
└── debug/
```

### Modelos Prisma (lifecycle — 3.26)

- `LifecycleApprovalRequest` — pedidos de aprovação
- `LifecycleExecutionJob` — jobs na fila de execução
- `LifecycleAuditEntry` — trilha de auditoria durável

### API Lifecycle (3.26)

```
GET  /api/lifecycle/approvals/:groupId
POST /api/lifecycle/approvals/:id/approve
POST /api/lifecycle/approvals/:id/reject
```

---

## 12. Governança, gates e decisões

### Registries SSOT

| Registry | Path |
|----------|------|
| Project Status | `docs/engineering/PROJECT-STATUS.md` |
| Program Registry | `docs/engineering/PROGRAM-REGISTRY.md` |
| Gate Registry | `docs/engineering/GATE-REGISTRY.md` |
| Decisions | `docs/engineering/DECISIONS.md` (D-001 → D-092) |
| Governance Registry | `docs/engineering/GOVERNANCE-REGISTRY.md` |
| SSOT Registry | `docs/engineering/SSOT-REGISTRY.md` |

### Gates ativos (Product — Programs 3.9–3.26)

| Gate | Program | Checks |
|------|---------|--------|
| G307 | 3.9 BOS | BOS MVP |
| G308 | 3.10 Workflow | Business Workflow |
| G309 | 3.11 Intelligence Foundation | Foundation |
| G310 | 3.12 Memory | Memory Engine |
| G311 | 3.13 Knowledge | Knowledge Graph |
| G312 | 3.14 Consulting | Consulting Engine |
| G313 | 3.15 Decision | Decision Engine |
| G314 | 3.16 Evolution | Evolution Engine |
| G315 | 3.17 DNA | Business DNA |
| G316 | 3.18 Segmentation | Segmentation |
| G317 | 3.19 Recommendation | Recommendation |
| G318 | 3.20 Adoption | Adoption |
| G319 | 3.21 Improvement | Continuous Improvement |
| G320 | 3.22 Portfolio | Portfolio Intelligence |
| G321 | 3.23 Governance | Platform Governance |
| G322 | 3.24 Fortress | Compliance Fortress |
| G323 | 3.25 Lifecycle | Data Lifecycle |
| G324 | 3.26 Persistence | Lifecycle Persistence |

### Validação obrigatória (toda missão)

```bash
npm run build
npm run lint
npm run verify:governance      # inclui todos os gates
npm run verify:ci              # mirror CI completo
npm run verify:governance:cycles  # 5 ciclos de estabilidade
```

### Decisões-chave (resumo D-001 → D-092)

| Range | Tema |
|-------|------|
| D-001–D-010 | Foundation, ModeloBase1, Constitution, Multi-tenant |
| D-011–D-026 | IFM, MDP completo |
| D-027–D-030 | Reassessment, Governance evolution, Runtime Bridge |
| D-031–D-052 | MAK Studio completo + freeze |
| D-054–D-058 | Computation, Formula, Vision, Business Computation docs |
| D-059–D-066 | Intent, Intelligence vision, Remediation, Derivation, Language, Organization |
| D-067–D-068 | Intent Resolver impl, Computed Fields + BAAP |
| D-069–D-073 | Audits, Remediation, Product Alignment |
| D-074 | **Product Identity Freeze** |
| D-075–D-092 | BOS → Intelligence stack → Governance → Fortress → Lifecycle → Persistence |

---

## 13. Regras invioláveis (proteção)

Toda implementação futura **DEVE** preservar:

1. **D-074** — Identidade congelada
2. **BOS Home** — Superfície primária
3. **Business Workflow, Intent, Assets**
4. **Enterprise Memory, Knowledge Graph**
5. **Consulting, Decision, Evolution Engines**
6. **Business DNA, Segmentation**
7. **Recommendation, Adoption, Improvement, Optimization**
8. **Portfolio Intelligence**
9. **Platform Governance**
10. **Compliance Fortress**
11. **Data Lifecycle (3.25)**
12. **Lifecycle Persistence (3.26)**
13. **ModelBase1, Runtime, Studio, Formula Builder**
14. Sem alterar dados/preferências/layouts existentes sem missão explícita
15. **Sem chat genérico**
16. **Sem execução autônoma** de ações sensíveis
17. **Sem exposição técnica** ao usuário de negócio
18. **Sem mistura de tenants**
19. **Sem visão corporativa sem autorização**
20. **Sem archive/expunge/hold sem política + auditoria + aprovação**

---

## 14. Multi-empresa / portfólio / tenant

### Regras

| Regra | Implementação |
|-------|---------------|
| Isolamento total por tenant | `cliente_id` + contratos `crossTenantMixingForbidden` |
| Agregação somente com permissão | Portfolio bridge read-only, `unauthorizedAggregationForbidden` |
| Lifecycle com escopo autorizado | group-scoped + autorização explícita |
| Auditoria com contexto autorizado | Trilha durável com origem e evidência |
| Camada corporativa não quebra isolamento | Portfolio agrega; empresa = unidade básica |

### Header multi-empresa

`X-Empresa-Id` — seleciona empresa dentro do tenant (cliente).

---

## 15. O que está em transição / legacy

| Item | Estado | Nota |
|------|--------|------|
| Menu Cadastro/Empresas | Legacy UX | Não é identidade do produto (D-074) |
| framework/cadastro/ | Legacy | 78 arquivos importam — promoção IFM 1B (TD-003) |
| Formula Builder audience | Platform engineering | Identidade congelada; UX legacy para negócio |
| Lifecycle frontend store | localStorage + memória | Backend Prisma pronto; sync bidirecional pendente |
| Storage/backup adapters | Stubs com audit | Integração real pendente (3.27+) |
| Domain event bus | Não iniciado | Pré-requisito Intelligence avançada (D-074 frozen) |
| Business Computation impl | G303B planned | Docs prontos (D-058), código pendente |
| CURRENT-STATE.md | Parcialmente desatualizado | Última verificação 3.8 — PROJECT-STATUS é SSOT de posição |

---

## 16. O que ainda está pendente

### Próximo oficial

**Program 3.27+** — Próxima camada de inteligência (não especificado ainda no registry)

Candidatos naturais (baseado em gaps identificados):

| Item | Descrição |
|------|-----------|
| Sync frontend ↔ backend lifecycle | Unificar store localStorage com Prisma |
| Expurgo físico real | Integração storage provider |
| Domain Event Bus | Pré-requisito D-074 para Intelligence avançada |
| G303B | Business Computation implementation |
| Table/Workflow/Permission Designers | Studio designers não iniciados |
| Program 4 | AI Platform |
| Program 5 | Knowledge Platform (full impl) |
| Program 6 | Marketplace |
| Offline/Sync | Sync Platform |
| E2E lifecycle approve/reject | Playwright para fluxo BOS |
| Notificações administrativas | E-mail/push para aprovações pendentes |

### Dívida técnica ativa (P1)

| ID | Item |
|----|------|
| TD-003 | 78 arquivos importam legacy `framework/cadastro/` |
| TD-004 | Nomenclatura Empresas em ModeloBase1 generic layer |
| TD-009 | Typecheck noise em `src/shared/ui/*` (shadcn) |

---

## 17. Como iniciar um novo chat / sessão

### Para o usuário (ao abrir novo chat)

Cole este prompt inicial:

```
Estou trabalhando no projeto MAK Gestão ERP/EOS.
Leia obrigatoriamente:
1. /MAK-CONTINUIDADE-COMPLETA.md (este documento — mapa completo)
2. /README_AI.md (pre-flight agentes)
3. /docs/engineering/PROJECT-STATUS.md (posição SSOT)

Estado atual: Program 3.26 concluído (D-092, G324).
Próximo: Program 3.27+.
Identidade D-074 congelada. BOS é superfície primária.
```

### Para agentes IA (ordem de leitura)

1. `MAK-CONTINUIDADE-COMPLETA.md` (este arquivo)
2. `README_AI.md`
3. `docs/engineering/PROJECT-STATUS.md`
4. `docs/engineering/AI-STARTUP-GUIDE.md`
5. `docs/constitution/00-MAK-CONSTITUTION.md` (se alteração estrutural)
6. `docs/architecture/MAK-PRODUCT-IDENTITY-FREEZE.md` (se alteração de produto)
7. Relatório do program específico em `docs/engineering/PROGRAM-*.md`

### Protocolo de implementação

Toda missão segue [PLATFORM-IMPLEMENTATION-PROTOCOL.md](./docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md) (PIP) com 10 fases + RHP (D-019).

Ao concluir missão:
1. Criar/atualizar Gate G-xxx
2. Registrar Decision D-xxx em DECISIONS.md
3. Atualizar PROGRAM-REGISTRY, GATE-REGISTRY, PROJECT-STATUS
4. Criar relatório PROGRAM-X.XX-REPORT.md
5. Rodar todos os gates obrigatórios
6. Commit + push + PR

---

## 18. Comandos operacionais

| Tarefa | Comando |
|--------|---------|
| Frontend dev | `npm run dev` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| Governance | `npm run verify:governance` |
| CI mirror | `npm run verify:ci` |
| 5 ciclos | `npm run verify:governance:cycles` |
| Gate capabilities | `npm run gate:capabilities` |
| Gate G324 | `npm run gate:enterprise-lifecycle-persistence-approval` |
| Generate module | `npm run generate:module` |
| Backend dev | `cd backend && npm run dev` |
| Backend seed | `cd backend && npm run seed` |
| E2E mock | `npm run test:e2e:empresas-novo` |
| E2E full | `npm run test:e2e` |

---

## 19. PRs recentes e branches

| Program | Branch | PR | Status |
|---------|--------|-----|--------|
| 3.24 Fortress | `cursor/compliance-retention-audit-fortress-0b52` | #376 | ✅ Merged/Done |
| 3.25 Lifecycle | `cursor/data-lifecycle-archive-expunge-0b52` | #377 | ✅ Merged/Done |
| 3.26 Persistence | `cursor/lifecycle-persistence-approval-0b52` | #378 | Draft — aguardando merge |

### Convenção de branches (Cloud Agent)

```
cursor/<descriptive-name>-0b52
```

---

## 20. Comparação antes × depois (visão geral)

| Dimensão | Antes (início Program 3) | Agora (após 3.26) |
|----------|--------------------------|-------------------|
| Superfície primária | Menu módulos / ModeloBase1 | BOS Home (D-074, G307) |
| Inteligência | Vision docs only (D-060) | 16 engines MVP implementados |
| Governança | Docs | Engine + BOS (G321) |
| Compliance | Docs | Fortress + retenção/audit (G322) |
| Lifecycle | Inexistente | Archive/hold/expunge (G323) |
| Persistência | In-memory local | Durable store + Prisma + aprovação BOS (G324) |
| Decisões | D-001–D-073 | D-001–D-092 |
| Gates product | — | G307–G324 (18 gates) |
| Identidade | Ambígua | **Congelada D-074** |
| Studio | Foundation only | + Resolver + Computed Field |
| Próximo passo | BOS MVP | Program 3.27+ |

---

## 21. Referências SSOT (links)

### Obrigatórios (sempre)

| Documento | Path |
|-----------|------|
| Este documento | `MAK-CONTINUIDADE-COMPLETA.md` |
| AI Entry Point | `README_AI.md` |
| Project Status | `docs/engineering/PROJECT-STATUS.md` |
| Program Registry | `docs/engineering/PROGRAM-REGISTRY.md` |
| Gate Registry | `docs/engineering/GATE-REGISTRY.md` |
| Decisions | `docs/engineering/DECISIONS.md` |

### Identidade & produto

| Documento | Path |
|-----------|------|
| Product Identity Freeze | `docs/architecture/MAK-PRODUCT-IDENTITY-FREEZE.md` |
| BOS Architecture | `docs/architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md` |
| Platform Vision 2035 | `docs/vision/MAK-2035-PLATFORM-VISION.md` |
| Master Architecture | `docs/architecture/MAK-2035-MASTER-ARCHITECTURE.md` |

### Relatórios de programas (3.9–3.26)

| Program | Relatório |
|---------|-----------|
| 3.9 BOS | `docs/engineering/PROGRAM-3.9-BOS-REPORT.md` (se existir) |
| 3.10 Workflow | `docs/engineering/PROGRAM-3.10-BUSINESS-WORKFLOW-REPORT.md` |
| 3.11 Intelligence | `docs/engineering/PROGRAM-3.11-ENTERPRISE-INTELLIGENCE-FOUNDATION-REPORT.md` |
| 3.12 Memory | `docs/engineering/PROGRAM-3.12-ENTERPRISE-MEMORY-ENGINE-REPORT.md` |
| 3.13 Knowledge | `docs/engineering/PROGRAM-3.13-ENTERPRISE-KNOWLEDGE-GRAPH-REPORT.md` |
| 3.14 Consulting | `docs/engineering/PROGRAM-3.14-CONSULTING-ENGINE-REPORT.md` |
| 3.15 Decision | `docs/engineering/PROGRAM-3.15-DECISION-ENGINE-REPORT.md` |
| 3.16 Evolution | `docs/engineering/PROGRAM-3.16-EVOLUTION-ENGINE-REPORT.md` |
| 3.17 DNA | `docs/engineering/PROGRAM-3.17-BUSINESS-DNA-MATURITY-REPORT.md` |
| 3.18 Segmentation | `docs/engineering/PROGRAM-3.18-SEGMENTATION-TEMPLATES-MATURITY-REPORT.md` |
| 3.19 Recommendation | `docs/engineering/PROGRAM-3.19-RECOMMENDATION-REPLICATION-REPORT.md` |
| 3.20 Adoption | `docs/engineering/PROGRAM-3.20-ADOPTION-CORPORATE-INTELLIGENCE-REPORT.md` |
| 3.21 Improvement | `docs/engineering/PROGRAM-3.21-CONTINUOUS-IMPROVEMENT-OPTIMIZATION-REPORT.md` |
| 3.22 Portfolio | `docs/engineering/PROGRAM-3.22-PORTFOLIO-INTELLIGENCE-COMMAND-CENTER-REPORT.md` |
| 3.23 Governance | `docs/engineering/PROGRAM-3.23-PLATFORM-GOVERNANCE-PORTFOLIO-CONTROL-REPORT.md` |
| 3.24 Fortress | `docs/engineering/PROGRAM-3.24-COMPLIANCE-RETENTION-AUDIT-FORTRESS-REPORT.md` |
| 3.25 Lifecycle | `docs/engineering/PROGRAM-3.25-DATA-LIFECYCLE-ARCHIVE-EXPUNGE-REPORT.md` |
| 3.26 Persistence | `docs/engineering/PROGRAM-3.26-LIFECYCLE-PERSISTENCE-APPROVAL-REPORT.md` |

### Constituição

```
docs/constitution/
├── 00-MAK-CONSTITUTION.md          # Autoridade máxima
├── 01-FOUNDATION-RULES.md
├── 02-ARCHITECTURE-PRINCIPLES.md
├── ...
└── 11-PERMANENT-GOVERNANCE-DIRECTIVE.md
```

---

## Certificação deste documento

| Campo | Valor |
|-------|-------|
| Cobertura | Arquitetura L0–L7, Programs 0–3.26, Intelligence stack, BOS, Studio, MDP, Backend, Governança |
| Estado refletido | Program 3.26 concluído (D-092, G324) |
| Identidade | D-074 congelada |
| Próximo passo | Program 3.27+ |
| Uso | Handoff para novos chats — **não substitui SSOTs oficiais**, complementa com visão unificada |

---

*Documento gerado para continuidade entre sessões. Atualizar após cada Program concluído.*
