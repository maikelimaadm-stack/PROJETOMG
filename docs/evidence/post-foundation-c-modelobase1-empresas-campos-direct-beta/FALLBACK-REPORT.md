# FALLBACK REPORT — ModeloBase1 Direct Beta

## Contrato de fallback

Com **qualquer** flag beta desligada (padrão) ou bloqueada em produção:

1. `isEmpresasModeloBase1BetaEnabled()` / `isCadcpsModeloBase1BetaEnabled()` retornam `false`.
2. A config do módulo passa `runtimeReadModel: null` ao builder.
3. `normalizeModeloBase1RuntimeReadModel(null)` → `null`.
4. O builder **não adiciona** a chave `runtimeReadModel` ao config.
5. `ModeloBase1CadastroPage` recebe o config **byte-idêntico** ao pré-slice.

Resultado: a tela real de Empresas e a de Campos Personalizados renderizam exatamente como antes. Nenhuma leitura runtime v2 ocorre.

## Por que é byte-idêntico (e não só "equivalente")

O builder usa spread condicional:

```js
...(runtimeReadModel ? { runtimeReadModel } : {})
```

Quando `runtimeReadModel` é `null`, o objeto de config resultante **não contém** a chave — não é `runtimeReadModel: null`, é ausência de chave. Portanto o shape do config é idêntico ao anterior à introdução do slot. Todos os demais módulos (que nunca passam a override) também ficam idênticos.

## Estados de fallback

| Estado | Flag | Ambiente | Resultado |
|---|---|---|---|
| Padrão | off | dev | fallback (legado) |
| Dev on | on | dev/preview | beta injetado (read-only) |
| Produção sem override | on | production | **fail-closed** → fallback |
| Produção com override | on + `*_ALLOW_PROD` | production | beta injetado (read-only) |
| Umbrella | `MAK_MODELOBASE1_DIRECT_BETA` | dev | as duas telas beta |

## Descritor de fallback (diagnóstico)

`createModeloBase1DirectBetaFallback({ moduleId, reason })` produz um descritor passivo (`injected:false`, `usesLegacyConfig:true`, `reversible:true`) — **não é injetado**; existe para inspeção/telemetria de por que o beta está ausente. `isModeloBase1DirectBetaFallback(readModel)` reconhece `null`/`undefined`/`{enabled:false}` como fallback.

## Verificação

- Teste 10/17/27/28/29/30 do slice cobrem: off → não injetado; injection point no-op quando ausente; fallback descriptor; reconhecimento de fallback.
- Gate check 9/10: injection point no-op + builder anexa só quando presente.
