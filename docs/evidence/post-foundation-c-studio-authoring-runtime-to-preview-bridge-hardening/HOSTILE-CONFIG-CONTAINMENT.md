# Hostile Config Containment

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


A fabrica `createStudioAuthoringRuntimeToPreviewBridge` envolve a construcao em `try/catch`: `limits`/
`expectedVersions`/`extensionSchemas` com getter que lanca, Proxy hostil, prototype customizado ou ciclo -> fallback
fail-closed (`reason:'hostile_bridge_config'`) cujo `execute()` sempre rejeita. Config externa nao pode mutar a
instancia (deep-frozen; clonada na construcao).
