# Issue model estrito — sem fallback

O contrato declara `silentCorrectionAllowed:false` e `permissiveFallbackAllowed:false`. O modelo agora cumpre isso literalmente.

## Eliminado

| Fallback anterior | Agora |
|---|---|
| issueCode desconhecido → `BUILDER_CONFIG_INVALID` | `BuilderIssueConstructionError('unknown_issue_code')` |
| stage fora da allowlist → `'unknown'` | `BuilderIssueConstructionError('stage_outside_allowlist')` |
| severity desconhecida → `'blocker'` | `BuilderIssueConstructionError('unknown_severity')` |
| path inválido → `''` silencioso | `BuilderIssueConstructionError('invalid_path')` |
| issue malformada → ignorada em `normalizeIssues` | lança |
| alias `code` | lança `issue_code_alias_forbidden` |

Path OMITIDO continua `''` — isso é ausência, não correção.

`normalizeIssues` falha fechado em: lista não-array, entrada não-objeto, shape incompleta, campo extra, code/stage/severity/path inválidos e alias `code`.

## Contenção no boundary público

Qualquer falha interna vira UMA rejeição fixa:

- `issueCode: BUILDER_UNEXPECTED_EXECUTION_FAILURE`
- `stage: public_boundary`
- `severity: blocker`

`createEmergencyBuilderRejection()` é auto-contido: constrói a issue literalmente e não reentra em nenhum helper estrito, logo nunca lança. Sem stack, cause, mensagem raw, source, config ou path interno. O builder público nunca lança ao caller — provado contra proxies hostis (`ownKeys`, `getOwnPropertyDescriptor`, `getPrototypeOf`), números, strings, `null`, `undefined`, símbolos e funções.

Nenhuma issue emitida pelo builder carrega o stage `unknown` — ele não existe mais.
