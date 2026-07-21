# Accessor Rejection

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


Propriedades accessor (getter/setter) sao detectadas por `getOwnPropertyDescriptors` e **nunca invocadas** ->
`BRIDGE_SOURCE_ACCESSOR_PROPERTY_FORBIDDEN` (blocker). Um getter que lanca segredo nunca e executado: a decisao
e `bridge_rejected` sem vazar o segredo. Prova de efeito-zero: contador de invocacao permanece 0.
