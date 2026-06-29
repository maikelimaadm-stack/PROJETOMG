# MAK 2040 — Vision Backlog

**Program:** 0.8 — MAK Vision Backlog  
**Status:** Living document — strategic ideas repository  
**Version:** 1.0.0  
**Created:** 2026-06-29  
**Horizon:** 2040 (exploratory — not committed delivery dates)

---

## ⚠️ Aviso oficial

**Este documento NÃO representa funcionalidades aprovadas.**

Todas as entradas abaixo são **ideias estratégicas de longo prazo** — um repositório permanente de visão para evitar perda de conhecimento ao longo dos anos.

**Antes de qualquer item entrar no roadmap oficial**, é obrigatório:

1. Revisão arquitetural contra [MAK 2035 Master Architecture](../architecture/MAK-2035-MASTER-ARCHITECTURE.md)
2. Validação contra [Engineering Principles](../architecture/MAK-ENGINEERING-PRINCIPLES.md) (D-029)
3. Análise de impacto de longo prazo (gate D-028)
4. Registro no [DECISIONS](../engineering/DECISIONS.md) quando promovido a decisão arquitetural
5. Inclusão formal no [ROADMAP](../engineering/ROADMAP.md) quando aprovado para implementação

**Este backlog não altera:** Constitution · Master Architecture · MDP · Foundation · Roadmap · D-register.

---

## 1. Objetivo e escopo

### Objetivo

Registrar, classificar e preservar **visões estratégicas** discutidas para a evolução da MAK Gestão além do horizonte imediato (Program 2 Studio, Program 1E Runtime Bridge, Program 1F Enterprise Readiness).

### Escopo

| In scope | Out of scope |
|----------|--------------|
| Ideias de produto, plataforma e ecossistema | Especificação técnica detalhada |
| Hipóteses de valor e dependências | Compromisso de delivery |
| Status de maturidade da ideia | Alteração de arquitetura oficial |
| Observações e riscos preliminares | Implementação de código |

### Relação com documentos oficiais

| Documento | Papel |
|-----------|-------|
| [ROADMAP.md](../engineering/ROADMAP.md) | **O que será feito** — aprovado |
| [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) | **Como a plataforma é** — oficial |
| **Este documento** | **O que poderia ser** — exploratório |

---

## 2. Classificação de status

| Status | Significado |
|--------|-------------|
| **Apenas ideia** | Registrada; sem estudo formal |
| **Em estudo** | Análise de viabilidade ou mercado em curso |
| **Em arquitetura** | Desenho de encaixe L0–L7 / impacto em camadas |
| **Em especificação** | Documento técnico ou spec em elaboração |
| **Em implementação** | Desenvolvimento ativo (deve sair deste backlog → ROADMAP) |
| **Em produção** | Disponível para clientes |
| **Consolidado** | Parte estável da plataforma; item pode ser arquivado neste backlog |

**Regra:** Quando um item atinge **Em implementação**, duplicar referência no ROADMAP e manter aqui apenas link histórico.

---

## 3. Registro de ideias

### V-001 — IA Empresarial (Enterprise AI)

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Agentes RBAC-scoped por tenant; automação de cadastros, relatórios e workflows; assistência contextual no Studio; redução de custo operacional para consultorias e ISVs |
| **Dependências** | MDP introspect API ✅ · Platform Event Bus (IFM 1B A5) · AI Platform L6 (Master Architecture §L6.3) · Program 1F.2 Security · Engineering Principle P16 (AI via APIs only) |
| **Observações** | Master Architecture já prevê AI Platform; zero código hoje (PMI 0.0). Não antecede MAK Studio. Alinhado a P16 — proibido acesso direto ao banco |

---

### V-002 — Knowledge Layer (Knowledge Platform)

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Base de conhecimento (procedimentos, treinamento, help) ancorada em entidades/campos MDP; help contextual in-app; redução de tickets de suporte |
| **Dependências** | MDP entity/field links · Content store independente de MDP (Master Architecture §L6.2) · MAK Studio para authoring de links · IA empresarial (V-001) para busca semântica |
| **Observações** | Camada de conteúdo separada de definições estruturais (MDP). Program 5 no Master Architecture |

---

### V-003 — Marketplace Evolutivo

| Campo | Valor |
|-------|-------|
| **Status** | Em estudo |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Ecossistema ISV; publicação de módulos, temas e integrações via `.makpkg`; sandbox de teste; ratings e matriz de compatibilidade de versão; aceleração de receita de parceiros |
| **Dependências** | MDP-5 publish + snapshots ✅ · MAK Studio · SDK (`@mak/sdk-core`) · Public API · Program 1F.2 Security · P17 (Marketplace never injects code) |
| **Observações** | `ClienteModulo` hoje = feature flags only (PMI 1.0). Program 3 no roadmap. Formato `.makpkg` especificado na Master Architecture §L6.1 |

