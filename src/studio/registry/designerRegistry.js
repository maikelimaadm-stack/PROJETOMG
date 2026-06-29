import { validateStudioDesigner } from "../sdk/studioDesignerContract.js";

const designers = new Map();

/**
 * @param {import("../sdk/studioDesignerContract.js").StudioDesignerContract} designer
 */
export function registerStudioDesigner(designer) {
  const validation = validateStudioDesigner(designer);
  if (!validation.valid) {
    throw new Error(`registerStudioDesigner: ${validation.errors.join(" ")}`);
  }
  designers.set(designer.designerId, Object.freeze({ ...designer }));
  return designer.designerId;
}

/** @param {string} designerId */
export function getStudioDesigner(designerId) {
  return designers.get(designerId) ?? null;
}

export function listStudioDesigners() {
  return [...designers.values()];
}

export function hasStudioDesigner(designerId) {
  return designers.has(designerId);
}

export function clearStudioDesigners() {
  designers.clear();
}
