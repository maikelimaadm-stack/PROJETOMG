/** Derivation metadata contracts (D-063) — Program 3.7 */

export const DERIVATION_METADATA_VERSION = "mak-derivation-metadata-v1";

export const REGENERATION_POLICIES = Object.freeze(["auto", "manual", "blocked"]);

export const SYNCHRONIZATION_POLICIES = Object.freeze(["sync_on_intent_change", "manual", "blocked"]);

export const ROLLBACK_POLICIES = Object.freeze(["allowed", "preview_only", "blocked"]);

export default DERIVATION_METADATA_VERSION;
