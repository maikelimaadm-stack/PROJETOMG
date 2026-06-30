const STORAGE_KEY = "mak-bos-workflow-tasks-v1";

function readStore() {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(tasks) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/** Task inbox — operações de negócio, não fila técnica */
export function createWorkflowTask(partial = {}) {
  return Object.freeze({
    taskId: partial.taskId ?? `task-${Date.now()}`,
    workflowId: partial.workflowId,
    workflowTitle: partial.workflowTitle ?? "Processo de aprovação",
    tenantId: partial.tenantId ?? "default",
    stateId: partial.stateId ?? "aguardando_aprovacao",
    stateLabel: partial.stateLabel ?? "Aguardando aprovação",
    assigneeRole: partial.assigneeRole ?? "aprovador",
    assigneeLabel: partial.assigneeLabel ?? "Aprovador responsável",
    dueAt: partial.dueAt ?? null,
    priority: partial.priority ?? "normal",
    explainability: partial.explainability ?? "",
    createdAt: partial.createdAt ?? new Date().toISOString(),
    history: Object.freeze([...(partial.history ?? [])]),
  });
}

export function listWorkflowTasks(tenantId = "default") {
  return readStore().filter((t) => t.tenantId === tenantId);
}

export function saveWorkflowTask(task) {
  const tasks = readStore().filter((t) => t.taskId !== task.taskId);
  tasks.unshift(task);
  writeStore(tasks);
  return task;
}

export function applyWorkflowTaskAction(taskId, action, actor = "business-user") {
  const tasks = readStore();
  const index = tasks.findIndex((t) => t.taskId === taskId);
  if (index < 0) return null;
  const task = tasks[index];
  const historyEntry = Object.freeze({
    action,
    actor,
    at: new Date().toISOString(),
    fromState: task.stateId,
  });
  const next = { ...task, history: [...(task.history ?? []), historyEntry] };
  if (action === "approve") {
    next.stateId = "aprovado";
    next.stateLabel = "Aprovado";
  } else if (action === "reject") {
    next.stateId = "rejeitado";
    next.stateLabel = "Rejeitado";
  } else if (action === "return") {
    next.stateId = "retornado_correcao";
    next.stateLabel = "Retornado para correção";
  } else if (action === "escalate") {
    next.stateId = "escalado";
    next.stateLabel = "Escalado";
  }
  tasks[index] = next;
  writeStore(tasks);
  return next;
}

export function seedDemoWorkflowTasks(tenantId = "default") {
  const existing = listWorkflowTasks(tenantId);
  if (existing.length) return existing;
  const demos = [
    createWorkflowTask({
      taskId: "task-demo-compras",
      workflowId: "bwf-demo-compras",
      workflowTitle: "Aprovação de compras",
      tenantId,
      explainability: "Pedido de compra aguarda aprovação do responsável financeiro.",
    }),
    createWorkflowTask({
      taskId: "task-demo-pedido",
      workflowId: "bwf-demo-pedido",
      workflowTitle: "Aprovação de pedidos",
      tenantId,
      stateId: "em_analise",
      stateLabel: "Em análise",
      explainability: "Pedido em revisão antes de encaminhar para aprovação.",
    }),
  ];
  demos.forEach(saveWorkflowTask);
  return demos;
}

export default listWorkflowTasks;
