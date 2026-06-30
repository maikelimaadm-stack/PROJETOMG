/**
 * Layout Studio — Studio Object Model wiring (Program 2.2.6)
 * All SOM engines consumed from @/studio/som — no local object/property/binding/behavior models.
 */
import {
  createStudioObjectModel,
  createPropertyEngine,
  createBindingEngine,
  createBehaviorEngine,
  createObjectIdentitySystem,
  createPackageModel,
} from "@/studio/som/index.js";
import { registerLayoutPropertySchemas } from "./layoutPropertySchemas.js";
import { registerLayoutBindingKinds } from "./layoutBindingKinds.js";
import { registerLayoutBehaviorPolicies } from "./layoutBehaviorPolicies.js";
import {
  layoutDocumentToSomObjects,
  layoutArtifactToSomObject,
  layoutComponentToSomObject,
} from "./layoutSomAdapters.js";

let layoutObjectModel = null;
let layoutPropertyEngine = null;
let layoutBindingEngine = null;
let layoutBehaviorEngine = null;
let layoutIdentitySystem = null;

export function getLayoutObjectModel() {
  if (!layoutObjectModel) {
    layoutObjectModel = createStudioObjectModel();
    ["page", "section", "container", "component", "artifact"].forEach((kind) => {
      layoutObjectModel.registerObjectSchema({ kind });
    });
  }
  return layoutObjectModel;
}

export function getLayoutPropertyEngine() {
  if (!layoutPropertyEngine) {
    layoutPropertyEngine = createPropertyEngine();
    registerLayoutPropertySchemas(layoutPropertyEngine);
  }
  return layoutPropertyEngine;
}

export function getLayoutBindingEngine() {
  if (!layoutBindingEngine) {
    layoutBindingEngine = createBindingEngine();
    registerLayoutBindingKinds(layoutBindingEngine);
  }
  return layoutBindingEngine;
}

export function getLayoutBehaviorEngine() {
  if (!layoutBehaviorEngine) {
    layoutBehaviorEngine = createBehaviorEngine();
    registerLayoutBehaviorPolicies(layoutBehaviorEngine);
  }
  return layoutBehaviorEngine;
}

export function getLayoutIdentitySystem() {
  if (!layoutIdentitySystem) {
    layoutIdentitySystem = createObjectIdentitySystem();
  }
  return layoutIdentitySystem;
}

export function normalizeLayoutBindings(bindings) {
  return getLayoutBindingEngine().normalizeAll(bindings);
}

export function applyLayoutProperty(component, propertyId, value) {
  return getLayoutPropertyEngine().setValue(component, propertyId, value);
}

export function normalizeLayoutBehaviors(behaviors) {
  return getLayoutBehaviorEngine().normalizeAll(behaviors);
}

export function generateLayoutComponentId(moduleId, semanticKey, unique = false) {
  const identity = getLayoutIdentitySystem();
  return unique
    ? identity.generateUniqueId({ namespace: moduleId, kind: "component", semanticKey })
    : identity.generateId({ namespace: moduleId, kind: "component", semanticKey });
}

export function mapLayoutDocumentToSom(document) {
  const objectModel = getLayoutObjectModel();
  return objectModel.mapDocument(document, () => [
    layoutArtifactToSomObject(document),
    ...layoutDocumentToSomObjects(document),
  ]);
}

export function createLayoutPackageFromProject({ project, moduleId, layoutDocument }) {
  const packageModel = createPackageModel();
  packageModel.fromProject({
    project,
    moduleId,
    artifacts: [
      {
        artifactId: layoutDocument.documentId,
        artifactType: "layout",
        designerId: "layout",
        document: layoutDocument,
      },
    ],
  });
  return Object.freeze({ packageModel, snapshot: packageModel.exportSnapshot() });
}

export default {
  getLayoutObjectModel,
  getLayoutPropertyEngine,
  getLayoutBindingEngine,
  getLayoutBehaviorEngine,
  getLayoutIdentitySystem,
  normalizeLayoutBindings,
  applyLayoutProperty,
  normalizeLayoutBehaviors,
  generateLayoutComponentId,
  mapLayoutDocumentToSom,
  createLayoutPackageFromProject,
};
