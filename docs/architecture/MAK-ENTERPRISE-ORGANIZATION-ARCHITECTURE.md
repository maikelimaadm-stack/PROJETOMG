# MAK Enterprise Organization Architecture

**Status:** Official — Permanent architecture reference · **Final structural architecture**  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.6.9 — Enterprise Digital Organization Architecture  
**Decision:** D-066  
**Layer:** L6 (Enterprise Services) + L7 (Experience) — **organizational organism SSOT**  
**Hierarchy:** Constitution → Master Architecture → [Enterprise OS Principles](./MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md) (D-060) → [Business Object Model](./MAK-BUSINESS-OBJECT-MODEL.md) (D-057) → **This document** → Intent-driven stack (Language D-065 → Intent D-059 → Resolver D-064 → Derivation D-063) → Intelligence layer (DNA, Memory, Knowledge, Mining, Consulting, Decision, Evolution)

---

## ⚠️ Scope boundary (Program 3.6.9)

| In scope | Out of scope (this mission) |
|----------|----------------------------|
| Permanent **Enterprise Digital Organization** architecture — all concepts in §3 | Code, APIs, database, runtime, Foundation, Studio changes |
| How the enterprise operates as a **Digital Organism** | Intent Resolver **implementation** (Program 3.7) |
| Organizational relationships, ownership, topology | Org chart UI, HR system integration code |
| Integration contracts with Intelligence layer (D-060) | Intelligence engine implementation |
| **Final structural architecture freeze** (§12) | Any new structural architecture program |

**Rule:** The platform **no longer organizes only modules**. It organizes a **complete digital organization**. Every asset, process, capability, and intelligence signal is scoped to the Enterprise Organization. **This is the last structural architecture mission** — after D-066 acceptance, the platform enters **continuous implementation phase** (Program 3.7+).

**Relationship to Business Object Model (D-057):** The **Enterprise Organization** is the **root Business Object** (`organization.enterprise`). All organizational entities and platform assets attach to this organism via `part_of`, `owned_by`, and `operated_by` relationships.

---

## 1. Purpose

The **Enterprise Digital Organization** is the canonical model of the company as a **living digital organism** on MAK Gestão — structure, behavior, memory, evolution, and intelligence unified under one organizational SSOT.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ENTERPRISE DIGITAL ORGANIZATION ◄── THIS DOCUMENT (Program 3.6.9)           │
│  Departments · Teams · Roles · Processes · Capabilities · Goals · DNA        │
├─────────────────────────────────────────────────────────────────────────────┤
│  INTENT-DRIVEN AUTHORING STACK                                               │
│  Business Language (D-065) → Intent (D-059) → Resolver (D-064) → Derivation │
├─────────────────────────────────────────────────────────────────────────────┤
│  BUSINESS ASSETS · STUDIO · MDP · RUNTIME                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  INTELLIGENCE LAYER (observes & improves the organism)                       │
│  DNA · Memory · Knowledge Graph · Process Mining · Consulting · Decision ·   │
│  Evolution                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Binding principle:** MAK Gestão is an **Enterprise Operating System** (D-057, D-060) — not a traditional ERP organized by modules alone. The **organization is the primary organizing principle**; modules are runtime configurations within organizational context.

---

## 2. Mandatory organization principles (Program 3.6.9)

| # | Principle | Rule |
|---|-----------|------|
| **EO-1** | Organization as organism | Enterprise is a unified digital organism — not a bag of modules |
| **EO-2** | Root Business Object | Enterprise Organization is official `organization.enterprise` Business Object |
| **EO-3** | Everything belongs to org | Every asset, process, workflow, dashboard, automation scoped to org structure |
| **EO-4** | Capabilities not modules | Business Capabilities assigned to org units — not module features |
| **EO-5** | Shared responsibility | Responsibilities explicit via matrix — never implicit in code |
| **EO-6** | Intelligence on organization | All intelligence operates on organizational graph — not isolated modules |
| **EO-7** | Memory is enterprise-owned | Enterprise Memory represents the organization over time (D-060 EOS-18) |
| **EO-8** | DNA is organizational identity | Business DNA is the operational fingerprint of the organization |
| **EO-9** | Process ownership | Every process belongs to a Business Unit / Department |
| **EO-10** | Governance explicit | Policies, compliance, approvals bound to org structure |
| **EO-11** | Evolution tracked | Organizational change versioned and observable |
| **EO-12** | Intent in org context | Business Intent authored within organizational context (D-059 + D-065) |
| **EO-13** | Derivation carries ownership | Every derivation includes organizational ownership metadata (D-063) |
| **EO-14** | No Foundation change | Organization model is L6 contract — implementation in future programs |
| **EO-15** | Decades-scale | Topology, identity, lifecycle designed for long-horizon enterprise evolution |

