# Generic Kernel Consumption Report

## Objetivo

Fazer o fluxo **beta** de Empresas e cadcps **consumir** o Generic Model Kernel através do
adapter do ModeloBase1 (`generic-model-adapter/`), atrás de flags, com fallback total e
reversibilidade — **sem reescrever ModeloBase1**, **sem substituir** os validadores atuais de uma
vez e **sem remover** o fluxo atual.

## Ponto de integração

A camada de consumo vive em `src/ModeloBase1/generic-model-adapter/activation/` e opera sobre o
**state de leitura ModeloBase1 já aplicado** (o output de `useModeloBase1RuntimeReadModel` /
`applyModeloBase1RuntimeReadModel`), **antes** de o `table`/`form` ser entregue ao
`ModeloBase1CadastroPageContent`.

- Função pura: `applyModeloBase1GenericKernelConsumption({ moduleId, readState, env, createAdapter? })`.
- Hook opcional (integração futura, **não** ligado à UI neste slice):
  `useModeloBase1GenericKernelConsumption(readState, options)`.

O engine do ModeloBase1 **não** é reescrito; a camada é aditiva e reversível.

## Flags

| Flag | Escopo |
|---|---|
| `MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION` | umbrella |
| `MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL` | Empresas |
| `MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL` | cadcps |
| `*_ALLOW_PROD` (3 variantes) | fail-open explícito em produção |

Default off; fail-closed em produção salvo `*_ALLOW_PROD`. Consumo **só liga com `betaApplied === true`**.

## Adapter usado

`createModeloBase1GenericModelAdapter({ moduleId })` (PR #438), consumindo:
- `mapReadToGeneric` → `mapModeloBase1RuntimeReadToGenericModel` (+ `validateGenericModelReadModel`);
- `mapGenericToRead` → `mapGenericModelReadToModeloBase1State`;
- safety/fallback/diagnostics bridges do kernel genérico.

## Read flow (flag on + beta)

```
readState (MB1 aplicado)
  → adapter.mapReadToGeneric → GenericModelReadModel + validação
  → adapter.mapGenericToRead → state MB1-compatível normalizado
  → merge no readState original (preserva campos; anota genericKernelApplied:true)
  → apply atual do ModeloBase1
```

## Fallback

Flag off, `runtimeReadModel` ausente, adapter ausente/falho, validação genérica falha, mapping
back inválido, payload inseguro, erro interno → **fluxo atual do ModeloBase1** com o `readState`
original preservado + `rollbackPlan` passivo. `reason` em `{consumption-flag-off,
beta-read-model-off, generic-validation-failed, invalid-read-model, adapter-failure}`.

## Diagnostics

`createModeloBase1GenericKernelConsumptionDiagnostics` reporta `genericKernelApplied`,
`readiness` (`generic-kernel`/`legacy`), `reason`, resumo de validação, e invariantes
`localOnly:true`/`persistenceReal:false`/`backend|prisma|runtimeBridge Touched:false`/
`noSideEffects:true`/`reversible:true`.

## Limitations

- A UI de Empresas/cadcps continua no fluxo atual: o hook opcional **não** é ligado neste slice.
- O kernel genérico **complementa/normaliza** `table`/`form`; **não** substitui os validadores MB1.
- Persistência é memory-only (`persistenceReal:false`); nada é escrito no backend/Prisma/storage.

## Próximo passo recomendado

**ModeloBase1 Generic Kernel Hardening** ou **modeloBase2 Prototype Adapter** — **não** backend write.
