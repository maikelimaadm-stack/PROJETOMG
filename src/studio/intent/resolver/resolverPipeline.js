import { validateBusinessIntentDocument } from "../document/intentDocument.js";
import { createResolverContext } from "./resolverContext.js";
import { createResolverSession, finalizeResolverSession } from "./resolverSession.js";
import { resolveCapabilities } from "./capabilityResolution.js";
import { validateCapabilities } from "./capabilityValidation.js";
import { checkCapabilityCompatibility } from "./capabilityCompatibility.js";
import { planDerivations } from "./derivationPlanning.js";
import { executeComputedFieldDerivation } from "./computedFieldDerivation.js";
import { executeWorkflowDerivation } from "./workflowDerivation.js";
import { buildExplainabilityReport } from "./explainability.js";
import { createResolverTelemetry } from "./telemetry.js";
import { createResolverResult } from "./regeneration.js";
import {
  INTENT_RESOLVER_VERSION,
  RESOLVER_DOCUMENT_VERSION,
  RESOLVER_RESULT_VERSION,
} from "../contracts/intentContracts.js";

export const RESOLVER_PIPELINE_STAGES = Object.freeze([
  "intent_intake",
  "capability_resolution",
  "capability_validation",
  "capability_compatibility",
  "derivation_planning",
  "derivation_execution",
  "projection",
  "validation",
]);

function createDiagnostic(code, message, severity = "blocking", extra = {}) {
  return Object.freeze({ code, message, severity, ...extra });
}

/**
 * Official Resolver Pipeline — sole resolution path (D-064/D-068).
 * Produces Business Computed Field → Formula Document projection.
 */
