# BridgeDecisionCore Shape

Exactly the real preimage; digest never inside; targetDescriptor inside.

- targetDescriptorInsideCore: true
- digestFieldInsideCore: false
- coreExtraFieldsAllowed: false
- coreMissingFieldsAllowed: false
- coreAliasesAllowed: false
- coreDefaultsAllowed: false
- coreFieldCoercionAllowed: false
- coreIsExactRealPreimage: true

Classifications:
- identity: status, bridgeVersion
- status: ok, status
- version: bridgeVersion
- security: previewMounted, appTouched, routeCreated, menuCreated, persisted, productExposed, moduleGenerated, certificationPerformed, realDataRead, sourceMutated
- target: targetDescriptor, targetDescriptorCreated
- issue: issues, issueCount, blockerCount, errorCount, warningCount
- rollback: rollbackByNonConsumption, externalCleanupRequired, databaseRollbackRequired, filesystemCleanupRequired, partialTargetDescriptor
- diagnostic: kind, mode, stages, stageCount, sideEffects, idempotent, replaySideEffectsAllowed
