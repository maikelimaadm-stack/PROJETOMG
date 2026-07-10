import { createGenericModuleShadowPilot } from '../generic/genericModuleShadowPilot.js';
import { createGenericModuleTableFormShadow } from '../generic/genericModuleTableFormShadow.js';
import { createCadcpsDescriptor } from './createSecondModuleDescriptor.js';

/** Per-module opt-in flag for the cadcps (second module) shadow. Off by default. */
export const CADCPS_SHADOW_FLAG = 'MAK_RUNTIME_V2_SHADOW_CADCPS';

/**
 * Builds the cadcps (second module) shadow pilot on top of the generic base —
 * proving the generic module runtime is not coupled to Empresas. Opt-in and
 * passive: off by default, no real data, no side effects.
 * @param {Object} [options]
 * @returns {import('../generic/genericModuleShadowPilot.js').GenericModuleShadowPilot}
 */
export function createCadcpsShadowPilot(options = {}) {
  return createGenericModuleShadowPilot({
    descriptor: createCadcpsDescriptor(),
    envFlag: CADCPS_SHADOW_FLAG,
    ...options,
  });
}

/**
 * Builds the cadcps (second module) table/form shadow on top of the generic base.
 * @param {Object} [options]
 * @returns {import('../generic/genericModuleTableFormShadow.js').GenericModuleTableFormShadow}
 */
export function createCadcpsTableFormShadow(options = {}) {
  return createGenericModuleTableFormShadow({
    descriptor: createCadcpsDescriptor(),
    envFlag: CADCPS_SHADOW_FLAG,
    ...options,
  });
}

/** Generic aliases — the "second module" pilot factories. */
export const createSecondModuleShadowPilot = createCadcpsShadowPilot;
export const createSecondModuleTableFormShadow = createCadcpsTableFormShadow;
