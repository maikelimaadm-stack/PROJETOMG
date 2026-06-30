# MAK Product Identity — SSOT

**Status:** Official — Permanent product identity reference (**derived from freeze SSOT**)  
**Version:** 1.1.0  
**Effective date:** 2026-06-30  
**Mission:** Platform Remediation & Product Alignment (D-073) · superseded by **Program 3.8.8 freeze**  
**Decision:** D-073 · **Supreme identity SSOT:** [MAK-PRODUCT-IDENTITY-FREEZE.md](./MAK-PRODUCT-IDENTITY-FREEZE.md) (**D-074**)

---

## 1. Single product identity

> **MAK is an Enterprise Operating System (EOS) for metadata-driven businesses.**  
> The user **administers the business** — not software modules.

This document resolves apparent tension between Constitution ("ERP platform") and Platform Vision ("EOS").

---

## 2. Identity layers (no contradiction)

| Layer | Document | Identity statement | Audience |
|-------|----------|-------------------|----------|
| **Product (user-facing)** | **This document** + [Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md) | Enterprise Operating System | Business users, market |
| **Technical foundation** | [Constitution](../constitution/00-MAK-CONSTITUTION.md) | Metadata-driven platform with certified cadastro runtime | Engineers |
| **Runtime template** | [04-MODELOBASE1-RULES.md](../constitution/04-MODELOBASE1-RULES.md) | Cadastro UI motor — frozen template | Engineers |
| **Authoring infrastructure** | [Studio Architecture](./MAK-STUDIO-ARCHITECTURE.md) | Platform authoring engines | Platform engineers |

**Rule:** When documents conflict on *product feel*, **this document + D-057 win**. When documents conflict on *Foundation freeze*, **Constitution wins**.

---

## 3. What the user must feel

| Feel | Must NOT feel |
|------|---------------|
| Operating a business system that learns and improves | Using an ERP with extra Studio |
| Working with objectives, capabilities, assets | Configuring modules and fields |
| Partnered by explainable recommendations | Dependent on consultants or IT for every change |
| Progressive complexity (Business First default) | Forced into technical editors |

---

## 4. What MAK is not (positioning)

- Not a traditional module-centric ERP (positioning — even if cadastro runtime exists)
- Not a low-code IDE for developers (Studio is infrastructure, not identity)
- Not an AI chat wrapper (Intelligence → Intent + Memory — VA-08)

---

## 5. Terminology SSOT

| Use | Avoid (user-facing) |
|-----|---------------------|
| Business Asset | Module config, field definition |
| Capability | Module feature |
| Operation | Screen, page |
| Objective | Requirement ticket |
| Business Language | Formula, expression, JSON |

---

## 6. Visual identity direction (non-code)

- Primary chrome: **Operations / Objectives / Assets** — not "Cadastro"
- Progressive disclosure: business vocabulary first
- Expert/Studio: secondary entry, clearly labeled

---

## 7. Governance

All future missions must answer: *"Does this reinforce EOS identity or ERP identity?"*

If ERP identity → reject or reframe before merge.

---

*Harmonizes Constitution technical description with D-057 EOS vision without amending Constitution.*
