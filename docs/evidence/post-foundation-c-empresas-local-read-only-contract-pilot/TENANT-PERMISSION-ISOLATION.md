# Tenant & Permission Isolation

`createEmpresasSyntheticTenantContext({ preset })` — contextos sintéticos, sem JWT real, sem secret.

## Presets

| Preset | Resultado | Motivo |
|---|---|---|
| `A` | válido (Tenant A) | leitura autorizada |
| `B` | válido (Tenant B) | leitura autorizada |
| `noPermission` | **fail-closed** | sem `empresas.read` |
| `noHeader` | **fail-closed** | `empresaHeader` ausente |
| `invalidHeader` | **fail-closed** | header não corresponde a tenant |
| `tenantMismatch` | **fail-closed** | header/tenant divergem |
| `expiredToken` | **fail-closed** | claims sintéticos expirados |
| `noScope` | **fail-closed** | token sem scope |

## Isolamento verificado (testes 25–30)

- Tenant A lista **apenas** `cliente_id = MAK_TEST_CLIENTE_A`.
- Tenant B lista **apenas** `cliente_id = MAK_TEST_CLIENTE_B`.
- `getById` de um registro de B com contexto A → `null`.
- `count` respeita o tenant.
- Nenhum ID de A aparece em B e vice-versa (sem leakage).

## Regras do repository (`resolveContext`, fail-closed)

`valid=false` → bloqueado · sem `empresas.read` → `permission-denied` · sem `empresaHeader` →
`missing-header` · sem `tenantId` → `missing-tenant` · `empresaHeader != erpEmpresaId` →
`tenant-mismatch`. Só passa quando **todas** as condições são satisfeitas.

## Nunca

JWT real · assinatura · secret · tenant produtivo · usuário produtivo.
