# 16 — Gaps and Decisions (Closed Register)

**Status:** Official SSOT · **Version:** 1.0.0

---

## Rule

All gaps identified during Foundation Architecture Audit are **closed** by [DECISIONS.md](./DECISIONS.md) D-PA-01 through D-PA-25. **No open architectural questions remain.**

---

## Previously open gaps — now closed

| Gap ID | Description | Decision | Document |
|--------|-------------|----------|----------|
| GAP-01 | Layer model ambiguity L0–L7 vs L0–L10 | D-PA-01 | 01-LAYERS |
| GAP-02 | Render Engine separate or part of Runtime | D-PA-04 | 07-RENDER-ENGINE |
| GAP-03 | Action execution ad-hoc vs universal | D-PA-05 | 08-ACTION-ENGINE |
| GAP-04 | Workflow host undefined | D-PA-06 | 09-WORKFLOW-ENGINE |
| GAP-05 | Studio designer catalog incomplete | D-PA-07 | 03-STUDIO |
| GAP-06 | Low-code path undefined | D-PA-08 | 04-LOW-CODE |
| GAP-07 | AI write boundary | D-PA-09 | 10-AI-ARCHITECTURE |
| GAP-08 | BOS vs Studio conflict | D-PA-10 | 11-BOS |
| GAP-09 | Marketplace format | D-PA-11 | 12-MARKETPLACE |
| GAP-10 | Security hierarchy | D-PA-12 | 13-SECURITY |
| GAP-11 | API taxonomy | D-PA-13 | 14-APIS |
| GAP-12 | Scale topology | D-PA-14 | 15-SCALABILITY |
| GAP-13 | Taxonomy completeness | D-PA-15 | 05-META-MODEL-AUDIT |
| GAP-14 | record vs Record confusion | D-PA-16 | 06-UNIVERSAL-DATA-MODEL |
| GAP-15 | Event bus placement | D-PA-17 | 01-LAYERS |
| GAP-16 | Offline boundary | D-PA-18 | 06-UNIVERSAL-DATA-MODEL |
| GAP-17 | Resume implementation criteria | D-PA-19 | 18-FOUNDATION-ROADMAP |
| GAP-18 | Intent layer position | D-PA-20 | 01-LAYERS |
| GAP-19 | Intelligence mutation rules | D-PA-21 | 10-AI-ARCHITECTURE |
| GAP-20 | Application vs Module | D-PA-22 | 04-LOW-CODE |
| GAP-21 | Plugin model | D-PA-23 | 02-RUNTIME |
| GAP-22 | Rollback semantics | D-PA-24 | 02-RUNTIME |
| GAP-23 | View mode catalog | D-PA-25 | 07-RENDER-ENGINE |

---

## Structural divergences (implementation — not architecture)

| ID | Divergence | Foundation |
|----|------------|------------|
| DV-STR-01 | MDP dual path | E |
| DV-STR-02 | Boot cache SSOT | C, E |
| DV-STR-03 | UsuarioPerfil RBAC | D |
| DV-STR-04 | Dual authoring paths | D, E |
| DV-STR-05 | Intelligence localStorage | F |
| DV-STR-06 | JS module generator | E |

See [DIVERGENCE-REGISTER.md](./DIVERGENCE-REGISTER.md).

---

## Documents superseded (presentation)

| Document | Superseded aspect | Authority |
|----------|-------------------|-----------|
| MAK-2035 layer names | Mapping only | 01-LAYERS |
| meta-model/16-RUNTIME | Extended by | 02-RUNTIME |

Content not deleted — platform-architecture is **authoritative for implementation sequencing**.

---

*End of document.*
