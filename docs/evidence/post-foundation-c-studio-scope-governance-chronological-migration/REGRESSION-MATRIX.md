# Regression matrix

| eixo | antes desta fatia | depois |
|---|---|---|
| identidade do chamador | inexistente | `callerSliceId` obrigatório; desconhecido bloqueia |
| identidade da fatia ativa | inexistente | resolvida por markers; zero e ambíguo bloqueiam |
| cronologia | não verificável | `active.ordinal >= caller.ordinal` |
| tolerância | por mera presença no registry | apenas primary/cross/shared da fatia ATIVA |
| autorização cruzada | inexistente | lista exata por fatia, não herdada |
| proibido | sempre vence | sempre vence (inalterado) |
| desconhecido | fail-closed | fail-closed (inalterado) |
| `productionUiGuard` | protegido | protegido e NÃO tocado por esta fatia |
| lista known-later | mantida à mão (137 entradas) | DERIVADA do catálogo, cobre 137/137 |
| 9 testes do agregado oficial | vermelhos numa branch Studio | verdes, com prova cronológica |
| 22 gates Studio | 1 check vermelho cada | verdes |
| 21 gates pré-Studio | vermelhos | vermelhos, documentados como não migrados |

## Não-regressão de compatibilidade

Todos os 137 padrões do antigo `KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS` estão presentes na lista derivada — verificado por comparação de fontes de regex. Os 8 gates que ainda consomem apenas a API antiga continuam funcionando sem alteração.

## Não-regressão funcional

Nos 9 testes e nos 22 gates migrados, apenas o check branch-relative de escopo mudou. Nenhum contrato, runtime, digest, invariante ou prova funcional foi tocado, e a quantidade de `gate(...)` de cada gate foi preservada.

## Correção pós-auditoria

| eixo | antes da correção | depois |
|---|---|---|
| origem da autorização forbidden | opção passada pelo caller | campo do catálogo da fatia ATIVA |
| injeção de regex ampla pelo caller | possível | impossível (opção removida da API) |
| `src/App.jsx` autorizado | saía de `forbidden`, caía em `unknown` | entra em `allowed` + `explicitForbiddenAuthorized` |
| fixture App Integration | provava só `forbidden=[]` | prova `safe=true`, 4/4 `allowed`, `unknown=[]` |
| herança da autorização | não provada | provada impossível (Builder e Migration ativos) |
| campo no catálogo | ausente | presente nas 42 entradas |
| checks históricos `/migration/i` | afrouxados globalmente | regra original + isenção exata da migration ativa |
| checks históricos `/menu\|nav/i` | afrouxados globalmente | idem |
| check histórico `/empresas/i` | afrouxado globalmente | idem |
| caminho apenas semelhante e não catalogado | passaria | bloqueia (8 fixtures provadas) |
| mesmo path exato com outra fatia ativa | não verificado | bloqueia (`chronologicalViolation`) |
