import { BUSINESS_WORKFLOW_BUSINESS_STATES } from "../contracts/businessWorkflowContracts.js";

/** Business-facing workflow states — never BPMN/technical labels */
export function createDefaultBusinessWorkflowStates() {
  return Object.freeze([
    Object.freeze({ id: "solicitado", label: "Solicitado", description: "Pedido registrado pelo solicitante." }),
    Object.freeze({ id: "em_analise", label: "Em análise", description: "Equipe revisa informações." }),
    Object.freeze({
      id: "aguardando_aprovacao",
      label: "Aguardando aprovação",
      description: "Aguardando decisão do responsável.",
    }),
    Object.freeze({ id: "aprovado", label: "Aprovado", description: "Processo aprovado." }),
    Object.freeze({ id: "rejeitado", label: "Rejeitado", description: "Processo rejeitado com motivo." }),
    Object.freeze({
      id: "retornado_correcao",
      label: "Retornado para correção",
      description: "Solicitante deve corrigir e reenviar.",
    }),
    Object.freeze({ id: "escalado", label: "Escalado", description: "Prazo excedido — escalonamento automático." }),
    Object.freeze({ id: "concluido", label: "Concluído", description: "Processo finalizado." }),
  ]);
}

export function createDefaultBusinessWorkflowTransitions(approvers = []) {
  const primaryApprover = approvers[0] ?? { role: "aprovador", label: "Aprovador" };
  return Object.freeze([
    Object.freeze({
      id: "submit",
      from: "solicitado",
      to: "em_analise",
      label: "Enviar para análise",
      trigger: "business_action",
    }),
    Object.freeze({
      id: "send_approval",
      from: "em_analise",
      to: "aguardando_aprovacao",
      label: "Encaminhar para aprovação",
      assignee: primaryApprover,
    }),
    Object.freeze({
      id: "approve",
      from: "aguardando_aprovacao",
      to: "aprovado",
      label: "Aprovar",
      requiresHumanApproval: true,
      assignee: primaryApprover,
    }),
    Object.freeze({
      id: "reject",
      from: "aguardando_aprovacao",
      to: "rejeitado",
      label: "Rejeitar",
      requiresHumanApproval: true,
      assignee: primaryApprover,
    }),
    Object.freeze({
      id: "return_correction",
      from: "aguardando_aprovacao",
      to: "retornado_correcao",
      label: "Retornar para correção",
      requiresHumanApproval: true,
    }),
    Object.freeze({
      id: "resubmit",
      from: "retornado_correcao",
      to: "em_analise",
      label: "Reenviar após correção",
    }),
    Object.freeze({
      id: "escalate",
      from: "aguardando_aprovacao",
      to: "escalado",
      label: "Escalar por prazo",
      automatic: true,
    }),
    Object.freeze({
      id: "complete",
      from: "aprovado",
      to: "concluido",
      label: "Concluir processo",
    }),
  ]);
}

export function validateBusinessWorkflowStates(states) {
  const ids = (states ?? []).map((s) => s.id);
  const invalid = ids.filter((id) => !BUSINESS_WORKFLOW_BUSINESS_STATES.includes(id));
  return Object.freeze({
    ok: invalid.length === 0 && ids.length >= 2,
    invalid,
  });
}

export default createDefaultBusinessWorkflowStates;
