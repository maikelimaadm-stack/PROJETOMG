import { defineComponentManifest, validateComponentManifest } from "../contracts/componentManifestContract.js";
import { defineUniversalComponent, validateUniversalComponent } from "../contracts/universalComponentModel.js";

const manifests = new Map();
const universalComponents = new Map();

/**
 * @param {import("../contracts/componentManifestContract.js").ComponentManifest} manifest
 */
export function registerComponentManifest(manifest) {
  const frozen = defineComponentManifest(manifest);
  manifests.set(frozen.componentId, frozen);
  return frozen.componentId;
}

/** @param {string} componentId */
export function getComponentManifest(componentId) {
  return manifests.get(componentId) ?? null;
}

export function listComponentManifests() {
  return [...manifests.values()];
}

/**
 * @param {import("../contracts/universalComponentModel.js").UniversalComponent} model
 */
export function registerUniversalComponent(model) {
  const frozen = defineUniversalComponent(model);
  universalComponents.set(frozen.componentId, frozen);
  manifests.set(frozen.componentId, frozen.manifest);
  return frozen.componentId;
}

/** @param {string} componentId */
export function getUniversalComponent(componentId) {
  return universalComponents.get(componentId) ?? null;
}

export function listUniversalComponents() {
  return [...universalComponents.values()];
}

export function getComponentManifestCount() {
  return manifests.size;
}

export function validateManifestIntegrity(manifest) {
  return validateComponentManifest(manifest);
}

export function validateUniversalModelIntegrity(model) {
  return validateUniversalComponent(model);
}

export function clearComponentManifests() {
  manifests.clear();
  universalComponents.clear();
}