export function runResolverPipeline(intentDocument, options = {}) {
  const stageLatency = {};
  const t0 = Date.now();

  const intentValidation = validateBusinessIntentDocument(intentDocument);
  stageLatency.intent_intake = Date.now() - t0;

  if (!intentValidation.ok) {
    return createResolverResult({
      ok: false,
      status: "failed",
      diagnostics: Object.freeze(
        intentValidation.errors.map((e) => createDiagnostic("INTENT_INVALID", e, "blocking"))
      ),
      session: options.session ?? null,
      context: null,
    });
  }

  const context = createResolverContext(intentDocument, options);
  const session =
    options.session ??
    createResolverSession({
      tenantId: intentDocument.metadata?.tenantId,
      initiatedBy: options.initiatedBy ?? intentDocument.metadata?.authoredBy ?? "system",
      mode: options.mode ?? "standard",
      preview: options.preview === true,
      contextHash: context.contextHash,
      deterministicSessionId: options.deterministicSessionId,
    });

  const t1 = Date.now();
  const capabilityResolution = resolveCapabilities(intentDocument);
  stageLatency.capability_resolution = Date.now() - t1;

  const t2 = Date.now();
  const capabilityValidation = validateCapabilities(capabilityResolution, intentDocument);
  stageLatency.capability_validation = Date.now() - t2;

  if (!capabilityValidation.ok) {
    const completedSession = finalizeResolverSession(session, { status: "failed" });
    return createResolverResult({
      ok: false,
      status: "failed",
      session: completedSession,
      context,
      capabilityResolution,
      diagnostics: capabilityValidation.diagnostics,
      telemetry: createResolverTelemetry(completedSession, stageLatency),
    });
  }

  const t3 = Date.now();
  const compatibility = checkCapabilityCompatibility(capabilityResolution, intentDocument);
  stageLatency.capability_compatibility = Date.now() - t3;

  if (!compatibility.ok) {
    const completedSession = finalizeResolverSession(session, { status: "failed" });
    return createResolverResult({
      ok: false,
      status: "failed",
      session: completedSession,
      context,
      capabilityResolution,
      diagnostics: compatibility.diagnostics,
      telemetry: createResolverTelemetry(completedSession, stageLatency),
    });
  }

  const t4 = Date.now();
  const derivationPlan = planDerivations(intentDocument, capabilityResolution);
  stageLatency.derivation_planning = Date.now() - t4;

  const derivations = [];
  const diagnostics = [];
  let formulaDocument = null;
  let pipeline = null;
  let derivationDocument = null;
  let metadata = null;
  let businessComputedField = null;
  let businessComputedDocument = null;
  let businessWorkflow = null;
  let businessWorkflowDocument = null;
  let businessExplainability = null;
  let businessPreview = null;
  let runtimeProjection = null;
  let workflowConfigDocument = null;
  let workflowValidation = null;

  const t5 = Date.now();
  for (const entry of derivationPlan.executable) {
    if (entry.derivationKind === "compute.computed_field") {
      const executed = executeComputedFieldDerivation(entry, intentDocument, session, context);
      derivations.push(executed.derivationDocument);
      businessComputedField = executed.businessComputedField;
      businessComputedDocument = executed.businessComputedDocument;
      formulaDocument = executed.formulaDocument;
      pipeline = executed.pipeline;
      derivationDocument = executed.derivationDocument;
      metadata = executed.metadata;
      businessExplainability = executed.explainability;
      businessPreview = executed.preview;
      runtimeProjection = executed.runtimeProjection;
      for (const d of executed.diagnostics ?? []) {
        if (d.severity === "blocking") diagnostics.push(createDiagnostic(d.code, d.message, d.severity));
      }
      if (!executed.pipeline.validation?.ok) {
        diagnostics.push(
          createDiagnostic(
            "DERIVATION_FAILED",
            "Business Computed Field projection validation failed.",
            "blocking"
          )
        );
      }
    }
    if (entry.derivationKind === "workflow.approval") {
      const executed = executeWorkflowDerivation(entry, intentDocument, session, context);
      derivations.push(executed.derivationDocument);
      businessWorkflow = executed.businessWorkflow;
      businessWorkflowDocument = executed.businessWorkflowDocument;
      workflowConfigDocument = executed.workflowConfigDocument;
      workflowValidation = executed.validation;
      derivationDocument = executed.derivationDocument;
      metadata = executed.metadata;
      businessExplainability = executed.explainability;
      businessPreview = executed.preview;
      runtimeProjection = executed.runtimeProjection;
      for (const d of executed.diagnostics ?? []) {
        if (d.severity === "blocking") diagnostics.push(createDiagnostic(d.code, d.message, d.severity));
      }
      if (!executed.validation?.ok) {
        diagnostics.push(
          createDiagnostic("DERIVATION_FAILED", "Business Workflow validation failed.", "blocking")
        );
      }
    }
  }
  stageLatency.derivation_execution = Date.now() - t5;
  stageLatency.projection = stageLatency.derivation_execution;
  stageLatency.validation = 0;

  const computationOk = pipeline ? pipeline.validation?.ok : true;
  const workflowOk = workflowValidation ? workflowValidation.ok : true;
  const ok = diagnostics.every((d) => d.severity !== "blocking") && computationOk && workflowOk;
  const completedSession = finalizeResolverSession(session, {
    status: ok ? "completed" : "failed",
  });

  stageLatency.derivationCount = derivations.length;

  const explainability = buildExplainabilityReport(
    intentDocument,
    completedSession,
    derivationPlan.executable,
    metadata
  );

  const resolverDocument = Object.freeze({
    schemaVersion: RESOLVER_DOCUMENT_VERSION,
    resolverSessionId: completedSession.resolverSessionId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    resolverVersion: INTENT_RESOLVER_VERSION,
    status: ok ? "completed" : "failed",
    capabilityResolution,
    derivationPlan: derivationPlan.executable,
    extensionPoints: derivationPlan.extensionPoints,
    outputs: Object.freeze(derivations),
    diagnostics: Object.freeze(diagnostics),
    explainability,
    contextHash: context.contextHash,
    createdAt: completedSession.startedAt,
    completedAt: completedSession.completedAt,
  });

  return createResolverResult({
    ok,
    status: ok ? "completed" : "failed",
    schemaVersion: RESOLVER_RESULT_VERSION,
    session: completedSession,
    context,
    resolverDocument,
    intentDocument,
    capabilityResolution,
    capabilityValidation,
    compatibility,
    derivationPlan,
    derivationDocument,
    derivations,
    metadata,
    businessComputedField,
    businessComputedDocument,
    businessWorkflow,
    businessWorkflowDocument,
    businessExplainability,
    businessPreview,
    runtimeProjection,
    formulaDocument,
    workflowConfigDocument,
    computationDocument: pipeline?.computationDocument ?? null,
    expressionAst: pipeline?.expressionAst ?? null,
    validation: pipeline?.validation ?? null,
    compiled: pipeline?.compiled ?? null,
    preview: pipeline?.preview ?? null,
    runtimePreview: pipeline?.preview ?? null,
    explainability,
    diagnostics: Object.freeze(diagnostics),
    telemetry: createResolverTelemetry(completedSession, stageLatency),
    extensionPoints: derivationPlan.extensionPoints,
    resolverVersion: INTENT_RESOLVER_VERSION,
    compatibilityVersion: compatibility.compatibilityVersion,
    generationReason: "intent_resolution",
  });
}

export default runResolverPipeline;
