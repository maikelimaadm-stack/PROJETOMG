# MAK Product Identity — Official Freeze

**Status:** Official — **FROZEN** — No open product-identity decisions permitted after this document  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.8.8 — Product Identity Freeze  
**Decision:** D-074  
**Supersedes:** Ambiguous "transition/roadmap/later" language for identity topics in audit registers  
**Authority:** Highest product-identity SSOT — subordinate only to [Constitution](../constitution/00-MAK-CONSTITUTION.md) for Foundation freeze; supersedes derived audit language on identity

> **Certification:** After D-074, **the definitive identity of MAK is officially frozen.**

---

## 1. Frozen product identity (single statement)

**MAK is a Business Operating System (Enterprise Operating System) — a metadata-driven platform where business users administer objectives, capabilities, assets, and operations in business language, without configuring software modules.**

| MAK is | MAK is not (product positioning) |
|--------|----------------------------------|
| Enterprise Operating System | Traditional module-centric ERP |
| Business Operating System | Low-code IDE |
| Business Platform | Generic no-code tool |
| Sistema operacional empresarial | Framework for developers (Foundation/Studio are internal) |

**Constitution harmonization:** Constitution describes **technical foundation** (metadata-driven platform + cadastro runtime). This document describes **product identity**. Both apply — no conflict (D-073 §2).

---

## 2. Frozen experience principles (permanent)

| # | Principle | Frozen rule |
|---|-----------|-------------|
| P-01 | User administers **business**, not modules | Capability/asset home — never module menu as identity |
| P-02 | **Business First** is default authoring | Always |
| P-03 | **Expert Mode** is controlled exception | Business vocabulary only — never Studio designers for business users |
| P-04 | **Technology Transparency** | User never sees formulas, AST, JSON, SQL, engines, Runtime |
| P-05 | **Business Asset First** | All user-created artifacts are tenant-owned Business Assets |
| P-06 | **Intent First** | All authoring converges Business Language → Intent → Resolver → Asset |
| P-07 | **Human approval** | All critical automation, Intelligence, and Resolver invocations |
| P-08 | **Enterprise-owned Memory/Knowledge** | Never model-owned; tenant-scoped |
| P-09 | **AI accelerates, never replaces** | Outputs = Intent candidates + explainability |
| P-10 | **ModeloBase1** | Permanent Runtime cadastro **template** — never product face |

---

## 3. Master concept matrix

