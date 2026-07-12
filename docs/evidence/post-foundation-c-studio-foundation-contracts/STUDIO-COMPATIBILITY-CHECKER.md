# STUDIO COMPATIBILITY CHECKER

`checkStudioContractCompatibility({ current, next })` classifica uma mudança
proposta a um contrato.

## Classificações

- `invalid` — algum lado não é objeto ⇒ `contractInvalidated: true`.
- `breaking` — capacidade sensível liberada / guard removido ⇒
  `requiresMajorVersion: true`.
- `backward_compatible` — apenas adições (novos tipos/kinds/ações seguros).
- `conditionally_compatible` — mudança não-aditiva mas não-quebrante
  (ex.: bump de versão, remoção de item neutro).
- `compatible` — nada mudou.

## O que é breaking

- Liberar UI/route/menu/mutation/production/backend/Prisma/migration.
- Remover `tenantRequired`/`permissionRequired`.
- Desligar `failClosed`/`defaultDeny`.
- Remover um gate obrigatório (safety/persistence/route-menu).
- Habilitar registro automático de módulo ou publicação automática no marketplace.

Retorna `{ classification, compatible, requiresMajorVersion, contractInvalidated,
breakingChanges, additiveChanges, neutralChanges, reason }`.
