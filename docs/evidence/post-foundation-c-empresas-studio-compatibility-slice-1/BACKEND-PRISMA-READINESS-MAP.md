# BACKEND/PRISMA READINESS MAP (documental)

`createEmpresasBackendPrismaReadinessMap()` — mapa **apenas documental**. Não lê banco,
não executa Prisma, não chama backend, não usa secrets. O `schema.prisma` pode ser lido
como texto, mas nunca alterado ou executado.

| item | currentState | confidence |
| --- | --- | --- |
| existingBackendApi | Fastify REST /api/empresas | high |
| existingPrismaSchema | Empresa model + unique constraints | high |
| existingRestApi | envelope paginado | high |
| existingJwt | tokenStore, multiempresa | medium |
| existingTenantColumns | cliente_id + unique | high |
| existingPermissionModel | PermissaoEmpresa (documented) | medium |

- futureReadinessChecks: schema drift (texto), tenant constraint audit, permission model
  audit, staging readiness
- futureAllowedChanges: readiness documental (contract-only)
- futureForbiddenChanges: migration na Slice 1, auto schema change, production write, acesso real
- requiresMigration: false · prismaExecuted: false · backendCalled: false · usesSecrets: false
