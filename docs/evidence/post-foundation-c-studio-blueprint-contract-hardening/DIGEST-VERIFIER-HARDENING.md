# DIGEST & VERIFIER HARDENING

## Digest hardening suite (16 checks — `allPassed: true`)

mesmo input → mesmo digest · ordem relevante muda digest · safety/permission/tenant/
route-menu/persistence/validation/field/status change muda digest · secret-like value
sanitizado/bloqueado · input não mutado · circular bloqueado · função bloqueada ·
undefined determinístico · key order normalizada.

`safeStudioDigest(input)` bloqueia função/circular e sanitiza chaves secret-like; nunca
muta o input.

## Verifier hardening suite (19 tampers — `allRejected: true`)

Para cada adulteração o verifier retorna `valid:false` e
`safeToUseAsFoundationReference:false`: manifest/foundation/metamodel/blueprint/safety/
persistence/route-menu/permission digest alterado · blockers não vazios ·
ui/route/menu/backend/prisma/migration/production/mutation habilitados · defaultDeny/
failClosed false. A fundação íntegra permanece `valid:true`.