---

### V-004 — Revenue Sharing

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2040+ |
| **Impacto esperado** | Modelo comercial para ISVs e consultores — split de receita por instalação/uso de pacotes Marketplace; incentivo à inovação no ecossistema |
| **Dependências** | Marketplace evolutivo (V-003) · Billing/metering platform · Entitlements (`ClienteModulo` evoluído) · Contratos legais e fiscais multi-país |
| **Observações** | Puramente comercial/operacional; requer Program 1F.1 (moedas/fiscal) para escala internacional. Não impacta Foundation |

---

### V-005 — Intelligent Migration (Migração Inteligente)

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Importação assistida por IA de dados e definições de ERPs legados; mapeamento automático entidade/campo; sandbox de validação; redução de tempo de onboarding enterprise |
| **Dependências** | Program 1F.6 Migration Platform · MDP-5 versioning ✅ · IA empresarial (V-001) · Data Dictionary completo (MDP-2 native fields) |
| **Observações** | Distinto de migração Prisma/DDL. Master Architecture PMI Migration Platform 0.5/10 spec-only. Complementa import ERP externo em 1F.6 |

---

### V-006 — Administrator Control Center

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Console central para operadores MAK: saúde por tenant, pins de versão, feature flags, audit trail, quotas, suporte L3; visibilidade operacional para 10K+ clientes |
| **Dependências** | Program 1F.3 Observability (Tenant/Publish/Runtime Health) · Platform Core L3 · MDP environment pins ✅ · RBAC admin tier |
| **Observações** | Não confundir com MAK Studio (authoring). Foco em **operação** da plataforma SaaS. Relacionado a Administrator vs Studio user personas |

---

### V-007 — Digital Twin Agro

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2040+ |
| **Impacto esperado** | Representação digital de propriedades, talhões, safras, equipamentos e operações agrícolas; integração IoT/sensores; decisões baseadas em dados em tempo quasi-real para vertical agro |
| **Dependências** | MDP entities/relationships extensíveis · Integration Platform · Sync/Offline L6 · Domain modules agro · Event Bus · possível vertical `.makpkg` |
| **Observações** | Vertical de domínio sobre plataforma genérica — não altera Foundation. Requer módulos e integrações específicas do setor |

---

### V-008 — Digital Twin Industry

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2040+ |
| **Impacto esperado** | Gêmeo digital de linhas de produção, ativos industriais e manutenção preditiva; OEE, paradas, qualidade; vertical manufatura/indústria 4.0 |
| **Dependências** | Idem V-007 · OPC-UA/MQTT connectors (Integration Studio) · Time-series storage (L0 extension) · Workflow/Events server-side |
| **Observações** | Paralelo conceitual a V-007 para vertical industrial. Avaliar reutilização de padrão "Digital Twin" como Template Registry type futuro |

---

### V-009 — Self Training

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2040+ |
| **Impacto esperado** | Plataforma ensina o usuário final — tours adaptativos, simulações, certificação in-app baseada em Knowledge Layer e comportamento real do tenant |
| **Dependências** | Knowledge Layer (V-002) · IA empresarial (V-001) · MDP introspect para contexto · Analytics de uso |
| **Observações** | Diferente de documentação estática. Pode consumir CRB versionado para simular telas reais do tenant |

---

### V-010 — Self Implementation

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Cliente implementa módulos e layouts sem consultoria — wizard guiado, templates Marketplace, validação automática, publish assistido; redução de CAC e time-to-value |
| **Dependências** | MAK Studio completo · Marketplace (V-003) · Intelligent Migration (V-005) · Program 1F · Runtime Bridge (1E) |
| **Observações** | Extensão natural do low-code vision. Depende de Studio maduro + CRB hydration em produção |

---

### V-011 — Self Optimization

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2040+ |
| **Impacto esperado** | Plataforma sugere e aplica otimizações — índices DB, layouts de performance, cache, queries lentas, preferências de UX; operação autônoma parcial |
| **Dependências** | Observability Platform (1F.3) · IA empresarial (V-001) · Scale Platform (1F.4) · APM · guardrails human-in-the-loop |
| **Observações** | Alto risco se automação sem aprovação. Exige audit trail completo e rollback MDP-5 |

---

### V-012 — Process Designer

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Designer visual de processos de negócio end-to-end — além de Workflow V20; BPMN-like; orquestração humano+sistema; integrações e SLAs |
| **Dependências** | Workflow Studio · Platform Event Bus · Job Queue (1F.4) · MDP workflow/event/action registry · Notification Engine |
| **Observações** | V20 Workflow hoje é client-side certified. Process Designer implica **server-side orchestration** — depende IFM 1B A5 |

