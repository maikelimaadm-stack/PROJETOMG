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
| consumidores cross-autorizados | apenas asserções que codificavam a suposição antiga |

## Proibido, e ausente do diff final

`.github/workflows/**` · `src/studio/blueprint-engine/**` · `src/runtime/**` fora dos testes
de governança · `backend/**` · `prisma/**` · migrations · evidência histórica 1–45 ·
dependências · `package-lock.json` · produção/UI · entradas 1–45 do catálogo.

## Invariantes que a fatia NÃO pode quebrar

- o núcleo `evaluateStudioBranchScope` permanece fail-closed em todos os casos;
- domínio nunca concede autorização;
- um caminho governado não registrado continua reprovado;
- misto (Studio + desconhecido) continua reprovado;
- `empty_branch_diff` e `non_studio_branch` continuam sendo razões distintas;
- a matriz histórica de consumidores continua fail-closed.
