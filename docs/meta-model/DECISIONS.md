# MMM Architectural Decisions (D-MMM)

**Status:** Official — Decision register for Meta Model  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 4.01.1  
**Parent register:** [DECISIONS.md](../engineering/DECISIONS.md) (platform-wide)

---

## Objetivo

Registrar todas as decisões arquiteturais do MMM como decisões oficiais D-MMM-xxx.

## Escopo

Decisões derivadas do Program 4.01 e consolidadas em 4.01.1.

## Responsabilidades

Este documento é o **único owner** de decisões MMM. Platform DECISIONS.md referencia D-MMM entries.

---

## D-MMM-01 — MMM as Universal SSOT

**Status:** Accepted  
**Date:** 2026-06-30  
**Program:** 4.01 / 4.01.1

**Decision:** O MAK Universal Meta Model (MMM) é o SSOT universal de definições da plataforma. MDP (L4) evolui como **substrato de persistência** do MMM, não como sistema paralelo.

**Context:** Program 4.00 identificou 4 sistemas metadata paralelos (MDP, boot cache, CRB export, Studio catalogs).

**Consequences:**
- Elimina dual-path metadata
- MDP tables/schemas expandem para 222 objectTypes
- Boot cache torna-se read-only compile export

**Rules:** P-01, P-04, R-01

---

## D-MMM-02 — 222 objectTypes Taxonomy v1

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Taxonomia v1 define **222 objectTypes** em 11 grupos (A–K). Novos tipos são **aditivos**; tipos existentes são deprecated, nunca removidos.

**Consequences:** PlatformSchema registry com 222 entries; compile pipeline type-aware.

**Rules:** R-19  
**See:** [02-OBJECT-TAXONOMY.md](./02-OBJECT-TAXONOMY.md)

---

## D-MMM-03 — Universal Envelope + Typed Payload

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Todo objeto MMM usa envelope universal + payload validado por PlatformSchema JSON Schema por objectType.

**Consequences:** API uniforme; marketplace portable; hash determinístico.

**See:** [26-PLATFORM-SCHEMA.md](./26-PLATFORM-SCHEMA.md)

---

## D-MMM-04 — CRB as Sole Runtime Input

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Compiled Runtime Bundle (CRB) é a **única** entrada do Runtime. Boot cache JS deixa de ser SSOT.

**Consequences:** Runtime Bridge universal; legacy boot cache = offline fallback only.

**See:** [18-COMPILED-RUNTIME-BUNDLE.md](./18-COMPILED-RUNTIME-BUNDLE.md) · [16-RUNTIME.md](./16-RUNTIME.md)

---

## D-MMM-05 — BaseTemplate Pluggable Model

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** BaseTemplate é objeto MMM. `modelobase1` é o primeiro template seed. Novos templates consomem os mesmos engines V13–V20.

**Consequences:** ModeloBase1 registrado como MMM object; multi-template sem duplicar Foundation.

**See:** [08-PRESENTATION-LAYER.md](./08-PRESENTATION-LAYER.md)

---

## D-MMM-06 — Generic Repository + EAV

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Records L0 acessados via Generic Repository com adapters selecionados por PersistenceMapping. Entidades fully dynamic usam EAV.

**Consequences:** Zero-code modules; eliminação gradual de Prisma models hardcoded por entidade.

**See:** [23-GENERIC-REPOSITORY.md](./23-GENERIC-REPOSITORY.md)

---

## D-MMM-07 — Permission/Role as MMM Objects

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Permission e Role são objetos MMM. `UsuarioPerfil` legacy migra para Role seeds (ADMIN, OPERADOR, CONSULTA).

**Consequences:** Field-level ACL; CRB permission registry; fail-closed default.

**See:** [13-PERMISSIONS.md](./13-PERMISSIONS.md)

---

## D-MMM-08 — Single Authoring Path

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Autoria única: Business Language → Intent → Derivation → MMM objects. Dual path (Studio direto sem Intent) será eliminado.

**Consequences:** Expert Mode Studio para platform engineers; Business Language Wizards para negócio.

**Rules:** R-04, R-17  
**See:** [20-BUSINESS-LANGUAGE.md](./20-BUSINESS-LANGUAGE.md)

---

## D-MMM-09 — AI → AICandidate → Intent

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** IA produz AICandidate (draft). Human review → BusinessIntent → standard pipeline. IA nunca gera código, Prisma, React, ou publish direto.

**Consequences:** AI Gateway provider-agnostic; D-074 P-09 compliance.

**See:** [22-AI-GATEWAY.md](./22-AI-GATEWAY.md)

---

## D-MMM-10 — Intelligence Observational Only

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Intelligence consome DomainEvents via Event Bus L3. Nunca escreve objetos MMM.

**Consequences:** Desacoplamento BOS/Intelligence/Runtime; persistence Intelligence em DB (future program).

**Rules:** R-12  
**See:** [25-EVENT-BUS.md](./25-EVENT-BUS.md)

---

## D-MMM-11 — Universal Marketplace Publishability

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Qualquer subgrafo MMM pode ser empacotado como `.makpkg` com manifest, snapshot, signature.

**Consequences:** 12 granularidades publishable; install = copy + lineage.

**See:** [19-MARKETPLACE.md](./19-MARKETPLACE.md)

---

## D-MMM-12 — ERP as Application

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** ERP não é arquitetura separada. ERP = Application MMM object; módulos (Financeiro, Vendas) = Module objects; zero código antes de MMM foundation.

**Consequences:** Programs ERP só após Program 4.15 (first zero-code module).

**See:** [14-APPLICATIONS.md](./14-APPLICATIONS.md)

---

## D-MMM-13 — Foundation Remains Frozen

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** Foundation V10.2.0 permanece congelada. Consome CRB apenas; backward-compatible evolution.

**Consequences:** Engines V13–V20 unchanged; CRB format versioned (`mmm-crb-v1`).

**Rules:** R-16

---

## D-MMM-14 — BOS Primary Surface Preserved

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** BOS permanece superfície primária (D-074). Studio é Expert Mode exception. Business Language Wizards vivem no BOS.

**Consequences:** Capability catalog from MMM; no module-menu identity.

---

## D-MMM-15 — MMM Documentation as SSOT (4.01.1)

**Status:** Accepted  
**Date:** 2026-06-30

**Decision:** `docs/meta-model/` é SSOT oficial da arquitetura MMM. Implementações 4.xx devem conformar antes de código.

**Consequences:** SSOT-REGISTRY updated; supersedes chat-only 4.01 delivery for normative reference.

---

## Versionamento

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-30 | D-MMM-01 through D-MMM-15 |

## Próximos passos

- Register D-MMM-xxx in platform [DECISIONS.md](../engineering/DECISIONS.md) index
- New decisions require amendment to affected topic doc only
