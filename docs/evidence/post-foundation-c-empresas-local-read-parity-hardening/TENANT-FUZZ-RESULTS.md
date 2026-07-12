# Tenant Fuzz Results

`createEmpresasTenantFuzzMatrix({ dataset })` — 12 cenários determinísticos (sem aleatoriedade sem seed).

## Cenários

valid · tenant-nonexistent · tenant-null · tenant-empty · tenant-whitespace · tenant-header-mismatch ·
tenant-token-mismatch · erp-invalid · header-missing · header-invalid · permission-denied ·
prototype-pollution.

## Verificação de leakage (todas as superfícies)

list · sorted · filtered · paged · getById (registro de outro tenant) · runtime projection. Para cada
contexto, nenhum registro com `cliente_id` diferente do contexto pode aparecer.

## Resultado

- `totalScenarios: 12`
- `leakageFound: false`
- `leakageCases: []`
- `safe: true`

"Bloqueado" = o contexto não lê nenhum registro (fail-closed ou tenant sem registros). Nunca há
vazamento entre tenants.
