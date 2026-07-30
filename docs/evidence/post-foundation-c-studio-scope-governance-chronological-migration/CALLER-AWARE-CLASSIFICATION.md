# Caller-aware classification

`evaluateStudioBranchScope(changedPaths, { callerSliceId, explicitlyAuthorizedForbiddenPatterns })`

## Regras, em ordem

1. caminho proibido SEMPRE bloqueia;
2. pertencer ao catálogo NUNCA libera um caminho proibido;
3. `callerSliceId` desconhecido bloqueia;
4. fatia ativa não resolvida ou ambígua bloqueia;
5. ativa === chamadora admite primary / cross / shared da própria fatia;
6. ativa POSTERIOR admite apenas primary / cross / shared da fatia ATIVA;
7. ativa ANTERIOR bloqueia (`active_slice_before_caller`);
8. caminho de outra fatia catalogada sem autorização cruzada da ativa bloqueia (`unauthorized_foreign_slice_path`);
9. caminho de ninguém bloqueia (`unknown_scope`);
10. autorização cruzada pertence a quem a declara e nunca é herdada.

## Relatório

```
callerSliceId · callerSliceOrdinal
activeSliceId · activeSliceOrdinal · activeCandidates
total · allowed · forbidden · unknown · chronologicalViolation · crossAuthorized
blockers · safe
sideEffects:false · backendAccessed:false · prismaAccessed:false · fetchUsed:false · mutationAllowed:false
```

Determinístico e independente da ordem de entrada: avaliar a mesma lista invertida produz um relatório idêntico.

## Compatibilidade

`classifyStudioScopePath`, `isKnownLaterStudioHeadlessArtifact`, `filterForbiddenScopePaths`, `filterUnknownScopePaths`, `filterKnownLaterStudioHeadlessArtifacts`, `assertNoForbiddenScopePaths` e `createStudioScopeGovernanceReport` continuam existindo para os consumidores ainda não migrados. Eles são explicitamente SEM cronologia — a resposta cronológica é `evaluateStudioBranchScope`.
