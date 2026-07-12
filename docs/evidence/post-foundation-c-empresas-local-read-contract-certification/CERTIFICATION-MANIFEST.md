# Certification Manifest

`createEmpresasCertificationManifest(...)` agrega todos os digests.

## Campos

certificationId, contractName, contractVersion (1.0.0), certificationVersion (1.0.0), status,
createdAt (determinístico/injetável), environment, synthetic/localOnly/readOnly, mutation/production/
backend/prisma/fetch flags (false), fixtureVersion, fixtureDigest, canonicalContractDigest,
queryCatalogDigest, errorCatalogDigest, tenantRulesDigest, permissionRulesDigest,
parityCertificationDigest, performanceEnvelopeDigest, overallDigest, exactParity, parityScore,
tenantLeakageFound, permissionBypassFound, mutationExposureFound, blockers, warnings, limitations,
nextSteps.

## Status possíveis

`certified_local_read_only` (resultado esperado), blocked, invalid, expired, superseded, draft.

O `overallDigest` é derivado dos digests + exactParity + parityScore + status — determinístico e
recomputável pelo verifier.
