# Canonical Tenant & Permission Rules

## Tenant rules (16)

tenant obrigatório; header obrigatório quando aplicável; tenant/header coerentes; tenant/token
coerentes; erpEmpresaId pertence ao tenant; list/getById/count respeitam tenant; filtros/sort/paginação
não contornam tenant; runtime projection respeita tenant; fallback respeita tenant; contexto inválido
fail-closed; admin não contorna tenant; **tenant leakage invalida certificação**.

- `failClosed: true`, `tenantLeakageAllowed: false`, `certificationBlockerOnLeakage: true`,
  `tenantLeakageFound: false` (verificado ao vivo sobre a fixture medium).

## Permission rules (12)

read exige permissão; ausência/vazia/inválida/outro-módulo bloqueiam; parcial fail-closed; admin
sintético read-only; permissão não contorna tenant/header/token; **nenhuma permissão libera mutation**;
**permission bypass invalida certificação**.

- `failClosed: true`, `mutationPermissionExists: false`, `permissionBypassAllowed: false`,
  `certificationBlockerOnBypass: true`, `permissionBypassFound: false` (verificado ao vivo).
