import { RENDERER_PLATFORMS } from "../designSystemConstants.js";
import { validateComponentManifest } from "./componentManifestContract.js";

/**
 * Universal Component Model — platform-agnostic MAK component definition.
 * Components belong to MAK, not React.
 *
 * @typedef {object} UniversalComponent
 * @property {string} componentId
 * @property {string} platform — always "mak"
 * @property {import("./componentManifestContract.js").ComponentManifest} manifest
 * @property {Record<string, object|null>} renderers — keys from RENDERER_PLATFORMS
 */

/**
 * @param {UniversalComponent} model
 */
export function validateUniversalComponent(model) {
  const errors = [];
  if (!model?.componentId) errors.push("componentId is required.");
  if (model?.platform !== "mak") errors.push('platform must be "mak".');
  const manifestValidation = validateComponentManifest(model?.manifest);
  if (!manifestValidation.valid) errors.push(...manifestValidation.errors);
  if (!model?.renderers || typeof model.renderers !== "object") {
    errors.push("renderers object is required.");
  } else {
    const rendererKeys = Object.keys(model.renderers);
    if (rendererKeys.length < 1) errors.push("at least one renderer binding required.");
    rendererKeys.forEach((key) => {
      if (!RENDERER_PLATFORMS.includes(key)) {
        errors.push(`unknown renderer platform: ${key}`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

/**
 * @param {UniversalComponent} model
 */
export function defineUniversalComponent(model) {
  const validation = validateUniversalComponent(model);
  if (!validation.valid) {
    throw new Error(`defineUniversalComponent: ${validation.errors.join(" ")}`);
  }
  return Object.freeze({
    platform: "mak",
    ...model,
    renderers: Object.freeze({ ...model.renderers }),
  });
}

export default validateUniversalComponent;
