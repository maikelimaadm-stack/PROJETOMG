# Flags & Reversibility — Generic Kernel Consumption

## Flags

| Constante | Env var | Escopo |
|---|---|---|
| `MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG` | `MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION` | Umbrella |
| `EMPRESAS_GENERIC_KERNEL_FLAG` | `MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL` | Empresas |
| `CADCPS_GENERIC_KERNEL_FLAG` | `MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL` | cadcps |
| `MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_ALLOW_PROD_FLAG` | `..._CONSUMPTION_ALLOW_PROD` | Umbrella (prod) |
| `EMPRESAS_GENERIC_KERNEL_ALLOW_PROD_FLAG` | `..._EMPRESAS_GENERIC_KERNEL_ALLOW_PROD` | Empresas (prod) |
| `CADCPS_GENERIC_KERNEL_ALLOW_PROD_FLAG` | `..._CADCPS_GENERIC_KERNEL_ALLOW_PROD` | cadcps (prod) |

## Semântica

- **Off por default.** Só `'true'` liga (umbrella OU per-módulo).
- **Fail-closed em produção**: em produção, mesmo com a flag `'true'`, o consumo fica desligado,
  salvo se a variante `*_ALLOW_PROD` correspondente também for `'true'`.
- **Precondição beta**: o consumo **nunca** liga sem `readState.betaApplied === true`.
- Env resolvido via `import.meta.env` com fallback para `globalThis.process.env`
  (arquivo sob `src/ModeloBase1/` ⇒ globals de browser ⇒ `globalThis.process`, nunca `process` nu).

## Matriz de decisão

| Flag módulo/umbrella | Produção | `*_ALLOW_PROD` | `betaApplied` | `consumptionEnabled` | `reason` |
|---|---|---|---|---|---|
| off | — | — | — | **false** | `consumption-flag-off` |
| on | não | — | true | **true** | `null` |
| on | não | — | false | **false** | `beta-read-model-off` |
| on | sim | não | true | **false** | `consumption-flag-off` |
| on | sim | sim | true | **true** | `null` |

## Reversibilidade

1. **Desligar a flag** ⇒ próximo `apply` retorna o state atual verbatim (sem `genericKernelApplied`).
2. **Qualquer falha** ⇒ fallback automático para o fluxo atual, com o `readState` **original**
   preservado + `rollbackPlan` passivo (`safety.executesRollback === false`).
3. **Sem persistência real** ⇒ nada a desfazer no backend/Prisma/storage; a reversão é apenas a
   flag.
4. **Hook opcional não ligado** ⇒ a UI de Empresas/cadcps permanece no fluxo atual até um slice
   futuro decidir consumir `useModeloBase1GenericKernelConsumption`.

## Rollback plan (via fallback bridge)

- `strategy: 'flag-off'`
- `flags: ['MAK_MODELOBASE1_EMPRESAS_BETA', 'MAK_MODELOBASE1_CADCPS_BETA']`
- `resetTargets: ['local-draft', 'generic-adapter']`
- `safety.executesRollback: false` (plano passivo; nunca executa)
