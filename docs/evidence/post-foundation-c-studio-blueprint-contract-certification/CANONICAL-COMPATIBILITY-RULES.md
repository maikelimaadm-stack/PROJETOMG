# CANONICAL COMPATIBILITY RULES

`createStudioCanonicalCompatibilityRules()` certifica, via o classificador do
hardening, que toda liberação de capacidade sensível é **breaking** e que adições são
**backward_compatible**.

## Breaking (força major version)

ui/route/menu/moduleRegistration/backend/prisma/migration/production/staging/fetch/
mutation/generatedModule/marketplace false→true · defaultDeny/failClosed/tenantRequired/
permissionRequired true→false · route/menu default false→true · persistence default
noPersistence→write · delete default false→true · protected editable false→true ·
error code removido · blueprint status removido · metamodel entity removida ·
contractVersion alterado sem política.

## Backward compatible (minor)

novo optional field · novo error code · novo placeholder screen disabled · novo field
type planejado disabled.

`valid: true` quando todas as regras breaking e backward se sustentam.
