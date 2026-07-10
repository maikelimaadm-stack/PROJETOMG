# Post-Foundation C — Certification Report — ModeloBase1 Adapter to Generic Kernel

**Slice:** Post-Foundation C — ModeloBase1 Adapter to Generic Kernel
**Branch:** `claude/post-foundation-c-modelobase1-adapter-to-generic-kernel`
**Áreas:** ModeloBase1 · Generic Model Runtime · runtime v2

## Objetivo

Criar um **adapter fino** entre o ModeloBase1 e o `src/runtime/generic-model/` kernel — reaproveitando safety/fallback/diagnostics/versioning/snapshot/write validation genéricos — **sem substituir** o fluxo atual do ModeloBase1.

## Arquivos criados

| File | Papel |
|---|---|
| `src/ModeloBase1/generic-model-adapter/errors.js` | Erro tipado MAK-MB1-GA-001..005 |
| `.../createModeloBase1GenericModelAdapter.js` | Adapter top-level (compõe as bridges) |
| `.../mapModeloBase1RuntimeReadToGenericModel.js` | MB1 read state → GenericModelReadModel + validação/fallback |
| `.../mapGenericModelReadToModeloBase1State.js` | GenericModelReadModel → MB1 state (preserva shape) |
| `.../createModeloBase1GenericSafetyBridge.js` | Ponte safety (sanitize/detect/mask) |
| `.../createModeloBase1GenericDiagnosticsBridge.js` | Ponte diagnostics |
| `.../createModeloBase1GenericFallbackBridge.js` | Ponte fallback + rollback plan |
| `.../createModeloBase1GenericWriteBridge.js` | Ponte write (MB1 ops → generic ops) |
| `.../createModeloBase1GenericPersistenceBridge.js` | Ponte persistence (snapshot roundtrip) |
| `src/runtime/__tests__/modelobase1-adapter-to-generic-kernel.test.js` | 16 casos (cobrindo os 50 cenários) |
| `scripts/gates/g423-modelobase1-adapter-to-generic-kernel.mjs` | Gate do slice (28 checks) |
| `docs/evidence/post-foundation-c-modelobase1-adapter-to-generic-kernel/*` | 8 evidências |

## Arquivos modificados

| File | Alteração |
|---|---|
| `package.json` | Scripts `test:runtime:modelobase1-generic-adapter` + `gate:g423-modelobase1-generic-adapter` + append no `test:runtime` |
| `scripts/gates/g423-generic-model-contracts-foundation.mjs` | Correção de robustez cross-slice: checks 13/14 passam de git-diff branch-relativo para **isolamento por import-scan** + **barrel puro** (a foundation permanece verde ao adicionarmos este adapter). Nenhuma garantia enfraquecida — o isolamento real (não importar ModeloBase1/backend) é preservado permanentemente. |

**ModeloBase1 (engine/hooks/UI existentes) NÃO reescrito.** Apenas a pasta nova `generic-model-adapter/` foi adicionada. **Empresas/cadcps NÃO alterados.**

## Adapter

- **path:** `src/ModeloBase1/generic-model-adapter/`
- **read bridge:** MB1 runtimeReadModel ↔ GenericModelReadModel (valida + fallback; preserva table/form shape)
- **write bridge:** createRow/updateRow/deleteRow/saveDraft/submitDraft/resetDraft → create/update/delete/saveDraft/submitDraft/resetDraft (localOnly, fail-closed)
- **persistence bridge:** MB1 draft → GenericModelSnapshot → validate → adapter save/load (roundtrip; `persistenceReal:false`)
- **safety bridge:** sanitize/detect/mask (bloqueia fn/handler/React/pollution/target)
- **diagnostics bridge:** generic diagnostics + sinais MB1 (betaApplied/fallbackApplied/writeBlocked)
- **fallback bridge:** generic fallback + rollback plan (não executor)
- **dangerous capabilities default:** `backendWrite`/`workflow`/`connector`/`marketplacePublish` = **false**
- **ModeloBase1 behavior changed:** **Não** (adapter aditivo; UI segue o fluxo atual)
- **Empresas/cadcps changed:** **Não**

## Testes

| Item | Resultado |
|---|---|
| `test:runtime:modelobase1-generic-adapter` | ✅ 16/16 |
| `test:runtime` | ✅ 1302/1302 |

## Gates

| Gate | Resultado |
|---|---|
| `gate:g423-modelobase1-generic-adapter` (novo) | ✅ 28/28 |
| `gate:g423-generic-model-contracts-foundation` | ✅ 39/39 |
| `gate:g423-modelobase1-local-persistence-validation` | ✅ 27/27 |
| `gate:g423-modelobase1-*` (activation/plan/hardening/wiring/direct-beta) | ✅ verdes |
| `gate:g423` (master) | ✅ 7/7 |
| `gate:modelo-base1` / `-consolidation-v151` / `-visual-cert-v152` / `paridade-empresas` / `generator` | ✅ exit 0 |

> `gate:paridade-visual` continua falhando por `spawnSync /bin/sh ENOENT` — ambiental, idêntico em `origin/main` limpo. Não corrigido (fora do escopo).

## Lint / Build

- `lint`: ✅ exit 0 · `build`: ✅ exit 0

## Segurança

- ModeloBase1 engine reescrito? **Não.** · Empresas/cadcps alterados? **Não.**
- backend/Prisma/schema/runtimeBridge alterados? **Não.** · App.jsx/CSS global/dependência nova? **Não.**
- React importado no adapter? **Não.** · fetch/storage obrigatório? **Não.**

## Status

**PASS.**
