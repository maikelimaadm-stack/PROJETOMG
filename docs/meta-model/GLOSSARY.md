# MMM Glossary

**Status:** Official — Terminology SSOT for Meta Model  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 4.01.1

---

## Objetivo

Definir todos os termos oficiais do MAK Universal Meta Model (MMM) em um único lugar.

## Escopo

Termos MMM, plataforma Low Code, autoria, runtime, marketplace e intelligence.

## Responsabilidades

Este documento é o **único owner** de definições terminológicas. Outros documentos referenciam este glossário — não redefinem termos.

---

## A–C

| Termo | Definição |
|-------|-----------|
| **AccessPolicy** | Objeto MMM que agrupa Permission objects e Conditions para um escopo (tenant, application, module). |
| **AICandidate** | Objeto MMM draft produzido por IA; contém objetos propostos + explainability; **nunca** executado diretamente. |
| **AIContext** | Especificação de quais objetos MMM a IA pode ler como contexto (RBAC-bound). |
| **Application** | Produto completo construído sobre MMM (ex.: ERP, CRM). Contém Modules, Navigation, Capabilities. |
| **Automation** | Objeto MMM de automação reativa (trigger → action chain). |
| **BaseTemplate** | Executor runtime pluggable (ex.: `modelobase1`). Consome CRB; não duplica Foundation engines. |
| **Business Asset** | Artefato de negócio reutilizável derivado de Business Intent. |
| **Business Language** | Vocabulário controlado para autoria sem exposição técnica. Gateway para usuários de negócio. |
| **Business Object** | Definição de entidade de negócio no MMM (metadata). Distinto de Record (instância L0). |
| **Business Intent** | Declaração formal de intenção de negócio; input do Intent Resolver. |
| **Capability** | Capacidade de negócio exposta ao usuário via BOS; mapeia para Screens/Routes. |
| **ClientTarget** | Plataforma alvo: web, mobile, desktop, embedded, all. |
| **Compiled Runtime Bundle (CRB)** | Artefato compilado imutável consumido pelo Runtime. Única entrada de execução. |
| **Company** | Empresa operacional dentro de um Tenant (multi-empresa). |
| **Condition** | Expressão booleana reutilizável (visibilidade, permissão, workflow branch). |
| **Confirmation** | Aprovação humana obrigatória antes de persistir objetos MMM derivados. |
| **Connector** | Objeto MMM para integração com sistema externo. |
| **CRB** | Ver Compiled Runtime Bundle. |

## D–I

| Termo | Definição |
|-------|-----------|
| **DefinitionVersion** | Versão publicada de um conjunto de objetos MMM; input do compile. |
| **Derivation** | Processo Intent → Business Asset → objetos MMM técnicos. |
| **DerivationPlan** | Plano de derivação produzido pelo Intent Resolver. |
| **Domain** | Agrupamento lógico de Modules dentro de Application (conceito organizacional). |
| **DomainEvent** | Instância de evento em runtime (L3); **não** é objeto MMM. |
| **Envelope** | Cabeçalho universal de todo objeto MMM (objectId, type, scope, status, labels, lineage). |
| **EnvironmentPin** | Associação DefinitionVersion → ambiente (dev/qa/staging/prod). |
| **Event** | Objeto MMM que define um tipo de evento (onLoad, onSave, custom). |
| **Expert Mode** | Superfície controlada para vocabulário avançado; não expõe Studio como padrão (D-074). |
| **Extension** | Implementação registrada em ExtensionPoint. |
| **ExtensionPoint** | Slot declarado na plataforma para extensão controlada. |
| **Field** | Definição de campo no MMM (native, custom, computed, derived, system, virtual). |
| **Foundation** | Camada L2 congelada (ModeloBase1, engines V13–V20). Executa CRB; não define metadata. |
| **Generic Repository** | Camada de acesso a dados L0 selecionada por PersistenceMapping. |
| **Intent** | Ver Business Intent. |
| **Intent Resolver** | Único gateway autorizado de Intent → DerivationPlan. |

## L–P

| Termo | Definição |
|-------|-----------|
| **LabelSet** | Conjunto i18n `{ locale, label, description, helpText }` em todo objeto MMM. |
| **Lineage** | Proveniência: intentId, packageId, templateId, aiCandidateId, parentVersionId. |
| **Low Code** | Paradigma onde soluções são objetos MMM, não código. |
| **Marketplace** | Distribuição de pacotes `.makpkg` entre tenants. |
| **MDP** | MAK Data Platform — substrato de persistência L4; evolui como persistence layer do MMM. |
| **Meta Model (MMM)** | Grafo tipado de **227 objectTypes** (226 PlatformSchemas), versionado, tenant-scoped — SSOT universal. |
| **Module** | Unidade funcional dentro de Application; contém BusinessObjects, Screens, Workflows. |
| **ModuleDependency** | Dependência declarada entre Modules; obrigatória para referências cross-module. |
| **objectId** | Identificador estável cross-version de um objeto MMM. |
| **objectType** | Tipo canônico na taxonomia MMM (**227** tipos; **226** com PlatformSchema). |
| **Package (.makpkg)** | Snapshot imutável de subgrafo MMM para distribuição Marketplace. |
| **Payload** | Corpo tipado do objeto MMM; validado por PlatformSchema. |
| **Permission** | Objeto MMM atômico: resource + action + effect + condition. |
| **PersistenceMapping** | Declaração de como Records de um BusinessObject persistem em L0. |
| **PlatformSchema** | JSON Schema registry por objectType. |
| **Publish** | Pipeline validate → compile → sign → persist → pin. |
| **Publish Engine** | Serviço que executa pipeline C-1→C-16. |

## R–Z

| Termo | Definição |
|-------|-----------|
| **Record** | Instância de dados L0; **não** é objeto MMM. |
| **Relationship** | Objeto MMM de relacionamento entre BusinessObjects. |
| **Role** | Objeto MMM de papel; substitui roles fixos legacy. |
| **Runtime** | Camada de execução; consome CRB via Runtime Bridge. |
| **Runtime Bridge** | Adaptador CRB → Foundation registries (V13–V20). |
| **Scope** | platform · tenant · company · OU · user (overlay). |
| **Screen** | Objeto MMM de tela completa (layout + views + actions). |
| **Snapshot** | Cópia imutável de objetos MMM em um ponto no tempo. |
| **SSOT** | Single Source of Truth. |
| **Studio** | Superfície L5 de edição de objetos MMM (Expert Mode). |
| **Tenant** | Organização cliente isolada (`Cliente`). |
| **Template** | Pacote reutilizável de objetos MMM seed. |
| **UserPreference** | Overlay pessoal de UI; **nunca** SSOT de definição. |
| **View** | Modo de visualização (table, form, kanban, calendar, …). |
| **Widget** | Componente analítico em Dashboard (KPI, chart, grid, …). |
| **Workflow** | Objeto MMM de fluxo com steps, transitions, triggers. |

---

## Versionamento

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-30 | Initial glossary — Program 4.01.1 |

## Próximos passos

- Adicionar termos conforme novos objectTypes em Program 4.02+
- Sincronizar com [MAK-PLATFORM-LANGUAGE-STANDARD.md](../architecture/MAK-PLATFORM-LANGUAGE-STANDARD.md) onde aplicável
