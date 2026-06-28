# Event Catalog — Events Configuration Engine

**Versão:** V18  
**Branch:** `cursor/event-config-engine-v18-7d24`

Catálogo oficial de eventos e ações suportados declarativamente pela plataforma MAK Gestão.

---

## Eventos oficiais (lifecycle)

| Evento | Fase | Ordem típica |
|--------|------|--------------|
| `onBeforeLoad` | Pré-carregamento registro | 1 |
| `onLoad` | Registro carregado | 2 |
| `onAfterLoad` | Pós-carregamento | 3 |
| `onInit` | Inicialização módulo | — |
| `onReady` | Form pronto | 4 |
| `onMount` | Componente montado | 5 |
| `onUnmount` | Componente desmontado | — |
| `onOpen` / `onClose` | Dialog/painel | — |
| `onChange` | Campo alterado | runtime |
| `onInput` / `onFocus` / `onBlur` | Interação campo | runtime |
| `onBeforeSave` | Pré-submit | 1 (save) |
| `onValidationCompleted` | Pós-validação | 2 (save) |
| `onFormulaCalculated` | Pós-fórmula | 3 (save) |
| `onSave` | Submit | 4 (save) |
| `onAfterSave` | Pós-persistência | 5 (save) |
| `onBeforeDelete` / `onDelete` / `onAfterDelete` | Exclusão | sequencial |
| `onFormulaCalculated` | Recálculo fórmulas | após Formula Engine |
| `onValidationCompleted` | Resultado validação | após Validation Engine |
| `onLayoutChanged` | Layout alterado | — |
| `onPreferencesLoaded` / `onPreferencesSaved` | Preferências | — |

Lista completa em `MAK_EVENT_NAMES` (`makEventBuiltinActions.js`).

---

## Ações declarativas

| Ação | Descrição |
|------|-----------|
| `log` | Log estruturado (certificação/debug) |
| `emit` | `emitMakEvent` cross-module |
| `dispatch` | `dispatchModuleEvent` por moduleId |
| `setField` | Define valor de campo |
| `clearField` | Limpa campo |
| `computeField` | Define campo via expressão (Formula Engine) |
| `chain` | Encadeia handlers |
| `preventDefault` | Cancela operação (ex.: save) |
| `stopPropagation` | Interrompe pipeline |
| `noop` | No-op |

---

## Metadata keys

`events`, `listeners`, `handlers`, `emit`, `dispatch`, `subscribe`, `unsubscribe`, `priority`, `once`, `debounce`, `throttle`, `condition`, `when`, `before`, `after`, `preventDefault`, `stopPropagation`, `async`, `retry`, `timeout`, `action`, `field`, `event`

---

## Exemplo — onLoad

```javascript
{
  id: "mod-onLoad",
  event: "onLoad",
  priority: 100,
  handlers: [
    { action: "setField", field: "status", value: "ativo" },
    { action: "dispatch", suffix: "form-loaded" },
  ],
}
```

---

## Exemplo — onChange com condição

```javascript
{
  id: "mod-onChange-nome",
  event: "onChange",
  field: "nome",
  debounce: 300,
  when: { field: "status", equals: "Ativo" },
  handlers: [
    {
      action: "computeField",
      field: "contador",
      expression: { fn: "sum", args: [{ fn: "coalesce", args: ["contador", 0] }, 1] },
    },
  ],
}
```

---

## Exemplo — onBeforeSave (guard)

```javascript
{
  id: "mod-guard-save",
  event: "onBeforeSave",
  when: { field: "nome", empty: true },
  handlers: [{ action: "preventDefault" }],
}
```

---

## Exemplo — onSave + integração bus

```javascript
{
  id: "mod-onSave",
  event: "onSave",
  handlers: [
    { action: "dispatch", suffix: "record-saved" },
    { action: "emit", event: "mak:record-saved", payload: { source: "cadastro" } },
  ],
}
```

---

## Ordem de execução no submit

```
onBeforeSave → validateForm → onValidationCompleted → runMakFormulaEvaluation
  → onFormulaCalculated → onSave → onSubmit(payload) → onAfterSave
```

Prioridade: handlers com `priority` maior executam primeiro. `preventDefault` cancela save. `stopPropagation` interrompe handlers restantes da definição.

---

## Módulo de certificação

Ver `MAK_EVENT_CERTIFICATION_DEFINITIONS` em `src/framework/mak/events/eventCertificationCatalog.js` e módulo `eventscert`.