---

## 3. Permanent architectural concepts

### 3.1 Enterprise Organization

The **root digital organism** — one per tenant (or enterprise group). Official Business Object kind: `organization.enterprise`.

```typescript
// Conceptual — not implementation code
EnterpriseOrganization {
  schemaVersion: "mak-enterprise-organization-v1"
  organizationId: string              // immutable root id
  tenantId: string
  displayName: string                   // legal / trade name
  organizationalIdentity: OrganizationalIdentity  // §3.30
  topology: EnterpriseTopology          // §3.28
  lifecycle: OrganizationalLifecycle    // §3.32
  metadata: OrganizationalMetadata      // §3.29
  versioning: OrganizationalVersioning    // §3.31
  dnaRef?: BusinessDnaRef               // link to Business DNA snapshot
}
```

**Version constant:** `mak-enterprise-organization-v1`

### 3.2 Business Organization

The **business-facing view** of the enterprise — how leaders and users perceive structure, goals, and ownership. Subset of Enterprise Organization surfaced in experience layer (no technical ids exposed).

| Facet | Content |
|-------|---------|
| Structure | Departments, units, teams |
| Strategy | Goals, objectives, KPIs |
| Operations | Processes, capabilities in use |
| Governance | Policies, compliance, approvals |

### 3.3 Departments

Organizational **divisions** — Finance, Sales, Operations, HR, IT, etc.

| Field | Purpose |
|-------|---------|
| `departmentId` | Stable identifier |
| `parentId` | Hierarchy parent (Business Unit or Enterprise root) |
| `headRoleId` | Department head role |
| `capabilities` | Capabilities primarily exercised here |

**Business Object kind:** `organization.department`

### 3.4 Teams

**Working groups** within departments — cross-functional or specialized.

| Field | Purpose |
|-------|---------|
| `teamId` | Stable identifier |
| `departmentId` | Primary department |
| `members` | Role assignments |
| `purpose` | Business purpose statement |

**Business Object kind:** `organization.team`

### 3.5 Roles

**Organizational roles** — not system RBAC accounts alone. Business meaning: "Gerente Comercial", "Analista Financeiro", "Aprovador Nível 2".

| Field | Purpose |
|-------|---------|
| `roleId` | Stable identifier |
| `roleName` | Business label |
| `responsibilities` | Responsibility refs (§3.6) |
| `decisionAuthority` | Decision chain level |

**Rule:** Platform RBAC maps to organizational Roles — Roles are SSOT for business responsibility.

**Business Object kind:** `organization.role`

### 3.6 Responsibilities

Explicit **accountability assignments** — what each role/unit is responsible for.

| Attribute | Description |
|-----------|-------------|
| `responsibilityId` | Stable id |
| `scope` | Process, capability, asset, or goal |
| `accountableParty` | Role or org unit |
| `type` | `owner` \| `operator` \| `approver` \| `informed` |

**Version constant:** `mak-organizational-responsibility-v1`

### 3.7 Business Units

**Semi-autonomous divisions** — subsidiaries, branches, product lines, regions.

| Field | Purpose |
|-------|---------|
| `businessUnitId` | Stable identifier |
| `parentOrganizationId` | Enterprise root or parent BU |
| `autonomyLevel` | Centralized vs federated governance |
| `localPolicies` | Unit-specific policy overrides |

**Business Object kind:** `organization.business_unit`

### 3.8 Processes

**Business processes** owned by the organization — not technical workflow definitions alone.

| Field | Purpose |
|-------|---------|
| `processId` | Stable identifier |
| `ownerUnitId` | Owning Business Unit / Department |
| `capabilities` | Capabilities invoked |
| `workflowDerivationIds` | Linked workflow derivations (D-063) |
| `intentIds` | Originating Business Intents (D-059) |

