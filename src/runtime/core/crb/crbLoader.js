import { BundleReader } from './BundleReader.js';
import { BundleValidator } from './BundleValidator.js';
import { BundleIntegrity } from './BundleIntegrity.js';
import { BundleMetadata } from './BundleMetadata.js';
import { BundleLifecycle } from './BundleLifecycle.js';
import { hydrateRegistries } from './hydrateRegistries.js';
import { CrbError } from './errors.js';

/**
 * CRB Loader (M06) — verify + hydrate; no render/execution.
 */
export class CRBLoader {
  /**
   * @param {'dev'|'staging'|'prod'} [environment]
   * @param {string} [signingKey]
   */
  constructor(environment = 'dev', signingKey) {
    this._environment = environment;
    this._signingKey = signingKey;
    /** @type {BundleState} */
    this._state = BundleLifecycle.PENDING;
    /** @type {number} */
    this.validationsExecuted = 0;
  }

  /**
   * @param {string} bundleId
   * @param {import('../loader/loaderManager.js').LoaderManager} loader
   * @param {import('../loader/LoaderContext.js').LoaderContext} ctx
   */
  async fetch(bundleId, loader, ctx) {
    const payload = await loader.load({ bundleId, tenantId: ctx.runtimeContext.tenantId }, ctx);
    return BundleReader.read(payload);
  }

  /**
   * @param {import('../../types/crb.js').CrbPayload} payload
   * @param {import('../../types/crb.js').EnvironmentPin} [pin]
   */
  verify(payload, pin) {
    this.validationsExecuted = 0;

    const structural = BundleValidator.validate(payload, pin, this._environment);
    this.validationsExecuted += structural.validationsExecuted;

    const integrity = BundleIntegrity.verify(payload, this._environment, this._signingKey);
    this.validationsExecuted += integrity.validationsExecuted;

    const errors = [...structural.errors, ...integrity.errors];
    if (errors.length > 0) {
      this._state = BundleLifecycle.FAILED;
      return { valid: false, errors, validationsExecuted: this.validationsExecuted };
    }

    this._state = BundleLifecycle.VERIFIED;
    return {
      valid: true,
      errors: [],
      validationsExecuted: this.validationsExecuted,
      metadata: BundleMetadata.extract(payload),
    };
  }

  /**
   * @param {import('../../types/crb.js').CrbPayload} payload
   * @param {import('../registry/registryManager.js').RegistryManager} registry
   */
  hydrate(payload, registry) {
    if (this._state !== BundleLifecycle.VERIFIED) {
      throw new CrbError('MAK-L3-RUNTIME-002', 'CRB must be verified before hydrate');
    }

    try {
      const result = hydrateRegistries(payload, registry);
      this._state = BundleLifecycle.HYDRATED;
      return result;
    } catch (err) {
      this._state = BundleLifecycle.ROLLED_BACK;
      throw err;
    }
  }

  get state() {
    return this._state;
  }
}

/** @typedef {import('./BundleLifecycle.js').BundleState} BundleState */

/** @returns {CRBLoader} */
export function createCrbLoader(environment, signingKey) {
  return new CRBLoader(environment, signingKey);
}

export { CrbError };
