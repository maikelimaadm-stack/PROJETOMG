# Pre-Hardening Reproduction

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


Reproducao read-only ANTES da correcao (na branch de hardening, pre-fix):

```
self-cycle object    THREW RangeError
indirect cycle       THREW RangeError
self-cycle array     THREW RangeError
deep nesting         THREW RangeError
```

Ponto interno: recursao de `clone()` em `normalizeBridgeInput.js`, chamada por `execute()`. Depois da correcao,
os mesmos casos retornam `bridge_rejected` fail-closed, sem lancar.
