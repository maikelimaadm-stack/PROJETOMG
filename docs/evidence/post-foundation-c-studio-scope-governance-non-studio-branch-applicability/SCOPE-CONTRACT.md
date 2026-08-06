# Contrato de escopo — Slice 46

## Permitido e efetivamente tocado

| caminho | papel |
|---|---|
| `scripts/gates/lib/studioScopeGovernanceRegistry.mjs` | domínio (dados) + entrada 46 |
| `scripts/gates/lib/studioScopeGovernanceGuard.mjs` | predicado de domínio + 2 boundaries |
| `src/runtime/__tests__/studio-scope-governance-non-studio-branch-applicability.test.js` | teste próprio |
| `scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs` | gate próprio |
| `docs/evidence/post-foundation-c-studio-scope-governance-non-studio-branch-applicability/**` | evidência + marker |
| `package.json` | somente wiring de scripts |
| `scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs` | gate Builder ownership-aware |
| consumidores cross-autorizados | apenas asserções que codificavam a suposição antiga |

## Cross-autorização final — exatamente 3

```
1. src/runtime/__tests__/studio-builder-lifecycle-normalization.test.js
2. scripts/gates/g423-studio-builder-lifecycle-normalization.mjs
3. scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs
```

Ausentes por decisão: o **teste** do Builder (não precisa mudar), o subtree do Builder,
qualquer wildcard de diretório. O guard central é `shared`, nunca `cross`.
Nenhuma autorização vazia: cada um dos três é realmente alterado por esta fatia, e isso é
verificado executavelmente (`R014g`).

## Proibido, e ausente do diff final

`.github/workflows/**` · `src/studio/blueprint-engine/**` · `src/runtime/**` fora dos testes
de governança · `backend/**` · `prisma/**` · migrations · evidência histórica 1–45 ·
dependências · `package-lock.json` · produção/UI · entradas 1–45 do catálogo.

## Invariantes que a fatia NÃO pode quebrar

- o núcleo `evaluateStudioBranchScope` permanece fail-closed em todos os casos;
- domínio nunca concede autorização;
- um caminho governado não registrado continua reprovado;
- misto (Studio + desconhecido) continua reprovado;
- o gate do Builder continua reprovando quando o BUILDER é dono da branch e toca os guards;
- `empty_branch_diff` e `non_studio_branch` continuam sendo razões distintas;
- a matriz histórica de consumidores continua fail-closed.