**Rule:** Processes belong to organization first; workflow artifacts are derivations.

**Business Object kind:** `organization.process`

### 3.9 Capabilities

[Business Capabilities](./MAK-BUSINESS-CAPABILITIES.md) **assigned to organizational units** — who exercises what the business can do.

| Assignment | Example |
|------------|---------|
| Department → Capability | Finance owns **Validação** and **Aprovação** |
| Unit → Capability | Branch exercises **Integração** locally |
| Role → Capability | Approver role exercises **Aprovação** |

Capabilities remain business-owned (D-057) — organization defines **who** exercises them.

### 3.10 Policies

**Organizational governance rules** — approval thresholds, segregation of duties, data handling, retention.

| Policy type | Scope |
|-------------|-------|
| `approval` | Who approves what by value/risk |
| `segregation` | Author ≠ approver rules |
| `compliance` | Regulatory bindings |
| `operational` | SLAs, escalation |

**Version constant:** `mak-organizational-policy-set-v1`

### 3.11 Knowledge

Organizational **knowledge assets** — playbooks, SOPs, regulations, vocabulary — linked to [Knowledge Architecture](./MAK-KNOWLEDGE-ARCHITECTURE.md).

| Binding | Rule |
|---------|------|
| Department | Domain knowledge scope |
| Process | Process playbooks |
| Role | Role-specific guidance |
| Enterprise | Enterprise-wide vocabulary |

### 3.12 Goals

**Strategic enterprise goals** — multi-year direction.

| Field | Purpose |
|-------|---------|
| `goalId` | Stable identifier |
| `ownerUnitId` | Accountable unit |
| `timeHorizon` | Strategic period |
| `linkedObjectives` | Child objectives (§3.13) |

**Business Object kind:** `organization.goal`

### 3.13 Objectives

**Tactical objectives** — measurable steps toward goals.

| Field | Purpose |
|-------|---------|
| `objectiveId` | Stable identifier |
| `parentGoalId` | Strategic goal |
| `ownerRoleId` | Accountable role |
| `targetDate` | Expected achievement |

Objectives may originate as **Business Intent** (category: Objective) via Business Language (D-065).

### 3.14 KPIs

**Key Performance Indicators** — organizational health metrics.

| Field | Purpose |
|-------|---------|
| `kpiId` | Stable identifier |
| `ownerUnitId` | Reporting unit |
| `metricRef` | Underlying metric (§3.15) |
| `target` | Business target value |

Dashboard and indicator derivations link to KPIs — dashboards **belong to organization** via KPI ownership.

### 3.15 Metrics

**Measurable quantities** — raw or computed — feeding KPIs and Intelligence.

| Source | Example |
|--------|---------|
| Operational | Order volume, approval time |
| Derived | Commission total (from Resolver derivations) |
| Intelligence | Health score components |

### 3.16 Resources

**Organizational resources** — people (roles), systems, budgets, assets under management.

| Resource type | Organizational binding |
|---------------|------------------------|
| Human | Roles + Teams |
| System | Integration assets |
| Financial | Business Unit budget refs |
| Physical | Asset registry (future) |

### 3.17 Assets

All **Business Assets** (D-057, D-063) carry **organizational ownership**:

| Asset type | Org binding |
|------------|-------------|
| Workflow derivation | `ownerUnitId` + `processId` |
| Dashboard derivation | `ownerUnitId` + `kpiId` |
| Formula derivation | `ownerUnitId` + domain |
| Integration | `ownerUnitId` |

**Rule:** Asset without organizational owner is **invalid** for publish.

### 3.18 Risks

**Organizational risks** — operational, compliance, strategic.

| Field | Purpose |
|-------|---------|
| `riskId` | Stable identifier |
| `ownerRoleId` | Risk owner |
| `affectedUnits` | Impacted org scope |
| `mitigationProcessId` | Linked process |

Intelligence layer surfaces risk signals — organization model stores accountability.

### 3.19 Compliance

**Regulatory and internal compliance** bindings on organizational structure.

| Dimension | Rule |
|-----------|------|
| Jurisdiction | Business Unit / region |
| Regulation | Policy set attachment |
| Audit scope | Department + process |
| Evidence | Enterprise Memory + audit trail |

