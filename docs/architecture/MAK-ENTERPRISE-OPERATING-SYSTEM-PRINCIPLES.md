# MAK Enterprise Operating System Principles

**Status:** Official — Permanent platform principles  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.5A — Enterprise Intelligence Vision  
**Decision:** D-060  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); complements [Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md) and [Engineering Principles](./MAK-ENGINEERING-PRINCIPLES.md)

---

## ⚠️ Scope boundary (Program 3.5A)

| In scope | Out of scope |
|----------|--------------|
| Permanent EOS principles for decades-long evolution | Code, API, runtime, Foundation, Studio behavior |
| Binding vision for all future Intelligence programs | Roadmap or implementation sequence changes |
| Reference for governance and certification | Alteration of Business Intent, Computation, or Formula Builder contracts |

**Rule:** These principles **extend** D-057 vision. They **do not modify** any certified layer or implementation mission.

---

## 1. Purpose

This document is the **permanent north star** for MAK as an **Enterprise Operating System** — how the platform behaves toward business users, assets, intelligence, and evolution over decades.

All future programs (Intelligence, Memory, DNA, Mining, Consulting, Health, Evolution) must comply.

---

## 2. Experience boundary principles

| # | Principle |
|---|-----------|
| **EOS-1** | The user works **only** with business concepts at the experience boundary |
| **EOS-2** | The user **never** sees code |
| **EOS-3** | The user **never** sees JSON |
| **EOS-4** | The user **never** sees AST |
| **EOS-5** | The user **never** sees SQL |
| **EOS-6** | The user **never** sees engine names (Expression, Computation, Resolver, etc.) |
| **EOS-7** | Technology Transparency — all complexity stays inside the system ([D-057](../vision/MAK-2035-PLATFORM-VISION.md)) |

---

## 3. Business asset principles

| # | Principle |
|---|-----------|
| **EOS-8** | Every asset belongs to the **business** — not to a screen, module, or vendor |
| **EOS-9** | Every automation is **reusable** across compatible Business Objects |
| **EOS-10** | Every formula is **reusable** |
| **EOS-11** | Every workflow is **reusable** |
| **EOS-12** | Every dashboard is **reusable** |
| **EOS-13** | Every integration is **reusable** |
| **EOS-14** | Marketplace shares **business intentions and patterns** — never opaque technical implementations as the product |

---

## 4. Intelligence and decision principles

| # | Principle |
|---|-----------|
| **EOS-15** | All intelligence must be **explainable** |
| **EOS-16** | Every decision recommendation must be **justifiable** with evidence |
| **EOS-17** | AI **accelerates** decisions — the platform operates **fully without AI** |
| **EOS-18** | Memory belongs to the **enterprise** — never to the AI model ([Enterprise Memory](./MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md)) |
| **EOS-19** | Knowledge belongs to the **enterprise** — tenant-scoped, auditable, portable |

---

## 5. Continuous enterprise evolution principles

| # | Principle |
|---|-----------|
| **EOS-20** | The system must **learn continuously** from operational signals (with human governance) |
| **EOS-21** | The system must **identify bottlenecks continuously** ([Process Mining](./MAK-PROCESS-MINING-ARCHITECTURE.md)) |
| **EOS-22** | The system must **identify waste continuously** |
| **EOS-23** | The system must **suggest improvements continuously** ([Consulting Engine](./MAK-CONSULTING-ENGINE-ARCHITECTURE.md)) |
| **EOS-24** | The system must **measure enterprise evolution continuously** ([Evolution Engine](./MAK-EVOLUTION-ENGINE-ARCHITECTURE.md)) |
| **EOS-25** | The goal of MAK is to **increase operational capacity of the enterprise continuously** — not merely to run transactions |

---

## 6. Relationship to other permanent documents

| Document | Relationship |
|----------|--------------|
| [Business Intent Authoring](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) | Authoring SSOT — EOS principles bound the user experience |
| [Enterprise Memory](./MAK-ENTERPRISE-MEMORY-ARCHITECTURE.md) | Memory ownership (EOS-18, EOS-19) |
| [Business DNA](./MAK-BUSINESS-DNA-ARCHITECTURE.md) | Enterprise identity and fingerprint |
| [Business Health](./MAK-BUSINESS-HEALTH-ARCHITECTURE.md) | Continuous measurement (EOS-24) |
| [Decision Intelligence](./MAK-DECISION-INTELLIGENCE-ARCHITECTURE.md) | Explainability (EOS-15, EOS-16) |
| [Intelligence Architecture](./MAK-INTELLIGENCE-ARCHITECTURE.md) | L6 stack overview (D-057) |

---

## 7. Implementation status

| Item | Status |
|------|--------|
| Principles registered | ✅ This document (Program 3.5A) |
| Enforcement gates | Future — per Intelligence implementation programs |
| Roadmap change | **None** — Program 3.5 Intent Resolver remains next |

---

*Amend via Decision register only. Compatible with D-054 through D-059.*
