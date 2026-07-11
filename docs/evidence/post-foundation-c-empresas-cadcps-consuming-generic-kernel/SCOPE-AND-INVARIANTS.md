# Scope & Invariants — Empresas/cadcps Generic Kernel Consumption

## O que este slice FAZ

- Adiciona uma camada de **consumo** (`generic-model-adapter/activation/`) que roteia o
  `runtimeReadModel` beta já aplicado **através** do adapter ModeloBase1 → generic kernel,
  atrás de flags, com fallback.
- Consumo **gradual**: off = fluxo atual; on + beta = passa pelo kernel antes de aplicar; falha =
  fallback para o fluxo atual.
- Fornece um **hook opcional** (`useModeloBase1GenericKernelConsumption`) como ponto de integração
  futuro — **não** ligado à UI de Empresas/cadcps neste slice.

## O que este slice NÃO faz (garantias)

- **Não reescreve o ModeloBase1** (engine/hooks/UI existentes intocados).
- **Não substitui** de uma vez os validadores atuais — o kernel genérico é adicional.
- **Não remove** o fluxo atual — ele continua sendo o default e o fallback.
- **Não altera** `src/modules/empresas` nem `src/modules/cadcps`.
- **Não toca** backend/APIs/Prisma/schema/framework compartilhado/runtimeBridge real/
  makBootstrap real/Studio/Marketplace/BOS/App.jsx/menu/CSS global/auth-permissões globais.
- **Não adiciona** dependências novas.

## Capacidades perigosas (permanecem `false`)

`backendWrite`, `workflow`, `connector`, `marketplacePublish` — herdadas do adapter/kernel,
nunca ligadas pelo consumo.

## Invariantes de execução

| Invariante | Onde |
|---|---|
| `localOnly: true` | state consumido + diagnóstico |
| `persistenceReal: false` | state consumido + diagnóstico |
| `backendTouched: false` | state consumido + diagnóstico |
| `prismaTouched: false` | state consumido + diagnóstico |
| `runtimeBridgeTouched: false` | state consumido + diagnóstico |
| `noSideEffects: true` | diagnóstico |
| `reversible: true` | diagnóstico |

## Escopo de arquivos (autorizado)

```
src/ModeloBase1/generic-model-adapter/activation/*.js   (novo)
src/runtime/__tests__/empresas-cadcps-consuming-generic-kernel.test.js   (novo)
scripts/gates/g423-empresas-cadcps-consuming-generic-kernel.mjs   (novo)
scripts/gates/g423-modelobase1-adapter-to-generic-kernel.mjs   (robustez cross-slice: check 16)
package.json   (scripts)
docs/evidence/post-foundation-c-empresas-cadcps-consuming-generic-kernel/*   (novo)
```

## Verificação de isolamento (import-scan)

O gate prova, por varredura de imports recursiva da pasta `activation/`:
- React só no hook opcional;
- nenhum import de `src/apis`/Prisma/`src/backend`/`makBootstrap`/`runtimeBridge`/
  `src/modules/(empresas|cadcps)`;
- nenhum `fetch(`/`XMLHttpRequest`/`WebSocket`/`localStorage.`/`sessionStorage.`/`indexedDB.`.
