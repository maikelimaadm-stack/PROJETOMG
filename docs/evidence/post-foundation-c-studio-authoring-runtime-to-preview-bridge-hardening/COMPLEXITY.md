# Complexity

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


Cycle check: O(n) (WeakSet, cada no visitado uma vez no caminho ativo). Clone: O(n). Profundidade limitada por
`MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH` -> stack-safe. Memoria O(n). Sem serializacao/clones repetidos redundantes e
sem comportamento quadratico: uma travessia de validacao + um clone limitado.
