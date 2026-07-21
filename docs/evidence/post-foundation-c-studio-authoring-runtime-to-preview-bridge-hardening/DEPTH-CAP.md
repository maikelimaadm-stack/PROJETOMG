# Depth Cap

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


Constante frozen `MAX_BRIDGE_SOURCE_STRUCTURE_DEPTH = 64`. Convencao: objeto/array de topo = profundidade 0;
cada nivel aninhado soma 1. Alem do limite -> `BRIDGE_SOURCE_STRUCTURE_TOO_DEEP` (blocker), sem truncagem, sem
alvo parcial. Testado em limite-1 (aceito), limite e limite+1 (rejeitado). `maxDepth` customizavel para teste.
