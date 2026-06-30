export {
  BUSINESS_INTENT_DOCUMENT_VERSION,
  INTENT_RESOLVER_VERSION,
  INTENT_RESOLVER_ENGINE_ID,
  RESOLVER_DOCUMENT_VERSION,
  RESOLVER_RESULT_VERSION,
  RESOLVER_CONTEXT_VERSION,
  DERIVATION_DOCUMENT_VERSION,
  DERIVATION_KIND_COMPUTED_FIELD,
  DERIVATION_KIND_FORMULA,
  ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
  EXTENSION_DERIVATION_KINDS,
  CAPABILITY_CALCULATION,
} from "./contracts/intentContracts.js";

export {
  createBusinessIntentDocument,
  validateBusinessIntentDocument,
} from "./document/intentDocument.js";

export {
  createBusinessLanguageInput,
  businessLanguageToIntent,
} from "./language/businessLanguageInput.js";

export {
  createIntentResolver,
  getIntentResolver,
  resolveIntentDocument,
  resolveFromBusinessLanguage,
} from "./resolver/createIntentResolver.js";

export { runResolverPipeline, RESOLVER_PIPELINE_STAGES } from "./resolver/resolverPipeline.js";

export { RESOLVER_EXTENSION_POINTS } from "./resolver/extensionPoints.js";

import { createIntentResolver } from "./resolver/createIntentResolver.js";

export default createIntentResolver;