### 3.20 Approvals

**Organizational approval chains** — who approves Intents, processes, policy changes, high-risk derivations.

| Level | Typical binding |
|-------|-----------------|
| Intent approval | Role + Department (D-059 Review) |
| Process change | Process owner + policy |
| Derivation publish | Organizational policy (D-063) |

Integrates with Decision Chains (§3.21).

### 3.21 Decision Chains

**Ordered decision authority** for organizational choices.

```
Request → Team Lead → Department Head → Business Unit Director → Enterprise
```

| Field | Purpose |
|-------|---------|
| `chainId` | Stable identifier |
| `trigger` | Amount threshold, risk class, capability |
| `steps` | Ordered role assignments |
| `escalation` | Timeout / override rules |

Feeds [Decision Intelligence Architecture](./MAK-DECISION-INTELLIGENCE-ARCHITECTURE.md).

### 3.22 Organizational Relationships

Graph of **structural and operational links** between org entities.

| Relationship | Example |
|--------------|---------|
| `part_of` | Team part of Department |
| `reports_to` | Role reports to Role |
| `owns` | Unit owns Process |
| `serves` | IT Department serves Business Units |
| `collaborates_with` | Sales ↔ Finance on credit approval |

**Version constant:** `mak-organizational-relationship-graph-v1`

### 3.23 Operational Networks

**Dynamic collaboration patterns** — who actually works with whom (observed, not only org chart).

| Source | Signal |
|--------|--------|
| Process Mining | Handoff frequency between units |
| Workflow Memory | Cross-department paths |
| Communication Flows (§3.24) | Message/notification patterns |

Distinct from static org chart — represents **how work really flows**.

### 3.24 Communication Flows

**Information and notification paths** across the organization.

| Flow type | Example |
|-----------|---------|
| Approval notification | Finance → Manager |
| Escalation | SLA breach → Director |
| Insight delivery | Intelligence → Process owner |
| Intent confirmation | Author → Approver |

Bound to Roles and Decision Chains — not ad-hoc module events.

### 3.25 Responsibility Matrix

**RACI-style matrix** — explicit mapping of Responsible, Accountable, Consulted, Informed per scope.

| Scope | Matrix applies to |
|-------|-------------------|
| Process | Each process step |
| Capability | Each capability exercise |
| KPI | Each indicator |
| Intent category | Each Intent type |

**Version constant:** `mak-responsibility-matrix-v1`

**Rule:** Shared responsibilities are **never implicit** — matrix is mandatory for certified processes.

### 3.26 Business Ownership

Every platform artifact has **business ownership** — not module ownership.

| Ownership field | Meaning |
|-----------------|---------|
| `businessOwnerRoleId` | Accountable business role |
| `ownerUnitId` | Owning Business Unit |
| `stewardRoleId` | Day-to-day maintainer |

Aligns with EOS-8 (D-060): assets belong to business, not screens.

### 3.27 Organizational Evolution

**Tracked change** of organizational structure and behavior over time.

| Event | Recorded |
|-------|----------|
| Reorg | Department merge/split |
| Role change | Responsibility shift |
| Process maturity | DNA facet change |
| Policy update | Compliance revision |

Feeds [Evolution Engine](./MAK-EVOLUTION-ENGINE-ARCHITECTURE.md).

### 3.28 Enterprise Topology

**Structural map** of the entire organization — graph of all org entities and relationships.

```
Enterprise Organization (root)
├── Business Unit A
│   ├── Department Sales
│   │   ├── Team Inside Sales
│   │   └── Team Field Sales
│   └── Department Marketing
└── Business Unit B
    └── ...
```

| Topology facet | Content |
|----------------|---------|
| `hierarchy` | Parent-child tree |
| `matrix` | Cross-unit reporting lines |
| `network` | Operational networks (§3.23) |
| `capabilityMap` | Capability × Unit assignment |

**Version constant:** `mak-enterprise-topology-v1`

### 3.29 Organizational Metadata

Extensible metadata on org entities — search, governance, Intelligence hooks.

| Facet | Examples |
|-------|----------|
| `governance` | Policy attachments |
| `classification` | Sensitivity, region |
| `mining` | Process Mining event hooks |
| `health` | Unit health score refs |

