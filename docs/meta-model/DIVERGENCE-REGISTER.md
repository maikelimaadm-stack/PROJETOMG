# MMM Divergence Register

**Status:** Official — Alignment & divergence resolution register  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 4.01.2 — MMM Alignment & Divergence Resolution  
**Owner:** Single register classifying all known divergences pre-4.02

> **Rule:** Divergences marked **BLOCKER** must be closed (decision + doc update) before Program 4.02 coding/spec file generation. See [ATTENTION-POINTS.md](./ATTENTION-POINTS.md) for summary checklist.

---

## Classification legend

| Class | Meaning | Blocks 4.02? |
|-------|---------|--------------|
| **BLOCKER** | Must close before 4.02 specification work | Yes |
| **DOC** | Documentation-only; no runtime impact | No (after doc fix) |
| **GOV** | Governance / nomenclature | No (after registry sync) |
| **LEGACY** | Code or legacy doc vs MMM target | No — mapped to programs 4.03+ |
| **STRUCT** | Architectural gap in running system | No for spec; yes for impl 4.03+ |
| **TAX** | Taxonomy / schema registry | Yes if unresolved |

---

## Resumo de reconciliação (4.01.2)

| ID | Issue | Resolution | Status |
|----|-------|------------|--------|
| **DV-TAX-01** | Count 222 vs 227 listed types | **D-MMM-16:** canonical **227** taxonomy; **226** PlatformSchemas (`record` excluded) | ✅ Closed |
| **DV-GATE-01** | MMM docs referenced deploy G401/G402 | Renumbered to **G420+** in meta-model docs | ✅ Closed |
| **DV-GOV-01** | Dual ROADMAP | Disambiguation in both ROADMAP headers | ✅ Closed |
| **DV-GOV-02** | Program 4 naming collision | SUPERSESSION-REGISTER + PROGRAM-REGISTRY | 🔄 Residual refs below |
| **DV-DOC-01** | Legacy L1 docs without header banner | SUPERSESSION-REGISTER + banners (4.01.2) | 🔄 Partial |
| **DV-ENV-01** | Envelope not fully field-specified | Outline in [ENVELOPE-SPEC.md](./ENVELOPE-SPEC.md); detail in 4.02 | ✅ Closed (outline) |

---

## 1. Divergências bloqueantes

| ID | Divergência | Resolução | Status |
|----|-------------|-----------|--------|
| **DV-TAX-01** | Headers A–K sum to 222 but listed types = **227** unique (`record` included) | **D-MMM-16** amends count; [02-OBJECT-TAXONOMY.md](./02-OBJECT-TAXONOMY.md) headers corrected | ✅ **Closed 4.01.2** |

**No remaining BLOCKERs** after D-MMM-16 and taxonomy doc update.

---

## 2. Divergências não bloqueantes (código / runtime)

| ID | Class | Atual | Target MMM | Program |
|----|-------|-------|------------|---------|
| **DV-STR-01** | STRUCT | MDP 26 types + parallel paths | MMM 227 + CRB-only | 4.03, 4.05, 4.14 |
| **DV-STR-02** | STRUCT | Runtime Bridge piloto empresas | Universal CRB | 4.05 |
| **DV-STR-03** | STRUCT | RBAC 3 `UsuarioPerfil` | Permission/Role MMM | 4.07 |
| **DV-STR-04** | STRUCT | Dual authoring Studio + BL | BL → Intent → MMM | 4.10, 4.14 |
| **DV-STR-05** | STRUCT | Intelligence localStorage | Event Bus L3 + DB | 4.11+ |
| **DV-STR-06** | STRUCT | Generator → JS files | MMM object graph | 4.14 |
| **DV-STR-07** | STRUCT | Record/MMM mixed in cadastro | R-14 separation | 4.06, 4.14 |

---

## 3. Divergências de documentação (não bloqueiam 4.02)

| ID | Issue | Action | Status |
|----|-------|--------|--------|
| **DV-DOC-01** | Legacy `MAK-BUSINESS-*`, `MAK-STUDIO-*` headers claim SSOT | Banner → meta-model; SUPERSESSION-REGISTER | 🔄 Partial |
| **DV-DOC-02** | `INTENT-DERIVATION-KIND-SSOT` 2 runtime kinds vs 19 MMM kinds | Reconcile mapping table in 4.02 spec | ⏳ 4.02 |
| **DV-DOC-03** | `PLATFORM-MATURITY-INDEX` "Program 4 = AI" | Pointer to MMM Program 4 | ⏳ Low priority |
| **DV-DOC-04** | `PROGRAM-SEQUENCE-VALIDATION` 4.x Intelligence | Sync terminology | ⏳ Low priority |
| **DV-GATE-01** | Wrong gate IDs in 03, 10, 17, 26 | Fixed → G420+ | ✅ |

