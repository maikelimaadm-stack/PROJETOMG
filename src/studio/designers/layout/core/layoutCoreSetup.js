/**
 * Layout Studio — Studio Core Engine wiring (Program 2.2.5)
 * All engines consumed from @/studio/core — no local engine implementations.
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
  LAYOUT_DOCUMENT_VERSION,
  createEmptyLayoutDocument,
  validateLayoutDocument,
} from "../document/layoutDocumentContracts.js";
import { layoutDocumentToAstRoot } from "../document/documentToAst.js";
import { astRootToMdpPayloads } from "../ast/astToMdpPayloads.js";
import { LayoutCommandTypes } from "../commands/layoutCommandTypes.js";
import { applyLayoutCommand } from "../commands/layoutCommandHandlers.js";
import { registerLayoutValidationRules } from "../validation/layoutValidationRules.js";
import {
  createLayoutPackageFromProject,
  normalizeLayoutBindings,
  mapLayoutDocumentToSom,
} from "../som/layoutSomSetup.js";

let layoutDocumentEngine = null;
let layoutAstEngine = null;
let layoutValidationEngine = null;

export function getLayoutDocumentEngine() {
  if (!layoutDocumentEngine) {
    layoutDocumentEngine = createDocumentEngine({
      version: LAYOUT_DOCUMENT_VERSION,
      validate: validateLayoutDocument,
      freeze: (doc) =>
        Object.freeze({
          ...doc,
          pages: Object.freeze(doc.pages ?? []),
          bindings: Object.freeze(doc.bindings ?? []),
          rules: Object.freeze(doc.rules ?? []),
          styles: Object.freeze(doc.styles ?? {}),
          behaviors: Object.freeze(doc.behaviors ?? []),
          metadata: Object.freeze(doc.metadata ?? {}),
        }),
    });
  }
  return layoutDocumentEngine;
}

export function getLayoutAstEngine() {
  if (!layoutAstEngine) {
    layoutAstEngine = createAstEngine({ astVersion: "mak-layout-ast-v1" });
    layoutAstEngine.registerTransformer("layout", layoutDocumentToAstRoot);
    layoutAstEngine.registerCompiler("layout-mdp", (ast) => astRootToMdpPayloads(ast));
  }
  return layoutAstEngine;
}

export function getLayoutValidationEngine() {
  if (!layoutValidationEngine) {
    layoutValidationEngine = createValidationEngine();
    registerLayoutValidationRules(layoutValidationEngine);
  }
  return layoutValidationEngine;
}

export function createLayoutDocumentStore(initialDocument) {
  const engine = getLayoutDocumentEngine();
  return createDocumentStore(engine, initialDocument ?? createEmptyLayoutDocument());
}

export function createLayoutCommandBus(deps) {
  const engine = createCommandEngine({
    store: deps.store,
    history: deps.history,
    applyCommand: applyLayoutCommand,
    onAfterExecute: deps.onAfterExecute,
  });

  const bus = {
    addComponent(sectionId, component, label) {
      return engine.dispatch(
        engine.createCommand(LayoutCommandTypes.ADD_COMPONENT, { sectionId, component }, label, `add.${component.componentId}`)
      );
    },
    deleteComponent(componentId, label = "Remover componente") {
      return engine.dispatch(
        engine.createCommand(LayoutCommandTypes.DELETE_COMPONENT, { componentId }, label, `delete.${componentId}`)
      );
    },
    moveComponent(componentId, frame, label = "Mover componente") {
      return engine.dispatch(
        engine.createCommand(LayoutCommandTypes.MOVE_COMPONENT, { componentId, frame }, label, `move.${componentId}`)
      );
    },
    resizeComponent(componentId, frame, label = "Redimensionar componente") {
      return engine.dispatch(
        engine.createCommand(LayoutCommandTypes.RESIZE_COMPONENT, { componentId, frame }, label, `resize.${componentId}`)
      );
    },
    duplicateComponent(componentId, label = "Duplicar componente") {
      return engine.dispatch(
        engine.createCommand(LayoutCommandTypes.DUPLICATE_COMPONENT, { componentId }, label, `duplicate.${componentId}`)
      );
    },
    reorderComponent(componentId, toIndex, label = "Reordenar componente") {
      return engine.dispatch(
        engine.createCommand(LayoutCommandTypes.REORDER_COMPONENT, { componentId, toIndex }, label, `reorder.${componentId}`)
      );
    },
    updateProperty(componentId, propertyId, value, label = "Editar propriedade") {
      return engine.dispatch(
        engine.createCommand(
          LayoutCommandTypes.UPDATE_PROPERTY,
          { componentId, propertyId, value },
          label,
          `prop.${componentId}.${propertyId}`
        )
      );
    },
    updateBinding(bindings, componentId = null, label = "Editar binding") {
      return engine.dispatch(
        engine.createCommand(
          LayoutCommandTypes.UPDATE_BINDING,
          { bindings, componentId },
          label,
          `binding.${componentId ?? "document"}`
        )
      );
    },
    updateStyle(styles, componentId = null, label = "Editar estilo") {
      return engine.dispatch(
        engine.createCommand(
          LayoutCommandTypes.UPDATE_STYLE,
          { styles, componentId },
          label,
          `style.${componentId ?? "document"}`
        )
      );
    },
  };

  return Object.freeze(bus);
}

export function validateLayoutDocumentStructure(document) {
  return getLayoutValidationEngine().validate(document);
}

export function documentToAst(document) {
  return getLayoutAstEngine().parse(document, "layout");
}

export function documentToRegistryPayloads(document) {
  const ast = documentToAst(document);
  return getLayoutAstEngine().compile(ast, "layout-mdp");
}

export function createLayoutProject(moduleId, layoutDocument) {
  const projectModel = createProjectModel();
  const dependencyGraph = createDependencyGraphEngine();

  const artifactId = layoutDocument.documentId;
  projectModel.load(
    createStudioProject({
      moduleId,
      projectId: `project-${moduleId}`,
      activeDesignerId: "layout",
      activeArtifactId: artifactId,
      artifacts: [
        {
          artifactId,
          artifactType: "layout",
          designerId: "layout",
          document: layoutDocument,
        },
      ],
    })
  );

  dependencyGraph.addNode({ id: artifactId, type: "layout", label: layoutDocument.metadata?.label });
  normalizeLayoutBindings(layoutDocument.bindings ?? []).forEach((binding) => {
    if (binding.targetId) {
      dependencyGraph.addNode({ id: binding.targetId, type: binding.bindingKind ?? "reference" });
      dependencyGraph.addEdge({ from: artifactId, to: binding.targetId, kind: "binding" });
    }
  });

  const refactoringEngine = createRefactoringEngine({ projectModel, dependencyGraph });
  const project = projectModel.get();
  const { packageModel, snapshot: packageSnapshot } = createLayoutPackageFromProject({
    project,
    moduleId,
    layoutDocument,
  });
  const somObjects = mapLayoutDocumentToSom(layoutDocument);

  return Object.freeze({
    projectModel,
    dependencyGraph,
    refactoringEngine,
    packageModel,
    packageSnapshot,
    somObjects,
  });
}

export default {
  getLayoutDocumentEngine,
  getLayoutAstEngine,
  getLayoutValidationEngine,
  createLayoutDocumentStore,
  createLayoutCommandBus,
  validateLayoutDocumentStructure,
  documentToAst,
  documentToRegistryPayloads,
  createLayoutProject,
};
