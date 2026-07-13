# EMPRESAS PERMISSION & TENANT BLUEPRINT MIRROR

## Permission mirror

Classifica cada ação do canonical permission contract contra o estado observado:

- read → existing (certificado)
- create/update → reference_only (existe na UI; não certificado → needs_alignment)
- delete → reference_only (dangerous_if_default_open)
- export/diagnostics → inferred · configure/admin → needs_alignment · approve → missing

Regras: defaultDeny true · failClosed true · admin não contorna tenant · **nenhuma
permissão criada ou alterada**. Gaps registrados (8).

## Tenant mirror

- cliente_id → certificado (tenant field primário, protegido)
- erp_empresa_id → documentado (scoping multiempresa, não certificado)
- empresaHeader → documentado (header de empresa ativa)

Regras: tenantRequired true · permissionRequired true · tenant nunca contornado ·
admin não contorna tenant · **nenhum JWT real usado, nenhum endpoint chamado**.
Escopo: list/get/count/permission tenant-scoped pelo contrato.
