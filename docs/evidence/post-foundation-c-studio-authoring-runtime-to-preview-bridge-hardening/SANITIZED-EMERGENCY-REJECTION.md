# Sanitized Emergency Rejection

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


`createEmergencyBridgeRejection()` e independente do input hostil: nao le/serializa/reflete o input, nao invoca
accessors e nao pode lancar. Saida frozen deterministica: `ok:false · status:bridge_rejected ·
targetDescriptorCreated:false · targetDescriptor:null · issueCode:BRIDGE_UNEXPECTED_EXECUTION_FAILURE ·
sourceMutated:false · sideEffects:0 · externalCleanupRequired:false · databaseRollbackRequired:false ·
filesystemCleanupRequired:false · rollbackByNonConsumption:true`. Mensagem generica "Bridge execution failed closed."
Sem message/stack/cause/path/config/payload/segredo.
