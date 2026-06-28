# Action Catalog — Actions Configuration Engine

**Versão:** V19  
**Branch:** `cursor/action-config-engine-v19-7d24`

Catálogo oficial de ações suportadas declarativamente pela plataforma MAK Gestão.

---

## Tipos de ação oficiais

| Tipo | Descrição |
|------|-----------|
| `save` | Submete formulário |
| `duplicate` | Duplica registro |
| `delete` | Exclui registro |
| `refresh` | Atualiza dados |
| `setField` | Define um campo |
| `setFields` | Define múltiplos campos |
| `clearField` | Limpa campo |
| `computeField` | Campo via Formula Engine |
| `validate` | Executa Validation Engine |
| `calculateFormula` | Executa Formula Engine |
| `openDialog` / `closeDialog` | Controle de dialogs |
| `openDrawer` / `closeDrawer` | Controle de drawers |
| `navigate` | Navegação declarativa |
| `executeApi` | Chamada HTTP/API |
| `executeCallback` | Callback nomeado |
| `executeService` | Serviço nomeado |
| `emit` / `dispatch` | Eventos cross-module |
| `runAction` | Referencia ação por id |
| `sequence` / `chain` | Execução sequencial |
| `parallel` | Execução paralela |
| `when` | Condicional then/else |
| `delay` | Atraso (ms) |
| `rollback` | Reverte transação |
| `log` | Telemetria/log |
| `preventDefault` / `stopPropagation` | Controle de fluxo |

Lista completa: `MAK_ACTION_TYPE_NAMES` em `makActionBuiltinTypes.js`.

---

## Metadata keys

`actions`, `execute`, `run`, `sequence`, `parallel`, `condition`, `when`, `before`, `after`, `retry`, `timeout`, `delay`, `continueOnError`, `rollback`, `transaction`, `permissions`, `target`, `payload`, `context`, `parameters`, `result`, `response`

---

## Exemplo — sequence (salvar)

```javascript
{
  id: "save-flow",
  action: "sequence",
  actions: [
    { action: "validate" },
    { action: "calculateFormula" },
    { action: "save" },
    { action: "dispatch", suffix: "record-saved" },
  ],
}
```

---

## Exemplo — parallel

```javascript
{
  id: "parallel-updates",
  action: "parallel",
  actions: [
    { action: "setField", field: "status", value: "ok" },
    { action: "dispatch", suffix: "parallel-complete" },
  ],
}
```

---

## Exemplo — condicional

```javascript
{
  id: "conditional-flag",
  action: "when",
  when: { field: "flag", notEmpty: true },
  then: [{ action: "setField", field: "status", value: "ativo" }],
  else: [{ action: "setField", field: "status", value: "inativo" }],
}
```

---

## Exemplo — executeApi (mock certificação)

```javascript
{
  id: "api-mock",
  action: "executeApi",
  mock: true,
  method: "GET",
  url: "/api/modulo/ping",
  target: "api_result",
  response: { ok: true },
}
```

---

## Exemplo — rollback

```javascript
{
  id: "tx-with-rollback",
  action: "sequence",
  rollback: [{ action: "setField", field: "status", value: "revertido" }],
  actions: [
    { action: "setField", field: "status", value: "processando" },
    { action: "executeCallback", name: "riskyOperation" },
  ],
}
```

---

## Ordem de execução (pipeline)

1. Avalia `when` / `condition` da definição raiz  
2. Ordena por `priority` (maior primeiro)  
3. Executa `sequence` passo a passo ou `parallel` via `Promise.all`  
4. Em falha: aplica `rollback` se definido (salvo `continueOnError: true`)  
5. Propaga `patch` de campos ao formulário  
6. Retorna `{ ok, results, patch, response }`

---

## Integração Events → Actions

Handlers de eventos usam os mesmos tipos de ação via `executeMakAction`:

```javascript
{
  event: "onLoad",
  handlers: [{ action: "runAction", actionId: "save-flow" }],
}
```

---

## Módulo de certificação

Ver `MAK_ACTION_CERTIFICATION_DEFINITIONS` em `src/framework/mak/actions/actionCertificationCatalog.js` e módulo `actionscert`.
