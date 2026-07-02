import { getMmmSchemaRegistry } from "../mmmSchemaRegistry.js";
import { validateMmmEnvelope, MmmValidationError } from "../mmmValidator.js";
import { rowToEnvelope } from "../mmmEnvelopeMapper.js";

const assertSemanticRules = (envelope) => {
  const violations = [];
  const { objectType, payload, dependencies } = envelope;

  if (objectType === "business_object") {
    const fieldRefs = dependencies?.use ?? dependencies?.possess ?? [];
    if (!fieldRefs.length) {
      violations.push({
        path: "dependencies",
        rule: "BO_REQUIRES_FIELD",
        message: "business_object requires at least one field reference (S-01)",
      });
    }
  }

  if (objectType === "module_dependency") {
    if (!payload?.sourceModuleRef || !payload?.targetModuleRef) {
      violations.push({
        path: "payload",
        rule: "MISSING_MODULE_DEPENDENCY",
        message: "module_dependency requires sourceModuleRef and targetModuleRef (S-03)",
      });
    }
  }

  return violations;
};

const assertSecurityRules = (envelope, tenantId) => {
  const violations = [];
  if (envelope.tenantId !== tenantId) {
    violations.push({
      path: "tenantId",
      rule: "TENANT_FORBIDDEN",
      message: "Cross-tenant object in publish scope",
    });
  }
  if (envelope.objectType === "permission" && !envelope.payload?.resourceRef) {
    violations.push({
      path: "payload.resourceRef",
      rule: "PERMISSION_ORPHAN",
      message: "permission requires resourceRef",
    });
  }
  return violations;
};

const assertDependencyGraph = (objects) => {
  const violations = [];
  const moduleIds = new Set(
    objects.map((row) => row.scope?.moduleId).filter(Boolean)
  );
  const moduleDeps = objects.filter((row) => row.object_type === "module_dependency");

  for (const row of objects) {
    const envelope = rowToEnvelope(row);
    const depModule = envelope.payload?.targetModuleRef;
    if (depModule && moduleIds.size > 1) {
      const hasModuleDep = moduleDeps.some(
        (dep) =>
          dep.payload?.sourceModuleRef === envelope.scope?.moduleId &&
          dep.payload?.targetModuleRef === depModule
      );
      if (!hasModuleDep) {
        violations.push({
          path: `objects.${envelope.objectId}.scope.moduleId`,
          rule: "MISSING_MODULE_DEPENDENCY",
          message: `Cross-module ref to ${depModule} without module_dependency (S-03)`,
        });
      }
    }
  }

  const graph = new Map();
  for (const row of objects) {
    const envelope = rowToEnvelope(row);
    const deps = envelope.dependencies?.depend ?? [];
    graph.set(envelope.objectId, deps);
  }
  const visiting = new Set();
  const visited = new Set();
  const walk = (nodeId, stack = []) => {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      violations.push({
        path: "dependencies",
        rule: "CYCLIC_DEPENDENCY",
        message: `Cycle detected: ${[...stack, nodeId].join(" → ")}`,
      });
      return;
    }
    visiting.add(nodeId);
    for (const next of graph.get(nodeId) ?? []) {
      if (graph.has(next)) walk(next, [...stack, nodeId]);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };
  for (const nodeId of graph.keys()) walk(nodeId);

  return violations;
};

export const validatePublishScope = async ({ objects, tenantId, brokenRefViolations = [] }) => {
  const registry = await getMmmSchemaRegistry();
  const violations = [...brokenRefViolations];

  for (const row of objects) {
    const envelope = rowToEnvelope(row);
    try {
      await validateMmmEnvelope({
        envelope,
        registry,
        mode: "update",
        tenantId,
        allowPublishTransition: true,
      });
    } catch (error) {
      if (error instanceof MmmValidationError) {
        violations.push(...(error.violations ?? [{ path: "/", rule: error.code, message: error.message }]));
      } else {
        violations.push({ path: "/", rule: error.code || "VALIDATION_ERROR", message: error.message });
      }
    }
    violations.push(...assertSemanticRules(envelope));
    violations.push(...assertSecurityRules(envelope, tenantId));
  }

  violations.push(...assertDependencyGraph(objects));

  if (violations.length) {
    const error = new MmmValidationError("PUBLISH_VALIDATION_FAILED", "Publish validation failed", violations);
    throw error;
  }

  return true;
};