| Conceito | Identidade permanente | Arquitetura | Implementação | Status | Nota |
|----------|----------------------|-------------|---------------|--------|------|
| **Business Operating Shell (BOS)** | **SIM** — primary user surface | ✅ Congelada D-074 | Pendente UI | **Correto** | 10 |
| **Product Identity (EOS/BOS)** | **SIM** | ✅ Congelada D-074 | Comunicação/market | **Correto** | 10 |
| **Business First** | **SIM** — default authoring | ✅ BAAP + D-074 | Pendente UI | **Correto** | 10 |
| **Expert Mode** | **SIM** — exception only | ✅ D-074 + Expert boundary | Pendente UI | **Correto** | 10 |
| **Dual Authoring** | **SIM** | ✅ BAAP-1 frozen | Pendente UI | **Correto** | 10 |
| **Business Language** | **SIM** — sole business authoring language | ✅ D-065 frozen | Pendente UI | **Correto** | 10 |
| **Business Intent** | **SIM** | ✅ D-059 frozen | Resolver ✅ | **Correto** | 10 |
| **Intent Resolver** | **SIM** (invisible to user) | ✅ D-064/D-067 frozen | G305 ✅ | **Correto** | 10 |
| **Business Assets** | **SIM** — unit of business value | ✅ D-068 frozen | 1/N coded | **Correto** | 10 |
| **Capability Navigation** | **SIM** | ✅ D-074 | Pendente UI | **Correto** | 10 |
| **Platform Home** | **SIM** — BOS Objectives/Capabilities/Assets | ✅ D-074 | Legacy module menu = **not identity** | **Correto** | 10 |
| **ModeloBase1** | **NÃO** (identity) — **SIM** (Runtime template) | ✅ D-017 frozen forever | ✅ Production | **Correto** | 10 |
| **Formula Builder** | **NÃO** — platform engineering only | ✅ G303A frozen platform scope | ✅ Exists — **wrong audience today** | **Identidade congelada; UX legacy** | 10 identity / 4 impl |
| **MAK Studios** | **NÃO** (identity) — platform infrastructure | ✅ D-052 frozen | ✅ G262–G306 | **Correto** | 10 |
| **Runtime** | **NÃO** (invisible) | ✅ Bridge D-030 | Parcial | **Correto** | 10 |
| **Technical Projection** | **NÃO** (invisible) | ✅ BAAP pipeline | Parcial | **Correto** | 10 |
| **IA / AI Platform** | **SIM** — accelerator | ✅ D-057/D-060 frozen | Pendente | **Correto** | 10 |
| **Marketplace** | **SIM** — asset distribution | ✅ L6 vision frozen | Pendente | **Correto** | 10 |
| **Enterprise Memory** | **SIM** | ✅ D-060 frozen | Pendente | **Correto** | 10 |
| **Knowledge / Knowledge Graph** | **SIM** | ✅ D-057 frozen | Pendente | **Correto** | 10 |
| **Process Mining** | **SIM** | ✅ D-060 frozen | Pendente | **Correto** | 10 |
| **Consulting Engine** | **SIM** | ✅ D-060 frozen | Pendente | **Correto** | 10 |
| **Decision Engine** | **SIM** | ✅ D-060 frozen | Pendente | **Correto** | 10 |
| **Evolution Engine** | **SIM** | ✅ D-060 frozen | Pendente | **Correto** | 10 |
| **Business Health** | **SIM** | ✅ D-060 frozen | Pendente | **Correto** | 10 |
| **Business DNA** | **SIM** | ✅ D-060 frozen | Pendente | **Correto** | 10 |
| **Dashboards (Business)** | **SIM** — KPI assets | ✅ BOM frozen | Pendente | **Correto** | 10 |
| **Automations (Business)** | **SIM** | ✅ BOM frozen | Pendente | **Correto** | 10 |
| **Workflows (Business)** | **SIM** | ✅ BOM frozen | Pendente | **Correto** | 10 |
| **Integrations (Business)** | **SIM** | ✅ BOM frozen | Pendente | **Correto** | 10 |
| **Computed Fields (Business)** | **SIM** | ✅ D-068/G306 frozen | Studio ✅ / Runtime partial | **Correto** | 10 |
| **Domain Event Bus** | **SIM** (Intelligence identity prerequisite) | ✅ **D-074 frozen** | Pendente | **Correto** | 10 |
| **Module menu (Cadastro/Empresas)** | **NÃO** — legacy UX only | N/A | ✅ Exists | **Not product identity** | N/A |
| **CADCPS admin UI** | **NÃO** — interim until Field Asset UI | N/A | ✅ Exists | **Legacy admin path** | N/A |

---

## 4. Dependency chain matrix (frozen — no breaks)

```
Business Language          [FROZEN D-065] ──identity──► user surface
        ↓
Business Intent            [FROZEN D-059] ──impl──► G305 ✅
        ↓
Intent Resolver            [FROZEN D-064] ──impl──► G305 ✅
        ↓
Business Asset             [FROZEN D-068] ──impl──► G306 ✅ (Computed Field); others pending
        ↓
Technical Projection       [FROZEN BAAP]  ──impl──► partial
        ↓
Runtime (invisible)        [FROZEN D-030] ──impl──► Bridge partial
        ↓
Domain Events              [FROZEN D-074] ──impl──► pending — **no identity break**
        ↓
Enterprise Memory          [FROZEN D-060] ──impl──► pending
        ↓
Knowledge Graph            [FROZEN D-057] ──impl──► pending
        ↓
Process Mining             [FROZEN D-060] ──impl──► pending
        ↓
Consulting Engine          [FROZEN D-060] ──impl──► pending
        ↓
Decision Engine            [FROZEN D-060] ──impl──► pending
        ↓
Evolution Engine           [FROZEN D-060] ──impl──► pending
        ↓
Business Health            [FROZEN D-060] ──impl──► pending
```

**Chain integrity:** ✅ **No architectural break.** Implementation gaps do not invalidate identity.

---

## 5. User experience matrix (frozen target)

