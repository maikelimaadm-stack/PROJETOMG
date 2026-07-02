# Platform Architecture Divergence Register

**Status:** Official SSOT · **Version:** 1.0.0

---

## Resolved at architecture audit

| ID | Divergence | Resolution |
|----|------------|------------|
| PA-DV-01 | Dual layer models | D-PA-01 mapping table |
| PA-DV-02 | Render as separate product | D-PA-04 — part of Runtime |
| PA-DV-03 | Open Studio designer count | D-PA-07 — 17 closed |
| PA-DV-04 | AI direct write ambiguity | D-PA-09 closed |
| PA-DV-05 | BOS vs module menu identity | D-PA-10 — BOS is L9 |

---

## Implementation divergences (tracked — not architectural)

Mapped to Foundation Roadmap — see [16-GAPS-AND-DECISIONS.md](./16-GAPS-AND-DECISIONS.md) and [meta-model/DIVERGENCE-REGISTER.md](../meta-model/DIVERGENCE-REGISTER.md).

| ID | Current | Target | Foundation |
|----|---------|--------|------------|
| PA-IMPL-01 | boot cache SSOT | CRB only | C, E |
| PA-IMPL-02 | `/api/mdp/*` | `/api/mmm/v1` | E |
| PA-IMPL-03 | generatedModules.json | MMM module objects | E |
| PA-IMPL-04 | UsuarioPerfil | MMM role/permission | D |
| PA-IMPL-05 | Intelligence localStorage | Event Bus | F, K |

---

## Document hierarchy

| When conflict | Authority |
|---------------|-----------|
| Platform layers vs MAK-2035 | platform-architecture |
| MMM taxonomy vs any | meta-model |
| Product identity vs UX | D-074 freeze |
| Implementation vs architecture | Architecture wins |

---

*End of document.*
