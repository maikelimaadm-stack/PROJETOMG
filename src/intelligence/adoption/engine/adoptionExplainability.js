import { ADOPTION_STATUS_TYPES } from "./adoptionEngineContracts.js";

const STATUS_LABELS = Object.freeze({
  [ADOPTION_STATUS_TYPES.PROPOSED]: "Proposta",
  [ADOPTION_STATUS_TYPES.ACCEPTED]: "Aceita",
  [ADOPTION_STATUS_TYPES.REJECTED]: "Rejeitada",
  [ADOPTION_STATUS_TYPES.IN_PROGRESS]: "Em andamento",
  [ADOPTION_STATUS_TYPES.COMPLETED]: "Concluída",
  [ADOPTION_STATUS_TYPES.VALIDATING]: "Validando impacto",
  [ADOPTION_STATUS_TYPES.DEFERRED]: "Adiada",
});

export function explainAdoption(adoption) {
  if (!adoption) return null;
  const statusLabel = STATUS_LABELS[adoption.status] ?? "Em acompanhamento";
  return Object.freeze({
    adoptionId: adoption.adoptionId,
    title: adoption.title,
    statusLabel,
    because: `Recomendação ${statusLabel.toLowerCase()} — acompanhamento pertence à empresa, não ao modelo.`,
    progressPercent: adoption.progressPercent ?? 0,
    requiresHumanApproval: true,
    autonomousExecutionForbidden: true,
    explainable: true,
  });
}

export default explainAdoption;
