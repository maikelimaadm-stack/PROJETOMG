# Workflow Catalog — Workflow Configuration Engine

**Versão:** V20  
**Branch:** `cursor/workflow-config-engine-v20-7d24`

---

## Estrutura declarativa

```javascript
{
  id: "wf-example",
  start: "draft",
  finish: ["completed", "cancelled"],
  states: {
    draft: { label: "Rascunho", status: "draft" },
    completed: { label: "Concluído" },
  },
  onStart: [ /* steps */ ],
  transitions: [
    {
      id: "t-submit",
      from: "draft",
      trigger: "submit",
      to: "completed",
      when: { field: "nome", notEmpty: true },
      before: [{ type: "validate" }],
      steps: [
        { type: "formula" },
        { action: "save" },
      ],
      rollback: [{ action: "setField", field: "status", value: "revertido" }],
      parallel: false,
      retry: 0,
      timeout: 0,
    },
  ],
}
```

---

## Tipos de step

| Tipo | Integração |
|------|------------|
| `validate` | Validation Engine |
| `formula` | Formula Engine |
| `event` | Events Engine |
| `action` | Actions Engine |
| `sequence` / `parallel` | Pipeline interno |
| `when` / `branch` | Condicional |
| `approval` / `rejection` | Metadados de aprovação |
| `wait` / `delay` | Temporização |
| `rollback` | Reversão |
| `notification` | Dispatch de evento |

---

## Triggers / transições

| Trigger | Uso |
|---------|-----|
| `start` | Inicialização (`onStart`) |
| `submit` | Submissão |
| `approve` / `reject` | Aprovação |
| `cancel` | Cancelamento |
| `complete` | Finalização |
| Custom | Qualquer string declarada |

---

## Integração Events → Workflow

```javascript
{
  event: "onLoad",
  handlers: [{ action: "runWorkflow", workflowId: "wf-create", trigger: "start" }],
}
```

---

## Máquina de estados

1. Resolve estado atual (`workflowState` ou `start`)
2. Localiza transição (`from` + `trigger` + `when`)
3. Executa `before` → `steps` (sequencial ou `parallel`)
4. Em falha: `rollback`
5. Atualiza estado para `to`
6. Registra `history` / `audit`
7. Executa `onEnter` do estado destino

---

## Metadata keys

`workflow`, `steps`, `transitions`, `start`, `finish`, `state`, `status`, `condition`, `when`, `before`, `after`, `parallel`, `sequence`, `branch`, `rollback`, `retry`, `timeout`, `approval`, `rejection`

---

## Certificação

Ver `MAK_WORKFLOW_CERTIFICATION_DEFINITIONS` em `workflowCertificationCatalog.js` e módulo `workflowcert`.
