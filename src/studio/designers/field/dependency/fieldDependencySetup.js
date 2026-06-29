/**
 * Field Studio — Studio Dependency Engine consumer (Program 2.3.3)
 * First designer consumer; no local dependency graph or cycle detection.
 */
import { createDependencyEngine } from "@/studio/dependency/index.js";
import { extractVariableRefsFromAst } from "@/studio/expression/dependency/expressionVariableRefs.js";
import { collectActiveFields } from "../fieldPropertyFields.js";
import { getFieldExpressionEngine } from "../expression/fieldExpressionSetup.js";

let fieldDependencyEngine = null;

export function getFieldDependencyEngine() {
  if (!fieldDependencyEngine) {
    fieldDependencyEngine = createDependencyEngine({ domainId: "field-studio", cacheKey: "field-studio" });
  }
  return fieldDependencyEngine;
}

/** Build official dependency graph for a Field Document artifact. */
export function buildFieldDocumentDependencyGraph(fieldDocument) {
  const engine = getFieldDependencyEngine();
  const { graph } = engine;
  graph.clear();

  const artifactId = fieldDocument.documentId;
  graph.addNode({
    id: artifactId,
    kind: "field",
    label: fieldDocument.metadata?.label ?? artifactId,
    designerId: "field",
    metadata: {
      dependencyExplanation: "Field document artifact root.",
      lineage: [artifactId],
    },
  });

  const expressionEngine = getFieldExpressionEngine();
  const fields = collectActiveFields(fieldDocument);

  fields.forEach((field) => {
    graph.addNode({
      id: field.fieldNodeId,
      kind: "field",
      label: field.label ?? field.fieldName,
      designerId: "field",
      metadata: { lineage: [artifactId, field.fieldNodeId] },
    });
    graph.addEdge({ from: artifactId, to: field.fieldNodeId, kind: "contains" });

    if (field.businessTypeId) {
      const btId = `business-type:${field.businessTypeId}`;
      graph.addNode({
        id: btId,
        kind: "reference",
        label: field.businessTypeId,
        metadata: { dependencyExplanation: `Business type reference: ${field.businessTypeId}` },
      });
      graph.addEdge({ from: field.fieldNodeId, to: btId, kind: "business-type" });
    }

    if (field.smartTemplateId) {
      const tplId = `template:${field.smartTemplateId}`;
      graph.addNode({
        id: tplId,
        kind: "base_template",
        label: field.smartTemplateId,
        metadata: { dependencyExplanation: `Smart template: ${field.smartTemplateId}` },
      });
      graph.addEdge({ from: field.fieldNodeId, to: tplId, kind: "template" });
    }

    const source = field.expressionSource ?? field.presentation?.expressionDraft;
    if (source && typeof source === "string") {
      const exprNodeId = `expr:${field.fieldNodeId}`;
      try {
        const ast = expressionEngine.parse(source, {
          designerId: "field",
          metadata: { fieldNodeId: field.fieldNodeId, consumer: "field-studio" },
        });
        graph.addNode({
          id: exprNodeId,
          kind: "expression",
          label: field.fieldName,
          designerId: "field",
          metadata: { dependencyExplanation: `Expression on field '${field.fieldName}'.` },
        });
        graph.addEdge({ from: field.fieldNodeId, to: exprNodeId, kind: "expression" });

        extractVariableRefsFromAst(ast).forEach((varName) => {
          const targetField = fields.find((f) => f.fieldName === varName);
          if (targetField) {
            graph.addEdge({
              from: exprNodeId,
              to: targetField.fieldNodeId,
              kind: "expression-ref",
              metadata: { dependencyExplanation: `Expression references field '${varName}'.` },
            });
          } else {
            const refId = `var:${varName}`;
            graph.addNode({ id: refId, kind: "reference", label: varName });
            graph.addEdge({ from: exprNodeId, to: refId, kind: "expression-ref" });
          }
        });
      } catch {
        // Parse errors are reported by field validation rules.
      }
    }
  });

  return engine.snapshot();
}

export function analyzeFieldDocumentImpact(fieldDocument, fieldNodeId, changeType = "modify") {
  buildFieldDocumentDependencyGraph(fieldDocument);
  return getFieldDependencyEngine().analyzeImpact(fieldNodeId, changeType);
}

export default getFieldDependencyEngine;
