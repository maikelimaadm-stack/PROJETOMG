# Manifest enterprise — 23 partes

Ordem canônica:

01 configSchema · 02 publicApi · 03 sourceFields · 04 sourceRequiredFields · 05 sourceEligibility · 06 sourceSecurity · 07 targetFields · 08 targetRequiredFields · 09 targetSecurityFields · 10 targetVersionTuple · 11 targetDigestFields · 12 targetInvariants · 13 coreAllowlist · 14 envelopeFields · 15 envelopeInvariants · 16 pipelineStages · 17 issueCodes · 18 issueShape · 19 issueStageAllowlist · 20 resourceDimensionsAndValues · 21 identityArchitecture · 22 failureContainmentAndReplay · 23 readinessAndManualGate

- `partCount === 23`
- digest FNV-1a por parte, sobre a serialização canônica com chaves ordenadas
- `overallDigest` determinístico sobre os pares (nome, digest) na ORDEM canônica
- os VALORES dos nove limites estão dentro da parte 20
- a API pública (factory + `factoryResultKeys` + ausência de seam) está na parte 02
- owner e arquitetura estão na parte 21, derivados do contrato upstream
- o manual gate está na parte 23
- `cryptographicIntegrityProvided: false` — identidade interna, não garantia criptográfica

Adulterar qualquer uma das 23 partes altera o digest daquela parte E o overall — provado parte a parte no teste e no gate via `digestManifestParts()`.
