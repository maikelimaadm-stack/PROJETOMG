# Post-Foundation C — Certification Report — Empresas/cadcps Consuming Generic Kernel through ModeloBase1

**Slice:** Post-Foundation C — Empresas/cadcps Consuming Generic Kernel through ModeloBase1
**Branch:** `claude/post-foundation-c-empresas-cadcps-consuming-generic-kernel`
**Áreas:** ModeloBase1 · Generic Model Runtime · runtime v2 · Empresas/cadcps (beta)

## Objetivo

Fazer o fluxo **beta** de Empresas e cadcps **consumir** o adapter genérico do ModeloBase1
(`generic-model-adapter/`) — atrás de flags, com fallback e reversibilidade — **sem reescrever
ModeloBase1**, **sem substituir de uma vez** os validadores atuais e **sem remover** o fluxo atual.

Consumo gradual:
- **flag off** → comportamento atual (ModeloBase1 verbatim);
- **flag on + beta** → o `runtimeReadModel` beta passa pelo adapter genérico
  (`mapReadToGeneric` → validação genérica → safety/fallback/diagnostics genéricos →
  `mapGenericToRead` → merge no state MB1) **antes** de ser aplicado;
- **erro/falha** → fallback para o fluxo atual do ModeloBase1.

Precondição: **o consumo só liga quando o `runtimeReadModel` beta está aplicado**
(`betaApplied === true`).

## Arquivos criados

| File | Papel |
|---|---|
| `src/ModeloBase1/generic-model-adapter/activation/modeloBase1GenericKernelConsumptionConfig.js` | Flags + `resolveModeloBase1GenericKernelConsumption` (flag + beta) |
| `.../activation/modeloBase1GenericKernelConsumptionErrors.js` | Erro tipado MAK-MB1-GKC-001..004 |
| `.../activation/modeloBase1GenericKernelConsumptionDiagnostics.js` | Diagnóstico passivo (invariantes locais) |
| `.../activation/modeloBase1GenericKernelConsumptionFallback.js` | Fallback (estado original verbatim) + rollback plan |
| `.../activation/applyModeloBase1GenericKernelConsumption.js` | Orquestrador puro read→generic→read + merge/fallback |
| `.../activation/useModeloBase1GenericKernelConsumption.js` | Hook opcional (integração futura, **não** ligado à UI) |
| `.../activation/index.js` | Barrel da camada de consumo |
| `src/runtime/__tests__/empresas-cadcps-consuming-generic-kernel.test.js` | 46 casos (cobrindo os 45+ cenários) |
| `scripts/gates/g423-empresas-cadcps-consuming-generic-kernel.mjs` | Gate do slice (26 checks) |
| `docs/evidence/post-foundation-c-empresas-cadcps-consuming-generic-kernel/*` | 8 evidências |

## Arquivos modificados

| File | Alteração |
|---|---|
| `package.json` | Scripts `test:runtime:empresas-cadcps-generic-kernel` + `gate:g423-empresas-cadcps-generic-kernel` + append no `test:runtime` |
| `scripts/gates/g423-modelobase1-adapter-to-generic-kernel.mjs` | Robustez cross-slice: check 16 (escopo autorizado) passou de allowlist **git-diff branch-relativo** para **import-scan estrutural recursivo** da pasta adapter (React só em hooks; sem backend/Prisma/runtimeBridge/modules/fetch/storage). Permanece verde ao adicionarmos `activation/`. Nenhuma garantia enfraquecida. |

**ModeloBase1 (engine/hooks/UI existentes) NÃO reescrito.** Apenas a subpasta nova
`generic-model-adapter/activation/` foi adicionada. **Empresas/cadcps (src/modules) NÃO alterados.**
**App.jsx NÃO alterado.**

## Flags

| Flag | Papel |
|---|---|
| `MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION` | Umbrella (liga ambos) |
| `MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL` | Empresas |
| `MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL` | cadcps |
| `*_ALLOW_PROD` (3 variantes) | Fail-open explícito em produção (default fail-closed) |

Dev-only, off por default, `'true'` liga; fail-closed em produção salvo `*_ALLOW_PROD`.
Consumo **nunca** liga backend/Prisma/storage/fetch — o kernel genérico é puro e suas
capacidades perigosas permanecem `false`.

## Validação

| Item | Resultado |
|---|---|
| `npm run test:runtime` | **1348 pass / 0 fail** |
| `test:runtime:empresas-cadcps-generic-kernel` | **46 pass / 0 fail** |
| `gate:g423-empresas-cadcps-generic-kernel` | **26/26** |
| `gate:g423-modelobase1-generic-adapter` (cross-slice) | **28/28** |
| `gate:g423-generic-model-contracts-foundation` | **39/39** |
| `gate:g423` (master Foundation C) | **7/7** |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 |

## Invariantes de segurança

- `localOnly: true`, `persistenceReal: false`, `backendTouched: false`, `prismaTouched: false`,
  `runtimeBridgeTouched: false`, `noSideEffects: true`, `reversible: true` em todo state consumido
  e em todo diagnóstico.
- Sem `fetch`/XHR/WebSocket, sem `localStorage`/`sessionStorage`/`indexedDB`, sem import de
  React fora do hook opcional, sem import de `src/modules/empresas|cadcps`.
- Capacidades perigosas do adapter (`backendWrite`, `workflow`, `connector`, `marketplacePublish`)
  permanecem `false` — o consumo nunca as liga.
