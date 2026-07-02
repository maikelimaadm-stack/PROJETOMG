# MMM Permanent Rules

**Status:** Official — Invariants and architectural rules  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 4.01.1  
**Related:** [DECISIONS.md](./DECISIONS.md) · [CONTRACTS.md](./CONTRACTS.md) · [Constitution](../constitution/00-MAK-CONSTITUTION.md)

---

## Objetivo

Consolidar todas as regras permanentes, invariantes, princípios e restrições do MMM em documento único.

## Escopo

Regras aplicáveis a todo Program 4.xx e implementações futuras.

## Responsabilidades

Este documento é o **único owner** de regras MMM. Decisões D-MMM referenciam regras por ID (R-xxx).

---

## Princípios (P-xxx)

| ID | Princípio | Rule |
|----|-----------|------|
| P-01 | Single SSOT | Todo comportamento visível deriva de objeto MMM publicado |
| P-02 | Zero Code Default | 95%+ soluções são objetos MMM; código é exceção declarada |
| P-03 | Compile Don't Interpret | Runtime consome CRB; nunca metadata bruta em produção |
| P-04 | Object Graph First | Plataforma = grafo tipado, não arquivos dispersos |
| P-05 | Tenant Sovereignty | Objetos pertencem ao tenant; marketplace copia com lineage |
| P-06 | AI Creates Objects | IA produz AICandidate; nunca código nem publish direto |
| P-07 | Business Language Birth | Autoria humana de negócio nasce em Business Language |
| P-08 | Publish Before Execute | draft → published → pinned → active antes de runtime prod |
| P-09 | Everything Publishable | Qualquer subgrafo MMM pode virar .makpkg |
| P-10 | Layer Immutability | Foundation executa; MMM define; Studio edita; BOS opera |

---

## Regras estruturais (R-xxx)

| ID | Regra | Violation consequence |
|----|-------|----------------------|
| R-01 | Comportamento visível = objeto MMM publicado | Comportamento fantasma, não auditável |
| R-02 | Runtime consome apenas CRB | Performance e segurança comprometidas |
| R-03 | IA → AICandidate → Intent; nunca publish/code | Perda de controle e compliance |
| R-04 | Business Language = gateway autoria negócio | Complexidade exposta ao usuário |
| R-05 | Todo objeto tem objectId estável | Impossível lineage e rollback |
| R-06 | Todo objeto tem LabelSet[] i18n | Bloqueio multilíngue |
| R-07 | Todo objeto tem lineage | Impossível audit e marketplace trust |
| R-08 | Publish exige validate (schema + semantic + dependency) | Objetos inválidos em produção |
| R-09 | Prod exige EnvironmentPin | Downtime e rollback impossível |
| R-10 | Permission é objeto MMM; enforced via CRB | Segurança coarse-grained |
| R-11 | Cross-module ref exige ModuleDependency | Acoplamento oculto |
| R-12 | Intelligence observa; nunca escreve MMM | Conflito autoria/automação |
| R-13 | UserPreference = overlay; nunca SSOT | Preferência vira definição |
| R-14 | Record (L0) ≠ MMM object | Confusão metadata/dados |
| R-15 | Herança = composição + lineage; não OOP | Modelo frágil |
| R-16 | Foundation executa; nunca define | Duplicidade de engines |
| R-17 | Studio edita MMM via API; nunca registries direto | Bypass de publish |
| R-18 | Marketplace instala cópia; nunca mutação in-place | Corrupção cross-tenant |
| R-19 | objectTypes aditivos only (deprecated, never removed) | Breaking change em 20 anos |
| R-20 | Automação crítica exige human approval (D-074) | Execução autônoma proibida |

---

## Invariantes de envelope

Todo objeto MMM **deve** possuir:

- `objectId` (stable)
- `objectType` (taxonomy)
- `scope` + `tenantId` when applicable
- `status` (lifecycle)
- `labels[]` (≥1 locale)
- `payload` (schema-validated)
- `contentHash`
- `lineage`
- `createdAt/By`, `updatedAt/By`

---

## Restrições explícitas (proibições)

| Proibição | Authority |
|-----------|-----------|
| Runtime escrever MMM | R-02, R-16 |
| IA publicar diretamente | R-03, D-074 P-09 |
| Studio escrever Foundation registries | R-17 |
| Intelligence escrever MMM | R-12 |
| Boot cache JS como SSOT | D-MMM-04 |
| Dual authoring path (Studio bypass Intent) | D-MMM-08, D-074 |
| objectType removal from taxonomy | R-19 |
| Cross-tenant object reference | R-18, security contracts |

---

## Integrações

- [DECISIONS.md](./DECISIONS.md) — decisões formalizam exceções às regras
- [28-GOVERNANCE.md](./28-GOVERNANCE.md) — gates enforce regras em CI
- [Constitution 08-DO-NOT-DO](../constitution/08-DO-NOT-DO-LIST.md) — regras plataforma superset

---

## Versionamento

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-06-30 | Initial rules — Program 4.01.1 |

## Próximos passos

- Program 4.02: map rules → automated gate checks (G4xx)
- Program 4.28: governance gate certification for MMM rules
