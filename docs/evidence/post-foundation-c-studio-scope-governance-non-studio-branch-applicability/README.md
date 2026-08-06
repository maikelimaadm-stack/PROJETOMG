# Slice 46 — Studio Scope Governance: Non-Studio Branch Applicability

**Ordinal:** 46 · **Slice id:** `studio-scope-governance-non-studio-branch-applicability`
**PR:** #500 (repurposed) · **Base:** `main @ a76fb5d778a9ea33051b18caab23587b98d152c1`

## O que esta fatia entrega

Um limite de **aplicabilidade**: uma branch que não toca nada do território governado pelo
Studio passa a ser `notApplicable` com `reason: non_studio_branch`, em vez de ser reprovada
como se fosse uma fatia Studio malformada.

## O que esta fatia NÃO entrega

- não entrega o enforcement de CI (P1-01) — ele foi **removido** desta PR e volta depois;
- não relaxa o núcleo `evaluateStudioBranchScope`, que continua fail-closed;
- não cria autorização para caminho nenhum;
- não altera a semântica das entradas 1–45 do catálogo;
- não toca produto, backend, Prisma, migrations ou UI.

## Por que ela existe

A PR #500 nasceu como a correção do finding **P1-01** (o CI não executava `test:runtime`
nem `gate:g423`). O primeiro run com o enforcement ligado — `31041688686` — ficou vermelho
com **61 falhas**, todas de governança Studio, porque o diff continha
`.github/workflows/foundation-governance.yml`, um caminho que o catálogo não conhece.

Detalhe completo em `CI-BLOCKER-ROOT-CAUSE.md`.

## Documentos

| documento | conteúdo |
|---|---|
| `IMPLEMENTATION-PLAN.md` | a sequência exata executada |
| `SCOPE-CONTRACT.md` | o que a fatia pode e não pode tocar |
| `DOMAIN-VS-AUTHORIZATION.md` | a distinção central, e por que a derivação óbvia é insegura |
| `NEGATIVE-MATRIX.md` | todos os estados que continuam fail-closed |
| `TEST-MATRIX.md` | a matriz A–O executável |
| `GATE-MATRIX.md` | o que o gate dedicado verifica |
| `CI-BLOCKER-ROOT-CAUSE.md` | o run vermelho, as 61 falhas, o erro metodológico |
| `READINESS.md` | flags declaradas |
| `POST-MERGE-REVALIDATION-PLAN.md` | o que revalidar na `main` |

## Blockers desta fatia

| id | estado |
|---|---|
| `B-CI-ENFORCEMENT-61-GOVERNANCE-FAILURES` | resolvido pela própria fatia |
| `SLICE46_SCOPE_EXPANSION_REQUIRED` | **RESOLVED** — gate do Builder ownership-aware |

**P1-01 continua ABERTO.** Esta fatia é o pré-requisito; o enforcement de CI volta depois.
