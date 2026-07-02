# Universal Authoring Contracts

**Status:** Official SSOT · **Version:** 1.0.0

---

## Contract matrix

| From | To | Contract | Document |
|------|-----|----------|----------|
| Author | MMM | UAL payload + USM draft | 02, 18 |
| Designer | MMM API | C-DS-01 revision writes | 04 |
| Wizard | MMM | draft objects only | 05 |
| UFL/UVL | Publish | Compile to CRB V14/V16 | 07, 08 |
| Bindings | CRB | Compile registries | 10–14 |
| Review | Publish | approved scope only | 18 |
| AI | AICandidate | no direct MMM | 22 |
| Publish | Runtime | CRB — not author path | 06 |
| UAS | UEP | Commands at runtime | platform-protocol |

---

## Authoring invariants

| ID | Invariant |
|----|-----------|
| INV-A01 | No author writes CRB directly |
| INV-A02 | Creation order respected at publish validate |
| INV-A03 | All refs resolve at compile or fail |
| INV-A04 | Manual path exists for every wizard |
| INV-A05 | AI never bypasses review |
| INV-A06 | Secrets never in authoring payload |
| INV-A07 | 95% scenarios — zero tenant code |

---

*End of document.*
