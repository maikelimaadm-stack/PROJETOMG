# Sparse Array Rejection

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


Buracos em arrays (via indice, `delete` ou `length`) -> `BRIDGE_SOURCE_SPARSE_ARRAY_FORBIDDEN` (blocker), fail-closed.
Arrays densos (incl. vazios) sao aceitos. Deteccao via `hasOwnProperty` por indice, sem materializar buracos.
