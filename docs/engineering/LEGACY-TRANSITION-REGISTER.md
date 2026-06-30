# Legacy Transition Register — SSOT

**Status:** Official — Living register  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Decision:** D-073 · **VA-05**  
**Parent:** [PLATFORM-REMEDIATION-REGISTER.md](./PLATFORM-REMEDIATION-REGISTER.md)

---

## 1. Purpose

Every legacy path has **explicit classification**: TRANSITION (temporary, converging) vs CONFLICT (must remediate) vs PERMANENT (decision).

**Sunset criterion:** A transition ends when BOS home is default **and** the path's user-facing flow runs through Business Language → Intent → Asset → Projection.

---

## 2. Transition items

| ID | Path | What user does today | Target pipeline | Sunset signal |
|----|------|---------------------|-----------------|---------------|
| **LT-01** | PAGEMP → ModeloBase1 → empresas | Operate cadastro via module | BOS Operation → Runtime projection | Empresas reachable only via Capability; no "Cadastro" top menu |
| **LT-02** | CADCPS field admin | Create MDP fields | Business Asset (Field) via Intent | Field creation via Business Language |
| **LT-03** | Formula Builder `/studio/formula` | Edit expressions | Business Language → Computed Field Asset | Formula Builder platform-only (VA-03) |
| **LT-04** | `campoEngine` formula eval | Runtime calculates custom fields | Single evaluator via Asset projection | FORMULA-RUNTIME-UNIFICATION complete |
| **LT-05** | `framework/cadastro` 61 files | Legacy imports | cadastro-engine only | TD-003 promotion complete |
| **LT-06** | Module menu navigation | ERP mental model | BOS capability home | BOS default route live |
| **LT-07** | CRB empresas-only pilot | Single module CRB | All modules via CRB | Runtime Bridge Phase 2 |

---

## 3. Permanent (do not sunset)

| ID | Item | Decision |
|----|------|----------|
| **LP-01** | ModeloBase1 as cadastro template | D-017, Constitution |
| **LP-02** | Foundation freeze V10.2.0 | D-052 |
| **LP-03** | Studio engines G262–G306 | D-052, D-068 |
| **LP-04** | MDP frozen | D-025, D-026 |
| **LP-05** | Intent → Resolver → Asset pipeline | D-064, D-068, BAAP |

---

## 4. Conflicts (require remediation — not transition)

| ID | Conflict | Remediation track |
|----|----------|-------------------|
| **LC-01** | Product face = module menu while EOS identity declared | BOS implementation (post D-073) |
| **LC-02** | Business user can reach Formula Builder | Expert boundary gate (post D-073) |
| **LC-03** | Three formula evaluators | Runtime unification plan |

---

## 5. Review protocol

Review at each remediation cycle. Move LT → **Complete** only with gate evidence.

---

*VA-05 satisfied by this register — no code changes.*
