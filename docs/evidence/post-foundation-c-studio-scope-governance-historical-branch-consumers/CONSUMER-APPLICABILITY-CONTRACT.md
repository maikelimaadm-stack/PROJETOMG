# Consumer applicability contract

```js
evaluateStudioBranchConsumerScope(changedPaths, { callerSliceId })
```

Responde: **"este consumidor é aplicável a esta branch e, se não for, a branch continua segura
segundo a própria fatia ativa?"**

Nunca substitui a certificação central. Nunca autoriza nada por omissão.

## Estados

### Input inválido — fail-closed

Não-array, item não-string, item vazio:

```
consumerApplicable = false · applicable = false · notApplicable = false
reason = 'invalid_changed_paths' · safe = false
blockers inclui 'invalid_changed_paths'
```

Input inválido **nunca** é convertido em diff vazio.

### Caller desconhecido — fail-closed

```
notApplicable = false · reason = 'unknown_caller_slice' · safe = false
```

Vale com diff vazio ou cheio: identidade inválida nunca é mascarada.

### Diff vazio — não aplicável

```
consumerApplicable = false · applicable = false · notApplicable = true
reason = 'empty_branch_diff' · safe = true
allowed = [] · activeSliceId = null · blockers = []
certifiedAgainstActiveSlice = false
```

Não autoriza nada.

### Active não resolvida ou ambígua — fail-closed

```
notApplicable = false · safe = false
reason = 'no_active_slice_resolved' | 'ambiguous_active_slice'
```

Nenhuma fatia é inventada; o maior ordinal não vence; `activeCandidates` é reportado verbatim.

### Active igual ou posterior ao caller — o consumidor É o certificador

Delega integralmente a `evaluateStudioBranchDiffScope`:

```
consumerApplicable = true · applicable = true · notApplicable = false
certifiedAgainstActiveSlice = false
allowed / forbidden / unknown / chronologicalViolation / crossAuthorized /
explicitForbiddenAuthorized / blockers / safe  preservados byte a byte
```

### Active ANTERIOR ao caller — o caso histórico

**Não** vira PASS diretamente. Primeiro o MESMO conjunto de caminhos é certificado contra a
própria fatia ativa resolvida:

```js
evaluateStudioBranchScope(changedPaths, { callerSliceId: activeSliceId })
```

Se essa avaliação for segura:

```
consumerApplicable = false · applicable = false · notApplicable = true
reason = 'consumer_slice_after_active_slice'
safe = true
certifiedAgainstActiveSlice = true
evaluatedAsSliceId = activeSliceId
consumerSliceId / consumerSliceOrdinal preservados
allowed / crossAuthorized / explicitForbiddenAuthorized vêm da self-evaluation
```

Se falhar:

```
consumerApplicable = false · applicable = false · notApplicable = false
reason = 'active_slice_scope_invalid'
safe = false
certifiedAgainstActiveSlice = true
forbidden / unknown / chronologicalViolation / blockers propagados
```

Logo, um consumidor posterior **nunca** mascara: forbidden · unknown · path estrangeiro · cross
não autorizada · explicit-forbidden que não pertence à ativa · active não resolvida · active
ambígua.

## Relatório

```
kind = 'studio-branch-consumer-scope-evaluation'
consumerSliceId · consumerSliceOrdinal
activeSliceId · activeSliceOrdinal · activeCandidates
evaluatedAsSliceId
consumerApplicable · applicable · notApplicable · reason
certifiedAgainstActiveSlice
total · allowed · forbidden · unknown · chronologicalViolation
crossAuthorized · explicitForbiddenAuthorized
blockers · safe
sideEffects · backendAccessed · prismaAccessed · fetchUsed · mutationAllowed
```

Objeto top-level congelado. Determinístico (independe da ordem do input). Input nunca mutado.

## Regras para o consumidor

```
consumerApplicable = true  → exigir safe = true
notApplicable = true       → aceitar SOMENTE
                             'empty_branch_diff'
                             'consumer_slice_after_active_slice' com certifiedAgainstActiveSlice = true
qualquer outra razão       → falhar
```

Nunca aceitar `notApplicable` genericamente.

## Pureza

Sem git, filesystem, env, rede, relógio, backend, Prisma ou mutação.
