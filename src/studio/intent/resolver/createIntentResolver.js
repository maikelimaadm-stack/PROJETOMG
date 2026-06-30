import {
  INTENT_RESOLVER_VERSION,
  INTENT_RESOLVER_ENGINE_ID,
} from "../contracts/intentContracts.js";
import { createBusinessIntentDocument, validateBusinessIntentDocument } from "../document/intentDocument.js";
import {
  createBusinessLanguageInput,
  businessLanguageToIntent,
} from "../language/businessLanguageInput.js";
import { runResolverPipeline } from "./resolverPipeline.js";
import { diffResolverResults, prepareRollback, resolveIncremental } from "./regeneration.js";
import { RESOLVER_EXTENSION_POINTS } from "./extensionPoints.js";
import { getResolverComputationEngine } from "./projections/computationProjection.js";

/**
 * Business Intent Resolver — sole authorized resolution facade (D-064, Program 3.7).
 * Only entry point for Intent → derived assets.
 */
export function createIntentResolver(options = {}) {
  const engineOptions = options.computationEngineOptions ?? {};

  return Object.freeze({
    engineId: INTENT_RESOLVER_ENGINE_ID,
    resolverVersion: INTENT_RESOLVER_VERSION,

    /** Sole resolution entry — Intent Document → Resolver Result */
    resolveIntent(intentDocument, resolveOptions = {}) {
      return runResolverPipeline(intentDocument, {
        ...resolveOptions,
        initiatedBy: resolveOptions.initiatedBy ?? intentDocument.metadata?.authoredBy,
      });
    },

    /** End-to-end: Business Language → Intent → Business Computed Field → Formula → Computation → Preview */
    resolveFromBusinessLanguage(businessLanguageInput, resolveOptions = {}) {
      const intentDocument = businessLanguageToIntent(businessLanguageInput, resolveOptions);
      const result = runResolverPipeline(intentDocument, resolveOptions);
      return Object.freeze({
        ...result,
        businessLanguageInput,
        intentDocument,
      });
    },

    createBusinessIntentDocument,
    validateBusinessIntentDocument,
    createBusinessLanguageInput,
    businessLanguageToIntent,

    diffResults: diffResolverResults,
    prepareRollback,
    resolveIncremental,

    getComputationEngine: () => getResolverComputationEngine(engineOptions),

    extensionPoints: RESOLVER_EXTENSION_POINTS,
  });
}

let defaultResolver = null;

export function getIntentResolver() {
  if (!defaultResolver) {
    defaultResolver = createIntentResolver();
  }
  return defaultResolver;
}

/** Sole exported resolution function — use instead of ad-hoc derivation */
export function resolveIntentDocument(intentDocument, options = {}) {
  return getIntentResolver().resolveIntent(intentDocument, options);
}

export function resolveFromBusinessLanguage(input, options = {}) {
  return getIntentResolver().resolveFromBusinessLanguage(input, options);
}

export default createIntentResolver;
