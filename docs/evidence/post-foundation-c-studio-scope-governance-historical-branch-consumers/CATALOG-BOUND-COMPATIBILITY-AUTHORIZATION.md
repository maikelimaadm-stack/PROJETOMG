# Autorização de compatibilidade vinculada ao catálogo

## O blocker

```
B-CONSUMER-INAPPLICABILITY-NOT-CATALOG-BOUND
```

A primeira versão de `evaluateStudioBranchConsumerScope` declarava um consumidor inaplicável
sempre que a fatia ativa da branch tivesse ordinal **anterior** ao dele, desde que a
autocertificação daquela fatia fosse limpa.

Isso é largo demais. Estar antes na cronologia não é permissão para carregar consumidores
posteriores — é apenas um fato sobre ordinais.

## O risco concreto

```
active slice = dev-preview-app-integration · ordinal 24 · status merged
consumer     = ordinal 43 ou 44
paths        = apenas artefatos legítimos da fatia 24
```

Com a regra antiga esse caso resultava em `notApplicable: true`, `safe: true`. Ou seja: qualquer
fatia Studio **já mergeada** voltava a ser uma branch válida do ponto de vista dos consumidores
posteriores. Uma branch antiga poderia ser reaberta, empurrada e certificada por omissão.

O objetivo desta fatia nunca foi esse. O objetivo é desbloquear **uma** branch histórica, a
única ainda aberta:

```
PR #495 · sliceId bridge-decision-core-envelope-builder · sliceOrdinal 41
status open_pull_request_495
```

## A correção

Novo campo obrigatório em **todas** as 44 entradas de `STUDIO_SLICE_CATALOG`:

```js
historicalBranchConsumerCompatibility: boolean
```

Distribuição:

```
43 entradas → false
 1 entrada  → true   (bridge-decision-core-envelope-builder, ordinal 41)
```

Nenhuma fatia com `status: 'merged'` é autorizada. As fatias de governança 9, 42 e 43 e a
própria fatia 44 são `false`. A fatia 24 é `false`.

O wrapper passa a exigir, no ramo `activeSlice.sliceOrdinal < consumer.sliceOrdinal`:

```js
if (activeSlice.historicalBranchConsumerCompatibility !== true) {
  // devolve o veredito do core, verbatim
  reason  = 'historical_branch_consumer_compatibility_not_authorized'
  blockers = ['active_slice_before_caller']
  notApplicable = false
  certifiedAgainstActiveSlice = false
  evaluatedAsSliceId = null
  safe = false
}
```

A autocertificação **não é sequer tentada** quando a autorização falta. Só depois de a
autorização existir é que o wrapper roda:

```js
evaluateStudioBranchScope(changedPaths, { callerSliceId: activeSlice.sliceId })
```

e mantém as duas saídas já certificadas: `consumer_slice_after_active_slice` (self limpa,
`safe: true`) e `active_slice_scope_invalid` (self suja, `safe: false`).

## Propriedades da autorização

| propriedade | como é garantida |
|---|---|
| **explícita** | campo booleano declarado, entrada por entrada, no catálogo |
| **catalog-bound** | o guard lê `activeSlice.historicalBranchConsumerCompatibility` e nada mais |
| **fail-closed** | ausente, `undefined`, `null`, `0`, `'true'` — qualquer coisa que não seja o booleano `true` bloqueia (`!== true`) |
| **não herdável** | é lida da fatia **ativa**, nunca da fatia consumidora |
| **não inferida por ordinal** | ordinais menores existem em 43 fatias; só uma é autorizada |
| **não inferida por status** | há mais de uma fatia não-`merged`; só uma é autorizada. O guard não contém `status` nem `open_pull_request` |
| **não inferida por branch/PR/ambiente** | o guard não contém nome de branch, número de PR, `process.env`, rede ou GitHub |
| **não injetável** | opção do chamador é ignorada: `{ historicalBranchConsumerCompatibility: true }`, `{ allowHistorical: true }`, `{ ignoreChronology: true }`, `{ expectedActiveSlice: … }` continuam reprovando |
| **sem SSOT paralelo** | não existe lista, set, export derivado ou constante espelhando a autorização; o único lugar é a entrada do catálogo |
| **não substitui a autocertificação** | autorização é condição **necessária**, nunca suficiente |

## O que continua reprovando na branch autorizada

Mesmo com `historicalBranchConsumerCompatibility: true`, a fixture Builder acrescida de
`src/App.jsx`, `backend/server.js`, `src/modules/x.js`, `scripts/gates/lib/productionUiGuard.mjs`,
`prisma/schema.prisma`, `src/pages/x.jsx`, `docs/nobody/x.md`, um caminho de fatia estrangeira ou
um segundo marcador continua `safe: false`, com `certifiedAgainstActiveSlice: true` — prova de
que a recertificação rodou e foi ela quem reprovou.

## Como reverter, se um dia for preciso

Quando a PR #495 for mergeada, sua entrada deve voltar a `historicalBranchConsumerCompatibility:
false` e o catálogo volta a ter zero fatias autorizadas — o estado natural. Manter `true` numa
fatia mergeada seria exatamente o defeito que este campo existe para impedir.