| Persona | Enxerga EOS/BOS quando completo? | Hoje | Decisão congelada |
|---------|----------------------------------|------|-------------------|
| **Empresário / Owner** | **SIM** — Objectives, Health, Consulting | ERP menu | BOS home frozen |
| **Supervisor operacional** | **SIM** — Operations queues | Cadastro screens | Operations via capabilities |
| **Financeiro** | **SIM** — Indicators, dashboards, decisions | Module forms | Business Assets |
| **RH** | **SIM** — Processes, workflows | Module forms | Workflow assets |
| **Agro** | **SIM** — DNA templates, seasonal ops | Generic ERP | DNA + templates frozen |
| **Compras** | **SIM** — Automations, approvals | Manual + CADCPS | Intent-first frozen |
| **Produção** | **SIM** — Mining, bottlenecks | Reports only later | Mining identity frozen |
| **Administrador tenant** | **SIM** — Capabilities, assets, policies | CADCPS + Studio | Expert boundary frozen |
| **Consultor interno** | **SIM** — Health, Evolution plans | N/A | Consulting frozen |
| **Parceiro Marketplace** | **SIM** — Asset packages | N/A | Marketplace frozen |

**Today:** personas see **legacy ERP UX** — **explicitly NOT product identity** (D-074). **Target identity frozen.**

---

## 6. Identity positioning matrix

| Label | Transmite hoje (UX legacy) | Transmitirá quando completo (FROZEN) |
|-------|---------------------------|--------------------------------------|
| ERP | **Sim** (legacy surface) | **Não** (positioning) |
| Low Code | Parcial (Studio visible) | **Não** |
| No Code | Não | **Parcial** (business language, not generic no-code) |
| Framework | Interno only | **Não** (user-facing) |
| Plataforma | Sim (vago) | **Sim** (Business Platform) |
| Enterprise Operating System | Não (feel) | **SIM — primary** |
| Sistema operacional empresarial | Não (feel) | **SIM — primary (PT)** |
| Business Platform | Parcial | **SIM** |
| Business Operating System | Não (feel) | **SIM — primary UX name** |

**Frozen market identity:** **Enterprise Operating System / Business Operating System (BOS)**.

---

## 7. Per-concept certification (10 questions) — summary

All listed concepts in §3: **(1) Identity permanent?** as matrix · **(2) Implementation only?** gaps noted · **(3) Frozen?** **YES** after D-074 · **(4) Alter?** **NO** identity · **(5) Document?** **DONE** this doc · **(6) New Decision?** **D-074** · **(7) Implement as-is?** **YES** per frozen spec · **(8) Doc conflict?** **NONE** post-harmonization · **(9) EOS conflict?** **NONE** · **(10) Note:** 10 for identity architecture

---

## 8. Legacy UX (frozen classification — not open)

| Legacy surface | Product identity? | Frozen destination |
|----------------|-------------------|-------------------|
| Module menu `/Cadastro*` | **NO** | Replaced by BOS home |
| ModeloBase1 pages in user flow | **NO** (template render) | Reachable via Operations → Capability |
| Formula Builder for business users | **NO** | Block/redirect to Business Language |
| CADCPS field admin | **NO** (interim) | Field Business Asset Expert UI |
| campoEngine runtime path | **NO** (impl debt) | Unified projection evaluator |

**No open "transition" decisions.** Destination frozen. Implementation schedule is **not** identity.

---

## 9. Resume implementation gate

Implementation **may resume** when:

- [x] Product identity frozen (D-074 — this document)
- [x] All VA-01–08 resolved as decisions (VA-07 → D-074 §10)
- [x] BOS UI MVP (D-075, G307) — default route `/`
- [ ] Full Intelligence/Memory/Health backends — **next phases**

---

## 10. Domain Event Bus — frozen decision (VA-07 closed)

**D-074 binds:**

- Mandatory **tenant-scoped domain event bus** (L3 Platform Core)
- All Runtime mutations of Business significance emit events
- Memory, Mining, Consulting, Evolution **consume** — never bypass
- Human-governed retention; no cross-tenant leakage
- Implementation technology = engineering choice — **identity requirement frozen**

---

## Cross-references

| Document | Relationship |
|----------|--------------|
| [MAK-PRODUCT-IDENTITY.md](./MAK-PRODUCT-IDENTITY.md) | Derived — defers to this freeze |
| [MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md](./MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md) | BOS spec |
| [EXPERT-MODE-AND-STUDIO-BOUNDARY.md](../engineering/EXPERT-MODE-AND-STUDIO-BOUNDARY.md) | Expert/Studio boundary |
| [PLATFORM-REMEDIATION-REGISTER.md](../engineering/PLATFORM-REMEDIATION-REGISTER.md) | Remediation — identity items closed |

---

*Program 3.8.8 complete. Identity frozen. No further product-identity decisions without Amendment Process + new D-number.*