### 3.30 Organizational Identity

**Who the organization is** — legal identity, culture narrative, Business DNA fingerprint link.

| Component | Source |
|-----------|--------|
| Legal identity | Tenant registration |
| Business Identity narrative | [Business DNA](./MAK-BUSINESS-DNA-ARCHITECTURE.md) §3.1 |
| Enterprise Fingerprint | DNA snapshot |
| Maturity stage | DNA maturity evolution |

**Version constant:** `mak-organizational-identity-v1`

### 3.31 Organizational Versioning

| Mechanism | Rule |
|-----------|------|
| `orgRevision` | Monotonic on topology/policy change |
| `effectiveDate` | When reorg takes effect |
| `semver` | Schema migrations via Decision |
| Pinning | Published assets pin org revision at publish |

Reorganizations trigger impact analysis on processes, derivations, and responsibilities.

### 3.32 Organizational Lifecycle

| Stage | Description |
|-------|-------------|
| **Design** | Org model drafted |
| **Validate** | Matrix complete, no orphan processes |
| **Activate** | Topology live for authoring |
| **Operate** | Intelligence observes |
| **Evolve** | Reorg, maturity growth |
| **Audit** | Compliance review |
| **Archive** | Retired units — lineage preserved |

---

## 4. Official organizational policies

### 4.1 How departments relate

| Relationship type | Rule |
|-------------------|------|
| **Hierarchy** | Department `part_of` Business Unit or Enterprise root |
| **Matrix** | Secondary `reports_to` for cross-functional alignment |
| **Service** | Support departments `serve` operational units |
| **Collaboration** | `collaborates_with` for defined process handoffs |
| **Capability scope** | Department primary owner of assigned capabilities |

Changes propagate via Organizational Evolution (§3.27) with versioned topology.

### 4.2 How responsibilities are shared

| Mechanism | Rule |
|-----------|------|
| **Responsibility Matrix** | RACI mandatory for certified processes |
| **Single accountability** | Exactly one Accountable per scope |
| **Multiple responsible** | Many Responsible allowed; Accountable is one |
| **Decision Chains** | Escalation when Accountable unavailable |
| **Intent binding** | Intent `businessOwner` maps to organizational Role |

Shared responsibility without matrix entry is **architecturally invalid**.

### 4.3 How processes belong to the organization

| Binding | Field |
|---------|-------|
| Owner | `ownerUnitId` on Process |
| Steward | `stewardRoleId` |
| Intent origin | `intentIds[]` |
| Workflow artifact | `workflowDerivationIds[]` — derivations, not ownership |
| Mining | Process Mining observes instances scoped to `processId` + org unit |

Process **ownership** is organizational; workflow **implementation** is derivation (D-063).

### 4.4 How workflows belong to the organization

| Layer | Ownership |
|-------|-----------|
| Business process | Organization Process entity |
| Workflow derivation | `ownerUnitId`, `processId`, `businessOwnerRoleId` on metadata |
| Runtime execution | Scoped to tenant + org context |
| Process Mining | Attributes executions to org units via process binding |

Workflows never belong to modules — they belong to **organizational processes**.

### 4.5 How dashboards belong to the organization

| Binding | Rule |
|---------|------|
| KPI ownership | Dashboard serves `kpiId` owned by unit |
| Audience | Roles / Departments as viewers |
| Indicator derivations | Link to org-scoped KPIs |
| Intelligence | Health and insight dashboards scoped to topology |

### 4.6 How automations belong to the organization

| Binding | Rule |
|---------|------|
| Process | Automation serves organizational process |
| Owner unit | `ownerUnitId` on automation derivation |
| Policy | Approval for high-impact automations |
| Automation Memory | Scoped to org unit (D-060 Enterprise Memory) |

### 4.7 How IA learns from the organization

| Learning source | Organizational scope |
|-----------------|------------------------|
| Enterprise Memory | Whole organism |
| Process Mining | Process × Unit patterns |
| Operational Networks | Collaboration clusters |
| Decision Memory | Decision chains by role |
| DNA facets | Organizational, Process, Decision DNA |

**Permanent rule (D-060 EOS-17, D-065 BL-9):** AI learns from **organizational signals** to assist — never replaces organizational authority; platform operates fully without AI.

