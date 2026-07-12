# Local Read Parity Hardening — Report

Endurecimento do contrato local read-only de Empresas (`hardening/` sobre o piloto isolado). Puro,
local, read-only, sintético. Nada de rede/backend/Prisma/produção/mutation.

## Componentes (`src/modules/empresas/local-read-contract-pilot/hardening/`)

| Arquivo | Papel |
|---|---|
| `empresasLocalReadHardeningConfig.js` | flags locais + perfis de dataset (tiny/small/medium/large) |
| `errors.js` | erro tipado MAK-EMP-HARD-001..005 |
| `createEmpresasScaledSyntheticDataset.js` | dataset em escala (4/20/250/2000), >=4 tenants, seed determinístico |
| `createEmpresasCompositeQueryMatrix.js` | 26 cenários de query composta |
| `createEmpresasTenantFuzzMatrix.js` | 12 cenários de fuzz de tenant; leak-free |
| `createEmpresasPermissionMatrix.js` | 11 perfis de permissão; fail-closed; sem bypass |
| `createEmpresasReadErrorContract.js` | 22 tipos de erro sanitizados |
| `createEmpresasParityDigest.js` | digest FNV-1a determinístico |
| `createEmpresasParityScenarioRunner.js` | paridade repository × API × runtime (exata) |
| `createEmpresasReadPerformanceBaseline.js` | baseline local (não SLA), clock injetável |
| `createEmpresasReadHardeningDiagnostics.js` | agregador + readiness |
| `createEmpresasReadHardeningFallback.js` | fallback fail-closed |
| `validateEmpresasHardeningInvariant.js` | validador de invariantes |
| `index.js` | barrel puro |

## Resultado

- exact parity: **true**, score **1.0**
- tenant leakage: **false** (12 cenários, todas as superfícies)
- permission bypass: **false** (11 perfis; admin sintético continua read-only)
- mutation exposure: **false**
- performance: 32 medições, sem anomalia, não-SLA
- readiness: **ready_for_local_certification**

## Correção relevante

O helper `createGenericModelChecksum` recebe `{ value }`; as chamadas do hardening foram ajustadas
para passar `{ value: ... }`, garantindo que o digest de paridade realmente detecte divergência de
ids/ordem/tenant/permissão/página (a versão anterior produziria um hash constante).
