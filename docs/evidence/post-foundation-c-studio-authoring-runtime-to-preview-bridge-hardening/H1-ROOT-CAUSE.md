# H-1 Root Cause

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Hardening** · evidencia.
> Endurece a ponte headless mergeada (PR #485) contra entradas ciclicas, excessivamente profundas, esparsas,
> nao-JSON-safe e hostis. Sem UI/App/mount/persistencia/backend/Prisma/modulo/certificacao/produto.
> Edicoes ficam DENTRO da subarvore ja registrada `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/`
> (35 .js preservados); apenas o teste, o gate e este diretorio de evidencias sao novos.


## Causa
`normalizeBridgeInput.clone()` era uma recursao sem cycle-guard nem depth-cap, executada ANTES de qualquer
validacao. Um `sourceHandoff` com ciclo (direto/indireto/array) ou profundidade adversarial estourava a pilha
(`RangeError: Maximum call stack size exceeded`); `execute()`/`createBridgeDecision` nao tinham `try/catch`,
entao a excecao ESCAPAVA em vez de virar decisao `bridge_rejected`. Viola o contrato fail-closed (§18 da auditoria).

## Alcancabilidade
Nao alcancavel pelo round-trip real (handoff do Authoring Runtime e sempre aciclico/JSON-safe). So por objeto
adversarial passado direto a `execute()`. Dev-only, headless, sem exposicao externa; sem vazamento de segredo.
