/**
 * Field Studio — Studio Core Engine wiring (Program 2.3)
 */
import {
  createDocumentEngine,
  createDocumentStore,
  createAstEngine,
  createValidationEngine,
  createCommandEngine,
  createProjectModel,
  createDependencyGraphEngine,
  createRefactoringEngine,
  createStudioProject,
} from "@/studio/core/index.js";
import {
  FIELD_DOCUMENT_VERSION,
  createEmptyFieldDocument,
  validateFieldDocument,
} from "../document/fieldDocumentContracts.js";
import { fieldDocumentToAstRoot } from "../document/documentToAst.js";
import { astRootToMdpPayloads } from "../ast/astToMdpPayloads.js";
import { FieldCommandTypes } from "../commands/fieldCommandTypes.js";
import { applyFieldCommand } from "../commands/fieldCommandHandlers.js";
import { registerFieldValidationRules } from "../validation/fieldValidationRules.js";
import { createFieldPackageFromProject, mapFieldDocumentToSom } from "../som/fieldSomSetup.js";

let fieldDocumentEngine = null;
let fieldAstEngine = null;
let fieldValidationEngine = null;

export function getFieldDocumentEngine() {
  if (!fieldDocumentEngine) {
    fieldDocumentEngine = createDocumentEngine({
      version: FIELD_DOCUMENT_VERSION,
      validate: validateFieldDocument,
      freeze: (doc) =>
        Object.freeze({
          ...doc,
          groups: Object.freeze(
            (doc.groups ?? []).map((g) =>
              Object.freeze({
                ...g,
                fields: Object.freeze((g.fields ?? []).map((f) => Object.freeze({ ...f }))),
              })
            )
          ),
          metadata: Object.freeze(doc.metadata ?? {}),
        }),
    });
  }
  return fieldDocumentEngine;
}

export function getFieldAstEngine() {
  if (!fieldAstEngine) {
    fieldAstEngine = createAstEngine({ astVersion: "mak-field-ast-v1" });
    fieldAstEngine.registerTransformer("field", fieldDocumentToAstRoot);
    fieldAstEngine.registerCompiler("field-mdp", (ast) => astRootToMdpPayloads(ast));
  }
  return fieldAstEngine;
}

export function getFieldValidationEngine() {
  if (!fieldValidationEngine) {
    fieldValidationEngine = createValidationEngine();
    registerFieldValidationRules(fieldValidationEngine);
  }
  return fieldValidationEngine;
}

export function createFieldDocumentStore(initialDocument) {
  return createDocumentStore(getFieldDocumentEngine(), initialDocument ?? createEmptyFieldDocument());
}

export function createFieldCommandBus(deps) {
  const engine = createCommandEngine({
    store: deps.store,
    history: deps.history,
    applyCommand: applyFieldCommand,
    onAfterExecute: deps.onAfterExecute,
  });

  return Object.freeze({
    addField(fieldType, label, fieldName) {
      return engine.dispatch(
        engine.createCommand(FieldCommandTypes.ADD_FIELD, { fieldType, label, fieldName }, "Criar campo")
      );
    },
    deleteField(fieldNodeId, label = "Excluir campo") {
      return engine.dispatch(
        engine.createCommand(FieldCommandTypes.DELETE_FIELD, { fieldNodeId }, label, `delete.${fieldNodeId}`)
      );
    },
    reorderField(fieldNodeId, toIndex, label = "Reordenar campo") {
      return engine.dispatch(
        engine.createCommand(FieldCommandTypes.REORDER_FIELD, { fieldNodeId, toIndex }, label)
      );
    },
    updateProperty(fieldNodeId, propertyId, value, label = "Editar propriedade") {
      return engine.dispatch(
        engine.createCommand(
          FieldCommandTypes.UPDATE_PROPERTY,
          { fieldNodeId, propertyId, value },
          label,
          `prop.${fieldNodeId}.${propertyId}`
        )
      );
    },
  });
}

export function validateFieldDocumentStructure(document) {
  return getFieldValidationEngine().validate(document);
}

export function documentToAst(document) {
  return getFieldAstEngine().parse(document, "field");
}

export function documentToRegistryPayloads(document) {
  return getFieldAstEngine().compile(documentToAst(document), "field-mdp");
}

export function createFieldProject(moduleId, fieldDocument) {
  const projectModel = createProjectModel();
  const dependencyGraph = createDependencyGraphEngine();
  const artifactId = fieldDocument.documentId;

  projectModel.load(
    createStudioProject({
      moduleId,
      projectId: `project-${moduleId}`,
      activeDesignerId: "field",
      activeArtifactId: artifactId,
      artifacts: [
        {
          artifactId,
          artifactType: "field",
          designerId: "field",
          document: fieldDocument,
        },
      ],
    })
  );

  dependencyGraph.addNode({ id: artifactId, type: "field", label: fieldDocument.metadata?.label });
  const { packageModel, snapshot } = createFieldPackageFromProject({
    project: projectModel.get(),
    moduleId,
    fieldDocument,
  });
  const somObjects = mapFieldDocumentToSom(fieldDocument);
  const refactoringEngine = createRefactoringEngine({ projectModel, dependencyGraph });

  return Object.freeze({ projectModel, dependencyGraph, refactoringEngine, packageModel, packageSnapshot: snapshot, somObjects });
}

export default {
  createFieldDocumentStore,
  createFieldCommandBus,
  validateFieldDocumentStructure,
  documentToAst,
  documentToRegistryPayloads,
  createFieldProject,
};
