import {
  BUSINESS_WORKFLOW_REGENERATION_POLICIES,
  BUSINESS_WORKFLOW_SYNCHRONIZATION_POLICIES,
  BUSINESS_WORKFLOW_ROLLBACK_POLICIES,
} from "../contracts/businessWorkflowContracts.js";

export function createBusinessWorkflowPolicies(partial = {}) {
  return Object.freeze({
    regeneration: partial.regeneration ?? "manual",
    regenerationOptions: BUSINESS_WORKFLOW_REGENERATION_POLICIES,
    synchronization: partial.synchronization ?? "sync_on_intent_change",
    synchronizationOptions: BUSINESS_WORKFLOW_SYNCHRONIZATION_POLICIES,
    rollback: partial.rollback ?? "preview_only",
    rollbackOptions: BUSINESS_WORKFLOW_ROLLBACK_POLICIES,
    humanApprovalRequired: partial.humanApprovalRequired !== false,
    reusableAcrossCapabilities: partial.reusableAcrossCapabilities !== false,
  });
}

export default createBusinessWorkflowPolicies;
