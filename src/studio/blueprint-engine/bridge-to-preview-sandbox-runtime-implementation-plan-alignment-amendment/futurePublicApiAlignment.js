import { deepFreeze } from './deepFreeze.js';
/** Keeps the future factory signature; declares v2-only input. Metadata only. */
export const FUTURE_PUBLIC_API_ALIGNMENT = deepFreeze({
  kind: 'future-public-api-alignment',
  factorySignature: 'createBridgeToPreviewSandboxRuntime(config) -> { execute(envelope) }',
  executeInputKind: 'bridge_decision_core_envelope',
  v1InputRejected: true,
  v2InputRequired: true,
  publicApiImplemented: false,
  executeImplemented: false,
  runtimeFactoryImplemented: false,
});
export default FUTURE_PUBLIC_API_ALIGNMENT;
