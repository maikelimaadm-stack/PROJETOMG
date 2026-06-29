/** Official Studio module/designer registry for production shell — Program 2.1B */

export const STUDIO_MODULES = Object.freeze([
  { moduleId: "empresas", label: "Empresas" },
]);

export const STUDIO_DESIGNERS = Object.freeze([
  { designerId: "layout", label: "Layout Studio", moduleId: "empresas" },
]);

export function resolveDesignerLabel(designerId) {
  return STUDIO_DESIGNERS.find((d) => d.designerId === designerId)?.label ?? designerId;
}

export function resolveModuleLabel(moduleId) {
  return STUDIO_MODULES.find((m) => m.moduleId === moduleId)?.label ?? moduleId;
}

export function listDesignersForModule(moduleId) {
  return STUDIO_DESIGNERS.filter((d) => d.moduleId === moduleId);
}

export default { STUDIO_MODULES, STUDIO_DESIGNERS };
