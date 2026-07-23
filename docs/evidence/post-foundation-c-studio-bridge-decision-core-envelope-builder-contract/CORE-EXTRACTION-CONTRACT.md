# Core Extraction Contract

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

Estratégia: `exact_allowlist_pick` sobre 32 campos. `unknownSourceFieldsRejected: true`, `versionDriftFailsClosed: true`. O core NUNCA inclui `bridgeDecisionDigest`.

Allowlist:
- `kind`
- `bridgeVersion`
- `mode`
- `ok`
- `status`
- `targetDescriptorCreated`
- `targetDescriptor`
- `issues`
- `issueCount`
- `blockerCount`
- `errorCount`
- `warningCount`
- `stages`
- `stageCount`
- `sourceMutated`
- `sideEffects`
- `externalCleanupRequired`
- `databaseRollbackRequired`
- `filesystemCleanupRequired`
- `rollbackByNonConsumption`
- `partialTargetDescriptor`
- `previewMounted`
- `appTouched`
- `routeCreated`
- `menuCreated`
- `persisted`
- `productExposed`
- `moduleGenerated`
- `certificationPerformed`
- `realDataRead`
- `idempotent`
- `replaySideEffectsAllowed`

---
_Evidência gerada como parte do slice Post-Foundation C — Studio Bridge Decision Core Envelope Builder Contract. Memória = repositório._
