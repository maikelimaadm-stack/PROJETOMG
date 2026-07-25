# Real Source bridgeDecision Shape

> Contrato: `studio-bridge-decision-core-envelope-builder-contract@1.0.0` — headless, dev-only, síntese-only, in-memory, efêmero, determinístico, imutável, fail-closed, side-effect-free. Definição apenas; nenhum builder é construído, nenhuma decisão consumida, nenhum core extraído, nenhum digest recomputado, nenhum envelope emitido em runtime.

Campos reais capturados READ-ONLY (33 campos):

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
- `bridgeDecisionDigest`

Campo do digest: `bridgeDecisionDigest`. Provado ao vivo: `createDeterministicDigest(core) === decision.bridgeDecisionDigest`. Inalterado por esta correção.

---
_Evidência do slice Post-Foundation C — Studio Core Envelope Builder Verification State Classification Correction (correção pós-#492). Memória = repositório._