### 4.8 How Business DNA represents the organization

[Business DNA](./MAK-BUSINESS-DNA-ARCHITECTURE.md) **Organizational DNA facet** captures structure, delegation depth, approval patterns — derived from org topology + Workflow Memory + Process Mining.

| DNA facet | Organizational source |
|-----------|-------------------------|
| Organizational DNA | Topology + Decision Chains |
| Process DNA | Process entities + Mining |
| Decision DNA | Decision Chains + Decision Memory |
| Capability DNA | Capability × Unit usage |

Enterprise Fingerprint = organizational identity snapshot (§3.30).

### 4.9 How Enterprise Memory represents the organization

[Enterprise Memory](./MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md) is the **longitudinal memory of the organism**:

| Memory type | Organizational lens |
|-------------|---------------------|
| Enterprise Memory | Whole organization over time |
| Business Memory | Per capability / domain within org |
| Workflow Memory | Per process / unit |
| Decision Memory | Per decision chain / role |

All memory records carry `organizationId`, `unitId`, `processId` where applicable.

### 4.10 How Knowledge Graph represents the organization

[Knowledge Architecture](./MAK-KNOWLEDGE-ARCHITECTURE.md) Knowledge Graph nodes include **organizational entities**:

| Node type | Example |
|-----------|---------|
| Org unit | Department, Team |
| Process | Linked to org owner |
| Capability | Assigned to unit |
| Intent | Authored in org context |
| Vocabulary term | Domain-owned by department |

Edges: `part_of`, `owns`, `exercises`, `documents`, `governs`.

### 4.11 How Process Mining observes the organization

[Process Mining](./MAK-PROCESS-MINING-ARCHITECTURE.md) discovers **actual flows** against **defined topology**:

| Observation | Organizational output |
|-------------|----------------------|
| Variant paths | Operational Network update |
| Bottlenecks | Unit health signal |
| Rework loops | Process DNA degradation |
| Conformance | Deviation from owned process |

Mining **never** attributes to modules — attributes to **organizational processes and units**.

### 4.12 How Consulting Engine improves the organization

[Consulting Engine](./MAK-CONSULTING-ENGINE-ARCHITECTURE.md) recommendations scoped to:

| Scope | Improvement type |
|-------|------------------|
| Process | Bottleneck remediation |
| Unit | Capacity rebalancing |
| Capability | Coverage gaps |
| Organization | Reorg suggestions (human-approved) |

Recommendations reference Responsibility Matrix and DNA — presented in business language.

### 4.13 How Decision Engine assists the organization

[Decision Intelligence](./MAK-DECISION-INTELLIGENCE-ARCHITECTURE.md) uses Decision Chains + organizational context:

| Input | Output |
|-------|--------|
| Pending approval | Next approver in chain |
| Scenario | Impact on units / KPIs |
| Risk | Compliance flag |

Assists — does not override organizational authority.

### 4.14 How Evolution Engine tracks the organization

[Evolution Engine](./MAK-EVOLUTION-ENGINE-ARCHITECTURE.md) measures **organism maturity** over time:

| Signal | Source |
|--------|--------|
| Structure evolution | Organizational Versioning |
| Process maturity | Process DNA |
| Automation coverage | Automation DNA |
| Health trend | Business Health Architecture |
| Intent adoption | Intent Library growth by unit |

---

## 5. Full platform stack (post D-066)

```
Enterprise Digital Organization (D-066)     ← organism / root context
        ↓
Business Language (D-065)
        ↓
Business Intent (D-059)
        ↓
Business Intent Resolver (D-064)
        ↓
Business Derivation (D-063)
        ↓
Business Assets
        ↓
Studio → MDP → Runtime

Intelligence layer (parallel observation & improvement):
DNA · Memory · Knowledge Graph · Process Mining · Consulting · Decision · Evolution
        ↕ (reads/writes organizational graph)
Enterprise Digital Organization
```

---

## 6. Integration contracts

