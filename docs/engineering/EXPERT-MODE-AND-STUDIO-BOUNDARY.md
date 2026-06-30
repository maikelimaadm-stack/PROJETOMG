# Expert Mode & Studio Boundary — SSOT

**Status:** Official  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Decision:** D-073 · **VA-02**, **VA-03**  
**Parent:** [MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md](../architecture/MAK-BUSINESS-ASSET-AUTHORING-PRINCIPLES.md) (BAAP-1, BAAP-9, BAAP-13)

---

## 1. Problem consolidated

Certified Studios (Layout, Field, Formula G303A) expose **technical authoring**. Vision (D-065, BAAP-13) requires users **never create technology**. Both coexist today — this document defines the **permanent boundary**.

---

## 2. Definitions

| Term | Meaning |
|------|---------|
| **Business First Mode** | Default. Business Language → Intent → Resolver → Asset. User sees business vocabulary only. |
| **Expert Mode** | Controlled exception. User manipulates **Business Assets** using **business terms** — not raw expressions, AST, or engine concepts. |
| **Platform Studio** | Certified designers (Layout, Field, Formula). Audience: **platform engineers, implementers, diagnostics** — **not** default business users. |
| **Formula Builder** | Platform Studio component. **Not** a business-user destination (VA-03). |

---

## 3. Expert Mode — what it IS

- Select asset type: Computed Field, Workflow, Dashboard, …
- Edit asset metadata in **business vocabulary** (label, rule description, conditions, outcomes)
- Preview outcomes in business terms ("Total will include tax")
- Confirm Intent before Resolver runs

## 4. Expert Mode — what it is NOT

- Formula Builder with `expressionSource` editor
- Field Studio type pickers and MDP registry IDs
- Layout Studio canvas as primary authoring
- JSON/AST/SQL/engine names visible

---

## 5. Formula Builder classification (VA-03)

| Audience | Allowed access |
|----------|----------------|
| Business user (any role) | **No** — use Business Language |
| Organization admin (business) | **No** — use Expert Mode asset UI (future) |
| Platform engineer / support | **Yes** — diagnostics, parity checks, migration |
| CI / Gates | **Yes** — certification |

**When Formula Builder exists in production UI today:** classified as **TRANSITION** — not target experience.

---

## 6. Studio certification preserved

G262–G306 remain valid. Studios certify **platform infrastructure**. Certification **does not** grant permission to expose Studios as default business UX.

---

## 7. Progressive disclosure tiers (BAAP-3)

| Tier | User | Sees |
|------|------|------|
| Beginner | Operator | Operations, objectives, confirmations |
| Intermediate | Manager | Assets, capabilities, recommendations |
| Expert | Process owner | Expert Mode (business vocabulary) |
| Platform | Engineer | Studio (internal) |

Technology transparency applies to tiers **Beginner through Expert**.

---

## 8. Gates for future implementation

- Business user route to `/studio/formula` → redirect to Business Language or block with explanation
- Expert Mode asset UI must not expose `expressionSource` by default
- G303A remains green for platform; new gate: **G-BOS-01** (future) user-route boundary

---

*Documentation only — D-073 remediation. No Studio code changes this cycle.*
