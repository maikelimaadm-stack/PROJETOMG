# GENERIC CONTRACTS FOUNDATION REPORT

## Objetivo
Criar a fundação genérica inicial (`src/runtime/generic-model/`) para todos os modelos MAK futuros — contratos e utilitários puros, sem substituir o ModeloBase1.

## Path criado
`src/runtime/generic-model/` com subpastas: errors, safety, fallback, diagnostics, versioning, persistence, write, read, contracts + `index.js` (barrel).

## Contratos criados
- **GenericModelReadContract** (`createGenericModelReadContract`) + `validateGenericModelReadModel`.
- **GenericModelWriteContract** (`createGenericModelWriteContract`) + `validateGenericModelWritePayload`.
- **GenericModelRuntimeContract** (`createGenericModelRuntimeContract`) — consolida read+write+persistence+safety+capabilities.
- **GenericModelSafetyPolicy** (`createGenericModelSafetyPolicy`) — capacidades perigosas default-blocked.
- **PersistenceContract** (shape via runtime contract + adapter + snapshot).

## Utilitários criados
- **errors:** `createGenericModelError` (plano, mascara sensível, dropa função) + 10 códigos GM-RUNTIME-0xx.
- **safety:** `sanitizeGenericModelPayload`, `assertGenericModelPlainObject`/`isGenericModelPlainObject`/`safeCloneGenericModel`, `detectGenericModelUnsafeMarkers`/`detectGenericModelForbiddenTargetKeys`.
- **fallback:** `createGenericModelFallback`, `createGenericModelRollbackPlan` (plano, não executor).
- **diagnostics:** `createGenericModelDiagnostics`.
- **versioning:** `createGenericModelVersion` (determinístico), `createGenericModelChecksum` (FNV-1a).
- **persistence:** `createGenericModelInMemoryAdapter`, `createGenericModelSnapshot`, `validateGenericModelSnapshot`.

## O que ficou fora de escopo (por design)
- **Não** move o ModeloBase1 para a pasta genérica.
- **Não** reescreve o ModeloBase1.
- **Não** troca Empresas/cadcps para consumir o kernel.
- **Não** cria adapters de modelos (modeloBase2..6).
- **Não** implementa persistência real, backend, Prisma, Studio, Marketplace.

## Princípios
Puro · determinístico · sem React/DOM/backend/Prisma/fetch/runtimeBridge/storage obrigatório · sem dependência nova · testável por `node --test` · capacidades perigosas false por padrão.

## Próximo passo recomendado
**ModeloBase1 Adapter to Generic Kernel** (Fase 3) — adapter fino experimental do ModeloBase1 consumindo o kernel, provado por teste, sem substituir o caminho atual.
