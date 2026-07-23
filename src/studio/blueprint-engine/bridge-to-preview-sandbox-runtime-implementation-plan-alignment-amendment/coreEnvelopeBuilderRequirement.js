import { deepFreeze } from './deepFreeze.js';
/**
 * Declares the NEW pre-runtime blocker B-CORE-ENVELOPE-BUILDER: the v2 contract exists and the plan is aligned,
 * but no contract yet defines the fail-closed builder/extractor that PRODUCES the Core Envelope v2 from a real
 * bridge decision. Runtime cannot proceed until that contract is merged and audited. Declaration only.
 */
export const CORE_ENVELOPE_BUILDER_REQUIREMENT = deepFreeze({
  kind: 'core-envelope-builder-requirement',
  blockerId: 'B-CORE-ENVELOPE-BUILDER',
  reason: 'core envelope v2 contract exists and plan is aligned, but no builder/extractor contract exists yet to '
    + 'produce the Core Envelope v2 fail-closed from a real bridge decision',
  coreEnvelopeBuilderContractRequiredBeforeRuntime: true,
  coreEnvelopeBuilderContractExists: false,
  coreEnvelopeBuilderImplemented: false,
  bCoreEnvelopeBuilderOpen: true,
  blocksRuntime: true,
  nextRequiredContract: 'Bridge Decision Core Envelope Builder Contract',
  readyForRuntimeImplementation: false,
});
export default CORE_ENVELOPE_BUILDER_REQUIREMENT;
