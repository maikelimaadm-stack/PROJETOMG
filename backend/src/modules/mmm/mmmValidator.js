import { FORBIDDEN_PAYLOAD_KEYS } from "./mmmConstants.js";

const formatAjvErrors = (errors = []) =>
  errors.map((err) => ({
    path: err.instancePath || err.schemaPath || "/",
    rule: err.keyword || "schema",
    message: err.message || "Validation failed",
  }));

export class MmmValidationError extends Error {
  constructor(code, message, violations = []) {
    super(message);
    this.name = "MmmValidationError";
    this.code = code;
    this.statusCode = 422;
    this.violations = violations;
  }
}

const findForbiddenKeys = (value, path = "payload") => {
  const violations = [];
  if (value == null || typeof value !== "object") return violations;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      violations.push(...findForbiddenKeys(item, `${path}[${index}]`));
    });
    return violations;
  }
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_PAYLOAD_KEYS.includes(key)) {
      violations.push({
        path: `${path}.${key}`,
        rule: "FORBIDDEN_FIELD",
        message: `Forbidden key '${key}'`,
      });
    }
    violations.push(...findForbiddenKeys(value[key], `${path}.${key}`));
  }
  return violations;
};

const assertSemanticRules = (objectType, payload) => {
  const violations = [];
  if (objectType === "workflow" && !payload?.initialStepRef) {
    violations.push({
      path: "payload.initialStepRef",
      rule: "WORKFLOW_NO_INITIAL",
      message: "workflow requires initialStepRef (S-02)",
    });
  }
  if (objectType === "ai_candidate" && payload?.humanReviewRequired !== true) {
    violations.push({
      path: "payload.humanReviewRequired",
      rule: "AI_REVIEW_REQUIRED",
      message: "ai_candidate requires humanReviewRequired=true (S-04)",
    });
  }
  return violations;
};

export const validateMmmEnvelope = async ({
  envelope,
  registry,
  mode = "create",
  expectedRevision,
  tenantId,
  allowPublishTransition = false,
}) => {
  const violations = [];

  if (!envelope || typeof envelope !== "object") {
    throw new MmmValidationError("ENVELOPE_INVALID", "Envelope must be a JSON object");
  }

  if (envelope.envelopeVersion !== "mmm-envelope-v1") {
    violations.push({
      path: "envelopeVersion",
      rule: "ENVELOPE_INVALID",
      message: "envelopeVersion must be mmm-envelope-v1",
    });
  }

  if (registry.envelopeValidator && !registry.envelopeValidator(envelope)) {
    violations.push(...formatAjvErrors(registry.envelopeValidator.errors));
  }

  if (envelope.objectType === "record") {
    throw new MmmValidationError(
      "UNKNOWN_OBJECT_TYPE",
      "objectType 'record' is taxonomy-only and cannot be persisted (R-14)"
    );
  }

  if (!registry.objectTypeSet.has(envelope.objectType)) {
    throw new MmmValidationError(
      "UNKNOWN_OBJECT_TYPE",
      `Unknown objectType '${envelope.objectType}'`
    );
  }

  if (tenantId && envelope.tenantId !== tenantId) {
    throw new MmmValidationError("TENANT_FORBIDDEN", "tenantId does not match authenticated tenant");
  }

  if (!Array.isArray(envelope.labels) || envelope.labels.length < 1) {
    violations.push({
      path: "labels",
      rule: "LABELS_REQUIRED",
      message: "At least one label set is required",
    });
  }

  if (!envelope.lineage?.source) {
    violations.push({
      path: "lineage.source",
      rule: "LINEAGE_REQUIRED",
      message: "lineage.source is mandatory",
    });
  }

  if (mode === "update") {
    if (expectedRevision != null && envelope.revision !== expectedRevision) {
      throw new MmmValidationError(
        "REVISION_CONFLICT",
        `Revision conflict: expected ${expectedRevision}, got ${envelope.revision ?? "none"}`
      );
    }
    if (!allowPublishTransition && (envelope.status === "published" || envelope.status === "active")) {
      violations.push({
        path: "status",
        rule: "DIRECT_PUBLISH_FORBIDDEN",
        message: "Cannot write published/active without publish operation",
      });
    }
  } else if (mode === "create") {
    if (envelope.status && envelope.status !== "draft") {
      violations.push({
        path: "status",
        rule: "INVALID_TRANSITION",
        message: "New objects must start in draft status",
      });
    }
  }

  violations.push(...findForbiddenKeys(envelope.payload));
  violations.push(...assertSemanticRules(envelope.objectType, envelope.payload));

  const payloadValidator = registry.payloadValidators.get(envelope.objectType);
  if (payloadValidator && !payloadValidator(envelope.payload)) {
    violations.push(...formatAjvErrors(payloadValidator.errors));
  }

  if (violations.length > 0) {
    throw new MmmValidationError("PAYLOAD_INVALID", "MMM validation failed", violations);
  }

  return true;
};
