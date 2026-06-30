import { createBusinessIntentDocument } from "../document/intentDocument.js";
import { CAPABILITY_WORKFLOW } from "../contracts/intentContracts.js";

export function createBusinessWorkflowLanguageInput(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-language-input-v1",
    assetKind: "workflow",
    objective: partial.objective ?? "",
    processDescription: partial.processDescription ?? partial.process ?? "",
    condition: partial.condition ?? null,
    expectedResult: partial.expectedResult ?? "",
    approvers: Object.freeze([...(partial.approvers ?? [{ role: "aprovador", label: "Aprovador responsável" }])]),
    process: Object.freeze({
      processId: partial.process?.processId ?? partial.processId ?? "approval-process",
      moduleId: partial.process?.moduleId ?? partial.moduleId ?? "empresas",
      entityId: partial.process?.entityId ?? partial.entityId ?? "operacao",
      slaHours: partial.process?.slaHours ?? partial.slaHours ?? 48,
      escalationRole: partial.process?.escalationRole ?? partial.escalationRole ?? "supervisor",
      approvers: Object.freeze([...(partial.approvers ?? [])]),
    }),
    organizationId: partial.organizationId ?? null,
    tenantId: partial.tenantId ?? "default",
    authoredBy: partial.authoredBy ?? "business-user",
    metadata: Object.freeze({ ...(partial.metadata ?? {}) }),
  });
}

export function businessWorkflowLanguageToIntent(input, options = {}) {
  const intentPhrase = [
    input.objective,
    input.processDescription ? `Processo: ${input.processDescription}` : null,
    input.condition ? `Quando: ${input.condition}` : null,
    input.expectedResult ? `Resultado: ${input.expectedResult}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const processRef = input.process ?? {};

  return createBusinessIntentDocument({
    id: options.intentId ?? `intent-${processRef.processId ?? "workflow"}`,
    title: input.objective || "Fluxo de aprovação",
    intentPhrase,
    category: "Process",
    description: input.processDescription ?? input.expectedResult ?? "",
    subject: {
      businessObjectId: `${processRef.moduleId ?? "default"}.${processRef.entityId ?? "default"}`,
      moduleId: processRef.moduleId ?? "default",
      entityId: processRef.entityId ?? "default",
      fieldId: processRef.processId ?? "approval-process",
    },
    capabilities: [{ capabilityId: CAPABILITY_WORKFLOW, role: "requires", parameters: {} }],
    processes: [
      {
        processId: processRef.processId ?? "approval-process",
        ownerProcessId: processRef.processId ?? "approval-process",
        moduleId: processRef.moduleId ?? "default",
        entityId: processRef.entityId ?? "default",
        approvers: input.approvers ?? processRef.approvers ?? [],
        slaHours: processRef.slaHours ?? 48,
        escalationRole: processRef.escalationRole ?? "supervisor",
        description: input.processDescription ?? "",
      },
    ],
    goals: input.objective ? [{ phrase: input.objective }] : [],
    conditions: input.condition ? [{ phrase: input.condition }] : [],
    outcomes: input.expectedResult ? [{ phrase: input.expectedResult }] : [],
    lifecycle: "approved",
    organizationId: input.organizationId,
    tenantId: input.tenantId,
    authoredBy: input.authoredBy,
    metadata: input.metadata,
    revision: options.revision ?? 1,
  });
}

export default createBusinessWorkflowLanguageInput;
