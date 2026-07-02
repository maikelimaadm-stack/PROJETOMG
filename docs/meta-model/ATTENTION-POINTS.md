# MMM Attention Points & Known Gaps

**Status:** Official — Pre-implementation review register  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 4.01.1 confirmation review (pre-4.02)  
**Owner:** Single register for gaps between MMM target and current platform

> **Rule:** Items here are **documented and mapped** — not blockers for 4.02 unless marked **BLOCKER**. Implementation programs resolve each item per [ROADMAP.md](./ROADMAP.md).

---

## Objetivo

Consolidar pontos de atenção e inconsistências arquiteturais identificados na Constituição MMM, com mapeamento para programs e documentos owner.

---

## Pontos de atenção (governança e nomenclatura)

| # | Ponto | Status | Owner / Ação |
|---|-------|--------|--------------|
| AP-01 | **Dual ROADMAP:** `docs/engineering/ROADMAP.md` (plataforma) ≠ `docs/meta-model/ROADMAP.md` (MMM 4.02+) | ✅ Documentado | Engineering ROADMAP header + meta-model ROADMAP header |
| AP-02 | **Program 4 naming collision:** docs antigos referem "Program 4" como Intelligence | 🔄 Em curso | SUPERSESSION-REGISTER + PROGRAM-IMPLEMENTATION-MAP sync (4.02 prep) |
| AP-03 | **G4xx gate namespace:** G401/G402 já usados por deploy (D-062) | ✅ Corrigido | [28-GOVERNANCE.md](./28-GOVERNANCE.md) — MMM gates G420+ |
| AP-04 | **GOVERNANCE-REGISTRY** não listava Program 4.01.1 | ✅ Corrigido | GOVERNANCE-REGISTRY.md (esta revisão) |
| AP-05 | **PROJECT-STATUS** ainda apontava 3.28+ como next mission | ✅ Corrigido | PROJECT-STATUS.md (esta revisão) |
| AP-06 | **Legacy architecture docs** ainda SSOT em L1 | 🔄 Parcial | SUPERSESSION-REGISTER entries; full sync em 4.02 |
| AP-07 | **222 PlatformSchemas** especificados, não implementados | ⏳ Esperado | Program 4.02 deliverable |
| AP-08 | **G4xx gate scripts** planejados, não existem | ⏳ Esperado | Program 4.02+ (G420 stub primeiro) |

---

## Inconsistências arquiteturais (estado atual vs MMM target)

| # | Inconsistência | Estado atual | Target MMM | Program |
|---|----------------|--------------|------------|---------|
| IC-01 | Dual metadata path | MDP 26 types + boot cache JS | MMM 222 types + CRB-only | 4.03, 4.05, 4.14 |
| IC-02 | Runtime Bridge escopo | Piloto empresas apenas | Universal all modules | 4.05 |
| IC-03 | RBAC | 3 `UsuarioPerfil` fixos | Permission/Role MMM objects | 4.07 |
| IC-04 | Dual authoring | Studio direto + Business Language | BL → Intent → MMM único | 4.10, 4.14 |
| IC-05 | Intelligence persistence | localStorage MVP | Event Bus L3 + DB | 4.11 + future |
| IC-06 | Generator output | JS module files | MMM object graph | 4.02 spec, 4.14 |
| IC-07 | Record vs MMM | Cadastro legacy mistura | Record L0 ≠ MMM object (R-14) | 4.06, 4.14 |
| IC-08 | Derivation kinds SSOT | `INTENT-DERIVATION-KIND-SSOT.md` (2 impl + extensions) | 19 kinds MMM ([21-INTENT-ENGINE.md](./21-INTENT-ENGINE.md)) | 4.02 alinhamento |
| IC-09 | MDP doc authority | MDP spec como metadata SSOT | MDP = persistence substrate only | D-MMM-01, [24-PERSISTENCE.md](./24-PERSISTENCE.md) |

---

## Convergence map (referência rápida)

Ver tabela completa em [ROADMAP.md](./ROADMAP.md) § Convergence map.

---

## Critério de prontidão para 4.02

| Critério | Met |
|----------|-----|
| `docs/meta-model/` completo (00–30 + cross-cutting) | ✅ |
| D-MMM-01–15 registradas | ✅ |
| Governança platform atualizada (registries) | ✅ (esta revisão) |
| Inconsistências mapeadas neste documento | ✅ |
| PlatformSchema JSON files existentes | ❌ — escopo 4.02 |
| Gate G420+ scripts existentes | ❌ — escopo 4.02+ |

---

## Versionamento

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-30 | Initial register (pre-4.02 review) |

---

*End of document.*
