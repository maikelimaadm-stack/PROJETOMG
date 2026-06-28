/**
 * Pipeline de avaliação de fórmulas MAK — metadata-driven.
 */
import {
  evaluateMakFormulaExpression,
  extractMakFormulaDependencies,
  normalizeMakFormulaDefinition,
} from "./makFormulaBuiltinFunctions.js";

const stableEqual = (left, right) => {
  if (left === right) return true;
  if (left == null && right == null) return true;
  return String(left ?? "") === String(right ?? "");
};

export function buildMakFormulaDependencyGraph(fieldDefinitions = []) {
  const graph = new Map();

  fieldDefinitions.forEach((field) => {
    const name = field.name ?? field.id;
    if (!name) return;
    const formula = field.formula ?? field.expression ?? field.compute ?? field.calculate;
    if (!formula && field.type !== "calculado") return;

    graph.set(name, {
      field,
      name,
      formula: normalizeMakFormulaDefinition(formula ?? {}),
      dependsOn: extractMakFormulaDependencies(formula ?? {}, name),
      persist: field.formula?.persist ?? field.persist ?? false,
      readOnly: field.readOnly ?? field.type === "calculado",
    });
  });

  return graph;
}

export function sortMakFormulaEvaluationOrder(graph) {
  const order = [];
  const visiting = new Set();
  const visited = new Set();

  const visit = (name) => {
    if (visited.has(name)) return;
    if (visiting.has(name)) return;
    visiting.add(name);
    const node = graph.get(name);
    (node?.dependsOn || []).forEach((dep) => {
      if (graph.has(dep)) visit(dep);
    });
    visiting.delete(name);
    visited.add(name);
    order.push(name);
  };

  [...graph.keys()].forEach(visit);
  return order;
}

export function runMakFormulaEvaluation({
  formData = {},
  fieldDefinitions = [],
  customFields = [],
  customFieldCalculator = null,
} = {}) {
  const scope = {
    ...formData,
    ...(formData.campos_personalizados || {}),
  };
  const graph = buildMakFormulaDependencyGraph(fieldDefinitions);
  const order = sortMakFormulaEvaluationOrder(graph);
  const patch = {};
  const changedFields = [];

  order.forEach((fieldName) => {
    const node = graph.get(fieldName);
    if (!node) return;

    let nextValue = null;
    const expression = node.formula?.expression ?? node.formula;
    if (expression != null && expression !== "") {
      nextValue = evaluateMakFormulaExpression(expression, scope);
    } else if (typeof customFieldCalculator === "function" && node.field?.type === "calculado") {
      nextValue = customFieldCalculator(scope, node.field);
    }

    if (nextValue == null && node.field?.defaultValue != null) {
      nextValue = node.field.defaultValue;
    }

    const currentValue = scope[fieldName];
    if (!stableEqual(currentValue, nextValue)) {
      patch[fieldName] = nextValue;
      scope[fieldName] = nextValue;
      changedFields.push(fieldName);
    }
  });

  if (Array.isArray(customFields) && typeof customFieldCalculator === "function") {
    customFields
      .filter((campo) => campo.tipo === "calculado")
      .forEach((campo) => {
        const key = campo.field_name || campo.name;
        const nextValue = customFieldCalculator(scope, campo);
        const currentValue = scope.campos_personalizados?.[key];
        if (!stableEqual(currentValue, nextValue)) {
          patch[`campos_personalizados.${key}`] = nextValue;
          scope.campos_personalizados = {
            ...(scope.campos_personalizados || {}),
            [key]: nextValue,
          };
          changedFields.push(`campos_personalizados.${key}`);
        }
      });
  }

  return {
    values: patch,
    changedFields,
    changed: changedFields.length > 0,
    scope,
  };
}

export default runMakFormulaEvaluation;