| Component | Integration |
|-----------|-------------|
| **Business Object Model** (D-057) | Organization entities are Business Objects; Enterprise Organization is root kind |
| **Business Language** (D-065) | Authoring context includes org unit, role, department |
| **Business Intent** (D-059) | Intent scoped to org; approval uses Decision Chains |
| **Business Capability** (D-057) | Assigned to org units and roles |
| **Business Derivation** (D-063) | Mandatory organizational ownership metadata |
| **Intent Resolver** (D-064) | Resolves within org capability license scope |
| **Foundation** | Unchanged — org model is L6 overlay |
| **MDP** | Entities remain data layer; org is governance overlay |
| **Intelligence docs** (D-060) | All consume organizational graph |

---

## 7. Document authority map

| Topic | SSOT |
|-------|------|
| **Enterprise Digital Organization** | **This document** (D-066) |
| Business Object universal model | [MAK-BUSINESS-OBJECT-MODEL.md](./MAK-BUSINESS-OBJECT-MODEL.md) |
| Business DNA / fingerprint | [MAK-BUSINESS-DNA-ARCHITECTURE.md](./MAK-BUSINESS-DNA-ARCHITECTURE.md) |
| Enterprise Memory | [MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md](./MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md) |
| Knowledge / Vocabulary | [MAK-KNOWLEDGE-ARCHITECTURE.md](./MAK-KNOWLEDGE-ARCHITECTURE.md) |
| EOS principles | [MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md](./MAK-ENTERPRISE-OPERATING-SYSTEM-PRINCIPLES.md) |
| Intent-driven stack | Language → Intent → Resolver → Derivation docs |

---

## 8. Identified risks (Program 3.6.9)

| Risk | Mitigation | Residual |
|------|------------|----------|
| Overlap with Business Object Model | Enterprise Organization = root `organization.enterprise` kind | Low |
| HR system duplication | Org model is platform SSOT; HR integration is future adapter | Medium — impl phase |
| Module-centric legacy | EO-1 explicit; modules remain runtime config under org | Medium — migration in impl |
| Intelligence without org scope | EO-6 mandates org-scoped intelligence | Low |
| Reorg impact on derivations | Organizational Versioning + impact analysis policy | Medium — impl in 3.7+ |

**No blocking conflict** with Intent, Capability, Derivation, or Foundation.

---

## 9. Final structural architecture declaration (Program 3.6.9)

Upon acceptance of **D-066**, **all structural architecture for the Intent-driven Enterprise Operating System is complete**:

| Program | Architecture | Decision |
|---------|--------------|----------|
| 3.4 | Business Intent Authoring | D-059 |
| 3.6 | Business Derivation | D-063 |
| 3.6.5 | Business Intent Resolver | D-064 |
| 3.6.8 | Business Language | D-065 |
| **3.6.9** | **Enterprise Digital Organization** | **D-066** |

**Permanent rule (D-066):** **No new structural architecture** shall be created. The platform enters **continuous implementation phase** beginning with **Program 3.7 — Business Intent Resolver Implementation** (G304).

Vision documents (D-057, D-060) remain directional references — not new structural architecture programs.

---

## 10. Certification (Program 3.6.9)

| # | Question | Answer |
|---|----------|--------|
| 1 | A organização tornou-se um Business Object oficial? | **SIM** — `organization.enterprise` root Business Object (EO-2) |
| 2 | Existe conflito com Business Intent? | **NÃO** — Intent scoped to org context |
| 3 | Existe conflito com Business Capability? | **NÃO** — capabilities assigned to org units |
| 4 | Existe conflito com Business Derivation? | **NÃO** — derivations carry org ownership metadata |
| 5 | Existe conflito com Foundation? | **NÃO** — L6 overlay; no Foundation changes |
| 6 | Toda a plataforma passa a representar uma organização completa? | **SIM** — EO-1 organism model |
| 7 | Toda inteligência passa a operar sobre a organização? | **SIM** — EO-6; §4.7–§4.14 |
| 8 | MAK deixa de ser ERP tradicional → Enterprise Operating System? | **SIM** — extends D-057/D-060 officially |
| 9 | A arquitetura fica preparada para décadas de evolução? | **SIM** — versioning, topology, lifecycle, evolution |
| 10 | Após esta missão nenhuma nova arquitetura estrutural será necessária? | **SIM** — §9 final freeze; continuous implementation only |

---

*Amendments require Decision + ENGINEERING-JOURNAL entry. Next phase: **Continuous Implementation** — Program 3.7 (G304) and beyond.*
