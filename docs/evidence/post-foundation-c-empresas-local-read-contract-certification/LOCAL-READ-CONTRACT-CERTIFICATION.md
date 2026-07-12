# Local Read Contract Certification

Pacote local de certificação do contrato read-only de Empresas. Puro, local, read-only, sintético,
versionado, verificável, imutável. Nunca é consumido automaticamente pela aplicação.

## Componentes (`src/modules/empresas/local-read-contract-pilot/certification/`)

| Arquivo | Papel |
|---|---|
| `empresasLocalReadCertificationConfig.js` | versão do contrato, flags, createdAt determinístico |
| `errors.js` | erro tipado MAK-EMP-CERT-001..005 |
| `createEmpresasCanonicalContract.js` | contrato canônico (record/envelope/getById/count/query/safety) |
| `createEmpresasCanonicalFixtures.js` | fixtures imutáveis (small 20 / medium 250) + digests |
| `createEmpresasCanonicalQueryCatalog.js` | 32 cenários canônicos + expectedDigest |
| `createEmpresasCanonicalErrorCatalog.js` | 22 tipos de erro canônicos |
| `createEmpresasCanonicalTenantRules.js` | 16 regras de tenant + leak check |
| `createEmpresasCanonicalPermissionRules.js` | 12 regras de permissão + bypass check |
| `createEmpresasCanonicalParityBaseline.js` | paridade repository × API × runtime |
| `createEmpresasLocalPerformanceEnvelope.js` | envelope de performance local (não-SLA) |
| `createEmpresasCertificationManifest.js` | manifesto + digests + overallDigest + status |
| `verifyEmpresasLocalReadCertification.js` | verifier (detecta qualquer alteração de digest) |
| `checkEmpresasContractCompatibility.js` | classificador de compatibilidade |
| `createEmpresasCertificationDiagnostics.js` | diagnostics |
| `createEmpresasCertificationFallback.js` | fallback fail-closed |
| `createEmpresasLocalReadContractCertification.js` | composer top-level |
| `index.js` | barrel puro |

## Resultado

`certified_local_read_only`; verifier `certified: true`; `safeToUseAsReference: true`; exact parity
1.0; sem leak/bypass/mutation; performance sem anomalia; overallDigest determinístico.
