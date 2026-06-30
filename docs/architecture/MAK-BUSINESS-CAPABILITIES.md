# MAK Business Capabilities

**Status:** Official — Permanent architecture reference (vision)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.1.5 — MAK Enterprise Business Platform Vision  
**Decision:** D-057  
**Principle:** **Business Capability Principle** — capabilities belong to the business, never to modules

---

## ⚠️ Scope boundary

Catalogs **what the business can do** independently of ERP modules. Does not remove or rename existing Foundation config engines (V13–V20) — defines **target ownership model** for convergence.

---

## 1. Purpose

Modules (empresas, cadcps, …) are **thin runtime configurations**. **Capabilities** are reusable business functions invoked by workflows, automations, Studio, and APIs:

> Approval, Notification, Validation, Integration, Signature, Scheduling, Communication, Audit, Permission, Calculation, Search, Publication, Versioning, Print, Export, Import, …

---

## 2. Capability definition (normative template)

Each **Business Capability** documents:

| Attribute | Description |
|-----------|-------------|
| **Ownership** | Business domain owner + platform steward |
| **Reuse** | Cross-module eligibility + compatibility matrix |
| **Dependencies** | Other capabilities, MDP types, Platform Core services |
| **Compatibility** | Min platform version, tenant tier |
| **Lifecycle** | experimental → certified → deprecated |
| **Marketplace** | Optional packaged extension |
| **Knowledge** | Playbooks, examples, vocabulary links |
| **AI Support** | Suggested configurations (opt-in) |

---

## 3. Official capability catalog (vision — initial set)

| Capability | Business meaning | Foundation anchor (today) |
|------------|------------------|---------------------------|
| **Aprovação** | Multi-step approval | Workflow V20 (Foundation) |
| **Notificação** | Alert users/channels | Actions / future bus |
| **Validação** | Data and business rules | Validation V16 |
| **Integração** | External system sync | Domain repos / future iPaaS |
| **Assinatura** | Legal e-sign | Future |
| **Agenda** | Scheduling | Future |
| **Comunicação** | Email, SMS, in-app | Future |
| **Auditoria** | Immutable audit trail | Platform Core (partial) |
| **Permissão** | RBAC enforcement | Auth + tenant |
| **Cálculo** | Derived values | Computation Engine |
| **Pesquisa** | Search / filter | Cadastro search |
| **Publicação** | MDP publish | MDP-5 |
| **Versionamento** | Pin and rollback | MDP-5 + CRB |
| **Impressão** | Print layouts | Future |
| **Exportação** | File export | Future |
| **Importação** | Bulk load | Future |

---

## 4. Rules

| # | Rule |
|---|------|
| **BC1** | UI modules do not **own** capabilities — they **consume** them |
| **BC2** | Studio configures capability **bindings** — not duplicate engines |
| **BC3** | Marketplace packages declare capability **extensions** only |
| **BC4** | Universal Reuse — certified capabilities work across compatible modules |

---

## 5. Mapping to Universal Reuse Principle

Automations, workflows, dashboards, formulas, integrations, validations, and permissions packaged as **Business Objects** with capability refs — publishable to any module meeting compatibility.

---

## 6. Current status

| Item | Status |
|------|--------|
| Business Capability registry (L6) | **Vision only** |
| Foundation V13–V20 engines | ✅ Frozen — semantic overlap intentional |
| Studio capability registry | ✅ Designer capabilities — not business capabilities yet |

---

*See [Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md) for Universal Capabilities.*
