# MAK Business Operating Shell Architecture

**Status:** Official — Permanent product experience SSOT  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Platform Remediation & Product Alignment (D-073)  
**Decision:** D-073 · Vision Adjustment **VA-01**  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); operationalizes [Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md) (D-057)

---

## 1. Purpose

Define the **Business Operating Shell (BOS)** — the **primary user-facing surface** of MAK as an Enterprise Operating System.

The BOS is how business users **administer the company**, not configure software.

---

## 2. Product identity rule (VA-01)

| Layer | Role | User perception |
|-------|------|-----------------|
| **Business Operating Shell** | Primary experience — objectives, capabilities, assets, operations | *"I run my business here"* |
| **ModeloBase1** | Runtime cadastro **template** — list/form/search projection | *Invisible infrastructure* — not product identity |
| **MAK Studio** | Expert/platform authoring — gated, not default home | *"Advanced configuration when needed"* |
| **Runtime / Engines** | Execution only | Never visible |

**Binding:** ModeloBase1 remains **frozen, mandatory, and default `baseTemplateId`** per [04-MODELOBASE1-RULES.md](../constitution/04-MODELOBASE1-RULES.md). It is **not** the product face.

---

## 3. BOS surfaces (normative)

```
┌─────────────────────────────────────────────────────────────────┐
│  BUSINESS OPERATING SHELL (primary)                              │
│  Home · Objectives · Capabilities · Assets · Operations · Health │
├─────────────────────────────────────────────────────────────────┤
│  BUSINESS LANGUAGE (default authoring)                           │
│  Objectives · Rules · Processes · Events · Conditions · Results  │
├─────────────────────────────────────────────────────────────────┤
│  RUNTIME PROJECTIONS (invisible)                                 │
│  ModeloBase1 templates · CRB · Engines                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. BOS home (capability-centric — VA-04)

Default home **must not** be module menu (Cadastro → Empresas).

| Home region | Content |
|-------------|---------|
| **Objectives** | Active business goals user declared |
| **Capabilities** | Enabled business capabilities (not modules) |
| **Assets** | Reusable Business Assets registry |
| **Operations** | Day-to-day work queues (human language) |
| **Health** | Business Health score + evolution |
| **Recommendations** | Consulting output → Intent candidates (approval-gated) |

Module routes (e.g. `/CadastroEmpresas`) remain as **Runtime projections** reachable from Operations — not as product home.

---

## 5. Authoring modes

| Mode | Default | Surface |
|------|---------|---------|
| **Business First** | **Yes** | Business Language → Intent confirmation |
| **Expert Mode** | Exception | See [EXPERT-MODE-AND-STUDIO-BOUNDARY.md](../engineering/EXPERT-MODE-AND-STUDIO-BOUNDARY.md) |

---

## 6. Relationship to ModeloBase1

| Question | Answer |
|----------|--------|
| Replace ModeloBase1? | **No** — frozen template |
| Hide ModeloBase1 forever? | **No** — used where cadastro projection applies |
| Product identity? | **BOS**, not ModeloBase1 |
| New Base Templates? | Allowed via MDP Template Registry — BOS hosts selection |

Cross-reference: [04-MODELOBASE1-RULES.md](../constitution/04-MODELOBASE1-RULES.md) §11 — ModeloBase1 forever as default template; BOS is L5 experience layer above.

---

## 7. Implementation status

| Item | Status |
|------|--------|
| Architecture SSOT | ✅ This document (D-073) |
| BOS UI implementation | **Future** — after remediation gate |
| ModeloBase1 runtime | ✅ Production |
| Module home as default | ⚠️ **Transition** — see [LEGACY-TRANSITION-REGISTER.md](../engineering/LEGACY-TRANSITION-REGISTER.md) |

---

## 8. Compliance checklist (future gates)

- [ ] Default route after login = BOS home (not module menu)
- [ ] Business Language is default authoring entry
- [ ] ModeloBase1 pages labeled as Operations projection, not "the product"
- [ ] Expert Mode requires explicit opt-in

---

*Registered D-073 — Platform Remediation. No Foundation/Runtime/Studio code changes in this mission.*
