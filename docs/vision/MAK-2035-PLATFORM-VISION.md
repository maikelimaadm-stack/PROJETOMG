# MAK 2035 — Platform Vision

**Status:** Official — Permanent long-horizon vision  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.1.5 — MAK Enterprise Business Platform Vision  
**Decision:** D-057  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); **extends** [MAK 2035 Master Architecture](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) — does not replace layer topology

---

## ⚠️ Scope boundary

Registers the strategic pivot:

> **MAK Gestão ceases to be “an ERP” in positioning and architecture intent.**  
> **MAK becomes an Enterprise Operating System (EOS)** for metadata-driven businesses.

This is **vision and vocabulary** — not a rename mandate for code, modules, or deployments today.

---

## 1. Enterprise Operating System

| ERP mental model | EOS mental model |
|------------------|------------------|
| Modules own features | **Capabilities** own features |
| Screens are the product | **Business Objects** are the product |
| IT configures software | **Business authors** intent |
| Reports are add-ons | **Intelligence** is native |
| Integrations are projects | **Integrations** are reusable assets |
| AI is a chat sidebar | **AI accelerates** authoring (optional) |

The EOS provides: **authoring**, **execution**, **knowledge**, **decision**, **learning**, **marketplace**, and **twin simulation** on one metadata spine (MDP + CRB).

---

## 2. Universal platform pillars (2035 target)

| Pillar | Description | Architecture doc |
|--------|-------------|------------------|
| **Universal Business Objects** | One object model for all artifacts | [BOM](../architecture/MAK-BUSINESS-OBJECT-MODEL.md) |
| **Universal Automation** | Event → condition → action across modules | Master Architecture L5–L6 |
| **Universal Capabilities** | Business-level feature catalog | [Capabilities](../architecture/MAK-BUSINESS-CAPABILITIES.md) |
| **Business Intent Layer** | NL / visual → executable | [Intent](../architecture/MAK-BUSINESS-INTENT-ARCHITECTURE.md) |
| **Knowledge Platform** | Enterprise memory + graph | [Knowledge](../architecture/MAK-KNOWLEDGE-ARCHITECTURE.md) |
| **Decision Platform** | Rules, trees, policies | [Intelligence](../architecture/MAK-INTELLIGENCE-ARCHITECTURE.md) |
| **Learning Platform** | Mining, patterns, maturity | [Continuous Improvement](../architecture/MAK-CONTINUOUS-IMPROVEMENT-ARCHITECTURE.md) |
| **Digital Twin** | Simulate before production | [Twin](../architecture/MAK-DIGITAL-TWIN-ARCHITECTURE.md) |
| **Marketplace Intelligence** | Certified reusable assets | Master Architecture L6 |
| **Collaborative Intelligence** | Human + AI + audit | Intelligence §AI governance |

---

## 3. Autonomous business (horizon — not near-term)

Progressive autonomy **within governance**:

| Stage | Behavior |
|-------|----------|
| **Self Documentation** | Platform documents its own objects and flows |
| **Self Optimization** | Approved tuning from Improvement engine |
| **Autonomous Business** | Closed-loop execute only for pre-certified low-risk actions |

**Constitution constraint:** Human accountability and RBAC remain — autonomy is **scoped**, never tenant-crossing.

---

## 4. Multi-agent architecture (vision)

Future **specialized agents** (authoring, integration, audit, mining) coordinate via:

- Platform Core event bus
- Knowledge graph context
- Governance policies
- Human approval gates

Not implemented in Program 3.1.5. Does not mandate multi-agent for current Studio work.

---

## 5. Future Studios & Runtime

| Area | Direction |
|------|-----------|
| **Future Studios** | Dashboard, Workflow, Automation, Integration, AI Studio — all consume Computation + BOM |
| **Future Runtime** | CRB + capability dispatch + twin feedback loop |
| **Future AI** | RBAC-bound; proposes Intent; never silent production mutation |
| **Future Marketplace** | Business Object packages with capability manifests |

Current Studio programs (3.2 Formula Builder, 3.3 Computed Fields, …) **remain unchanged** — they are stepping stones on this vision.

---

## 6. Mandatory architectural principles (registered Program 3.1.5)

### 6.1 Business Asset Principle

Everything the user creates is a **reusable company asset**: automations, formulas, dashboards, workflows, reports, integrations, AI configs, indicators, validations, permissions. **Nothing belongs to a screen** — everything belongs to the **business**.

### 6.2 Business Capability Principle

Functionality belongs to **business capabilities**, never to modules.

### 6.3 Business First Principle

Every architectural decision must answer: *“How does this reduce manual work for the company?”*

### 6.4 Technology Transparency Principle

Technology never appears to the user. Complexity stays inside the system (engines, AST, IR, SQL).

### 6.5 AI Acceleration Principle

AI is never mandatory. Every feature works without AI. AI only accelerates construction and insight.

### 6.6 Universal Reuse Principle

Any automation, workflow, dashboard, formula, AI, integration, report, indicator, or validation **must be reusable** across compatible modules.

### 6.7 Business Intelligence Principle (vision)

The platform will identify — without external consulting — parallel spreadsheets, rework, bottlenecks, low productivity, repetitive processes, automation opportunities, training needs, operational risks, and strategic opportunities. **Registered as long-term capability**; not implemented in 3.1.5.

---

## 7. Compatibility with Master Architecture 2035

| Master Architecture element | Vision alignment |
|----------------------------|------------------|
| L0–L7 layer model | ✅ Unchanged |
| L2 Foundation frozen | ✅ Vision builds above |
| L4 MDP | ✅ Business Object + Knowledge source |
| L5 Studio | ✅ Authoring surface → Intent pipeline |
| L6 Marketplace, AI, Knowledge | ✅ Expanded by this vision |
| Dependency rules | ✅ No inversion |

---

## 8. Implementation posture

| Question | Answer |
|----------|--------|
| Does this mission implement EOS? | **No** — documentation only |
| Does it change current code? | **No** |
| Next implementation mission | **Program 3.3** Computed Fields (after 3.2 Formula Builder per roadmap) |

---

*Related: [MAK-2040 Vision Backlog](./MAK-2040-VISION-BACKLOG.md) (feature backlog) · [Platform Evolution](../architecture/MAK-PLATFORM-EVOLUTION.md)*
