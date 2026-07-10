# NEXT-SLICE-SPEC — POST-FOUNDATION C — GENERIC MODEL RUNTIME CONTRACTS FOUNDATION

## Objetivo

Criar a **primeira fundação genérica** em `src/runtime/generic-model/`: contratos puros + safety/fallback/diagnostics base + versioning/checksum, com testes e gate próprios — **sem** mover ou substituir o ModeloBase1. Camada paralela nova, aditiva, atrás de flag onde aplicável.

## Nome e path recomendados

- **Camada:** `src/runtime/generic-model/` (escolhido sobre `model-kernel`/`model-runtime`/`model-engine`/`universal-model` — "generic-model" é explícito, discoverable, alinhado ao naming `modelobase1-direct-beta` já em `src/runtime`, e não sobrecarrega "runtime"/"engine").
- **Estrutura:**
  ```
  src/runtime/generic-model/
    safety/            # promover safety.js genérico
    fallback/          # createGenericModelFallbackState
    diagnostics/       # createGenericModelDiagnostics
    read/              # GenericModelReadModel contract + validator
    write/             # GenericModelWriteContract + payload validation + controller (puro)
    persistence/       # GenericModelPersistenceContract + adapter (in-memory) + serialize/rehydrate/validate/version/checksum
    safety-policy/     # GenericModelSafetyPolicy (capability gates, default-blocked)
    types/             # typedefs
    __tests__/
  ```

## Escopo permitido

- **Criar:** `src/runtime/generic-model/**` (contratos puros + testes)
- `package.json` (scripts do novo teste/gate)
- `scripts/gates/` (novo gate)
- `docs/evidence/post-foundation-c-generic-model-runtime-contracts-foundation/`

## Escopo proibido

- Não mover/alterar `src/ModeloBase1/**` funcional (o ModeloBase1 permanece o caminho default).
- Não alterar `src/modules/**`, backend, APIs, Prisma, schema, `src/framework`, runtimeBridge/makBootstrap, Studio, Marketplace, BOS, outras telas, CSS global, App.jsx.
- Sem dependência nova. Sem fetch/Prisma/storage/backend. Sem React na camada de contratos (pura).

## Contratos a criar (puros, sem UI)

1. `GenericModelSafety` — promover `safety.js` (isPlainObject/findUnsafeContent/hasUnmaskedSensitive/hasForbiddenReference/safeClone), genérico, com testes.
2. `GenericModelFallback` — `createGenericModelFallbackState({ modelId, moduleId, reason })`.
3. `GenericModelDiagnostics` — builder parametrizável.
4. `GenericModelReadContract` + `validateGenericModelReadModel` — descritor + payload validation.
5. `GenericModelWriteContract` + `validateGenericModelWritePayload` — allowed/blocked + fail-closed.
6. `GenericModelLocalWriteController` — controller in-memory puro (create/update/delete/save/submit/reset), sobre cópia segura.
7. `GenericModelPersistenceContract` + `createGenericModelInMemoryAdapter` + `serialize/rehydrate/validateSnapshot/version/checksum`.
8. `GenericModelSafetyPolicy` — capability gates default-blocked (backend/prisma/runtimeBridge/sideEffects).
9. `errors` — fábrica de erro tipado genérica (`createModelError(code, message)`).

**Regra:** os contratos genéricos devem ser **portados a partir** do que o ModeloBase1 já provou (mesma lógica), mas **sem** nomes/paths/shape específicos do ModeloBase1 e **sem importar** ModeloBase1.

## Testes

`src/runtime/__tests__/generic-model-contracts-foundation.test.js` — cobrir: safety, fallback, diagnostics, read/write/persistence contracts, controller in-memory (não muta original, localOnly, backend/prisma/bridge false), serialize/validate/rehydrate (checksum, mask, fail-closed), versioning determinístico, safety policy default-blocked, sem import de ModeloBase1, sem backend/Prisma/fetch/storage, sem dependência nova.

## Gate

`scripts/gates/g424-generic-model-contracts-foundation.mjs` — arquivos existem; contratos puros; **nenhum import de `src/ModeloBase1`**; sem backend/Prisma/fetch/storage/runtimeBridge; sem CSS; sem dependência nova; escopo autorizado (`src/runtime/generic-model`, scripts/gates, package.json, docs/evidence); rodar o teste do slice.

## Não-regressão

Manter verdes: todos os gates g423 do ModeloBase1 + `gate:g423` + `test:runtime` + lint + build. O ModeloBase1 não é tocado; a camada genérica é paralela.

## Evidências

CERTIFICATION-REPORT, GENERIC-CONTRACTS-REPORT, SAFETY-POLICY-REPORT, PARITY-WITH-MODELOBASE1-NOTES (mostra que a lógica genérica espelha o MB1), QUALITY-SCALABILITY-NOTES, MODULE-DIAGRAMS.

## Relatório final esperado

Template rígido no padrão dos slices: nome/path da camada, contratos criados, safety policy default-blocked, zero acoplamento a ModeloBase1, gates/tests/lint/build, próximo passo (Fase 3 — ModeloBase1 Adapter to Generic Kernel).