---

## 4. Divergências de governança / nomenclatura

| ID | Issue | SSOT | Residual |
|----|-------|------|----------|
| **DV-GOV-01** | Two ROADMAP files | Platform vs MMM disambiguation | ✅ |
| **DV-GOV-02** | "Program 4" = Intelligence in old docs | Program 4 = MMM | 🔄 `engineering/ROADMAP.md` L327; PROGRAM-REGISTRY §Future |
| **DV-GOV-03** | Program 4.01.2 not registered | PROGRAM-REGISTRY | ✅ 4.01.2 |
| **DV-GOV-04** | G421 not in GATE-REGISTRY | Register at 4.02 start | ⏳ 4.02 |

---

## 5. Conflitos MMM vs subsistemas

| Conflito | Tipo | Bloqueia 4.02? | Resolução |
|----------|------|----------------|-----------|
| **MMM vs MDP** | LEGACY/DOC | No | D-MMM-01; MDP = substrate; [24-PERSISTENCE.md](./24-PERSISTENCE.md); MDP spec banner |
| **MMM vs boot cache** | STRUCT | No | D-MMM-04; R-02; eliminate 4.14; boot cache = fallback only |
| **MMM vs Intents antigos** | DOC | No | [21-INTENT-ENGINE.md](./21-INTENT-ENGINE.md) SSOT; legacy docs = Reference |
| **MMM vs Program Registry** | GOV | No | Program 4 section SSOT; Future table clarified |
| **MMM vs Platform ROADMAP** | GOV | No | Disambiguation headers |
| **MMM vs doc supersession** | DOC | No | SUPERSESSION-REGISTER; partial header banners |

---

## 6. Taxonomia — fechamento para 4.02

| Metric | Value | SSOT |
|--------|-------|------|
| **objectTypes (taxonomy registry)** | **227** | [02-OBJECT-TAXONOMY.md](./02-OBJECT-TAXONOMY.md) |
| **PlatformSchema targets (4.02)** | **226** | Excludes `record` (L0 reference, R-14) |
| **Groups A–K headers** | Match listed counts | D-MMM-16 |
| **Additive-only rule** | R-19 | Unchanged |

### Group counts (canonical v1.1)

| Group | Count |
|-------|-------|
| A Platform & Tenant | 21 |
| B Application Topology | 13 |
| C Data Model | 16 |
| D Presentation | **38** |
| E Analytics | **19** |
| F Behavior | 28 |
| G Integration | 22 |
| H Specialized Views | 22 |
| I Authoring | 17 |
| J Package & Versioning | **15** |
| K Intelligence & AI | 16 |
| **Total** | **227** |

---

## 7. PlatformSchema — prontidão para especificação

| Criterion | Ready? |
|-----------|--------|
| objectType list closed | ✅ (D-MMM-16) |
| Envelope fields outlined | ✅ [ENVELOPE-SPEC.md](./ENVELOPE-SPEC.md) |
| Per-type payload patterns in topic docs | ✅ (high-level) |
| JSON Schema files | ❌ — 4.02 deliverable |
| API OpenAPI contract | ❌ — 4.02 deliverable |
| Derivation kind ↔ objectType mapping | ⏳ — 4.02 table |

**Verdict:** PlatformSchema **can be specified without architectural ambiguity** after D-MMM-16. Remaining work is **authoring** in 4.02, not undecided architecture.

---

## 8. Decisões formais pendentes / fechadas

| ID | Decision | Status |
|----|----------|--------|
| D-MMM-01–15 | Foundation decisions | ✅ Valid |
| **D-MMM-16** | Taxonomy count 227; PlatformSchema 226; group header correction | ✅ **New 4.01.2** |
| D-MMM-17 | Derivation kind string catalog (19 ↔ runtime) | ⏳ Optional in 4.02; not blocking |

---

## Versionamento

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-30 | Program 4.01.2 initial register |

---

*End of document.*
