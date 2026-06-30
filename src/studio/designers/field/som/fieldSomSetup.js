/**
 * Field Studio — Studio Object Model wiring (Program 2.3)
 */
import {
  createStudioObjectModel,
  createPropertyEngine,
  createBindingEngine,
  createBehaviorEngine,
  createObjectIdentitySystem,
  createPackageModel,
} from "@/studio/som/index.js";
import { registerFieldPropertySchemas } from "./fieldPropertySchemas.js";
import { registerFieldBindingKinds } from "./fieldBindingKinds.js";
import { registerFieldBehaviorPolicies } from "./fieldBehaviorPolicies.js";
import { fieldDocumentToSomObjects } from "./fieldSomAdapters.js";

let fieldObjectModel = null;
let fieldPropertyEngine = null;
let fieldBindingEngine = null;
let fieldBehaviorEngine = null;
let fieldIdentitySystem = null;

export function getFieldObjectModel() {
  if (!fieldObjectModel) {
    fieldObjectModel = createStudioObjectModel();
    ["field", "field-group", "artifact"].forEach((kind) => {
      fieldObjectModel.registerObjectSchema({ kind });
    });
  }
  return fieldObjectModel;
}

export function getFieldPropertyEngine() {
  if (!fieldPropertyEngine) {
    fieldPropertyEngine = createPropertyEngine();
    registerFieldPropertySchemas(fieldPropertyEngine);
  }
  return fieldPropertyEngine;
}

export function getFieldBindingEngine() {
  if (!fieldBindingEngine) {
    fieldBindingEngine = createBindingEngine();
    registerFieldBindingKinds(fieldBindingEngine);
  }
  return fieldBindingEngine;
}

export function getFieldBehaviorEngine() {
  if (!fieldBehaviorEngine) {
    fieldBehaviorEngine = createBehaviorEngine();
    registerFieldBehaviorPolicies(fieldBehaviorEngine);
  }
  return fieldBehaviorEngine;
}

export function getFieldIdentitySystem() {
  if (!fieldIdentitySystem) {
    fieldIdentitySystem = createObjectIdentitySystem();
  }
  return fieldIdentitySystem;
}

export function applyFieldProperty(field, propertyId, value) {
  return getFieldPropertyEngine().setValue(field, propertyId, value);
}

export function generateFieldNodeId(moduleId, semanticKey, unique = false) {
  const identity = getFieldIdentitySystem();
  return unique
    ? identity.generateUniqueId({ namespace: moduleId, kind: "field", semanticKey })
    : identity.generateId({ namespace: moduleId, kind: "field", semanticKey });
}

export function mapFieldDocumentToSom(document) {
  return getFieldObjectModel().mapDocument(document, () => fieldDocumentToSomObjects(document));
}

export function createFieldPackageFromProject({ project, moduleId, fieldDocument }) {
  const packageModel = createPackageModel();
  packageModel.fromProject({
    project,
    moduleId,
    artifacts: [
      {
        artifactId: fieldDocument.documentId,
        artifactType: "field",
        designerId: "field",
        document: fieldDocument,
      },
    ],
  });
  return Object.freeze({ packageModel, snapshot: packageModel.exportSnapshot() });
}

export default {
  getFieldObjectModel,
  getFieldPropertyEngine,
  applyFieldProperty,
  generateFieldNodeId,
  mapFieldDocumentToSom,
  createFieldPackageFromProject,
};