---

### V-013 — Smart Algorithms

| Campo | Valor |
|-------|-------|
| **Status** | Apenas ideia |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Biblioteca de algoritmos reutilizáveis — previsão de demanda, scoring de crédito, rotas, agrupamento inteligente; configuráveis via MDP formula/workflow sem código custom |
| **Dependências** | Formula Engine V17 · MDP Metadata Registry · IA empresarial (V-001) · Marketplace para algoritmos certificados |
| **Observações** | Distinto de formulas simples de campo. Pode exigir sandbox compute isolado (1F.4 workers) por tenant |

---

### V-014 — Multi Country

| Campo | Valor |
|-------|-------|
| **Status** | Em estudo |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Operação nativa em dezenas de países — locale, moeda, impostos, documentos fiscais, calendários fiscais, data residency; expansão TAM global |
| **Dependências** | Program 1F.1 Globalization Platform · MDP label tables ✅ · `compile(moduleId, version, locale)` · Program 1F.2 LGPD/GDPR · Multi-tenant region pins |
| **Observações** | Parcialmente preparado no MDP spec §10 i18n. Zero runtime i18n code today. Engineering Principle P8 Global by Default |

---

### V-015 — Future Studios

| Campo | Valor |
|-------|-------|
| **Status** | Em arquitetura |
| **Horizonte** | 2035 |
| **Impacto esperado** | Conjunto completo de designers MAK — Layout, Field, Table, Cards, Formula, Validation, Events, Actions, Workflow, Permission, Dashboard, Integration, Theme, Template Studio; authoring 100% MDP |
| **Dependências** | MAK Studio Phase 2.1+ (Program 2) · MDP-4 Registry ✅ · MDP-5 publish ✅ · Engineering Principles P14–P15 |
| **Observações** | **Parcialmente consolidado na Master Architecture §L5** — lista oficial de Studios. Implementação = Program 2 sub-phases. Status "Em arquitetura" porque spec L5 existe; código = zero |

---

### V-016 — Enterprise Scale

| Campo | Valor |
|-------|-------|
| **Status** | Em estudo |
| **Horizonte** | 2035–2040 |
| **Impacto esperado** | Plataforma sustenta **10.000+ clientes** e **100.000+ usuários** concurrent — SLA, multi-region, DR, auto-scale, rate limits, observabilidade full-stack |
| **Dependências** | Program 1F completo (1F.1–1F.6) · ERI target ≥7/10 · Redis · APM · DR runbooks · D-028 gate em todas implementações |
| **Observações** | PMI ERI atual **3.8/10**. Multi-tenant schema proven (7.5 PMI); escalabilidade infra **5.0**. Meta explícita D-028 e Program 1F |

---

## 4. Índice rápido

| ID | Ideia | Status |
|----|-------|--------|
| V-001 | IA Empresarial | Apenas ideia |
| V-002 | Knowledge Layer | Apenas ideia |
| V-003 | Marketplace Evolutivo | Em estudo |
| V-004 | Revenue Sharing | Apenas ideia |
| V-005 | Intelligent Migration | Apenas ideia |
| V-006 | Administrator Control Center | Apenas ideia |
| V-007 | Digital Twin Agro | Apenas ideia |
| V-008 | Digital Twin Industry | Apenas ideia |
| V-009 | Self Training | Apenas ideia |
| V-010 | Self Implementation | Apenas ideia |
| V-011 | Self Optimization | Apenas ideia |
| V-012 | Process Designer | Apenas ideia |
| V-013 | Smart Algorithms | Apenas ideia |
| V-014 | Multi Country | Em estudo |
| V-015 | Future Studios | Em arquitetura |
| V-016 | Enterprise Scale | Em estudo |

---

## 5. Protocolo de atualização

1. **Quem pode adicionar:** Qualquer missão ou stakeholder — via PR doc-only.
2. **Formato:** Nova entrada V-0XX com status, impacto, dependências, observações.
3. **Promoção:** Ideia → ROADMAP requer revisão arquitetural + D-register (se decisão) — **nunca** promoção direta deste backlog.
4. **Arquivamento:** Itens **Consolidado** permanecem com nota histórica; não deletar — memória permanente.
5. **Revisão:** Anual ou quando nova ideia estratégica surgir em missão de planejamento.

---

## 6. Version History

| Version | Date | Change |
|---------|-------|--------|
| 1.0.0 | 2026-06-29 | Program 0.8 — initial vision backlog (16 ideas) |

---

*Ideias aqui são sementes — não compromissos. A arquitetura oficial decide o que floresce.*
