export function explainPersistentApproval(request) {
  if (!request) return null;
  return Object.freeze({
    label: request.label,
    because:
      request.status === "pending"
        ? "Aguardando decisão humana com trilha durável."
        : request.status === "approved"
          ? "Aprovado com política válida e auditoria."
          : request.status === "rejected"
            ? request.rejectionReason ?? "Rejeitado por administrador."
            : "Estado persistido com rastreabilidade.",
    explainable: true,
  });
}

export default explainPersistentApproval;
